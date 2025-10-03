// src/utils/exportROIAdaptive.js
import { PDFDocument } from 'pdf-lib';

// --- Base URL builder that works in Vite/CRA/static ---
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

// --- OPTIONAL manual overrides (use ONLY if you know exact field names in the PDF) ---
// Example: if your template’s field for "hours saved" is literally named "Hours Saved per Year",
// set: overrides.hoursSaved = 'Hours Saved per Year';
const overrides = {
  // hoursSaved: 'Hours Saved per Year',
  // totalSavings: 'Annual Total Savings',
  // fteSaved: 'FTE Saved',
  // payback: 'Payback (months)',
  // laborSavings: 'Annual Labor Savings',
  // chargebackSavings: 'Chargeback Savings',
  // disputeSavings: 'Dispute Savings',
  // totalAnnualSavingsGross: 'Total Annual Savings (Gross)',
  // year1Cost: 'Year-1 Cost',
  // year1Net: 'Year-1 Net Savings',
  // ongoingNet: 'Ongoing Annual Net Savings',
  // analysis: 'ROI Analysis'
};

// --- Keyword rules used to auto-match your PDF field names ---
const FIELD_RULES = {
  hoursSaved:     ['hours', 'saved'],
  totalSavings:   ['total', 'savings'],
  fteSaved:       ['fte'],                    // sometimes "FTE", or "FTE equivalent"
  payback:        ['payback'],                // sometimes includes "(months)"
  laborSavings:   ['labor', 'savings'],
  chargebackSavings: ['chargeback', 'savings'],
  disputeSavings: ['dispute', 'savings'],
  totalAnnualSavingsGross: ['total', 'annual', 'savings'], // will still be overridden if you set it
  year1Cost:      ['year', 'cost'],           // often "Year-1 cost"
  year1Net:       ['year', 'net'],            // "Year-1 net savings"
  ongoingNet:     ['ongoing', 'net'],         // "Ongoing annual net savings"
  analysis:       ['analysis'],               // make this multiline in the PDF
};

// helper: currency format
const fmtMoney = (n) => `$${Math.round(n ?? 0).toLocaleString()}`;

// helper: quick check that fetched data is a real PDF
const assertPdfBytes = (buf, url) => {
  const sig = new Uint8Array(buf.slice(0, 5));
  const isPdf = sig[0] === 0x25 && sig[1] === 0x50 && sig[2] === 0x44 && sig[3] === 0x46 && sig[4] === 0x2D; // %PDF-
  if (!isPdf) throw new Error(`Template did not look like a PDF (no %PDF- header). URL: ${url}`);
};

// core: find a field by keywords from the list of existing names
const findByKeywords = (names, keywords) => {
  const lower = names.map(n => ({ raw: n, lc: n.toLowerCase() }));
  const want = keywords.map(k => k.toLowerCase());
  // Pick the first name that includes ALL keywords (order independent)
  const hit = lower.find(obj => want.every(k => obj.lc.includes(k)));
  return hit ? hit.raw : null;
};

// core: build a mapping from our logical keys -> actual field names in the PDF
const buildMapping = (allFieldNames) => {
  const map = {};
  Object.entries(FIELD_RULES).forEach(([key, words]) => {
    // manual override wins
    if (overrides[key]) {
      map[key] = overrides[key];
      return;
    }
    const match = findByKeywords(allFieldNames, words);
    if (match) map[key] = match;
  });
  return map;
};

/**
 * Fills your *existing* PDF template using the fields that actually exist inside the PDF.
 * Place the template at: public/templates/roi-template.pdf
 *
 * It auto-detects field names by keywords, and you can pin exact names via the `overrides` object above.
 */
export async function exportROIAdaptive(results, narrative) {
  if (!results) return;

  // 1) Load the template
  const templateUrl = buildPublicUrl('templates/Pallet-Ultima-ROI-Results.pdf'); // <-- your uploaded filename
  const res = await fetch(templateUrl, { cache: 'no-store' });
  if (!res.ok) {
    const preview = await res.text().catch(() => '');
    throw new Error(
      `Failed to load template (${res.status} ${res.statusText}). URL: ${templateUrl}\n` +
      `First 200 chars:\n${preview.slice(0, 200)}`
    );
  }
  const buf = await res.arrayBuffer();
  assertPdfBytes(buf, templateUrl);

  // 2) Parse the form + list existing fields
  const pdfDoc = await PDFDocument.load(buf);
  const form = pdfDoc.getForm();
  const fields = form.getFields();
  const existingNames = fields.map(f => f.getName());

  // 3) Build the mapping
  const MAP = buildMapping(existingNames);

  // 4) Report what matched / what didn’t (so you can spot typos)
  console.group('[ROI PDF] Field name mapping');
  Object.keys(FIELD_RULES).forEach(key => {
    if (MAP[key]) {
      console.log(`${key.padEnd(24)} → "${MAP[key]}"`);
    } else {
      console.warn(`${key.padEnd(24)} → (not found; will be skipped)`);
    }
  });
  console.groupEnd();

  // 5) Safe setter that only writes if field exists
  const setIf = (key, val) => {
    const name = MAP[key];
    if (!name) return false;
    try {
      form.getTextField(name).setText(String(val ?? ''));
      return true;
    } catch (e) {
      console.warn(`Could not set field "${name}" for key "${key}"`, e);
      return false;
    }
  };

  // 6) Fill values
  setIf('hoursSaved', results.annualHoursSaved?.toFixed?.(2));
  setIf('totalSavings', fmtMoney(results.totalAnnualSavings));
  setIf('fteSaved', results.fteSaved?.toFixed?.(2));
  setIf('payback', typeof results.paybackMonths === 'number' ? results.paybackMonths.toFixed(1) : 'N/A');

  setIf('laborSavings', fmtMoney(results.laborSavings));
  setIf('chargebackSavings', fmtMoney(results.chargebackSavings));
  setIf('disputeSavings', fmtMoney(results.disputeSavings));
  setIf('totalAnnualSavingsGross', fmtMoney(results.totalAnnualSavings));

  setIf('year1Cost', fmtMoney(results.year1Cost));
  setIf('year1Net', fmtMoney(results.year1Net));
  setIf('ongoingNet', fmtMoney(results.ongoingNet));

  setIf('analysis', narrative || '');

  // 7) Flatten (lock) and download
  form.flatten();
  const out = await pdfDoc.save();
  const blob = new Blob([out], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vmeasure-pallet-ultima-roi.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
