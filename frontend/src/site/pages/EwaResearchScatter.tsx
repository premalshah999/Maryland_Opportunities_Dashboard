import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { BarChart3, GraduationCap, TrendingUp, Users } from "lucide-react";

type DataPoint = {
  x: number;
  y: number;
};

type Dataset = {
  id: string;
  name: string;
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  data: DataPoint[];
};

const calculateRegressionLine = (data: DataPoint[]) => {
  const n = data.length;
  if (n < 2) return data;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let index = 0; index < n; index += 1) {
    sumX += data[index].x;
    sumY += data[index].y;
    sumXY += data[index].x * data[index].y;
    sumXX += data[index].x * data[index].x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    const avgY = sumY / n;
    const minX = Math.min(...data.map((point) => point.x));
    const maxX = Math.max(...data.map((point) => point.x));
    return [
      { x: minX, y: avgY },
      { x: maxX, y: avgY },
    ];
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const minX = Math.min(...data.map((point) => point.x));
  const maxX = Math.max(...data.map((point) => point.x));

  return [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];
};

const financialLiteracyData = [
  { x: -14.522211, y: 659.77013 },
  { x: -7.7406347, y: 489.63173 },
  { x: -4.8639605, y: 397.02142 },
  { x: -3.4478217, y: 385.66856 },
  { x: -2.683442, y: 263.78535 },
  { x: -1.8690377, y: 289.35022 },
  { x: -1.2869714, y: 301.87396 },
  { x: -0.70437906, y: 295.29068 },
  { x: -0.15352413, y: 113.81241 },
  { x: 0.11950608, y: 274.61497 },
  { x: 0.50092591, y: 264.10786 },
  { x: 0.90643387, y: 211.37959 },
  { x: 1.1394954, y: 189.65088 },
  { x: 1.8186928, y: 269.72252 },
  { x: 2.1960602, y: 161.64365 },
  { x: 2.8485772, y: 299.0372 },
  { x: 3.5510179, y: 207.76046 },
  { x: 5.3329714, y: 283.51786 },
  { x: 7.9027273, y: 291.28355 },
  { x: 16.252468, y: 247.50534 },
];

const hhIncomeData = [
  { x: 44.688045, y: 558.65559 },
  { x: 58.065429, y: 311.25422 },
  { x: 65.705636, y: 314.36524 },
  { x: 72.072143, y: 214.49778 },
  { x: 78.475476, y: 368.75729 },
  { x: 82.301227, y: 345.4495 },
  { x: 85.615048, y: 376.54803 },
  { x: 90.039545, y: 272.22318 },
  { x: 96.422667, y: 259.55806 },
  { x: 101.42786, y: 254.14436 },
  { x: 107.35755, y: 275.72099 },
  { x: 113.33967, y: 187.67058 },
  { x: 118.87259, y: 301.7225 },
  { x: 123.70071, y: 205.19394 },
  { x: 130.85329, y: 217.76198 },
  { x: 138.25895, y: 196.61249 },
  { x: 151.49, y: 249.14167 },
  { x: 165.55909, y: 103.00102 },
  { x: 183.07195, y: 89.627987 },
  { x: 229.72514, y: 56.16742 },
];

const pctBchlorData = [
  { x: 0.00947535, y: 245.36941 },
  { x: 0.10158283, y: 213.47998 },
  { x: 0.15639475, y: 309.38859 },
  { x: 0.19424668, y: 268.94869 },
  { x: 0.21894023, y: 289.5306 },
  { x: 0.24139431, y: 373.3715 },
  { x: 0.26364802, y: 328.29732 },
  { x: 0.2918028, y: 269.09164 },
  { x: 0.3233294, y: 301.32639 },
  { x: 0.34731672, y: 280.58344 },
  { x: 0.37255075, y: 240.7768 },
  { x: 0.40511336, y: 338.3625 },
  { x: 0.42922706, y: 235.29413 },
  { x: 0.45814043, y: 277.91063 },
  { x: 0.4900595, y: 267.57318 },
  { x: 0.52712643, y: 191.75513 },
  { x: 0.57204137, y: 157.33785 },
  { x: 0.60983568, y: 137.81385 },
  { x: 0.67848788, y: 114.82169 },
  { x: 0.83692079, y: 128.61705 },
];

const pctMinorityData = [
  { x: 0, y: 230.79078 },
  { x: 0.0144647, y: 80.805748 },
  { x: 0.0395108, y: 95.913323 },
  { x: 0.07018833, y: 243.27419 },
  { x: 0.09695057, y: 158.96384 },
  { x: 0.12066867, y: 97.185319 },
  { x: 0.1405132, y: 121.71669 },
  { x: 0.17460539, y: 96.790251 },
  { x: 0.20075452, y: 151.96843 },
  { x: 0.23156385, y: 183.15331 },
  { x: 0.26365676, y: 200.26381 },
  { x: 0.3048374, y: 248.71547 },
  { x: 0.35730844, y: 253.57226 },
  { x: 0.41121176, y: 347.36173 },
  { x: 0.45057167, y: 380.68678 },
  { x: 0.52284061, y: 291.6254 },
  { x: 0.61735765, y: 298.5144 },
  { x: 0.72014875, y: 323.29876 },
  { x: 0.83374651, y: 560.75139 },
  { x: 0.93359376, y: 586.14856 },
];

