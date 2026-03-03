import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Download, SlidersHorizontal } from 'lucide-react';
import { dashboardGuides, orderedDashboardGuides } from '../dashboardGuides';

const workflowSteps = [
  {
    title: 'Set Parameters',
    text: 'Choose each dashboard’s sidebar controls (domain/level/year/metric or flow filters) to define scope precisely.'
  },
  {
    title: 'Read Insights',
    text: 'Use insights cards to validate distribution, ranking, concentration, and outlier behavior before drawing conclusions.'
  },
  {
    title: 'Export Results',
    text: 'Use Download Dataset for full source extracts, or Download Displayed Data for your active filtered view.'
  }
];

export const DashboardReports = () => {
  const [activeSection, setActiveSection] = React.useState('overview');

  const activeGuide = dashboardGuides.find((guide) => guide.id === activeSection);
  return (
    <div className="animate-fadeIn">
      <div className="bg-white py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="text-umd-red font-bold uppercase tracking-widest text-xs mb-4 block">Documentation</span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">How To Use The Dashboards</h1>
            <p className="text-xl text-gray-500 font-light">
              Detailed guidance on filters, insights, and interpretation for researchers, policymakers, and analysts.
            </p>
            <p className="text-sm text-gray-500 font-light mt-3">
              (Click the ℹ️ icons for detailed explanations and value distributions.)
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
          <aside className="lg:block">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
                  Documentation
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'interface', label: 'Interface Reference' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                        activeSection === item.id
                          ? 'border-umd-red text-umd-red bg-red-50/60'
                          : 'border-gray-200 text-gray-600 hover:border-umd-red hover:text-umd-red'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">
                  Dashboards
                </div>
                <div className="space-y-2 text-sm">
                  {orderedDashboardGuides.map((guide) => (
                    <button
                      key={`nav-${guide.id}`}
                      type="button"
                      onClick={() => setActiveSection(guide.id)}
                      className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                        activeSection === guide.id
                          ? 'border-umd-red text-umd-red bg-red-50/60'
                          : 'border-gray-200 text-gray-600 hover:border-umd-red hover:text-umd-red'
                      }`}
                    >
                      {guide.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div>
        {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="bg-white border border-gray-100 p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-umd-red mb-2">Step {index + 1}</div>
              <h3 className="text-lg font-serif text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
        )}

        {activeSection === 'interface' && (
        <div className="mb-14 bg-white border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-serif text-gray-900 mb-3">Interface Reference</h2>
          <p className="text-sm text-gray-500 font-light mb-4">
            Every dashboard uses the same two-tab workflow in the sidebar:
          </p>
          <ul className="space-y-2 text-sm text-gray-600 font-light">
            <li>• Parameters tab defines scope through dropdowns and filter controls.</li>
            <li>• Insights tab provides computed statistics and ranked context for the current filter state.</li>
            <li>• Download Dataset exports the full source slice for that dashboard.</li>
            <li>• Download Displayed Data exports only what is currently filtered and visible.</li>
          </ul>
        </div>
        )}

        {activeGuide && activeSection !== 'overview' && activeSection !== 'interface' && (
        <div className="space-y-14">
            <section className="bg-white border border-gray-100 p-8 md:p-10">
              <div className="flex flex-col lg:flex-row lg:items-start gap-10">
                <div className="lg:w-[46%]">
                  <h2 className="text-3xl font-serif text-gray-900 mb-3">{activeGuide.title}</h2>
                  <p className="text-gray-500 font-light leading-relaxed mb-6">{activeGuide.summary}</p>
                  <Link
                    to={activeGuide.path}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:border-umd-red hover:text-umd-red transition-colors text-[11px] font-semibold tracking-[0.08em] uppercase mb-8"
                  >
                    <BarChart3 size={14} />
                    Open Dashboard
                    <ArrowRight size={12} />
                  </Link>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-900 inline-flex items-center gap-2">
                      <SlidersHorizontal size={14} />
                      Dropdown Context
                    </h3>
                    {activeGuide.dropdowns.map((item) => (
                      <div key={`${activeGuide.id}-${item.control}`} className="border border-gray-100 bg-gray-50/40 p-4">
                        <div className="text-[11px] uppercase tracking-[0.12em] text-gray-900 font-semibold mb-2">
                          {item.control}
                        </div>
                        <p className="text-sm text-gray-600 font-light leading-relaxed mb-1">
                          <span className="font-medium text-gray-800">Control:</span> {item.controlType}
                        </p>
                        <p className="text-sm text-gray-600 font-light leading-relaxed mb-1">
                          <span className="font-medium text-gray-800">Options:</span> {item.options}
                        </p>
                        <p className="text-sm text-gray-600 font-light leading-relaxed">
                          <span className="font-medium text-gray-800">Effect:</span> {item.impact}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-gray-600 font-light leading-relaxed mt-1">
                            <span className="font-medium text-gray-800">Note:</span> {item.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:w-[54%]">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-900 mb-3">Statistical Insights</h3>
                      <ul className="space-y-2 text-sm text-gray-600 font-light">
                        {activeGuide.insights.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-900 mb-3 inline-flex items-center gap-2">
                        <Download size={14} />
                        How To Use
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600 font-light">
                        {activeGuide.howToUse.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-900 mb-3">Who It Helps</h3>
                      <div className="space-y-2 text-sm text-gray-600 font-light">
                        <p><span className="font-medium text-gray-800">Researchers:</span> {activeGuide.value.researchers}</p>
                        <p><span className="font-medium text-gray-800">Policymakers:</span> {activeGuide.value.policymakers}</p>
                        <p><span className="font-medium text-gray-800">Analysts:</span> {activeGuide.value.analysts}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
        </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};
