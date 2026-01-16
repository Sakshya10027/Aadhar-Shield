import React from "react";

interface KPIProps {
  label: string;
  value: string | number;
}

const KPI: React.FC<KPIProps> = ({ label, value }) => {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 8,
        border: "1px solid #c5d6e8",
        backgroundColor: "#f8fbff",
        minWidth: 180,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          color: "#35577a",
          letterSpacing: 0.4
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          marginTop: 4,
          color: "#102a43"
        }}
      >
        {value}
      </div>
    </div>
  );
};

export default KPI;
