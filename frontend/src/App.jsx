import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { METADATA } from "./metadata.js";

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
const FLOW_BOUNDS = [
  [-180, 17],
  [-65, 72]
];

const formatLabel = (value) =>
  value
    ? value
        .toString()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "—";

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
      "Government Spending: assets, liabilities, revenue, expenses",
      "Contract Flow: obligations and subaward flows",
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

const FLOW_COLORS = {
  inflow: { r: 37, g: 99, b: 235 },
  outflow: { r: 220, g: 38, b: 38 },
  neutral: { r: 100, g: 116, b: 139 }
};

const generateBezierCurve = (startLon, startLat, endLon, endLat, numPoints = 20) => {
  const points = [];
  const midLon = (startLon + endLon) / 2;
  const midLat = (startLat + endLat) / 2;
  const dx = endLon - startLon;
  const dy = endLat - startLat;
  const distance = Math.sqrt(dx * dx + dy * dy) || 1;
  const curveHeight = Math.min(distance * 0.25, 10);
  const perpX = -dy / distance;
  const perpY = dx / distance;
  const ctrlLon = midLon + perpX * curveHeight;
  const ctrlLat = midLat + perpY * curveHeight;

  for (let i = 0; i <= numPoints; i += 1) {
    const t = i / numPoints;
    const oneMinusT = 1 - t;
    const lon = oneMinusT * oneMinusT * startLon +
      2 * oneMinusT * t * ctrlLon +
      t * t * endLon;
    const lat = oneMinusT * oneMinusT * startLat +
      2 * oneMinusT * t * ctrlLat +
      t * t * endLat;
    points.push([lon, lat]);
  }
  return points;
};

const getFlowRange = (flows) => {
  if (!flows.length) return { min: 0, max: 1 };
  let min = Infinity;
  let max = -Infinity;
  flows.forEach((flow) => {
    const amt = Math.abs(Number(flow.amount));
    if (!Number.isFinite(amt)) return;
    const scaled = Math.log10(amt + 1);
    if (scaled < min) min = scaled;
    if (scaled > max) max = scaled;
  });
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return { min: 0, max: 1 };
  }
  return { min, max };
};

const formatRgb = (color) => `rgb(${color.r},${color.g},${color.b})`;

const mixColor = (from, to, t) => ({
  r: Math.round(from.r + (to.r - from.r) * t),
  g: Math.round(from.g + (to.g - from.g) * t),
  b: Math.round(from.b + (to.b - from.b) * t)
});

const getFlowDirection = (flow, focusState) => {
  if (!focusState || focusState === "All") return "neutral";
  if (flow.origin_state && flow.origin_state === focusState) return "outflow";
  if (flow.dest_state && flow.dest_state === focusState) return "inflow";
  return "neutral";
};

const flowsToGeoJSON = (flows, minAmt, maxAmt, focusState) => {
  const features = [];
  const useGradient = !focusState || focusState === "All";
  flows.forEach((flow) => {
    const amount = Number(flow.amount);
    if (!Number.isFinite(amount)) return;
    const magnitude = Math.abs(amount);
    const scaled = Math.log10(magnitude + 1);
    const normAmount = maxAmt > minAmt ? (scaled - minAmt) / (maxAmt - minAmt) : 0.5;
    const widthScale = Math.pow(Math.min(Math.max(normAmount, 0), 1), 0.85);
    const direction = getFlowDirection(flow, focusState);
    const curvePoints = generateBezierCurve(
      flow.origin_lon,
      flow.origin_lat,
      flow.dest_lon,
      flow.dest_lat,
      20
    );
    const baseWidth = 0.25 + widthScale * 0.9;
    const segments = curvePoints.length - 1;
    for (let i = 0; i < segments; i += 1) {
      const t = i / segments;
      const opacity = 0.4 + Math.sin(t * Math.PI) * 0.35;
      const color = useGradient
        ? formatRgb(mixColor(FLOW_COLORS.outflow, FLOW_COLORS.inflow, t))
        : formatRgb(FLOW_COLORS[direction] || FLOW_COLORS.neutral);
      features.push({
        type: "Feature",
        properties: {
          flow_id: flow.id,
          origin: flow.origin_name,
          dest: flow.dest_name,
          amount: amount,
          agency: flow.agency,
          direction,
          color,
          opacity,
          width: baseWidth
        },
        geometry: {
          type: "LineString",
          coordinates: [curvePoints[i], curvePoints[i + 1]]
        }
      });
    }
  });
  return {
    type: "FeatureCollection",
    features
  };
};

