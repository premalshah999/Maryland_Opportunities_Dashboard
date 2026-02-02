export const QUINTILE_COLORS = ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"];

export const LEVEL_LABELS = {
  state: "State",
  county: "County",
  congress: "Congressional District"
};

export const FLOW_LEVEL_LABELS = {
  state: "State",
  county: "County",
  congress: "Congressional District"
};

export const FLOW_DIRECTIONS = [
  { value: "All", label: "All", tone: "all" },
  { value: "Inflow", label: "Inflow", tone: "inflow" },
  { value: "Outflow", label: "Outflow", tone: "outflow" }
];

export const BASE_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export const US_BOUNDS = [
  [-125.5, 24.2],
  [-66.9, 49.8]
];

export const VARIABLE_LABEL_OVERRIDES = {
  contract_static: {
    fed_act_obl: "Federal Contracts",
    fed_act_obl_indirect: "Federal Contracts (Indirect)",
    subaward_amount_out: "Sub-Contract Out",
    subaward_amount_in: "Sub-Contract In",
    subaward_amount_net_inflow: "Net Sub-Contract",
    fed_act_obl_per_1000: "Federal Contracts per 1,000 Residents",
    fed_act_obl_indirect_per_1000: "Federal Contracts (Indirect) per 1,000 Residents",
    subaward_amount_net_inflow_per_1000: "Net Sub-Contract per 1,000 Residents"
  },
  spending_breakdown: {
    "Contracts": "Federal Contracts",
    "Contracts Per 1000": "Federal Contracts per 1,000 Residents",
    "Grants": "Federal Grants",
    "Grants Per 1000": "Federal Grants per 1,000 Residents",
    "Resident Wage": "Resident Wages",
    "Resident Wage Per 1000": "Resident Wages per 1,000 Residents",
    "Direct Payments": "Direct Payments",
    "Direct Payments Per 1000": "Direct Payments per 1,000 Residents",
    "Federal Residents": "Federal Residents",
    "Federal Residents Per 1000": "Federal Residents per 1,000 Residents",
    "Employees": "Federal Employees",
    "Employees Per 1000": "Federal Employees per 1,000 Residents",
    "Employees Wage": "Federal Employee Wages",
    "Employees Wage Per 1000": "Federal Employee Wages per 1,000 Residents"
  }
};

export const TOUR_STEPS = [
  {
    title: "What This Is",
    body: "Maryland Opportunity is a data atlas for comparing socioeconomic and fiscal indicators across the U.S. at multiple geographies.",
    bullets: [
      "Built for researchers, policy teams, and planners",
      "Highlights spatial patterns and outliers",
      "Fast, comparable views across datasets"
    ]
  },
  {
    title: "What Data You Are Seeing",
    body: "Four curated datasets cover demographics, government finance, federal contracts, and financial capability.",
    bullets: [
      "Census (ACS): demographics, education, income, poverty",
      "Government Finances: assets, liabilities, revenue, expenses",
      "Federal Spending: obligations and subaward flows",
      "FINRA: financial literacy and household health indices"
    ]
  },
  {
    title: "How It Helps",
    body: "Use this to spot regional disparities, benchmark places, and compare how different indicators move together.",
    bullets: [
      "Compare counties within a state",
      "Find high or low outliers quickly",
      "Use quintiles for easy cross-region context"
    ]
  },
  {
    title: "Choose Geography",
    body: "Select a level to match your question. The map updates instantly.",
    bullets: [
      "State: broad comparisons",
      "County: local detail",
      "Congressional district: policy boundaries"
    ]
  },
  {
    title: "Pick Variables",
    body: "Variables depend on dataset. The legend always shows quintile breaks for the selected metric.",
    bullets: [
      "Darker red means higher values",
      "Lighter red means lower values",
      "Missing values are not shaded"
    ]
  },
  {
    title: "Read the Map",
    body: "Hover for quick context. Click to pin a detailed card with rank and thresholds.",
    bullets: [
      "Hover shows name, value, quintile",
      "Click opens a full detail card",
      "Click empty space to clear"
    ]
  },
  {
    title: "Use Insights",
    body: "Switch to Insights for summary stats, top/bottom lists, and thresholds.",
    bullets: [
      "Mean, median, min, max",
      "Top 10 and bottom 10 locations",
      "Quintile threshold values"
    ]
  },
  {
    title: "Explore Fund Flow",
    body: "Switch to the Fund Flow view to see federal dollars moving between regions.",
    bullets: [
      "State, county, or congressional flows",
      "Filter by agency and direction",
      "Top 100 flows plotted for clarity"
    ]
  }
];
