import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ROICalculator from './components/ROICalculator';
import FAQ from './components/FAQ';
import CTAFooter from './components/CTAFooter';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <ROICalculator />
              <FAQ />
              <CTAFooter />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;