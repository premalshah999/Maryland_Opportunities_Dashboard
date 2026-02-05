import React from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ComingSoon = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fadeIn px-4">
            <div className="w-20 h-20 bg-red-50 text-umd-red flex items-center justify-center rounded-full mb-8 animate-pulse">
                <Clock size={40} />
            </div>

            <span className="text-umd-red font-bold uppercase tracking-[0.2em] text-xs mb-4 block">Section Development</span>

            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6 text-center">
                Coming Soon
            </h1>

            <p className="text-xl text-gray-500 max-w-xl text-center leading-relaxed font-light mb-12">
                We are currently compiling the latest datasets and research for this section.
                Detailed visualizations and analysis will be available shortly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-black transition-colors rounded-sm"
                >
                    <ArrowLeft size={18} />
                    Back to Home
                </Link>
                <Link
                    to="/projects"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-900 font-bold text-sm uppercase tracking-widest hover:border-gray-900 transition-colors rounded-sm"
                >
                    Explore Active Projects
                </Link>
            </div>

            <div className="mt-20 w-full max-w-lg">
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-umd-red w-1/3 animate-[progress_3s_ease-in-out_infinite]"></div>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center uppercase tracking-widest font-bold">Research in Progress</p>
            </div>
        </div>
    );
};

export default ComingSoon;
