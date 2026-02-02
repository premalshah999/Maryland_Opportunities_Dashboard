import {
  Bar,
  BarChart,
  CartesianGrid,
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
  Contracts: "#1f2a44",
  Grants: "#0b6aa8",
  "Resident Wage": "#b45309"
};

const formatAgencyLabel = (value) => {
  if (!value) return "";
  const max = 44;
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
};

const isCurrencyMetric = (metric) => Boolean((metric || "").toLowerCase().match(/wage|contracts|grants|payments/));

const formatMetricValue = (value, metric) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return isCurrencyMetric(metric) ? formatCurrency(value) : formatNumber(value);
};

const formatSegmentLabel = (value, viewType) => {
  if (value === null || value === undefined) return "";
  if (viewType === "percentage") {
    return value >= 12 ? `${Math.round(value)}%` : "";
  }
  return value >= 1e9 ? formatCurrency(value) : "";
};

const formatAxisNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return Math.round(Number(value)).toLocaleString();
};

const formatAxisThousands = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return `${Math.round(Number(value) / 1000)}K`;
};

const formatCountLabel = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return Math.round(Number(value)).toLocaleString();
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
  const compactCharts = typeof window !== "undefined" && window.innerWidth < 1100;
  const chartYAxisWidth = compactCharts ? 220 : 310;
  const chartBarGap = compactCharts ? 18 : 24;
  const chartBarSize = compactCharts ? 30 : 34;
  const spendingChartHeight = compactCharts ? 420 : 560;
  const jobsChartHeight = compactCharts ? 380 : 520;

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
    .slice(0, 10);

  const jobsData = (detailRecords || [])
    .map((row) => ({
      agency: row.agency,
      Employees: Number(row["Employees"]) || 0
    }))
    .sort((a, b) => b.Employees - a.Employees)
    .slice(0, 10);

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
                <div className="spending-chart-title">
                  Top 10 Federal Agencies by Spending (Contracts, Grants, and Wages)
                </div>
                <div className="spending-chart-axis-label">Agency</div>
                <div className="spending-overlay-chart-body">
                  <ResponsiveContainer width="100%" height={spendingChartHeight}>
                    <BarChart
                      data={spendingData}
                      layout="vertical"
                      margin={{ top: 10, right: 26, left: 6, bottom: 10 }}
                      barCategoryGap={chartBarGap}
                      barSize={chartBarSize}
                    >
                      <CartesianGrid strokeDasharray="4 6" stroke="#e5e7eb" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={
                          viewType === "percentage"
                            ? (value) => `${Math.round(value)}%`
                            : formatAxisNumber
                        }
                        domain={viewType === "percentage" ? [0, 100] : ["auto", "auto"]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#111827", fontSize: compactCharts ? 11 : 12, fontWeight: 500 }}
                      />
                      <YAxis
                        dataKey="agency"
                        type="category"
                        width={chartYAxisWidth}
                        tick={{ fontSize: compactCharts ? 11 : 13, fill: "#111827", fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tickMargin={16}
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
                          radius={idx === 0 ? [3, 0, 0, 3] : idx === SPENDING_KEYS.length - 1 ? [0, 3, 3, 0] : 0}
                          isAnimationActive={false}
                        >
                          <LabelList
                            dataKey={key}
                            position="center"
                            formatter={(value) => formatSegmentLabel(value, viewType)}
                            fill="#f8fafc"
                            fontSize={compactCharts ? 12 : 13}
                            fontWeight={700}
                          />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="spending-overlay-chart">
                <div className="spending-chart-title">Top 10 Federal Agencies by Resident Jobs</div>
                <div className="spending-chart-axis-label">Agency</div>
                <div className="spending-overlay-chart-body">
                  <ResponsiveContainer width="100%" height={jobsChartHeight}>
                    <BarChart
                      data={jobsData}
                      layout="vertical"
                      margin={{ top: 10, right: 26, left: 6, bottom: 10 }}
                      barCategoryGap={chartBarGap}
                      barSize={chartBarSize}
                    >
                      <CartesianGrid strokeDasharray="4 6" stroke="#e5e7eb" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={formatAxisThousands}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#111827", fontSize: compactCharts ? 11 : 12, fontWeight: 500 }}
                      />
                      <YAxis
                        dataKey="agency"
                        type="category"
                        width={chartYAxisWidth}
                        tick={{ fontSize: compactCharts ? 11 : 13, fill: "#111827", fontWeight: 600 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        tickMargin={16}
                        tickFormatter={formatAgencyLabel}
                      />
                      <Tooltip
                        formatter={(value) => [formatCountLabel(value), "Employees"]}
                        cursor={{ fill: "rgba(15, 23, 42, 0.03)" }}
                        contentStyle={{
                          background: "rgba(255,255,255,0.98)",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
                          fontSize: "12px"
                        }}
                      />
                      <Bar dataKey="Employees" radius={[3, 3, 3, 3]} isAnimationActive={false} fill={STACK_COLORS["Resident Wage"]}>
                        <LabelList
                          dataKey="Employees"
                          position="center"
                          formatter={(value) => formatCountLabel(value)}
                          fill="#f8fafc"
                          fontSize={compactCharts ? 12 : 14}
                          fontWeight={700}
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
