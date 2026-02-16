import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Download, SlidersHorizontal } from 'lucide-react';

type DropdownGuide = {
  control: string;
  controlType: string;
  options: string;
  impact: string;
  notes?: string;
};

type DashboardGuide = {
  id: string;
  title: string;
  path: string;
  summary: string;
  dropdowns: DropdownGuide[];
  insights: string[];
  howToUse: string[];
  value: {
    researchers: string;
    policymakers: string;
    analysts: string;
  };
};

const dashboardGuides: DashboardGuide[] = [
  {
    id: 'census',
    title: 'Census (ACS Demographics)',
    path: '/dashboard/census',
    summary:
      'Visualizes demographic and socioeconomic data from ACS to compare population characteristics across states, counties, and congressional districts.',
    dropdowns: [
      {
        control: 'Domain',
        controlType: 'Read-only field labeled Domain',
        options: 'Fixed to Census (ACS Demographics) in this dedicated dashboard.',
        impact: 'Keeps all controls and outputs scoped to ACS demographic data.'
      },
      {
        control: 'Level',
        controlType: 'Dropdown (Geography > Level)',
        options: 'State, County, or Congressional District when available for the dataset.',
        impact: 'Changes map boundaries, peer comparison group, and the number of ranked records.'
      },
      {
        control: 'Year',
        controlType: 'Dropdown (Year > Year)',
        options: 'All available ACS years for the selected level; defaults to the latest available year.',
        impact: 'Recomputes values, quintiles, rank, and percentile for the selected time period.'
      },
      {
        control: 'Metric',
        controlType: 'Dropdown (Variable > Metric)',
        options: 'Population, income, poverty, labor, education, and other ACS-derived indicators.',
        impact: 'Switches the measured variable used by map colors, insights cards, and downloads.'
      }
    ],
    insights: [
      'Current Variable card confirms exactly which metric is active.',
      'Summary Statistics reports records, min, max, mean, and median for the selected level/year.',
      'Quintile Thresholds define Q1-Q5 breakpoints used in map shading and percentile context.',
      'Top 10 and Bottom 10 panels provide fast outlier and benchmark scanning.'
    ],
    howToUse: [
      'Pick Level first, then Year, then Metric for a clean filter chain.',
      'Use map colors to spot clusters, then click a geography for precise rank and percentile.',
      'Use Download Dataset for full extracts and Download Displayed Data for filtered map output.',
      'Switch between state and district levels to compare broad vs local patterns.'
    ],
    value: {
      researchers: 'Supports demographic baseline analysis and comparative studies across regions.',
      policymakers: 'Helps identify areas with higher vulnerability or growth pressure for targeted policy design.',
      analysts: 'Speeds exploratory analysis with ready-to-use quantile and ranking context.'
    }
  },
  {
    id: 'government-spending',
    title: 'Government Spending',
    path: '/dashboard/government-spending',
    summary:
      'Tracks federal contracts, grants, direct payments, and federal employee wages to show the distribution of federal funding.',
    dropdowns: [
      {
        control: 'Domain',
        controlType: 'Read-only field labeled Domain',
        options: 'Fixed to Government Spending in this dedicated dashboard.',
        impact: 'Keeps all metrics tied to the federal funding dataset for consistent interpretation.'
      },
      {
        control: 'Level',
        controlType: 'Dropdown (Geography > Level)',
        options: 'State, County, and Congressional District where files are available for the selected year.',
        impact: 'Changes aggregation scale and rank denominator for comparisons.'
      },
      {
        control: 'Year',
        controlType: 'Dropdown (Year > Year)',
        options: 'Available years for Government Spending data at the chosen level.',
        impact: 'Updates map values and all insights to the selected reporting year.'
      },
      {
        control: 'Metric',
        controlType: 'Dropdown (Variable > Metric)',
        options: 'Contracts, Grants, Resident Wage, Direct Payments, Federal Residents, and corresponding Per 1,000 variants.',
        impact: 'Switches between total exposure and population-normalized exposure for the same geography.'
      }
    ],
    insights: [
      'Summary Statistics and Quintile Thresholds reveal concentration and distribution shape for each spending channel.',
      'Top 10 and Bottom 10 rankings surface geographic leaders and laggards quickly.',
      'Clicked geography panel reports value, rank, quintile, and percentile for defensible comparison.'
    ],
    howToUse: [
      'Start with Contracts or Grants at State level for macro allocation patterns.',
      'Switch to Per 1,000 metrics when comparing states with very different population size.',
      'Move to district level to identify sub-state concentration.',
      'Export displayed selections for policy notes and briefing appendices.'
    ],
    value: {
      researchers: 'Enables state and district-level evaluation of federal dependence and trend changes.',
      policymakers: 'Supports budget contingency planning around potential federal funding shocks.',
      analysts: 'Provides clean comparative slices for briefing decks and forecasting inputs.'
    }
  },
  {
    id: 'government-finances',
    title: 'Government Finances',
    path: '/dashboard/government-finances',
    summary:
      'Examines local government financial condition using local government financial statement data compiled by the Reason Foundation.',
    dropdowns: [
      {
        control: 'Domain',
        controlType: 'Read-only field labeled Domain',
        options: 'Fixed to Government Finances in this dedicated dashboard.',
        impact: 'Ensures all variables map to the fiscal health dataset only.'
      },
      {
        control: 'Level',
        controlType: 'Dropdown (Geography > Level)',
        options: 'State, County, and/or Congressional District depending on loaded files for the selected metric/year.',
        impact: 'Changes reporting unit and peer set used in rankings.'
      },
      {
        control: 'Year',
        controlType: 'Dropdown (Year > Year)',
        options: 'Available reporting years in the finance dataset for the selected level.',
        impact: 'Allows trend comparisons and refreshes all map and insight values.'
      },
      {
        control: 'Metric',
        controlType: 'Dropdown (Variable > Metric)',
        options: 'Revenue, expenditure, liabilities, debt, and related fiscal indicators exposed in backend variables.',
        impact: 'Defines which fiscal dimension is quantified on map and in insights.'
      }
    ],
    insights: [
      'Summary Statistics capture central tendency and spread for the selected fiscal indicator.',
      'Quintile thresholds make fiscal stress/resilience clusters visible on the map.',
      'Top/Bottom ranking cards help quickly identify outlier jurisdictions.'
    ],
    howToUse: [
      'Select a policy-relevant fiscal metric first, then compare across years.',
      'Read map concentration, then confirm the scale using insight statistics.',
      'Click target geographies to capture rank and percentile for reporting.',
      'Export filtered output for regression or comparative memo work.'
    ],
    value: {
      researchers: 'Improves empirical work on fiscal health and subnational public finance.',
      policymakers: 'Supports prioritization of intervention areas and fiscal risk monitoring.',
      analysts: 'Accelerates peer benchmarking and trend diagnostics with one workflow.'
    }
  },
  {
    id: 'finra-financial-literacy',
    title: 'Financial Literacy',
    path: '/dashboard/finra-financial-literacy',
    summary:
      'Evaluates financial literacy and capability nationwide from FINRA Investor Education Foundation data.',
    dropdowns: [
      {
        control: 'Domain',
        controlType: 'Read-only field labeled Domain',
        options: 'Fixed to FINRA Financial Literacy for this dashboard route.',
        impact: 'Prevents cross-source blending and keeps interpretation aligned with FINRA survey definitions.'
      },
      {
        control: 'Level',
        controlType: 'Dropdown (Geography > Level)',
        options: 'State, County, and/or Congressional District depending on available processed FINRA files.',
        impact: 'Changes geographic resolution and comparison peers.'
      },
      {
        control: 'Year',
        controlType: 'Dropdown (Year > Year)',
        options: 'Available survey years/waves for the chosen level.',
        impact: 'Updates all map values and rankings to the selected survey period.'
      },
      {
        control: 'Metric',
        controlType: 'Dropdown (Variable > Metric)',
        options: 'Knowledge, behavior, savings, borrowing, stress, and related financial capability indicators.',
        impact: 'Determines which capability dimension is measured and ranked.'
      }
    ],
    insights: [
      'Summary Statistics provide baseline distribution diagnostics for each literacy/capability measure.',
      'Quintile thresholds reveal regional disparity bands in a consistent ranking scale.',
      'Top/Bottom geography lists highlight strongest and weakest outcomes quickly.'
    ],
    howToUse: [
      'Select a variable from regional-level survey data that you are interested in (e.g., financial literacy or constraints).',
      'Compare state-level patterns first, then drill down to district/county where available.',
      'Pair results with Census and Spending dashboards for socioeconomic context.',
      'Export displayed data for program evaluation and grant evidence.'
    ],
    value: {
      researchers: 'Supports behavioral finance and household capability analysis.',
      policymakers: 'Guides targeted intervention design in underperforming regions.',
      analysts: 'Creates quick evidence trails for grant, program, and community reports.'
    }
  },
  {
    id: 'fund-flow',
    title: 'Federal Contract Flow',
    path: '/dashboard/fund-flow',
    summary:
      'Shows directional movement of subcontract flows across agencies, states, and industries.',
    dropdowns: [
      {
        control: 'Level',
        controlType: 'Dropdown (Flow Scope > Level)',
        options: 'State, County, or Congressional District.',
        impact: 'Sets the map geometry and determines which additional filters appear (industry/year controls vary by level).'
      },
      {
        control: 'Department',
        controlType: 'Dropdown (Agency > Department)',
        options: 'All Agencies, plus the agency list.',
        impact: 'Filters all displayed flows and recomputes insight totals for a single awarding agency context.'
      },
      {
        control: 'State',
        controlType: 'Dropdown (Location > State)',
        options: 'All States plus state list from flow options endpoint.',
        impact: 'Focuses flows involving the selected state; unlocks direction control when a single state is selected.'
      },
      {
        control: 'Direction',
        controlType: 'Segmented control (Location > Direction)',
        options: 'All, Inflow, Outflow.',
        impact: 'Constrains directional perspective for the selected state; disabled when State is set to All States.'
      },
      {
        control: 'Industry / NAICS',
        controlType: 'Dropdown (Industry section)',
        options: 'All Industries plus available 2-digit industry categories for the selected level.',
        impact: 'Applies sector-level filtering to isolate industry-specific flow channels.'
      },
      {
        control: 'Year Start',
        controlType: 'Dropdown (Year Range > Year Start)',
        options: 'Available years from flow options; visible for State, County, and Congressional District levels.',
        impact: 'Sets lower bound of analysis window and auto-corrects Year End if needed.'
      },
      {
        control: 'Year End',
        controlType: 'Dropdown (Year Range > Year End)',
        options: 'Available years from flow options; visible for State, County, and Congressional District levels.',
        impact: 'Sets upper bound of analysis window and auto-corrects Year Start if needed.'
      },
      {
        control: 'Flow Range',
        controlType: 'Segmented control (Flow Volume)',
        options: 'Top 10, Top 50, 50-100, 100-150, 150+.',
        impact: 'Controls which ranked slice of flows is drawn for readability and performance.'
      }
    ],
    insights: [
      'Total Amount and Summary cards quantify loaded vs displayed flow concentration.',
      'Internal Flows card reports same-origin/destination flows omitted from map lines.',
      'Quintile Thresholds define line-thickness tiers by amount; Top Agencies/Origins/Destinations expose network anchors.',
      'Largest Flow card provides direct origin-destination-agency traceability.'
    ],
    howToUse: [
      'Start with Level = State and Flow Range = Top 50 for a clear national pattern.',
      'Select a target state, then switch Direction to Inflow or Outflow for focused interpretation.',
      'Apply Department and Industry filters to isolate specific procurement channels.',
      'Use year bounds (county/congress) for time-window analysis, then export displayed flow slice.'
    ],
    value: {
      researchers: 'Enables contract network and regional spillover analysis.',
      policymakers: 'Supports procurement strategy and local business development planning.',
      analysts: 'Provides directional context not visible in standard spending totals.'
    }
  },
  {
    id: 'federal-spending-breaks',
    title: 'Federal Funding Breakdown',
    path: '/dashboard/federal-spending-breaks',
    summary:
      'Breaks down federal contracts, grants, and federal employee wages by state with agency-level detail.',
    dropdowns: [
      {
        control: 'Year',
        controlType: 'Dropdown (Scope > Year)',
        options: 'Available options for spending breakdown data: 2024 and Historical Average.',
        impact: 'Updates map values, state cards, and agency bar charts for the selected period.'
      },
      {
        control: 'State',
        controlType: 'Dropdown (Location > State)',
        options: 'All States plus each available state in the current year.',
        impact: 'Focuses state-level profile and enables detailed agency-level insights for one state.'
      },
      {
        control: 'Measure',
        controlType: 'Dropdown (Metric > Measure)',
        options: 'Totals group: Contracts, Grants, Resident Wage, Direct Payments, Federal Residents. Per 1,000 group: corresponding normalized variants.',
        impact: 'Switches the map and ranking basis between absolute exposure and population-adjusted intensity.'
      },
      {
        control: 'Display',
        controlType: 'Dropdown (View Type > Display)',
        options: 'View by amount or View by percentage.',
        impact: 'Changes bar chart interpretation from raw values to composition shares.'
      }
    ],
    insights: [
      'Current Selection card confirms active state/year/metric context.',
      'Summary Statistics computes total agencies, total value, average, and maximum for the selected state.',
      'Top 5 Agencies ranks dominant agencies for the active metric with quick comparisons.',
      'When no state is selected, the panel explicitly prompts for a state to avoid misinterpretation.'
    ],
    howToUse: [
      'Set Year and Measure first, then select a state from dropdown or by clicking the map.',
      'Use Display = amount for magnitude and Display = percentage for composition.',
      'Review map rank and agency bars together to assess concentration risk.',
      'Use reset selection to return to national context quickly.'
    ],
    value: {
      researchers: 'Supports composition and concentration analysis of federal economic exposure.',
      policymakers: 'Helps evaluate scenario impacts from agency-specific funding changes.',
      analysts: 'Produces fast, defensible state briefing outputs with visuals and ranked context.'
    }
  }
];

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
                  {dashboardGuides.map((guide) => (
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
