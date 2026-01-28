import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";

// Flow map color scheme - subtle, elegant colors
const FLOW_COLORS = {
  inflow: "rgba(59, 130, 246, 0.5)",   // Soft blue
  outflow: "rgba(239, 68, 68, 0.5)",   // Soft red
  mixed: "rgba(139, 92, 246, 0.45)"    // Soft purple
};

// Quintile-based colors - subtle gradient from light to darker
const QUINTILE_FLOW_COLORS = [
  "rgba(148, 163, 184, 0.35)",  // Q1 - very subtle gray-blue
  "rgba(125, 145, 178, 0.4)",   // Q2
  "rgba(100, 130, 170, 0.45)",  // Q3
  "rgba(75, 115, 165, 0.5)",    // Q4
  "rgba(59, 100, 160, 0.55)"    // Q5 - deeper but still subtle
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

const flowsToGeoJSON = (flows, focusState, direction) => {
  const features = [];

  for (const flow of flows) {
    const amount = Number(flow.amount);
    if (!Number.isFinite(amount) || amount <= 0) continue;

    if (!Number.isFinite(flow.origin_lat) || !Number.isFinite(flow.origin_lon) ||
        !Number.isFinite(flow.dest_lat) || !Number.isFinite(flow.dest_lon)) continue;

    let color;
    if (focusState && focusState !== "All") {
      const isOutflow = flow.origin_state === focusState;
      const isInflow = flow.dest_state === focusState;
      if (isOutflow && !isInflow) {
        color = FLOW_COLORS.outflow;
      } else if (isInflow && !isOutflow) {
        color = FLOW_COLORS.inflow;
      } else {
        color = FLOW_COLORS.mixed;
      }
    } else if (direction === "Inflow") {
      color = FLOW_COLORS.inflow;
    } else if (direction === "Outflow") {
      color = FLOW_COLORS.outflow;
    } else {
      const quintile = flow.quintile || 3;
      color = QUINTILE_FLOW_COLORS[Math.min(4, Math.max(0, quintile - 1))];
    }

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
        color
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
  onHover,
  onSelect,
  resizeKey,
  isLoading,
  baseStyle,
  fitBounds
}) {
  const containerRef = useRef(null);
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
          "line-color": "rgba(15, 23, 42, 0.25)",
          "line-width": 0.3
        }
      });

      map.addLayer({
        id: "flow-state-borders",
        type: "line",
        source: "flow-states",
        paint: {
          "line-color": "rgba(15, 23, 42, 0.5)",
          "line-width": 0.6
        }
      });

      map.addLayer({
        id: "flow-lines-layer",
        type: "line",
        source: "flow-lines",
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["get", "width"],
          "line-opacity": 0.9,
          "line-blur": 0.3
        },
        layout: {
          "line-cap": "round",
          "line-join": "round"
        }
      });

      sourceAddedRef.current = true;
    });

    const queryFlowFeatures = (point, padding = 8) => {
      const bbox = [
        [point.x - padding, point.y - padding],
        [point.x + padding, point.y + padding]
      ];
      return map.queryRenderedFeatures(bbox, { layers: ["flow-lines-layer"] });
    };

    map.on("mousemove", (e) => {
      if (!sourceAddedRef.current) return;

      const features = queryFlowFeatures(e.point, 10);
      if (features.length === 0) {
        map.getCanvas().style.cursor = "";
        onHover(null);
        return;
      }

      map.getCanvas().style.cursor = "pointer";
      const props = features[0].properties || {};
      onHover({
        x: e.point.x,
        y: e.point.y,
        origin: props.origin,
        dest: props.dest,
        amount: Number(props.amount) || 0,
        agency: props.agency,
        quintile: props.quintile,
        flowId: props.flow_id
      });
    });

    map.on("click", (e) => {
      if (!sourceAddedRef.current) return;

      const features = queryFlowFeatures(e.point, 12);
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
  }, [baseStyle, onHover, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceAddedRef.current) return;

    const source = map.getSource("flow-states");
    if (source && stateBoundaries) {
      source.setData(stateBoundaries);
    }
  }, [stateBoundaries]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !sourceAddedRef.current) return;

    const source = map.getSource("flow-level-boundaries");
    if (source) {
      if (levelBoundaries) {
        source.setData(levelBoundaries);
      } else {
        source.setData({ type: "FeatureCollection", features: [] });
      }
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
    </div>
  );
}
