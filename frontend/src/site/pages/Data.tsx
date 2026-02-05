import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const GRANT_DATA = [
  { year: '2018', amount: 450, category: 'Education' },
  { year: '2019', amount: 520, category: 'Education' },
  { year: '2020', amount: 900, category: 'Education' },
  { year: '2021', amount: 850, category: 'Education' },
  { year: '2022', amount: 1100, category: 'Education' },
  { year: '2023', amount: 1250, category: 'Education' },
];

const SPENDING_FLOW_DATA = [
  { name: 'Infra', federal: 4000, state: 2400 },
  { name: 'Edu', federal: 3000, state: 1398 },
  { name: 'Health', federal: 2000, state: 9800 },
  { name: 'R&D', federal: 2780, state: 3908 },
  { name: 'Def', federal: 1890, state: 4800 },
];

export const Data = () => {
  return (
    <div className="animate-fadeIn">
      <div className="bg-gray-900 text-white pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-umd-gold font-bold uppercase tracking-widest text-xs mb-4 block">Data Explorer</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Interactive Visualizations</h1>
          <p className="text-xl text-gray-400 max-w-2xl font-light">
            Visualizing the flow of federal and state funds across Maryland. Explore the datasets below.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20">
        
        {/* Chart 1: Federal Grants Trend */}
        <div className="bg-white p-8 md:p-12 shadow-sm border border-gray-100 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
             <div>
               <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Federal Grants Trend</h2>
               <p className="text-gray-500 text-sm">Volume of federal education grants (Millions USD).</p>
             </div>
             <button className="text-xs font-bold uppercase tracking-widest text-umd-red border border-umd-red px-6 py-3 hover:bg-umd-red hover:text-white transition-colors">Download CSV</button>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GRANT_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E03A3E" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#E03A3E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#E03A3E', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#E03A3E" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Flow Chart Placeholder (Bar Chart Comparison) */}
        <div className="bg-white p-8 md:p-12 shadow-sm border border-gray-100 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
             <div>
               <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Funding Sources by Sector</h2>
               <p className="text-gray-500 text-sm">Comparison of federal vs state contributions (2023).</p>
             </div>
             <button className="text-xs font-bold uppercase tracking-widest text-umd-red border border-umd-red px-6 py-3 hover:bg-umd-red hover:text-white transition-colors">Download CSV</button>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SPENDING_FLOW_DATA} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}} 
                  contentStyle={{ backgroundColor: '#fff', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Bar dataKey="federal" name="Federal Funds" fill="#E03A3E" barSize={40} />
                <Bar dataKey="state" name="State Funds" fill="#FFD200" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-gray-50 p-10 hover:bg-white border border-transparent hover:border-gray-200 transition-all">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Dataset A1</span>
             <h3 className="text-xl font-bold text-gray-900 mb-4 font-serif">Earned Wage Access Providers</h3>
             <p className="text-gray-600 mb-8 text-sm leading-relaxed">Comprehensive listing of all earned wage access providers operating in the state, updated quarterly.</p>
             <button className="text-umd-red font-bold uppercase tracking-widest text-xs border-b border-umd-red pb-1 hover:text-black hover:border-black transition-colors">Access Data</button>
           </div>
           <div className="bg-gray-50 p-10 hover:bg-white border border-transparent hover:border-gray-200 transition-all">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Dataset B4</span>
             <h3 className="text-xl font-bold text-gray-900 mb-4 font-serif">Infrastructure Project Map</h3>
             <p className="text-gray-600 mb-8 text-sm leading-relaxed">Geospatial data for infrastructure projects funded by the bipartisan infrastructure law across all counties.</p>
             <button className="text-umd-red font-bold uppercase tracking-widest text-xs border-b border-umd-red pb-1 hover:text-black hover:border-black transition-colors">Access Data</button>
           </div>
        </div>

      </div>
    </div>
  );
};