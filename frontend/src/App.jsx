import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { METADATA } from "./metadata.js";

const QUINTILE_COLORS = ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"];
const LEVEL_LABELS = {
  state: "State",
  county: "County",
  congress: "Congressional District"
};
const BASE_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const US_BOUNDS = [
  [-125.5, 24.2],
  [-66.9, 49.8]
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const fetchJson = async (url) => {
  const res = await fetch(url);
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
  }
];

function MapCanvas({ geojson, level, onHover, onSelect, selectedId }) {
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
              ["get", "quintile"],
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
  const [datasets, setDatasets] = useState([]);
  const [dataset, setDataset] = useState("");
  const [level, setLevel] = useState("");
  const [variables, setVariables] = useState([]);
  const [variable, setVariable] = useState("");
  const [valuesData, setValuesData] = useState(null);
  const [geoCache, setGeoCache] = useState({});
  const [tab, setTab] = useState("filters");
  const [status, setStatus] = useState({ state: "ready", message: "Ready" });
  const [hoverInfo, setHoverInfo] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [infoOpen, setInfoOpen] = useState(false);
  const resizeRef = useRef({ startX: 0, startWidth: 360 });

  useEffect(() => {
    fetchJson(`${API_BASE}/api/datasets`)
      .then((data) => setDatasets(data.datasets || []))
      .catch(() => setStatus({ state: "error", message: "Failed to load datasets" }));
  }, []);

  useEffect(() => {
    setTourOpen(true);
    setTourStep(0);
  }, []);

  useEffect(() => {
    if (!dataset || !level) {
      setVariables([]);
      setVariable("");
      setValuesData(null);
      setSelectedFeature(null);
      setInfoOpen(false);
      return;
    }
    setStatus({ state: "loading", message: "Loading variables" });
    setValuesData(null);
    fetchJson(`${API_BASE}/api/variables?dataset=${dataset}&level=${level}`)
      .then((data) => {
        const nextVars = data.variables || [];
        setVariables(nextVars);
        setVariable(nextVars[0] || "");
      })
      .catch(() => setStatus({ state: "error", message: "Failed to load variables" }));
  }, [dataset, level]);

  useEffect(() => {
    if (!dataset || !level || !variable) return;
    setStatus({ state: "loading", message: "Loading values" });
    setHoverInfo(null);
    setSelectedFeature(null);
    fetchJson(`${API_BASE}/api/values?dataset=${dataset}&level=${level}&variable=${variable}`)
      .then((data) => {
        setValuesData(data);
        setStatus({ state: "ready", message: `Loaded ${data.stats?.count || 0} records` });
      })
      .catch(() => setStatus({ state: "error", message: "Failed to load values" }));
  }, [dataset, level, variable]);

  useEffect(() => {
    if (!level || geoCache[level]) return;
    fetchJson(`${API_BASE}/api/geo/${level}`)
      .then((data) => setGeoCache((prev) => ({ ...prev, [level]: data })))
      .catch(() => setStatus({ state: "error", message: "Failed to load geometry" }));
  }, [level, geoCache]);

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
        </div>

        <div className="tab-content">
          {tab === "filters" && (
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

          {tab === "insights" && (
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
        </div>

        <div className={`status-bar ${status.state}`}>
          <span className="status-dot" />
          <span>{status.message}</span>
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
            <MapCanvas
              geojson={enrichedGeo}
              level={level}
              onHover={setHoverInfo}
              onSelect={setSelectedFeature}
              selectedId={selectedId}
            />
            {!enrichedGeo && (
              <div className="map-placeholder">
                <p>Select a dataset, level, and variable to begin.</p>
              </div>
            )}
            {hoverInfo && (
              <div className="map-tooltip" style={{ left: hoverInfo.x, top: hoverInfo.y }}>
                <div className="map-tooltip-title">{hoverInfo.label}</div>
                <div className="map-tooltip-meta">{formatLabel(variable)}</div>
                <strong>{formatNumber(hoverInfo.value)}</strong>
                <div className="map-tooltip-meta">
                  {hoverInfo.quintile ? `Q${hoverInfo.quintile}` : "No data"}
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
