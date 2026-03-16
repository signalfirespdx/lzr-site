
/**
 * Sveltia CMS preSave hook — zines collection
 *
 * If `preview_image` is blank and `pdf` is set, renders the cover cell
 * from the PDF using PDF.js and saves the result as a WebP data URL
 * into `preview_image`.
 *
 * Drop this script into your admin page after the Sveltia CMS script tag:
 *
 *   <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js"></script>
 *   <script src="zine-cover-hook.js"></script>
 */

const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs";
const PDFJS_WORKER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs";

const DPI = 200;
const SCALE = DPI / 72; // PDF points → pixels
const WEBP_QUALITY = 0.85;

// ---------------------------------------------------------------------------
// Rule lookup — mirrors zine_cover_single.ts
// ---------------------------------------------------------------------------

function ruleForFilename(filename) {
  const name = filename.toLowerCase().replace(/\(color\s+/, "(");

  if (name.includes("(1-sided 8pg mini)") || name.includes("(2-sided 8pg mini)"))
    return { page: 1, rows: 4, cols: 2, row: 1, col: 2, rotate: "cw" };
  if (name.includes("(1-sided 8pg-alt mini)"))
    return { page: 1, rows: 4, cols: 2, row: 3, col: 2, rotate: "cw" };
  if (name.includes("(1-sided 1pg)"))
    return { page: 1, rows: 1, cols: 1, row: 1, col: 1, rotate: "none" };
  if (name.includes("(1-sided quarter)"))
    return { page: 1, rows: 2, cols: 2, row: 1, col: 1, rotate: "none" };
  if (name.includes("(2-sided trifold short-side)"))
    return { page: 2, rows: 1, cols: 3, row: 1, col: 3, rotate: "none" };
  if (name.includes("(2-sided trifold)"))
    return { page: 1, rows: 1, cols: 3, row: 1, col: 3, rotate: "none" };
  if (name.includes("(trifold)"))
    return { page: 1, rows: 1, cols: 3, row: 1, col: 2, rotate: "none" };
  if (name.includes("(2-sided 16pg mini)"))
    return { page: 1, rows: 4, cols: 2, row: 2, col: 1, rotate: "ccw" };
  if (name.includes("(2-sided half)"))
    return { page: 1, rows: 1, cols: 2, row: 1, col: 2, rotate: "none" };
  if (name.includes("(2-sided 8pg up)"))
    return { page: 1, rows: 2, cols: 2, row: 2, col: 2, rotate: "none" };
  if (name.includes("(2-sided 8pg)"))
    return { page: 1, rows: 2, cols: 2, row: 1, col: 2, rotate: "none" };

  return null;
}

// ---------------------------------------------------------------------------
// PDF.js loader (loaded once on first use)
// ---------------------------------------------------------------------------

let pdfjsLib = null;

async function getPdfjsLib() {
  if (pdfjsLib) return pdfjsLib;
  const mod = await import(PDFJS_CDN);
  mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
  pdfjsLib = mod;
  return pdfjsLib;
}

// ---------------------------------------------------------------------------
// Core: fetch PDF, render page, crop + rotate, return WebP data URL
// ---------------------------------------------------------------------------

async function generateCoverWebp(pdfUrl, filename) {
  const rule = ruleForFilename(filename);
  if (!rule) {
    console.warn(`[zine-cover] No rule matched for "${filename}", skipping.`);
    return null;
  }

  const pdfjs = await getPdfjsLib();

  const response = await fetch(pdfUrl);
  const buffer = await response.arrayBuffer();

  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pageNum = Math.min(rule.page, pdf.numPages);
  const page = await pdf.getPage(pageNum);

  const viewport = page.getViewport({ scale: SCALE });

  // Render full page to an offscreen canvas
  const fullCanvas = new OffscreenCanvas(
    Math.round(viewport.width),
    Math.round(viewport.height),
  );
  const fullCtx = fullCanvas.getContext("2d");
  await page.render({ canvasContext: fullCtx, viewport }).promise;

  const fullW = fullCanvas.width;
  const fullH = fullCanvas.height;

  // Crop to the target cell
  const cellW = Math.floor(fullW / rule.cols);
  const cellH = Math.floor(fullH / rule.rows);
  const offX = Math.floor((rule.col - 1) * cellW);
  const offY = Math.floor((rule.row - 1) * cellH);

  // Apply rotation: swap dimensions for cw/ccw
  const isCw = rule.rotate === "cw";
  const isCcw = rule.rotate === "ccw";
  const isRotated = isCw || isCcw;
  const outW = isRotated ? cellH : cellW;
  const outH = isRotated ? cellW : cellH;

  const outCanvas = new OffscreenCanvas(outW, outH);
  const outCtx = outCanvas.getContext("2d");

  if (isCw) {
    outCtx.translate(outW, 0);
    outCtx.rotate(Math.PI / 2);
  } else if (isCcw) {
    outCtx.translate(0, outH);
    outCtx.rotate(-Math.PI / 2);
  }

  outCtx.drawImage(fullCanvas, offX, offY, cellW, cellH, 0, 0, cellW, cellH);

  const blob = await outCanvas.convertToBlob({ type: "image/webp", quality: WEBP_QUALITY });

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ---------------------------------------------------------------------------
// Sveltia CMS hook
// ---------------------------------------------------------------------------

CMS.registerEventListener({
  name: "preSave",
  handler: async ({ entry }) => {
    // Only run for the zines collection
    if (entry.get("collection") !== "zines") return;

    const data = entry.get("data");
    const pdfPath = data.get("pdf");
    const previewImage = data.get("preview_image");

    // Skip if no PDF set or preview_image already has a value
    if (!pdfPath || previewImage) return;

    const filename = pdfPath.split("/").pop();

    try {
      console.info(`[zine-cover] Generating cover for "${filename}"…`);
      const webpDataUrl = await generateCoverWebp(pdfPath, filename);
      if (!webpDataUrl) return;

      console.info(`[zine-cover] Cover generated, saving to preview_image.`);
      return data.set("preview_image", webpDataUrl);
    } catch (err) {
      console.error(`[zine-cover] Failed to generate cover:`, err);
      // Don't block the save — just skip the cover
    }
  },
});
