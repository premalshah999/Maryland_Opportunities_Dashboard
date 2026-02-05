import React, { useState, useEffect, useRef, memo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

const statesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";
const countiesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json";

type AnimationPhase = "maryland" | "morphing" | "usa";

// Memoized Geography component for better performance
const MemoizedGeography = memo(Geography);

export const AnimatedHeroMap = memo(() => {
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("maryland");
  const [zoom, setZoom] = useState(14);
  const [center, setCenter] = useState<[number, number]>([-77.0, 39.0]);
  const animationRef = useRef<number | null>(null);

  const marylandCenter: [number, number] = [-77.0, 39.0];
  const usaCenter: [number, number] = [-96, 39]; // USA center

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationPhase("morphing");

      const startZoom = 14;
      const endZoom = 1;
      const duration = 3200;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth ease-in-out easing for zoom
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const currentZoom = startZoom + (endZoom - startZoom) * eased;

        // Delayed pan: start panning only after zoom has progressed past 40%
        // This keeps Maryland centered during the initial zoom-out, 
        // then gently pans to show the full USA
        let panProgress = 0;
        if (progress > 0.4) {
          // Normalize progress from 0.4-1.0 to 0-1
          const panPhase = (progress - 0.4) / 0.6;
          // Smooth easing for the pan
          panProgress = panPhase < 0.5
            ? 2 * panPhase * panPhase
            : 1 - Math.pow(-2 * panPhase + 2, 2) / 2;
        }

        const currentCenter: [number, number] = [
          marylandCenter[0] + (usaCenter[0] - marylandCenter[0]) * panProgress,
          marylandCenter[1] + (usaCenter[1] - marylandCenter[1]) * panProgress,
        ];

        setZoom(currentZoom);
        setCenter(currentCenter);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setAnimationPhase("usa");
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Visual transitions
  const countyOpacity = Math.max(0, Math.min(1, (zoom - 1.5) / 5));
  const otherStatesOpacity = Math.max(0, Math.min(1, (7 - zoom) / 4));
  const marylandStateBorderOpacity = Math.max(0.3, Math.min(1, (8 - zoom) / 4));

  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-full">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000,
          }}
          width={1000}
          height={600}
          style={{ width: "100%", height: "auto", pointerEvents: "none" }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            minZoom={1}
            maxZoom={20}
            onMoveEnd={() => { }}
          >
            {/* States Layer */}
            <Geographies geography={statesGeoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isMaryland = geo.properties.name === "Maryland";

                  const strokeOpacity = isMaryland
                    ? marylandStateBorderOpacity
                    : otherStatesOpacity * 0.5;

                  const strokeWidth = isMaryland
                    ? Math.max(0.06, 1.2 / zoom)
                    : 0.35 / zoom;

                  return (
                    <MemoizedGeography
                      key={geo.rsmKey}
                      geography={geo}
                      style={{
                        default: {
                          fill: "transparent",
                          stroke: "#E03A3E",
                          strokeWidth: strokeWidth,
                          strokeOpacity: strokeOpacity,
                          outline: "none",
                        },
                        hover: {
                          fill: "transparent",
                          stroke: "#E03A3E",
                          strokeWidth: strokeWidth,
                          strokeOpacity: strokeOpacity,
                          outline: "none",
                        },
                        pressed: {
                          fill: "transparent",
                          stroke: "#E03A3E",
                          strokeWidth: strokeWidth,
                          strokeOpacity: strokeOpacity,
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Maryland Counties */}
            <Geographies geography={countiesGeoUrl}>
              {({ geographies }) =>
                geographies
                  .filter((geo) => geo.id?.toString().startsWith("24"))
                  .map((geo) => {
                    const strokeWidth = Math.max(0.015, 0.15 / zoom);

                    return (
                      <MemoizedGeography
                        key={geo.rsmKey}
                        geography={geo}
                        style={{
                          default: {
                            fill: "transparent",
                            stroke: "#E03A3E",
                            strokeWidth: strokeWidth,
                            strokeOpacity: countyOpacity,
                            outline: "none",
                          },
                          hover: {
                            fill: "transparent",
                            stroke: "#E03A3E",
                            strokeWidth: strokeWidth,
                            strokeOpacity: countyOpacity,
                            outline: "none",
                          },
                          pressed: {
                            fill: "transparent",
                            stroke: "#E03A3E",
                            strokeWidth: strokeWidth,
                            strokeOpacity: countyOpacity,
                            outline: "none",
                          },
                        }}
                      />
                    );
                  })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
});
