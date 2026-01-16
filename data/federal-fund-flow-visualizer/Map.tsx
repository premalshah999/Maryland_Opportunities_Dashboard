import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Map, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { VisualFlow, ViewLevel } from './types';
import { getFlowColor, POLITICAL_LEAN, formatCurrency } from './utils';

interface MapProps {
  data: VisualFlow[];
  isLoading: boolean;
  viewTitle: string;
}

// US bounds that include Alaska, Hawaii, and Puerto Rico
const US_BOUNDS: [[number, number], [number, number]] = [
  [-180, 17],  // Southwest: includes Hawaii and Puerto Rico
  [-65, 72]    // Northeast: includes Alaska
];

// Initial view centered on continental US
const INITIAL_VIEW_STATE = {
  longitude: -98.5795,
  latitude: 39.8283,
  zoom: 3.5,
  minZoom: 2,
  maxZoom: 12,
};

// GeoJSON sources for boundaries - using local files for better control
const STATE_BOUNDARIES_URL = '/data/states.geojson';  // Local file (was external GitHub)
const CONGRESS_DISTRICTS_URL = '/data/congress_districts.geojson';  // Local file
const COUNTY_BOUNDARIES_URL = '/data/counties.geojson';  // Local file
const DISTRICT_PARTY_MAP_URL = '/data/district_party_map.json';  // Local file

// Party color mapping
const PARTY_COLORS: Record<string, string> = {
  'Republic': 'rgba(239, 68, 68, 0.35)',      // Red for Republican
  'Democracy': 'rgba(59, 130, 246, 0.35)',    // Blue for Democratic 
  'Unknown': 'rgba(168, 85, 247, 0.2)'        // Purple for unknown/independent
};

// Generate bezier curve points for arc
function generateArcPath(
  startLon: number, startLat: number,
  endLon: number, endLat: number
): string {
  const midLon = (startLon + endLon) / 2;
  const midLat = (startLat + endLat) / 2;

  // Calculate distance for curve height
  const dx = endLon - startLon;
  const dy = endLat - startLat;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Control point offset perpendicular to the line
  const curveHeight = Math.min(distance * 0.3, 15);
  const angle = Math.atan2(dy, dx);
  const perpAngle = angle + Math.PI / 2;

  const controlLon = midLon + Math.cos(perpAngle) * curveHeight;
  const controlLat = midLat + Math.sin(perpAngle) * curveHeight;

  return `M ${startLon} ${startLat} Q ${controlLon} ${controlLat} ${endLon} ${endLat}`;
}

// Generate smooth bezier curve points
function generateBezierCurve(
  startLon: number, startLat: number,
  endLon: number, endLat: number,
  numPoints: number = 30
): [number, number][] {
  const points: [number, number][] = [];

  // Calculate control point (perpendicular to line, offset upward)
  const midLon = (startLon + endLon) / 2;
  const midLat = (startLat + endLat) / 2;
  const dx = endLon - startLon;
  const dy = endLat - startLat;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Curve height proportional to distance, but capped
  const curveHeight = Math.min(distance * 0.25, 10);

  // Perpendicular direction (rotated 90 degrees)
  const perpX = -dy / distance;
  const perpY = dx / distance;

  // Control point
  const ctrlLon = midLon + perpX * curveHeight;
  const ctrlLat = midLat + perpY * curveHeight;

  // Generate quadratic bezier curve points
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const oneMinusT = 1 - t;

    // Quadratic bezier formula: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
    const lon = oneMinusT * oneMinusT * startLon +
      2 * oneMinusT * t * ctrlLon +
      t * t * endLon;
    const lat = oneMinusT * oneMinusT * startLat +
      2 * oneMinusT * t * ctrlLat +
      t * t * endLat;

    points.push([lon, lat]);
  }

  return points;
}

