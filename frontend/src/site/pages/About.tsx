import React from 'react';

export const About = () => {
  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <div className="bg-white pb-20 pt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-umd-red font-bold uppercase tracking-widest text-xs mb-4 block">Our Mission</span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
            A service-to-state partnership advancing Maryland’s economic resilience.
          </h1>
          <div className="space-y-6 text-xl text-gray-500 leading-relaxed font-light text-left md:text-center">
            <p>
              The Maryland Opportunities Dashboard is a pioneering &quot;Service to State&quot; initiative that unites
              the analytical power of the University of Maryland’s Robert H. Smith School of Business with the public
              stewardship of the Comptroller of Maryland. Our mission is to empower the state with actionable,
              data-driven insights that foster economic resilience, diversify our industrial base, and safeguard the
              well-being of Maryland families.
            </p>
            <p>
              This collaboration reflects the visionary leadership of Dean Prabhudev Konana, who champions the belief
              that a modern business school must extend its reach beyond the classroom to address the &quot;Grand
              Challenges&quot; of our time.
            </p>
            <blockquote className="border-l-2 border-umd-red pl-4 text-gray-600 italic">
              “We are delighted to partner with the Comptroller to deliver data-driven research insights that inform
              state leaders and federal officials. Smith School faculty and students are engaging deeply in rigorous
              economic analysis to help shape outcomes for Maryland. We are challenging our existing paradigms to build
              a stronger future.” — Prabhudev Konana, Dean, Robert H. Smith School of Business
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};
