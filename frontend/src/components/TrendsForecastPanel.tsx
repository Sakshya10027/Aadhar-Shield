import React, { useMemo, useState } from "react";
import ForecastChart from "./Charts/ForecastChart";

interface TrendsForecastPanelProps {
  dateField: string | null;
  trendsSeries: any[] | null;
}

function toSeriesValues(series: any[]): { period: string; value: number }[] {
  return series.map((row) => {
    const keys = Object.keys(row).filter((k) => k !== "period" && typeof row[k] === "number");
    const key = keys[0];
    const val = Number(key ? row[key] : 0);
    return { period: String(row.period), value: Number.isFinite(val) ? val : 0 };
  });
}

function computeRolling(series: { period: string; value: number }[], window: number) {
  const out: { period: string; value: number }[] = [];
  for (let i = 0; i < series.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = series.slice(start, i + 1).map((r) => r.value);
    const avg = slice.reduce((s, v) => s + v, 0) / slice.length;
    out.push({ period: series[i].period, value: avg });
  }
  return out;
}

function linearForecast(
  series: { period: string; value: number }[],
  horizon: number
): { period: string; actual: number; forecast: number; lower: number; upper: number }[] {
  const n = series.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const ys = series.map((r) => r.value);
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;

  const residuals = ys.map((y, i) => y - (intercept + slope * xs[i]));
  const se = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / Math.max(1, n - 2)) || 0;
  const band = 1.96 * se;

  const full: { period: string; actual: number; forecast: number; lower: number; upper: number }[] =
    series.map((r, i) => ({
      period: r.period,
      actual: r.value,
      forecast: intercept + slope * i,
      lower: intercept + slope * i - band,
      upper: intercept + slope * i + band,
    }));
  for (let h = 1; h <= horizon; h++) {
    const i = n - 1 + h;
    full.push({
      period: `+${h}`,
      actual: NaN,
      forecast: intercept + slope * i,
      lower: intercept + slope * i - band,
      upper: intercept + slope * i + band,
    });
  }
  return full;
}

const TrendsForecastPanel: React.FC<TrendsForecastPanelProps> = ({ dateField, trendsSeries }) => {
  const [horizon, setHorizon] = useState<number>(3);
  const [showForecast, setShowForecast] = useState<boolean>(true);

  if (!dateField) {
    return (
      <div
        style={{
          borderRadius: 8,
          border: "1px solid #dadce0",
          backgroundColor: "#ffffff",
          padding: 16,
          fontSize: 12,
          color: "#5f6368",
        }}
      >
        Time-based analysis not available for this dataset.
      </div>
    );
  }

  const base = useMemo(() => toSeriesValues(trendsSeries || []), [trendsSeries]);
  const rolling = useMemo(() => computeRolling(base, 3), [base]);
  const forecastData = useMemo(() => linearForecast(base, horizon), [base, horizon]);
  const chartData = useMemo(
    () =>
      forecastData.map((r) => ({
        period: r.period,
        actual: Number.isFinite(r.actual) ? r.actual : undefined,
        forecast: r.forecast,
        lower: r.lower,
        upper: r.upper,
      })),
    [forecastData]
  );

  const last = base[base.length - 1];
  const prev = base[base.length - 2];
  const recentGrowth =
    last && prev ? (((last.value - prev.value) / Math.max(prev.value, 1)) * 100).toFixed(1) : "0.0";
  const seasonalHint =
    base.length >= 12
      ? "Possible seasonal pattern detected via monthly periodicity."
      : "No strong seasonal signal detected.";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <label style={{ fontSize: 12 }}>
            Forecast horizon:
            <select
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              style={{
                marginLeft: 8,
                padding: "4px 8px",
                borderRadius: 4,
                border: "1px solid #dadce0",
                fontSize: 12,
                backgroundColor: "#ffffff",
              }}
            >
              <option value={3}>3</option>
              <option value={6}>6</option>
            </select>
          </label>
          <label style={{ fontSize: 12 }}>
            <input
              type="checkbox"
              checked={showForecast}
              onChange={(e) => setShowForecast(e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Show forecast
          </label>
        </div>
        <ForecastChart data={chartData} showForecast={showForecast} />
        <div style={{ fontSize: 11, color: "#5f6368", marginTop: 6 }}>
          Forecast based on historical trend using linear regression. For indicative use only.
        </div>
      </div>
      <div
        style={{
          borderRadius: 8,
          border: "1px solid #dadce0",
          backgroundColor: "#ffffff",
          padding: 16,
          fontSize: 12,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Trend highlights</div>
        <div>Recent growth vs previous period: {recentGrowth}%</div>
        <div style={{ color: "#5f6368", marginTop: 6 }}>{seasonalHint}</div>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 12, marginBottom: 6 }}>
          Rolling average (3-period)
        </div>
        <div style={{ maxHeight: 140, overflow: "auto", backgroundColor: "#f8f9fa", border: "1px solid #e0e0e0", borderRadius: 4, padding: 6 }}>
          {rolling.slice(-6).map((r, i) => (
            <div key={i}>
              {r.period}: {r.value.toFixed(2)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendsForecastPanel;
