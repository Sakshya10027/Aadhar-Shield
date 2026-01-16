export type Insight = {
  title: string;
  severity: "low" | "medium" | "high";
  insight: string;
  recommendation: string;
  reason?: string;
};

function safeNumber(n: any): number {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function normalizeGroupData(rows: any[]): { key: string; value: number }[] {
  if (!rows || rows.length === 0) return [];
  const first = rows[0];
  const keys = Object.keys(first);
  const dim = keys[0];
  const metric = keys.find((k) => k !== dim && typeof first[k] === "number");
  if (!metric) return [];
  return rows
    .map((r) => ({ key: String(r[dim]), value: safeNumber(r[metric as string]) }))
    .filter((r) => r.key !== "undefined" && r.key !== "null");
}

export function generateInsights(params: {
  datasetName: string;
  metricField: string | null;
  groupByField: string | null;
  groupRows: any[] | null;
  trendsSeries: any[] | null;
}): Insight[] {
  const insights: Insight[] = [];
  const groups = normalizeGroupData(params.groupRows || []);

  if (groups.length >= 3) {
    const sorted = [...groups].sort((a, b) => b.value - a.value);
    const topCount = Math.min(5, sorted.length);
    const total = groups.reduce((s, g) => s + g.value, 0) || 1;
    const topShare = sorted.slice(0, topCount).reduce((s, g) => s + g.value, 0) / total;
    if (topShare >= 0.4) {
      insights.push({
        title: "High Concentration Alert",
        severity: topShare >= 0.6 ? "high" : "medium",
        insight: `Top ${topCount} ${params.groupByField || "groups"} account for ${(topShare * 100).toFixed(1)}% of total`,
        recommendation: "Review service distribution and balance load across regions",
        reason: "Concentration threshold exceeded based on percentile share",
      });
    }
    const mean = total / groups.length;
    const underperformers = groups.filter((g) => g.value < 0.5 * mean);
    if (underperformers.length > 0) {
      const sample = underperformers.slice(0, 5).map((g) => g.key).join(", ");
      insights.push({
        title: "Regional Disparity",
        severity: underperformers.length > groups.length * 0.3 ? "medium" : "low",
        insight: `${underperformers.length} ${params.groupByField || "groups"} below 50% of average`,
        recommendation: "Target support and outreach to underperforming regions",
        reason: `Compared against dataset mean (${mean.toFixed(2)})`,
      });
    }
    const values = groups.map((g) => g.value);
    const mu = values.reduce((s, v) => s + v, 0) / values.length;
    const sigma =
      Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mu, 2), 0) / values.length) || 0;
    if (sigma < mu * 0.05) {
      insights.push({
        title: "Suspicious Uniformity",
        severity: "low",
        insight: "Group values show unusually uniform distribution",
        recommendation: "Validate upstream data pipelines for aggregation artifacts",
        reason: "Low variance relative to mean may indicate data issues",
      });
    }
    const zeros = groups.filter((g) => g.value === 0);
    if (zeros.length > 0) {
      insights.push({
        title: "Zero-Activity Regions",
        severity: zeros.length > groups.length * 0.1 ? "medium" : "low",
        insight: `${zeros.length} ${params.groupByField || "groups"} show zero activity`,
        recommendation: "Investigate operational availability and capture mechanisms",
        reason: "Presence of zeros in active dataset slice",
      });
    }
    if (params.groupByField && /age/i.test(params.groupByField)) {
      const top = sorted[0];
      const tail = sorted[sorted.length - 1];
      if (top && tail && top.value > 2.0 * (tail.value || 1)) {
        insights.push({
          title: "Demographic Skew",
          severity: "medium",
          insight: `${top.key} shows ${(top.value / (tail.value || 1)).toFixed(1)}× higher activity than ${tail.key}`,
          recommendation: "Review age-specific policies and outreach programs",
          reason: "Relative imbalance across age bands",
        });
      }
    }
  }

  const series = (params.trendsSeries || []).map((row) => {
    const keys = Object.keys(row).filter((k) => k !== "period" && typeof row[k] === "number");
    const key = keys[0];
    return { period: String(row.period), value: safeNumber(key ? row[key] : 0) };
  });
  if (series.length >= 6) {
    const last = series[series.length - 1].value;
    const prev = series[series.length - 2].value;
    const delta = last - prev;
    const avgDelta =
      series.slice(1).reduce((s, r, i) => s + (r.value - series[i].value), 0) / (series.length - 1);
    if (Math.abs(delta) > 2 * Math.abs(avgDelta)) {
      insights.push({
        title: "Operational Spike/Drop",
        severity: "medium",
        insight: `Recent period shows ${delta > 0 ? "spike" : "drop"} of ${Math.abs(delta).toFixed(0)} vs average change ${avgDelta.toFixed(0)}`,
        recommendation: "Audit recent operations and capacity planning",
        reason: "Change exceeds 2× average period-on-period change",
      });
    }
  }

  return insights;
}
