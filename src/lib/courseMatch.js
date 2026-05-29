/* Bridge MCC course strings to the canonical specialty list bundled with the
   master college data.

   MCC PDFs use surface forms like:
     "M.D. (RADIO-DIAGNOSIS)"
     "M.D. (Obst. and Gynae)/MS (Obstetrics and Gynaecology)"
     "M.D. (DERM.,VENE. and LEPROSY)/ (DERMATOLOGY)/(SKIN and VENEREAL DISEASES)"
     "(NBEMS) GENERAL MEDICINE"
     "M.D. IN NUCLEAR MEDICINE"
   Our SPECIALTIES_LIST uses canonical forms like:
     "MD Radiodiagnosis"
     "MS Obstetrics & Gynaecology"
     "MD Dermatology"
     "MD General Medicine"
     "MD Nuclear Medicine"

   We resolve via a curated alias table built from the legend at the top of
   every MCC PDF. Unknown MCC strings pass through untouched (predictions still
   work but stay grouped under the MCC name). */

import { SPECIALTIES_LIST } from "./colleges.js";

// Alias map: any string in the value array (case/punctuation-insensitive)
// maps to the canonical key.
const ALIASES = {
  "MD General Medicine": [
    "MD General Medicine", "M.D. (GENERAL MEDICINE)", "GENERAL MEDICINE", "(NBEMS) GENERAL MEDICINE",
    "DMED", "GMED",
  ],
  "MD Paediatrics": [
    "MD Paediatrics", "M.D. (PAEDIATRICS)", "PAEDIATRICS", "(NBEMS) PAEDIATRICS", "DPED", "PAED",
    "M.D. (PEDIATRICS)", "PEDIATRICS",
  ],
  "MD Anaesthesiology": [
    "MD Anaesthesiology", "M.D. (ANAESTHESIOLOGY)", "ANAESTHESIOLOGY", "(NBEMS) ANAESTHESIOLOGY",
    "DANS", "ASTH",
  ],
  "MD Radiodiagnosis": [
    "MD Radiodiagnosis", "M.D. (RADIO-DIAGNOSIS)", "RADIO-DIAGNOSIS", "RADIO DIAGNOSIS",
    "(NBEMS) RADIO-DIAGNOSIS", "(NBEMS-DIPLOMA) RADIO-DIAGNOSIS", "RADD", "DRAD", "DMRD",
    "DIPLOMA IN MEDICAL RADIO-DIAGNOSIS",
  ],
  "MD Dermatology": [
    "MD Dermatology", "M.D. (DERM.,VENE. and LEPROSY)/ (DERMATOLOGY)/(SKIN and VENEREAL DISEASES)/(VENEREOLOGY)",
    "M.D. (DERMATOLOGY)", "DERMATOLOGY", "DERMATOLOGY and VENEREOLOGY and LEPROSY",
    "(NBEMS) DERMATOLOGY and VENEREOLOGY and LEPROSY", "DV-L", "NDDVL",
  ],
  "MD Psychiatry": [
    "MD Psychiatry", "M.D. (PSYCHIATRY)", "PSYCHIATRY", "(NBEMS) PSYCHIATRY", "PSYY", "DPSYN",
    "PG Diploma in Psychological Medicine / Psychiatric Medicine", "DPSY",
  ],
  "MD Pathology": [
    "MD Pathology", "M.D. (PATHOLOGY)", "PATHOLOGY", "(NBEMS) PATHOLOGY", "PATH", "DPTH",
    "DIPLOMA IN CLINICAL PATHOLOGY",
  ],
  "MD Microbiology": [
    "MD Microbiology", "M.D. (MICROBIOLOGY)", "MICROBIOLOGY", "(NBEMS) MICROBIOLOGY", "MICR", "DMIC",
  ],
  "MD Pharmacology": [
    "MD Pharmacology", "M.D. (PHARMACOLOGY)", "PHARMACOLOGY", "(NBEMS) PHARMACOLOGY", "PHAR", "DPHA",
  ],
  "MD Biochemistry": [
    "MD Biochemistry", "M.D. (BIOCHEMISTRY)", "BIOCHEMISTRY", "(NBEMS) BIOCHEMISTRY", "BIOC", "DBIO",
  ],
  "MD Community Medicine": [
    "MD Community Medicine", "M.D. (COMMUNITY HEALTH and ADMN.)",
    "M.D. (PREVENTIVE and SOCIAL MEDICINE)/ COMMUNITY MEDICINE",
    "COMMUNITY MEDICINE", "(NBEMS) COMMUNITY MEDICINE", "CH-A", "P-SM", "DCOM",
  ],
  "MD Physiology": [
    "MD Physiology", "M.D. (PHYSIOLOGY)", "PHYSIOLOGY", "(NBEMS) PHYSIOLOGY", "PHYS", "DPHYN",
  ],
  "MD Anatomy": [
    "MD Anatomy", "MD/MS (Anatomy)", "ANATOMY", "(NBEMS) Anatomy", "ANAT", "DANT",
  ],
  "MD Forensic Medicine": [
    "MD Forensic Medicine", "M.D. (FORENSIC MEDICINE)", "FORENSIC MEDICINE",
    "(NBEMS) FORENSIC MEDICINE", "FMED", "DFRM", "DIP. IN FORENSIC MEDICINE", "D-FM",
  ],
  "MD Respiratory Medicine": [
    "MD Respiratory Medicine",
    "M.D. (Tuberculosis and Respiratory diseases)/Pulmonary Medicine /M.D. (Respiratory Medicine)",
    "RESPIRATORY MEDICINE", "TUBERCULOSIS AND RESPIRATORY DISEASES", "TBRD",
    "DIP. IN T.B. and CHEST DISEASES", "DTCD",
  ],
  "MS General Surgery": [
    "MS General Surgery", "M.S. (GENERAL SURGERY)", "GENERAL SURGERY",
    "(NBEMS) GENERAL SURGERY", "GSUR", "DSUR",
  ],
  "MS Orthopaedics": [
    "MS Orthopaedics", "M.S. (ORTHOPAEDICS)", "ORTHOPAEDICS",
    "(NBEMS) ORTHOPAEDICS", "ORTH", "NDORT", "DIPLOMA IN ORTHOPAEDICS", "DORT",
  ],
  "MS ENT": [
    "MS ENT", "M.S. (E.N.T.)", "E.N.T.", "ENT", "Otorhinolaryngology",
    "(NBEMS) Otorhinolaryngology (E.N.T.)", "EN-T", "DENT",
    "DIPLOMA IN OTO-RHINO-LARYNGOLOGY", "D-LO",
  ],
  "MS Ophthalmology": [
    "MS Ophthalmology", "M.S. (OPHTHALMOLOGY)", "OPHTHALMOLOGY",
    "(NBEMS) OPHTHALMOLOGY", "OPTH", "DOPH", "DIPLOMA IN OPHTHALMOLOGY/DOMS", "D-OP",
  ],
  "MS Obstetrics & Gynaecology": [
    "MS Obstetrics & Gynaecology",
    "M.D. (Obst. and Gynae)/MS (Obstetrics and Gynaecology)",
    "M.D. (Obst. and Gynae)",
    "MS (Obstetrics and Gynaecology)",
    "Obstetrics and Gynaecology", "(NBEMS) Obstetrics and Gynaecology",
    "OBGY", "DOBG", "DIP.IN GYNAE. and OBST.", "D-GO",
  ],
  "MD Emergency Medicine": [
    "MD Emergency Medicine",
    "M.D. (Emergency and Critical Care)/M.D. (Emergency Medicine)",
    "Emergency Medicine", "(NBEMS) Emergency Medicine",
    "Diploma-Emergency Medicine", "E-CC", "DEMM", "NDEM",
  ],
  "MD Nuclear Medicine": [
    "MD Nuclear Medicine", "M.D. IN NUCLEAR MEDICINE", "NUCLEAR MEDICINE",
    "(NBEMS) NUCLEAR MEDICINE", "N-ME", "DNUM",
  ],
};

