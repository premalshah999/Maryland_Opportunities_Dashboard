import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Download, SlidersHorizontal } from 'lucide-react';

type DashboardGuide = {
  id: string;
  title: string;
  path: string;
  summary: string;
  image: string;
  filters: string[];
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
      'Visualizes demographic and socioeconomic data from ACS to compare population characteristics across states and districts.',
    image: '/assets/dashboard-reports/dashboard-report-01.png',
    filters: [
      'Level: choose State or Congressional District to set geographic granularity.',
      'Year: select reporting year for the ACS extract.',
      'Metric: choose population, income, poverty, labor, education, or related ACS measures.'
    ],
    insights: [
      'Summary statistics panel reports records, min, max, mean, and median for the selected metric.',
      'Quintile thresholds show breakpoints used for map coloring and percentile interpretation.',
      'Selected geography panel provides value, rank, quintile, and percentile for that location.'
    ],
    howToUse: [
      'Select Level, Year, and Metric in Parameters.',
      'Review the map distribution and quantile legend for spatial concentration.',
      'Click a state or district to inspect rank and percentile.',
      'Use Download Displayed Data to export the filtered map output.'
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
    image: '/assets/dashboard-reports/dashboard-report-02.png',
    filters: [
      'Level: State or Congressional District depending on the selected data slice.',
      'Year: choose fiscal year to compare historical patterns.',
      'Metric: select contracts, grants, direct payments, federal wages, and per-1000 variants.'
    ],
    insights: [
      'Summary statistics quantify spread and central tendency for the selected funding category.',
      'Thresholds and quintiles highlight where federal exposure is concentrated.',
      'Location detail provides value, ranking, and percentile for quick benchmarking.'
    ],
    howToUse: [
      'Start with a broad metric like Contracts or Grants at state level.',
      'Switch to per-1000 metrics for population-normalized comparisons.',
      'Move to district level for intra-state variation.',
      'Export displayed data for policy memos or agency briefings.'
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
      'Analyzes fiscal indicators of local government health using national Reason Foundation data.',
    image: '/assets/dashboard-reports/dashboard-report-03.png',
    filters: [
      'Geography/Level: select the available geographic unit for financial reporting.',
      'Year: choose reporting cycle to compare fiscal outcomes over time.',
      'Metric: select revenue, expenditure, debt, liabilities, and related finance indicators.'
    ],
    insights: [
      'Distribution statistics indicate relative fiscal standing within peer geographies.',
      'Quintile thresholds expose outliers and concentration of fiscal stress or resilience.',
      'Selected unit view provides rank and percentile for defensible comparison.'
    ],
    howToUse: [
      'Select a fiscal metric and year aligned with your policy question.',
      'Read map clusters first, then verify with the insights panel.',
      'Click specific geographies and compare rank shifts across years.',
      'Download dataset or displayed data for deeper modeling.'
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
    image: '/assets/dashboard-reports/dashboard-report-04.png',
    filters: [
      'Level: choose available geography for FINRA indicators.',
      'Year/Wave: select survey wave for consistent comparisons.',
      'Metric: select literacy, behavior, credit, savings, or stress-related indicators.'
    ],
    insights: [
      'Distribution metrics show where literacy and capability are strongest or weakest.',
      'Quintile boundaries make regional disparity visible and measurable.',
      'Selected geography panel contextualizes each location with rank and percentile.'
    ],
    howToUse: [
      'Pick a literacy or behavior metric and map high-low regions.',
      'Pair findings with Census and Spending dashboards for socioeconomic context.',
      'Use district/state comparisons for targeted financial education strategy.',
      'Export displayed data to support program evaluation.'
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
      'Shows directional movement of prime and subcontract federal contract dollars across agencies, states, and industries.',
    image: '/assets/dashboard-reports/dashboard-report-05.png',
    filters: [
      'Dataset and Geography: switch among state and district views.',
      'Industry and flow dimensions: view inflow, outflow, and net movement.',
      'Year and agency context: isolate specific periods and contract sources.'
    ],
    insights: [
      'Quantifies concentration of incoming versus outgoing contract activity.',
      'Highlights dependency channels and secondary economic linkages.',
      'Supports comparison of contract capture versus contract leakage.'
    ],
    howToUse: [
      'Start with a state-level map to identify inflow and outflow patterns.',
      'Drill into industry filters to identify sector-specific exposure.',
      'Use paired inflow/outflow views for economic network interpretation.',
      'Export filtered views for supply-chain and regional impact studies.'
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
    image: '/assets/dashboard-reports/dashboard-report-06.png',
    filters: [
      'Select state and year to focus the profile.',
      'Switch between spending categories and agency-specific lenses.',
      'Use chart interactions to compare top agencies and category composition.'
    ],
    insights: [
      'Combines map context with state detail and agency bar-chart rankings.',
      'Surfaces concentration risk by agency and category share.',
      'Supports interpretation of direct employment and wage dependency.'
    ],
    howToUse: [
      'Choose a state from the map to open focused detail.',
      'Review category totals and agency rankings together.',
      'Compare multiple states to identify structural differences.',
      'Download displayed view for stakeholder-ready reporting.'
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
    text: 'Choose domain, geography level, year, and metric from the sidebar to define the analysis scope.'
  },
  {
    title: 'Read Insights',
    text: 'Use summary statistics and quintile thresholds to interpret distribution and ranking context.'
  },
  {
    title: 'Export Results',
    text: 'Use Download Dataset for full source extracts, or Download Displayed Data for your active filtered view.'
  }
];

export const DashboardReports = () => {
  return (
    <div className="animate-fadeIn">
      <div className="bg-white py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <span className="text-umd-red font-bold uppercase tracking-widest text-xs mb-4 block">Dashboard Reports</span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 mb-6">How To Use The Dashboards</h1>
            <p className="text-xl text-gray-500 font-light">
              Detailed guidance on filters, insights, and interpretation for researchers, policymakers, and analysts.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="bg-white border border-gray-100 p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-umd-red mb-2">Step {index + 1}</div>
              <h3 className="text-lg font-serif text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 font-light leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mb-14 bg-white border border-gray-100 p-6 md:p-8">
          <h2 className="text-2xl font-serif text-gray-900 mb-3">Interface Reference</h2>
          <p className="text-sm text-gray-500 font-light mb-6">
            The Parameters and Insights tabs are the core interaction model across dashboards.
          </p>
          <img
            src="/assets/dashboard-reports/dashboard-report-07.png"
            alt="Parameters and insights sidebar reference"
            className="w-full border border-gray-100"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="space-y-14">
          {dashboardGuides.map((guide) => (
            <section key={guide.id} className="bg-white border border-gray-100 p-8 md:p-10">
              <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                <div className="lg:w-1/2">
                  <img
                    src={guide.image}
                    alt={`${guide.title} interface preview`}
                    className="w-full border border-gray-100"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="lg:w-1/2">
                  <h2 className="text-3xl font-serif text-gray-900 mb-3">{guide.title}</h2>
                  <p className="text-gray-500 font-light leading-relaxed mb-6">{guide.summary}</p>
                  <Link
                    to={guide.path}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:border-umd-red hover:text-umd-red transition-colors text-[11px] font-semibold tracking-[0.08em] uppercase mb-8"
                  >
                    <BarChart3 size={14} />
                    Open Dashboard
                    <ArrowRight size={12} />
                  </Link>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-900 mb-3 inline-flex items-center gap-2">
                        <SlidersHorizontal size={14} />
                        Dropdown Filters
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600 font-light">
                        {guide.filters.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-900 mb-3">Statistical Insights</h3>
                      <ul className="space-y-2 text-sm text-gray-600 font-light">
                        {guide.insights.map((item) => (
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
                        {guide.howToUse.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-gray-900 mb-3">Who It Helps</h3>
                      <div className="space-y-2 text-sm text-gray-600 font-light">
                        <p><span className="font-medium text-gray-800">Researchers:</span> {guide.value.researchers}</p>
                        <p><span className="font-medium text-gray-800">Policymakers:</span> {guide.value.policymakers}</p>
                        <p><span className="font-medium text-gray-800">Analysts:</span> {guide.value.analysts}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
