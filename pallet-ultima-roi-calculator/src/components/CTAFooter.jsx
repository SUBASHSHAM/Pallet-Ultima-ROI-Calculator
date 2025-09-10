import React from 'react';
import { Calendar, FileText } from 'lucide-react';

const CTAFooter = () => {
  return (
    <section className="py-16 bg-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Ready to optimize your shipping operations?</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-lg">
            <Calendar className="mr-2 h-5 w-5" />
            Book a 15-min dock audit
          </button>
          
          <button className="inline-flex items-center bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium text-lg">
            <FileText className="mr-2 h-5 w-5" />
            See data sheet
          </button>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700 transition-colors duration-200">Privacy</a>
            <a href="#" className="hover:text-gray-700 transition-colors duration-200">Terms</a>
            <a href="#" className="hover:text-gray-700 transition-colors duration-200">Contact</a>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            © 2024 vMeasure. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTAFooter;