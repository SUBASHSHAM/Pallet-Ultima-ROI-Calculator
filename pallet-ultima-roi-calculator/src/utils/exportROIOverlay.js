// src/utils/exportROIOverlay.js
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Toggle which source to try first: "asset" (src/assets) or "public" (public/)
const PREFERRED = "asset"; // change to "public" if you want

// Build a public URL (works with Vite BASE_URL / CRA PUBLIC_URL)
const buildPublicUrl = (relPath) => {
  const viteBase =
    typeof import.meta !== 'undefined' &&
    import.meta?.env?.BASE_URL
      ? import.meta.env.BASE_URL
      : null;

  const craBase =
    typeof process !== 'undefined' &&
    process.env?.PUBLIC_URL
      ? process.env.PUBLIC_URL
      : null;

  const base = viteBase || craBase || '/';
  return (base.endsWith('/') ? base : base + '/') + String(relPath).replace(/^\/+/, '');
};

// ✅ Sanitize characters WinAnsi can’t encode
const sanitizeForWinAnsi = (s) =>
  String(s ?? '')
    .replace(/\u2264/g, '<=')  // ≤
    .replace(/\u2265/g, '>=')  // ≥
    .replace(/\u2014/g, '-')   // — em dash
    .replace(/\u2013/g, '-')   // – en dash
    .replace(/[\u2018\u2019]/g, "'") // curly single quotes
    .replace(/[\u201C\u201D]/g, '"'); // curly double quotes

const fmtMoney = (n) => `$${Math.round(n ?? 0).toLocaleString()}`;

function wrapText(text, maxCharsPerLine = 75) {
  const words = sanitizeForWinAnsi(text).split(/\s+/);
  let line = '';
  const out = [];
  for (const w of words) {
    const next = (line ? line + ' ' : '') + w;
    if (next.length > maxCharsPerLine) {
      if (line) out.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out;
}

// ensure fetched bytes look like a PDF
const assertPdfBytes = (buf, url) => {
  const sig = new Uint8Array(buf.slice(0, 5));
  const ok = sig[0] === 0x25 && sig[1] === 0x50 && sig[2] === 0x44 && sig[3] === 0x46 && sig[4] === 0x2D; // %PDF-
  if (!ok) throw new Error(`Not a PDF (no %PDF- header): ${url}`);
};

// Try load from asset or public, return {url, bytes}
async function loadTemplateBytes() {
  const attempts = [];

  // A) asset URL (requires file at src/assets/roi-template.pdf)
  const assetUrl = new URL('../assets/Pallet-Ultima-ROI-Results.pdf', import.meta.url).href;
  const publicUrl = buildPublicUrl('templates/Pallet-Ultima-ROI-Results.pdf');

  const order = PREFERRED === 'public' ? [publicUrl, assetUrl] : [assetUrl, publicUrl];

  for (const url of order) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {
        attempts.push(`${url} → ${res.status} ${res.statusText}`);
        continue;
      }
      const bytes = await res.arrayBuffer();
      assertPdfBytes(bytes, url);
      return { url, bytes };
    } catch (e) {
      attempts.push(`${url} → ${e.message}`);
    }
  }
  throw new Error(
    'Failed to load ROI template PDF.\nTried:\n- ' + attempts.join('\n- ')
    + '\nFix: Ensure the file exists at src/assets/Pallet-Ultima-ROI-Results.pdf or public/templates/Pallet-Ultima-ROI-Results.pdf and that the URL opens directly in the browser.'
  );
}

/**
 * Overlay values onto a static template PDF.
 * Place the template at either:
 *  - src/assets/roi-template.pdf  (preferred with bundlers)
 *  - public/templates/roi-template.pdf
 */
export async function exportROIOverlay(results, narrative) {
  if (!results) return;

  // 1) Load template reliably
  const { url: templateUsed, bytes } = await loadTemplateBytes();
  console.info('[ROI PDF] Using template:', templateUsed);

  // 2) Open + fonts
  const pdfDoc = await PDFDocument.load(bytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 3) Page & positions
  const page = pdfDoc.getPages()[0];
  const { height } = page.getSize();

  // Tweak these once to align perfectly with your design
  const POS = {
    hoursSaved: { x: 80,  y: height - 150, size: 14, bold: true },
    totalSavings:{ x: 300, y: height - 150, size: 14, bold: true },
    fteSaved:    { x: 80,  y: height - 210, size: 14, bold: true },
    payback:     { x: 300, y: height - 210, size: 14, bold: true },

    laborSavings:            { x: 440, y: height - 320, size: 12 },
    chargebackSavings:       { x: 440, y: height - 355, size: 12 },
    disputeSavings:          { x: 440, y: height - 390, size: 12 },
    totalAnnualSavingsGross: { x: 440, y: height - 430, size: 12, bold: true },

    year1Cost:   { x: 440, y: height - 485, size: 12, color: rgb(0.8, 0, 0) },
    year1Net:    { x: 440, y: height - 520, size: 12, color: rgb(0, 0.5, 0) },
    ongoingNet:  { x: 440, y: height - 555, size: 12, color: rgb(0, 0.5, 0) },

    analysisStart: { x: 72, y: height - 640, size: 10, lineGap: 14, widthChars: 95 },
  };

  const draw = (text, cfg) => {
    if (text == null) return;
    page.drawText(sanitizeForWinAnsi(text), {
      x: cfg.x,
      y: cfg.y,
      size: cfg.size ?? 11,
      font: cfg.bold ? fontBold : font,
      color: cfg.color ?? rgb(0, 0, 0),
    });
  };

  // 4) Draw values
  draw(results.annualHoursSaved.toFixed(2), POS.hoursSaved);
  draw(fmtMoney(results.totalAnnualSavings), POS.totalSavings);
  draw(results.fteSaved.toFixed(2), POS.fteSaved);
  draw(typeof results.paybackMonths === 'number' ? results.paybackMonths.toFixed(1) : 'N/A', POS.payback);

  draw(fmtMoney(results.laborSavings), POS.laborSavings);
  draw(fmtMoney(results.chargebackSavings), POS.chargebackSavings);
  draw(fmtMoney(results.disputeSavings), POS.disputeSavings);
  draw(fmtMoney(results.totalAnnualSavings), POS.totalAnnualSavingsGross);

  draw(fmtMoney(results.year1Cost), POS.year1Cost);
  draw(fmtMoney(results.year1Net), POS.year1Net);
  draw(fmtMoney(results.ongoingNet), POS.ongoingNet);

  const lines = wrapText(narrative || '', POS.analysisStart.widthChars);
  let y = POS.analysisStart.y;
  for (const line of lines) {
    draw(line, { ...POS.analysisStart, y });
    y -= POS.analysisStart.lineGap;
  }

  // 5) Save & download
  const out = await pdfDoc.save();
  const blob = new Blob([out], { type: 'application/pdf' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'vmeasure-pallet-ultima-roi.pdf';
  a.click();
  URL.revokeObjectURL(downloadUrl);
}
