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
  Contracts: "#233047",
  Grants: "#0b6aa8",
  "Resident Wage": "#b45309"
};

const formatAgencyLabel = (value) => {
  if (!value) return "";
  const max = 64;
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
};

const isCurrencyMetric = (metric) => Boolean((metric || "").toLowerCase().match(/wage|contracts|grants|payments/));

const formatMetricValue = (value, metric) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return isCurrencyMetric(metric) ? formatCurrency(value) : formatNumber(value);
};

const formatCurrencyChart = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${Math.round(value)}`;
};

const formatSegmentLabel = (value, viewType) => {
  if (value === null || value === undefined) return "";
  if (viewType === "percentage") {
    return value >= 12 ? `${Math.round(value)}%` : "";
  }
  return value >= 1e9 ? formatCurrencyChart(value) : "";
};

const formatAxisMoney = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return Math.round(Number(value)).toLocaleString();
};

const formatAxisJobs = (value) => {
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
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
  const compactCharts = viewportWidth < 1100;
  const chartYAxisWidth = compactCharts ? 260 : 420;
  const chartBarGap = compactCharts ? 16 : 18;
  const chartBarSize = compactCharts ? 30 : 34;
  const spendingChartHeight = compactCharts ? 520 : 620;
  const jobsChartHeight = compactCharts ? 480 : 560;
  const mainWidth = Math.max(320, viewportWidth - sidebarWidth);
  const chartsOverlayWidth = compactCharts
    ? Math.min(360, Math.round(mainWidth * 0.64))
    : Math.min(900, Math.round(mainWidth * 0.62));
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

  const spendingMax = spendingData.reduce((max, row) => Math.max(max, row.total || 0), 0);
  const spendingTickStep = 1e10;
  const spendingTickMax = spendingMax
    ? Math.ceil(spendingMax / spendingTickStep) * spendingTickStep
    : spendingTickStep * 3;
  const spendingTicks = Array.from(
    { length: Math.max(1, Math.floor(spendingTickMax / spendingTickStep) + 1) },
    (_, idx) => idx * spendingTickStep
  );

  const jobsMax = jobsData.reduce((max, row) => Math.max(max, row.Employees || 0), 0);
  const jobsTickStep = 5000;
  const jobsTickMax = jobsMax ? Math.ceil(jobsMax / jobsTickStep) * jobsTickStep : jobsTickStep * 10;
  const jobsTicks = Array.from(
    { length: Math.max(1, Math.floor(jobsTickMax / jobsTickStep) + 1) },
    (_, idx) => idx * jobsTickStep
  );

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
          <div className="map-card spending-state-card">
            <div className="map-card-header">
              <div>
                <div className="map-card-title">{toTitleCase(selectedFeature.label)}</div>
                <div className="map-card-subtitle">
                  {metric || "Metric"}
                  {year ? ` · ${year}` : ""}
                </div>
              </div>
              <button
                className="map-card-close"
                type="button"
                onClick={() => onSelectedFeatureChange(null)}
              >
                ×
              </button>
            </div>
            <div className="map-card-body">
              <div className="map-card-row">
                <span>Value</span>
                <span>{formatMetricValue(selectedFeature.value, metric)}</span>
              </div>
              <div className="map-card-row">
                <span>Rank</span>
                <span>{selectedRank ? `${selectedRank.rank} of ${rankTotal}` : "—"}</span>
              </div>
            </div>
          </div>

          <div className="spending-charts-pane" style={{ width: chartsOverlayWidth }}>
            {detailLoading && (
              <div className="spending-overlay-loading">
                <span>Loading agency data...</span>
              </div>
            )}

            {!detailLoading && detailRecords && detailRecords.length > 0 && (
              <div className="spending-charts">
                <section className="spending-chart">
                  <h2 className="spending-chart-title">
                    Top 10 Federal Agencies by Spending (Contracts, Grants, and Wages)
                  </h2>
                  <div className="spending-chart-axis-label-row">
                    <span>Agency</span>
                    <span className="spending-chart-axis-icon" aria-hidden="true" />
                  </div>
                  <div className="spending-chart-body">
                    <ResponsiveContainer width="100%" height={spendingChartHeight}>
                      <BarChart
                        data={spendingData}
                        layout="vertical"
                        margin={{ top: 8, right: 26, left: 8, bottom: 0 }}
                        barCategoryGap={chartBarGap}
                        barSize={chartBarSize}
                      >
                        <CartesianGrid stroke="#e5e7eb" horizontal={false} />
                        <XAxis
                          type="number"
                          tickFormatter={
                            viewType === "percentage"
                              ? (value) => `${Math.round(value)}%`
                              : formatAxisMoney
                          }
                          domain={viewType === "percentage" ? [0, 100] : [0, spendingTickMax]}
                          ticks={viewType === "percentage" ? undefined : spendingTicks}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#111827", fontSize: 12 }}
                        />
                        <YAxis
                          dataKey="agency"
                          type="category"
                          width={chartYAxisWidth}
                          tick={{ fontSize: compactCharts ? 12 : 14, fill: "#111827", fontWeight: 600 }}
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
                              : formatCurrencyChart(value),
                            name
                          ]}
                          cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
                        />
                        {SPENDING_KEYS.map((key) => (
                          <Bar
                            key={key}
                            dataKey={key}
                            stackId="a"
                            fill={STACK_COLORS[key]}
                            stroke="#ffffff"
                            strokeWidth={2}
                            radius={0}
                            isAnimationActive={false}
                          >
                            <LabelList
                              dataKey={key}
                              position="center"
                              formatter={(value) => formatSegmentLabel(value, viewType)}
                              fill="#ffffff"
                              fontSize={compactCharts ? 12 : 18}
                              fontWeight={700}
                            />
                          </Bar>
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="spending-chart">
                  <h2 className="spending-chart-title">Top 10 Federal Agencies by Resident Jobs</h2>
                  <div className="spending-chart-axis-label-row">
                    <span>Agency</span>
                    <span className="spending-chart-axis-icon" aria-hidden="true" />
                  </div>
                  <div className="spending-chart-body">
                    <ResponsiveContainer width="100%" height={jobsChartHeight}>
                      <BarChart
                        data={jobsData}
                        layout="vertical"
                        margin={{ top: 8, right: 26, left: 8, bottom: 0 }}
                        barCategoryGap={chartBarGap}
                        barSize={chartBarSize}
                      >
                        <CartesianGrid stroke="#e5e7eb" horizontal={false} />
                        <XAxis
                          type="number"
                          tickFormatter={formatAxisJobs}
                          ticks={jobsTicks}
                          domain={[0, jobsTickMax]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#111827", fontSize: 12 }}
                        />
                        <YAxis
                          dataKey="agency"
                          type="category"
                          width={chartYAxisWidth}
                          tick={{ fontSize: compactCharts ? 12 : 14, fill: "#111827", fontWeight: 600 }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          tickMargin={18}
                          tickFormatter={formatAgencyLabel}
                        />
                        <Tooltip
                          formatter={(value) => formatCountLabel(value)}
                          cursor={{ fill: "rgba(15, 23, 42, 0.04)" }}
                        />
                        <Bar
                          dataKey="Employees"
                          fill={STACK_COLORS["Resident Wage"]}
                          radius={0}
                          isAnimationActive={false}
                        >
                          <LabelList
                            dataKey="Employees"
                            position="center"
                            formatter={(value) => formatCountLabel(value)}
                            fill="#ffffff"
                            fontSize={compactCharts ? 14 : 20}
                            fontWeight={700}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>
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
