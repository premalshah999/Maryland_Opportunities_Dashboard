import { LEVEL_LABELS } from "../../constants.js";
import { getVariableLabel } from "../../lib/formatters.js";

export function AtlasFiltersPanel({
  datasets,
  dataset,
  onDatasetChange,
  hideDatasetSelect = false,
  datasetLabel = "",
  level,
  onLevelChange,
  availableLevels = ["state", "county", "congress"],
  years,
  year,
  onYearChange,
  hideVariableSelect = false,
  showAgencyFilter = false,
  agencies = [],
  agency = "All",
  agencyLabel = "Agency",
  onAgencyChange,
  variables,
  variable,
  onVariableChange,
  onDownloadDataset,
  downloadDisabled,
  isLoading
}) {
  return (
    <div className={`panel ${isLoading ? "panel-loading" : ""}`}>
      <div className="section">
        <div className="section-title">Dataset</div>
        {hideDatasetSelect ? (
          <div className="control">
            <span>Domain</span>
            <div className="static-input" aria-label="Dataset">
              {datasetLabel || "—"}
            </div>
          </div>
        ) : (
          <label className="control">
            <span>Domain</span>
            <select className="select-input" value={dataset} onChange={onDatasetChange}>
              <option value="">Select dataset</option>
              {datasets.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="section">
        <div className="section-title">Geography</div>
        <label className="control">
          <span>Level</span>
          <select className="select-input" value={level} onChange={onLevelChange}>
            <option value="">Select level</option>
            {availableLevels.map((item) => (
              <option key={item} value={item}>
                {LEVEL_LABELS[item] || item}
              </option>
            ))}
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
            onChange={onYearChange}
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

      {!hideVariableSelect && (
        <div className="section">
          <div className="section-title">Variable</div>
          <label className="control">
            <span>Metric</span>
            <select
              className="select-input"
              value={variable}
              onChange={onVariableChange}
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
      )}

      {showAgencyFilter && (
        <div className="section">
          <div className="section-title">Top Agencies</div>
          <label className="control">
            <span>{agencyLabel}</span>
            <select
              className="select-input"
              value={agency}
              onChange={onAgencyChange}
              disabled={!agencies.length}
            >
              <option value="All">All Agencies</option>
              {agencies.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="section">
        <div className="section-title">Download</div>
        <button
          className="download-btn"
          type="button"
          onClick={onDownloadDataset}
          disabled={downloadDisabled}
        >
          Download Dataset
        </button>
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
  );
}