// Convert flows to GeoJSON with gradient segments for rendering
function flowsToGeoJSON(flows: VisualFlow[], minAmt: number, maxAmt: number) {
  const features: any[] = [];

  // Gradient colors: soft coral to deeper rose (Maryland-inspired, more visible)
  const startColor = { r: 248, g: 180, b: 168 };  // Soft peach/coral
  const endColor = { r: 180, g: 83, b: 83 };      // Deep rose/burgundy

  flows.forEach((flow, idx) => {
    const normAmount = maxAmt > minAmt ? (flow.amount - minAmt) / (maxAmt - minAmt) : 0.5;

    // Generate smooth curved arc
    const curvePoints = generateBezierCurve(
      flow.origin_lon, flow.origin_lat,
      flow.dest_lon, flow.dest_lat,
      20 // Points for smooth curve
    );

    // Base width: visible but not heavy (0.8 to 2.5 based on amount)
    const baseWidth = 0.8 + normAmount * 1.7;

    // Create gradient segments
    const numSegments = curvePoints.length - 1;
    for (let i = 0; i < numSegments; i++) {
      const t = i / numSegments;

      // Interpolate color along the path
      const r = Math.round(startColor.r + (endColor.r - startColor.r) * t);
      const g = Math.round(startColor.g + (endColor.g - startColor.g) * t);
      const b = Math.round(startColor.b + (endColor.b - startColor.b) * t);

      // Opacity: more visible in the middle (0.5 to 0.85)
      const opacity = 0.5 + Math.sin(t * Math.PI) * 0.35;

      features.push({
        type: 'Feature' as const,
        properties: {
          id: `${flow.id}-${i}`,
          origin: flow.origin_name,
          dest: flow.dest_name,
          amount: flow.amount,
          agency: flow.agency,
          color: `rgba(${r},${g},${b},${opacity})`,
          width: baseWidth,
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: [curvePoints[i], curvePoints[i + 1]],
        },
      });
    }
  });

  return {
    type: 'FeatureCollection' as const,
    features,
  };
}


// GeoJSON for flow endpoints
function endpointsToGeoJSON(flows: VisualFlow[]) {
  const points: any[] = [];

  flows.forEach(flow => {
    points.push({
      type: 'Feature',
      properties: { type: 'origin', name: flow.origin_name },
      geometry: { type: 'Point', coordinates: [flow.origin_lon, flow.origin_lat] },
    });
    points.push({
      type: 'Feature',
      properties: { type: 'dest', name: flow.dest_name },
      geometry: { type: 'Point', coordinates: [flow.dest_lon, flow.dest_lat] },
    });
  });

  return { type: 'FeatureCollection' as const, features: points };
}

