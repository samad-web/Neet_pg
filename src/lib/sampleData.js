/* Deterministic sample historical allotment generator. */
import { COLLEGES } from "./colleges.js";

function mulberry32(seed) {
  return function() {
    let t = (seed += 0x6D2B79F5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function basePrior(college) {
  if (college.id.startsWith("AIIMS-001") || college.id === "PGI-001" || college.id === "JIPMER-001") return 200;
  if (college.type === "Central-INI") return 1200;
  if (college.id === "TN-004" || college.id === "KA-003" || college.id === "PB-002") return 1500;
  if (college.type === "Government") {
    const tier1Cities = ["Mumbai","New Delhi","Bengaluru","Chennai","Kolkata","Hyderabad","Pune","Jaipur","Lucknow"];
    return tier1Cities.includes(college.city) ? 2500 : 6000;
  }
  if (college.type === "ESIC") return 10000;
  if (college.type === "AFMS") return 2200;
  if (college.type === "Deemed") return 28000;
  if (college.type === "Private") return 22000;
  return 15000;
}

const SPECIALTY_HEAT = {
  "MD Radiodiagnosis": 0.55, "MD Dermatology": 0.6, "MD General Medicine": 0.75,
  "MD Paediatrics": 0.95, "MS General Surgery": 1.05, "MS Orthopaedics": 1.0,
  "MS Obstetrics & Gynaecology": 1.1, "MD Anaesthesiology": 1.3, "MD Psychiatry": 1.45,
  "MS ENT": 1.55, "MS Ophthalmology": 1.4, "MD Respiratory Medicine": 1.7,
  "MD Emergency Medicine": 1.6, "MD Pathology": 1.9, "MD Microbiology": 2.4,
  "MD Pharmacology": 2.8, "MD Community Medicine": 3.0, "MD Biochemistry": 3.4,
  "MD Anatomy": 3.6, "MD Physiology": 3.7, "MD Forensic Medicine": 3.8,
  "MD Nuclear Medicine": 1.3,
};
const CATEGORY_MULT = { "UR": 1.0, "EWS": 1.06, "OBC-NCL": 1.18, "SC": 1.9, "ST": 2.6 };
const QUOTA_MULT = { "AIQ": 1.0, "State": 1.08, "Deemed": 1.4, "Central-INI": 0.55, "ESIC": 1.3, "AFMS": 0.7, "DNB": 1.6, "Management": 2.0, "NRI": 2.3 };
const ROUND_MULT = { "R1": 1.0, "R2": 1.18, "R3": 1.35, "Mop-up": 1.55, "Stray": 1.75 };

function yearDrift(year, baseDrift) {
  return 1 + baseDrift * (year - 2023);
}

export function generateSampleData() {
  const rng = mulberry32(2024);
  const rand = () => rng();
  const randn = () => {
    const u1 = Math.max(rand(), 1e-9);
    const u2 = rand();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };
  const choiceW = (arr, weights) => {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    for (let i = 0; i < arr.length; i++) { r -= weights[i]; if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  };

  const records = [];
  const years = [2022, 2023, 2024];

  for (const college of COLLEGES) {
    const collegeBase = basePrior(college);
    const collegeDrift = randn() * 0.04;

    const quotas = [];
    if (college.type === "Government" || college.type === "Government-Society") { quotas.push("AIQ"); quotas.push("State"); }
    else if (college.type === "Central-INI") { quotas.push("Central-INI"); quotas.push("AIQ"); }
    else if (college.type === "Deemed") { quotas.push("Deemed"); }
    else if (college.type === "AFMS") { quotas.push("AFMS"); }
    else if (college.type === "ESIC") { quotas.push("ESIC"); quotas.push("AIQ"); }
    else if (college.type === "Private") { quotas.push("Management"); quotas.push("AIQ"); }

    for (const course of college.pgCoursesOffered) {
      const heat = SPECIALTY_HEAT[course] ?? 1.5;
      const specBase = collegeBase * heat * (0.9 + rand() * 0.2);

      for (const quota of quotas) {
        for (const year of years) {
          const seatsBase = (quota === "AIQ" && (college.type === "Government" || college.type === "Government-Society")) ? 2 : 3;
          const seats = Math.max(1, Math.round(seatsBase + randn()));

          for (let s = 0; s < seats; s++) {
            const category = choiceW(["UR", "EWS", "OBC-NCL", "SC", "ST"], [0.45, 0.15, 0.27, 0.10, 0.06]);
            const round = choiceW(["R1", "R2", "R3", "Mop-up", "Stray"], [0.45, 0.22, 0.15, 0.12, 0.06]);
            const catMult = CATEGORY_MULT[category];
            const quotaMult = QUOTA_MULT[quota] ?? 1;
            const roundMult = ROUND_MULT[round];
            const drift = yearDrift(year, collegeDrift);

            const mean = specBase * catMult * quotaMult * roundMult * drift;
            let rank = Math.max(1, Math.round(mean * Math.exp(randn() * 0.18)));
            if (rank > 350000) rank = Math.round(280000 + rand() * 60000);

            const isPwBD = rand() < 0.04;
            const isInService = quota === "AIQ" ? false : (rand() < 0.05);

            const rec = { year, round, rank, college: college.name, course, category, quota };
            if (quota === "State") rec.state = college.state;
            if (isPwBD) rec.isPwBD = true;
            if (isInService) rec.isInService = true;
            records.push(rec);
          }
        }
      }
    }
  }

  return records;
}

export function makeSampleCsv() {
  const headers = ["year","round","rank","college","course","category","quota","state","isPwBD","isInService"];
  const example = [
    [2024,"R1",87,"All India Institute of Medical Sciences, New Delhi","MD General Medicine","UR","AIQ","","",""],
    [2024,"R1",1842,"Maulana Azad Medical College","MD Radiodiagnosis","UR","AIQ","","",""],
    [2024,"R2",6210,"Madras Medical College","MS General Surgery","OBC-NCL","State","Tamil Nadu","",""],
    [2024,"R3",15422,"B. J. Government Medical College","MD Anaesthesiology","SC","AIQ","","true",""],
    [2023,"R1",3104,"Christian Medical College, Vellore","MD Paediatrics","UR","Management","","",""],
  ];
  const rows = [headers.join(",")];
  for (const r of example) {
    rows.push(r.map(x => {
      const s = String(x);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    }).join(","));
  }
  return rows.join("\n");
}
