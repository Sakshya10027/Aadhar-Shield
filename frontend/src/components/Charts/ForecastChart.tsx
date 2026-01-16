import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";

interface ForecastChartProps {
  data: any[];
  showForecast: boolean;
}

const ForecastChart: React.FC<ForecastChartProps> = ({ data, showForecast }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          borderRadius: 8,
          border: "1px solid #dadce0",
          backgroundColor: "#ffffff",
          padding: 16,
        }}
      >
        <div style={{ fontSize: 12, color: "#5f6368" }}>
          No time series data available.
        </div>
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
        height: 340,
      }}
    >
      <div style={{ fontSize: 13, marginBottom: 8 }}>Actual vs Forecast</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="actual" stroke="#1a73e8" dot={false} />
          {showForecast && (
            <>
              <Line type="monotone" dataKey="forecast" stroke="#e37400" dot={false} />
              <Area
                type="monotone"
                dataKey="upper"
                stroke={undefined}
                fill="#e37400"
                fillOpacity={0.1}
                legendType="none"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke={undefined}
                fill="#e37400"
                fillOpacity={0.1}
                legendType="none"
                isAnimationActive={false}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ForecastChart;
