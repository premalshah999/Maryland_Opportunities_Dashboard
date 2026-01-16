import { StateFlow, CongressFlow, CountyFlow, ViewLevel, FilterState, VisualFlow } from './types';

// --- DATA CACHE ---
let stateFlowsCache: StateFlow[] | null = null;
let congressFlowsCache: CongressFlow[] | null = null;
let countyFlowsCache: CountyFlow[] | null = null;

// Loading state callbacks
type ProgressCallback = (progress: number, message: string) => void;
let progressCallback: ProgressCallback | null = null;

export const setProgressCallback = (cb: ProgressCallback | null) => {
  progressCallback = cb;
};

// --- DATA LOADERS ---

async function loadStateFlows(): Promise<StateFlow[]> {
  if (stateFlowsCache) return stateFlowsCache;

  progressCallback?.(10, 'Loading state flows...');
  const response = await fetch('/data/state_flows.json');
  if (!response.ok) throw new Error('Failed to load state flows');

  progressCallback?.(50, 'Parsing state data...');
  stateFlowsCache = await response.json();
  progressCallback?.(100, 'State data loaded');

  return stateFlowsCache!;
}

async function loadCongressFlows(): Promise<CongressFlow[]> {
  if (congressFlowsCache) return congressFlowsCache;

  progressCallback?.(10, 'Loading district flows...');
  const response = await fetch('/data/congress_flows.json');
  if (!response.ok) throw new Error('Failed to load congress flows');

  progressCallback?.(50, 'Parsing district data...');
  congressFlowsCache = await response.json();
  progressCallback?.(100, 'District data loaded');

  return congressFlowsCache!;
}

async function loadCountyFlows(): Promise<CountyFlow[]> {
  if (countyFlowsCache) return countyFlowsCache;

  progressCallback?.(5, 'Loading county flows...');
  const response = await fetch('/data/county_flows.json');
  if (!response.ok) throw new Error('Failed to load county flows');

  // Stream large file with progress
  const contentLength = response.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength) : 0;

  if (total && response.body) {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      const pct = Math.floor((received / total) * 80) + 10;
      progressCallback?.(pct, `Loading county data: ${Math.round(received / 1024 / 1024)}MB / ${Math.round(total / 1024 / 1024)}MB`);
    }

    progressCallback?.(90, 'Parsing county data...');
    const allChunks = new Uint8Array(received);
    let position = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, position);
      position += chunk.length;
    }

    countyFlowsCache = JSON.parse(new TextDecoder().decode(allChunks));
  } else {
    progressCallback?.(50, 'Parsing county data...');
    countyFlowsCache = await response.json();
  }

  progressCallback?.(100, 'County data loaded');
  return countyFlowsCache!;
}

// --- OPTIONS INTERFACE ---
export interface ViewOptions {
  agencies: string[];
  states: string[];
  industries: string[];
  years: number[];
}

// --- VIEW-LEVEL SPECIFIC OPTIONS ---
export const getOptionsForView = async (viewLevel: ViewLevel): Promise<ViewOptions> => {
  if (viewLevel === ViewLevel.State) {
    const flows = await loadStateFlows();
    return {
      agencies: [...new Set(flows.map(f => f.agency_name))].filter(Boolean).sort(),
      states: [...new Set([
        ...flows.map(f => f.rcpt_state_name),
        ...flows.map(f => f.subawardee_state_name)
      ])].filter(Boolean).sort(),
      industries: [...new Set(flows.map(f => f.naics_nm))].filter(Boolean).sort(),
      years: [] // State flows don't have year field
    };
  } else if (viewLevel === ViewLevel.Congress) {
    const flows = await loadCongressFlows();
    return {
      agencies: [...new Set(flows.map(f => f.agency_name))].filter(Boolean).sort(),
      states: [...new Set([
        ...flows.map(f => f.rcpt_state),
        ...flows.map(f => f.subawardee_state)
      ])].filter(Boolean).sort(),
      industries: [],
      years: [...new Set(flows.map(f => f.act_dt_fis_yr))].filter(Boolean).sort((a, b) => a - b)
    };
  } else {
    const flows = await loadCountyFlows();
    return {
      agencies: [...new Set(flows.map(f => f.agency_name))].filter(Boolean).sort(),
      states: [...new Set([
        ...flows.map(f => f.rcpt_state),
        ...flows.map(f => f.subawardee_state)
      ])].filter(Boolean).sort(),
      industries: [],
      years: [...new Set(flows.map(f => f.act_dt_fis_yr))].filter(Boolean).sort((a, b) => a - b)
    };
  }
};

// --- FLOW RESULT INTERFACE ---
export interface FlowResult {
  displayFlows: VisualFlow[];  // Top 100 for map display
  aggregatedStats: {
    totalAmount: number;       // Sum of ALL filtered flows
    totalFlows: number;        // Count of ALL filtered flows
    uniqueLocations: number;   // Unique origins + destinations
  };
}

// --- MAIN FLOW GETTER ---

