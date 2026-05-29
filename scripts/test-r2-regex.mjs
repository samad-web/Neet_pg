const FULL_QUOTAS = ["All India","DNB Quota","Deemed University","Aligarh Muslim University","Banaras Hindu University","Delhi University","IP University","Jain Minority","Muslim Minority","NRI","Self-Financed Merit Seat","Armed Forces Medical"];
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const FULL_QUOTAS_RE = FULL_QUOTAS.map(reEsc).join("|");
const CAT_TOKEN = "Open|Reserve|General|OBC|SC|ST|EWS|BC|EW|GN";
const CAT_LOOKAHEAD = `(?=\\s+(?:${CAT_TOKEN}))`;
const PAREN_BLOCK = "\\([^)]{2,200}\\)";
const CONNECTOR = "(?:\\s*[/.,]\\s*(?:MS|MD|M\\.S\\.|M\\.D\\.)?\\s*)";
const COURSE_RE = "(?:" +
  "(?:M\\.D\\.|M\\.S\\.|M\\.Ch\\.|MD\\/MS)\\s*" + PAREN_BLOCK + "(?:" + CONNECTOR + PAREN_BLOCK + ")*" +
  "|(?:M\\.D\\.|M\\.S\\.)\\s+IN\\s+[A-Z][A-Z &.,/'-]{2,120}?" + CAT_LOOKAHEAD +
  "|(?:M\\.D\\.|M\\.S\\.)\\s+[A-Z][A-Za-z &.,/'-]{2,120}?" + CAT_LOOKAHEAD +
  "|\\(NBEMS(?:-DIPLOMA)?\\)\\s+[A-Z][A-Z &.,/()'-]{2,200}?" + CAT_LOOKAHEAD +
")";
const TAIL_RE = new RegExp(
  "(" + FULL_QUOTAS_RE + ")\\s+(.+?)\\s+(" + COURSE_RE + ")\\s+(" + CAT_TOKEN + ")\\s+(" + CAT_TOKEN + ")(\\s+PwD)?\\s+\\d+\\s+(Fresh Allotted\\s+in\\s+\\w+\\s+Round|Upgraded)",
  "g"
);

const sample = "16 23 All India LOKMANYA TILAK MEDICAL COLLEGE MUMBAI M.D. (GENERAL MEDICINE) Reported All India Seth Gordhandas Sunderdas Medical College, MUMBAI , Seth Gordhandas Sunderdas Medical College, Acharya Donde Marg Parel MUMBAI, Maharashtra, 400012 M.D. (GENERAL MEDICINE) Open General 1 Upgraded 17";

let m;
TAIL_RE.lastIndex = 0;
let count = 0;
while ((m = TAIL_RE.exec(sample))) {
  count++;
  console.log("MATCH:", m[1], "| college:", m[2].slice(0,80), "| course:", m[3], "| cat:", m[4], m[5], "| action:", m[7]);
}
console.log("Total matches:", count);
