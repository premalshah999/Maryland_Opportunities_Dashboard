import { useEffect, useMemo, useRef, useState } from "react";
import { METADATA } from "./metadata.js";
import { Icons } from "./components/common/Icons.jsx";
import { LEVEL_LABELS } from "./constants.js";
import {
  formatCurrencyRounded,
  formatNumber,
  getVariableLabel
} from "./lib/formatters.js";
import { fetchJson } from "./lib/api.js";
import { AtlasFiltersPanel } from "./components/atlas/AtlasFiltersPanel.jsx";
import { FlowFiltersPanel } from "./components/flow/FlowFiltersPanel.jsx";
import { AtlasInsightsPanel } from "./components/atlas/AtlasInsightsPanel.jsx";
import { FlowInsightsPanel } from "./components/flow/FlowInsightsPanel.jsx";
import { AtlasMapPanel } from "./components/atlas/AtlasMapPanel.jsx";
import { FlowMapPanel } from "./components/flow/FlowMapPanel.jsx";
import { SpendingFiltersPanel } from "./components/spending/SpendingFiltersPanel.jsx";
import { SpendingInsightsPanel } from "./components/spending/SpendingInsightsPanel.jsx";
import { SpendingMapPanel } from "./components/spending/SpendingMapPanel.jsx";
import { TourOverlay } from "./components/common/TourOverlay.jsx";