// Build a fast lookup keyed by a normalized form: lowercase, drop all
// non-alphanumeric. So "M.D. (RADIO-DIAGNOSIS)" and "MD Radiodiagnosis" and
// "RADD" all collapse to comparable keys.
const key = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const LOOKUP = new Map();
for (const [canonical, aliases] of Object.entries(ALIASES)) {
  for (const a of aliases) LOOKUP.set(key(a), canonical);
}
// Also map every canonical specialty to itself for round-trip safety.
for (const s of SPECIALTIES_LIST) LOOKUP.set(key(s), s);

const cache = new Map();

/**
 * Resolve any MCC / canonical course string to the bundled specialty name.
 * Pass-through (returns the input) when no alias matches — predictions still
 * work but stay grouped under the MCC name.
 */
export function canonicalCourseName(query) {
  if (!query) return query;
  if (cache.has(query)) return cache.get(query);
  const direct = LOOKUP.get(key(query));
  if (direct) { cache.set(query, direct); return direct; }
  // Try matching the inner-paren contents of "(NBEMS) X" / "M.D. (X)" patterns.
  const inner = query.match(/\(([^)]{3,80})\)/);
  if (inner) {
    const hit = LOOKUP.get(key(inner[1]));
    if (hit) { cache.set(query, hit); return hit; }
  }
  // Try stripping common prefixes.
  const stripped = query
    .replace(/^M\.?[DS]\.?\s*(\(|in\s+)?/i, "")
    .replace(/^\(NBEMS(-DIPLOMA)?\)\s*/i, "")
    .replace(/[)\s]+$/, "");
  const hit2 = LOOKUP.get(key(stripped));
  if (hit2) { cache.set(query, hit2); return hit2; }
  cache.set(query, query);
  return query;
}
