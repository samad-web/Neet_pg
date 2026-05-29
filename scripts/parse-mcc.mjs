/* Offline experiment: parse MCC trajectory PDF text into allotment records. */

import fs from "node:fs";

const text = fs.readFileSync("./mcc-r3.txt", "utf8");
const dataStart = text.indexOf("Round 1 Round 2 Round 3");
const body = dataStart > 0 ? text.slice(dataStart) : text;
// Normalize PDF artifacts: hyphenated words wrapped across lines become
// "Self- Financed" / "RADIO- DIAGNOSIS" after whitespace collapse. Rejoin.
const flat = body.replace(/\s+/g, " ").replace(/([A-Za-z])- ([A-Za-z])/g, "$1-$2");

const QUOTAS = [
  "All India", "DNB Quota", "Deemed University",
  "Aligarh Muslim University", "Banaras Hindu University",
  "Delhi University", "IP University",
  "Jain Minority", "Muslim Minority",
  "NRI", "Self-Financed Merit Seat", "Armed Forces Medical",
];
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const QUOTAS_RE = QUOTAS.map(escape).join("|");

// Seat-type and candidate-category tokens.
const CAT_TOKEN = "Open|Reserve|General|OBC|SC|ST|EWS|BC|EW|GN";
const CAT_LOOKAHEAD = `(?=\\s+(?:${CAT_TOKEN}))`;

// Course token. Several shapes observed in MCC PDFs:
//   M.D. (NAME)             — common
//   M.D. (NAME)/ (NAME2)    — multi-paren with slash
//   M.D. IN NAME            — no parens
//   M.D. NAME               — no parens, no "IN"
//   (NBEMS) NAME            — NBEMS/DNB
//   M.S./M.Ch./MD/MS variants
// One paren block: "(NAME)" with optional leading degree label like "MS"/"M.S."/"MD".
const PAREN_BLOCK = "\\([^)]{2,200}\\)";
// Optional connector between paren blocks: "/" or "/MS " or ". " etc.
const CONNECTOR = "(?:\\s*[/.,]\\s*(?:MS|MD|M\\.S\\.|M\\.D\\.)?\\s*)";
const COURSE_RE =
  "(?:" +
    // M.D. (NAME)[/MS (NAME)]*
    "(?:M\\.D\\.|M\\.S\\.|M\\.Ch\\.|MD\\/MS)\\s*" + PAREN_BLOCK + "(?:" + CONNECTOR + PAREN_BLOCK + ")*" +
    // M.D. IN NAME
    "|(?:M\\.D\\.|M\\.S\\.)\\s+IN\\s+[A-Z][A-Z &.,/'-]{2,120}?" + CAT_LOOKAHEAD +
    // M.D. NAME (no IN)
    "|(?:M\\.D\\.|M\\.S\\.)\\s+[A-Z][A-Za-z &.,/'-]{2,120}?" + CAT_LOOKAHEAD +
    // (NBEMS) NAME / (NBEMS-DIPLOMA) NAME / similar bracketed prefixes
    "|\\(NBEMS(?:-DIPLOMA)?\\)\\s+[A-Z][A-Z &.,/()'-]{2,200}?" + CAT_LOOKAHEAD +
  ")";

const TAIL_RE = new RegExp(
  `(${QUOTAS_RE})\\s+` +                              // quota
  `(.+?)\\s+` +                                       // college (lazy)
  `(${COURSE_RE})\\s+` +                              // course
  `(${CAT_TOKEN})\\s+(${CAT_TOKEN})(\\s+PwD)?\\s+` +  // seatType + candidateCat
  `\\d+\\s+` +                                        // seat#
  `(Fresh Allotted\\s+in\\s+\\w+\\s+Round|Upgraded)`,
  "g"
);

// Chunk start: rank followed by the 2-char R1 quota code.
const R1_QUOTA = "(?:AI|AM|AF|BH|DU|AD|IP|JM|MM|NR|PS)";
const CHUNK_RE = new RegExp(`\\b(\\d{1,7})\\s+${R1_QUOTA}\\s+`, "g");

