import { MapCanvas } from "./MapCanvas.jsx";
import { LEVEL_LABELS } from "../../constants.js";
import { formatNumber, getVariableLabel } from "../../lib/formatters.js";

export function AtlasMapPanel({
  enrichedGeo,
  level,
  dataset,
  variable,
  year,
  datasetLabel,
  selectedFeature,
  onSelectedFeatureChange,
  selectedId,
  selectedRank,
  rankTotal,
  thresholdSummary,
  sidebarWidth,
  onDownloadView,
  downloadDisabled
}) {
  return (
    <>
      <MapCanvas
        geojson={enrichedGeo}
        level={level}
        onSelect={onSelectedFeatureChange}
        selectedId={selectedId}
        resizeKey={`atlas-${sidebarWidth}`}
        hoverMetaLabel={getVariableLabel(dataset, variable)}
        formatHoverValue={formatNumber}
      />
      {!enrichedGeo && (
        <div className="map-placeholder">
          <p>Select a dataset, level, and variable to begin.</p>
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
              onClick={() => onSelectedFeatureChange(null)}
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
              <span>{selectedRank ? `${selectedRank.rank} of ${rankTotal}` : "—"}</span>
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
        <div className="map-legend-header">
          <span>Quintile Scale</span>
          {onDownloadView && (
            <button
              className="map-legend-download"
              type="button"
              onClick={onDownloadView}
              disabled={downloadDisabled}
            >
              Download Displayed Data
            </button>
          )}
        </div>
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
  );
}
