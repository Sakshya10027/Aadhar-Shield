import React from "react";

interface ClusterTableProps {
  featureNames: string[];
  clusterSizes: number[];
  clusterProportions: number[];
  clusterCenters: {
    cluster: number;
    values: Record<string, number>;
  }[];
}

const ClusterTable: React.FC<ClusterTableProps> = ({
  featureNames,
  clusterSizes,
  clusterProportions,
  clusterCenters
}) => {
  if (!clusterCenters || clusterCenters.length === 0) {
    return (
      <div
        style={{
          borderRadius: 8,
          border: "1px solid #dadce0",
          backgroundColor: "#ffffff",
          padding: 16
        }}
      >
        <div style={{ fontSize: 12, color: "#5f6368" }}>No cluster information available.</div>
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: 8,
        border: "1px solid #dadce0",
        backgroundColor: "#ffffff",
        padding: 16
      }}
    >
      <div style={{ fontSize: 13, marginBottom: 8 }}>Risk cluster summary</div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 12
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                borderBottom: "1px solid #dadce0",
                textAlign: "left",
                padding: "4px 8px",
                backgroundColor: "#f8f9fa"
              }}
            >
              Cluster
            </th>
            <th
              style={{
                borderBottom: "1px solid #dadce0",
                textAlign: "right",
                padding: "4px 8px",
                backgroundColor: "#f8f9fa"
              }}
            >
              Records
            </th>
            <th
              style={{
                borderBottom: "1px solid #dadce0",
                textAlign: "right",
                padding: "4px 8px",
                backgroundColor: "#f8f9fa"
              }}
            >
              Share (%)
            </th>
            {featureNames.map((name) => (
              <th
                key={name}
                style={{
                  borderBottom: "1px solid #dadce0",
                  textAlign: "right",
                  padding: "4px 8px",
                  backgroundColor: "#f8f9fa"
                }}
              >
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clusterCenters.map((center, index) => (
            <tr key={center.cluster}>
              <td
                style={{
                  borderBottom: "1px solid #f1f3f4",
                  padding: "4px 8px"
                }}
              >
                {center.cluster + 1}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #f1f3f4",
                  padding: "4px 8px",
                  textAlign: "right"
                }}
              >
                {clusterSizes[index]}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #f1f3f4",
                  padding: "4px 8px",
                  textAlign: "right"
                }}
              >
                {(clusterProportions[index] * 100).toFixed(2)}
              </td>
              {featureNames.map((name) => (
                <td
                  key={name}
                  style={{
                    borderBottom: "1px solid #f1f3f4",
                    padding: "4px 8px",
                    textAlign: "right"
                  }}
                >
                  {center.values[name] !== undefined
                    ? center.values[name].toFixed(2)
                    : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClusterTable;

