import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { ViewLevel, FilterState, VisualFlow, AppStatistics } from './types';
import { getOptionsForView, getFlows, ViewOptions, FlowResult } from './services';
import { formatCurrency, formatNumber } from './utils';
import { Dropdown, RadioGroup, SidebarTab, SectionHeading, StatRow, Icons } from './components';
import MapVisualization from './Map';

const MIN_SIDEBAR_WIDTH = 250;
const MAX_SIDEBAR_WIDTH = 600;
const COLLAPSED_WIDTH = 64;

const App: React.FC = () => {
  // UI State
  const [activeTab, setActiveTab] = useState<'parameters' | 'statistics'>('parameters');
  const [viewLevel, setViewLevel] = useState<ViewLevel>(ViewLevel.State);

  // Sidebar State
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Data State
  const [flows, setFlows] = useState<VisualFlow[]>([]);
  const [aggregatedStats, setAggregatedStats] = useState<{ totalAmount: number; totalFlows: number; uniqueLocations: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Options (view-level specific)
  const [agencyOptions, setAgencyOptions] = useState<string[]>([]);
  const [stateOptions, setStateOptions] = useState<string[]>([]);
  const [industryOptions, setIndustryOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<number[]>([]);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    viewLevel: ViewLevel.State,
    agency: 'All',
    state: 'All',
    filterType: 'All',
    yearStart: 2011,
    yearEnd: 2024,
    naics: 'All',
    district: 'All',
    county: 'All'
  });

  // Load Options when view changes
  useEffect(() => {
    getOptionsForView(viewLevel).then((options: ViewOptions) => {
      setAgencyOptions(options.agencies);
      setStateOptions(options.states);
      setIndustryOptions(options.industries);
      setYearOptions(options.years);

      // Update year range if years are available
      if (options.years.length > 0) {
        setFilters(prev => ({
          ...prev,
          yearStart: Math.min(...options.years),
          yearEnd: Math.max(...options.years)
        }));
      }
    });
  }, [viewLevel]);

  // Load Flows
  useEffect(() => {
    setLoading(true);
    getFlows({ ...filters, viewLevel }).then((result: FlowResult) => {
      setFlows(result.displayFlows);
      setAggregatedStats(result.aggregatedStats);
      setLoading(false);
    });
  }, [filters, viewLevel]);

  // Handle Resizing
  const startResizing = useCallback(() => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth > MIN_SIDEBAR_WIDTH && newWidth < MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Statistics Calculation - now uses aggregatedStats for totals
  const stats: AppStatistics = useMemo(() => {
    // Use aggregated stats from server for accurate totals
    const totalAmount = aggregatedStats?.totalAmount ?? 0;
    const totalFlows = aggregatedStats?.totalFlows ?? 0;
    const locationsCount = aggregatedStats?.uniqueLocations ?? 0;

    // Calculate displayed amounts from top 100 flows
    const displayedAmount = flows.reduce((sum, f) => sum + f.amount, 0);

    // Top Agencies (from displayed flows)
    const agencyMap: Record<string, number> = {};
    flows.forEach(f => {
      agencyMap[f.agency] = (agencyMap[f.agency] || 0) + f.amount;
    });
    const topAgencies = Object.entries(agencyMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Top Origins (outflows)
    const originMap: Record<string, number> = {};
    flows.forEach(f => {
      originMap[f.origin_name] = (originMap[f.origin_name] || 0) + f.amount;
    });
    const topOrigins = Object.entries(originMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Top Destinations (inflows)
    const destMap: Record<string, number> = {};
    flows.forEach(f => {
      destMap[f.dest_name] = (destMap[f.dest_name] || 0) + f.amount;
    });
    const topDestinations = Object.entries(destMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Largest Single Flow
    const sortedFlows = [...flows].sort((a, b) => b.amount - a.amount);
    const largestFlow = sortedFlows.length > 0
      ? { origin: sortedFlows[0].origin_name, dest: sortedFlows[0].dest_name, amount: sortedFlows[0].amount, agency: sortedFlows[0].agency }
      : null;

    return {
      totalAmount,
      numberOfFlows: totalFlows,
      displayedFlows: flows.length,
      displayedAmount,
      averageFlow: totalFlows ? totalAmount / totalFlows : 0,
      locationsInvolved: locationsCount,
      period: viewLevel === ViewLevel.State ? 'All Years' : `${filters.yearStart}-${filters.yearEnd}`,
      topAgencies,
      largestFlow,
      topOrigins,
      topDestinations
    };
  }, [flows, aggregatedStats, filters.yearStart, filters.yearEnd, viewLevel]);

  const handleViewChange = (lvl: ViewLevel) => {
    setViewLevel(lvl);
    setFilters(prev => ({ ...prev, viewLevel: lvl, state: 'All', district: 'All', county: 'All' }));
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`flex h-screen w-full bg-slate-50/50 overflow-hidden font-sans text-slate-900 ${isResizing ? 'cursor-col-resize select-none' : ''}`}
    >

      {/* --- Sidebar (Resizable & Collapsible) --- */}
      <aside
        ref={sidebarRef}
        className="flex-shrink-0 bg-white border-r border-slate-200 flex flex-col z-20 relative transition-all duration-300 ease-in-out"
        style={{ width: isCollapsed ? COLLAPSED_WIDTH : sidebarWidth }}
      >

        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 bg-white overflow-hidden whitespace-nowrap">
          {!isCollapsed && (
            <div className="transition-opacity duration-300">
              <h1 className="font-serif text-slate-900 font-semibold text-lg tracking-tight">
                Fund Flow
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-[0.2em] uppercase mt-0.5">
                Analytics Platform
              </p>
            </div>
          )}
          {isCollapsed && (
            <div className="w-full flex justify-center">
              <span className="font-serif font-semibold text-lg text-slate-900">FF</span>
            </div>
          )}
          <button
            onClick={toggleCollapse}
            className="p-2 rounded-sm hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors ml-auto"
          >
            {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex border-b border-slate-200 bg-slate-50/30 ${isCollapsed ? 'flex-col' : ''}`}>
          <SidebarTab
            label="Parameters"
            active={activeTab === 'parameters'}
            onClick={() => setActiveTab('parameters')}
            icon={<Icons.Settings />}
            collapsed={isCollapsed}
          />
          <SidebarTab
            label="Insights"
            active={activeTab === 'statistics'}
            onClick={() => setActiveTab('statistics')}
            icon={<Icons.Chart />}
            collapsed={isCollapsed}
          />
        </div>

        {/* Scrollable Content */}
        {!isCollapsed ? (
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {activeTab === 'parameters' ? (
              <div className="animate-fade-in space-y-6">

                {/* Scope Selection */}
                <div>
                  <SectionHeading title="Scope" />
                  <div className="space-y-2">
                    {Object.values(ViewLevel).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => handleViewChange(lvl)}
                        className={`w-full px-4 py-3 text-[11px] font-medium uppercase tracking-[0.15em] border transition-all text-left flex justify-between items-center
                          ${viewLevel === lvl
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-[#E31837] hover:text-[#E31837]'
                          }`}
                      >
                        {lvl === ViewLevel.Congress ? 'Congressional' : lvl} Level
                        {viewLevel === lvl && <span className="text-[10px] opacity-70"><Icons.Globe /></span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <SectionHeading title="Dimensions" />
                  <Dropdown
                    label="Agency"
                    options={agencyOptions}
                    value={filters.agency}
                    onChange={(e) => updateFilter('agency', e.target.value)}
                  />

                  <Dropdown
                    label="State"
                    options={stateOptions}
                    value={filters.state}
                    onChange={(e) => updateFilter('state', e.target.value)}
                  />

                  {viewLevel === ViewLevel.State && (
                    <Dropdown
                      label="NAICS Code"
                      options={industryOptions}
                      value={filters.naics}
                      onChange={(e) => updateFilter('naics', e.target.value)}
                    />
                  )}

                  {(viewLevel === ViewLevel.Congress || viewLevel === ViewLevel.County) && yearOptions.length > 0 && (
                    <>
                      <Dropdown
                        label="Year Start"
                        options={yearOptions.map(y => String(y))}
                        value={filters.yearStart}
                        onChange={(e) => updateFilter('yearStart', parseInt(e.target.value))}
                      />
                      <Dropdown
                        label="Year End"
                        options={yearOptions.map(y => String(y))}
                        value={filters.yearEnd}
                        onChange={(e) => updateFilter('yearEnd', parseInt(e.target.value))}
                      />
                    </>
                  )}
                </div>

                {/* Toggles */}
                <div>
                  <SectionHeading title="Direction" />
                  <RadioGroup
                    label="Flow Type"
                    options={['All', 'Origin', 'Destination']}
                    value={filters.filterType}
                    onChange={(val) => updateFilter('filterType', val)}
                  />
                </div>
              </div>
            ) : (
              <div className="animate-fade-in space-y-5">

                {/* Descriptive Statistics Header */}
                <div>
                  <SectionHeading title="Descriptive Statistics" />
                </div>

                {/* Overall Summary */}
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Overall Summary</p>
                  <div className="bg-slate-900 text-white p-4 mb-3">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-2xl font-mono font-light">{formatCurrency(stats.totalAmount)}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2 space-y-1">
                    <StatRow label="Period" value={stats.period} />
                    <StatRow label="Total Flows" value={formatNumber(stats.numberOfFlows)} />
                    <StatRow label="Displayed (Top 100)" value={formatNumber(stats.displayedFlows)} />
                    <StatRow label="Displayed Amount" value={formatCurrency(stats.displayedAmount)} />
                  </div>
                </div>

                {/* Top 5 Agencies/Departments */}
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Top 5 Agencies/Departments</p>
                  <div className="space-y-2">
                    {stats.topAgencies.map((agency, i) => (
                      <div key={agency.name} className="bg-slate-50 border border-slate-100 p-2">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-bold text-slate-400">{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-medium text-slate-700 truncate">{agency.name}</p>
                            <p className="text-[12px] font-mono font-semibold text-slate-900">{formatCurrency(agency.amount)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Largest Single Flow */}
                {stats.largestFlow && (
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Largest Single Flow</p>
                    <div className="bg-slate-900 text-white p-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wide">From</p>
                          <p className="text-[11px] font-medium">{stats.largestFlow.origin}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wide">To</p>
                          <p className="text-[11px] font-medium">{stats.largestFlow.dest}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-700">
                          <p className="text-xl font-mono font-light">{formatCurrency(stats.largestFlow.amount)}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wide">Agency</p>
                          <p className="text-[10px] text-slate-300 truncate">{stats.largestFlow.agency}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Top 5 Origins (Outflows) */}
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-2">
                    Top 5 Origin {viewLevel === ViewLevel.State ? 'States' : viewLevel === ViewLevel.Congress ? 'Districts' : 'Counties'} (Outflows)
                  </p>
                  <div className="space-y-1">
                    {stats.topOrigins.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2 py-1 border-b border-slate-100 last:border-0">
                        <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}.</span>
                        <span className="text-[11px] text-slate-600 flex-1 truncate">{item.name}</span>
                        <span className="text-[11px] font-mono font-medium text-slate-900">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top 5 Destinations (Inflows) */}
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-2">
                    Top 5 Destination {viewLevel === ViewLevel.State ? 'States' : viewLevel === ViewLevel.Congress ? 'Districts' : 'Counties'} (Inflows)
                  </p>
                  <div className="space-y-1">
                    {stats.topDestinations.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2 py-1 border-b border-slate-100 last:border-0">
                        <span className="text-[10px] font-bold text-slate-400 w-4">{i + 1}.</span>
                        <span className="text-[11px] text-slate-600 flex-1 truncate">{item.name}</span>
                        <span className="text-[11px] font-mono font-medium text-slate-900">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Filters */}
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide mb-2">Active Filters</p>
                  <div className="bg-slate-50 border border-slate-100 p-2 space-y-1">
                    <StatRow label="View Level" value={viewLevel === ViewLevel.Congress ? 'Congressional' : viewLevel} />
                    <StatRow label="State" value={filters.state} />
                    <StatRow label="Agency" value={filters.agency} />
                    <StatRow label="Filter Type" value={filters.filterType} />
                    {viewLevel !== ViewLevel.State && (
                      <StatRow label="Year Range" value={`${filters.yearStart}-${filters.yearEnd}`} />
                    )}
                    {viewLevel === ViewLevel.State && filters.naics !== 'All' && (
                      <StatRow label="NAICS" value={filters.naics} />
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center pt-4 gap-4">
            {/* Collapsed view content (icons only) */}
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <span className="text-xs font-bold">{flows.length > 99 ? '99+' : flows.length}</span>
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        {!isCollapsed && (
          <div className="h-12 border-t border-slate-100 flex items-center justify-center bg-white">
            <p className="text-[10px] text-slate-400 tracking-[0.2em] uppercase">
              USA Spending Data
            </p>
          </div>
        )}

        {/* Resize Handle */}
        {!isCollapsed && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-slate-300 cursor-col-resize z-50 transition-colors"
            onMouseDown={startResizing}
          />
        )}
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 relative flex flex-col bg-slate-100">

        {/* Floating Context Header */}
        <div className="absolute top-5 left-5 z-10 pointer-events-none">
          <div className="bg-white/90 backdrop-blur border border-slate-200 px-4 py-2 shadow-sm">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {viewLevel === ViewLevel.Congress ? 'Congressional Districts' : `${viewLevel} Level`} View
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] text-slate-500 font-mono">
                LIVE DATA • {filters.yearStart}-{filters.yearEnd}
              </p>
            </div>
          </div>
        </div>

        {/* Map Container - Full canvas with internal borders */}
        <div className="flex-1 m-5 bg-white border border-slate-300 shadow-sm relative overflow-hidden">
          <MapVisualization
            data={flows}
            isLoading={loading}
            viewTitle={viewLevel}
          />
        </div>
      </main>

    </div>
  );
};

export default App;