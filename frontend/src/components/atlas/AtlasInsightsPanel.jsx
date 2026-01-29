import { formatNumberRounded, getVariableLabel } from "../../lib/formatters.js";

export function AtlasInsightsPanel({ dataset, variable, valuesData, thresholds }) {
  return (
    <div className="panel">
      <div className="insight-card">
        <div className="insight-title">Current Variable</div>
        <div className="insight-value">
          {variable ? getVariableLabel(dataset, variable) : "—"}
        </div>
      </div>

      <div className="insight-card">
        <div className="insight-title">Summary Statistics</div>
        <div className="stat-row">
          <span>Records</span>
          <span>{valuesData?.stats?.count || "—"}</span>
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
      </div>

      <div className="insight-card">
        <div className="insight-title">Top 10 Locations</div>
        <div className="rank-list">
          {(valuesData?.top || []).map((item) => (
            <div className="rank-row" key={item.label}>
              <span>{item.label}</span>
              <span>{formatNumberRounded(item.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="insight-card">
        <div className="insight-title">Bottom 10 Locations</div>
        <div className="rank-list">
          {(valuesData?.bottom || []).map((item) => (
            <div className="rank-row" key={item.label}>
              <span>{item.label}</span>
              <span>{formatNumberRounded(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