export default function App() {
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const [isResizing, setIsResizing] = useState(false);
  const [viewMode, setViewMode] = useState("atlas");
  const [datasets, setDatasets] = useState([]);
  const [dataset, setDataset] = useState("");
  const [level, setLevel] = useState("");
  const [variables, setVariables] = useState([]);
  const [variable, setVariable] = useState("");
  const [years, setYears] = useState([]);
  const [year, setYear] = useState("");
  const [valuesData, setValuesData] = useState(null);
  const [geoCache, setGeoCache] = useState({});
  const [tab, setTab] = useState("filters");
  const [atlasStatus, setAtlasStatus] = useState({ state: "ready", message: "Ready" });
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [flowSelected, setFlowSelected] = useState(null);
  const [flowLevel, setFlowLevel] = useState("state");
  const [flowOptions, setFlowOptions] = useState({
    agencies: [],
    states: [],
    industries: [],
    years: []
  });
  const [flowOptionsLevel, setFlowOptionsLevel] = useState("");
  const [flowFilters, setFlowFilters] = useState({
    agency: "All",
    state: "All",
    direction: "All",
    naics: "All",
    yearStart: null,
    yearEnd: null,
    flowRange: "top50"
  });
  const [flowData, setFlowData] = useState(null);
  const [flowStatus, setFlowStatus] = useState({ state: "ready", message: "Ready" });
  const [spendingVariables, setSpendingVariables] = useState([]);
  const [spendingYears, setSpendingYears] = useState([]);
  const [spendingMetric, setSpendingMetric] = useState("");
  const [spendingYear, setSpendingYear] = useState("");
  const [spendingValuesData, setSpendingValuesData] = useState(null);
  const [spendingStatus, setSpendingStatus] = useState({ state: "ready", message: "Ready" });
  const [spendingSelectedState, setSpendingSelectedState] = useState("ALL");
  const [spendingDetailRecords, setSpendingDetailRecords] = useState([]);
  const [spendingDetailLoading, setSpendingDetailLoading] = useState(false);
  const [spendingViewType, setSpendingViewType] = useState("amount");
  const [spendingSelectedAgency, setSpendingSelectedAgency] = useState("ALL");
  const [spendingSelectedFeature, setSpendingSelectedFeature] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const resizeRef = useRef({ startX: 0, startWidth: 360 });
  const spendingMetaLoadedRef = useRef(false);
  const spendingValuesCacheRef = useRef(new Map());
  const spendingDetailCacheRef = useRef(new Map());

  useEffect(() => {
    fetchJson("/api/datasets")
      .then((data) => setDatasets(data.datasets || []))
      .catch(() => setAtlasStatus({ state: "error", message: "Failed to load datasets" }));
  }, []);

  const datasetLevels = useMemo(() => {
    const selected = datasets.find((item) => item.key === dataset);
    return selected?.levels?.length ? selected.levels : ["state", "county", "congress"];
  }, [datasets, dataset]);

  useEffect(() => {
    if (!dataset || !datasetLevels.length) return;
    if (!level || !datasetLevels.includes(level)) {
      setLevel(datasetLevels[0]);
    }
  }, [dataset, datasetLevels, level]);

  useEffect(() => {
    setTourOpen(true);
    setTourStep(0);
  }, []);

  useEffect(() => {
    if (viewMode !== "atlas") {
      setInfoOpen(false);
    }
  }, [viewMode]);

  useEffect(() => {
    if (flowFilters.state !== "All") return;
    if (flowFilters.direction === "All") return;
    setFlowFilters((prev) => ({ ...prev, direction: "All" }));
  }, [flowFilters.state, flowFilters.direction]);

  useEffect(() => {
    if (!dataset || !level) {
      setVariables([]);
      setVariable("");
      setYears([]);
      setYear("");
      setValuesData(null);
      setSelectedFeature(null);
      setInfoOpen(false);
      return;
    }
    setVariables([]);
    setVariable("");
    setYears([]);
    setYear("");
    setAtlasStatus({ state: "loading", message: "Loading variables" });
    setValuesData(null);
    const params = new URLSearchParams({ dataset, level }).toString();
    fetchJson(`/api/variables?${params}`)
      .then((data) => {
        const nextVars = data.variables || [];
        const nextYears = data.years || [];
        const nextYear = nextYears.length ? nextYears[nextYears.length - 1] : "";
        setVariables(nextVars);
        setVariable(nextVars[0] || "");
        setYears(nextYears);
        setYear(nextYear);
      })
      .catch(() => setAtlasStatus({ state: "error", message: "Failed to load variables" }));
  }, [dataset, level]);

  useEffect(() => {
    if (!dataset || !level || !variable || !year) return;
    setAtlasStatus({ state: "loading", message: "Loading values" });
    setSelectedFeature(null);
    const params = new URLSearchParams({ dataset, level, variable, year }).toString();
    fetchJson(`/api/values?${params}`)
      .then((data) => {
        setValuesData(data);
        setAtlasStatus({ state: "ready", message: `Loaded ${data.stats?.count || 0} records` });
      })
      .catch(() => setAtlasStatus({ state: "error", message: "Failed to load values" }));
  }, [dataset, level, variable, year]);

  // Load flow options when level changes
  useEffect(() => {
    if (viewMode !== "flow") return;
    if (!flowLevel) return;

    let cancelled = false;
    setFlowStatus({ state: "loading", message: "Loading flow options" });
    setFlowOptionsLevel("");
    setFlowData(null);
    setFlowSelected(null);

    fetchJson(`/api/flow/options?level=${flowLevel}`)
      .then((data) => {
        if (cancelled) return;
        const years = data.years || [];
        const minYear = years.length ? Math.min(...years) : null;
        const maxYear = years.length ? Math.max(...years) : null;
        setFlowOptions({
          agencies: data.agencies || [],
          states: data.states || [],
          industries: data.industries || [],
          years
        });
        setFlowFilters({
          agency: "All",
          state: "All",
          direction: "All",
          naics: "All",
          yearStart: minYear,
          yearEnd: maxYear,
          flowRange: "top50"
        });
        setFlowOptionsLevel(flowLevel);
      })
      .catch(() => {
        if (cancelled) return;
        setFlowOptionsLevel("");
        setFlowStatus({ state: "error", message: "Failed to load flow options" });
      });

    return () => { cancelled = true; };
  }, [flowLevel, viewMode]);

  // Load flow data when filters change
  useEffect(() => {
    if (viewMode !== "flow") return;
    if (!flowLevel) return;
    if (flowOptionsLevel !== flowLevel) return;

    let cancelled = false;
    setFlowStatus({ state: "loading", message: "Loading flow data" });
    setFlowSelected(null);

    const params = new URLSearchParams({ level: flowLevel });
    if (flowFilters.agency && flowFilters.agency !== "All") {
      params.set("agency", flowFilters.agency);
    }
    if (flowFilters.state && flowFilters.state !== "All") {
      params.set("state", flowFilters.state);
    }
    if (flowFilters.direction && flowFilters.direction !== "All") {
      params.set("direction", flowFilters.direction);
    }
    if (flowFilters.naics && flowFilters.naics !== "All") {
      params.set("naics", flowFilters.naics);
    }
    if (flowFilters.yearStart) {
      params.set("year_start", flowFilters.yearStart);
    }
    if (flowFilters.yearEnd) {
      params.set("year_end", flowFilters.yearEnd);
    }
    if (flowFilters.flowRange) {
      const range = flowFilters.flowRange;
      if (range === "top10") {
        params.set("offset", 0);
        params.set("limit", 10);
      } else if (range === "top50") {
        params.set("offset", 0);
        params.set("limit", 50);
      } else if (range === "150+") {
        params.set("offset", 150);
        params.set("limit", 1000);
      } else {
        const [start, end] = range.split("-").map((value) => Number(value));
        if (!Number.isNaN(start)) {
          params.set("offset", start);
        }
        if (!Number.isNaN(end)) {
          params.set("limit", Math.max(0, end - start));
        }
      }
      params.set("flow_bucket", range);
    }

    fetchJson(`/api/flow?${params.toString()}`)
      .then((data) => {
        if (cancelled) return;
        setFlowData(data);
        setFlowStatus({
          state: "ready",
          message: `Loaded ${data.flows?.length || 0} of ${data.stats?.total_flows || 0} flows`
        });
      })
      .catch(() => {
        if (cancelled) return;
        setFlowData(null);
        setFlowStatus({ state: "error", message: "Failed to load flows" });
      });

    return () => { cancelled = true; };
  }, [flowLevel, flowFilters, flowOptionsLevel, viewMode]);

  useEffect(() => {
    if (viewMode !== "spending") return;
    if (spendingMetaLoadedRef.current) {
      setSpendingStatus({ state: "ready", message: "Ready" });
      return;
    }
    setSpendingStatus({ state: "loading", message: "Loading spending dataset" });
    let cancelled = false;
    const controller = new AbortController();
    fetchJson("/api/variables?dataset=spending_breakdown&level=state", { signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        const vars = data.variables || [];
        const yrs = data.years || [];
        setSpendingVariables(vars);
        setSpendingYears(yrs);
        spendingMetaLoadedRef.current = true;
        if (!spendingMetric && vars.length) {
          const defaultMetric = vars.includes("Contracts") ? "Contracts" : vars[0];
          setSpendingMetric(defaultMetric);
        }
        if (!spendingYear && yrs.length) {
          setSpendingYear(yrs[yrs.length - 1]);
        }
        setSpendingStatus({ state: "ready", message: "Ready" });
      })
      .catch((error) => {
        if (cancelled || error?.name === "AbortError") return;
        setSpendingStatus({ state: "error", message: "Failed to load spending dataset" });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== "spending") return;
    if (!spendingMetric || !spendingYear) return;

    const cacheKey = `${spendingMetric}|${spendingYear}`;
    const cached = spendingValuesCacheRef.current.get(cacheKey);
    if (cached) {
      setSpendingValuesData(cached);
      setSpendingStatus({
        state: "ready",
        message: `Loaded ${cached.stats?.count || 0} records`
      });
      return;
    }

    setSpendingStatus({ state: "loading", message: "Loading spending values" });
    const params = new URLSearchParams({
      dataset: "spending_breakdown",
      level: "state",
      variable: spendingMetric,
      year: spendingYear
    });
    let cancelled = false;
    const controller = new AbortController();
    fetchJson(`/api/values?${params.toString()}`, { signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        spendingValuesCacheRef.current.set(cacheKey, data);
        setSpendingValuesData(data);
        setSpendingStatus({
          state: "ready",
          message: `Loaded ${data.stats?.count || 0} records`
        });
      })
      .catch((error) => {
        if (cancelled || error?.name === "AbortError") return;
        setSpendingValuesData(null);
        setSpendingStatus({ state: "error", message: "Failed to load spending values" });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [viewMode, spendingMetric, spendingYear]);

  useEffect(() => {
    if (viewMode !== "spending") return;
    if (!spendingYear || spendingSelectedState === "ALL") {
      setSpendingDetailRecords([]);
      setSpendingSelectedAgency("ALL");
      return;
    }
    const cacheKey = `${spendingSelectedState}|${spendingYear}`;
    const cached = spendingDetailCacheRef.current.get(cacheKey);
    if (cached) {
      setSpendingDetailRecords(cached);
      setSpendingSelectedAgency("ALL");
      setSpendingDetailLoading(false);
      return;
    }

    setSpendingDetailLoading(true);
    const params = new URLSearchParams({
      year: spendingYear,
      state: spendingSelectedState
    });
    let cancelled = false;
    const controller = new AbortController();
    fetchJson(`/api/spending/state-detail?${params.toString()}`, { signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        const records = data.records || [];
        spendingDetailCacheRef.current.set(cacheKey, records);
        setSpendingDetailRecords(records);
        setSpendingSelectedAgency("ALL");
      })
      .catch((error) => {
        if (cancelled || error?.name === "AbortError") return;
        setSpendingDetailRecords([]);
      })
      .finally(() => {
        if (cancelled) return;
        setSpendingDetailLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [viewMode, spendingSelectedState, spendingYear]);

  // Load geography data for atlas and flow views
  useEffect(() => {
    const targets = new Set();
    if (viewMode === "atlas" && level) {
      targets.add(level);
    }
    if (viewMode === "flow") {
      // Load boundaries for flow view based on selected level
      targets.add("state");
      if (flowLevel === "county") {
        targets.add("county");
      } else if (flowLevel === "congress") {
        targets.add("congress");
      }
    }
    if (viewMode === "spending") {
      targets.add("state");
    }

    targets.forEach((target) => {
      if (geoCache[target]) return;
      fetchJson(`/api/geo/${target}`)
        .then((data) => setGeoCache((prev) => ({ ...prev, [target]: data })))
        .catch(() => {
          if (viewMode === "atlas") {
            setAtlasStatus({ state: "error", message: "Failed to load geometry" });
          }
        });
    });
  }, [level, viewMode, flowLevel, geoCache]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMove = (event) => {
      const delta = event.clientX - resizeRef.current.startX;
      const nextWidth = Math.min(520, Math.max(260, resizeRef.current.startWidth + delta));
      setSidebarWidth(nextWidth);
    };
    const handleUp = () => setIsResizing(false);
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    document.body.classList.add("is-resizing");
    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.body.classList.remove("is-resizing");
    };
  }, [isResizing]);

  const handleResizeStart = (event) => {
    resizeRef.current = { startX: event.clientX, startWidth: sidebarWidth };
    setIsResizing(true);
  };

  const enrichedGeo = useMemo(() => {
    const baseGeo = geoCache[level];
    if (!baseGeo || !valuesData) return null;
    const recordMap = new Map(
      valuesData.records.map((record) => [String(record.id), record])
    );
    return {
      type: "FeatureCollection",
      features: baseGeo.features.map((feature) => {
        const featureId = String(feature.properties?.id || "");
        const record = recordMap.get(featureId);
        const value = record ? record.value : null;
        const quintile = record ? record.quintile : 0;
        const label = record?.label || feature.properties?.name || featureId || "Unknown";
        return {
          ...feature,
          properties: {
            ...feature.properties,
            id: featureId,
            label,
            value,
            quintile
          }
        };
      })
    };
  }, [geoCache, level, valuesData]);

  const spendingEnrichedGeo = useMemo(() => {
    const baseGeo = geoCache.state;
    if (!baseGeo || !spendingValuesData) return null;
    const recordMap = new Map(
      spendingValuesData.records.map((record) => [String(record.id), record])
    );
    return {
      type: "FeatureCollection",
      features: baseGeo.features.map((feature) => {
        const featureId = String(feature.properties?.id || "");
        const record = recordMap.get(featureId);
        const value = record ? record.value : null;
        const quintile = record ? record.quintile : 0;
        const label = record?.label || feature.properties?.name || featureId || "Unknown";
        return {
          ...feature,
          properties: {
            ...feature.properties,
            id: featureId,
            label,
            value,
            quintile
          }
        };
      })
    };
  }, [geoCache, spendingValuesData]);

  const thresholds = valuesData?.thresholds || [];
  const spendingThresholds = spendingValuesData?.thresholds || [];
  const datasetLabel = datasets.find((item) => item.key === dataset)?.label;
  const spendingDatasetLabel = datasets.find((item) => item.key === "spending_breakdown")?.label;
  const rankMeta = useMemo(() => {
    if (!valuesData?.records) return { map: new Map(), total: 0 };
    const sorted = valuesData.records
      .filter((record) => record.value !== null && record.value !== undefined)
      .sort((a, b) => b.value - a.value);
    const map = new Map();
    sorted.forEach((record, idx) => {
      const percentile = sorted.length > 1
        ? Math.round((1 - idx / (sorted.length - 1)) * 100)
        : 100;
      map.set(String(record.id), { rank: idx + 1, percentile });
    });
    return { map, total: sorted.length };
  }, [valuesData]);
  const spendingRankMeta = useMemo(() => {
    if (!spendingValuesData?.records) return { map: new Map(), total: 0 };
    const sorted = spendingValuesData.records
      .filter((record) => record.value !== null && record.value !== undefined)
      .sort((a, b) => b.value - a.value);
    const map = new Map();
    sorted.forEach((record, idx) => {
      const percentile = sorted.length > 1
        ? Math.round((1 - idx / (sorted.length - 1)) * 100)
        : 100;
      map.set(String(record.id), { rank: idx + 1, percentile });
    });
    return { map, total: sorted.length };
  }, [spendingValuesData]);
  const spendingStates = useMemo(() => {
    if (!spendingValuesData?.records) return [];
    const names = spendingValuesData.records
      .map((record) => (record.label ? String(record.label).toUpperCase() : ""))
      .filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [spendingValuesData]);

  useEffect(() => {
    if (!spendingValuesData?.records) return;
    if (spendingSelectedState === "ALL") {
      setSpendingSelectedFeature(null);
      return;
    }
    const match = spendingValuesData.records.find(
      (record) => String(record.label || "").toUpperCase() === spendingSelectedState
    );
    if (!match) {
      setSpendingSelectedFeature(null);
      return;
    }
    if (String(match.id) !== String(spendingSelectedFeature?.id || "")) {
      setSpendingSelectedFeature(match);
    }
  }, [spendingSelectedState, spendingValuesData, spendingSelectedFeature]);
  const selectedId = selectedFeature?.id ? String(selectedFeature.id) : "";
  const selectedRank = selectedId ? rankMeta.map.get(selectedId) : null;
  const thresholdSummary = thresholds.length
    ? `Q1 ≤ ${formatNumber(thresholds[0])} · Q2 ≤ ${formatNumber(thresholds[1])} · Q3 ≤ ${formatNumber(thresholds[2])} · Q4 ≤ ${formatNumber(thresholds[3])}`
    : "—";
  const spendingSelectedId = spendingSelectedFeature?.id
    ? String(spendingSelectedFeature.id)
    : "";
  const spendingSelectedRank = spendingSelectedId
    ? spendingRankMeta.map.get(spendingSelectedId)
    : null;
  const spendingThresholdSummary = spendingThresholds.length
    ? `Q1 ≤ ${formatNumber(spendingThresholds[0])} · Q2 ≤ ${formatNumber(spendingThresholds[1])} · Q3 ≤ ${formatNumber(spendingThresholds[2])} · Q4 ≤ ${formatNumber(spendingThresholds[3])}`
    : "—";
  const datasetMeta = dataset ? METADATA.datasets?.[dataset] : null;
  const variableMeta = dataset && variable ? METADATA.variables?.[dataset]?.[variable] : null;
  const levelLabel = level ? LEVEL_LABELS[level] || level : "—";
  const flowDisplay = useMemo(() => {
    if (!flowData?.flows) return [];
    return flowData.flows;
  }, [flowData]);
  const flowStats = useMemo(() => {
    if (!flowData) return null;
    const displayFlows = flowDisplay || [];
    const aggregated = flowData.stats || {};
    const totalAmount = aggregated.total_amount ?? 0;
    const totalFlows = aggregated.total_flows ?? 0;
    const uniqueLocations = aggregated.unique_locations ?? 0;
    const internalFlowCount = aggregated.internal_flow_count ?? 0;
    const internalFlowAmount = aggregated.internal_flow_amount ?? 0;

    // Calculate displayed stats from visible flows
    let displayedAmount = 0;
    const agencyMap = {};
    const originMap = {};
    const destMap = {};

    displayFlows.forEach((flow) => {
      const amount = Number(flow.amount) || 0;
      displayedAmount += amount;
      const agency = flow.agency || "Unknown";
      const origin = flow.origin_name || "Unknown";
      const dest = flow.dest_name || "Unknown";
      agencyMap[agency] = (agencyMap[agency] || 0) + amount;
      originMap[origin] = (originMap[origin] || 0) + amount;
      destMap[dest] = (destMap[dest] || 0) + amount;
    });

    const topAgencies = Object.entries(agencyMap)
      .filter(([name]) => name && name !== "Unknown")
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const topOrigins = Object.entries(originMap)
      .filter(([name]) => name && name !== "Unknown")
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const topDestinations = Object.entries(destMap)
      .filter(([name]) => name && name !== "Unknown")
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const sorted = [...displayFlows].sort((a, b) => (b.amount || 0) - (a.amount || 0));
    const largestFlow = sorted.length && sorted[0].amount
      ? { origin: sorted[0].origin_name, dest: sorted[0].dest_name, amount: sorted[0].amount, agency: sorted[0].agency }
      : null;

    // Calculate average from displayed flows (more accurate than total/total_flows)
    const averageFlow = displayFlows.length > 0 ? displayedAmount / displayFlows.length : null;

    // Format period based on available years
    let period = "All Years";
    if (flowFilters.yearStart && flowFilters.yearEnd) {
      period = flowFilters.yearStart === flowFilters.yearEnd
        ? String(flowFilters.yearStart)
        : `${flowFilters.yearStart}–${flowFilters.yearEnd}`;
    } else if (flowFilters.yearStart) {
      period = `${flowFilters.yearStart}+`;
    } else if (flowFilters.yearEnd) {
      period = `–${flowFilters.yearEnd}`;
    }

    return {
      totalAmount: totalAmount || null,
      totalFlows: totalFlows || null,
      displayedFlows: displayFlows.length || null,
      displayedAmount: displayedAmount || null,
      averageFlow,
      locationsInvolved: uniqueLocations || null,
      period,
      topAgencies,
      topOrigins,
      topDestinations,
      largestFlow,
      // Internal flows (same origin/dest - not visualizable as lines)
      internalFlowCount: internalFlowCount || null,
      internalFlowAmount: internalFlowAmount || null
    };
  }, [flowData, flowDisplay, flowFilters.yearEnd, flowFilters.yearStart]);
  const activeStatus =
    viewMode === "flow" ? flowStatus : viewMode === "spending" ? spendingStatus : atlasStatus;
  return (
    <div className={`app ${tab === "insights" ? "insights-active" : ""}`}>
      <aside className="sidebar" style={{ width: sidebarWidth }}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            Maryland Opportunity<span className="sidebar-title-dot">.</span>
          </div>
          <div className="sidebar-subtitle">Analytics Platform</div>
        </div>

        <div className="view-toggle">
          <button
            type="button"
            className={`view-btn ${viewMode === "atlas" ? "active" : ""}`}
            onClick={() => setViewMode("atlas")}
          >
            Data Atlas
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === "flow" ? "active" : ""}`}
            onClick={() => setViewMode("flow")}
          >
            Fund Flow
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === "spending" ? "active" : ""}`}
            onClick={() => setViewMode("spending")}
          >
            Spending Breakdown
          </button>
        </div>

        <div className="sidebar-nav">
          <div className="tab-nav">
            <button
              className={`tab-btn ${tab === "filters" ? "active" : ""}`}
              onClick={() => setTab("filters")}
              type="button"
            >
              <span className="tab-icon">
                <Icons.Settings />
              </span>
              Parameters
            </button>
            <button
              className={`tab-btn ${tab === "insights" ? "active" : ""}`}
              onClick={() => setTab("insights")}
              type="button"
            >
              <span className="tab-icon">
                <Icons.Chart />
              </span>
              Insights
            </button>
          </div>
          {viewMode === "atlas" && (
            <>
              <button
                className="info-btn"
                type="button"
                onClick={() => setInfoOpen((open) => !open)}
                aria-label="Information"
              >
                i
              </button>
              {infoOpen && (
                <div className="info-popover">
                  <div className="info-popover-header">
                    <div className="info-popover-title">Selection Info</div>
                    <button
                      className="info-popover-close"
                      type="button"
                      onClick={() => setInfoOpen(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="info-section">
                    <div className="info-label">Dataset</div>
                    <div className="info-value">
                      {datasetMeta?.name || "Select a dataset"}
                    </div>
                    {datasetMeta?.description && (
                      <div className="info-text">{datasetMeta.description}</div>
                    )}
                    {datasetMeta?.coverage && (
                      <div className="info-text">Coverage: {datasetMeta.coverage}</div>
                    )}
                    {datasetMeta?.sourceUrl && (
                      <a
                        className="info-link"
                        href={datasetMeta.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source: {datasetMeta.sourceName}
                      </a>
                    )}
                  </div>
                  <div className="info-section">
                    <div className="info-label">Variable</div>
                    <div className="info-value">
                      {variable ? getVariableLabel(dataset, variable) : "Select a variable"}
                    </div>
                    <div className="info-text">
                      {variableMeta || "Variable definitions will appear here."}
                    </div>
                  </div>
                  <div className="info-section">
                    <div className="info-label">Geography</div>
                    <div className="info-value">{levelLabel}</div>
                  </div>
                  <div className="info-section">
                    <div className="info-label">Year</div>
                    <div className="info-value">{year || "—"}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="tab-content">
          {tab === "filters" && viewMode === "atlas" && (
            <AtlasFiltersPanel
              datasets={datasets}
              dataset={dataset}
              onDatasetChange={(event) => setDataset(event.target.value)}
              level={level}
              onLevelChange={(event) => setLevel(event.target.value)}
              availableLevels={datasetLevels}
              years={years}
              year={year}
              onYearChange={(event) => setYear(event.target.value)}
              variables={variables}
              variable={variable}
              onVariableChange={(event) => setVariable(event.target.value)}
              isLoading={atlasStatus.state === "loading"}
            />
          )}

          {tab === "filters" && viewMode === "flow" && (
            <FlowFiltersPanel
              flowLevel={flowLevel}
              onFlowLevelChange={(event) => setFlowLevel(event.target.value)}
              flowFilters={flowFilters}
              onFlowFiltersChange={setFlowFilters}
              flowOptions={flowOptions}
              isLoading={flowStatus.state === "loading"}
            />
          )}

          {tab === "filters" && viewMode === "spending" && (
            <SpendingFiltersPanel
              years={spendingYears}
              metrics={spendingVariables.filter((item) => !item.includes("Per 1000"))}
              perCapitaMetrics={spendingVariables.filter((item) => item.includes("Per 1000"))}
              states={spendingStates}
              year={spendingYear}
              metric={spendingMetric}
              state={spendingSelectedState}
              viewType={spendingViewType}
              onYearChange={setSpendingYear}
              onMetricChange={setSpendingMetric}
              onStateChange={setSpendingSelectedState}
              onViewTypeChange={setSpendingViewType}
              isLoading={spendingStatus.state === "loading"}
            />
          )}

          {tab === "insights" && viewMode === "atlas" && (
            <AtlasInsightsPanel
              dataset={dataset}
              variable={variable}
              valuesData={valuesData}
              thresholds={thresholds}
            />
          )}

          {tab === "insights" && viewMode === "flow" && (
            <FlowInsightsPanel flowStats={flowStats} thresholds={flowData?.thresholds} />
          )}

          {tab === "insights" && viewMode === "spending" && (
            <SpendingInsightsPanel
              selectedState={spendingSelectedState}
              year={spendingYear}
              metric={spendingMetric}
              detailRecords={spendingDetailRecords}
              selectedAgency={spendingSelectedAgency}
              onAgencyChange={setSpendingSelectedAgency}
            />
          )}
        </div>

        <div className={`status-bar ${activeStatus.state}`}>
          <span className="status-dot" />
          <span>{activeStatus.message}</span>
        </div>
        <div
          className="sidebar-resizer"
          onMouseDown={handleResizeStart}
          role="presentation"
        />
      </aside>

      <main className="main">
        {viewMode === "spending" ? (
          <div className="map-shell">
            <div className="map-wrap">
              <SpendingMapPanel
                enrichedGeo={spendingEnrichedGeo}
                metric={getVariableLabel("spending_breakdown", spendingMetric)}
                year={spendingYear}
                selectedFeature={spendingSelectedFeature}
                onSelectedFeatureChange={(feature) => {
                  setSpendingSelectedFeature(feature);
                  if (!feature) {
                    setSpendingSelectedState("ALL");
                    return;
                  }
                  setSpendingSelectedState(String(feature.label || "").toUpperCase());
                }}
                selectedId={spendingSelectedId}
                selectedRank={spendingSelectedRank}
                rankTotal={spendingRankMeta.total}
                sidebarWidth={sidebarWidth}
                detailRecords={spendingDetailRecords}
                detailLoading={spendingDetailLoading}
                viewType={spendingViewType}
                focusMode={spendingSelectedState !== "ALL"}
              />
            </div>
          </div>
        ) : (
          <div className="map-shell">
            <div className="map-wrap">
              {viewMode === "atlas" ? (
                <AtlasMapPanel
                  enrichedGeo={enrichedGeo}
                  level={level}
                  dataset={dataset}
                  variable={variable}
                  year={year}
                  datasetLabel={datasetLabel}
                  selectedFeature={selectedFeature}
                  onSelectedFeatureChange={setSelectedFeature}
                  selectedId={selectedId}
                  selectedRank={selectedRank}
                  rankTotal={rankMeta.total}
                  thresholdSummary={thresholdSummary}
                  sidebarWidth={sidebarWidth}
                />
              ) : (
                <FlowMapPanel
                  flows={flowDisplay}
                  flowLevel={flowLevel}
                  geoCache={geoCache}
                  flowFilters={flowFilters}
                  flowStatus={flowStatus}
                  flowSelected={flowSelected}
                  onFlowSelected={setFlowSelected}
                  sidebarWidth={sidebarWidth}
                  formatAmount={formatCurrencyRounded}
                  flowBucket={flowFilters.flowRange}
                />
              )}
            </div>
          </div>
        )}
      </main>
      <TourOverlay
        tourOpen={tourOpen}
        tourStep={tourStep}
        setTourOpen={setTourOpen}
        setTourStep={setTourStep}
      />
    </div>
  );
}
