import fs from "node:fs";
import { PDFParse } from "pdf-parse";

const buf = fs.readFileSync("./mcc-r2-2023.pdf");
const p = new PDFParse({ data: new Uint8Array(buf) });
const r = await p.getText();
await p.destroy();

const text = r.text;
const isFlatHeader = /SNo\s+Rank\s+Allotted\s+Quota/i.test(text.slice(0, 8000));
console.log("Has flat header:", isFlatHeader);
console.log("Has R3 trajectory header:", text.includes("Round 1 Round 2 Round 3"));
console.log("Has R2 trajectory header:", text.includes("Round 1 Round 2"));

let body;
if (isFlatHeader) {
  const idx = text.search(/SNo\s+Rank\s+Allotted\s+Quota/i);
  body = idx > 0 ? text.slice(idx) : text;
  console.log("Using flat body, start idx:", idx);
} else {
  const idx = text.indexOf("Round 1 Round 2 Round 3");
  body = idx > 0 ? text.slice(idx) : text;
  console.log("Using traj body, start idx:", idx);
}

const flat = body.replace(/\s+/g, " ").replace(/([A-Za-z])- ([A-Za-z])/g, "$1-$2");
console.log("Flat body length:", flat.length);

const FULL_QUOTAS = ["All India","DNB Quota","Deemed University","Aligarh Muslim University","Banaras Hindu University","Delhi University","IP University","Jain Minority","Muslim Minority","NRI","Self-Financed Merit Seat","Armed Forces Medical"];
const FULL_QUOTAS_RE = FULL_QUOTAS.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

const CHUNK_RE = new RegExp("\\b(\\d{1,7})\\s+(?:AI|AM|AF|BH|DU|AD|IP|JM|MM|NR|PS)\\s+", "g");
const FLAT_CHUNK_RE = new RegExp(`\\b(\\d{1,7})\\s+(\\d{1,7})\\s+(?=(?:${FULL_QUOTAS_RE}))`, "g");

const codeChunks = [...flat.matchAll(CHUNK_RE)];
const flatChunks = [...flat.matchAll(FLAT_CHUNK_RE)];
console.log("codeChunks:", codeChunks.length);
console.log("flatChunks:", flatChunks.length);

// Show first 3 flat chunks
console.log("\nFirst 3 flat-chunk samples:");
for (let i = 0; i < Math.min(3, flatChunks.length); i++) {
  const c = flatChunks[i];
  console.log(`  rank=${c[2]}: "${flat.slice(c.index, c.index + 80)}…"`);
}
