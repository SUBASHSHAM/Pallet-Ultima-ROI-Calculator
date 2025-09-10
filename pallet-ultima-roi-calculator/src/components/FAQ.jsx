import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqItems = [
    {
      question: "What counts as a chargeback?",
      answer: "A chargeback occurs when a carrier adjusts your freight bill after pickup, typically due to incorrect dimensions, weight, or classification. This includes reclassification fees, dimensional adjustments, and weight corrections that result in additional charges."
    },
    {
      question: "Why five seconds for automated capture?",
      answer: "vMeasure's automated system captures length, breadth, height, weight, and photos in approximately 5 seconds. This includes the time for the pallet to pass through the measurement zone and for data to be automatically transmitted to your WMS."
    },
    {
      question: "How do photos help dispute time?",
      answer: "Photos provide visual proof of pallet condition and dimensions at time of shipment. This documentation significantly reduces the time needed to resolve disputes with carriers, as you have certified evidence rather than relying on manual measurements or carrier claims."
    },
    {
      question: "What if I only know the yearly total?",
      answer: "If you know your total annual chargeback costs, enter that amount in the 'Annual chargebacks (value)' field. The calculator will use this direct figure instead of estimating based on incidence rates and average costs per pallet."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600">Common questions about ROI calculations</p>
        </div>
        
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="font-medium text-gray-900">{item.question}</span>
                {openItems[index] ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              {openItems[index] && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;