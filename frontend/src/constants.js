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
    Contracts: "Contracts",
    "Contracts Per 1000": "Contracts per 1,000 Residents",
    Grants: "Grants",
    "Grants Per 1000": "Grants per 1,000 Residents",
    "Resident Wage": "Resident Wage",
    "Resident Wage Per 1000": "Resident Wage per 1,000 Residents",
    "Direct Payments": "Direct Payments",
    "Direct Payments Per 1000": "Direct Payments per 1,000 Residents",
    "Federal Residents": "Federal Residents",
    "Federal Residents Per 1000": "Federal Residents per 1,000 Residents",
    Employees: "Employees",
    "Employees Per 1000": "Employees per 1,000 Residents",
    "Employees Wage": "Employees Wage",
    "Employees Wage Per 1000": "Employees Wage per 1,000 Residents"
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
