import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowRight } from 'lucide-react';

const dashboards = [
  {
    id: 'census',
    title: 'Census (ACS Demographics)',
    description: 'Visualizes demographic and socioeconomic data from the American Community Survey (ACS) to analyze population characteristics across the United States.',
    path: '/dashboard/census'
  },
  {
    id: 'government-spending',
    title: 'Federal Spending',
    description: 'Visualizes the distribution of federal funding across the United States using data from the USAspending, tracking key economic drivers including federal contracts, grants, direct payments, and federal employee wages.',
    path: '/dashboard/government-spending'
  },
  {
    id: 'federal-spending-breaks',
    title: 'Federal Spending Breakdown',
    description: 'Provides a detailed breakdown of federal funding categories, including contracts, grants, and federal employee wages for each State, using data from the USAspending.',
    path: '/dashboard/federal-spending-breaks'
  },
  {
    id: 'government-finances',
    title: 'Government Finances',
    description: 'Analyzes the financial health of local governments across the United States using national data from the Reason Foundation.',
    path: '/dashboard/government-finances'
  },
  {
    id: 'finra-financial-literacy',
    title: 'FINRA Financial Literacy',
    description: 'Evaluates financial literacy and capability nationwide using data from the FINRA Investor Education Foundation.',
    path: '/dashboard/finra-financial-literacy'
  },
  {
    id: 'fund-flow',
    title: 'Fund Flow',
    description: 'Visualizes the flow of federal funds by merging prime contract and subcontract data from System for Award Management (SAM). Tracks the directional movement of contracts, including inflows and outflows, between agencies, states, and industries.',
    path: '/dashboard/fund-flow'
  }
];

export const Dashboards = () => {
  return (
    <div className="animate-fadeIn">
      <div className="bg-white py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-umd-red font-bold uppercase tracking-widest text-xs mb-4 block">Data Dashboard</span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">Dashboards</h1>
            <p className="text-xl text-gray-500 font-light">
              Interactive tools to explore Maryland’s economic data and policy insights.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {dashboards.map((dashboard) => (
            <Link
              key={dashboard.id}
              to={dashboard.path}
              className="group p-10 bg-white border border-gray-100 hover:shadow-soft transition-all duration-500"
            >
              <div className="w-12 h-12 bg-gray-50 text-gray-900 flex items-center justify-center mb-8 group-hover:bg-umd-red group-hover:text-white transition-colors">
                <BarChart3 size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-serif text-gray-900 mb-4 group-hover:text-umd-red transition-colors">
                {dashboard.title}
              </h3>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm font-light">
                {dashboard.description}
              </p>
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-900 transition-colors">
                Open Dashboard
                <ArrowRight size={12} className="ml-2" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
