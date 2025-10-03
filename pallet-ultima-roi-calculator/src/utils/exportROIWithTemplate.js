// src/utils/exportROIWithTemplate.js
import { PDFDocument } from 'pdf-lib';

// Build a public URL that works in Vite (import.meta.env.BASE_URL) and CRA (process.env.PUBLIC_URL),
// and falls back to root ("/").
const buildPublicUrl = (relPath) => {
  const viteBase =
    typeof import.meta !== 'undefined' &&
    import.meta &&
    import.meta.env &&
    import.meta.env.BASE_URL
      ? import.meta.env.BASE_URL
      : null;

  const craBase =
    typeof process !== 'undefined' &&
    process.env &&
    process.env.PUBLIC_URL
      ? process.env.PUBLIC_URL
      : null;

  const base = viteBase || craBase || '/';
  return (base.endsWith('/') ? base : base + '/') + String(relPath).replace(/^\/+/, '');
};

export async function exportROIWithTemplate(results, narrative) {
  if (!results) return;

  // 1) Make sure the file actually exists in public/templates/
  //    e.g. public/templates/pallet-ultima-roi-template.pdf
  const templateUrl = buildPublicUrl('templates/pallet-ultima-roi-template.pdf');

  // 2) Fetch the template
  const res = await fetch(templateUrl, { cache: 'no-store' });
  if (!res.ok) {
    const preview = await res.text().catch(() => '');
    throw new Error(
      `Failed to load template (${res.status} ${res.statusText}). URL: ${templateUrl}\n` +
      `First 200 chars of response:\n${preview.slice(0, 200)}`
    );
  }

  // Optional: quick sanity check for %PDF- header to catch HTML/404 pages
  const buf = await res.arrayBuffer();
  const header = new Uint8Array(buf.slice(0, 5));
  const isPDF = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46 && header[4] === 0x2D;
  if (!isPDF) {
    throw new Error(`Template did not look like a PDF (no %PDF- header). URL: ${templateUrl}`);
  }

  // 3) Load and fill
  const pdfDoc = await PDFDocument.load(buf);
  const form = pdfDoc.getForm();

  const m = (n) => `$${Math.round(n ?? 0).toLocaleString()}`;

  // Helper to surface missing field names clearly
  const set = (name, value) => {
    const field = form.getFieldMaybe ? form.getFieldMaybe(name) : null;
    // pdf-lib doesn’t have getFieldMaybe; wrap in try/catch instead:
    try {
      form.getTextField(name).setText(String(value ?? ''));
    } catch (e) {
      console.error(`Missing text field "${name}" in template.`, e);
      // You can throw to fail hard:
      // throw new Error(`Missing text field "${name}" in template.`);
    }
  };

  // Top tiles
  set('hoursSaved', results.annualHoursSaved.toFixed(2));
  set('totalSavings', m(results.totalAnnualSavings));
  set('fteSaved', results.fteSaved.toFixed(2));
  set('payback', typeof results.paybackMonths === 'number' ? results.paybackMonths.toFixed(1) : 'N/A');

  // Savings breakdown
  set('laborSavings', m(results.laborSavings));
  set('chargebackSavings', m(results.chargebackSavings));
  set('disputeSavings', m(results.disputeSavings));
  set('totalAnnualSavingsGross', m(results.totalAnnualSavings));

  // Financial summary
  set('year1Cost', m(results.year1Cost));
  set('year1Net', m(results.year1Net));
  set('ongoingNet', m(results.ongoingNet));

  // Analysis (make sure this field is multiline in the PDF)
  set('analysis', narrative || '');

  // 4) Flatten and download
  form.flatten();

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vmeasure-pallet-ultima-roi.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
