import React from 'react';
import { Mail, MapPin } from 'lucide-react';

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
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                        <div className="pr-8">
                            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">Contact Information</h2>

                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-red-50 text-umd-red flex items-center justify-center rounded-full flex-shrink-0">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Address</h4>
                                        <p className="text-gray-500 text-sm">Robert H. Smith School of Business<br />University of Maryland<br />College Park, MD 20742</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-red-50 text-umd-red flex items-center justify-center rounded-full flex-shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">Email</h4>
                                        <a href="mailto:mop@rhsmith.umd.edu" className="text-umd-red hover:text-black transition-colors text-sm">mop@rhsmith.umd.edu</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Name</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border-b-2 border-gray-200 focus:border-umd-red outline-none transition-colors rounded-t-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Email</label>
                                    <input type="email" className="w-full px-4 py-3 bg-gray-50 border-b-2 border-gray-200 focus:border-umd-red outline-none transition-colors rounded-t-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Message</label>
                                    <textarea rows={4} className="w-full px-4 py-3 bg-gray-50 border-b-2 border-gray-200 focus:border-umd-red outline-none transition-colors rounded-t-sm"></textarea>
                                </div>
                                <button type="button" className="inline-block bg-umd-red text-white font-bold text-sm tracking-widest uppercase px-8 py-4 hover:bg-black transition-colors w-full">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
