import { useEffect, useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { MapCanvas } from "../atlas/MapCanvas.jsx";
import { formatCurrency, formatNumber, toTitleCase } from "../../lib/formatters.js";

const SERIES = {
  contracts: { label: "Contracts", color: "#233355" },
  grants: { label: "Grants", color: "#006cb6" },
  wages: { label: "Wages", color: "#ba5107" },
  jobs: { label: "Employees", color: "#b34f07" }
};

const SPENDING_SERIES = ["contracts", "grants", "wages"];

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
  if (value === null || value === undefined || Number.isNaN(value) || value === 0) return "";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  return `$${(value / 1e6).toFixed(0)}M`;
};

const formatSegmentLabel = (value, viewType) => {
  if (value === null || value === undefined) return "";
  if (viewType === "percentage") {
    return value >= 12 ? `${Math.round(value)}%` : "";
  }
  return formatCurrencyChart(value);
};

const formatAxisMoney = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  if (Number(value) === 0) return "0";
  if (Number(value) >= 1e9) return `$${Number(value) / 1e9}B`;
  return `$${Number(value) / 1e6}M`;
};

const formatAxisJobs = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return `${Math.round(Number(value) / 1000)}K`;
};

const formatCountLabel = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return "";
  return Math.round(Number(value)).toLocaleString();
};

const makeStackLabel = (viewType) => (props) => {
  const { x, y, width, height, value } = props;
  if (!width || width < 35) return null;
  const label = formatSegmentLabel(value, viewType);
  if (!label) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2 + 5}
      fill="#ffffff"
      textAnchor="middle"
      fontSize={11}
      fontWeight={700}
    >
      {label}
    </text>
  );
};

const SpendingTooltip = ({ active, payload, label, viewType }) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((acc, item) => acc + (Number(item?.value) || 0), 0);
  const formatValue = (value) =>
    viewType === "percentage" ? `${Number(value).toFixed(1)}%` : formatCurrencyChart(value);
  return (
    <div className="spending-tooltip">
      <div className="spending-tooltip-title">{label}</div>
      {payload.map((item) => (
        <div key={item.dataKey} className="spending-tooltip-row">
          <div className="spending-tooltip-key">
            <span className="spending-tooltip-dot" style={{ backgroundColor: item.color }} />
            <span>{SERIES[item.dataKey]?.label || item.dataKey}</span>
          </div>
          <span className="spending-tooltip-value">{formatValue(item.value)}</span>
        </div>
      ))}
      <div className="spending-tooltip-total">
        <span>Total</span>
        <span>{formatValue(total)}</span>
      </div>
    </div>
  );
};

const JobsTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="spending-tooltip">
      <div className="spending-tooltip-title">{label}</div>
      <div className="spending-tooltip-row">
        <span className="spending-tooltip-key">Total Employees</span>
        <span className="spending-tooltip-value spending-tooltip-value--jobs">
          {formatCountLabel(payload[0].value)}
        </span>
      </div>
    </div>
  );
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
  const chartYAxisWidth = compactCharts ? 230 : 250;
  const spendingChartHeight = compactCharts ? 520 : 600;
  const jobsChartHeight = compactCharts ? 520 : 600;
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
        contracts: viewType === "percentage" ? contracts * pct : contracts,
        grants: viewType === "percentage" ? grants * pct : grants,
        wages: viewType === "percentage" ? wages * pct : wages
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const jobsData = (detailRecords || [])
    .map((row) => ({
      agency: row.agency,
      jobs: Number(row["Employees"]) || 0
    }))
    .sort((a, b) => b.jobs - a.jobs)
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

  const jobsMax = jobsData.reduce((max, row) => Math.max(max, row.jobs || 0), 0);
  const jobsTickStep = 5000;
  const jobsTickMax = jobsMax ? Math.ceil(jobsMax / jobsTickStep) * jobsTickStep : jobsTickStep * 10;
  const jobsTicks = Array.from(
    { length: Math.max(1, Math.floor(jobsTickMax / jobsTickStep) + 1) },
    (_, idx) => idx * jobsTickStep
  );

  const chartsPaneRef = useRef(null);

  useEffect(() => {
    if (!chartsPaneRef.current) return;
    chartsPaneRef.current.scrollTop = 0;
  }, [selectedId]);

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
        focusMaxZoom={4.2}
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

          <div
            className="spending-charts-pane"
            style={{ width: chartsOverlayWidth }}
            ref={chartsPaneRef}
          >
            {detailLoading && (
              <div className="spending-overlay-loading">
                <span>Loading agency data...</span>
              </div>
            )}

            {!detailLoading && detailRecords && detailRecords.length > 0 && (
              <div className="spending-charts">
                <div className="spending-chart-card">
                  <div className="spending-chart-card-header">
                    <div>
                      <div className="spending-chart-card-title">Top 10 Federal Agencies by Spending</div>
                      <div className="spending-chart-card-subtitle">Contracts, Grants, and Wages per Fiscal Year</div>
                    </div>
                  </div>

                  <div className="spending-chart-frame" style={{ height: spendingChartHeight }}>
                    <div className="spending-chart-y-header" style={{ paddingLeft: chartYAxisWidth + 10 }}>
                      <span>Agency</span>
                      <span className="spending-chart-y-icon" aria-hidden="true" />
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={spendingData}
                        layout="vertical"
                        margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
                        barSize={32}
                      >
                        <CartesianGrid horizontal={false} vertical={true} stroke="#f1f5f9" strokeDasharray="4 4" />
                        <XAxis
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                          tickFormatter={
                            viewType === "percentage" ? (value) => `${Math.round(value)}%` : formatAxisMoney
                          }
                          domain={viewType === "percentage" ? [0, 100] : [0, spendingTickMax]}
                          ticks={viewType === "percentage" ? [0, 20, 40, 60, 80, 100] : spendingTicks}
                        />
                        <YAxis
                          dataKey="agency"
                          type="category"
                          width={chartYAxisWidth}
                          tick={{ fill: "#1e293b", fontSize: 13, fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          tickMargin={16}
                          tickFormatter={formatAgencyLabel}
                        />
                        <Tooltip
                          content={(props) => <SpendingTooltip {...props} viewType={viewType} />}
                          cursor={{ fill: "#f8fafc" }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          iconType="square"
                          wrapperStyle={{
                            paddingBottom: "20px",
                            fontSize: "14px",
                            fontWeight: 500,
                            color: "#475569"
                          }}
                        />

                        {SPENDING_SERIES.map((key) => (
                          <Bar
                            key={key}
                            name={SERIES[key].label}
                            dataKey={key}
                            stackId="a"
                            fill={SERIES[key].color}
                            radius={[0, 0, 0, 0]}
                            animationDuration={1000}
                            isAnimationActive
                          >
                            <LabelList dataKey={key} content={makeStackLabel(viewType)} />
                          </Bar>
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="spending-chart-card">
                  <div className="spending-chart-card-header">
                    <div>
                      <div className="spending-chart-card-title">Top 10 Federal Agencies by Resident Jobs</div>
                      <div className="spending-chart-card-subtitle">Full-time resident employees by agency</div>
                    </div>
                  </div>

                  <div className="spending-chart-frame" style={{ height: jobsChartHeight }}>
                    <div className="spending-chart-y-header" style={{ paddingLeft: chartYAxisWidth + 10 }}>
                      <span>Agency</span>
                      <span className="spending-chart-y-icon" aria-hidden="true" />
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={jobsData}
                        layout="vertical"
                        margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
                        barSize={32}
                      >
                        <CartesianGrid horizontal={false} vertical={true} stroke="#f1f5f9" strokeDasharray="4 4" />
                        <XAxis
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={formatAxisJobs}
                          domain={[0, jobsTickMax]}
                          ticks={jobsTicks}
                          tick={{ fill: "#64748b", fontSize: 12 }}
                        />
                        <YAxis
                          dataKey="agency"
                          type="category"
                          width={chartYAxisWidth}
                          tick={{ fill: "#1e293b", fontSize: 13, fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          interval={0}
                          tickMargin={16}
                          tickFormatter={formatAgencyLabel}
                        />
                        <Tooltip content={<JobsTooltip />} cursor={{ fill: "#f8fafc" }} />
                        <Bar
                          name="Employees"
                          dataKey="jobs"
                          fill={SERIES.jobs.color}
                          radius={[0, 0, 0, 0]}
                          animationDuration={1000}
                          isAnimationActive
                        >
                          <LabelList
                            dataKey="jobs"
                            position="right"
                            fill={SERIES.jobs.color}
                            fontSize={13}
                            fontWeight={700}
                            offset={10}
                            formatter={(value) => formatCountLabel(value)}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
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
