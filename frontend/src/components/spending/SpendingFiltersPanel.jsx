import { toTitleCase } from "../../lib/formatters.js";

export function SpendingFiltersPanel({
  years,
  metrics,
  perCapitaMetrics,
  states,
  year,
  metric,
  state,
  viewType,
  onYearChange,
  onMetricChange,
  onStateChange,
  onViewTypeChange,
  isLoading
}) {
  return (
    <div className={`panel ${isLoading ? "panel-loading" : ""}`}>
      <div className="section">
        <div className="section-title">Scope</div>
        <label className="control">
          <span>Year</span>
          <select
            className="select-input"
            value={year}
            onChange={(event) => onYearChange(event.target.value)}
            disabled={!years.length}
          >
            {!years.length ? (
              <option value="">Loading...</option>
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

      <div className="section">
        <div className="section-title">Location</div>
        <label className="control">
          <span>State</span>
          <select
            className="select-input"
            value={state}
            onChange={(event) => onStateChange(event.target.value)}
          >
            <option value="ALL">All States</option>
            {states.map((item) => (
              <option key={item} value={item}>
                {toTitleCase(item)}
              </option>
            ))}
          </select>
        </label>
        <button className="ghost" type="button" onClick={() => onStateChange("ALL")}>
          Reset selection
        </button>
      </div>

      <div className="section">
        <div className="section-title">Metric</div>
        <label className="control">
          <span>Measure</span>
          <select
            className="select-input"
            value={metric}
            onChange={(event) => onMetricChange(event.target.value)}
            disabled={!metrics.length && !perCapitaMetrics.length}
          >
            {!metrics.length && !perCapitaMetrics.length && (
              <option value="">Loading...</option>
            )}
            {metrics.length > 0 && (
              <optgroup label="Totals">
                {metrics.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </optgroup>
            )}
            {perCapitaMetrics.length > 0 && (
              <optgroup label="Per 1,000">
                {perCapitaMetrics.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
      </div>

      <div className="section">
        <div className="section-title">View Type</div>
        <label className="control">
          <span>Display</span>
          <select
            className="select-input"
            value={viewType}
            onChange={(event) => onViewTypeChange(event.target.value)}
          >
            <option value="amount">View by amount</option>
            <option value="percentage">View by percentage</option>
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
  );
}
