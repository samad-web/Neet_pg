import { canonicalCollegeName, matchCollege } from "./src/lib/collegeMatch.js";

const { records } = await (await fetch("http://localhost:8787/api/records")).json();

// ---- Overall match rate ----
let matched = 0;
const canonBucket = new Map(); // canonical -> Set(raw forms)
for (const r of records) {
  const c = canonicalCollegeName(r.college);
  if (c !== r.college) matched++;
  if (!canonBucket.has(c)) canonBucket.set(c, new Set());
  canonBucket.get(c).add(r.college);
}
console.log("=== Match rate ===");
console.log(`  rows mapped to master: ${matched} (${(matched/records.length*100).toFixed(1)}%)`);

// ---- Gandhi bucket contamination ----
const gandhiKeys = [...canonBucket.keys()].filter(k => /gandhi medical college/i.test(k));
console.log("\n=== 'Gandhi Medical College' buckets — distinct raw forms feeding each ===");
for (const k of gandhiKeys) {
  const forms = canonBucket.get(k);
  console.log(`  "${k}"  <- ${forms.size} raw forms`);
  // show a few raw forms to eyeball contamination
  [...forms].slice(0, 6).forEach(f => console.log(`        · ${f.slice(0, 70)}`));
}

// ---- Panel: known-bad must reject, known-good must match ----
const KNOWN_BAD = [
  "Mahatma Gandhi Institute of Medical Sciences, Wardha",
  "Rajiv Gandhi Institute of Medical Sciences, Adilabad",
  "Baby Memorial Hospital, Kozhikode",
  "Indira Gandhi Government Medical College, Nagpur",
];
const KNOWN_GOOD = [
  "Gandhi Medical College, Bhopal",
  "Maulana Azad Medical College, Delhi (NCT)",
  "Sawai Man Singh Medical College, JAIPUR",
  "All India Institute of Medical Sciences, New Delhi",
  "Vardhman Mahavir Medical College, New Delhi",
  "Lady Hardinge Medical College, New Delhi",
];
console.log("\n=== Known-BAD (should NOT match a wrong master) ===");
for (const q of KNOWN_BAD) {
  const m = matchCollege(q);
  console.log(`  ${m ? "STILL MATCHES -> " + m.name + " (" + m.score.toFixed(2) + ")" : "rejected (raw kept)"}  <= ${q.slice(0,45)}`);
}
console.log("\n=== Known-GOOD (should still match) ===");
for (const q of KNOWN_GOOD) {
  const m = matchCollege(q);
  console.log(`  ${m ? "matched -> " + m.name + " (" + m.score.toFixed(2) + ")" : "REJECTED (lost!)"}  <= ${q.slice(0,45)}`);
}