const MapVisualization: React.FC<MapProps> = ({ data, isLoading, viewTitle }) => {
  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [selectedFlow, setSelectedFlow] = useState<any>(null);
  const [cursor, setCursor] = useState<string>('grab');
  const [districtPartyMap, setDistrictPartyMap] = useState<Record<string, string>>({});
  const [congressGeoJSON, setCongressGeoJSON] = useState<any>(null);
  const [countyGeoJSON, setCountyGeoJSON] = useState<any>(null);

  // Load district party map on mount
  useEffect(() => {
    fetch(DISTRICT_PARTY_MAP_URL)
      .then(res => res.json())
      .then(data => setDistrictPartyMap(data))
      .catch(err => console.error('Failed to load district party map:', err));
  }, []);

  // Load congress districts GeoJSON when needed
  useEffect(() => {
    if (viewTitle === ViewLevel.Congress && !congressGeoJSON) {
      fetch(CONGRESS_DISTRICTS_URL)
        .then(res => res.json())
        .then(data => setCongressGeoJSON(data))
        .catch(err => console.error('Failed to load congress districts:', err));
    }
  }, [viewTitle, congressGeoJSON]);

  // Load county GeoJSON when needed
  useEffect(() => {
    if (viewTitle === ViewLevel.County && !countyGeoJSON) {
      fetch(COUNTY_BOUNDARIES_URL)
        .then(res => res.json())
        .then(data => setCountyGeoJSON(data))
        .catch(err => console.error('Failed to load counties:', err));
    }
  }, [viewTitle, countyGeoJSON]);

  // Add party colors to congress GeoJSON features
  const congressGeoJSONWithColors = useMemo(() => {
    if (!congressGeoJSON || Object.keys(districtPartyMap).length === 0) return null;

    return {
      ...congressGeoJSON,
      features: congressGeoJSON.features.map((feature: any) => {
        const geoid = feature.properties?.GEOID;
        const party = geoid ? districtPartyMap[geoid] : 'Unknown';
        return {
          ...feature,
          properties: {
            ...feature.properties,
            party: party || 'Unknown',
            fillColor: PARTY_COLORS[party] || PARTY_COLORS['Unknown']
          }
        };
      })
    };
  }, [congressGeoJSON, districtPartyMap]);

  // Calculate min/max amounts for normalization
  const { minAmt, maxAmt } = useMemo(() => {
    if (data.length === 0) return { minAmt: 0, maxAmt: 1 };
    let min = Infinity, max = -Infinity;
    data.forEach(d => {
      if (d.amount < min) min = d.amount;
      if (d.amount > max) max = d.amount;
    });
    return { minAmt: min, maxAmt: max };
  }, [data]);

  // Generate GeoJSON data
  const flowsGeoJSON = useMemo(() => flowsToGeoJSON(data, minAmt, maxAmt), [data, minAmt, maxAmt]);
  const endpointsGeoJSON = useMemo(() => endpointsToGeoJSON(data), [data]);

  const onMouseEnter = useCallback(() => setCursor('pointer'), []);
  const onMouseLeave = useCallback(() => {
    setCursor('grab');
    setHoverInfo(null);
  }, []);

  const onHover = useCallback((event: any) => {
    const { features, lngLat } = event;
    const hoveredFeature = features && features[0];

    if (hoveredFeature) {
      setHoverInfo({
        longitude: lngLat.lng,
        latitude: lngLat.lat,
        properties: hoveredFeature.properties,
      });
    } else {
      setHoverInfo(null);
    }
  }, []);

  const onClick = useCallback((event: any) => {
    const { features } = event;
    const clickedFeature = features && features[0];

    if (clickedFeature) {
      // Find the full flow data
      const flowId = clickedFeature.properties.id.split('-')[0]; // Remove segment suffix
      const fullFlow = data.find(f => f.id === flowId);
      if (fullFlow) {
        setSelectedFlow(fullFlow);
      }
    }
  }, [data]);

  const closeCard = useCallback(() => setSelectedFlow(null), []);

  return (
    <div className="w-full h-full relative">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-800 border-t-transparent"></div>
            <p className="text-xs font-mono font-medium text-slate-800 uppercase tracking-widest">Processing Data</p>
          </div>
        </div>
      )}

      <Map
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        cursor={cursor}
        interactiveLayerIds={['flows-line']}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onHover}
        onClick={onClick}
      >
        <NavigationControl position="bottom-right" />

        {/* State boundaries - always show */}
        <Source id="state-boundaries" type="geojson" data={STATE_BOUNDARIES_URL}>
          <Layer
            id="state-borders"
            type="line"
            paint={{
              'line-color': '#94a3b8',  // Lighter slate gray, subtle
              'line-width': viewTitle === ViewLevel.State ? 1.2 : 0.8,
              'line-opacity': 0.7,
            }}
          />
        </Source>

        {/* County boundaries with fill - only show for County view */}
        {viewTitle === ViewLevel.County && countyGeoJSON && (
          <Source id="county-boundaries" type="geojson" data={countyGeoJSON}>
            <Layer
              id="county-fill"
              type="fill"
              beforeId="state-borders"
              paint={{
                'fill-color': 'rgba(241, 245, 249, 0.5)',  // Very light gray fill
                'fill-opacity': 0.6,
              }}
            />
            <Layer
              id="county-borders"
              type="line"
              paint={{
                'line-color': '#94a3b8',  // Slate gray
                'line-width': 0.3,
                'line-opacity': 0.6,
              }}
            />
          </Source>
        )}

        {/* Political choropleth for Congressional view - now using district-level data */}
        {viewTitle === ViewLevel.Congress && congressGeoJSONWithColors && (
          <Source id="congress-districts" type="geojson" data={congressGeoJSONWithColors}>
            <Layer
              id="congress-fill"
              type="fill"
              beforeId="state-borders"
              paint={{
                'fill-color': [
                  'match',
                  ['get', 'party'],
                  'Republic', 'rgba(239, 68, 68, 0.35)',
                  'Democracy', 'rgba(59, 130, 246, 0.35)',
                  'Unknown', 'rgba(168, 85, 247, 0.2)',
                  'rgba(241, 245, 249, 0.3)'  // Default
                ],
                'fill-opacity': 0.8,
              }}
            />
            <Layer
              id="congress-borders"
              type="line"
              paint={{
                'line-color': '#64748b',  // Slate-500
                'line-width': 0.5,
                'line-opacity': 0.5,
              }}
            />
          </Source>
        )}

        {/* Flow lines */}
        <Source id="flows" type="geojson" data={flowsGeoJSON}>
          <Layer
            id="flows-line"
            type="line"
            paint={{
              'line-color': ['get', 'color'],
              'line-width': ['get', 'width'],
              'line-opacity': 1,  // Opacity already in the rgba color
            }}
            layout={{
              'line-cap': 'round',
              'line-join': 'round',
            }}
          />
        </Source>

        {/* Minimal endpoint markers */}
        <Source id="endpoints" type="geojson" data={endpointsGeoJSON}>
          <Layer
            id="endpoints-circle"
            type="circle"
            paint={{
              'circle-radius': 1.5,
              'circle-color': '#94a3b8',  // Slate-400, matching gradient
              'circle-stroke-width': 0,
              'circle-opacity': 0.5,
            }}
          />
        </Source>

        {/* Hover popup */}
        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={10}
          >
            <div className="text-xs">
              <p className="font-semibold text-slate-900">
                {hoverInfo.properties.origin} → {hoverInfo.properties.dest}
              </p>
              <p className="text-slate-600">{hoverInfo.properties.agency}</p>
              <p className="font-mono font-medium text-slate-900">
                ${Number(hoverInfo.properties.amount).toLocaleString()}
              </p>
            </div>
          </Popup>
        )}
      </Map>


      {/* Click-activated Flow Data Card */}
      {selectedFlow && (
        <div className="absolute bottom-6 right-6 w-80 bg-white border border-slate-200 shadow-lg rounded-sm overflow-hidden z-50">
          {/* Card Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-start">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em]">Flow Transaction</p>
              <p className="font-serif text-lg font-medium mt-1">{formatCurrency(selectedFlow.amount)}</p>
            </div>
            <button
              onClick={closeCard}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-4">
            {/* Origin & Destination */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Origin</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{selectedFlow.origin_name}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Destination</p>
                <p className="text-sm font-medium text-slate-900 mt-0.5">{selectedFlow.dest_name}</p>
              </div>
            </div>

            {/* Flow direction indicator */}
            <div className="flex items-center gap-2 py-2 border-t border-b border-slate-100">
              <div className="flex-1 h-0.5 bg-gradient-to-r from-slate-200 to-slate-400 rounded"></div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>

            {/* Agency */}
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Agency / Department</p>
              <p className="text-sm text-slate-700 mt-0.5 leading-relaxed">{selectedFlow.agency}</p>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-4 text-[11px] bg-slate-50 p-2 rounded">
              <div>
                <span className="text-slate-400">From: </span>
                <span className="font-mono text-slate-600">
                  {selectedFlow.origin_lat.toFixed(2)}, {selectedFlow.origin_lon.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">To: </span>
                <span className="font-mono text-slate-600">
                  {selectedFlow.dest_lat.toFixed(2)}, {selectedFlow.dest_lon.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapVisualization;