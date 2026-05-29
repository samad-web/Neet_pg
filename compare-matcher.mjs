/* A/B compare the matcher OLD (no foreign-token penalty) vs NEW, faithfully
   reimplementing the scoring so we can see exactly what the change moves. */
import { COLLEGES } from "./src/lib/colleges.js";

const STOPWORDS = new Set(["of","the","and","for","in","at","to","&","dr","drs","prof","ltd","new","old"]);
const tokenize = s => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").split(/\s+/).filter(Boolean).filter(t=>!STOPWORDS.has(t));

const MASTER = COLLEGES.map(c => ({
  id:c.id, name:c.name,
  tokens:new Set(tokenize([c.name,...(c.aliases||[]),c.city,c.state].join(" "))),
  nameTokens:new Set(tokenize(c.name)),
  aliasTokens:(c.aliases||[]).map(a=>new Set(tokenize(a))),
  city:c.city,
}));
const docFreq = new Map();
for (const m of MASTER) for (const t of m.tokens) docFreq.set(t,(docFreq.get(t)||0)+1);
const N = MASTER.length;
const idf = t => { const df=docFreq.get(t)||0; return df===0?0:Math.log(N/df); };
const IDF_MIN_FOR_SIG = Math.log(N/Math.max(8,N*0.07));
const SIG_K = 2;
for (const m of MASTER) {
  const ranked=[...m.nameTokens].map(t=>({t,w:idf(t)})).sort((a,b)=>b.w-a.w);
  m.signature=ranked.slice(0,SIG_K).filter(x=>x.w>=IDF_MIN_FOR_SIG).map(x=>x.t);
}

function match(query, usePenalty, threshold=0.72) {
  const qArr=tokenize(query); if(!qArr.length) return null;
  const qTokens=new Set(qArr);
  let qIdfSum=0; for(const t of qTokens) qIdfSum+=idf(t);
  if(qIdfSum===0) return null;
  let best=null,bestScore=0;
  for(const m of MASTER){
    let hasRare=false;
    for(const t of qTokens) if(m.nameTokens.has(t)&&idf(t)>=IDF_MIN_FOR_SIG){hasRare=true;break;}
    if(!hasRare){let ac=false;for(const a of m.aliasTokens){if(a.size===0)continue;if([...a].every(t=>qTokens.has(t))){ac=true;break;}}if(!ac)continue;}
    if(m.signature&&m.signature.length>0){
      const allSig=m.signature.every(t=>qTokens.has(t));
      const someSig=m.signature.some(t=>qTokens.has(t));
      let ac=false;for(const a of m.aliasTokens){if(a.size===0)continue;if([...a].every(t=>qTokens.has(t))){ac=true;break;}}
      const ct=m.city?tokenize(m.city):[];const cityIn=ct.length>0&&ct.every(t=>qTokens.has(t));
      if(!allSig&&!ac&&!(someSig&&cityIn))continue;
    }
    let overlapIdf=0;for(const t of qTokens)if(m.nameTokens.has(t))overlapIdf+=idf(t);
    let foreignIdf=0;
    if(usePenalty)for(const t of qTokens)if(!m.tokens.has(t)&&idf(t)>=IDF_MIN_FOR_SIG)foreignIdf+=idf(t);
    let mNameIdfSum=0;for(const t of m.nameTokens)mNameIdfSum+=idf(t);
    const denom=Math.max(0.1,Math.min(qIdfSum,mNameIdfSum))+foreignIdf;
    let score=overlapIdf/denom;
    for(const a of m.aliasTokens){if(a.size>0){let all=true;for(const t of a)if(!qTokens.has(t)){all=false;break;}if(all){score+=0.3;break;}}}
    if(m.city){const ct=tokenize(m.city);if(ct.length>0&&ct.every(t=>qTokens.has(t)))score+=0.15;}
    if(score>bestScore){bestScore=score;best=m;}
  }
  return best&&bestScore>=threshold?{name:best.name,score:bestScore}:null;
}

const { records } = await (await fetch("http://localhost:8787/api/records")).json();
const distinct = [...new Set(records.map(r=>r.college))];
const rowCount = new Map();
for (const r of records) rowCount.set(r.college,(rowCount.get(r.college)||0)+1);

let bothSame=0, lostRows=0, changedRows=0, keptRows=0, gainedRows=0;
const lost=[], changed=[];
for (const q of distinct) {
  const a=match(q,false), b=match(q,true);
  const rows=rowCount.get(q);
  const an=a?a.name:null, bn=b?b.name:null;
  if(an===bn){ if(an){bothSame++;keptRows+=rows;} }
  else if(an && !bn){ lostRows+=rows; lost.push({q,was:an,rows}); }
  else if(!an && bn){ gainedRows+=rows; }
  else { changedRows+=rows; changed.push({q,was:an,now:bn,rows}); }
}

console.log("=== A/B over", distinct.length, "distinct names ===");
console.log("unchanged-match names:", bothSame, "| rows kept matched:", keptRows);
console.log("now-REJECTED rows (was matched):", lostRows, `(${(lostRows/records.length*100).toFixed(1)}% of all rows)`);
console.log("re-TARGETED rows (matched a different master):", changedRows);
console.log("newly-matched rows:", gainedRows);

console.log("\n=== Sample of NEWLY-REJECTED names (highest row counts) — are these false merges (good) or legit (bad)? ===");
lost.sort((a,b)=>b.rows-a.rows);
for (const x of lost.slice(0,25)) console.log(`  ${String(x.rows).padStart(4)} rows | was-> "${x.was}"  <= ${x.q.slice(0,60)}`);

console.log("\n=== Sample of RE-TARGETED names ===");
changed.sort((a,b)=>b.rows-a.rows);
for (const x of changed.slice(0,12)) console.log(`  ${String(x.rows).padStart(4)} | "${x.was}" -> "${x.now}"  <= ${x.q.slice(0,45)}`);
