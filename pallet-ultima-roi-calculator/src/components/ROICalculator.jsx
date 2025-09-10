import React, { useState, useEffect } from 'react';
import InputSection from './InputSection';
import ResultsPanel from './ResultsPanel';
import { calculateROI } from '../utils/calculations';
import { exportToPDF, exportToCSV, emailResults } from '../utils/export';

const ROICalculator = () => {
  const [inputs, setInputs] = useState({
    palletsPerDay: '',
    workdaysPerYear: '',
    manualCaptureTime: 300,
    automatedCaptureTime: 5,
    laborRate: 22,
    annualChargebacks: '',
    avgChargebackCost: 125,
    chargebackIncidence: 6,
    disputesPerMonth: '',
    useIncidenceEstimator: false,
    hoursPerDispute: 2.0,
    shareContested: 60,
    disputeReduction: 65,
    chargebackReduction: 75,
    year1Cost: '',
    ongoingCost: ''
  });

  const [results, setResults] = useState(null);
  const [narrative, setNarrative] = useState('');

  useEffect(() => {
    if (inputs.palletsPerDay && inputs.workdaysPerYear) {
      const calculatedResults = calculateROI(inputs);
      setResults(calculatedResults);
      setNarrative(generateNarrative(calculatedResults));
    } else {
      setResults(null);
      setNarrative('');
    }
  }, [inputs]);

  const generateNarrative = (results) => {
    let text = [];
    
    if (results.paybackMonths <= 3) {
      text.push('Payback ≤ 3 months—clears in Q1.');
    } else if (results.paybackMonths <= 6) {
      text.push('Mid-year payback.');
    } else if (results.paybackMonths > 6) {
      text.push('H2 payback—raise chargeback reduction or revisit Year-1 cost.');
    }

    if (results.year1Net > 0) {
      text.push(`Year-1 net positive by $${results.year1Net.toLocaleString()}.`);
    } else {
      text.push('Year-1 not net positive—tune average $ per chargeback and reduction.');
    }

    if (results.ongoingNet > 0) {
      text.push(`From Year-2, net savings ~$${results.ongoingNet.toLocaleString()}/yr.`);
    } else {
      text.push('Near break-even—tighten dispute time or increase reduction.');
    }

    if (results.fteSaved >= 1) {
      text.push(`Saves about ${results.fteSaved.toFixed(2)} FTE—reassign to value work.`);
    } else {
      text.push('Partial FTE freed—pool across shifts.');
    }

    return text.join(' ');
  };

  const handleExportPDF = () => {
    if (results) {
      exportToPDF(inputs, results, narrative);
    }
  };

  const handleExportCSV = () => {
    if (results) {
      exportToCSV(inputs, results, narrative);
    }
  };

  const handleEmailResults = (email, name) => {
    if (results) {
      emailResults(inputs, results, narrative, email, name);
    }
  };

  return (
    <section id="roi-calculator" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">ROI Calculator</h2>
          <p className="text-lg text-gray-600">Enter your shipping data to see potential savings</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputSection inputs={inputs} setInputs={setInputs} />
          <ResultsPanel 
            results={results} 
            narrative={narrative}
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
            onEmailResults={handleEmailResults}
          />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Benchmarks are editable. Replace with your numbers any time.</p>
        </div>
      </div>
    </section>
  );
};

export default ROICalculator;