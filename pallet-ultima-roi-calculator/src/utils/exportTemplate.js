// utils/exportTemplate.js
import { PDFDocument } from 'pdf-lib';

export async function exportROIWithTemplate(results, narrative) {
  // 1. Load the template file
  const url = '/templates/roi-template.pdf'; // put the PDF in /public/templates
  const templateBytes = await fetch(url).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(templateBytes);

  const form = pdfDoc.getForm();

  // 2. Fill fields
  form.getTextField('hoursSaved').setText(results.annualHoursSaved.toFixed(2));
  form.getTextField('totalSavings').setText(`$${Math.round(results.totalAnnualSavings).toLocaleString()}`);
  form.getTextField('fteSaved').setText(results.fteSaved.toFixed(2));
  form.getTextField('payback').setText(
    typeof results.paybackMonths === 'number' ? results.paybackMonths.toFixed(1) : 'N/A'
  );

  form.getTextField('laborSavings').setText(`$${Math.round(results.laborSavings).toLocaleString()}`);
  form.getTextField('chargebackSavings').setText(`$${Math.round(results.chargebackSavings).toLocaleString()}`);
  form.getTextField('disputeSavings').setText(`$${Math.round(results.disputeSavings).toLocaleString()}`);
  form.getTextField('totalAnnualSavings').setText(`$${Math.round(results.totalAnnualSavings).toLocaleString()}`);

  form.getTextField('year1Cost').setText(`$${Math.round(results.year1Cost).toLocaleString()}`);
  form.getTextField('year1Net').setText(`$${Math.round(results.year1Net).toLocaleString()}`);
  form.getTextField('ongoingNet').setText(`$${Math.round(results.ongoingNet).toLocaleString()}`);

  // Analysis: join lines or pass multi-line text
  form.getTextField('analysis').setText(narrative);

  // Lock values
  form.flatten();

  // 3. Download
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'ROI-Results.pdf';
  link.click();
}
