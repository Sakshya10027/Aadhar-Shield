import React from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface CategoryBarChartProps {
  data: any[];
}

const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ data }) => {
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
        <div style={{ fontSize: 12, color: "#5f6368" }}>No group-wise data available.</div>
      </div>
    );
  }

  const first = data[0];
  const keys = Object.keys(first);
  const dimension = keys[0];
  const metric = keys.find((k) => k !== dimension && typeof first[k] === "number");

  if (!metric) {
    return (
      <div
        style={{
          borderRadius: 8,
          border: "1px solid #dadce0",
          backgroundColor: "#ffffff",
          padding: 16
        }}
      >
        <div style={{ fontSize: 12, color: "#5f6368" }}>No numeric metrics for grouping.</div>
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
      <div style={{ fontSize: 13, marginBottom: 8 }}>Group-wise comparison</div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <XAxis dataKey={dimension} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={metric} fill="#1a73e8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBarChart;

