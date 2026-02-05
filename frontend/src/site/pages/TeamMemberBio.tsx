import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { TEAM_MEMBERS } from '../constants';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export const TeamMemberBio = () => {
    const { memberId } = useParams();
    const member = TEAM_MEMBERS.find(m => m.id === memberId);

    if (!member) {
        return <Navigate to="/about/team" replace />;
    }

    return (
        <div className="animate-fadeIn pb-24">
            {/* Breadcrumb / Back Navigation */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link to="/about/team" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-umd-red transition-colors">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Team
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="flex flex-col md:flex-row gap-12 items-start">
                    {/* Image Section */}
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden shadow-md border border-gray-100">
                            <img
                                src={member.imageUrl}
                                alt={member.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Contact / Social Links could go here if we had them */}
                        {member.profileUrl && (
                            <div className="mt-6">
                                <a
                                    href={member.profileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full px-4 py-3 bg-red-50 text-umd-red font-bold text-sm uppercase tracking-wider rounded-md hover:bg-umd-red hover:text-white transition-all duration-300"
                                >
                                    View Profile <ExternalLink size={14} className="ml-2" />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-grow">
                        <div className="mb-2">
                            <span className="text-umd-red font-bold uppercase tracking-widest text-xs">{member.role}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-8 leading-tight">
                            {member.name}
                        </h1>


                        <div className="prose prose-lg prose-gray max-w-none font-light leading-relaxed text-gray-600">
                            <p className="text-xl text-gray-900 mb-8">{member.bio}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};
