import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface TimeSeriesChartProps {
  data: any[];
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          borderRadius: 8,
          border: "1px solid #dadce0",
          backgroundColor: "#ffffff",
          padding: 16
        }}
      >
        <div style={{ fontSize: 12, color: "#5f6368" }}>No time series data available.</div>
      </div>
    );
  }

  const first = data[0];
  const keys = Object.keys(first).filter((key) => key !== "period" && typeof first[key] === "number");

  if (keys.length === 0) {
    return (
      <div
        style={{
          borderRadius: 8,
          border: "1px solid #dadce0",
          backgroundColor: "#ffffff",
          padding: 16
        }}
      >
        <div style={{ fontSize: 12, color: "#5f6368" }}>No numeric metrics for time series.</div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid #dadce0",
        backgroundColor: "#ffffff",
        padding: 16,
        height: 320
      }}
    >
      <div style={{ fontSize: 13, marginBottom: 8 }}>Trends</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />
          {keys.map((key) => (
            <Line key={key} type="monotone" dataKey={key} stroke="#1a73e8" dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimeSeriesChart;

