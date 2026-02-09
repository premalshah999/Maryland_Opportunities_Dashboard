import React from 'react';
import { Mail } from 'lucide-react';

export const Contact = () => {
    return (
        <div className="animate-fadeIn">
            {/* Hero */}
            <div className="bg-white pb-20 pt-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-umd-red font-bold uppercase tracking-widest text-xs mb-4 block">Get In Touch</span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-8 leading-tight">
                        Contact Us
                    </h1>
                    <p className="text-xl text-gray-500 leading-relaxed font-light">
                        We are always looking to collaborate with policymakers, community organizations, and fellow researchers. Please reach out to us with any inquiries.
                    </p>
                </div>
            </div>

            <div className="border-t border-gray-100"></div>

            {/* Contact Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white p-10 rounded-lg shadow-sm border border-gray-100 text-center">
                        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Email Us</h2>
                        <p className="text-gray-500 mb-8">For all inquiries, please reach out directly by email.</p>
                        <a
                            href="mailto:mop@rhsmith.umd.edu"
                            className="inline-flex items-center gap-3 px-6 py-3 border border-gray-200 text-gray-700 hover:border-umd-red hover:text-umd-red transition-colors rounded-sm"
                        >
                            <Mail size={18} />
                            <span className="text-sm">mop@rhsmith.umd.edu</span>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};
