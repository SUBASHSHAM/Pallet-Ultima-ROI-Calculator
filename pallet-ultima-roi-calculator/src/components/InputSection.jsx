import React from 'react';
import { HelpCircle } from 'lucide-react';

const InputSection = ({ inputs, setInputs }) => {
  const updateInput = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const Tooltip = ({ text, children }) => (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-1 text-sm bg-gray-800 text-white rounded-lg shadow-lg">
        {text}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold mb-6">Calculator Inputs</h3>
      
      {/* Section A: Shipment Volume */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4">Shipment Volume</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pallets per day
            </label>
            <input
              type="number"
              min="1"
              value={inputs.palletsPerDay}
              onChange={(e) => updateInput('palletsPerDay', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Average outbound pallets per shipping day.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Workdays per year
            </label>
            <input
              type="number"
              min="1"
              value={inputs.workdaysPerYear}
              onChange={(e) => updateInput('workdaysPerYear', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Shipping days per year.</p>
          </div>
        </div>
      </div>

      {/* Section B: Labor & Capture Time */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4"> Labor & capture time per pallet</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Manual data capture time (seconds)
            </label>
            <input
              type="number"
              min="0"
              max="600"
              value={inputs.manualCaptureTime}
              onChange={(e) => updateInput('manualCaptureTime', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">LBH + weight + photos + WMS entry (manual). Typical manual capture can take minutes end-to-end.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Automated data capture time by vMeasure (seconds)
            </label>
            <input
              type="number"
              min="0"
              max="600"
              value={inputs.automatedCaptureTime}
              onChange={(e) => updateInput('automatedCaptureTime', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">LBH + weight + photos → WMS (automated). vMeasure captures LBH + weight + photos and pushes to WMS.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Fully loaded labor rate (USD/hour)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.laborRate}
              onChange={(e) => updateInput('laborRate', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Section C: Carrier Adjustments */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4"> Carrier adjustments / chargebacks</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Annual chargebacks (value) (USD/year)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.annualChargebacks}
              onChange={(e) => updateInput('annualChargebacks', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional - leave blank to use estimator"
            />
          </div>
          {!inputs.annualChargebacks && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                   Avg $ per chargeback (USD/pallet)
                </label>
                <input
                  type="number"
                  min="0"
                  value={inputs.avgChargebackCost}
                  onChange={(e) => updateInput('avgChargebackCost', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                   Chargeback incidence rate: {inputs.chargebackIncidence}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  value={inputs.chargebackIncidence}
                  onChange={(e) => updateInput('chargebackIncidence', parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Share of all pallets that end with a carrier chargeback.</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section D: Disputes */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4"> Disputes & admin workload</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Disputes per month
            </label>
            <input
              type="number"
              min="0"
              value={inputs.disputesPerMonth}
              onChange={(e) => updateInput('disputesPerMonth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Leave blank to auto-estimate"
            />
            <p className="text-xs text-gray-500 mt-1">Leave blank to auto-estimate.</p>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={inputs.useIncidenceEstimator}
                onChange={(e) => updateInput('useIncidenceEstimator', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Use incidence-based estimator?</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              {inputs.useIncidenceEstimator ? 
                'Estimate from incidence and share contested.' : 
                'Assume 1% of monthly pallets result in a dispute.'
              }
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Avg hours per dispute
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={inputs.hoursPerDispute}
              onChange={(e) => updateInput('hoursPerDispute', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Share of chargebacks you contest: {inputs.shareContested}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={inputs.shareContested}
              onChange={(e) => updateInput('shareContested', parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Used only by the incidence-based dispute estimator.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Dispute-hours reduction with vMeasure proof: {inputs.disputeReduction}%
            </label>
            <input
              type="range"
              min="50"
              max="80"
              value={inputs.disputeReduction}
              onChange={(e) => updateInput('disputeReduction', parseFloat(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Time reduction when each BOL has certified dims + photos.</p>
          </div>
        </div>
      </div>

      {/* Section E: Impact */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4"> Impact from vMeasure</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
             Chargeback / reclassification reduction: {inputs.chargebackReduction}%
          </label>
          <input
            type="range"
            min="60"
            max="90"
            value={inputs.chargebackReduction}
            onChange={(e) => updateInput('chargebackReduction', parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">Reduction in chargebacks when you measure 100% with photos.</p>
        </div>
      </div>

      {/* Section F: Costs */}
      <div className="mb-8">
        <h4 className="font-medium text-gray-900 mb-4"> Costs</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Year-1 total cost (USD)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.year1Cost}
              onChange={(e) => updateInput('year1Cost', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Hardware + installation + integration + training + Year-1 subscription.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Ongoing annual cost (Year-2+) (USD/year)
            </label>
            <input
              type="number"
              min="0"
              value={inputs.ongoingCost}
              onChange={(e) => updateInput('ongoingCost', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputSection;