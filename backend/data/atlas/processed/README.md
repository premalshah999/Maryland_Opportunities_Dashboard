# Database Structure & Variable Types

This project processes multiple datasets related to federal spending, demographics, municipal finance, and household financial health. The data is aggregated at three geographic levels: **State**, **County**, and **Congressional District (year-specific)**.

## 1. Geographic Variables

### County Level Files (`*_county.xlsx`)
- **`fips`** (Integer): Standard unique identifier for US counties (Federal Information Processing Standards).
- **`county`** (String): County name (clean, lowercase, without "County"/"Parish" suffix).
- **`state`** (String): Full state name (lowercase).

### State Level Files (`*_state.xlsx`)
- **`state`** (String): Full state name (lowercase).
- **Note:** Data is aggregated by summing county-level values for each state.

### Congressional District Level Files (`*_congress.xlsx`)
- **`cd_118`** (String): Unique identifier for the Congressional District associated with the row’s year.
  - Format: `SS-DD` (State Abbreviation - District Number).
  - Example: `AK-00` (Alaska At-large), `CA-12` (California 12th).
  - Note: the column name is fixed as `cd_118`, but the values correspond to the district map for that year (pre-2012 districts appear in 2010–2011 data; post-2022 districts appear in 2022+ data).
- **`state_str`** (String): State Abbreviation (e.g., `AL`, `NY`).

---

## 2. Dataset Descriptions

### A. Census Data (ACS)
**Source:** American Community Survey (ACS)
**File Output:** `acs_county.xlsx`, `acs_congress.xlsx`, `acs_state.xlsx`

**Variables:**
*   **Demographics:**
    *   `Total_population`, `Male`, `Female`
    *   **Age Groups:** `Under_5_years` ... `85_years_and_over`
    *   **Race:** `Race_Total`, `White`, `Black`, `Asian`, `Hispanic`, etc.
*   **Education:**
    *   `Less_than_9th_grade`, `High_school_graduate`, `Bachelor_degree`, `Graduate_or_professional_degree`, etc.
    *   Summary: `High_school_graduate_or_higher`, `Bachelor_degree_or_higher`.
*   **Income:**
    *   **Households by Income Bracket:** `Less_than_10000` ... `200000_or_more`.
    *   **Summary Stats:** `Median_household_income`, `Mean_household_income`.
*   **Poverty:**
    *   `Below_poverty_level`, `At_or_above_poverty_level`.

### B. Government Spending (Municipal Finance)
**Source:** Annual Survey of State and Local Government Finances
**File Output:** `gov_county.xlsx`, `gov_congress.xlsx`, `gov_state.xlsx`

**Variables (Aggregated):**
*   **Assets & Liabilities:** `Total_Assets`, `Total_Liabilities`, `Current_Assets`, `Current_Liabilities`, `Non-Current_Liabilities`.
*   **Debt & Pension:** `Bonds,_Loans_&_Notes` (Outstanding debt), `Net_Pension_Liability`, `Net_OPEB_Liability`.
*   **Position & Flow:** `Net_Position`, `Revenue`, `Expenses`, `Free_Cash_Flow`.
*   **Others:** `Compensated_Absences`.

**Note:** Variables ending in `_per_capita` and Ratio variables (`Current_Ratio`, `Debt_Ratio`) are **excluded** from aggregated sums (State/Congress level) to avoid statistical errors.

### C. Contract Data (Federal Awards)
**Source:** USAspending.gov (or similar federal contract database)
**File Output:** `contract_county.xlsx`, `contract_congress.xlsx`, `contract_state.xlsx`

**Variables:**
*   **Direct Obligations:**
    *   `fed_act_obl`: Federal Action Obligation (Direct federal spending in the county).
    *   `fed_act_obl_indirect`: Indirect obligation amounts.
*   **Subawards:**
    *   `subaward_amount_in`: Amount received as sub-awardee.
    *   `subaward_amount_out`: Amount distributed as prime contractor to sub-awardees.
    *   `subaward_amount_net_inflow`: Net subaward flow (`in` - `out`).
*   **Economic Context:**
    *   `employment`: Employment count.
    *   `residents`: Resident population count.

### D. FINRA (National Financial Capability Study)
**Source:** FINRA Investor Education Foundation
**File Output:** `finra_county.xlsx`, `finra_congress.xlsx`, `finra_state.xlsx`

**Variables:**
*   **`financial_constraint`**: An index measuring the degree of household financial constraint, constructed from indicators of liquidity stress, difficulty covering expenses, and lack of emergency savings.
*   **`fc_norm`**: A normalized version of the financial constraint index.
*   **`alternative_financing`**: An index capturing households’ reliance on nontraditional or high-cost credit sources (e.g., payday loans, pawn shops). Higher values indicate greater use.
*   **`af_norm`**: A normalized version of the alternative financing index.
*   **`financial_literacy`**: An index measuring objective financial knowledge based on correct responses to questions on interest compounding, inflation, bond prices, mortgages, etc.
*   **`fl_norm`**: A normalized version of the financial literacy index.
*   **`satisfied`**: Indicator (0/1). 1 if respondent reports high satisfaction with overall personal financial condition.
*   **`risk_averse`**: Indicator (0/1). 1 if respondent reports low willingness to take financial investment risk.
*   **`too_much_debt`**: Indicator (0/1). 1 if respondent strongly agrees they currently have too much debt.
*   **`high_fin_knowledge`**: Indicator (0/1). 1 if respondent self-assesses their overall financial knowledge as high.

### E. Federal Spending Breakdown (State Agencies)
**Source:** USAspending.gov + agency payroll aggregates
**File Output:** `spending_state.xlsx`

**Variables (Aggregated to State-Year):**
*   **`Contracts`**: Total federal contract obligations.
*   **`Grants`**: Total grant awards.
*   **`Resident Wage`**: Total resident wages tied to federal activity.
*   **`Direct Payments`**: Direct federal payments.
*   **`Federal Residents`**: Federal resident counts.
*   **`Employees`**: Federal employment counts.
*   **`Employees Wage`**: Federal employee wage totals.
*   **Per 1,000** variants for the above (columns ending in `Per 1000`).

### F. Federal Spending by Agency
**Source:** USAspending.gov  
**File Output:** `contract_state.xlsx`, `contract_county.xlsx`, `contract_congress.xlsx` under `contract_agency/`

**Variables:**
*   **`agency`**: Federal awarding agency.
*   **Metrics:** `Contracts`, `Grants`, `Resident Wage`, `Direct Payments`, `Federal Residents`, and per-1,000 variants.
*   **State file only:** `Employees`, `Employees Wage`, and per-1,000 variants.

This dataset is used by the “Federal Spending by Agency” dashboard and enables agency-level filtering on top of the baseline federal spending view.
