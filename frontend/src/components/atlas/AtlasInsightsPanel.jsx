import { formatNumberRounded, getVariableLabel } from "../../lib/formatters.js";

export function AtlasInsightsPanel({ dataset, variable, valuesData, thresholds }) {
  const recordCount = valuesData?.stats?.count ?? null;
  const hasData = typeof recordCount === "number" && recordCount > 0;
  const selectedYear = valuesData?.year ?? null;
  const variableLabel = variable ? getVariableLabel(dataset, variable) : "—";

  if (!dataset || !variable) {
    return (
      <div className="panel">
        <div className="insight-card">
          <div className="insight-title">Getting Started</div>
          <p className="help-text">Select a dataset, year, and metric to view insights.</p>
        </div>
      </div>
    );
  }

  if (!valuesData) {
    return (
      <div className="panel">
        <div className="insight-card">
          <div className="insight-title">Loading</div>
          <p className="help-text">Insights will appear once the map data finishes loading.</p>
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="panel">
        <div className="insight-card">
          <div className="insight-title">No Data For This Selection</div>
          <div className="insight-value">{variableLabel}</div>
          <div className="insight-subtitle">{selectedYear ? `Year: ${selectedYear}` : "—"}</div>
          <p className="help-text" style={{ marginTop: "10px" }}>
            This metric has no reported values for the selected year/level. Try a different year or
            metric.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="insight-card">
        <div className="insight-title">Current Variable</div>
        <div className="insight-value">{variableLabel}</div>
      </div>

      <div className="insight-card">
        <div className="insight-title">Summary Statistics</div>
        <div className="stat-row">
          <span>Records</span>
          <span>{recordCount ?? "—"}</span>
        </div>
        <div className="stat-row">
          <span>Min</span>
          <span>{formatNumberRounded(valuesData?.stats?.min)}</span>
        </div>
        <div className="stat-row">
          <span>Max</span>
          <span>{formatNumberRounded(valuesData?.stats?.max)}</span>
        </div>
        <div className="stat-row">
          <span>Mean</span>
          <span>{formatNumberRounded(valuesData?.stats?.mean)}</span>
        </div>
        <div className="stat-row">
          <span>Median</span>
          <span>{formatNumberRounded(valuesData?.stats?.median)}</span>
        </div>
      </div>

      <div className="insight-card">
        <div className="insight-title">Quintile Thresholds</div>
        {thresholds?.length >= 4 ? (
          <>
        <div className="stat-row">
          <span>Q1</span>
          <span>≤ {formatNumberRounded(thresholds[0])}</span>
        </div>
        <div className="stat-row">
          <span>Q2</span>
          <span>
            {formatNumberRounded(thresholds[0])} – {formatNumberRounded(thresholds[1])}
          </span>
        </div>
        <div className="stat-row">
          <span>Q3</span>
          <span>
            {formatNumberRounded(thresholds[1])} – {formatNumberRounded(thresholds[2])}
          </span>
        </div>
        <div className="stat-row">
          <span>Q4</span>
          <span>
            {formatNumberRounded(thresholds[2])} – {formatNumberRounded(thresholds[3])}
          </span>
        </div>
        <div className="stat-row">
          <span>Q5</span>
          <span>&gt; {formatNumberRounded(thresholds[3])}</span>
        </div>
          </>
        ) : (
          <p className="help-text">Thresholds are not available for this selection.</p>
        )}
      </div>

      <div className="insight-card">
        <div className="insight-title">Top 10 Locations</div>
        {(valuesData?.top || []).length ? (
          <div className="rank-list">
            {valuesData.top.map((item) => (
              <div className="rank-row" key={item.label}>
                <span>{item.label}</span>
                <span>{formatNumberRounded(item.value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="help-text">No ranked values available.</p>
        )}
      </div>

      <div className="insight-card">
        <div className="insight-title">Bottom 10 Locations</div>
        {(valuesData?.bottom || []).length ? (
          <div className="rank-list">
            {valuesData.bottom.map((item) => (
              <div className="rank-row" key={item.label}>
                <span>{item.label}</span>
                <span>{formatNumberRounded(item.value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="help-text">No ranked values available.</p>
        )}
      </div>
    </div>
  );
}
