import React from 'react';
import { Link } from 'react-router-dom';
import { TEAM_MEMBERS } from '../constants';

export const Team = () => {
    return (
        <div className="animate-fadeIn">
            {/* Hero */}
            <div className="bg-white pb-20 pt-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-umd-red font-bold uppercase tracking-widest text-xs mb-4 block">Our Team</span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
                        Meet the Team
                    </h1>
                    <p className="text-xl text-gray-500 leading-relaxed font-light">
                        Dedicated researchers and professionals working to advance economic opportunity through rigorous analysis and data-driven insights.
                    </p>
                </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Our Team Section */}
            <section id="team" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {TEAM_MEMBERS.map((member) => (
                            <Link to={`/about/team/${member.id}`} key={member.id} className="flex flex-col items-center text-center group cursor-pointer">
                                <div className="w-48 h-48 mb-8 overflow-hidden rounded-full border-4 border-white shadow-sm">
                                    <img
                                        src={member.imageUrl}
                                        alt={member.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif group-hover:text-umd-red transition-colors">
                                    {member.name}
                                </h3>
                                <span className="text-umd-red font-medium text-xs uppercase tracking-widest mb-4">{member.role}</span>

                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-24 bg-white border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">Get In Touch</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
                        We are always looking to collaborate with policymakers, community organizations, and fellow researchers. Please reach out to us with any inquiries.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <div className="w-12 h-12 bg-red-50 text-umd-red flex items-center justify-center rounded-full flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="16" x="2" y="4" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Email Us</h4>
                            <a href="mailto:mop@rhsmith.umd.edu" className="text-umd-red hover:text-black transition-colors text-lg font-medium">
                                mop@rhsmith.umd.edu
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
