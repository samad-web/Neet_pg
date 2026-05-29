/* Normalizes free-text CSV fields to the canonical labels the predictor expects.
   Without this, a real upload that says "General"/"OBC"/"Round 1"/"All India"
   would silently match no eligible pool and produce zero predictions. */

const CATEGORY_ALIASES = {
  UR: ["UR", "OPEN", "GENERAL", "GEN", "GN", "UNRESERVED"],
  EWS: ["EWS", "EWS-GEN", "EWSGEN"],
  "OBC-NCL": ["OBC-NCL", "OBC", "OBCNCL", "OBC NCL", "OBC(NCL)", "OBCCL", "BC"],
  SC: ["SC"],
  ST: ["ST"],
};

const QUOTA_ALIASES = {
  AIQ: ["AIQ", "ALL INDIA", "ALLINDIA", "ALL INDIA QUOTA", "AI"],
  State: ["STATE", "STATE QUOTA", "SQ"],
  Deemed: ["DEEMED", "DEEMED UNIVERSITY", "DEEMEDU"],
  "Central-INI": ["CENTRAL-INI", "CENTRAL INI", "INI", "CENTRAL"],
  ESIC: ["ESIC", "ESI", "ESICQUOTA"],
  AFMS: ["AFMS", "ARMED FORCES", "AFMC"],
  DNB: ["DNB", "DNB-CET"],
  Management: ["MANAGEMENT", "MGMT", "MANAGEMENT QUOTA"],
  NRI: ["NRI"],
};

const ROUND_ALIASES = {
  R1: ["R1", "ROUND 1", "ROUND1", "1", "ROUND-1", "R-1"],
  R2: ["R2", "ROUND 2", "ROUND2", "2", "ROUND-2", "R-2"],
  R3: ["R3", "ROUND 3", "ROUND3", "3", "ROUND-3", "R-3"],
  "Mop-up": ["MOP-UP", "MOPUP", "MOP UP", "MOP", "ROUND 4", "ROUND4"],
  Stray: ["STRAY", "STRAY VACANCY", "STRAYVACANCY"],
  Final: ["FINAL", "F"],
};

const key = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

function buildLookup(table) {
  const m = new Map();
  for (const [canonical, aliases] of Object.entries(table)) {
    for (const alias of aliases) m.set(key(alias), canonical);
  }
  return m;
}

const CATEGORY_LOOKUP = buildLookup(CATEGORY_ALIASES);
const QUOTA_LOOKUP = buildLookup(QUOTA_ALIASES);
const ROUND_LOOKUP = buildLookup(ROUND_ALIASES);

export function normalizeCategory(raw) {
  const v = CATEGORY_LOOKUP.get(key(raw));
  return v || "UR";
}

export function normalizeQuota(raw) {
  const v = QUOTA_LOOKUP.get(key(raw));
  return v || "AIQ";
}

export function normalizeRound(raw) {
  if (!raw) return "Final";
  const v = ROUND_LOOKUP.get(key(raw));
  return v || raw; // pass through unknown rounds (don't lose information)
}

export function normalizeBool(raw) {
  return /^(true|yes|y|1|t)$/i.test(String(raw || "").trim());
}
