import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { MapCanvas } from "../atlas/MapCanvas.jsx";
import { formatCurrency, formatNumber, toTitleCase } from "../../lib/formatters.js";

const SPENDING_KEYS = ["Contracts", "Grants", "Resident Wage"];
const STACK_COLORS = {
  Contracts: "#1e293b",
  Grants: "#64748b",
  "Resident Wage": "#dc2626"
};

const formatAgencyLabel = (value) => {
  if (!value) return "";
  const max = 28;
  return value.length > max ? `${value.slice(0, max - 2)}..` : value;
};

const isCurrencyMetric = (metric) => Boolean((metric || "").toLowerCase().match(/wage|contracts|grants|payments/));

const formatMetricValue = (value, metric) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return isCurrencyMetric(metric) ? formatCurrency(value) : formatNumber(value);
};

const formatSegmentLabel = (value, viewType) => {
  if (value === null || value === undefined) return "";
  if (viewType !== "percentage") return "";
  return value >= 12 ? `${Math.round(value)}%` : "";
};

export function SpendingMapPanel({
  enrichedGeo,
  metric,
  year,
  selectedFeature,
  onSelectedFeatureChange,
  selectedId,
  selectedRank,
  rankTotal,
  sidebarWidth,
  detailRecords,
  detailLoading,
  viewType = "amount",
  focusMode = false
}) {
  const spendingData = (detailRecords || [])
    .map((row) => {
      const contracts = Number(row["Contracts"]) || 0;
      const grants = Number(row["Grants"]) || 0;
      const wages = Number(row["Resident Wage"]) || 0;
      const total = contracts + grants + wages;
      const pct = total > 0 ? 100 / total : 0;
      return {
        agency: row.agency,
        total,
        Contracts: viewType === "percentage" ? contracts * pct : contracts,
        Grants: viewType === "percentage" ? grants * pct : grants,
        "Resident Wage": viewType === "percentage" ? wages * pct : wages
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const jobsData = (detailRecords || [])
    .map((row) => ({
      agency: row.agency,
      Employees: Number(row["Employees"]) || 0
    }))
    .sort((a, b) => b.Employees - a.Employees)
    .slice(0, 8);

  return (
    <>
      <MapCanvas
        geojson={enrichedGeo}
        level="state"
        onSelect={onSelectedFeatureChange}
        selectedId={selectedId}
        resizeKey={`spending-${sidebarWidth}-${focusMode ? "focus" : "all"}`}
        hoverMetaLabel={metric || "Spending"}
        formatHoverValue={(value) => formatMetricValue(value, metric)}
        zoomToFeature={selectedId}
        focusMode={focusMode}
      />
      {!enrichedGeo && (
        <div className="map-placeholder">
          <p>Loading spending data...</p>
        </div>
      )}

      {selectedFeature && (
        <div className="spending-overlay-cards">
          <div className="spending-overlay-header">
            <div className="spending-overlay-title-row">
              <div>
                <span className="spending-overlay-state">
                  {toTitleCase(selectedFeature.label)}
                </span>
                <span className="spending-overlay-meta">
                  {metric || "Metric"}
                  {year ? ` · ${year}` : ""}
                </span>
              </div>
              <button
                className="spending-overlay-close"
                type="button"
                onClick={() => onSelectedFeatureChange(null)}
              >
                ×
              </button>
            </div>
            <div className="spending-overlay-value">
              {formatMetricValue(selectedFeature.value, metric)}
              {selectedRank && (
                <span className="spending-overlay-rank">
                  Rank #{selectedRank.rank} of {rankTotal}
                </span>
              )}
            </div>
          </div>

          {detailLoading && (
            <div className="spending-overlay-loading">
              <span>Loading agency data...</span>
            </div>
          )}

          {!detailLoading && detailRecords && detailRecords.length > 0 && (
            <>
              <div className="spending-overlay-chart">
                <div className="spending-overlay-chart-header">
                  <span className="spending-overlay-chart-title">Top agencies by funding</span>
                  <div className="spending-overlay-legend">
                    {SPENDING_KEYS.map((key) => (
                      <span key={key} className="spending-overlay-legend-item">
                        <span
                          className="spending-overlay-legend-dot"
                          style={{ background: STACK_COLORS[key] }}
                        />
                        {key}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="spending-overlay-chart-body">
                  <ResponsiveContainer width="100%" height={420}>
                    <BarChart
                      data={spendingData}
                      layout="vertical"
                      margin={{ top: 8, right: 72, left: 8, bottom: 8 }}
                      barCategoryGap={16}
                      barSize={34}
                    >
                      <CartesianGrid strokeDasharray="4 6" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                      <XAxis
                        type="number"
                        tickFormatter={
                          viewType === "percentage"
                            ? (value) => `${Math.round(value)}%`
                            : formatCurrency
                        }
                        domain={viewType === "percentage" ? [0, 100] : ["auto", "auto"]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                      />
                      <YAxis
                        dataKey="agency"
                        type="category"
                        width={190}
                        tick={{ fontSize: 11, fill: "#475569" }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tickMargin={12}
                        tickFormatter={formatAgencyLabel}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          viewType === "percentage"
                            ? `${Number(value).toFixed(1)}%`
                            : formatCurrency(value),
                          name
                        ]}
                        cursor={{ fill: "rgba(15, 23, 42, 0.03)" }}
                        contentStyle={{
                          background: "rgba(255,255,255,0.98)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                          fontSize: "12px"
                        }}
                      />
                      {SPENDING_KEYS.map((key, idx) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          stackId="a"
                          fill={STACK_COLORS[key]}
                          radius={idx === 0 ? [4, 0, 0, 4] : idx === SPENDING_KEYS.length - 1 ? [0, 4, 4, 0] : 0}
                          isAnimationActive={false}
                        >
                          {viewType === "percentage" && (
                            <LabelList
                              dataKey={key}
                              position="center"
                              formatter={(value) => formatSegmentLabel(value, viewType)}
                              fill="#ffffff"
                              fontSize={11}
                              fontWeight={600}
                            />
                          )}
                          {viewType !== "percentage" && idx === SPENDING_KEYS.length - 1 && (
                            <LabelList
                              dataKey="total"
                              position="right"
                              formatter={(value) => formatCurrency(value)}
                              fill="#0f172a"
                              fontSize={11}
                              fontWeight={600}
                            />
                          )}
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="spending-overlay-chart">
                <div className="spending-overlay-chart-header">
                  <span className="spending-overlay-chart-title">Top agencies by employees</span>
                </div>
                <div className="spending-overlay-chart-body">
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart
                      data={jobsData}
                      layout="vertical"
                      margin={{ top: 8, right: 72, left: 8, bottom: 8 }}
                      barCategoryGap={16}
                      barSize={32}
                    >
                      <CartesianGrid strokeDasharray="4 6" stroke="rgba(148, 163, 184, 0.2)" vertical={false} />
                      <XAxis
                        type="number"
                        tickFormatter={formatNumber}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                      />
                      <YAxis
                        dataKey="agency"
                        type="category"
                        width={190}
                        tick={{ fontSize: 11, fill: "#475569" }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tickMargin={12}
                        tickFormatter={formatAgencyLabel}
                      />
                      <Tooltip
                        formatter={(value) => [formatNumber(value), "Employees"]}
                        cursor={{ fill: "rgba(15, 23, 42, 0.03)" }}
                        contentStyle={{
                          background: "rgba(255,255,255,0.98)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                          fontSize: "12px"
                        }}
                      />
                      <Bar dataKey="Employees" radius={[0, 5, 5, 0]} isAnimationActive={false}>
                        {jobsData.map((entry, index) => (
                          <Cell
                            key={entry.agency}
                            fill={index === 0 ? "#0f172a" : index === 1 ? "#334155" : index === 2 ? "#475569" : "#64748b"}
                          />
                        ))}
                        <LabelList
                          dataKey="Employees"
                          position="right"
                          formatter={(value) => formatNumber(value)}
                          fill="#0f172a"
                          fontSize={11}
                          fontWeight={600}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {!selectedFeature && (
        <div className="map-legend">
          <span>Quintile Scale</span>
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
      )}
    </>
  );
}
