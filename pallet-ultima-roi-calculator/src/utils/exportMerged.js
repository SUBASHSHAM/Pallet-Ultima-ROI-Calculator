// src/utils/exportMerged.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PDFDocument } from 'pdf-lib';

/** Shared visual constants to keep format consistent */
const THEME = {
  pageMarginsPt: { left: 40, right: 40, top: 40 },
  brandHeader: [8, 119, 196],     // #0877c4
  altRow: [245, 245, 245],        // light gray
  gridLine: [200, 200, 200],
  bodyFontSize: 10,
  h1: 20,
  h2: 14,
};

/** Safeguard for symbols the default font can't render */
function sanitize(text = '') {
  return String(text).replaceAll('≤', '<=').replaceAll('≥', '>=');
}

/** Build the Results PDF page as bytes, matching target size/orientation */
async function buildResultsPdfBytes({ inputs, results, narrative, widthPt, heightPt }) {
  // Determine orientation based on template page
  const orientation = widthPt >= heightPt ? 'l' : 'p';

  // jsPDF in points, custom size to match template page exactly
  const doc = new jsPDF({
    unit: 'pt',
    format: [widthPt, heightPt],
    orientation,
  });

  const { pageMarginsPt, brandHeader, altRow, gridLine, bodyFontSize, h1, h2 } = THEME;
  const x = pageMarginsPt.left;
  let y = pageMarginsPt.top;

  const timestamp = new Date().toLocaleString();

  // Header
  doc.setFontSize(h1);
  doc.text('vMeasure ROI Calculator Results', x, y);
  y += 18;
  doc.setFontSize(10);
  doc.text(`Generated: ${timestamp}`, x, y);
  y += 24;

  // Section Title
  doc.setFontSize(h2);
  doc.text('Results Summary', x, y);
  y += 12;

  const fmtMoney = (n) => `$${Math.round(n ?? 0).toLocaleString()}`;
  const fmtNum = (n, d = 2) => (typeof n === 'number' ? n.toFixed(d) : '—');

  const resultsData = [
    ['Annual Hours Saved', fmtNum(results?.annualHoursSaved)],
    ['FTE Equivalent Saved', fmtNum(results?.fteSaved)],
    ['Annual Labor Savings', fmtMoney(results?.laborSavings)],
    ['Chargeback Savings', fmtMoney(results?.chargebackSavings)],
    ['Dispute Savings', fmtMoney(results?.disputeSavings)],
    ['Total Annual Savings', fmtMoney(results?.totalAnnualSavings)],
    ['Year-1 Cost', fmtMoney(results?.year1Cost)],
    ['Year-1 Net Savings', fmtMoney(results?.year1Net)],
    ['Ongoing Net Savings', fmtMoney(results?.ongoingNet)],
    [
      'Payback (Months)',
      typeof results?.paybackMonths === 'number' ? results.paybackMonths.toFixed(1) : 'N/A',
    ],
  ];

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: resultsData,
    theme: 'grid',
    margin: { left: x, right: pageMarginsPt.right },
    styles: { fontSize: bodyFontSize, lineColor: gridLine, lineWidth: 0.5, cellPadding: 6 },
    headStyles: { fillColor: brandHeader, textColor: 255 },
    alternateRowStyles: { fillColor: altRow },
    tableWidth: 'auto',
  });

  // Analysis block (same page if space)
  const afterTableY = (doc.lastAutoTable?.finalY ?? y) + 20;
  doc.setFontSize(h2);
  doc.text('Analysis', x, afterTableY);
  doc.setFontSize(10);

  const safeNarrative = sanitize(narrative || 'No analysis available');
  const contentWidth = widthPt - (pageMarginsPt.left + pageMarginsPt.right);
  const wrapped = doc.splitTextToSize(safeNarrative, contentWidth);
  doc.text(wrapped, x, afterTableY + 14);

  // Return bytes
  return doc.output('arraybuffer');
}

/**
 * Keep first 3 pages of template, then append a freshly generated results page.
 *
 * @param {Object} params
 * @param {Object} params.inputs
 * @param {Object} params.results
 * @param {string} params.narrative
 * @param {string|ArrayBuffer|Uint8Array} params.templateSrc - URL or raw bytes for your standard PDF
 * @param {string} [params.downloadName='vmeasure-roi-report.pdf']
 */
export async function exportMergedResultsPDFSameFormat({
  inputs,
  results,
  narrative,
  templateSrc,
  downloadName = 'vmeasure-roi-report.pdf',
}) {
  if (!results) return;

  // Load template bytes
  let tplBytes;
  if (typeof templateSrc === 'string') {
    const resp = await fetch(templateSrc);
    tplBytes = await resp.arrayBuffer();
  } else {
    tplBytes = templateSrc;
  }

  const tplPdf = await PDFDocument.load(tplBytes);

  // Determine page size from page 4 if present, else from page 1
  const sizeFromIndex = Math.min(3, tplPdf.getPageCount() - 1); // 0-based; fall back gracefully
  const refPage = tplPdf.getPage(sizeFromIndex);
  const { width: widthPt, height: heightPt } = refPage.getSize();

  // Build the results page with the exact same size/orientation
  const resultsBytes = await buildResultsPdfBytes({ inputs, results, narrative, widthPt, heightPt });

  // Prepare merge: copy pages 1–3 (0,1,2), then append results
  const outPdf = await PDFDocument.create();

  const keepCount = Math.min(3, tplPdf.getPageCount());
  if (keepCount > 0) {
    const firstThree = await outPdf.copyPages(
      tplPdf,
      Array.from({ length: keepCount }, (_, idx) => idx) // [0], [0,1], or [0,1,2]
    );
    firstThree.forEach((p) => outPdf.addPage(p));
  }

  const resPdf = await PDFDocument.load(resultsBytes);
  const resPages = await outPdf.copyPages(
    resPdf,
    Array.from({ length: resPdf.getPageCount() }, (_, i) => i)
  );
  resPages.forEach((p) => outPdf.addPage(p));

  // Save and download
  const mergedBytes = await outPdf.save();
  const blob = new Blob([mergedBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = downloadName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
