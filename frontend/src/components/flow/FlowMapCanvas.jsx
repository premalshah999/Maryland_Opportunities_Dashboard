import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";

// Quintile-based color gradients for inflows (blues) and outflows (reds)
// Wide color range for clear differentiation between quintiles
// Higher opacity for thinner lines (Q1, Q2) to ensure visibility
const QUINTILE_INFLOW_COLORS = [
  "rgba(191, 219, 254, 0.9)",   // Q1 - very light sky blue (pastel)
  "rgba(96, 165, 250, 0.85)",   // Q2 - light blue
  "rgba(37, 99, 235, 0.8)",     // Q3 - medium blue
  "rgba(30, 64, 175, 0.85)",    // Q4 - strong blue
  "rgba(30, 58, 138, 0.9)"      // Q5 - deep navy blue
];

const QUINTILE_OUTFLOW_COLORS = [
  "rgba(254, 202, 202, 0.9)",   // Q1 - very light pink (pastel)
  "rgba(252, 129, 129, 0.85)",  // Q2 - light coral
  "rgba(220, 38, 38, 0.8)",     // Q3 - medium red
  "rgba(153, 27, 27, 0.85)",    // Q4 - dark red
  "rgba(127, 29, 29, 0.9)"      // Q5 - deep maroon
];

const normalizeLon = (lon) => {
  let normalized = lon;
  while (normalized > 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
};

const generateBezierCurve = (startLon, startLat, endLon, endLat, numPoints = 24) => {
  const points = [];
  let sLon = normalizeLon(startLon);
  let eLon = normalizeLon(endLon);

  const dx = eLon - sLon;
  if (Math.abs(dx) > 180) {
    if (dx > 0) sLon += 360;
    else eLon += 360;
  }

  const midLat = (startLat + endLat) / 2;
  const lineDx = eLon - sLon;
  const lineDy = endLat - startLat;
  const distance = Math.sqrt(lineDx * lineDx + lineDy * lineDy) || 1;
  const curveHeight = Math.min(distance * 0.2, 8);
  const perpX = -lineDy / distance;
  const perpY = lineDx / distance;
  const ctrlLon = (sLon + eLon) / 2 + perpX * curveHeight;
  const ctrlLat = midLat + perpY * curveHeight;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const oneMinusT = 1 - t;
    const lon = oneMinusT * oneMinusT * sLon + 2 * oneMinusT * t * ctrlLon + t * t * eLon;
    const lat = oneMinusT * oneMinusT * startLat + 2 * oneMinusT * t * ctrlLat + t * t * endLat;
    points.push([normalizeLon(lon), lat]);
  }
  return points;
};

// Determine the color palette based on flow direction and quintile
const getFlowColor = (flow, focusState, direction) => {
  const quintile = flow.quintile || 3;
  const colorIndex = Math.min(4, Math.max(0, quintile - 1));

  // If a specific state is selected, determine direction relative to that state
  if (focusState && focusState !== "All") {
    const isOutflow = flow.origin_state === focusState;
    const isInflow = flow.dest_state === focusState;
    // If both (internal flow), treat as inflow (money staying in state)
    // If outflow only, show red
    // If inflow only, show blue
    if (isOutflow && !isInflow) {
      return { color: QUINTILE_OUTFLOW_COLORS[colorIndex], flowType: "outflow" };
    } else {
      // inflow or internal - show as blue
      return { color: QUINTILE_INFLOW_COLORS[colorIndex], flowType: "inflow" };
    }
  }

  // If direction filter is applied
  if (direction === "Inflow") {
    return { color: QUINTILE_INFLOW_COLORS[colorIndex], flowType: "inflow" };
  }
  if (direction === "Outflow") {
    return { color: QUINTILE_OUTFLOW_COLORS[colorIndex], flowType: "outflow" };
  }

  // No state selected and no direction filter - use deterministic coloring
  // Color based on comparing origin and destination to create visual variety
  // If origin longitude is west of destination, it's flowing east (show as inflow/blue)
  // If origin longitude is east of destination, it's flowing west (show as outflow/red)
  const isEastward = flow.origin_lon < flow.dest_lon;
  if (isEastward) {
    return { color: QUINTILE_INFLOW_COLORS[colorIndex], flowType: "inflow" };
  } else {
    return { color: QUINTILE_OUTFLOW_COLORS[colorIndex], flowType: "outflow" };
  }
};

const flowsToGeoJSON = (flows, focusState, direction) => {
  const features = [];

  for (const flow of flows) {
    const amount = Number(flow.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    if (!Number.isFinite(flow.origin_lat) || !Number.isFinite(flow.origin_lon) ||
        !Number.isFinite(flow.dest_lat) || !Number.isFinite(flow.dest_lon)) continue;

    const { color, flowType } = getFlowColor(flow, focusState, direction);
    const width = flow.width || 2;
    const curvePoints = generateBezierCurve(
      flow.origin_lon,
      flow.origin_lat,
      flow.dest_lon,
      flow.dest_lat
    );

    features.push({
      type: "Feature",
      properties: {
        flow_id: flow.id,
        origin: flow.origin_name,
        dest: flow.dest_name,
        amount,
        agency: flow.agency,
        quintile: flow.quintile || 0,
        width,
        color,
        flowType
      },
      geometry: {
        type: "LineString",
        coordinates: curvePoints
      }
    });
  }

  return { type: "FeatureCollection", features };
};

export function FlowMapCanvas({
  flows,
  level,
  stateBoundaries,
  levelBoundaries,
  focusState,
  direction,
  onSelect,
  resizeKey,
  isLoading,
  baseStyle,
  fitBounds,
  formatAmount
}) {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const mapRef = useRef(null);
  const sourceAddedRef = useRef(false);
  const flowLookupRef = useRef(new Map());

  useEffect(() => {
    flowLookupRef.current = new Map(flows.map((flow) => [flow.id, flow]));
  }, [flows]);

  const flowGeoJSON = useMemo(
    () => flowsToGeoJSON(flows, focusState, direction),
    [flows, focusState, direction]
  );

  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: baseStyle,
      center: [-98.5, 38.5],
      zoom: 3,
      minZoom: 2,
      dragRotate: false,
      pitchWithRotate: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("flow-states", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });
      map.addSource("flow-level-boundaries", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });
      map.addSource("flow-lines", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });

      map.addLayer({
        id: "flow-level-borders",
        type: "line",
        source: "flow-level-boundaries",
        paint: {
          "line-color": "#374151",
          "line-width": 0.3,
          "line-opacity": 0.35
        }
      });

      map.addLayer({
        id: "flow-state-borders",
        type: "line",
        source: "flow-states",
        paint: {
          "line-color": "#1f2937",
          "line-width": 0.5,
          "line-opacity": 0.5
        }
      });

      map.addLayer({
        id: "flow-lines-layer",
        type: "line",
        source: "flow-lines",
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["get", "width"],
          "line-opacity": 0.85,
          "line-blur": 0.5
        },
        layout: {
          "line-cap": "round",
          "line-join": "round"
        }
      });

      sourceAddedRef.current = true;
    });

    map.on("mousemove", "flow-lines-layer", (e) => {
      if (!sourceAddedRef.current) return;
      const feature = e.features && e.features[0];
      if (!feature) return;

      map.getCanvas().style.cursor = "pointer";
      const props = feature.properties || {};
      const tooltip = tooltipRef.current;
      if (tooltip) {
        const amount = Number(props.amount) || 0;
        const quintile = Number(props.quintile) || 0;
        const formattedAmount = formatAmount ? formatAmount(amount) : amount;
        tooltip.innerHTML = `
          <div class="map-tooltip-title">${props.origin} → ${props.dest}</div>
          <div class="map-tooltip-meta">${props.agency || "—"}</div>
          <em>${formattedAmount}</em>
          <div class="map-tooltip-meta">${quintile ? `Q${quintile}` : "No data"}</div>
        `;
        tooltip.style.display = "block";
        tooltip.style.left = `${e.point.x}px`;
        tooltip.style.top = `${e.point.y}px`;
      }
    });

    map.on("mouseleave", "flow-lines-layer", () => {
      map.getCanvas().style.cursor = "";
      if (tooltipRef.current) {
        tooltipRef.current.style.display = "none";
      }
    });

    map.on("click", (e) => {
      if (!sourceAddedRef.current) return;

      const features = map.queryRenderedFeatures(e.point, { layers: ["flow-lines-layer"] });
      if (features.length === 0) {
        onSelect(null);
        return;
      }

      const flowId = features[0].properties?.flow_id;
      if (flowId) {
        onSelect(flowLookupRef.current.get(flowId) || null);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      sourceAddedRef.current = false;
    };
  }, [baseStyle, onSelect, formatAmount]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateSource = () => {
      if (!sourceAddedRef.current) return;
      const source = map.getSource("flow-states");
      if (source && stateBoundaries) {
        source.setData(stateBoundaries);
      }
    };

    if (map.isStyleLoaded() && sourceAddedRef.current) {
      updateSource();
    } else {
      map.once("load", updateSource);
    }
  }, [stateBoundaries]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateSource = () => {
      if (!sourceAddedRef.current) return;
      const source = map.getSource("flow-level-boundaries");
      if (source) {
        if (levelBoundaries) {
          source.setData(levelBoundaries);
        } else {
          source.setData({ type: "FeatureCollection", features: [] });
        }
      }
    };

    if (map.isStyleLoaded() && sourceAddedRef.current) {
      updateSource();
    } else {
      map.once("load", updateSource);
    }
  }, [levelBoundaries]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateSource = () => {
      if (!sourceAddedRef.current) return;
      const source = map.getSource("flow-lines");
      if (source) {
        source.setData(flowGeoJSON);
      }
    };

    if (map.isStyleLoaded() && sourceAddedRef.current) {
      updateSource();
    } else {
      map.once("load", updateSource);
    }
  }, [flowGeoJSON]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !fitBounds) return;
    map.fitBounds(fitBounds, { padding: 40, duration: 800 });
  }, [fitBounds, level]);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.resize();
    }
  }, [resizeKey]);

  return (
    <div className="map-container" ref={containerRef}>
      {isLoading && (
        <div className="flow-loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}
      <div className="map-tooltip map-tooltip--internal" ref={tooltipRef} />
    </div>
  );
}
