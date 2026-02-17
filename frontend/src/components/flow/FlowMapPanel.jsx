import { FlowMapCanvas } from "./FlowMapCanvas.jsx";
import { BASE_STYLE, FLOW_LEVEL_LABELS, US_BOUNDS } from "../../constants.js";
import { formatCurrency, formatNumber } from "../../lib/formatters.js";

export function FlowMapPanel({
  flows,
  flowLevel,
  geoCache,
  flowGeoKey,
  flowFilters,
  flowStatus,
  flowSelected,
  onFlowSelected,
  sidebarWidth,
  formatAmount,
  flowBucket,
  onDownloadView,
  downloadDisabled
}) {
  return (
    <>
      <FlowMapCanvas
        flows={flows}
        level={flowLevel}
        stateBoundaries={geoCache.state}
        levelBoundaries={flowLevel !== "state" ? geoCache[flowGeoKey] : null}
        focusState={flowFilters.state}
        direction={flowFilters.direction}
        onSelect={onFlowSelected}
        resizeKey={`flow-${sidebarWidth}`}
        isLoading={flowStatus.state === "loading"}
        baseStyle={BASE_STYLE}
        fitBounds={US_BOUNDS}
        formatAmount={formatAmount}
        flowBucket={flowBucket}
      />
      {!flows?.length && flowStatus.state !== "loading" && (
        <div className="map-placeholder">
          <p>Select flow parameters to load data.</p>
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
              onClick={() => onFlowSelected(null)}
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
        <div className="map-legend-header">
          <span>Flow Index</span>
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
        <div className="flow-map-legend-content">
          <div className="flow-thickness-mini">
            <span className="flow-legend-type-label">In</span>
            <div className="flow-mini-scale">
              <div className="flow-scale-line inflow q1" />
              <div className="flow-scale-line inflow q3" />
              <div className="flow-scale-line inflow q5" />
            </div>
          </div>
          <div className="flow-thickness-mini">
            <span className="flow-legend-type-label">Out</span>
            <div className="flow-mini-scale">
              <div className="flow-scale-line outflow q1" />
              <div className="flow-scale-line outflow q3" />
              <div className="flow-scale-line outflow q5" />
            </div>
          </div>
          <div className="flow-scale-labels-mini">
            <span>Q1</span>
            <span>Q5</span>
          </div>
        </div>
      </div>
    </>
  );
}
