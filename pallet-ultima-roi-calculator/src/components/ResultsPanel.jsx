import React, { useState } from 'react';
import { Download, Mail, FileText, Table } from 'lucide-react';

const ResultsPanel = ({ results, narrative, onExportPDF, onExportCSV, onEmailResults }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (email && name) {
      onEmailResults(email, name);
      setShowEmailForm(false);
      setEmail('');
      setName('');
    }
  };

  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Results</h3>
        <div className="text-center py-12">
          <p className="text-gray-500">Enter pallets/day and workdays/year to see results</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return `$${Math.round(value).toLocaleString()}`;
  };

  const isNegativeROI = results.totalAnnualSavings <= 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold mb-6">Results</h3>
      
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Annual hours saved</p>
            <p className="text-2xl font-bold text-gray-900">{results.annualHoursSaved.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">FTE equivalent saved</p>
            <p className="text-2xl font-bold text-gray-900">{results.fteSaved.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Annual labor savings</span>
              <span className="font-semibold">{formatCurrency(results.laborSavings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Chargeback savings</span>
              <span className="font-semibold">{formatCurrency(results.chargebackSavings)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dispute savings</span>
              <span className="font-semibold">{formatCurrency(results.disputeSavings)}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="font-semibold text-gray-900">Total annual savings (gross)</span>
              <span className="font-bold text-green-600">{formatCurrency(results.totalAnnualSavings)}</span>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Year-1 cost</span>
              <span className="font-semibold text-red-600">{formatCurrency(results.year1Cost)}</span>
            </div>
            <div className="flex justify-between">
              <span className={`font-semibold ${isNegativeROI ? 'text-gray-400' : 'text-green-600'}`}>
                Year-1 net savings
              </span>
              <span className={`font-bold ${isNegativeROI ? 'text-gray-400' : 'text-green-600'}`}>
                {formatCurrency(results.year1Net)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={`font-semibold ${isNegativeROI ? 'text-gray-400' : 'text-green-600'}`}>
                Ongoing annual net savings
              </span>
              <span className={`font-bold ${isNegativeROI ? 'text-gray-400' : 'text-green-600'}`}>
                {formatCurrency(results.ongoingNet)}
              </span>
            </div>
            {results.paybackMonths && (
              <div className="flex justify-between">
                <span className={`text-gray-600 ${isNegativeROI ? 'text-gray-400' : ''}`}>Payback (months)</span>
                <span className={`font-semibold ${isNegativeROI ? 'text-gray-400' : 'text-blue-600'}`}>
                  {results.paybackMonths.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {narrative && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Analysis</h4>
          <p className="text-sm text-blue-800">{narrative}</p>
        </div>
      )}
      
      {isNegativeROI && (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-yellow-800">
            Results show limited ROI. Consider adjusting chargeback reduction percentage or reviewing Year-1 costs.
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onExportCSV}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Table className="h-4 w-4 mr-2" />
            Download CSV
          </button>
          <button
            onClick={onExportPDF}
            className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
        
        <button
          onClick={() => setShowEmailForm(!showEmailForm)}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email me my results
        </button>
        
        {showEmailForm && (
          <form onSubmit={handleEmailSubmit} className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Send Results
              </button>
              <button
                type="button"
                onClick={() => setShowEmailForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;