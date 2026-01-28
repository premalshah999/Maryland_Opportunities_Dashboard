export const METADATA = {
  "datasets": {
    "census": {
      "name": "Census (ACS Demographics)",
      "sourceName": "American Community Survey (ACS) 5-Year Estimates",
      "sourceUrl": "https://data.census.gov/",
      "coverage": "County-level ACS 5-year estimates (2010-2023) aggregated to state and congressional district.",
      "description": "Demographics, race/ethnicity, education, income, housing, and poverty indicators across U.S. geographies."
    },
    "gov_spending": {
      "name": "Government Finances",
      "sourceName": "Annual Survey of State and Local Government Finances",
      "sourceUrl": "https://govfinance.reason.org/",
      "coverage": "Fiscal year 2023 county-level data aggregated to state and congressional district.",
      "description": "Government fiscal health, assets, liabilities, revenues, expenses, and per-capita measures."
    },
    "contract_static": {
      "name": "Federal Spending",
      "sourceName": "USAspending.gov",
      "sourceUrl": "https://usaspending.gov/",
      "coverage": "Federal contract obligations and subaward flows by county, congressional district, and state (2020-2024 average and annual values where available).",
      "description": "Direct obligations, indirect obligations, and subaward flows, including per-capita metrics."
    },
    "finra": {
      "name": "FINRA Financial Literacy",
      "sourceName": "FINRA National Financial Capability Study",
      "sourceUrl": "https://www.usfinancialcapability.org/",
      "coverage": "County and congressional district (2021); state (2009, 2012, 2015, 2018, 2021).",
      "description": "Financial capability indices and survey responses."
    }
  },
  "variables": {
    "census": {
      "county": "County name",
      "state": "State name",
      "fips": "FIPS code",
      "Year": "Survey year",
      "Total population": "Total population (ACS 5-year estimate)",
      "Age 18-65": "Working-age population (age 18 to 65)",
      "White": "Population by race: White",
      "Black": "Population by race: Black",
      "Asian": "Population by race: Asian",
      "Hispanic": "Population by ethnicity: Hispanic or Latino origin",
      "Education >= High School": "Educational attainment (age >= 25): High school graduate or higher",
      "Education >= Bachelor's": "Educational attainment (age >= 25): Bachelor degree or higher",
      "Education >= Graduate": "Educational attainment (age >= 25): Graduate or professional degree",
      "# of household": "Total number of households",
      "Income >$50K": "Households with income: more than $50,000",
      "Income >$100K": "Households with income: more than $100,000",
      "Income >$200K": "Households with income: more than $200,000",
      "Median household income": "Median household income (USD)",
      "Below poverty": "Population with poverty status: Below poverty level",
      "Owner occupied": "Housing units: Owner occupied",
      "Renter occupied": "Housing units: Renter occupied"
    },
    "gov_spending": {
      "Total_Assets": "Total combined value of all resources owned by a government, including financial assets (cash, investments, receivables) and nonfinancial assets (land, buildings, infrastructure)",
      "Current_Assets": "Resources expected to be used within one year, including cash, short-term investments, and receivables",
      "Total_Liabilities": "Total amount of debt and other obligations owed by a government, reflecting the accumulation of debt-financed spending",
      "Current_Liabilities": "Total liabilities that are due to be paid within one year",
      "Non-Current_Liabilities": "Calculated: Obligations not due within one year (long-term bonds, pension liabilities, OPEB liabilities). (Total Liabilities - Current Liabilities)",
      "Net_Position": "Calculated: Difference between total assets and total liabilities, representing the government's equity or net worth (Total Assets - Total Liabilities)",
      "Net_Pension_Liability": "Calculated: Net pension liability representing unfunded pension benefits promised to employees",
      "Net_OPEB_Liability": "Calculated: Net OPEB liability representing unfunded post-employment benefits (e.g., health care) promised to employees",
      "Bonds,_Loans_&_Notes": "Calculated: Total debt instruments issued by the government, including bonds, loans, and notes payable",
      "Compensated_Absences": "Liability for earned but unused vacation and sick leave compensation owed to employees",
      "Revenue": "Income from taxes, fees, grants, and other sources that fund government operations and services",
      "Expenses": "Cost of providing services, including salaries, benefits, supplies, and infrastructure maintenance",
      "Debt_Ratio": "Calculated: Total Liabilities / Total Assets. Measures proportion of assets financed by debt",
      "Current_Ratio": "Calculated: Current Assets / Current Liabilities. Measures ability to pay short-term obligations (liquidity)",
      "Free_Cash_Flow": "Calculated: Total Revenue - (Total Expenses + Current Liabilities). Measures ability to repay debts and fund operations",
      "POPULATION": "Population count from U.S. Census Bureau",
      "Total_Liabilities_per_capita": "Total Liabilities / Population",
      "Total_Assets_per_capita": "Total Assets / Population",
      "Current_Assets_per_capita": "Current Assets / Population",
      "Current_Liabilities_per_capita": "Current Liabilities / Population",
      "Non-Current_Liabilities_per_capita": "Non-Current Liabilities / Population",
      "Net_Position_per_capita": "Net Position / Population",
      "Net_Pension_Liability_per_capita": "Net Pension Liability / Population",
      "Net_OPEB_Liability_per_capita": "Net OPEB Liability / Population",
      "Bonds,_Loans_&_Notes_per_capita": "Bonds, Loans & Notes / Population",
      "Compensated_Absences_per_capita": "Compensated Absences / Population",
      "Revenue_per_capita": "Total Revenue / Population",
      "Expenses_per_capita": "Total Expenses / Population",
      "Free_Cash_Flow_per_capita": "Free Cash Flow / Population"
    },
    "contract_static": {
      "state": "State name",
      "Federal Contracts": "Federal contract obligations (direct spending)",
      "Federal Contracts (Indirect)": "Adjusted federal contract obligations (direct + net subaward inflow)",
      "Sub-contract Out": "Subaward amount paid out (outflow)",
      "Sub-Contract In": "Subaward amount received (inflow)",
      "Net Sub-Contract": "Net subaward inflow (in minus out)",
      "Federal Contracts per 1000 residents": "Federal contract obligations per 1,000 residents",
      "Federal Contracts (Indirect) per 1000 residents": "Adjusted federal contract obligations per 1,000 residents",
      "Net Sub-Contract per 1000 residents": "Net subaward inflow per 1,000 residents",
      "Employees": "Federal government employment count",
      "Resident": "Federal government resident employee count"
    },
    "finra": {
      "financial_constraint": "Financial Constraint (Normalized)",
      "alternative_financing": "Alternative Financing (Normalized)",
      "financial_literacy": "Financial Literacy (Normalized)",
      "satisfied": "Share Financially Satisfied",
      "risk_averse": "Share Risk Averse"
    }
  }
};
