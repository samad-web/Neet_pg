/* NMC PG college master list — ported from design data-colleges.js. */

export const COLLEGES_DATA_VERSION = "2025.04";
export const COLLEGES_LAST_UPDATED = "2025-04-12";

export const SPECIALTIES = [
  "MD General Medicine","MD Paediatrics","MD Anaesthesiology","MD Radiodiagnosis",
  "MD Dermatology","MD Psychiatry","MD Pathology","MD Microbiology",
  "MD Pharmacology","MD Biochemistry","MD Community Medicine","MD Physiology",
  "MD Anatomy","MD Forensic Medicine","MD Respiratory Medicine",
  "MS General Surgery","MS Orthopaedics","MS ENT","MS Ophthalmology",
  "MS Obstetrics & Gynaecology","MD Emergency Medicine","MD Nuclear Medicine"
];

const C = (id, name, aliases, state, city, type, est, seats, minorityType, specialties, affiliation) => ({
  id, name, aliases, state, city, type, established: est,
  totalPgSeats: seats,
  isMinorityInstitution: !!minorityType,
  minorityType: minorityType || null,
  pgCoursesOffered: specialties,
  affiliation: affiliation || null
});

const ALL_GEN = SPECIALTIES;
const BIG = SPECIALTIES.slice(0, 20);
const MED = SPECIALTIES.slice(0, 14);
const SML = SPECIALTIES.slice(0, 10);
const CORE = ["MD General Medicine","MD Paediatrics","MD Anaesthesiology","MD Radiodiagnosis","MS General Surgery","MS Orthopaedics","MS Obstetrics & Gynaecology"];