const datasets: Dataset[] = [
  {
    id: "financial_literacy",
    name: "Financial Literacy",
    title: "Zip Codes: Financial Literacy",
    xAxisLabel: "Financial literacy score",
    yAxisLabel: "Transactions per 1000 residents",
    data: financialLiteracyData,
  },
  {
    id: "hh_income",
    name: "Household Income",
    title: "Zip Codes: Income",
    xAxisLabel: "Median household income ($000s)",
    yAxisLabel: "Transactions per 1000 residents",
    data: hhIncomeData,
  },
  {
    id: "pct_bchlor",
    name: "Education",
    title: "Zip Codes: Education",
    xAxisLabel: "Percentage of bachelor degree and above",
    yAxisLabel: "Transactions per 1000 residents",
    data: pctBchlorData,
  },
  {
    id: "pct_minority",
    name: "Race (Minority)",
    title: "Zip Codes: Race",
    xAxisLabel: "Percentage of minority",
    yAxisLabel: "Transactions per 1000 residents",
    data: pctMinorityData,
  },
];

const icons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  financial_literacy: TrendingUp,
  hh_income: BarChart3,
  pct_bchlor: GraduationCap,
  pct_minority: Users,
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload.find((entry: any) => entry.dataKey === "y");
  if (!point) return null;

  return (
    <div className="rounded-lg border border-neutral-100 bg-white/95 p-3 text-sm shadow-xl backdrop-blur-sm">
      <p className="mb-1 font-medium text-neutral-900">Data Point</p>
      <div className="flex flex-col gap-1 text-xs text-neutral-500">
        <div className="flex justify-between gap-4">
          <span>X:</span>
          <span className="font-mono text-neutral-700">{point.payload.x.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Y:</span>
          <span className="font-mono text-neutral-700">{point.payload.y.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const AnalysisChart = ({ dataset }: { dataset: Dataset }) => {
  const regressionData = useMemo(() => calculateRegressionLine(dataset.data), [dataset.data]);

  return (
    <div className="flex h-full w-full flex-col rounded-2xl border border-neutral-100/60 bg-white p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      <h2 className="mb-8 text-center text-xl font-medium tracking-tight text-neutral-800">
        {dataset.title}
      </h2>

      <div className="h-[420px] w-full flex-grow sm:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart margin={{ top: 20, right: 30, bottom: 50, left: 50 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f5f5f5"
              vertical
              horizontal
            />
            <XAxis
              dataKey="x"
              type="number"
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "#737373" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e5e5" }}
              tickMargin={12}
            >
              <Label
                value={dataset.xAxisLabel}
                offset={-25}
                position="insideBottom"
                style={{ fontSize: "13px", fill: "#525252", fontWeight: 500 }}
              />
            </XAxis>
            <YAxis
              dataKey="y"
              type="number"
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "#737373" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e5e5" }}
              tickMargin={12}
            >
              <Label
                value={dataset.yAxisLabel}
                angle={-90}
                position="insideLeft"
                offset={-15}
                style={{ textAnchor: "middle", fontSize: "13px", fill: "#525252", fontWeight: 500 }}
              />
            </YAxis>
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: "3 3", stroke: "#e5e5e5" }}
            />
            <Line
              data={regressionData}
              dataKey="y"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              type="monotone"
            />
            <Scatter data={dataset.data} fill="#171717" isAnimationActive r={4} strokeWidth={0} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const EwaResearchScatter = () => {
  const [activeDatasetId, setActiveDatasetId] = useState(datasets[0].id);
  const activeDataset = datasets.find((dataset) => dataset.id === activeDatasetId) || datasets[0];

  return (
    <div className="animate-fadeIn bg-[#fafafa]">
      <div className="border-b border-gray-100 bg-white py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-umd-red">
              Earned Wage Access
            </span>
            <h1 className="mb-4 text-4xl font-serif font-bold text-gray-900 md:text-5xl">
              Zip Code Scatterplot Analysis
            </h1>
            <p className="text-lg text-gray-500">
              Explore relationships between transactions per 1000 residents and key socio-economic indicators.
            </p>
            <Link
              to="/research"
              className="mt-6 inline-flex items-center border-b border-gray-300 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-700 transition-colors hover:border-umd-red hover:text-umd-red"
            >
              Back to Research
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <aside className="space-y-8 lg:col-span-3">
            <div>
              <h3 className="mb-4 pl-1 text-xs font-bold uppercase tracking-widest text-neutral-400">
                Metrics
              </h3>
              <div className="flex flex-col gap-2">
                {datasets.map((dataset) => {
                  const Icon = icons[dataset.id] || BarChart3;
                  const isActive = activeDatasetId === dataset.id;

                  return (
                    <button
                      key={dataset.id}
                      type="button"
                      onClick={() => setActiveDatasetId(dataset.id)}
                      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ease-in-out active:scale-[0.97] ${
                        isActive
                          ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/10"
                          : "bg-transparent text-neutral-500 hover:bg-white hover:text-neutral-900 hover:shadow-sm"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={`transition-colors duration-200 ${
                            isActive
                              ? "text-neutral-300"
                              : "text-neutral-400 group-hover:text-neutral-600"
                          }`}
                        />
                        {dataset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9">
            <AnalysisChart dataset={activeDataset} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default EwaResearchScatter;
