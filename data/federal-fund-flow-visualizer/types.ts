export enum ViewLevel {
  State = 'State',
  Congress = 'Congress',
  County = 'County'
}

export interface StateFlow {
  rcpt_state_name: string;
  subawardee_state_name: string;
  naics_nm: string;
  agency_code: number;
  agency_name: string;
  origin_lat: number;
  origin_lon: number;
  dest_lat: number;
  dest_lon: number;
  subaward_amount_year: number;
}

export interface CongressFlow {
  prime_awardee_stcd118: number;
  subawardee_stcd118: number;
  rcpt_cd_name: string;
  subawardee_cd_name: string;
  rcpt_state: string;
  subawardee_state: string;
  rcpt_full_name: string;
  subawardee_full_name: string;
  act_dt_fis_yr: number;
  subaward_amount: number;
  agency_name: string;
  origin_lat: number;
  origin_lon: number;
  dest_lat: number;
  dest_lon: number;
}

export interface CountyFlow {
  rcpt_cty: number;
  subawardee_cty: number;
  rcpt_cty_name: string;
  subawardee_cty_name: string;
  rcpt_state: string;
  subawardee_state: string;
  rcpt_full_name: string;
  subawardee_full_name: string;
  act_dt_fis_yr: number;
  subaward_amount: number;
  agency_name: string;
  origin_lat: number;
  origin_lon: number;
  dest_lat: number;
  dest_lon: number;
}

// Generic Flow interface for mapping
export interface VisualFlow {
  id: string;
  origin_name: string;
  dest_name: string;
  origin_lat: number;
  origin_lon: number;
  dest_lat: number;
  dest_lon: number;
  amount: number;
  agency: string;
}

export interface FilterState {
  viewLevel: ViewLevel;
  agency: string;
  state: string;
  filterType: 'All' | 'Origin' | 'Destination';
  yearStart: number;
  yearEnd: number;
  naics: string;
  district: string;
  county: string;
}

export interface AppStatistics {
  totalAmount: number;
  numberOfFlows: number;
  displayedFlows: number;
  displayedAmount: number;
  averageFlow: number;
  locationsInvolved: number;
  period: string;
  topAgencies: Array<{ name: string; amount: number }>;
  largestFlow: { origin: string; dest: string; amount: number; agency: string } | null;
  topOrigins: Array<{ name: string; amount: number }>;
  topDestinations: Array<{ name: string; amount: number }>;
}

