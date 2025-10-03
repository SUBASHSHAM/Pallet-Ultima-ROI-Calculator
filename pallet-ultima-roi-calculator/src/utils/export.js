import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/** Build-a-PDF (generic) — you can keep this alongside the template-based export */
export const exportToPDF = (inputs, results, narrative) => {
  if (!results) return;

  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  doc.setFontSize(20);
  doc.text('vMeasure ROI Calculator Results', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${timestamp}`, 20, 30);

  doc.setFontSize(14);
  doc.text('Results Summary', 20, 45);

  const fmt = (n) => `$${Math.round(n ?? 0).toLocaleString()}`;
  const resultsData = [
    ['Annual Hours Saved', results.annualHoursSaved?.toFixed?.(2) ?? '—'],
    ['FTE Equivalent Saved', results.fteSaved?.toFixed?.(2) ?? '—'],
    ['Annual Labor Savings', fmt(results.laborSavings)],
    ['Chargeback Savings', fmt(results.chargebackSavings)],
    ['Dispute Savings', fmt(results.disputeSavings)],
    ['Total Annual Savings', fmt(results.totalAnnualSavings)],
    ['Year-1 Cost', fmt(results.year1Cost)],
    ['Year-1 Net Savings', fmt(results.year1Net)],
    ['Ongoing Net Savings', fmt(results.ongoingNet)],
    ['Payback (Months)', typeof results.paybackMonths === 'number' ? results.paybackMonths.toFixed(1) : 'N/A'],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Metric', 'Value']],
    body: resultsData,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [8, 119, 196] },
  });

  const afterY = doc.lastAutoTable?.finalY ?? 50;
  if (narrative) {
    let nextY = afterY + 20;
    const pageH = doc.internal.pageSize.getHeight();
    if (nextY > pageH - 40) {
      doc.addPage(); nextY = 20;
    }
    doc.setFontSize(14);
    doc.text('Analysis', 20, nextY);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(narrative, 170);
    doc.text(lines, 20, nextY + 10);
  }

  doc.addPage();
  doc.setFontSize(14);
  doc.text('Input Parameters', 20, 20);

  const nv = (v, fb = 'Not specified') => (v ?? v === 0 ? v : fb);
  const inputsData = [
    ['Pallets per Day', nv(inputs.palletsPerDay)],
    ['Workdays per Year', nv(inputs.workdaysPerYear)],
    ['Manual Capture Time (sec)', nv(inputs.manualCaptureTime)],
    ['Automated Capture Time (sec)', nv(inputs.automatedCaptureTime)],
    ['Labor Rate ($/hour)', nv(`$${inputs.laborRate}`)],
    ['Annual Chargebacks ($)', nv(inputs.annualChargebacks, 'Using estimator')],
    ['Avg Chargeback Cost ($)', nv(`$${inputs.avgChargebackCost}`)],
    ['Chargeback Incidence (%)', nv(`${inputs.chargebackIncidence}%`)],
    ['Disputes per Month', nv(inputs.disputesPerMonth, 'Auto-estimated')],
    ['Hours per Dispute', nv(inputs.hoursPerDispute)],
    ['Share Contested (%)', nv(`${inputs.shareContested}%`)],
    ['Dispute Reduction (%)', nv(`${inputs.disputeReduction}%`)],
    ['Chargeback Reduction (%)', nv(`${inputs.chargebackReduction}%`)],
    ['Year-1 Cost ($)', nv(inputs.year1Cost)],
    ['Ongoing Cost ($)', nv(inputs.ongoingCost)],
  ];

  autoTable(doc, {
    startY: 30,
    head: [['Parameter', 'Value']],
    body: inputsData,
    theme: 'grid',
    styles: { fontSize: 10 },
  });

  doc.save('vmeasure-roi-generic.pdf');
};

/** CSV export (unchanged) */
export const exportToCSV = (inputs, results, narrative) => {
  if (!results) return;

  const timestamp = new Date().toLocaleString();
  const rows = [
    ['vMeasure ROI Calculator Results'],
    [`Generated: ${timestamp}`],
    [''],
    ['Results Summary'],
    ['Metric', 'Value'],
    ['Annual Hours Saved', results.annualHoursSaved?.toFixed?.(2) ?? '—'],
    ['FTE Equivalent Saved', results.fteSaved?.toFixed?.(2) ?? '—'],
    ['Annual Labor Savings', Math.round(results.laborSavings ?? 0)],
    ['Chargeback Savings', Math.round(results.chargebackSavings ?? 0)],
    ['Dispute Savings', Math.round(results.disputeSavings ?? 0)],
    ['Total Annual Savings', Math.round(results.totalAnnualSavings ?? 0)],
    ['Year-1 Cost', Math.round(results.year1Cost ?? 0)],
    ['Year-1 Net Savings', Math.round(results.year1Net ?? 0)],
    ['Ongoing Net Savings', Math.round(results.ongoingNet ?? 0)],
    ['Payback (Months)', typeof results.paybackMonths === 'number' ? results.paybackMonths.toFixed(1) : 'N/A'],
    [''],
    ['Analysis'],
    [narrative || 'No analysis available'],
    [''],
    ['Input Parameters'],
    ['Parameter', 'Value'],
    ['Pallets per Day', inputs.palletsPerDay ?? 'Not specified'],
    ['Workdays per Year', inputs.workdaysPerYear ?? 'Not specified'],
    ['Manual Capture Time (sec)', inputs.manualCaptureTime ?? 'Not specified'],
    ['Automated Capture Time (sec)', inputs.automatedCaptureTime ?? 'Not specified'],
    ['Labor Rate ($/hour)', inputs.laborRate ?? 'Not specified'],
    ['Annual Chargebacks ($)', inputs.annualChargebacks ?? 'Using estimator'],
    ['Avg Chargeback Cost ($)', inputs.avgChargebackCost ?? 'Not specified'],
    ['Chargeback Incidence (%)', inputs.chargebackIncidence ?? 'Not specified'],
    ['Disputes per Month', inputs.disputesPerMonth ?? 'Auto-estimated'],
    ['Hours per Dispute', inputs.hoursPerDispute ?? 'Not specified'],
    ['Share Contested (%)', inputs.shareContested ?? 'Not specified'],
    ['Dispute Reduction (%)', inputs.disputeReduction ?? 'Not specified'],
    ['Chargeback Reduction (%)', inputs.chargebackReduction ?? 'Not specified'],
    ['Year-1 Cost ($)', inputs.year1Cost ?? 'Not specified'],
    ['Ongoing Cost ($)', inputs.ongoingCost ?? 'Not specified'],
  ];

  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = rows.map(r => r.map(esc).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vmeasure-roi.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/** Mailto fallback (unchanged) */
export const emailResults = (inputs, results, narrative, email, name) => {
  if (!email) return;

  const subject = 'Your vMeasure ROI Calculator Results';
  const body = `Hi ${name || ''},

Here are your ROI calculation results:

Total Annual Savings: $${Math.round(results?.totalAnnualSavings ?? 0).toLocaleString()}
Year-1 Net Savings: $${Math.round(results?.year1Net ?? 0).toLocaleString()}
Payback Period: ${typeof results?.paybackMonths === 'number' ? results.paybackMonths.toFixed(1) + ' months' : 'N/A'}

Analysis:
${narrative || 'N/A'}

Thank you for using the vMeasure ROI Calculator!`;

  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto);
  alert(`Results would be sent to ${email}. Your default email client is opening with the results.`);
};
