export type DropdownGuide = {
  control: string;
  controlType: string;
  options: string;
  impact: string;
  notes?: string;
};

export type DashboardGuide = {
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

export const dashboardGuides: DashboardGuide[] = [
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
    title: 'Federal Spending',
    path: '/dashboard/government-spending',
    summary:
      'Tracks federal contracts, grants, direct payments, and federal employee wages to show the distribution of federal funding.',
    dropdowns: [
      {
        control: 'Domain',
        controlType: 'Read-only field labeled Domain',
        options: 'Fixed to Federal Spending in this dedicated dashboard.',
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
        options: 'Available years for Federal Spending data at the chosen level.',
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
    id: 'federal-spending-agency',
    title: 'Federal Spending by Agency',
    path: '/dashboard/federal-spending-agency',
    summary:
      'Uses the federal spending dataset with an additional Top Agencies filter so you can isolate one agency and compare its footprint across states, counties, and congressional districts.',
    dropdowns: [
      {
        control: 'Domain',
        controlType: 'Read-only field labeled Domain',
        options: 'Fixed to Federal Spending by Agency in this dedicated dashboard.',
        impact: 'Keeps all controls scoped to agency-level federal spending records.'
      },
      {
        control: 'Level',
        controlType: 'Dropdown (Geography > Level)',
        options: 'State, County, and Congressional District where files are available.',
        impact: 'Changes aggregation scale and comparison group.'
      },
      {
        control: 'Year',
        controlType: 'Dropdown (Year > Year)',
        options: 'Available years for the selected level.',
        impact: 'Refreshes all values and rankings to the chosen reporting period.'
      },
      {
        control: 'Metric',
        controlType: 'Dropdown (Variable > Metric)',
        options: 'Contracts, Grants, Resident Wage, Direct Payments, Federal Residents, and per-1,000 variants.',
        impact: 'Defines the value used to rank and color each geography.'
      },
      {
        control: 'Top Agencies',
        controlType: 'Dropdown (Top Agencies > Agency)',
        options: 'All Agencies, plus the top agencies ranked for the selected level/year/metric.',
        impact: 'Filters the map and insights to one agency so agency-specific concentration patterns are visible.'
      }
    ],
    insights: [
      'Summary statistics are recalculated after agency filtering, so you get agency-specific distribution context.',
      'Top 10 and Bottom 10 cards show where a single agency is most and least concentrated.',
      'Clicked geography panel still reports value, rank, quintile, and percentile under the active agency filter.'
    ],
    howToUse: [
      'Select Level, Year, and Metric first so the Top Agencies list is ranked in the same context.',
      'Keep Agency = All Agencies for total footprint, then switch to one agency for drill-down.',
      'Compare agency-specific maps against the regular Federal Spending dashboard to separate composition from total size.',
      'Export displayed data when you need a single-agency comparison file.'
    ],
    value: {
      researchers: 'Supports agency-level spending concentration and exposure studies.',
      policymakers: 'Helps identify which agencies drive local federal dependence.',
      analysts: 'Enables fast agency-by-geography benchmarking without separate data prep.'
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
    title: 'Federal Spending Breakdown',
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

export const dashboardGuideOrder = [
  'census',
  'government-spending',
  'federal-spending-agency',
  'federal-spending-breaks',
  'government-finances',
  'finra-financial-literacy',
  'fund-flow'
];

export const orderedDashboardGuides = dashboardGuideOrder
  .map((id) => dashboardGuides.find((guide) => guide.id === id))
  .filter((guide): guide is DashboardGuide => Boolean(guide));
