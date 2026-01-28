import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { METADATA } from "./metadata.js";
import { FlowMapCanvas } from "./flowMap.jsx";

const QUINTILE_COLORS = ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"];
const LEVEL_LABELS = {
  state: "State",
  county: "County",
  congress: "Congressional District"
};
const FLOW_LEVEL_LABELS = {
  state: "State",
  county: "County",
  congress: "Congressional District"
};
const FLOW_DIRECTIONS = [
  { value: "All", label: "All", tone: "all" },
  { value: "Inflow", label: "Inflow", tone: "inflow" },
  { value: "Outflow", label: "Outflow", tone: "outflow" }
];
const BASE_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const US_BOUNDS = [
  [-125.5, 24.2],
  [-66.9, 49.8]
];

const formatLabel = (value) => {
  if (!value) return "—";
  const raw = value.toString().replace(/_/g, " ").trim();
  return raw
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
};

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const absValue = Math.abs(value);
  if (absValue >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (absValue >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (absValue >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (absValue >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const formatCurrency = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const absValue = Math.abs(value);
  if (absValue >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (absValue >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (absValue >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (absValue >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

const roundToMillion = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.round(value / 1e6) * 1e6;
};

const formatNumberRounded = (value) => formatNumber(roundToMillion(value));
const formatCurrencyRounded = (value) => formatCurrency(roundToMillion(value));

const VARIABLE_LABEL_OVERRIDES = {
  contract_static: {
    fed_act_obl: "Federal Contracts",
    fed_act_obl_indirect: "Federal Contracts (Indirect)",
    subaward_amount_out: "Sub-Contract Out",
    subaward_amount_in: "Sub-Contract In",
    subaward_amount_net_inflow: "Net Sub-Contract",
    fed_act_obl_per_1000: "Federal Contracts per 1,000 Residents",
    fed_act_obl_indirect_per_1000: "Federal Contracts (Indirect) per 1,000 Residents",
    subaward_amount_net_inflow_per_1000: "Net Sub-Contract per 1,000 Residents"
  }
};

const getVariableLabel = (datasetKey, variableKey) => {
  if (!variableKey) return "—";
  return VARIABLE_LABEL_OVERRIDES[datasetKey]?.[variableKey] || formatLabel(variableKey);
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const fetchJson = async (path) => {
  let res;
  try {
    res = await fetch(path);
  } catch (err) {
    if (!API_BASE) throw err;
  }
  if (!res || !res.ok) {
    if (!API_BASE) {
      throw new Error(`Request failed: ${res ? res.status : "network error"}`);
    }
    res = await fetch(`${API_BASE}${path}`);
  }
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
};

const Icons = {
  Settings: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Chart: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
};

const TOUR_STEPS = [
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

function MapCanvas({ geojson, level, onHover, onSelect, selectedId, resizeKey }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const eventsBound = useRef(false);
  const fittedLevels = useRef({});

  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE,
      center: [-98.5, 38.5],
      zoom: 3,
      minZoom: 2,
      dragRotate: false,
      pitchWithRotate: false
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!geojson) {
      if (map.getSource("choropleth")) {
        map.getSource("choropleth").setData({ type: "FeatureCollection", features: [] });
      }
      return;
    }

    const loadData = () => {
      if (map.getSource("choropleth")) {
        map.getSource("choropleth").setData(geojson);
      } else {
        map.addSource("choropleth", {
          type: "geojson",
          data: geojson
        });
        map.addLayer({
          id: "choropleth-fill",
          type: "fill",
          source: "choropleth",
          paint: {
            "fill-color": [
              "match",
              ["to-number", ["get", "quintile"]],
              1,
              QUINTILE_COLORS[0],
              2,
              QUINTILE_COLORS[1],
              3,
              QUINTILE_COLORS[2],
              4,
              QUINTILE_COLORS[3],
              5,
              QUINTILE_COLORS[4],
              "rgba(0,0,0,0)"
            ],
            "fill-opacity": 0.82
          }
        });
        map.addLayer({
          id: "choropleth-line",
          type: "line",
          source: "choropleth",
          paint: {
            "line-color": "rgba(37, 99, 235, 0.45)",
            "line-width": 0.6,
            "line-opacity": 0.75
          }
        });
        map.addLayer({
          id: "choropleth-selected",
          type: "line",
          source: "choropleth",
          paint: {
            "line-color": "#0f172a",
            "line-width": 2.2
          },
          filter: ["==", ["get", "id"], selectedId || ""]
        });
        map.addLayer({
          id: "choropleth-hover",
          type: "line",
          source: "choropleth",
          paint: {
            "line-color": "#111827",
            "line-width": 2
          },
          filter: ["==", ["get", "id"], ""]
        });
      }

      if (!eventsBound.current) {
        eventsBound.current = true;
        map.on("mousemove", "choropleth-fill", (event) => {
          const feature = event.features && event.features[0];
          if (!feature) return;
          map.getCanvas().style.cursor = "pointer";
          map.setFilter("choropleth-hover", ["==", ["get", "id"], feature.properties.id || ""]);
          const value = feature.properties.value === null || feature.properties.value === undefined
            ? null
            : Number(feature.properties.value);
          const quintile = Number(feature.properties.quintile) || 0;
          onHover({
            x: event.point.x,
            y: event.point.y,
            label: feature.properties.label || feature.properties.name || "Unknown",
            value,
            quintile
          });
        });

        map.on("mouseleave", "choropleth-fill", () => {
          map.getCanvas().style.cursor = "";
          map.setFilter("choropleth-hover", ["==", ["get", "id"], ""]);
          onHover(null);
        });

        map.on("click", "choropleth-fill", (event) => {
          const feature = event.features && event.features[0];
          if (!feature) return;
          const props = feature.properties || {};
          const value = props.value === null || props.value === undefined ? null : Number(props.value);
          const quintile = Number(props.quintile) || 0;
          onSelect({
            id: props.id,
            label: props.label || props.name || "Unknown",
            value,
            quintile
          });
        });

        map.on("click", (event) => {
          const features = map.queryRenderedFeatures(event.point, { layers: ["choropleth-fill"] });
          if (!features.length) {
            onSelect(null);
          }
        });
      }
    };

    if (map.isStyleLoaded()) {
      loadData();
    } else {
      map.once("load", loadData);
    }
  }, [geojson, onHover, onSelect, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("choropleth-selected")) return;
    map.setFilter("choropleth-selected", ["==", ["get", "id"], selectedId || ""]);
  }, [selectedId]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  }, [resizeKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geojson || !level) return;
    if (fittedLevels.current[level]) return;
    fittedLevels.current[level] = true;
    map.fitBounds(US_BOUNDS, { padding: 40, duration: 800 });
  }, [geojson, level]);

  return <div className="map-container" ref={containerRef} />;
}


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
  const [atlasHover, setAtlasHover] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [flowHover, setFlowHover] = useState(null);
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
    yearEnd: null
  });
  const [flowData, setFlowData] = useState(null);
  const [flowStatus, setFlowStatus] = useState({ state: "ready", message: "Ready" });
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const resizeRef = useRef({ startX: 0, startWidth: 360 });

  useEffect(() => {
    fetchJson("/api/datasets")
      .then((data) => setDatasets(data.datasets || []))
      .catch(() => setAtlasStatus({ state: "error", message: "Failed to load datasets" }));
  }, []);

  useEffect(() => {
    setTourOpen(true);
    setTourStep(0);
  }, []);

  useEffect(() => {
    if (viewMode === "flow") {
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
    setAtlasHover(null);
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
    setFlowHover(null);
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
          yearEnd: maxYear
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
    setFlowHover(null);
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

  const thresholds = valuesData?.thresholds || [];
  const datasetLabel = datasets.find((item) => item.key === dataset)?.label;
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
  const selectedId = selectedFeature?.id ? String(selectedFeature.id) : "";
  const selectedRank = selectedId ? rankMeta.map.get(selectedId) : null;
  const thresholdSummary = thresholds.length
    ? `Q1 ≤ ${formatNumber(thresholds[0])} · Q2 ≤ ${formatNumber(thresholds[1])} · Q3 ≤ ${formatNumber(thresholds[2])} · Q4 ≤ ${formatNumber(thresholds[3])}`
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
    const totalAmount = aggregated.total_amount || 0;
    const totalFlows = aggregated.total_flows || 0;
    const uniqueLocations = aggregated.unique_locations || 0;
    const displayedAmount = displayFlows.reduce((sum, flow) => sum + (flow.amount || 0), 0);
    const agencyMap = {};
    const originMap = {};
    const destMap = {};
    displayFlows.forEach((flow) => {
      agencyMap[flow.agency] = (agencyMap[flow.agency] || 0) + flow.amount;
      originMap[flow.origin_name] = (originMap[flow.origin_name] || 0) + flow.amount;
      destMap[flow.dest_name] = (destMap[flow.dest_name] || 0) + flow.amount;
    });
    const topAgencies = Object.entries(agencyMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const topOrigins = Object.entries(originMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const topDestinations = Object.entries(destMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const sorted = [...displayFlows].sort((a, b) => b.amount - a.amount);
    const largestFlow = sorted.length
      ? { origin: sorted[0].origin_name, dest: sorted[0].dest_name, amount: sorted[0].amount, agency: sorted[0].agency }
      : null;
    const period = flowLevel === "state"
      ? "All Years"
      : `${flowFilters.yearStart || "—"}-${flowFilters.yearEnd || "—"}`;
    return {
      totalAmount,
      totalFlows,
      displayedFlows: displayFlows.length,
      displayedAmount,
      averageFlow: totalFlows ? totalAmount / totalFlows : 0,
      locationsInvolved: uniqueLocations,
      period,
      topAgencies,
      topOrigins,
      topDestinations,
      largestFlow
    };
  }, [flowData, flowDisplay, flowFilters.yearEnd, flowFilters.yearStart, flowLevel]);
  const activeStatus = viewMode === "flow" ? flowStatus : atlasStatus;
  const tour = TOUR_STEPS[tourStep] || TOUR_STEPS[0];
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
            <div className="panel">
              <div className="section">
                <div className="section-title">Dataset</div>
                <label className="control">
                  <span>Domain</span>
                  <select className="select-input" value={dataset} onChange={(e) => setDataset(e.target.value)}>
                    <option value="">Select dataset</option>
                    {datasets.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="section">
                <div className="section-title">Geography</div>
                <label className="control">
                  <span>Level</span>
                  <select className="select-input" value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="">Select level</option>
                    <option value="state">State</option>
                    <option value="county">County</option>
                    <option value="congress">Congressional District</option>
                  </select>
                </label>
              </div>

              <div className="section">
                <div className="section-title">Year</div>
                <label className="control">
                  <span>Year</span>
                  <select
                    className="select-input"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    disabled={!years.length}
                  >
                    {!years.length ? (
                      <option value="">Select dataset and level</option>
                    ) : (
                      years.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))
                    )}
                  </select>
                </label>
              </div>

              <div className="section">
                <div className="section-title">Variable</div>
                <label className="control">
                  <span>Metric</span>
                  <select
                    className="select-input"
                    value={variable}
                    onChange={(e) => setVariable(e.target.value)}
                    disabled={!variables.length}
                  >
                    {!variables.length ? (
                      <option value="">Select dataset and level</option>
                    ) : (
                      variables.map((item) => (
                        <option key={item} value={item}>
                          {getVariableLabel(dataset, item)}
                        </option>
                      ))
                    )}
                  </select>
                </label>
              </div>

              <div className="section">
                <div className="section-title">Legend</div>
                <div className="legend-bar" />
                <div className="legend-labels">
                  <span>Q1</span>
                  <span>Q2</span>
                  <span>Q3</span>
                  <span>Q4</span>
                  <span>Q5</span>
                </div>
              </div>
            </div>
          )}

          {tab === "filters" && viewMode === "flow" && (
            <div className="panel">
              <div className="section">
                <div className="section-title">Flow Scope</div>
                <label className="control">
                  <span>Level</span>
                  <select
                    className="select-input"
                    value={flowLevel}
                    onChange={(e) => setFlowLevel(e.target.value)}
                  >
                    <option value="state">State</option>
                    <option value="county">County</option>
                    <option value="congress">Congressional District</option>
                  </select>
                </label>
              </div>

              <div className="section">
                <div className="section-title">Agency</div>
                <label className="control">
                  <span>Department</span>
                  <select
                    className="select-input"
                    value={flowFilters.agency}
                    onChange={(e) => setFlowFilters((prev) => ({ ...prev, agency: e.target.value }))}
                  >
                    <option value="All">All Agencies</option>
                    {flowOptions.agencies.map((agency) => (
                      <option key={agency} value={agency}>{agency}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="section">
                <div className="section-title">Location</div>
                <label className="control">
                  <span>State</span>
                  <select
                    className="select-input"
                    value={flowFilters.state}
                    onChange={(e) => setFlowFilters((prev) => ({ ...prev, state: e.target.value }))}
                  >
                    <option value="All">All States</option>
                    {flowOptions.states.map((stateOption) => (
                      <option key={stateOption} value={stateOption}>{stateOption}</option>
                    ))}
                  </select>
                </label>
                <div className="control">
                  <span>Direction</span>
                  <div className="direction-toggle" role="group" aria-label="Flow direction">
                    {FLOW_DIRECTIONS.map((direction) => (
                      <button
                        key={direction.value}
                        type="button"
                        className={`direction-btn ${direction.tone} ${
                          flowFilters.direction === direction.value ? "active" : ""
                        }`}
                        aria-pressed={flowFilters.direction === direction.value}
                        disabled={flowFilters.state === "All"}
                        onClick={() => setFlowFilters((prev) => ({
                          ...prev,
                          direction: direction.value
                        }))}
                      >
                        {direction.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {flowLevel === "state" && flowOptions.industries.length > 0 && (
                <div className="section">
                  <div className="section-title">Industry</div>
                  <label className="control">
                    <span>{flowLevel === "state" ? "NAICS" : "Industry"}</span>
                  <select
                    className="select-input"
                    value={flowFilters.naics}
                    onChange={(e) => setFlowFilters((prev) => ({ ...prev, naics: e.target.value }))}
                  >
                      <option value="All">All Industries</option>
                      {flowOptions.industries.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {flowLevel === "congress" && flowOptions.industries.length > 0 && (
                <div className="section">
                  <div className="section-title">Industry</div>
                  <label className="control">
                    <span>Industry</span>
                    <select
                      className="select-input"
                      value={flowFilters.naics}
                      onChange={(e) => setFlowFilters((prev) => ({ ...prev, naics: e.target.value }))}
                    >
                      <option value="All">All Industries</option>
                      {flowOptions.industries.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {(flowLevel === "county" || flowLevel === "congress") && (
                <div className="section">
                  <div className="section-title">Year Range</div>
                  <label className="control">
                    <span>Year Start</span>
                    <select
                      className="select-input"
                      value={flowFilters.yearStart || ""}
                      disabled={!flowOptions.years.length}
                      onChange={(e) => {
                        const nextValue = e.target.value ? Number(e.target.value) : null;
                        setFlowFilters((prev) => ({
                          ...prev,
                          yearStart: nextValue,
                          yearEnd: prev.yearEnd && nextValue && prev.yearEnd < nextValue ? nextValue : prev.yearEnd
                        }));
                      }}
                    >
                      {flowOptions.years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </label>
                  <label className="control">
                    <span>Year End</span>
                    <select
                      className="select-input"
                      value={flowFilters.yearEnd || ""}
                      disabled={!flowOptions.years.length}
                      onChange={(e) => {
                        const nextValue = e.target.value ? Number(e.target.value) : null;
                        setFlowFilters((prev) => ({
                          ...prev,
                          yearEnd: nextValue,
                          yearStart: prev.yearStart && nextValue && prev.yearStart > nextValue ? nextValue : prev.yearStart
                        }));
                      }}
                    >
                      {flowOptions.years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              <div className="section">
                <div className="section-title">Legend</div>
                <div className="flow-legend-compact">
                  <div className="flow-legend-colors">
                    <div className="flow-color-item">
                      <span className="flow-color-dot inflow" />
                      <span>Inflow</span>
                    </div>
                    <div className="flow-color-item">
                      <span className="flow-color-dot outflow" />
                      <span>Outflow</span>
                    </div>
                  </div>
                  <div className="flow-thickness-compact">
                    <span className="flow-thickness-label">Intensity</span>
                    <div className="flow-thickness-scale">
                      <div className="flow-scale-line q1" />
                      <div className="flow-scale-line q2" />
                      <div className="flow-scale-line q3" />
                      <div className="flow-scale-line q4" />
                      <div className="flow-scale-line q5" />
                    </div>
                    <div className="flow-scale-labels">
                      <span>Q1</span>
                      <span>Q5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "insights" && viewMode === "atlas" && (
            <div className="panel">
              <div className="insight-card">
                <div className="insight-title">Current Variable</div>
                <div className="insight-value">
                  {variable ? getVariableLabel(dataset, variable) : "—"}
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-title">Summary Statistics</div>
                <div className="stat-row">
                  <span>Records</span>
                  <span>{valuesData?.stats?.count || "—"}</span>
                </div>
                <div className="stat-row">
                  <span>Min</span>
                  <span>{formatNumberRounded(valuesData?.stats?.min)}</span>
                </div>
                <div className="stat-row">
                  <span>Max</span>
                  <span>{formatNumberRounded(valuesData?.stats?.max)}</span>
                </div>
                <div className="stat-row">
                  <span>Mean</span>
                  <span>{formatNumberRounded(valuesData?.stats?.mean)}</span>
                </div>
                <div className="stat-row">
                  <span>Median</span>
                  <span>{formatNumberRounded(valuesData?.stats?.median)}</span>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-title">Quintile Thresholds</div>
                <div className="stat-row">
                  <span>Q1</span>
                  <span>≤ {formatNumberRounded(thresholds[0])}</span>
                </div>
                <div className="stat-row">
                  <span>Q2</span>
                  <span>
                    {formatNumberRounded(thresholds[0])} – {formatNumberRounded(thresholds[1])}
                  </span>
                </div>
                <div className="stat-row">
                  <span>Q3</span>
                  <span>
                    {formatNumberRounded(thresholds[1])} – {formatNumberRounded(thresholds[2])}
                  </span>
                </div>
                <div className="stat-row">
                  <span>Q4</span>
                  <span>
                    {formatNumberRounded(thresholds[2])} – {formatNumberRounded(thresholds[3])}
                  </span>
                </div>
                <div className="stat-row">
                  <span>Q5</span>
                  <span>&gt; {formatNumberRounded(thresholds[3])}</span>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-title">Top 10 Locations</div>
                <div className="rank-list">
                  {(valuesData?.top || []).map((item) => (
                    <div className="rank-row" key={item.label}>
                      <span>{item.label}</span>
                      <span>{formatNumberRounded(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-title">Bottom 10 Locations</div>
                <div className="rank-list">
                  {(valuesData?.bottom || []).map((item) => (
                    <div className="rank-row" key={item.label}>
                      <span>{item.label}</span>
                      <span>{formatNumberRounded(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "insights" && viewMode === "flow" && (
            <div className="panel">
              <div className="insight-card">
                <div className="insight-title">Total Amount</div>
                <div className="insight-value">
                  {formatCurrencyRounded(flowStats?.totalAmount)}
                </div>
                <div className="insight-subtitle">
                  Period: {flowStats?.period || "—"}
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-title">Summary</div>
                <div className="stat-row">
                  <span>Total Flows</span>
                  <span>{formatNumber(flowStats?.totalFlows)}</span>
                </div>
                <div className="stat-row">
                  <span>Displayed</span>
                  <span>{formatNumber(flowStats?.displayedFlows)}</span>
                </div>
                <div className="stat-row">
                  <span>Displayed Amount</span>
                  <span>{formatCurrencyRounded(flowStats?.displayedAmount)}</span>
                </div>
                <div className="stat-row">
                  <span>Average Flow</span>
                  <span>{formatCurrencyRounded(flowStats?.averageFlow)}</span>
                </div>
                <div className="stat-row">
                  <span>Locations Involved</span>
                  <span>{formatNumber(flowStats?.locationsInvolved)}</span>
                </div>
              </div>

              {flowData?.thresholds && (
                <div className="insight-card">
                  <div className="insight-title">Quintile Thresholds (Amount)</div>
                  <div className="stat-row">
                    <span>Q1</span>
                    <span>≤ {formatCurrencyRounded(flowData.thresholds[0])}</span>
                  </div>
                  <div className="stat-row">
                    <span>Q2</span>
                    <span>≤ {formatCurrencyRounded(flowData.thresholds[1])}</span>
                  </div>
                  <div className="stat-row">
                    <span>Q3</span>
                    <span>≤ {formatCurrencyRounded(flowData.thresholds[2])}</span>
                  </div>
                  <div className="stat-row">
                    <span>Q4</span>
                    <span>≤ {formatCurrencyRounded(flowData.thresholds[3])}</span>
                  </div>
                  <div className="stat-row">
                    <span>Q5</span>
                    <span>&gt; {formatCurrencyRounded(flowData.thresholds[3])}</span>
                  </div>
                </div>
              )}

              <div className="insight-card">
                <div className="insight-title">Top Agencies</div>
                <div className="rank-list">
                  {(flowStats?.topAgencies || []).map((item) => (
                    <div className="rank-row" key={item.name}>
                      <span>{item.name}</span>
                      <span>{formatCurrencyRounded(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-title">Top Origins</div>
                <div className="rank-list">
                  {(flowStats?.topOrigins || []).map((item) => (
                    <div className="rank-row" key={item.name}>
                      <span>{item.name}</span>
                      <span>{formatCurrencyRounded(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-title">Top Destinations</div>
                <div className="rank-list">
                  {(flowStats?.topDestinations || []).map((item) => (
                    <div className="rank-row" key={item.name}>
                      <span>{item.name}</span>
                      <span>{formatCurrencyRounded(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-title">Largest Flow</div>
                {flowStats?.largestFlow ? (
                  <>
                    <div className="stat-row">
                      <span>Origin</span>
                      <span>{flowStats.largestFlow.origin}</span>
                    </div>
                    <div className="stat-row">
                      <span>Destination</span>
                      <span>{flowStats.largestFlow.dest}</span>
                    </div>
                    <div className="stat-row">
                      <span>Agency</span>
                      <span>{flowStats.largestFlow.agency}</span>
                    </div>
                    <div className="stat-row">
                      <span>Amount</span>
                      <span>{formatCurrencyRounded(flowStats.largestFlow.amount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="stat-row">
                    <span>No flow selected</span>
                    <span>—</span>
                  </div>
                )}
              </div>
            </div>
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
        <div className="map-shell">
          <div className="map-wrap">
            {viewMode === "atlas" ? (
              <>
                <MapCanvas
                  geojson={enrichedGeo}
                  level={level}
                  onHover={setAtlasHover}
                  onSelect={setSelectedFeature}
                  selectedId={selectedId}
                  resizeKey={`${viewMode}-${sidebarWidth}`}
                />
                {!enrichedGeo && (
                  <div className="map-placeholder">
                    <p>Select a dataset, level, and variable to begin.</p>
                  </div>
                )}
                {atlasHover && (
                  <div className="map-tooltip" style={{ left: atlasHover.x, top: atlasHover.y }}>
                    <div className="map-tooltip-title">{atlasHover.label}</div>
                    <div className="map-tooltip-meta">{getVariableLabel(dataset, variable)}</div>
                    <em>{formatNumber(atlasHover.value)}</em>
                    <div className="map-tooltip-meta">
                      {atlasHover.quintile ? `Q${atlasHover.quintile}` : "No data"}
                    </div>
                  </div>
                )}
                {selectedFeature && (
                  <div className="map-card">
                    <div className="map-card-header">
                      <div>
                        <div className="map-card-title">{selectedFeature.label}</div>
                        <div className="map-card-subtitle">
                          {(datasetLabel || "Dataset") +
                            (level ? ` · ${LEVEL_LABELS[level] || level}` : "") +
                            (year ? ` · ${year}` : "")}
                        </div>
                      </div>
                      <button
                        className="map-card-close"
                        type="button"
                        onClick={() => setSelectedFeature(null)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="map-card-body">
                      <div className="map-card-row">
                        <span>ID</span>
                        <span>{selectedId || "—"}</span>
                      </div>
                      <div className="map-card-row">
                        <span>Metric</span>
                        <span>{getVariableLabel(dataset, variable)}</span>
                      </div>
                      <div className="map-card-row">
                        <span>Value</span>
                        <span>{formatNumber(selectedFeature.value)}</span>
                      </div>
                      <div className="map-card-row">
                        <span>Quintile</span>
                        <span>{selectedFeature.quintile ? `Q${selectedFeature.quintile}` : "—"}</span>
                      </div>
                      <div className="map-card-row">
                        <span>Rank</span>
                        <span>
                          {selectedRank ? `${selectedRank.rank} of ${rankMeta.total}` : "—"}
                        </span>
                      </div>
                      <div className="map-card-row">
                        <span>Percentile</span>
                        <span>{selectedRank ? `${selectedRank.percentile}th` : "—"}</span>
                      </div>
                      <div className="map-card-footnote">{thresholdSummary}</div>
                    </div>
                  </div>
                )}
                <div className="map-legend">
                  <span>Quintile Scale</span>
                  <div className="legend-scale">
                    <div className="legend-bar" />
                    <div className="legend-labels">
                      <span>Low</span>
                      <span>Q2</span>
                      <span>Q3</span>
                      <span>Q4</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <FlowMapCanvas
                  flows={flowDisplay}
                  level={flowLevel}
                  stateBoundaries={geoCache.state}
                  levelBoundaries={flowLevel !== "state" ? geoCache[flowLevel] : null}
                  focusState={flowFilters.state}
                  direction={flowFilters.direction}
                  onHover={setFlowHover}
                  onSelect={setFlowSelected}
                  resizeKey={`${viewMode}-${sidebarWidth}`}
                  isLoading={flowStatus.state === "loading"}
                  baseStyle={BASE_STYLE}
                  fitBounds={US_BOUNDS}
                />
                {flowStatus.state === "loading" && (
                  <div className="map-loading">
                    <div className="loading-spinner" />
                    <span>Loading flows…</span>
                  </div>
                )}
                {!flowDisplay?.length && flowStatus.state !== "loading" && (
                  <div className="map-placeholder">
                    <p>Select flow parameters to load data.</p>
                  </div>
                )}
                {flowHover && (
                  <div className="map-tooltip" style={{ left: flowHover.x, top: flowHover.y }}>
                    <div className="map-tooltip-title">
                      {flowHover.origin} → {flowHover.dest}
                    </div>
                    <div className="map-tooltip-meta">{flowHover.agency}</div>
                    <em>{formatCurrency(flowHover.amount)}</em>
                    {flowHover.quintile > 0 && (
                      <div className="map-tooltip-meta">Quintile {flowHover.quintile}</div>
                    )}
                  </div>
                )}
                {flowSelected && (
                  <div className="map-card flow-card">
                    <div className="map-card-header">
                      <div>
                        <div className="map-card-title">Federal Fund Flow</div>
                        <div className="map-card-subtitle">
                          {FLOW_LEVEL_LABELS[flowLevel] || flowLevel}
                        </div>
                      </div>
                      <button
                        className="map-card-close"
                        type="button"
                        onClick={() => setFlowSelected(null)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="map-card-body">
                      <div className="map-card-row">
                        <span>Origin (Outflow)</span>
                        <span>{flowSelected.origin_name}</span>
                      </div>
                      <div className="map-card-row">
                        <span>Destination (Inflow)</span>
                        <span>{flowSelected.dest_name}</span>
                      </div>
                      <div className="map-card-row">
                        <span>Agency</span>
                        <span>{flowSelected.agency}</span>
                      </div>
                      <div className="map-card-row">
                        <span>Amount</span>
                        <span>{formatCurrency(flowSelected.amount)}</span>
                      </div>
                      {flowSelected.quintile > 0 && (
                        <div className="map-card-row">
                          <span>Quintile</span>
                          <span>Q{flowSelected.quintile}</span>
                        </div>
                      )}
                      {flowSelected.record_count !== undefined && (
                        <div className="map-card-row">
                          <span>Records</span>
                          <span>{formatNumber(flowSelected.record_count)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="map-legend flow-legend">
                  <div className="flow-map-legend-content">
                    <div className="flow-legend-colors">
                      <div className="flow-color-item">
                        <span className="flow-color-dot inflow" />
                        <span>Inflow</span>
                      </div>
                      <div className="flow-color-item">
                        <span className="flow-color-dot outflow" />
                        <span>Outflow</span>
                      </div>
                    </div>
                    <div className="flow-legend-divider" />
                    <div className="flow-thickness-mini">
                      <span>Q1</span>
                      <div className="flow-mini-scale">
                        <div className="flow-scale-line q1" />
                        <div className="flow-scale-line q3" />
                        <div className="flow-scale-line q5" />
                      </div>
                      <span>Q5</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      {tourOpen && (
        <div className="tour-overlay">
          <div className="tour-card">
            <div className="tour-header">
              <div>
                <div className="tour-kicker">
                  Step {tourStep + 1} of {TOUR_STEPS.length}
                </div>
                <div className="tour-title">{tour.title}</div>
              </div>
              <button
                className="tour-close"
                type="button"
                onClick={() => {
                  setTourOpen(false);
                  localStorage.setItem("oa_tour_dismissed", "1");
                }}
              >
                ×
              </button>
            </div>
            <div className="tour-body">{tour.body}</div>
            {tour.bullets && (
              <ul className="tour-list">
                {tour.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            <div className="tour-actions">
              <button
                className="tour-btn"
                type="button"
                onClick={() => setTourStep((step) => Math.max(0, step - 1))}
                disabled={tourStep === 0}
              >
                Back
              </button>
              <div className="tour-dots">
                {TOUR_STEPS.map((_, idx) => (
                  <span
                    key={idx}
                    className={`tour-dot ${idx === tourStep ? "active" : ""}`}
                  />
                ))}
              </div>
              {tourStep < TOUR_STEPS.length - 1 ? (
                <button
                  className="tour-btn primary"
                  type="button"
                  onClick={() => setTourStep((step) => Math.min(TOUR_STEPS.length - 1, step + 1))}
                >
                  Next
                </button>
              ) : (
                <button
                  className="tour-btn primary"
                  type="button"
                  onClick={() => {
                    setTourOpen(false);
                    localStorage.setItem("oa_tour_dismissed", "1");
                  }}
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