export const getFlows = async (filters: FilterState): Promise<FlowResult> => {
  let rawData: any[] = [];
  let mapFn: (item: any) => VisualFlow;
  let amountField: string;

  // Load appropriate data based on view level
  if (filters.viewLevel === ViewLevel.State) {
    rawData = await loadStateFlows();
    amountField = 'subaward_amount_year';
    mapFn = (item: StateFlow) => ({
      id: `${item.rcpt_state_name}-${item.subawardee_state_name}-${item.agency_code}-${item.naics_nm}`,
      origin_name: item.rcpt_state_name,
      dest_name: item.subawardee_state_name,
      origin_lat: item.origin_lat,
      origin_lon: item.origin_lon,
      dest_lat: item.dest_lat,
      dest_lon: item.dest_lon,
      amount: item.subaward_amount_year,
      agency: item.agency_name
    });
  } else if (filters.viewLevel === ViewLevel.Congress) {
    rawData = await loadCongressFlows();
    amountField = 'subaward_amount';
    mapFn = (item: CongressFlow) => ({
      id: `${item.rcpt_cd_name}-${item.subawardee_cd_name}-${item.act_dt_fis_yr}-${item.agency_name}`,
      origin_name: item.rcpt_full_name || item.rcpt_cd_name,
      dest_name: item.subawardee_full_name || item.subawardee_cd_name,
      origin_lat: item.origin_lat,
      origin_lon: item.origin_lon,
      dest_lat: item.dest_lat,
      dest_lon: item.dest_lon,
      amount: item.subaward_amount,
      agency: item.agency_name
    });
  } else {
    rawData = await loadCountyFlows();
    amountField = 'subaward_amount';
    mapFn = (item: CountyFlow) => ({
      id: `${item.rcpt_cty}-${item.subawardee_cty}-${item.act_dt_fis_yr}-${item.agency_name}`,
      origin_name: item.rcpt_full_name || item.rcpt_cty_name,
      dest_name: item.subawardee_full_name || item.subawardee_cty_name,
      origin_lat: item.origin_lat,
      origin_lon: item.origin_lon,
      dest_lat: item.dest_lat,
      dest_lon: item.dest_lon,
      amount: item.subaward_amount,
      agency: item.agency_name
    });
  }

  // --- FILTER LOGIC ---
  let filtered = rawData;

  // Filter by agency
  if (filters.agency && filters.agency !== 'All') {
    filtered = filtered.filter(d => d.agency_name === filters.agency);
  }

  // Filter by state (based on direction)
  if (filters.state && filters.state !== 'All') {
    if (filters.filterType === 'Origin') {
      filtered = filtered.filter(d => (d.rcpt_state_name || d.rcpt_state) === filters.state);
    } else if (filters.filterType === 'Destination') {
      filtered = filtered.filter(d => (d.subawardee_state_name || d.subawardee_state) === filters.state);
    } else {
      filtered = filtered.filter(d =>
        (d.rcpt_state_name || d.rcpt_state) === filters.state ||
        (d.subawardee_state_name || d.subawardee_state) === filters.state
      );
    }
  }

  // Filter by NAICS (state level only)
  if (filters.naics && filters.naics !== 'All' && filters.viewLevel === ViewLevel.State) {
    filtered = filtered.filter(d => (d as StateFlow).naics_nm === filters.naics);
  }

  // Filter by year (congress/county only)
  if (filters.viewLevel !== ViewLevel.State) {
    if (filters.yearStart) {
      filtered = filtered.filter(d => d.act_dt_fis_yr >= filters.yearStart);
    }
    if (filters.yearEnd) {
      filtered = filtered.filter(d => d.act_dt_fis_yr <= filters.yearEnd);
    }
  }

  // Exclude self-flows (same origin and destination)
  filtered = filtered.filter(d => {
    if (filters.viewLevel === ViewLevel.State) {
      return d.rcpt_state_name !== d.subawardee_state_name;
    } else if (filters.viewLevel === ViewLevel.Congress) {
      return d.rcpt_cd_name !== d.subawardee_cd_name;
    } else {
      return d.rcpt_cty !== d.subawardee_cty;
    }
  });

  // Calculate aggregated stats from ALL filtered data BEFORE slicing
  const totalAmount = filtered.reduce((sum, d) => sum + (d[amountField] || 0), 0);
  const totalFlows = filtered.length;

  // Get unique locations
  const uniqueLocations = new Set<string>();
  filtered.forEach(d => {
    if (filters.viewLevel === ViewLevel.State) {
      uniqueLocations.add(d.rcpt_state_name);
      uniqueLocations.add(d.subawardee_state_name);
    } else if (filters.viewLevel === ViewLevel.Congress) {
      uniqueLocations.add(d.rcpt_full_name || d.rcpt_cd_name);
      uniqueLocations.add(d.subawardee_full_name || d.subawardee_cd_name);
    } else {
      uniqueLocations.add(d.rcpt_full_name || d.rcpt_cty_name);
      uniqueLocations.add(d.subawardee_full_name || d.subawardee_cty_name);
    }
  });

  // Sort by amount descending and take top 100 for display only
  const sorted = filtered.sort((a, b) => {
    const amtA = a[amountField] || 0;
    const amtB = b[amountField] || 0;
    return amtB - amtA;
  });

  const displayFlows = sorted.slice(0, 100).map(mapFn);

  return {
    displayFlows,
    aggregatedStats: {
      totalAmount,
      totalFlows,
      uniqueLocations: uniqueLocations.size
    }
  };
};