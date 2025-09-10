import React from 'react';
import { Calculator } from 'lucide-react';

const Navbar = () => {
  const scrollToCalculator = () => {
    const element = document.getElementById('roi-calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Calculator className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">vMeasure ROI Calculator</span>
          </div>
          <button
            onClick={scrollToCalculator}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Calculate ROI
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;