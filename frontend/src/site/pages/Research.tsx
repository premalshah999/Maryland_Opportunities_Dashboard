import React from 'react';
import { Link } from 'react-router-dom';
import { RESEARCH_PAPERS } from '../constants';
import { FileText, Download, Filter, BarChart3, ArrowRight } from 'lucide-react';

export const Research = () => {
  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="bg-white py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-umd-red font-bold uppercase tracking-widest text-xs mb-4 block">Publications</span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">Research & Insights</h1>
            <p className="text-xl text-gray-500 font-light">
              Exploring the economic landscape of Maryland through rigorous data analysis.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-16">



          {/* List */}
          <div className="flex-grow space-y-12">
            {RESEARCH_PAPERS.map((paper) => (
              <div key={paper.id} className="group border-b border-gray-100 pb-12 last:border-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <span className="text-umd-red font-bold text-xs uppercase tracking-widest">
                    {paper.category}
                  </span>
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{paper.date}</span>
                </div>

                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 group-hover:text-umd-red transition-colors cursor-pointer">
                  {paper.title}
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed max-w-3xl font-light">
                  {paper.abstract}
                </p>



                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <button className="flex items-center gap-2 text-gray-900 font-bold hover:text-umd-red transition-colors border border-gray-200 px-4 py-2 rounded-sm hover:border-umd-red">
                    <Download size={16} />
                    <span>Download PDF</span>
                  </button>
                  {paper.dataLink && (
                    paper.dataLink.startsWith('http') ? (
                      <a
                        href={paper.dataLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-umd-red text-white font-bold px-4 py-2 rounded-sm hover:bg-umd-red/90 transition-colors"
                      >
                        <BarChart3 size={16} />
                        <span>Explore Data</span>
                        <ArrowRight size={14} />
                      </a>
                    ) : (
                      <Link
                        to={paper.dataLink}
                        className="flex items-center gap-2 bg-umd-red text-white font-bold px-4 py-2 rounded-sm hover:bg-umd-red/90 transition-colors"
                      >
                        <BarChart3 size={16} />
                        <span>Explore Data</span>
                        <ArrowRight size={14} />
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}

            {/* Pagination Placeholder */}
            <div className="pt-8">
              <button className="text-sm font-bold uppercase tracking-widest text-gray-400 cursor-not-allowed">
                No More Entries
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};