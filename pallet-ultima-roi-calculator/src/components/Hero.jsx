import React from 'react';
import { ArrowDown } from 'lucide-react';

const Hero = () => {
  const scrollToCalculator = () => {
    const element = document.getElementById('roi-calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Prove pallet ROI in minutes.
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Measure every pallet. Stop reclass bills. Close disputes faster.
        </p>
        <button
          onClick={scrollToCalculator}
          className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-lg"
        >
          Jump to Calculator
          <ArrowDown className="ml-2 h-5 w-5" />
        </button>
      </div>
    </section>
  );
};

export default Hero;