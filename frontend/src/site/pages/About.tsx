import React from 'react';

export const About = () => {
  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <div className="bg-white pb-20 pt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-umd-red font-bold uppercase tracking-widest text-xs mb-4 block">Our Mission</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
            Advancing economic opportunity through rigorous research.
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed font-light">
            At the Smith School of the University of Maryland, our team of researchers compiles and analyzes data and creates a platform for local stakeholders to make more informed decisions.
          </p>
        </div>
      </div>
    </div>
  );
};