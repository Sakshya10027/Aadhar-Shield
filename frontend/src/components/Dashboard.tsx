import React, { useEffect, useMemo, useState } from "react";
import KPI from "./KPI";
import TimeSeriesChart from "./Charts/TimeSeriesChart";
import CategoryBarChart from "./Charts/CategoryBarChart";
import AnomalyTable from "./Charts/AnomalyTable";
import ClusterTable from "./Charts/ClusterTable";
import { useSchema } from "../hooks/useSchema";
import {
  AnomalyResponse,
  ClusterSummaryResponse,
  GroupByResponse,
  SummaryResponse,
  TrendsResponse,
  QualityResponse,
  fetchAnomalies,
  fetchClusters,
  fetchGroupBy,
  fetchSummary,
  fetchTrends,
  fetchQuality,
} from "../services/api";

type LoadingState = "idle" | "loading" | "error";

const Dashboard: React.FC = () => {
  const {
    datasets,
    loading: schemaLoading,
    error: schemaError,
    reload,
    debugLog,
  } = useSchema();
  const [selectedDatasetName, setSelectedDatasetName] = useState<string | null>(
    null
  );
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [selectedGroupBy, setSelectedGroupBy] = useState<string | null>(null);
  const [selectedDateField, setSelectedDateField] = useState<string | null>(
    null
  );

  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [groupByResult, setGroupByResult] = useState<GroupByResponse | null>(
    null
  );
  const [anomalies, setAnomalies] = useState<AnomalyResponse | null>(null);
  const [clusters, setClusters] = useState<ClusterSummaryResponse | null>(null);
  const [quality, setQuality] = useState<QualityResponse | null>(null);
  const [summaryOverall, setSummaryOverall] = useState<SummaryResponse | null>(
    null
  );
  const [overviewGroupData, setOverviewGroupData] = useState<any[] | null>(
    null
  );

  const [summaryState, setSummaryState] = useState<LoadingState>("idle");
  const [trendsState, setTrendsState] = useState<LoadingState>("idle");
  const [groupByState, setGroupByState] = useState<LoadingState>("idle");
  const [anomalyState, setAnomalyState] = useState<LoadingState>("idle");
  const [clusterState, setClusterState] = useState<LoadingState>("idle");
  const [qualityState, setQualityState] = useState<LoadingState>("idle");
  const [summaryOverallState, setSummaryOverallState] =
    useState<LoadingState>("idle");
  const [overviewGroupState, setOverviewGroupState] =
    useState<LoadingState>("idle");

  const [activeTab, setActiveTab] = useState<
    "overview" | "trends" | "regional" | "anomalies" | "risk" | "quality"
  >("overview");

  const selectedDataset = useMemo(
    () => datasets.find((d) => d.name === selectedDatasetName) || null,
    [datasets, selectedDatasetName]
  );

  useEffect(() => {
    if (datasets.length > 0 && !selectedDatasetName) {
      setSelectedDatasetName(datasets[0].name);
    }
  }, [datasets, selectedDatasetName]);

  useEffect(() => {
    if (!selectedDataset) {
      return;
    }
    const defaultMetric = selectedDataset.numeric_fields[0] || null;
    const defaultGroup = selectedDataset.categorical_fields[0] || null;
    const defaultDate =
      selectedDataset.primary_date_field ||
      selectedDataset.datetime_fields[0] ||
      null;
    setSelectedMetric(defaultMetric);
    setSelectedGroupBy(defaultGroup);
    setSelectedDateField(defaultDate);
  }, [selectedDatasetName, selectedDataset]);

  useEffect(() => {
    if (!selectedDataset) {
      return;
    }

    setSummaryState("loading");
    fetchSummary({
      dataset: selectedDataset.name,
      metrics: selectedMetric ? [selectedMetric] : undefined,
      group_by: selectedGroupBy ? [selectedGroupBy] : undefined,
    })
      .then((response) => {
        setSummary(response.data);
        setSummaryState("idle");
      })
      .catch(() => {
        setSummaryState("error");
      });
  }, [selectedDataset, selectedMetric, selectedGroupBy]);

  useEffect(() => {
    if (!selectedDataset) {
      return;
    }
    if (!selectedDateField) {
      setTrends(null);
      return;
    }
    setTrendsState("loading");
    fetchTrends({
      dataset: selectedDataset.name,
      date_field: selectedDateField || undefined,
      metric: selectedMetric || undefined,
      freq: "M",
      group_by: selectedGroupBy || undefined,
    })
      .then((response) => {
        setTrends(response.data);
        setTrendsState("idle");
      })
      .catch(() => {
        setTrendsState("error");
      });
  }, [selectedDataset, selectedMetric, selectedGroupBy, selectedDateField]);

  useEffect(() => {
    if (!selectedDataset) {
      return;
    }
    if (!selectedGroupBy) {
      setGroupByResult(null);
      return;
    }
    setGroupByState("loading");
    fetchGroupBy({
      dataset: selectedDataset.name,
      dimensions: [selectedGroupBy],
      metrics: selectedMetric ? [selectedMetric] : undefined,
      agg: "sum",
    })
      .then((response) => {
        setGroupByResult(response.data);
        setGroupByState("idle");
      })
      .catch(() => {
        setGroupByState("error");
      });
  }, [selectedDataset, selectedMetric, selectedGroupBy]);

  useEffect(() => {
    if (!selectedDataset) {
      return;
    }
    setAnomalyState("loading");
    fetchAnomalies({
      dataset: selectedDataset.name,
      metric: selectedMetric || undefined,
      group_by: selectedGroupBy || undefined,
      method: "iqr",
    })
      .then((response) => {
        setAnomalies(response.data);
        setAnomalyState("idle");
      })
      .catch(() => {
        setAnomalyState("error");
      });
  }, [selectedDataset, selectedMetric, selectedGroupBy]);

  useEffect(() => {
    if (!selectedDataset) {
      return;
    }
    setClusterState("loading");
    fetchClusters({
      dataset: selectedDataset.name,
      n_clusters: 4,
    })
      .then((response) => {
        setClusters(response.data);
        setClusterState("idle");
      })
      .catch(() => {
        setClusterState("error");
      });
  }, [selectedDataset]);

  useEffect(() => {
    if (!selectedDataset) {
      return;
    }
    setQualityState("loading");
    fetchQuality({
      dataset: selectedDataset.name,
    })
      .then((response) => {
        setQuality(response.data);
        setQualityState("idle");
      })
      .catch(() => {
        setQualityState("error");
      });
  }, [selectedDataset]);

  useEffect(() => {
    if (!selectedDataset) {
      return;
    }
    setSummaryOverallState("loading");
    fetchSummary({
      dataset: selectedDataset.name,
      metrics: selectedMetric ? [selectedMetric] : undefined,
    })
      .then((response) => {
        setSummaryOverall(response.data);
        setSummaryOverallState("idle");
      })
      .catch(() => {
        setSummaryOverallState("error");
      });
  }, [selectedDataset, selectedMetric]);

  useEffect(() => {
    if (!selectedDataset) {
      return;
    }
    const defaultGroup =
      selectedDataset.categorical_fields[0] ||
      selectedDataset.datetime_fields[0] ||
      null;
    if (!defaultGroup) {
      setOverviewGroupData([]);
      return;
    }
    setOverviewGroupState("loading");
    fetchGroupBy({
      dataset: selectedDataset.name,
      dimensions: [defaultGroup],
      metrics: selectedMetric ? [selectedMetric] : undefined,
      agg: "sum",
    })
      .then((response) => {
        setOverviewGroupData(response.data.result.result || []);
        setOverviewGroupState("idle");
      })
      .catch(() => {
        setOverviewGroupState("error");
      });
  }, [selectedDataset, selectedMetric]);

  const totalRecords = selectedDataset ? selectedDataset.rows : 0;
  const numericFieldCount = selectedDataset
    ? selectedDataset.numeric_fields.length
    : 0;
  const categoricalFieldCount = selectedDataset
    ? selectedDataset.categorical_fields.length
    : 0;
  const anomalyRatio = anomalies ? anomalies.result.counts.ratio * 100 : 0;
  const datasetCategory =
    selectedDataset && selectedDataset.name.toLowerCase().includes("biometric")
      ? "Biometric"
      : selectedDataset &&
        selectedDataset.name.toLowerCase().includes("demographic")
      ? "Demographic"
      : selectedDataset &&
        selectedDataset.name.toLowerCase().includes("enrolment")
      ? "Enrolment"
      : "Other";

  if (schemaLoading && datasets.length === 0) {
    return (
      <div style={{ fontSize: 13, color: "#5f6368" }}>
        Loading datasets and schema metadata.
        <div style={{ marginTop: 8 }}>
          If this takes too long, click reload:
          <button
            type="button"
            onClick={reload}
            style={{
              marginLeft: 8,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #dadce0",
              background: "#ffffff",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (schemaError) {
    return (
      <div style={{ fontSize: 13, color: "#d93025" }}>
        Schema metadata could not be loaded. Ensure backend API is running.
      </div>
    );
  }

  if (!selectedDataset) {
    return (
      <div style={{ fontSize: 13, color: "#5f6368" }}>
        No datasets discovered in backend data directory.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: 16,
      }}
    >
      <aside
        style={{
          borderRadius: 8,
          border: "1px solid #c5d6e8",
          backgroundColor: "#f8fbff",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignSelf: "flex-start",
          position: "sticky",
          top: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            Dataset
          </div>
          <select
            value={selectedDatasetName || ""}
            onChange={(e) => setSelectedDatasetName(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #dadce0",
              fontSize: 12,
              backgroundColor: "#ffffff",
            }}
          >
            {datasets.map((ds) => (
              <option key={ds.name} value={ds.name}>
                {ds.name}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 11, color: "#5f6368", marginTop: 6 }}>
            Domain: {datasetCategory} • Records: {selectedDataset.rows} •
            Fields: {selectedDataset.columns}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
            Metric field
          </div>
          <select
            value={selectedMetric || ""}
            onChange={(e) => setSelectedMetric(e.target.value || null)}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #dadce0",
              fontSize: 12,
              backgroundColor: "#ffffff",
            }}
          >
            <option value="">Auto</option>
            {selectedDataset.numeric_fields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
            Group by field
          </div>
          <select
            value={selectedGroupBy || ""}
            onChange={(e) => setSelectedGroupBy(e.target.value || null)}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #dadce0",
              fontSize: 12,
              backgroundColor: "#ffffff",
            }}
          >
            <option value="">None</option>
            {selectedDataset.categorical_fields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
            Date field
          </div>
          <select
            value={selectedDateField || ""}
            onChange={(e) => setSelectedDateField(e.target.value || null)}
            style={{
              width: "100%",
              padding: "6px 8px",
              borderRadius: 4,
              border: "1px solid #dadce0",
              fontSize: 12,
              backgroundColor: "#ffffff",
            }}
          >
            <option value="">None</option>
            {selectedDataset.datetime_fields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
            Available categorical fields
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {selectedDataset.categorical_fields.map((field) => (
              <span
                key={field}
                style={{
                  padding: "2px 6px",
                  borderRadius: 16,
                  border: "1px solid #e0e0e0",
                  backgroundColor:
                    selectedGroupBy === field ? "#e8f0fe" : "#f8f9fa",
                  fontSize: 10,
                }}
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <KPI label="Total records" value={totalRecords.toLocaleString()} />
          <KPI label="Numeric fields" value={numericFieldCount} />
          <KPI label="Categorical fields" value={categoricalFieldCount} />
          <KPI label="Anomaly ratio (%)" value={anomalyRatio.toFixed(2)} />
        </section>

        <section
          style={{
            borderRadius: 8,
            border: "1px solid #dadce0",
            backgroundColor: "#ffffff",
            padding: 12,
            display: "grid",
            gridTemplateColumns: "1.6fr 1.2fr 1.2fr",
            gap: 16,
            fontSize: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Dataset profile
            </div>
            <div style={{ marginBottom: 6, color: "#5f6368" }}>
              {selectedDataset.name} is classified under the {datasetCategory}{" "}
              domain. The figures below are based on the current selections.
            </div>
            <div>
              <div>
                Selected metric:{" "}
                <span style={{ fontWeight: 600 }}>
                  {selectedMetric || "Auto-detected numeric field"}
                </span>
              </div>
              <div>
                Grouping dimension:{" "}
                <span style={{ fontWeight: 600 }}>
                  {selectedGroupBy || "No grouping"}
                </span>
              </div>
              <div>
                Date field in use:{" "}
                <span style={{ fontWeight: 600 }}>
                  {selectedDateField || "Not applied"}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              Numeric indicators
            </div>
            <div
              style={{
                maxHeight: 96,
                overflow: "auto",
                borderRadius: 4,
                border: "1px solid #e0e0e0",
                padding: 6,
                backgroundColor: "#f8f9fa",
              }}
            >
              {selectedDataset.numeric_fields.length === 0 && (
                <div style={{ color: "#5f6368" }}>
                  No numeric fields detected.
                </div>
              )}
              {selectedDataset.numeric_fields.map((field) => (
                <div key={field}>{field}</div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              Categorical and time fields
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 6,
              }}
            >
              <div
                style={{
                  borderRadius: 4,
                  border: "1px solid #e0e0e0",
                  padding: 6,
                  backgroundColor: "#f8f9fa",
                  maxHeight: 60,
                  overflow: "auto",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    marginBottom: 2,
                    color: "#5f6368",
                  }}
                >
                  Categorical fields
                </div>
                {selectedDataset.categorical_fields.length === 0 && (
                  <div style={{ color: "#5f6368" }}>None</div>
                )}
                {selectedDataset.categorical_fields.map((field) => (
                  <div key={field}>{field}</div>
                ))}
              </div>
              <div
                style={{
                  borderRadius: 4,
                  border: "1px solid #e0e0e0",
                  padding: 6,
                  backgroundColor: "#f8f9fa",
                  maxHeight: 60,
                  overflow: "auto",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    marginBottom: 2,
                    color: "#5f6368",
                  }}
                >
                  Date and time fields
                </div>
                {selectedDataset.datetime_fields.length === 0 && (
                  <div style={{ color: "#5f6368" }}>None</div>
                )}
                {selectedDataset.datetime_fields.map((field) => (
                  <div key={field}>{field}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            borderRadius: 8,
            border: "1px solid #dadce0",
            backgroundColor: "#ffffff",
            padding: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              borderBottom: "1px solid #e0e0e0",
              paddingBottom: 4,
              marginBottom: 8,
              fontSize: 12,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: "none",
                backgroundColor:
                  activeTab === "overview" ? "#1a73e8" : "transparent",
                color: activeTab === "overview" ? "#ffffff" : "#5f6368",
                cursor: "pointer",
              }}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("trends")}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: "none",
                backgroundColor:
                  activeTab === "trends" ? "#1a73e8" : "transparent",
                color: activeTab === "trends" ? "#ffffff" : "#5f6368",
                cursor: "pointer",
              }}
            >
              Time trends
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("regional")}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: "none",
                backgroundColor:
                  activeTab === "regional" ? "#1a73e8" : "transparent",
                color: activeTab === "regional" ? "#ffffff" : "#5f6368",
                cursor: "pointer",
              }}
            >
              Group comparison
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("anomalies")}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: "none",
                backgroundColor:
                  activeTab === "anomalies" ? "#1a73e8" : "transparent",
                color: activeTab === "anomalies" ? "#ffffff" : "#5f6368",
                cursor: "pointer",
              }}
            >
              Anomalies
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("risk")}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: "none",
                backgroundColor:
                  activeTab === "risk" ? "#1a73e8" : "transparent",
                color: activeTab === "risk" ? "#ffffff" : "#5f6368",
                cursor: "pointer",
              }}
            >
              Risk clusters
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quality")}
              style={{
                padding: "6px 10px",
                borderRadius: 4,
                border: "none",
                backgroundColor:
                  activeTab === "quality" ? "#1a73e8" : "transparent",
                color: activeTab === "quality" ? "#ffffff" : "#5f6368",
                cursor: "pointer",
              }}
            >
              Data quality
            </button>
          </div>

          <div style={{ padding: 4 }}>
            {activeTab === "overview" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    borderRadius: 8,
                    border: "1px solid #dadce0",
                    backgroundColor: "#ffffff",
                    padding: 16,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                  >
                    Overall statistics
                  </div>
                  {summaryOverallState === "error" ? (
                    <div style={{ fontSize: 12, color: "#d93025" }}>
                      Unable to load overall statistics.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        fontSize: 12,
                      }}
                    >
                      <div>
                        Count:{" "}
                        <span style={{ fontWeight: 600 }}>
                          {(() => {
                            const s = summaryOverall?.result.summary;
                            if (!s) return "0";
                            if (Array.isArray(s)) return s.length.toString();
                            const val =
                              typeof s.count === "object" && selectedMetric
                                ? s.count[selectedMetric]
                                : s.count ?? 0;
                            return Number(val).toLocaleString();
                          })()}
                        </span>
                      </div>
                      <div>
                        Mean:{" "}
                        <span style={{ fontWeight: 600 }}>
                          {(() => {
                            const s = summaryOverall?.result.summary;
                            if (!s) return "0";
                            const val =
                              typeof s.mean === "object" && selectedMetric
                                ? s.mean[selectedMetric]
                                : s.mean ?? 0;
                            return Number(val).toFixed(2);
                          })()}
                        </span>
                      </div>
                      <div>
                        Std:{" "}
                        <span style={{ fontWeight: 600 }}>
                          {(() => {
                            const s = summaryOverall?.result.summary;
                            if (!s) return "0";
                            const val =
                              typeof s.std === "object" && selectedMetric
                                ? s.std[selectedMetric]
                                : s.std ?? 0;
                            return Number(val).toFixed(2);
                          })()}
                        </span>
                      </div>
                      <div>
                        Min:{" "}
                        <span style={{ fontWeight: 600 }}>
                          {(() => {
                            const s = summaryOverall?.result.summary;
                            if (!s) return "0";
                            const val =
                              typeof s.min === "object" && selectedMetric
                                ? s.min[selectedMetric]
                                : s.min ?? 0;
                            return Number(val).toFixed(2);
                          })()}
                        </span>
                      </div>
                      <div>
                        Max:{" "}
                        <span style={{ fontWeight: 600 }}>
                          {(() => {
                            const s = summaryOverall?.result.summary;
                            if (!s) return "0";
                            const val =
                              typeof s.max === "object" && selectedMetric
                                ? s.max[selectedMetric]
                                : s.max ?? 0;
                            return Number(val).toFixed(2);
                          })()}
                        </span>
                      </div>
                      <div>
                        Median:{" "}
                        <span style={{ fontWeight: 600 }}>
                          {(() => {
                            const s = summaryOverall?.result.summary as any;
                            const val =
                              s && s.median
                                ? typeof s.median === "object" && selectedMetric
                                  ? s.median[selectedMetric]
                                  : s.median
                                : 0;
                            return Number(val).toFixed(2);
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    borderRadius: 8,
                    border: "1px solid #dadce0",
                    backgroundColor: "#ffffff",
                    padding: 16,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                  >
                    Top groups by metric
                  </div>
                  {overviewGroupState === "error" ? (
                    <div style={{ fontSize: 12, color: "#d93025" }}>
                      Unable to load group comparison.
                    </div>
                  ) : overviewGroupData && overviewGroupData.length > 0 ? (
                    <CategoryBarChart data={overviewGroupData} />
                  ) : (
                    <div style={{ fontSize: 12, color: "#5f6368" }}>
                      No grouping fields available for comparison.
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === "trends" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12, color: "#5f6368" }}>
                  Time series is aggregated by{" "}
                  <span style={{ fontWeight: 600 }}>
                    {selectedDateField || "available date field"}
                  </span>{" "}
                  with frequency{" "}
                  <span style={{ fontWeight: 600 }}>monthly</span>
                  {selectedMetric && (
                    <>
                      {" "}
                      for metric{" "}
                      <span style={{ fontWeight: 600 }}>{selectedMetric}</span>
                    </>
                  )}
                  {selectedGroupBy && (
                    <>
                      {" "}
                      and split by{" "}
                      <span style={{ fontWeight: 600 }}>{selectedGroupBy}</span>
                      .
                    </>
                  )}
                </div>
                {trendsState === "error" ? (
                  <div
                    style={{
                      borderRadius: 8,
                      border: "1px solid #dadce0",
                      backgroundColor: "#ffffff",
                      padding: 16,
                      fontSize: 12,
                      color: "#d93025",
                    }}
                  >
                    Unable to load trends.
                  </div>
                ) : (
                  <TimeSeriesChart data={trends?.result.series || []} />
                )}
              </div>
            )}
            {activeTab === "regional" && (
              <div>
                {groupByState === "error" ? (
                  <div
                    style={{
                      borderRadius: 8,
                      border: "1px solid #dadce0",
                      backgroundColor: "#ffffff",
                      padding: 16,
                      fontSize: 12,
                      color: "#d93025",
                    }}
                  >
                    Unable to load group-wise analytics.
                  </div>
                ) : (
                  <CategoryBarChart data={groupByResult?.result.result || []} />
                )}
              </div>
            )}
            {activeTab === "anomalies" && (
              <div>
                {anomalyState === "error" ? (
                  <div
                    style={{
                      borderRadius: 8,
                      border: "1px solid #dadce0",
                      backgroundColor: "#ffffff",
                      padding: 16,
                      fontSize: 12,
                      color: "#d93025",
                    }}
                  >
                    Unable to load anomaly overview.
                  </div>
                ) : (
                  <AnomalyTable
                    overview={anomalies ? anomalies.result : null}
                  />
                )}
              </div>
            )}
            {activeTab === "risk" && (
              <div>
                {clusterState === "error" ? (
                  <div
                    style={{
                      borderRadius: 8,
                      border: "1px solid #dadce0",
                      backgroundColor: "#ffffff",
                      padding: 16,
                      fontSize: 12,
                      color: "#d93025",
                    }}
                  >
                    Unable to compute risk clusters.
                  </div>
                ) : (
                  <ClusterTable
                    featureNames={clusters?.result.feature_names || []}
                    clusterSizes={clusters?.result.cluster_sizes || []}
                    clusterProportions={
                      clusters?.result.cluster_proportions || []
                    }
                    clusterCenters={clusters?.result.cluster_centers || []}
                  />
                )}
              </div>
            )}
            {activeTab === "quality" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    borderRadius: 8,
                    border: "1px solid #dadce0",
                    backgroundColor: "#ffffff",
                    padding: 16,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                  >
                    Data quality score
                  </div>
                  {qualityState === "error" ? (
                    <div style={{ fontSize: 12, color: "#d93025" }}>
                      Unable to compute data quality overview.
                    </div>
                  ) : (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 88,
                          height: 88,
                          borderRadius: "50%",
                          border: "8px solid #1a73e8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#1a73e8",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        {quality?.result.overall_score ?? 0}
                      </div>
                      <div style={{ fontSize: 12 }}>
                        <div>
                          Badge:{" "}
                          <span style={{ fontWeight: 600 }}>
                            {quality?.result.badge || "N/A"}
                          </span>
                        </div>
                        <div>
                          Completeness:{" "}
                          <span style={{ fontWeight: 600 }}>
                            {quality
                              ? (
                                  quality.result.components.completeness * 100
                                ).toFixed(1)
                              : "0"}
                            %
                          </span>
                        </div>
                        <div>
                          Anomaly ratio:{" "}
                          <span style={{ fontWeight: 600 }}>
                            {quality
                              ? (
                                  quality.result.components.anomaly_ratio * 100
                                ).toFixed(2)
                              : "0"}
                            %
                          </span>
                        </div>
                        <div>
                          Recency (days):{" "}
                          <span style={{ fontWeight: 600 }}>
                            {quality?.result.components.recency_days ?? "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    borderRadius: 8,
                    border: "1px solid #dadce0",
                    backgroundColor: "#ffffff",
                    padding: 16,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}
                  >
                    Least complete columns
                  </div>
                  <div style={{ fontSize: 12, color: "#5f6368" }}>
                    {quality?.result.least_complete_columns.length
                      ? quality.result.least_complete_columns.map((c) => (
                          <div key={c.column}>
                            {c.column}: {(c.non_null_ratio * 100).toFixed(1)}%
                          </div>
                        ))
                      : "All columns are fully complete."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
