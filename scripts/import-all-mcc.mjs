/* One-shot bulk import of every MCC AIQ allotment PDF we have a URL for.
   Runs sequentially against the local API; each PDF takes ~10-20s. */

const SOURCES = [
  { year: 2025, round: "R3",    url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2026/02/20260206892439077.pdf" },
  { year: 2025, round: "Stray", url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2026/02/20260223177387794.pdf" },
  { year: 2024, round: "R1",    url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2024/11/2024112085.pdf" },
  { year: 2024, round: "R2",    url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2024/12/2024121477.pdf" },
  { year: 2024, round: "R3",    url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2025/01/2025012533.pdf" },
  { year: 2024, round: "Stray", url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2025/02/2025021923.pdf" },
  { year: 2024, round: "Mop-up",url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2025/03/2025031272.pdf" },
  { year: 2023, round: "R1",    url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2023/08/2023080855.pdf" },
  { year: 2023, round: "R2",    url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2023/08/2023083188.pdf" },
  { year: 2023, round: "R3",    url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2023/09/2023092816.pdf" },
  { year: 2023, round: "Stray", url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2023/10/2023101632-1.pdf" },
  { year: 2023, round: "Mop-up",url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2023/11/2023112564.pdf" },
  { year: 2022, round: "R1",    url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2023/06/2023060647.pdf" },
  { year: 2022, round: "R2",    url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2023/06/2023060675.pdf" },
  { year: 2022, round: "Mop-up",url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2023/06/2023060699.pdf" },
  { year: 2022, round: "Stray", url: "https://cdnbbsr.s3waas.gov.in/s3e0f7a4d0ef9b84b83b693bbf3feb8e6e/uploads/2023/06/2023060633.pdf" },
];

const API = "http://localhost:8787/api/import/mcc";

const summary = [];
for (const src of SOURCES) {
  const t0 = Date.now();
  process.stdout.write(`[${src.year}/${src.round}] ${src.url.slice(-30)}…  `);
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(src),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    process.stdout.write(`${json.recordCount.toLocaleString("en-IN")} records, ${json.skippedCount} skipped, ${dt}s${json.fromCache ? " (cached)" : ""}\n`);
    summary.push({ year: src.year, round: src.round, count: json.recordCount, skipped: json.skippedCount, dt });
  } catch (err) {
    process.stdout.write(`FAILED: ${err.message}\n`);
    summary.push({ year: src.year, round: src.round, error: err.message });
  }
}

console.log("\n=== Summary ===");
const total = summary.reduce((a, r) => a + (r.count || 0), 0);
console.log(`Imported ${total.toLocaleString("en-IN")} records across ${summary.length} PDFs.`);
console.table(summary);
