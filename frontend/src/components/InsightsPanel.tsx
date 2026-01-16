import React, { useMemo } from "react";
import { Insight, generateInsights } from "../services/insights";

interface InsightsPanelProps {
  datasetName: string;
  metricField: string | null;
  groupByField: string | null;
  groupRows: any[] | null;
  trendsSeries: any[] | null;
}

const severityColor = (s: "low" | "medium" | "high") =>
  s === "high" ? "#d93025" : s === "medium" ? "#e37400" : "#137333";

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  datasetName,
  metricField,
  groupByField,
  groupRows,
  trendsSeries,
}) => {
  const insights: Insight[] = useMemo(
    () =>
      generateInsights({
        datasetName,
        metricField,
        groupByField,
        groupRows,
        trendsSeries,
      }),
    [datasetName, metricField, groupByField, groupRows, trendsSeries]
  );

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
      }}
    >
      {insights.length === 0 ? (
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
          No insights generated for current selection. Adjust metric or grouping.
        </div>
      ) : (
        insights.map((ins, idx) => (
          <div
            key={idx}
            style={{
              borderRadius: 8,
              border: "1px solid #dadce0",
              backgroundColor: "#ffffff",
              padding: 16,
              fontSize: 12,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
            title={ins.reason || "Insight generated based on statistical rules"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: severityColor(ins.severity),
                }}
              />
              <div style={{ fontSize: 13, fontWeight: 600 }}>{ins.title}</div>
            </div>
            <div style={{ color: "#202124" }}>{ins.insight}</div>
            <div style={{ color: "#5f6368" }}>
              Recommendation: <span style={{ fontWeight: 600 }}>{ins.recommendation}</span>
            </div>
            <div style={{ color: "#5f6368" }}>
              Context: Metric = {metricField || "Auto"}, Group = {groupByField || "None"}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default InsightsPanel;
