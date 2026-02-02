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

const formatAxisMoneyCompact = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  const numeric = Number(value);
  const absValue = Math.abs(numeric);
  if (absValue >= 1e12) return `${(numeric / 1e12).toFixed(absValue >= 1e13 ? 0 : 1)}T`;
  if (absValue >= 1e9) return `${(numeric / 1e9).toFixed(absValue >= 1e10 ? 0 : 1)}B`;
  if (absValue >= 1e6) return `${(numeric / 1e6).toFixed(absValue >= 1e7 ? 0 : 1)}M`;
  if (absValue >= 1e3) return `${(numeric / 1e3).toFixed(absValue >= 1e4 ? 0 : 1)}K`;
  return `${Math.round(numeric)}`;
};

const formatAxisCountCompact = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  const numeric = Number(value);
  const absValue = Math.abs(numeric);
  if (absValue >= 1e6) return `${Math.round(numeric / 1e6)}M`;
  if (absValue >= 1e3) return `${Math.round(numeric / 1e3)}K`;
  return `${Math.round(numeric)}`;
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
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
  const compactCharts = viewportWidth < 1100;
  const chartYAxisWidth = compactCharts ? 200 : 270;
  const chartBarGap = compactCharts ? 20 : 28;
  const chartBarSize = compactCharts ? 34 : 42;
  const spendingChartHeight = compactCharts ? 420 : 560;
  const jobsChartHeight = compactCharts ? 420 : 520;
  const mainWidth = Math.max(320, viewportWidth - sidebarWidth);
  const chartsOverlayWidth = compactCharts
    ? Math.min(360, Math.round(mainWidth * 0.64))
    : Math.min(720, Math.round(mainWidth * 0.56));
  const focusBoundsPadding = focusMode
    ? {
      top: 70,
      bottom: 240,
      left: 30,
      right: chartsOverlayWidth + 48
    }
    : undefined;

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
        focusBoundsPadding={focusBoundsPadding}
      />
      {!enrichedGeo && (
        <div className="map-placeholder">
          <p>Loading spending data...</p>
        </div>
      )}

      {selectedFeature && (
        <>
          <div className="spending-state-info">
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
          </div>

          <div className="spending-overlay-cards spending-overlay-cards--charts">
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
                      margin={{ top: 10, right: 20, left: 0, bottom: 8 }}
                      barCategoryGap={chartBarGap}
                      barSize={chartBarSize}
                    >
                      <CartesianGrid strokeDasharray="4 6" stroke="#e5e7eb" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={
                          viewType === "percentage"
                            ? (value) => `${Math.round(value)}%`
                            : formatAxisMoneyCompact
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
                        tickMargin={18}
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
                      margin={{ top: 10, right: 20, left: 0, bottom: 8 }}
                      barCategoryGap={chartBarGap}
                      barSize={chartBarSize}
                    >
                      <CartesianGrid strokeDasharray="4 6" stroke="#e5e7eb" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={formatAxisCountCompact}
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
                        tickMargin={18}
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
        </>
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
