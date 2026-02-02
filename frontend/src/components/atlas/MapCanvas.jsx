import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { BASE_STYLE, QUINTILE_COLORS, US_BOUNDS } from "../../constants.js";

export function MapCanvas({
  geojson,
  level,
  onSelect,
  selectedId,
  resizeKey,
  hoverMetaLabel,
  formatHoverValue,
  zoomToFeature,
  focusMode = false
}) {
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const mapRef = useRef(null);
  const eventsBound = useRef(false);
  const fittedLevels = useRef({});
  const hoveredId = useRef(null);

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
      if (tooltipRef.current) {
        tooltipRef.current.style.display = "none";
      }
      return;
    }

    const loadData = () => {
      if (map.getSource("choropleth")) {
        map.getSource("choropleth").setData(geojson);
      } else {
        map.addSource("choropleth", {
          type: "geojson",
          data: geojson,
          promoteId: "id"
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
            "line-width": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              2,
              0
            ],
            "line-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0
            ]
          }
        });
      }

      if (!eventsBound.current) {
        eventsBound.current = true;
        map.on("mousemove", "choropleth-fill", (event) => {
          const feature = event.features && event.features[0];
          if (!feature) return;
          const featureId = feature.properties.id || "";
          if (hoveredId.current !== featureId) {
            if (hoveredId.current) {
              map.setFeatureState(
                { source: "choropleth", id: hoveredId.current },
                { hover: false }
              );
            }
            hoveredId.current = featureId;
            if (featureId) {
              map.setFeatureState({ source: "choropleth", id: featureId }, { hover: true });
            }
          }
          map.getCanvas().style.cursor = "pointer";
          const tooltip = tooltipRef.current;
          if (tooltip) {
            const value =
              feature.properties.value === null || feature.properties.value === undefined
                ? null
                : Number(feature.properties.value);
            const quintile = Number(feature.properties.quintile) || 0;
            const label = feature.properties.label || feature.properties.name || "Unknown";
            const formattedValue = formatHoverValue ? formatHoverValue(value) : value;
            tooltip.innerHTML = `
              <div class="map-tooltip-title">${label}</div>
              ${hoverMetaLabel ? `<div class="map-tooltip-meta">${hoverMetaLabel}</div>` : ""}
              <em>${formattedValue ?? "—"}</em>
              <div class="map-tooltip-meta">${quintile ? `Q${quintile}` : "No data"}</div>
            `;
            tooltip.style.display = "block";
            tooltip.style.left = `${event.point.x}px`;
            tooltip.style.top = `${event.point.y}px`;
          }
        });

        map.on("mouseleave", "choropleth-fill", () => {
          map.getCanvas().style.cursor = "";
          if (hoveredId.current) {
            map.setFeatureState(
              { source: "choropleth", id: hoveredId.current },
              { hover: false }
            );
            hoveredId.current = null;
          }
          if (tooltipRef.current) {
            tooltipRef.current.style.display = "none";
          }
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
  }, [geojson, onSelect, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("choropleth-selected")) return;
    map.setFilter("choropleth-selected", ["==", ["get", "id"], selectedId || ""]);
  }, [selectedId]);

  // Dim/blur non-selected states in focus mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("choropleth-fill")) return;
    if (focusMode && selectedId) {
      map.setPaintProperty(
        "choropleth-fill",
        "fill-opacity",
        ["case", ["==", ["get", "id"], selectedId], 0.9, 0.12]
      );
      if (map.getLayer("choropleth-line")) {
        map.setPaintProperty("choropleth-line", "line-opacity", 0.25);
      }
    } else {
      map.setPaintProperty("choropleth-fill", "fill-opacity", 0.82);
      if (map.getLayer("choropleth-line")) {
        map.setPaintProperty("choropleth-line", "line-opacity", 0.75);
      }
    }
  }, [focusMode, selectedId]);

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

  // Zoom to selected feature
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geojson) return;

    if (!zoomToFeature) {
      // Reset to US bounds when no feature selected
      map.fitBounds(US_BOUNDS, { padding: 40, duration: 600 });
      return;
    }

    // Find the feature matching the selected ID
    const feature = geojson.features.find(
      (f) => String(f.properties?.id) === String(zoomToFeature)
    );
    if (!feature || !feature.geometry) return;

    // Calculate bounds from feature geometry
    const coords = [];
    const extractCoords = (geometry) => {
      if (geometry.type === "Polygon") {
        geometry.coordinates[0].forEach((coord) => coords.push(coord));
      } else if (geometry.type === "MultiPolygon") {
        geometry.coordinates.forEach((polygon) => {
          polygon[0].forEach((coord) => coords.push(coord));
        });
      }
    };
    extractCoords(feature.geometry);

    if (coords.length === 0) return;

    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const bounds = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    ];

    const padding = focusMode
      ? { top: 80, bottom: 80, left: 60, right: 60 }
      : { top: 60, bottom: 60, left: 60, right: 60 };
    const offset = focusMode ? [-320, 0] : [0, 0];

    map.fitBounds(bounds, { padding, offset, duration: 500, maxZoom: 5 });
  }, [zoomToFeature, geojson, focusMode]);

  return (
    <div className="map-container" ref={containerRef}>
      <div className="map-tooltip map-tooltip--internal" ref={tooltipRef} />
    </div>
  );
}
