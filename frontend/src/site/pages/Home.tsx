import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, FileText, Users } from 'lucide-react';
import { AnimatedHeroMap } from '../components/AnimatedHeroMap';

// Custom hook for typewriter effect
const useTypewriter = (text: string, speed: number = 75, startDelay: number = 200) => {
  const [displayText, setDisplayText] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.substring(0, i + 1));
          i++;
        } else {
          setIsFinished(true);
          clearInterval(timer);
        }
      }, speed);
      return () => clearInterval(timer);
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayText, isFinished };
};

export const Home = () => {
  const { displayText, isFinished } = useTypewriter("economic opportunity", 80, 500);

  return (
    <div className="animate-fadeIn">
      {/* Sleek Hero Section */}
      <section className="relative -mt-20 md:-mt-24 mb-12 min-h-[95vh] flex flex-col justify-center bg-white overflow-hidden pt-32">

        {/* Abstract Background */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gray-50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        </div>

        {/* Map Background Layer - Positioned behind text */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-80 -mt-10 pointer-events-none md:pointer-events-auto">
          <div className="w-full max-w-[90%] md:max-w-full">
            <AnimatedHeroMap />
          </div>
        </div>

        <div className="max-w-[1400px] w-full mx-auto px-6 lg:px-12 relative z-20 flex-grow flex flex-col justify-center pointer-events-none">
          <div className="pointer-events-auto text-left max-w-5xl">
            <h1 className="text-5xl md:text-7xl lg:text-7xl font-serif font-medium text-gray-900 leading-[1.1] mb-10 tracking-tight">
              Identifying barriers to <br />
              <span className="relative inline-block text-umd-red">
                {displayText}
                {!isFinished && <span className="animate-pulse text-umd-red ml-1">|</span>}
              </span>.
            </h1>
            <p className="text-lg md:text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl font-light">
              We compile and analyze data to empower local stakeholders in Maryland with the insights needed to make informed policy decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 mb-16">
              <Link
                to="/data"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-umd-red transition-all duration-300"
              >
                Explore Data
                <ArrowRight size={14} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/research"
                className="group inline-flex items-center justify-center px-8 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-900 text-[11px] font-bold tracking-[0.2em] uppercase hover:border-gray-900 transition-colors"
              >
                View Research
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* Intro Grid - Floating Cards */}
      <section className="mb-32 relative z-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <Link to="/dashboard/fund-flow" className="group p-10 bg-white border border-gray-100 hover:shadow-soft transition-all duration-500">
              <div className="w-12 h-12 bg-gray-50 text-gray-900 flex items-center justify-center mb-8 group-hover:bg-umd-red group-hover:text-white transition-colors">
                <BarChart2 size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-serif text-gray-900 mb-4 group-hover:text-umd-red transition-colors">Fund Flow Analysis</h3>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm font-light">
                Uncovering trends in federal spending, wage access, and local economic health through rigorous data analysis.
              </p>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-900 transition-colors">
                Explore Charts
              </span>
            </Link>

            <Link to="/research" className="group p-10 bg-white border border-gray-100 hover:shadow-soft transition-all duration-500">
              <div className="w-12 h-12 bg-gray-50 text-gray-900 flex items-center justify-center mb-8 group-hover:bg-umd-red group-hover:text-white transition-colors">
                <FileText size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-serif text-gray-900 mb-4 group-hover:text-umd-red transition-colors">Policy Insights</h3>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm font-light">
                Translating complex economic findings into actionable policy recommendations for Maryland legislators.
              </p>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-900 transition-colors">
                Read Papers
              </span>
            </Link>

            <Link to="/impact" className="group p-10 bg-white border border-gray-100 hover:shadow-soft transition-all duration-500">
              <div className="w-12 h-12 bg-gray-50 text-gray-900 flex items-center justify-center mb-8 group-hover:bg-umd-red group-hover:text-white transition-colors">
                <Users size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-serif text-gray-900 mb-4 group-hover:text-umd-red transition-colors">Local Impact</h3>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm font-light">
                Partnering with community leaders to ensure our research drives tangible improvements in opportunity.
              </p>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-900 transition-colors">
                See Stories
              </span>
            </Link>

          </div>
        </div>
      </section>

      {/* Featured Insight Strip - Minimalist & Editorial */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
              <span className="text-umd-red font-bold uppercase tracking-[0.2em] text-[10px] mb-6 block">Featured Insight</span>
              <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-8 leading-tight">
                What Federal Spending Cuts Mean for Jobs and Growth in Maryland
              </h2>
              <div className="h-[1px] w-20 bg-gray-300 mb-8"></div>
              <Link to="/projects/fed-spending" className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-900 hover:text-umd-red transition-colors border-b border-gray-300 pb-1 hover:border-umd-red">
                Read the Full Report
              </Link>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="bg-white p-8 md:p-12 shadow-sm relative">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-umd-gold/20 rounded-full blur-xl"></div>
                <p className="text-2xl md:text-3xl font-serif text-gray-900 leading-relaxed italic relative z-10">
                  "New scenario analysis finds that recent proposed federal agency cuts could cost Maryland thousands of jobs and over <span className="font-bold text-umd-red">$1 billion</span> in annual wages, with ripple effects across local economies statewide."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: Latest Updates / Insights Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

            {/* Card 1 */}
            <div className="group flex flex-col">
              <div className="relative overflow-hidden aspect-[3/2] mb-8 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
                  alt="Research Paper"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="text-umd-red font-bold uppercase tracking-[0.2em] text-[10px] mb-3">New Research</span>
              <h3 className="text-2xl font-serif text-gray-900 mb-4 leading-tight group-hover:text-umd-red transition-colors">
                Maryland Business Climate Survey 2025
              </h3>
              <p className="text-gray-500 text-sm font-light mb-4">
                Maryland businesses report rising costs, federal policy disruptions, and growing relocation concerns—Explore Report
              </p>
              <Link to="/projects/business-survey" className="mt-auto inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900 border-b border-gray-200 pb-1 hover:border-umd-red hover:text-umd-red transition-colors w-fit">
                Explore Report
              </Link>
            </div>

            {/* Card 2 */}
            <div className="group flex flex-col">
              <div className="relative overflow-hidden aspect-[3/2] mb-8 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800"
                  alt="Blog Post"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="text-umd-red font-bold uppercase tracking-[0.2em] text-[10px] mb-3">New Research</span>
              <h3 className="text-2xl font-serif text-gray-900 mb-4 leading-tight group-hover:text-umd-red transition-colors">
                The Effects of Earned Wage Access Programs on Maryland Consumers
              </h3>
              <p className="text-gray-500 text-sm font-light mb-4">
                Explore the impact of EWA products on financial stability and consumer behavior across Maryland neighborhoods.
              </p>
              <Link to="/projects/ewa" className="mt-auto inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900 border-b border-gray-200 pb-1 hover:border-umd-red hover:text-umd-red transition-colors w-fit">
                Explore Report
              </Link>
            </div>

            {/* Card 3 */}
            <div className="group flex flex-col">
              <div className="relative overflow-hidden aspect-[3/2] mb-8 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
                  alt="Data Tool"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <span className="text-umd-red font-bold uppercase tracking-[0.2em] text-[10px] mb-3">Interactive Dashboard</span>
              <h3 className="text-2xl font-serif text-gray-900 mb-4 leading-tight group-hover:text-umd-red transition-colors">
                Tracking Federal Contracts and Subcontracts
              </h3>
              <p className="text-gray-500 text-sm font-light mb-4">
                Analyze the flow of federal contracts through primary and subcontracting linkages across the state.
              </p>
              <Link to="/dashboard/fund-flow" className="mt-auto inline-flex items-center text-[11px] font-bold uppercase tracking-[0.2em] text-gray-900 border-b border-gray-200 pb-1 hover:border-umd-red hover:text-umd-red transition-colors w-fit">
                Explore the Tool
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
