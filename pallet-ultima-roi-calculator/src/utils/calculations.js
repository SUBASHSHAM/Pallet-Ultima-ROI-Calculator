export const calculateROI = (inputs) => {
  const {
    palletsPerDay,
    workdaysPerYear,
    manualCaptureTime,
    automatedCaptureTime,
    laborRate,
    annualChargebacks,
    avgChargebackCost,
    chargebackIncidence,
    disputesPerMonth,
    useIncidenceEstimator,
    hoursPerDispute,
    shareContested,
    disputeReduction,
    chargebackReduction,
    year1Cost,
    ongoingCost
  } = inputs;

  // Convert string inputs to numbers
  const palletsPerDayNum = parseFloat(palletsPerDay) || 0;
  const workdaysPerYearNum = parseFloat(workdaysPerYear) || 0;
  const year1CostNum = parseFloat(year1Cost) || 0;
  const ongoingCostNum = parseFloat(ongoingCost) || 0;
  const annualChargebacksNum = parseFloat(annualChargebacks) || 0;
  const disputesPerMonthNum = parseFloat(disputesPerMonth) || 0;

  // G. Volume & time
  const palletsYear = palletsPerDayNum * workdaysPerYearNum;
  const hoursSavedPerPallet = Math.max((manualCaptureTime - automatedCaptureTime) / 3600, 0);
  const annualHoursSaved = palletsYear * hoursSavedPerPallet;

  // H. Chargeback baseline & savings
  let baselineChargebacks;
  if (annualChargebacksNum > 0) {
    baselineChargebacks = annualChargebacksNum;
  } else {
    baselineChargebacks = palletsYear * (chargebackIncidence / 100) * avgChargebackCost;
  }
  const chargebackSavings = baselineChargebacks * (chargebackReduction / 100);

  // I. Dispute workload & savings
  const monthlyPallets = palletsYear / 12;
  let disputesPerMonthUsed;
  
  if (disputesPerMonthNum > 0) {
    disputesPerMonthUsed = disputesPerMonthNum;
  } else if (useIncidenceEstimator) {
    disputesPerMonthUsed = (palletsYear * (chargebackIncidence / 100) * (shareContested / 100)) / 12;
  } else {
    disputesPerMonthUsed = monthlyPallets * 0.01;
  }
  
  const baselineDisputeHoursYear = disputesPerMonthUsed * 12 * hoursPerDispute;
  const disputeSavings = baselineDisputeHoursYear * laborRate * (disputeReduction / 100);

  // J. Labor savings
  const laborSavings = annualHoursSaved * laborRate;
  const fteSaved = annualHoursSaved / 2080;

  // K. Totals, costs, ROI
  const totalAnnualSavings = laborSavings + chargebackSavings + disputeSavings;
  const paybackMonths = totalAnnualSavings > 0 ? year1CostNum / (totalAnnualSavings / 12) : null;
  const year1Net = totalAnnualSavings - year1CostNum;
  const ongoingNet = totalAnnualSavings - ongoingCostNum;

  return {
    annualHoursSaved,
    laborSavings,
    chargebackSavings,
    disputeSavings,
    totalAnnualSavings,
    year1Cost: year1CostNum,
    ongoingCost: ongoingCostNum,
    paybackMonths,
    year1Net,
    ongoingNet,
    fteSaved,
    baselineChargebacks,
    disputesPerMonthUsed
  };
};