const chunks = [];
const matches = [...flat.matchAll(CHUNK_RE)];
for (let i = 0; i < matches.length; i++) {
  const start = matches[i].index;
  const end = (i + 1 < matches.length) ? matches[i + 1].index : flat.length;
  chunks.push({ rank: parseInt(matches[i][1], 10), text: flat.slice(start, end) });
}

console.log(`Found ${chunks.length} candidate chunks.`);

// Normalize MCC's category-pair into the predictor's canonical candidate category.
function canonicalCategory(seatType, candCat) {
  const c = candCat.toUpperCase();
  if (c === "GENERAL" || c === "GN") return "UR";
  if (c === "OBC" || c === "BC") return "OBC-NCL";
  if (c === "EWS" || c === "EW") return "EWS";
  if (c === "SC") return "SC";
  if (c === "ST") return "ST";
  return "UR";
}

function canonicalQuota(q) {
  if (q === "All India") return "AIQ";
  if (q === "DNB Quota") return "DNB";
  if (q === "Deemed University") return "Deemed";
  if (q === "Armed Forces Medical") return "AFMS";
  if (q === "NRI") return "NRI";
  if (q === "Self-Financed Merit Seat") return "Management";
  return q;
}

function cleanCollege(s) {
  // Strip trailing ", <state>, <pincode>" — keep the first segment, which is the institute name.
  // Many MCC entries are "X,X, State, pincode" with duplication.
  let out = s.trim();
  // Take up to the first comma-separated "duplicate" segment if it looks like a repeat.
  const parts = out.split(",").map(s => s.trim()).filter(Boolean);
  // De-dup adjacent duplicates.
  const dedup = [];
  for (const p of parts) {
    if (dedup.length === 0 || dedup[dedup.length - 1] !== p) dedup.push(p);
  }
  // Drop trailing tokens that look like state names or 6-digit pincodes.
  while (dedup.length > 1) {
    const last = dedup[dedup.length - 1];
    if (/^\d{6}$/.test(last) || /^[A-Z][A-Za-z ]{2,30}$/.test(last) && dedup.length > 2) {
      dedup.pop();
    } else break;
  }
  return dedup.slice(0, 3).join(", ").replace(/\s+/g, " ");
}

function cleanCourse(s) {
  return s.trim().replace(/\s+/g, " ");
}

const records = [];
let actionPresent = 0;
let unmatched = 0;
const unmatchedSamples = [];

for (const c of chunks) {
  if (!/(Fresh Allotted|Upgraded)/.test(c.text)) continue;
  actionPresent++;
  let last = null;
  TAIL_RE.lastIndex = 0;
  let m;
  while ((m = TAIL_RE.exec(c.text))) last = m;
  if (!last) {
    unmatched++;
    if (unmatchedSamples.length < 5) unmatchedSamples.push({ rank: c.rank, text: c.text.slice(0, 350) });
    continue;
  }
  records.push({
    rank: c.rank,
    year: 2025,
    round: "R3",
    college: cleanCollege(last[2]),
    course: cleanCourse(last[3]),
    quota: canonicalQuota(last[1]),
    category: canonicalCategory(last[4], last[5]),
    isPwBD: !!last[6],
    _action: last[7],
  });
}

console.log(`Action present: ${actionPresent}`);
console.log(`Parsed: ${records.length}`);
console.log(`Unmatched action chunks: ${unmatched}`);
console.log(`Yield: ${(records.length / actionPresent * 100).toFixed(1)}%`);

console.log("\n--- Sample records ---");
console.log(JSON.stringify(records.slice(0, 5), null, 2));

// Coverage histograms
const byQuota = {}, byCat = {}, byCourse = {};
for (const r of records) {
  byQuota[r.quota] = (byQuota[r.quota] || 0) + 1;
  byCat[r.category] = (byCat[r.category] || 0) + 1;
  byCourse[r.course] = (byCourse[r.course] || 0) + 1;
}
console.log("\n--- By quota ---");
console.log(byQuota);
console.log("--- By category ---");
console.log(byCat);
console.log(`--- Distinct courses: ${Object.keys(byCourse).length}, top 8:`);
console.log(Object.entries(byCourse).sort((a,b)=>b[1]-a[1]).slice(0,8));

console.log("\n--- Unmatched sample (5) ---");
for (const u of unmatchedSamples) {
  console.log("RANK", u.rank, "::", u.text);
  console.log("---");
}
