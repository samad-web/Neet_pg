/* Child process: PDF parse runs in a separate node process so the main
   server's event loop stays responsive AND a pdfjs crash can't take down
   the API. Communicates via IPC. */

import { PDFParse } from "pdf-parse";

process.on("message", async ({ data }) => {
  try {
    const parser = new PDFParse({ data: new Uint8Array(data) });
    const result = await parser.getText();
    await parser.destroy().catch(() => {});
    process.send({ ok: true, text: result.text, pages: result.total });
    // Exit cleanly so the parent doesn't have to terminate us — avoids the
    // worker_threads + pdfjs segfault we hit when terminate() raced internal
    // pdfjs cleanup. Letting the child finish naturally is more robust.
    process.exit(0);
  } catch (err) {
    process.send({ ok: false, error: err.message || String(err) });
    process.exit(1);
  }
});