const endpointsToGeoJSON = (flows) => ({
  type: "FeatureCollection",
  features: flows.flatMap((flow) => {
    const originColor = FLOW_COLORS.outflow;
    const destColor = FLOW_COLORS.inflow;
    return ([
      {
        type: "Feature",
        properties: { role: "origin", name: flow.origin_name, color: formatRgb(originColor) },
        geometry: { type: "Point", coordinates: [flow.origin_lon, flow.origin_lat] }
      },
      {
        type: "Feature",
        properties: { role: "dest", name: flow.dest_name, color: formatRgb(destColor) },
        geometry: { type: "Point", coordinates: [flow.dest_lon, flow.dest_lat] }
      }
    ]);
  })
});

function FlowMapCanvas({
  flows,
  level,
  boundaries,
  stateBoundaries,
  focusState,
  onHover,
  onSelect,
  resizeKey
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const eventsBound = useRef(false);
  const flowLookupRef = useRef(new Map());
  useEffect(() => {
    flowLookupRef.current = new Map(flows.map((flow) => [flow.id, flow]));
  }, [flows]);
  const { min, max } = useMemo(() => getFlowRange(flows), [flows]);
  const flowGeoJSON = useMemo(
    () => flowsToGeoJSON(flows, min, max, focusState),
    [flows, min, max, focusState]
  );
  const endpointsGeoJSON = useMemo(
    () => endpointsToGeoJSON(flows),
    [flows]
  );

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
    return () => map.remove();
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const loadData = () => {
      if (level === "state" && map.getLayer("flow-level-borders")) {
        map.removeLayer("flow-level-borders");
      }
      if (level === "state" && map.getSource("flow-level")) {
        map.removeSource("flow-level");
      }

      if (stateBoundaries) {
        if (!map.getSource("flow-states")) {
          map.addSource("flow-states", { type: "geojson", data: stateBoundaries });
          map.addLayer({
            id: "flow-state-borders",
            type: "line",
            source: "flow-states",
            paint: {
              "line-color": "rgba(148, 163, 184, 0.7)",
              "line-width": 0.8
            }
          });
        } else {
          map.getSource("flow-states").setData(stateBoundaries);
        }
      }

      if (boundaries && level !== "state") {
        if (!map.getSource("flow-level")) {
          map.addSource("flow-level", { type: "geojson", data: boundaries });
          map.addLayer({
            id: "flow-level-borders",
            type: "line",
            source: "flow-level",
            paint: {
              "line-color": "rgba(203, 213, 225, 0.6)",
              "line-width": level === "county" ? 0.25 : 0.5
            }
          });
        } else {
          map.getSource("flow-level").setData(boundaries);
          map.setPaintProperty("flow-level-borders", "line-width", level === "county" ? 0.25 : 0.5);
        }
      } else if (level !== "state" && map.getSource("flow-level")) {
        map.getSource("flow-level").setData({ type: "FeatureCollection", features: [] });
      }

      if (!map.getSource("flow-lines")) {
        map.addSource("flow-lines", { type: "geojson", data: flowGeoJSON });
        map.addLayer({
          id: "flow-lines-layer",
          type: "line",
          source: "flow-lines",
          paint: {
            "line-color": ["get", "color"],
            "line-width": ["get", "width"],
            "line-opacity": ["get", "opacity"]
          },
          layout: {
            "line-cap": "round",
            "line-join": "round"
          }
        });
      } else {
        map.getSource("flow-lines").setData(flowGeoJSON);
      }

      if (!map.getSource("flow-points")) {
        map.addSource("flow-points", { type: "geojson", data: endpointsGeoJSON });
        map.addLayer({
          id: "flow-points-layer",
          type: "circle",
          source: "flow-points",
          paint: {
            "circle-radius": 1.5,
            "circle-color": ["get", "color"],
            "circle-opacity": 0.5
          }
        });
      } else {
        map.getSource("flow-points").setData(endpointsGeoJSON);
      }

      if (!eventsBound.current) {
        eventsBound.current = true;
        const findFlowFeature = (point) => {
          const padding = 10;
          const bbox = [
            [point.x - padding, point.y - padding],
            [point.x + padding, point.y + padding]
          ];
          const features = map.queryRenderedFeatures(bbox, { layers: ["flow-lines-layer"] });
          return features[0];
        };

        map.on("mousemove", (event) => {
          const feature = findFlowFeature(event.point);
          if (!feature) {
            map.getCanvas().style.cursor = "";
            onHover(null);
            return;
          }
          map.getCanvas().style.cursor = "pointer";
          onHover({
            x: event.point.x,
            y: event.point.y,
            origin: feature.properties?.origin,
            dest: feature.properties?.dest,
            amount: Number(feature.properties?.amount),
            agency: feature.properties?.agency,
            flowId: feature.properties?.flow_id
          });
        });
        map.on("click", (event) => {
          const feature = findFlowFeature(event.point);
          if (!feature) {
            onSelect(null);
            return;
          }
          const flowId = feature.properties?.flow_id;
          if (!flowId) return;
          onSelect(flowLookupRef.current.get(flowId) || null);
        });
      }
    };

    if (map.isStyleLoaded()) {
      loadData();
    } else {
      map.once("load", loadData);
    }
  }, [boundaries, endpointsGeoJSON, flowGeoJSON, level, onHover, onSelect, stateBoundaries]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds(FLOW_BOUNDS, { padding: 40, duration: 600 });
  }, [level, flows]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  }, [resizeKey]);

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
      setValuesData(null);
      setSelectedFeature(null);
      setInfoOpen(false);
      return;
    }
    setAtlasStatus({ state: "loading", message: "Loading variables" });
    setValuesData(null);
    const params = new URLSearchParams({ dataset, level }).toString();
    fetchJson(`/api/variables?${params}`)
      .then((data) => {
        const nextVars = data.variables || [];
        setVariables(nextVars);
        setVariable(nextVars[0] || "");
      })
      .catch(() => setAtlasStatus({ state: "error", message: "Failed to load variables" }));
  }, [dataset, level]);

  useEffect(() => {
    if (!dataset || !level || !variable) return;
    setAtlasStatus({ state: "loading", message: "Loading values" });
    setAtlasHover(null);
    setSelectedFeature(null);
    const params = new URLSearchParams({ dataset, level, variable }).toString();
    fetchJson(`/api/values?${params}`)
      .then((data) => {
        setValuesData(data);
        setAtlasStatus({ state: "ready", message: `Loaded ${data.stats?.count || 0} records` });
      })
      .catch(() => setAtlasStatus({ state: "error", message: "Failed to load values" }));
  }, [dataset, level, variable]);

  useEffect(() => {
    if (viewMode !== "flow") return;
    if (!flowLevel) return;
    setFlowStatus({ state: "loading", message: "Loading flow options" });
    fetchJson(`/api/flow/options?level=${flowLevel}`)
      .then((data) => {
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
        setFlowStatus({ state: "ready", message: "Flow options ready" });
      })
      .catch(() => setFlowStatus({ state: "error", message: "Failed to load flow options" }));
  }, [flowLevel, viewMode]);

  useEffect(() => {
    if (viewMode !== "flow") return;
    if (!flowLevel) return;
    setFlowStatus({ state: "loading", message: "Loading flow data" });
    setFlowData(null);
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
        setFlowData(data);
        setFlowStatus({
          state: "ready",
          message: `Loaded ${data.aggregated_stats?.total_flows || 0} flows`
        });
      })
      .catch(() => setFlowStatus({ state: "error", message: "Failed to load flows" }));
  }, [flowLevel, flowFilters, viewMode]);

  useEffect(() => {
    const targets = new Set();
    if (level) targets.add(level);
    if (flowLevel) targets.add(flowLevel);
    if (flowLevel && flowLevel !== "state") targets.add("state");
    targets.forEach((target) => {
      if (geoCache[target]) return;
      fetchJson(`/api/geo/${target}`)
        .then((data) => setGeoCache((prev) => ({ ...prev, [target]: data })))
        .catch(() => setAtlasStatus({ state: "error", message: "Failed to load geometry" }));
    });
  }, [level, flowLevel, geoCache]);

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
    if (!flowData?.display_flows) return [];
    const focusState = flowFilters.state;
    if (!focusState || focusState === "All") return flowData.display_flows;
    if (flowFilters.direction === "Inflow") {
      return flowData.display_flows.filter((flow) => flow.dest_state === focusState);
    }
    if (flowFilters.direction === "Outflow") {
      return flowData.display_flows.filter((flow) => flow.origin_state === focusState);
    }
    return flowData.display_flows;
  }, [flowData, flowFilters.direction, flowFilters.state]);
  const flowStats = useMemo(() => {
    if (!flowData) return null;
    const displayFlows = flowDisplay || [];
    const aggregated = flowData.aggregated_stats || {};
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
                      {variable ? formatLabel(variable) : "Select a variable"}
                    </div>
                    <div className="info-text">
                      {variableMeta || "Variable definitions will appear here."}
                    </div>
                  </div>
                  <div className="info-section">
                    <div className="info-label">Geography</div>
                    <div className="info-value">{levelLabel}</div>
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
                          {formatLabel(item)}
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

              {flowLevel === "state" && (
                <div className="section">
                  <div className="section-title">Industry</div>
                  <label className="control">
                    <span>NAICS</span>
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

              {flowLevel !== "state" && (
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
                <div className="flow-legend-grid">
                  <div className="flow-legend-row">
                    <span>Inflow</span>
                    <div className="legend-bar flow-bar inflow" />
                  </div>
                  <div className="flow-legend-row">
                    <span>Outflow</span>
                    <div className="legend-bar flow-bar outflow" />
                  </div>
                  <div className="legend-labels flow-labels">
                    <span>Lower</span>
                    <span>Higher</span>
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
                  {variable ? formatLabel(variable) : "—"}
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
                  <span>{formatNumber(valuesData?.stats?.min)}</span>
                </div>
                <div className="stat-row">
                  <span>Max</span>
                  <span>{formatNumber(valuesData?.stats?.max)}</span>
                </div>
                <div className="stat-row">
                  <span>Mean</span>
                  <span>{formatNumber(valuesData?.stats?.mean)}</span>
                </div>
                <div className="stat-row">
                  <span>Median</span>
                  <span>{formatNumber(valuesData?.stats?.median)}</span>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-title">Quintile Thresholds</div>
                <div className="stat-row">
                  <span>Q1</span>
                  <span>≤ {formatNumber(thresholds[0])}</span>
                </div>
                <div className="stat-row">
                  <span>Q2</span>
                  <span>
                    {formatNumber(thresholds[0])} – {formatNumber(thresholds[1])}
                  </span>
                </div>
                <div className="stat-row">
                  <span>Q3</span>
                  <span>
                    {formatNumber(thresholds[1])} – {formatNumber(thresholds[2])}
                  </span>
                </div>
                <div className="stat-row">
                  <span>Q4</span>
                  <span>
                    {formatNumber(thresholds[2])} – {formatNumber(thresholds[3])}
                  </span>
                </div>
                <div className="stat-row">
                  <span>Q5</span>
                  <span>&gt; {formatNumber(thresholds[3])}</span>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-title">Top 10 Locations</div>
                <div className="rank-list">
                  {(valuesData?.top || []).map((item) => (
                    <div className="rank-row" key={item.label}>
                      <span>{item.label}</span>
                      <span>{formatNumber(item.value)}</span>
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
                      <span>{formatNumber(item.value)}</span>
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
                  {formatCurrency(flowStats?.totalAmount)}
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
                  <span>{formatCurrency(flowStats?.displayedAmount)}</span>
                </div>
                <div className="stat-row">
                  <span>Average Flow</span>
                  <span>{formatCurrency(flowStats?.averageFlow)}</span>
                </div>
                <div className="stat-row">
                  <span>Locations Involved</span>
                  <span>{formatNumber(flowStats?.locationsInvolved)}</span>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-title">Top Agencies</div>
                <div className="rank-list">
                  {(flowStats?.topAgencies || []).map((item) => (
                    <div className="rank-row" key={item.name}>
                      <span>{item.name}</span>
                      <span>{formatCurrency(item.amount)}</span>
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
                      <span>{formatCurrency(item.amount)}</span>
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
                      <span>{formatCurrency(item.amount)}</span>
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
                      <span>{formatCurrency(flowStats.largestFlow.amount)}</span>
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
                    <div className="map-tooltip-meta">{formatLabel(variable)}</div>
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
                          {(datasetLabel || "Dataset") + (level ? ` · ${LEVEL_LABELS[level] || level}` : "")}
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
                        <span>{formatLabel(variable)}</span>
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
                  boundaries={geoCache[flowLevel]}
                  stateBoundaries={geoCache.state}
                  focusState={flowFilters.state}
                  onHover={setFlowHover}
                  onSelect={setFlowSelected}
                  resizeKey={`${viewMode}-${sidebarWidth}`}
                />
                {flowStatus.state === "loading" && (
                  <div className="map-loading">
                    <div className="loading-spinner" />
                    <span>Loading flows…</span>
                  </div>
                )}
                {!flowDisplay?.length && flowStatus.state !== "loading" && (
                  <div className="map-placeholder">
                    <p>Select flow parameters to begin.</p>
                  </div>
                )}
                {flowHover && (
                  <div className="map-tooltip" style={{ left: flowHover.x, top: flowHover.y }}>
                    <div className="map-tooltip-title">
                      {flowHover.origin} → {flowHover.dest}
                    </div>
                    <div className="map-tooltip-meta">{flowHover.agency}</div>
                    <em>{formatCurrency(flowHover.amount)}</em>
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
                        <span>Origin</span>
                        <span>{flowSelected.origin_name}</span>
                      </div>
                      <div className="map-card-row">
                        <span>Destination</span>
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
                      {flowSelected.record_count !== undefined && (
                        <div className="map-card-row">
                          <span>Records</span>
                          <span>{formatNumber(flowSelected.record_count)}</span>
                        </div>
                      )}
                      <div className="map-card-row">
                        <span>Origin Coords</span>
                        <span>{flowSelected.origin_lat.toFixed(2)}, {flowSelected.origin_lon.toFixed(2)}</span>
                      </div>
                      <div className="map-card-row">
                        <span>Destination Coords</span>
                        <span>{flowSelected.dest_lat.toFixed(2)}, {flowSelected.dest_lon.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="map-legend flow-legend">
                  <span>Flow Intensity</span>
                  <div className="legend-scale">
                    <div className="flow-legend-grid">
                      <div className="flow-legend-row">
                        <span>Inflow</span>
                        <div className="legend-bar flow-bar inflow" />
                      </div>
                      <div className="flow-legend-row">
                        <span>Outflow</span>
                        <div className="legend-bar flow-bar outflow" />
                      </div>
                      <div className="legend-labels flow-labels">
                        <span>Lower</span>
                        <span>Higher</span>
                      </div>
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
