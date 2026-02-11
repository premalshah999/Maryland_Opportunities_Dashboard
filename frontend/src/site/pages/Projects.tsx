import React from 'react';
import { ArrowRight, Building2, Briefcase, BarChart3, Home as HomeIcon, FileText, Paperclip, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const projects = [
    {
        id: 'ewa',
        title: 'Earned Wage Access',
        partner: 'Department of Labor',
        description: 'Analyzing where Earned Wage Access products are offered and how their availability relates to neighborhood characteristics and financial literacy.',
        category: 'Financial Inclusion',
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800&h=600',
        dataLink: '/research/earned-wage-access',
        materialsLink: '/assets/reports/research-ewa.pdf'
    },
    {
        id: 'fed-spending',
        title: 'Federal Spending in Maryland',
        partner: "Comptroller's Office",
        description: 'Federal Spending in Maryland - Historical Analysis on Federal Spending in MD and Scenario analysis on how proposed cuts would impact Maryland\'s economy',
        category: 'Economic Analysis',
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800&h=600',
        dataLink: '/dashboard/government-spending',
        reportLink: 'https://www.marylandcomptroller.gov/content/dam/mdcomp/md/reports/research/federal-spending-in-md.pdf'
    },
    {
        id: 'business-survey',
        title: 'Maryland Business Climate Survey 2025',
        partner: null,
        description: "The Maryland Business Climate Survey 2025 provides a comprehensive snapshot of the state's business environment, capturing sentiment, challenges, and opportunities across diverse industry sectors. It also examines the impact of federal policy changes on Maryland's businesses.",
        category: 'Business Research',
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800&h=600',
        dataLink: null,
        reportLink: '/assets/reports/2025-maryland-business-climate-survey.pdf'
    },
    {
        id: 'veterans-housing',
        title: 'State of Residence Choice of Veterans',
        partner: 'Veterans Affairs',
        description: 'Research on military retirees in Maryland: factors influencing residence choice and economic impact analysis of military retirement income tax exemption.',
        category: 'Tax Policy Analysis',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800&h=600',
        dataLink: null,
        materialsLink: '/assets/reports/mdva-final-report-research-methods-and-technical-notes.pdf'
    }
];

export const Projects = () => {
    return (
        <div className="animate-fadeIn">
            {/* Hero Section */}
            <div className="bg-white py-20 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <span className="text-umd-red font-bold uppercase tracking-widest text-xs mb-4 block">Research Partnerships</span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">Projects</h1>
                    <p className="text-xl text-gray-500 max-w-3xl leading-relaxed font-light">
                        Collaborative research initiatives with government agencies to drive policy and improve outcomes for Marylanders.
                    </p>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="group bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-500"
                        >
                            {/* Image */}
                            <div className="relative overflow-hidden aspect-[16/9]">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                {/* Partner Badge */}
                                {project.partner && (
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                                        <Building2 size={12} className="text-umd-red" />
                                        <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-wider">{project.partner}</span>
                                    </div>
                                )}

                                {/* Category */}
                                <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-widest text-umd-gold">
                                    {project.category}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-umd-red transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4 font-light">
                                    {project.description}
                                </p>

                                {/* Links Section */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {project.reportLink && (
                                        <a
                                            href={project.reportLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:border-umd-red hover:text-umd-red transition-all duration-300"
                                        >
                                            <FileText size={12} />
                                            View Report
                                        </a>
                                    )}
                                    {project.materialsLink && (
                                        <a
                                            href={project.materialsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:border-umd-red hover:text-umd-red transition-all duration-300"
                                        >
                                            <Paperclip size={12} />
                                            Materials
                                        </a>
                                    )}
                                    {project.dataLink && (
                                        project.dataLink.startsWith('http') ? (
                                            <a
                                                href={project.dataLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:border-umd-red hover:text-umd-red transition-all duration-300"
                                            >
                                                <BarChart2 size={12} />
                                                View Data
                                            </a>
                                        ) : (
                                            <Link
                                                to={project.dataLink}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:border-umd-red hover:text-umd-red transition-all duration-300"
                                            >
                                                <BarChart2 size={12} />
                                                View Data
                                            </Link>
                                        )
                                    )}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <Link
                                        to={`/projects/${project.id}`}
                                        className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-umd-red transition-colors"
                                    >
                                        Learn More <ArrowRight size={14} className="ml-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
