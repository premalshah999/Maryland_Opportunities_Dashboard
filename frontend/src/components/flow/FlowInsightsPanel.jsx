import { formatCurrencyRounded, formatNumber } from "../../lib/formatters.js";

export function FlowInsightsPanel({ flowStats }) {
  return (
    <div className="panel">
      <div className="insight-card">
        <div className="insight-title">Total Amount</div>
        <div className="insight-value">
          {formatCurrencyRounded(flowStats?.totalAmount)}
        </div>
        <div className="insight-subtitle">Period: {flowStats?.period || "—"}</div>
      </div>

      <div className="insight-card">
        <div className="insight-title">Summary</div>
        <div className="stat-row">
          <span>Total Flows</span>
          <span>{formatNumber(flowStats?.totalFlows)}</span>
        </div>
        <div className="stat-row">
          <span>Displayed</span>
          <span>{formatNumber(flowStats?.displayedFlows)}</span>
        </div>
        <div className="stat-row">
          <span>Displayed Amount</span>
          <span>{formatCurrencyRounded(flowStats?.displayedAmount)}</span>
        </div>
        <div className="stat-row">
          <span>Average Flow</span>
          <span>{formatCurrencyRounded(flowStats?.averageFlow)}</span>
        </div>
        <div className="stat-row">
          <span>Locations Involved</span>
          <span>{formatNumber(flowStats?.locationsInvolved)}</span>
        </div>
      </div>

      {flowStats?.internalFlowAmount > 0 && (
        <div className="insight-card">
          <div className="insight-title">Internal Flows</div>
          <div
            className="insight-subtitle"
            style={{ fontSize: "11px", color: "#6b7280", marginBottom: "8px" }}
          >
            Same-location flows (not shown on map)
          </div>
          <div className="stat-row">
            <span>Internal Flow Count</span>
            <span>{formatNumber(flowStats?.internalFlowCount)}</span>
          </div>
          <div className="stat-row">
            <span>Internal Flow Amount</span>
            <span>{formatCurrencyRounded(flowStats?.internalFlowAmount)}</span>
          </div>
        </div>
      )}

      <div className="insight-card">
        <div className="insight-title">Quintile Thresholds (Amount)</div>
        <div className="stat-row">
          <span>Q1</span>
          <span>≤ $1M</span>
        </div>
        <div className="stat-row">
          <span>Q2</span>
          <span>$1M – $10M</span>
        </div>
        <div className="stat-row">
          <span>Q3</span>
          <span>$10M – $100M</span>
        </div>
        <div className="stat-row">
          <span>Q4</span>
          <span>$100M – $1B</span>
        </div>
        <div className="stat-row">
          <span>Q5</span>
          <span>&gt; $1B</span>
        </div>
      </div>

      <div className="insight-card">
        <div className="insight-title">Top Agencies</div>
        <div className="rank-list">
          {(flowStats?.topAgencies || []).map((item) => (
            <div className="rank-row" key={item.name}>
              <span>{item.name}</span>
              <span>{formatCurrencyRounded(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="insight-card">
        <div className="insight-title">Top Origins</div>
        <div className="rank-list">
          {(flowStats?.topOrigins || []).map((item) => (
            <div className="rank-row" key={item.name}>
              <span>{item.name}</span>
              <span>{formatCurrencyRounded(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="insight-card">
        <div className="insight-title">Top Destinations</div>
        <div className="rank-list">
          {(flowStats?.topDestinations || []).map((item) => (
            <div className="rank-row" key={item.name}>
              <span>{item.name}</span>
              <span>{formatCurrencyRounded(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="insight-card">
        <div className="insight-title">Largest Flow</div>
        {flowStats?.largestFlow ? (
          <>
            <div className="stat-row">
              <span>Origin</span>
              <span>{flowStats.largestFlow.origin}</span>
            </div>
            <div className="stat-row">
              <span>Destination</span>
              <span>{flowStats.largestFlow.dest}</span>
            </div>
            <div className="stat-row">
              <span>Agency</span>
              <span>{flowStats.largestFlow.agency}</span>
            </div>
            <div className="stat-row">
              <span>Amount</span>
              <span>{formatCurrencyRounded(flowStats.largestFlow.amount)}</span>
            </div>
          </>
        ) : (
          <div className="stat-row">
            <span>No flow selected</span>
            <span>—</span>
          </div>
        )}
      </div>
    </div>
  );
}
