import { formatCurrency, formatNumber, toTitleCase } from "../../lib/formatters.js";

export function SpendingInsightsPanel({
  selectedState,
  year,
  metric,
  detailRecords,
  selectedAgency,
  onAgencyChange
}) {
  const filtered =
    selectedAgency && selectedAgency !== "ALL"
      ? detailRecords.filter((row) => row.agency === selectedAgency)
      : detailRecords;

  const isCurrencyMetric = Boolean(
    (metric || "").toLowerCase().match(/wage|contracts|grants|payments/)
  );
  const formatValue = (value) => (isCurrencyMetric ? formatCurrency(value) : formatNumber(value));

  if (!metric) {
    return (
      <div className="panel">
        <div className="insight-card">
          <div className="insight-title">Getting Started</div>
          <p className="spending-help-text">Select a metric from the filters above to view spending insights and statistics.</p>
        </div>
      </div>
    );
  }

  const values = filtered.map((row) => Number(row[metric]) || 0);
  const sum = values.reduce((total, value) => total + value, 0);
  const avg = values.length ? sum / values.length : 0;
  const max = values.length ? Math.max(...values) : 0;

  // Get top 5 agencies by the selected metric
  const topAgencies = [...filtered]
    .sort((a, b) => (Number(b[metric]) || 0) - (Number(a[metric]) || 0))
    .slice(0, 5);

  return (
    <div className="panel">
      <div className="insight-card">
        <div className="insight-title">Current Selection</div>
        <div className="insight-value">
          {selectedState && selectedState !== "ALL"
            ? toTitleCase(selectedState)
            : "All States"}
        </div>
        <div className="insight-subtitle">{year || "Select a year"} · {metric}</div>
      </div>

      <div className="insight-card">
        <div className="insight-title">Summary Statistics</div>
        {!filtered.length ? (
          <p className="spending-help-text">Select a state to view statistics.</p>
        ) : (
          <>
            <div className="stat-row">
              <span>Total Agencies</span>
              <span>{filtered.length}</span>
            </div>
            <div className="stat-row">
              <span>Total {metric}</span>
              <span>{formatValue(sum)}</span>
            </div>
            <div className="stat-row">
              <span>Average</span>
              <span>{formatValue(avg)}</span>
            </div>
            <div className="stat-row">
              <span>Maximum</span>
              <span>{formatValue(max)}</span>
            </div>
          </>
        )}
      </div>

      {filtered.length > 0 && topAgencies.length > 0 && (
        <div className="insight-card">
          <div className="insight-title">Top 5 Agencies</div>
          <div className="rank-list">
            {topAgencies.map((row, idx) => (
              <div className="rank-row" key={row.agency}>
                <span>{idx + 1}. {row.agency?.length > 24 ? `${row.agency.slice(0, 24)}...` : row.agency}</span>
                <span>{formatValue(Number(row[metric]) || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAgency && selectedAgency !== "ALL" && (
        <button
          className="spending-clear-btn"
          type="button"
          onClick={() => onAgencyChange("ALL")}
        >
          Clear agency filter
        </button>
      )}
    </div>
  );
}
