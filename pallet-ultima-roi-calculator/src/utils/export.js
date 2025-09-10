import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (inputs, results, narrative) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();
  
  // Header
  doc.setFontSize(20);
  doc.text('vMeasure ROI Calculator Results', 20, 20);
  doc.setFontSize(10);
  doc.text(`Generated: ${timestamp}`, 20, 30);
  
  // Results Summary
  doc.setFontSize(14);
  doc.text('Results Summary', 20, 45);
  
  const resultsData = [
    ['Annual Hours Saved', results.annualHoursSaved.toFixed(2)],
    ['FTE Equivalent Saved', results.fteSaved.toFixed(2)],
    ['Annual Labor Savings', `$${Math.round(results.laborSavings).toLocaleString()}`],
    ['Chargeback Savings', `$${Math.round(results.chargebackSavings).toLocaleString()}`],
    ['Dispute Savings', `$${Math.round(results.disputeSavings).toLocaleString()}`],
    ['Total Annual Savings', `$${Math.round(results.totalAnnualSavings).toLocaleString()}`],
    ['Year-1 Cost', `$${Math.round(results.year1Cost).toLocaleString()}`],
    ['Year-1 Net Savings', `$${Math.round(results.year1Net).toLocaleString()}`],
    ['Ongoing Net Savings', `$${Math.round(results.ongoingNet).toLocaleString()}`],
    ['Payback (Months)', results.paybackMonths ? results.paybackMonths.toFixed(1) : 'N/A']
  ];
  
  doc.autoTable({
    startY: 50,
    head: [['Metric', 'Value']],
    body: resultsData,
    theme: 'grid'
  });
  
  // Analysis
  if (narrative) {
    doc.setFontSize(14);
    doc.text('Analysis', 20, doc.lastAutoTable.finalY + 20);
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(narrative, 170);
    doc.text(splitText, 20, doc.lastAutoTable.finalY + 30);
  }
  
  // Input Parameters (new page)
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Input Parameters', 20, 20);
  
  const inputsData = [
    ['Pallets per Day', inputs.palletsPerDay || 'Not specified'],
    ['Workdays per Year', inputs.workdaysPerYear || 'Not specified'],
    ['Manual Capture Time (sec)', inputs.manualCaptureTime],
    ['Automated Capture Time (sec)', inputs.automatedCaptureTime],
    ['Labor Rate ($/hour)', `$${inputs.laborRate}`],
    ['Annual Chargebacks ($)', inputs.annualChargebacks || 'Using estimator'],
    ['Avg Chargeback Cost ($)', `$${inputs.avgChargebackCost}`],
    ['Chargeback Incidence (%)', `${inputs.chargebackIncidence}%`],
    ['Disputes per Month', inputs.disputesPerMonth || 'Auto-estimated'],
    ['Hours per Dispute', inputs.hoursPerDispute],
    ['Share Contested (%)', `${inputs.shareContested}%`],
    ['Dispute Reduction (%)', `${inputs.disputeReduction}%`],
    ['Chargeback Reduction (%)', `${inputs.chargebackReduction}%`],
    ['Year-1 Cost ($)', inputs.year1Cost || 'Not specified'],
    ['Ongoing Cost ($)', inputs.ongoingCost || 'Not specified']
  ];
  
  doc.autoTable({
    startY: 30,
    head: [['Parameter', 'Value']],
    body: inputsData,
    theme: 'grid'
  });
  
  doc.save('vmeasure-roi-calculation.pdf');
};

export const exportToCSV = (inputs, results, narrative) => {
  const timestamp = new Date().toLocaleString();
  
  const csvData = [
    ['vMeasure ROI Calculator Results'],
    [`Generated: ${timestamp}`],
    [''],
    ['Results Summary'],
    ['Metric', 'Value'],
    ['Annual Hours Saved', results.annualHoursSaved.toFixed(2)],
    ['FTE Equivalent Saved', results.fteSaved.toFixed(2)],
    ['Annual Labor Savings', Math.round(results.laborSavings)],
    ['Chargeback Savings', Math.round(results.chargebackSavings)],
    ['Dispute Savings', Math.round(results.disputeSavings)],
    ['Total Annual Savings', Math.round(results.totalAnnualSavings)],
    ['Year-1 Cost', Math.round(results.year1Cost)],
    ['Year-1 Net Savings', Math.round(results.year1Net)],
    ['Ongoing Net Savings', Math.round(results.ongoingNet)],
    ['Payback (Months)', results.paybackMonths ? results.paybackMonths.toFixed(1) : 'N/A'],
    [''],
    ['Analysis'],
    [narrative || 'No analysis available'],
    [''],
    ['Input Parameters'],
    ['Parameter', 'Value'],
    ['Pallets per Day', inputs.palletsPerDay || 'Not specified'],
    ['Workdays per Year', inputs.workdaysPerYear || 'Not specified'],
    ['Manual Capture Time (sec)', inputs.manualCaptureTime],
    ['Automated Capture Time (sec)', inputs.automatedCaptureTime],
    ['Labor Rate ($/hour)', inputs.laborRate],
    ['Annual Chargebacks ($)', inputs.annualChargebacks || 'Using estimator'],
    ['Avg Chargeback Cost ($)', inputs.avgChargebackCost],
    ['Chargeback Incidence (%)', inputs.chargebackIncidence],
    ['Disputes per Month', inputs.disputesPerMonth || 'Auto-estimated'],
    ['Hours per Dispute', inputs.hoursPerDispute],
    ['Share Contested (%)', inputs.shareContested],
    ['Dispute Reduction (%)', inputs.disputeReduction],
    ['Chargeback Reduction (%)', inputs.chargebackReduction],
    ['Year-1 Cost ($)', inputs.year1Cost || 'Not specified'],
    ['Ongoing Cost ($)', inputs.ongoingCost || 'Not specified']
  ];
  
  const csvContent = csvData.map(row => 
    Array.isArray(row) ? row.map(cell => `"${cell}"`).join(',') : `"${row}"`
  ).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'vmeasure-roi-calculation.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const emailResults = (inputs, results, narrative, email, name) => {
  // In a real application, this would send data to a backend service
  // For now, we'll simulate the email functionality
  const subject = 'Your vMeasure ROI Calculator Results';
  const body = `Hi ${name},\n\nHere are your ROI calculation results:\n\nTotal Annual Savings: $${Math.round(results.totalAnnualSavings).toLocaleString()}\nYear-1 Net Savings: $${Math.round(results.year1Net).toLocaleString()}\nPayback Period: ${results.paybackMonths ? results.paybackMonths.toFixed(1) + ' months' : 'N/A'}\n\nAnalysis: ${narrative}\n\nThank you for using the vMeasure ROI Calculator!`;
  
  // Create a mailto link as a fallback
  const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
  
  alert(`Results would be sent to ${email}. For now, your default email client will open with the results.`);
};