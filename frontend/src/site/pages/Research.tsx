import React from 'react';
import { Link } from 'react-router-dom';
import { RESEARCH_PAPERS } from '../constants';
import { Paperclip, BarChart3, ArrowRight } from 'lucide-react';

export const Research = () => {
  const actionButtonClass =
    'inline-flex items-center gap-2 px-3.5 py-2 rounded-md border text-[11px] font-semibold tracking-[0.08em] uppercase transition-colors';

  const materialsButtonClass =
    `${actionButtonClass} border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900 hover:bg-gray-50`;

  const exploreButtonClass =
    `${actionButtonClass} border-gray-300 text-gray-600 hover:border-umd-red hover:text-umd-red hover:bg-red-50/40`;

  const paperDetailRoute: Record<string, string | undefined> = {
    "ewa-001": "/research/earned-wage-access",
  };

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

                {paperDetailRoute[paper.id] ? (
                  <Link
                    to={paperDetailRoute[paper.id] as string}
                    className="block mb-4 text-3xl font-serif font-bold text-gray-900 transition-colors group-hover:text-umd-red"
                  >
                    {paper.title}
                  </Link>
                ) : (
                  <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4 group-hover:text-umd-red transition-colors cursor-pointer">
                    {paper.title}
                  </h2>
                )}

                <p className="text-gray-600 mb-6 leading-relaxed max-w-3xl font-light">
                  {paper.abstract}
                </p>



                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {paper.pdfUrl ? (
                    <a
                      href={paper.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={materialsButtonClass}
                    >
                      <Paperclip size={14} />
                      <span>Materials</span>
                    </a>
                  ) : (
                    <span className={`${materialsButtonClass} opacity-50 cursor-not-allowed`}>
                      <Paperclip size={14} />
                      <span>Materials</span>
                    </span>
                  )}
                  {paper.dataLink && (
                    paper.dataLink.startsWith('http') ? (
                      <a
                        href={paper.dataLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={exploreButtonClass}
                      >
                        <BarChart3 size={14} />
                        <span>Explore Data</span>
                        <ArrowRight size={12} />
                      </a>
                    ) : (
                      <Link
                        to={paper.dataLink}
                        className={exploreButtonClass}
                      >
                        <BarChart3 size={14} />
                        <span>Explore Data</span>
                        <ArrowRight size={12} />
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
