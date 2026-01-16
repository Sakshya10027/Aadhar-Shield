import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

export interface ColumnSchema {
  name: string;
  dtype: string;
  role: string;
  nullable: boolean;
}

export interface DatasetSchema {
  name: string;
  path: string;
  rows: number;
  columns: number;
  numeric_fields: string[];
  categorical_fields: string[];
  datetime_fields: string[];
  primary_date_field?: string | null;
  schema: ColumnSchema[];
}

export interface SchemaResponse {
  datasets: DatasetSchema[];
}

export interface SummaryResponse {
  dataset: string;
  result: {
    groups: string[];
    summary: any;
  };
}

export interface TrendsResponse {
  dataset: string;
  result: {
    date_field: string | null;
    frequency?: string;
    group_by?: string | null;
    series: any[];
  };
}

export interface GroupByResponse {
  dataset: string;
  result: {
    dimensions: string[];
    result: any[];
  };
}

export interface AnomalyResponse {
  dataset: string;
  result: {
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
  };
}

export interface ClusterSummaryResponse {
  dataset: string;
  result: {
    n_clusters: number;
    feature_names: string[];
    cluster_sizes: number[];
    cluster_proportions: number[];
    cluster_centers: {
      cluster: number;
      values: Record<string, number>;
    }[];
  };
}

export interface QualityResponse {
  dataset: string;
  result: {
    overall_score: number;
    badge: string;
    components: {
      completeness: number;
      anomaly_ratio: number;
      recency_days: number | null;
    };
    least_complete_columns: { column: string; non_null_ratio: number }[];
    total_rows: number;
  };
}

export function fetchSchema() {
  return api.get<SchemaResponse>("/schema");
}

export function fetchSummary(params: {
  dataset: string;
  metrics?: string[];
  group_by?: string[];
}) {
  return api.get<SummaryResponse>("/summary", { params });
}

export function fetchTrends(params: {
  dataset: string;
  date_field?: string;
  metric?: string;
  freq?: string;
  group_by?: string;
}) {
  return api.get<TrendsResponse>("/trends", { params });
}

export function fetchGroupBy(params: {
  dataset: string;
  dimensions?: string[];
  metrics?: string[];
  agg?: string;
}) {
  return api.get<GroupByResponse>("/groupby", { params });
}

export function fetchAnomalies(params: {
  dataset: string;
  metric?: string;
  group_by?: string;
  method?: string;
}) {
  return api.get<AnomalyResponse>("/anomalies", { params });
}

export function fetchClusters(params: {
  dataset: string;
  n_clusters?: number;
}) {
  return api.get<ClusterSummaryResponse>("/clusters", { params });
}

export function fetchQuality(params: { dataset: string }) {
  return api.get<QualityResponse>("/quality", { params });
}
