import React from "react";

interface AnomalyTableProps {
  overview: {
    metric: string | null;
    method: string;
    thresholds: {
      lower: number;
      upper: number;
    };
    counts: {
      total: number;
      anomalies: number;
      ratio: number;
    };
    by_group: any[];
  } | null;
}

const AnomalyTable: React.FC<AnomalyTableProps> = ({ overview }) => {
  if (!overview) {
    return (
      <div
        style={{
          borderRadius: 8,
          border: "1px solid #dadce0",
          backgroundColor: "#ffffff",
          padding: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
        }}
      >
        <div style={{ fontSize: 12, color: "#5f6368" }}>
          No data available for the selected combination. Try adjusting filters.
        </div>
      </div>
    );
  }

  const ratioPercent = overview.counts.ratio * 100;
  const riskBand =
    ratioPercent > 10
      ? "High anomaly level. Immediate review of data quality is recommended."
      : ratioPercent > 3
      ? "Moderate anomaly level. Monitor and validate critical records."
      : "Low anomaly level. No major outliers detected at current thresholds.";

  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid #dadce0",
        backgroundColor: "#ffffff",
        padding: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Anomaly overview</div>
      <div style={{ fontSize: 11, color: "#5f6368", marginBottom: 8 }}>Based on current filters</div>
      <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 12 }}>
        <div>Metric: {overview.metric}</div>
        <div>
          Thresholds: [{overview.thresholds.lower.toFixed(2)} ,{" "}
          {overview.thresholds.upper.toFixed(2)}]
        </div>
        <div>Total records: {overview.counts.total}</div>
        <div>Anomalies: {overview.counts.anomalies}</div>
        <div>Anomaly ratio: {ratioPercent.toFixed(2)}%</div>
      </div>
      <div
        style={{
          marginBottom: 12,
          fontSize: 12,
          color: "#5f6368"
        }}
      >
        {riskBand}
      </div>
      {overview.by_group.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12
          }}
        >
          <thead>
            <tr>
              {Object.keys(overview.by_group[0]).map((key) => (
                <th
                  key={key}
                  style={{
                    borderBottom: "1px solid #dadce0",
                    textAlign: "left",
                    padding: "4px 8px",
                    backgroundColor: "#f8f9fa"
                  }}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {overview.by_group.map((row, index) => (
              <tr key={index}>
                {Object.keys(row).map((key) => (
                  <td
                    key={key}
                    style={{
                      borderBottom: "1px solid #f1f3f4",
                      padding: "4px 8px"
                    }}
                  >
                    {row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AnomalyTable;
