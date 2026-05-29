/* Bridge between MCC's free-text college names and our canonical master list.
   MCC names look like "Maulana Azad Medical College, Delhi (NCT)" or
   "Seth Gordhandas Sunderdas Medical College, MUMBAI" — same institution,
   different surface form.

   Scoring uses IDF-weighted token overlap: rare tokens like "vardhman" or
   "madras" carry far more signal than "medical", "college", "hospital" which
   appear in nearly every entry. This lets us match single-distinctive-token
   queries like "MADRAS MEDICAL COLLEGE" without admitting noisy matches like
   "Government Medical College" → arbitrary government college.
*/

import { COLLEGES } from "./colleges.js";

const STOPWORDS = new Set([
  "of", "the", "and", "for", "in", "at", "to", "&",
  "dr", "drs", "prof", "ltd", "new", "old",
]);

function tokenize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter(t => !STOPWORDS.has(t));
}

// Build per-college token sets.
const MASTER = COLLEGES.map(c => {
  const allText = [c.name, ...(c.aliases || []), c.city, c.state].join(" ");
  return {
    id: c.id,
    name: c.name,
    tokens: new Set(tokenize(allText)),
    nameTokens: new Set(tokenize(c.name)),
    aliasTokens: (c.aliases || []).map(a => new Set(tokenize(a))),
    city: c.city,
  };
});

// IDF: log(N / df). Tokens that appear in many master entries get low weight;
// rare tokens get high weight. We compute df against the union token bag.
const docFreq = new Map();
for (const m of MASTER) {
  for (const t of m.tokens) docFreq.set(t, (docFreq.get(t) || 0) + 1);
}
const N = MASTER.length;
function idf(t) {
  const df = docFreq.get(t) || 0;
  if (df === 0) return 0;       // unknown token: no contribution
  return Math.log(N / df);
}

// Precompute each master's "signature tokens": the top-3 highest-IDF tokens
// from its name. For a match to count, ALL of these must appear in the query.
// This rejects "JLN AMU" → "JLN Ajmer" type confusions: AMU's signature
// includes "jawaharlal" and "amu", neither of which exists in an Ajmer query.
// Top-2 (rather than top-3): a single appended co-location like
// "& Safdarjung Hospital" or "& KEM Hospital" shouldn't make the parent
// college unmatchable from queries that omit the appendix.
const SIG_K = 2;
const IDF_MIN_FOR_SIG = Math.log(N / Math.max(8, N * 0.07)); // ~top 7% rare tokens
for (const m of MASTER) {
  const ranked = [...m.nameTokens]
    .map(t => ({ t, w: idf(t) }))
    .sort((a, b) => b.w - a.w);
  // Keep the top-K rare tokens; if a master is short, take whatever it has.
  m.signature = ranked.slice(0, SIG_K).filter(x => x.w >= IDF_MIN_FOR_SIG).map(x => x.t);
}

const cache = new Map();

/**
 * @param {string} query - free-text college name (e.g. from MCC)
 * @param {number} [threshold=0.45]  - minimum normalized IDF score
 * @returns {{ id, name, score } | null}
 */
export function matchCollege(query, threshold = 0.72) {
  if (!query) return null;
  if (cache.has(query)) return cache.get(query);

  const qTokensArr = tokenize(query);
  if (qTokensArr.length === 0) { cache.set(query, null); return null; }
  const qTokens = new Set(qTokensArr);

  // Sum of IDF weights across query tokens — denominator for normalized score.
  let qIdfSum = 0;
  for (const t of qTokens) qIdfSum += idf(t);
  if (qIdfSum === 0) { cache.set(query, null); return null; }

  let best = null, bestScore = 0;
  for (const m of MASTER) {
    // Hard cut #1: at least one token in the overlap must be RARE — i.e. a
    // token that's distinctive of this college (low df). This catches the
    // "matched only on `medical` / `university`" false positives.
    let hasRareOverlap = false;
    for (const t of qTokens) {
      if (m.nameTokens.has(t) && idf(t) >= IDF_MIN_FOR_SIG) { hasRareOverlap = true; break; }
    }
    if (!hasRareOverlap) {
      // Allow an alias match to substitute for direct rare-overlap.
      let aliasCovers = false;
      for (const aliasSet of m.aliasTokens) {
        if (aliasSet.size === 0) continue;
        if ([...aliasSet].every(t => qTokens.has(t))) { aliasCovers = true; break; }
      }
      if (!aliasCovers) continue;
    }

    // Hard cut #2: signature-token gate. If the master has signature tokens
    // (top-K rarest from its name), require one of:
    //   (a) all signature tokens in query, OR
    //   (b) an alias fully in query, OR
    //   (c) at least one signature token + the city in query.
    if (m.signature && m.signature.length > 0) {
      const allSig = m.signature.every(t => qTokens.has(t));
      const someSig = m.signature.some(t => qTokens.has(t));
      let aliasCovers = false;
      for (const aliasSet of m.aliasTokens) {
        if (aliasSet.size === 0) continue;
        if ([...aliasSet].every(t => qTokens.has(t))) { aliasCovers = true; break; }
      }
      const cityTokens = m.city ? tokenize(m.city) : [];
      const cityInQuery = cityTokens.length > 0 && cityTokens.every(t => qTokens.has(t));

      if (!allSig && !aliasCovers && !(someSig && cityInQuery)) continue;
    }

    // Weighted overlap with the master name tokens.
    let overlapIdf = 0;
    for (const t of qTokens) if (m.nameTokens.has(t)) overlapIdf += idf(t);

    // Distinctive query tokens this master doesn't recognize anywhere (name,
    // aliases, city, or state) are evidence the query names a DIFFERENT
    // institution. Folding them into the denominator stops a short master name
    // ("Gandhi Medical College") from absorbing a longer, distinct one
    // ("Mahatma Gandhi Inst., Wardha" or "Indira Gandhi Govt., Nagpur") just
    // because it's a token-superset. Only RARE tokens count — common words like
    // "medical"/"institute" carry no institution-identity signal.
    let foreignIdf = 0;
    for (const t of qTokens) {
      if (!m.tokens.has(t) && idf(t) >= IDF_MIN_FOR_SIG) foreignIdf += idf(t);
    }

    let mNameIdfSum = 0;
    for (const t of m.nameTokens) mNameIdfSum += idf(t);
    const denom = Math.max(0.1, Math.min(qIdfSum, mNameIdfSum)) + foreignIdf;
    let score = overlapIdf / denom;

    // Alias bonus — strong signal when an alias's tokens all appear in query.
    for (const aliasSet of m.aliasTokens) {
      if (aliasSet.size > 0) {
        let allIn = true;
        for (const t of aliasSet) if (!qTokens.has(t)) { allIn = false; break; }
        if (allIn) { score += 0.3; break; }
      }
    }
    // City bonus — when the query mentions the city.
    if (m.city) {
      const cityTokens = tokenize(m.city);
      if (cityTokens.length > 0 && cityTokens.every(t => qTokens.has(t))) score += 0.15;
    }

    if (score > bestScore) { bestScore = score; best = m; }
  }

  const result = (best && bestScore >= threshold)
    ? { id: best.id, name: best.name, score: bestScore }
    : null;
  cache.set(query, result);
  return result;
}

export function canonicalCollegeName(query) {
  const m = matchCollege(query);
  return m ? m.name : query;
}
