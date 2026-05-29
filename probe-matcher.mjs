import { COLLEGES } from "./src/lib/colleges.js";

const STOPWORDS = new Set(["of","the","and","for","in","at","to","&","dr","drs","prof","ltd","new","old"]);
function tokenize(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").split(/\s+/).filter(Boolean).filter(t=>!STOPWORDS.has(t));}

const MASTER = COLLEGES.map(c => ({
  name: c.name,
  tokens: new Set(tokenize([c.name, ...(c.aliases||[]), c.city, c.state].join(" "))),
  nameTokens: new Set(tokenize(c.name)),
  city: c.city,
}));
const docFreq = new Map();
for (const m of MASTER) for (const t of m.tokens) docFreq.set(t,(docFreq.get(t)||0)+1);
const N = MASTER.length;
const idf = t => { const df=docFreq.get(t)||0; return df===0?0:Math.log(N/df); };
const IDF_MIN_FOR_SIG = Math.log(N / Math.max(8, N*0.07));

console.log("N (master colleges):", N);
console.log("IDF_MIN_FOR_SIG:", IDF_MIN_FOR_SIG.toFixed(2), "\n");

const probe = ["gandhi","mahatma","indira","rajiv","jawaharlal","seth","wardha","adilabad","nagpur","kozhikode","bhopal","baby","memorial","government","medical","college","institute","sciences","hospital","azad","maulana","vardhman"];
console.log("token        | df  | idf   | rare?(>=2.66) | unknown?(df=0)");
for (const t of probe) {
  const df = docFreq.get(t)||0;
  console.log(t.padEnd(12), "|", String(df).padStart(3), "|", idf(t).toFixed(2).padStart(5), "|", (idf(t)>=IDF_MIN_FOR_SIG?"YES":"no").padStart(13), "|", df===0?"UNKNOWN":"known");
}

// How many master colleges contain "gandhi"?
console.log("\nMasters containing 'gandhi':");
for (const m of MASTER) if (m.nameTokens.has("gandhi")) console.log("  -", m.name, "(city:", m.city + ")");