export const COLLEGES = [
  C("AIIMS-001","All India Institute of Medical Sciences, New Delhi",["AIIMS Delhi","AIIMSND"],"Delhi","New Delhi","Central-INI",1956,160,null,ALL_GEN),
  C("AIIMS-002","All India Institute of Medical Sciences, Bhopal",["AIIMS Bhopal"],"Madhya Pradesh","Bhopal","Central-INI",2012,90,null,BIG),
  C("AIIMS-003","All India Institute of Medical Sciences, Bhubaneswar",["AIIMS BBSR"],"Odisha","Bhubaneswar","Central-INI",2012,90,null,BIG),
  C("AIIMS-004","All India Institute of Medical Sciences, Jodhpur",["AIIMS Jodhpur"],"Rajasthan","Jodhpur","Central-INI",2012,95,null,BIG),
  C("AIIMS-005","All India Institute of Medical Sciences, Patna",["AIIMS Patna"],"Bihar","Patna","Central-INI",2012,85,null,BIG),
  C("AIIMS-006","All India Institute of Medical Sciences, Raipur",["AIIMS Raipur"],"Chhattisgarh","Raipur","Central-INI",2012,82,null,BIG),
  C("AIIMS-007","All India Institute of Medical Sciences, Rishikesh",["AIIMS Rishikesh"],"Uttarakhand","Rishikesh","Central-INI",2012,86,null,BIG),
  C("AIIMS-008","All India Institute of Medical Sciences, Nagpur",["AIIMS Nagpur"],"Maharashtra","Nagpur","Central-INI",2018,55,null,MED),
  C("AIIMS-009","All India Institute of Medical Sciences, Mangalagiri",["AIIMS Mangalagiri"],"Andhra Pradesh","Mangalagiri","Central-INI",2018,50,null,MED),
  C("PGI-001","Postgraduate Institute of Medical Education & Research, Chandigarh",["PGI Chandigarh","PGIMER"],"Chandigarh","Chandigarh","Central-INI",1962,200,null,ALL_GEN),
  C("JIPMER-001","Jawaharlal Institute of Postgraduate Medical Education & Research",["JIPMER","JIPMER Puducherry"],"Puducherry","Puducherry","Central-INI",1956,180,null,ALL_GEN),
  C("NIMHANS-001","National Institute of Mental Health and Neurosciences",["NIMHANS"],"Karnataka","Bengaluru","Central-INI",1974,75,null,["MD Psychiatry","MD Neurology","MCh Neurosurgery","DM Neurology"]),
  C("SCTIMST-001","Sree Chitra Tirunal Institute for Medical Sciences and Technology",["SCTIMST"],"Kerala","Thiruvananthapuram","Central-INI",1976,42,null,["DM Cardiology","MCh Cardiothoracic","MCh Neurosurgery","MD Radiodiagnosis"]),

  C("MH-001","Seth GS Medical College & KEM Hospital",["KEM Mumbai","Seth GSMC"],"Maharashtra","Mumbai","Government",1926,210,null,ALL_GEN),
  C("MH-002","Grant Government Medical College",["Grant Medical","GGMC"],"Maharashtra","Mumbai","Government",1845,175,null,BIG),
  C("MH-003","Lokmanya Tilak Municipal Medical College",["Sion","LTMMC"],"Maharashtra","Mumbai","Government",1964,140,null,BIG),
  C("MH-004","Topiwala National Medical College",["BYL Nair","TNMC"],"Maharashtra","Mumbai","Government",1921,110,null,BIG),
  C("MH-005","B. J. Government Medical College",["BJ Pune","BJMC"],"Maharashtra","Pune","Government",1946,180,null,BIG),
  C("MH-006","Government Medical College, Nagpur",["GMC Nagpur"],"Maharashtra","Nagpur","Government",1947,160,null,MED),
  C("MH-007","Government Medical College, Aurangabad",["GMC Aurangabad"],"Maharashtra","Aurangabad","Government",1956,120,null,MED),
  C("MH-008","Armed Forces Medical College",["AFMC Pune"],"Maharashtra","Pune","AFMS",1948,95,null,BIG),

  C("DL-001","Maulana Azad Medical College",["MAMC"],"Delhi","New Delhi","Government",1959,200,null,ALL_GEN),
  C("DL-002","University College of Medical Sciences",["UCMS","GTB Hospital"],"Delhi","New Delhi","Government",1971,140,null,BIG),
  C("DL-003","Lady Hardinge Medical College",["LHMC"],"Delhi","New Delhi","Government",1916,130,null,BIG),
  C("DL-004","Vardhman Mahavir Medical College & Safdarjung Hospital",["VMMC","Safdarjung"],"Delhi","New Delhi","Government",2001,170,null,BIG),
  C("DL-005","Atal Bihari Vajpayee Institute of Medical Sciences & Dr. RML Hospital",["RML","ABVIMS"],"Delhi","New Delhi","Government",1932,110,null,MED),
  C("DL-006","ESIC Medical College, Faridabad NIT-3",["ESIC Faridabad"],"Delhi","Faridabad","ESIC",2015,55,null,SML),
  C("DL-007","Hamdard Institute of Medical Sciences and Research",["HIMSR","Jamia Hamdard"],"Delhi","New Delhi","Private",2012,60,"Muslim",SML),

  C("KA-001","Bangalore Medical College & Research Institute",["BMCRI"],"Karnataka","Bengaluru","Government",1955,180,null,BIG),
  C("KA-002","Kasturba Medical College, Manipal",["KMC Manipal"],"Karnataka","Manipal","Deemed",1953,210,null,BIG),
  C("KA-003","St. John's Medical College",["SJMC"],"Karnataka","Bengaluru","Private",1963,95,"Christian",MED),
  C("KA-004","Karnataka Institute of Medical Sciences",["KIMS Hubli"],"Karnataka","Hubli","Government",1957,90,null,MED),
  C("KA-005","JSS Medical College",["JSSMC"],"Karnataka","Mysuru","Deemed",1984,115,null,MED),
  C("KA-006","M S Ramaiah Medical College",["MSRMC","Ramaiah"],"Karnataka","Bengaluru","Private",1979,100,null,MED),
  C("KA-007","Mysore Medical College & Research Institute",["MMCRI"],"Karnataka","Mysuru","Government",1924,85,null,MED),

  C("TN-001","Madras Medical College",["MMC Chennai"],"Tamil Nadu","Chennai","Government",1835,260,null,ALL_GEN),
  C("TN-002","Stanley Medical College",["Stanley"],"Tamil Nadu","Chennai","Government",1938,130,null,BIG),
  C("TN-003","Kilpauk Medical College",["KMC Chennai"],"Tamil Nadu","Chennai","Government",1960,90,null,MED),
  C("TN-004","Christian Medical College, Vellore",["CMC Vellore"],"Tamil Nadu","Vellore","Private",1900,170,"Christian",BIG),
  C("TN-005","Sri Ramachandra Institute of Higher Education and Research",["SRIHER","Sri Ramachandra"],"Tamil Nadu","Chennai","Deemed",1985,135,null,BIG),
  C("TN-006","Madurai Medical College",["MMC Madurai"],"Tamil Nadu","Madurai","Government",1954,110,null,MED),
  C("TN-007","Coimbatore Medical College",["CMC Coimbatore"],"Tamil Nadu","Coimbatore","Government",1966,75,null,MED),
  C("TN-008","PSG Institute of Medical Sciences & Research",["PSGIMSR"],"Tamil Nadu","Coimbatore","Private",1985,70,null,SML),

  C("KL-001","Government Medical College, Thiruvananthapuram",["GMC TVM"],"Kerala","Thiruvananthapuram","Government",1951,130,null,BIG),
  C("KL-002","Government Medical College, Kozhikode",["GMC Kozhikode"],"Kerala","Kozhikode","Government",1957,120,null,MED),
  C("KL-003","T.D. Medical College",["TDMC Alappuzha"],"Kerala","Alappuzha","Government",1963,75,null,SML),
  C("KL-004","Amrita Institute of Medical Sciences",["AIMS Kochi","Amrita"],"Kerala","Kochi","Deemed",1998,140,null,BIG),

  C("WB-001","Medical College, Kolkata",["MCK","Calcutta Medical"],"West Bengal","Kolkata","Government",1835,200,null,BIG),
  C("WB-002","Institute of Postgraduate Medical Education & Research",["IPGMER","SSKM"],"West Bengal","Kolkata","Government",1957,180,null,BIG),
  C("WB-003","R. G. Kar Medical College",["RGKMC"],"West Bengal","Kolkata","Government",1886,140,null,MED),
  C("WB-004","Calcutta National Medical College",["CNMC"],"West Bengal","Kolkata","Government",1948,100,null,MED),
  C("WB-005","NRS Medical College",["NRSMC"],"West Bengal","Kolkata","Government",1873,110,null,MED),
  C("WB-006","Burdwan Medical College",["BMC Burdwan"],"West Bengal","Burdwan","Government",1969,85,null,SML),

  C("UP-001","King George's Medical University",["KGMU"],"Uttar Pradesh","Lucknow","Government",1911,260,null,ALL_GEN),
  C("UP-002","Sanjay Gandhi Postgraduate Institute of Medical Sciences",["SGPGIMS","SGPGI"],"Uttar Pradesh","Lucknow","Central-INI",1983,160,null,BIG),
  C("UP-003","Banaras Hindu University Institute of Medical Sciences",["IMS BHU","BHU"],"Uttar Pradesh","Varanasi","Central-INI",1960,150,null,BIG),
  C("UP-004","Jawaharlal Nehru Medical College, AMU",["JNMC AMU","Aligarh"],"Uttar Pradesh","Aligarh","Central-INI",1962,135,"Muslim",MED,"Aligarh Muslim University"),
  C("UP-005","Ganesh Shankar Vidyarthi Memorial Medical College",["GSVM Kanpur"],"Uttar Pradesh","Kanpur","Government",1956,110,null,MED),
  C("UP-006","Era's Lucknow Medical College",["Era's Lucknow"],"Uttar Pradesh","Lucknow","Private",1997,75,null,SML),

  C("GJ-001","B. J. Medical College",["BJMC Ahmedabad"],"Gujarat","Ahmedabad","Government",1946,180,null,BIG),
  C("GJ-002","Government Medical College, Surat",["GMCS"],"Gujarat","Surat","Government",1964,110,null,MED),
  C("GJ-003","M. P. Shah Medical College",["MPSMC"],"Gujarat","Jamnagar","Government",1955,95,null,MED),
  C("GJ-004","Smt. NHL Municipal Medical College",["NHL","NHLMMC"],"Gujarat","Ahmedabad","Government-Society",1963,90,null,MED),

  C("AP-001","Andhra Medical College",["AMC Visakhapatnam"],"Andhra Pradesh","Visakhapatnam","Government",1923,150,null,BIG),
  C("AP-002","Guntur Medical College",["GMC Guntur"],"Andhra Pradesh","Guntur","Government",1946,120,null,MED),
  C("AP-003","Kurnool Medical College",["KMC Kurnool"],"Andhra Pradesh","Kurnool","Government",1956,90,null,MED),
  C("TG-001","Osmania Medical College",["OMC Hyderabad"],"Telangana","Hyderabad","Government",1846,180,null,BIG),
  C("TG-002","Gandhi Medical College",["GMC Secunderabad"],"Telangana","Secunderabad","Government",1954,110,null,MED),
  C("TG-003","Nizam's Institute of Medical Sciences",["NIMS Hyderabad"],"Telangana","Hyderabad","Government",1989,130,null,MED),

  C("PB-001","Government Medical College, Patiala",["GMC Patiala"],"Punjab","Patiala","Government",1953,90,null,MED),
  C("PB-002","Christian Medical College, Ludhiana",["CMC Ludhiana"],"Punjab","Ludhiana","Private",1894,80,"Christian",MED),
  C("PB-003","Dayanand Medical College & Hospital",["DMCH Ludhiana"],"Punjab","Ludhiana","Private",1934,85,null,SML),
  C("HR-001","Pt. B. D. Sharma PGIMS, Rohtak",["PGIMS Rohtak"],"Haryana","Rohtak","Government",1960,120,null,MED),

  C("RJ-001","Sawai Man Singh Medical College",["SMS Jaipur"],"Rajasthan","Jaipur","Government",1947,180,null,BIG),
  C("RJ-002","Dr. S. N. Medical College",["SNMC Jodhpur"],"Rajasthan","Jodhpur","Government",1965,100,null,MED),
  C("RJ-003","RNT Medical College",["RNTMC Udaipur"],"Rajasthan","Udaipur","Government",1961,85,null,MED),

  C("MP-001","Gandhi Medical College, Bhopal",["GMC Bhopal"],"Madhya Pradesh","Bhopal","Government",1955,110,null,MED),
  C("MP-002","Mahatma Gandhi Memorial Medical College",["MGM Indore"],"Madhya Pradesh","Indore","Government",1948,140,null,MED),
  C("CG-001","Pt. JNM Medical College",["JNMMC Raipur"],"Chhattisgarh","Raipur","Government",1963,95,null,MED),

  C("BR-001","Patna Medical College",["PMC Patna"],"Bihar","Patna","Government",1925,110,null,MED),
  C("BR-002","Indira Gandhi Institute of Medical Sciences",["IGIMS Patna"],"Bihar","Patna","Government",1983,90,null,MED),
  C("JH-001","Rajendra Institute of Medical Sciences",["RIMS Ranchi"],"Jharkhand","Ranchi","Government",1960,80,null,MED),

  C("OD-001","S.C.B. Medical College",["SCB Cuttack"],"Odisha","Cuttack","Government",1944,140,null,MED),
  C("OD-002","M.K.C.G. Medical College",["MKCG"],"Odisha","Berhampur","Government",1962,90,null,SML),

  C("AS-001","Gauhati Medical College",["GMC Guwahati"],"Assam","Guwahati","Government",1960,110,null,MED),
  C("AS-002","Assam Medical College, Dibrugarh",["AMC Dibrugarh"],"Assam","Dibrugarh","Government",1947,95,null,SML),

  C("JK-001","Government Medical College, Srinagar",["GMC Srinagar"],"Jammu & Kashmir","Srinagar","Government",1959,100,null,MED),
  C("JK-002","Sher-i-Kashmir Institute of Medical Sciences",["SKIMS"],"Jammu & Kashmir","Srinagar","Government",1982,85,null,MED),

  C("DM-001","Saveetha Medical College",["Saveetha"],"Tamil Nadu","Chennai","Deemed",2008,115,null,BIG),
  C("DM-002","SRM Medical College Hospital & Research Centre",["SRM Kattankulathur"],"Tamil Nadu","Kattankulathur","Deemed",2005,95,null,MED),
  C("DM-003","D. Y. Patil Medical College",["DY Patil Pune","DYPMC"],"Maharashtra","Pune","Deemed",1996,110,null,MED),
  C("DM-004","Bharati Vidyapeeth Medical College",["BVMC Pune"],"Maharashtra","Pune","Deemed",1989,100,null,MED),
  C("DM-005","Krishna Institute of Medical Sciences",["KIMS Karad"],"Maharashtra","Karad","Deemed",1984,90,null,MED),
  C("DM-006","Datta Meghe Institute of Medical Sciences",["DMIMS Wardha"],"Maharashtra","Wardha","Deemed",1990,80,null,MED),
  C("DM-007","Pravara Institute of Medical Sciences",["PIMS Loni"],"Maharashtra","Loni","Deemed",1990,75,null,SML),
  C("DM-008","Vinayaka Mission's Kirupananda Variyar Medical College",["VMKV"],"Tamil Nadu","Salem","Deemed",1996,55,null,SML),
  C("DM-009","Yenepoya Medical College",["Yenepoya"],"Karnataka","Mangaluru","Deemed",1999,70,null,SML),
  C("DM-010","Father Muller Medical College",["FMMC"],"Karnataka","Mangaluru","Private",1880,85,"Christian",MED),

  C("ESIC-001","ESIC Medical College, Sanathnagar",["ESIC Hyderabad"],"Telangana","Hyderabad","ESIC",2014,60,null,SML),
  C("ESIC-002","ESIC Post Graduate Institute of Medical Sciences",["ESIC PGIMSR Basaidarapur"],"Delhi","New Delhi","ESIC",2009,55,null,SML),
  C("ESIC-003","ESIC Medical College, Chennai (KK Nagar)",["ESIC Chennai"],"Tamil Nadu","Chennai","ESIC",2013,50,null,SML),

  C("PR-001","Kasturba Medical College, Mangalore",["KMC Mangalore"],"Karnataka","Mangaluru","Deemed",1955,95,null,MED),
  C("PR-002","St. John's Medical College Hospital — Bangalore (separate hospital ent)",["SJMCH"],"Karnataka","Bengaluru","Private",1963,40,"Christian",SML),
  C("PR-003","Aarupadai Veedu Medical College",["AVMC"],"Puducherry","Puducherry","Private",2007,55,null,SML),
  C("PR-004","Pondicherry Institute of Medical Sciences",["PIMS Puducherry"],"Puducherry","Puducherry","Private",2001,65,"Christian",SML),

  C("MH-009","Government Medical College, Miraj",["GMC Miraj"],"Maharashtra","Miraj","Government",1962,70,null,SML),
  C("MH-010","Government Medical College, Akola",["GMC Akola"],"Maharashtra","Akola","Government",2002,55,null,CORE),
  C("UP-007","Sarojini Naidu Medical College",["SNMC Agra"],"Uttar Pradesh","Agra","Government",1854,90,null,MED),
  C("UP-008","Maharani Laxmi Bai Medical College",["MLB Jhansi"],"Uttar Pradesh","Jhansi","Government",1968,75,null,SML),
  C("TN-009","Tirunelveli Medical College",["TVMC"],"Tamil Nadu","Tirunelveli","Government",1965,80,null,SML),
  C("TN-010","Thanjavur Medical College",["TMC Thanjavur"],"Tamil Nadu","Thanjavur","Government",1961,75,null,SML),
  C("KA-008","Vijayanagara Institute of Medical Sciences",["VIMS Bellary"],"Karnataka","Ballari","Government",2003,55,null,CORE),
  C("KA-009","Belagavi Institute of Medical Sciences",["BIMS"],"Karnataka","Belagavi","Government",2010,60,null,CORE),
  C("KL-005","Government Medical College, Kottayam",["GMC Kottayam"],"Kerala","Kottayam","Government",1960,95,null,MED),
  C("KL-006","Government Medical College, Thrissur",["GMC Thrissur"],"Kerala","Thrissur","Government",1981,70,null,SML),
  C("HP-001","Indira Gandhi Medical College, Shimla",["IGMC Shimla"],"Himachal Pradesh","Shimla","Government",1966,100,null,MED),
  C("UK-001","Government Doon Medical College",["Doon Dehradun"],"Uttarakhand","Dehradun","Government",2016,60,null,CORE),
  C("GA-001","Goa Medical College",["GMC Goa"],"Goa","Bambolim","Government",1842,80,null,MED),
  C("MN-001","Regional Institute of Medical Sciences",["RIMS Imphal"],"Manipur","Imphal","Government",1972,75,null,SML),
  C("TR-001","Agartala Government Medical College",["AGMC"],"Tripura","Agartala","Government",2005,55,null,CORE),
];

export const STATES = Array.from(new Set(COLLEGES.map(c => c.state))).sort();
export const SPECIALTIES_LIST = SPECIALTIES;
export const COLLEGE_TYPES = ["Government","Government-Society","Private","Deemed","Central-INI","ESIC","AFMS","Trust"];

export function fuzzyMatch(query, candidate) {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const c = (candidate || "").toLowerCase();
  if (c.includes(q)) return true;
  let i = 0;
  for (const ch of c) { if (ch === q[i]) i++; if (i === q.length) return true; }
  return false;
}

export function collegeMatchesQuery(college, query) {
  if (!query) return true;
  const fields = [college.name, college.city, college.state, ...(college.aliases || [])];
  return fields.some(f => fuzzyMatch(query, f));
}
