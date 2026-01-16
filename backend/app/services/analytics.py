from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd


def compute_summary_statistics(
    df: pd.DataFrame,
    schema: Dict[str, Any],
    metrics: Optional[List[str]] = None,
    group_by: Optional[List[str]] = None,
) -> Dict[str, Any]:
    numeric_fields = schema["numeric_fields"]
    if metrics:
        numeric_fields = [m for m in metrics if m in numeric_fields]
    if not numeric_fields:
        return {"groups": [], "summary": {}}

    working = df.copy()

    if group_by:
        group_cols = [g for g in group_by if g in working.columns]
    else:
        group_cols = []

    if group_cols:
        grouped = working.groupby(group_cols, dropna=False)[numeric_fields]
        stats = grouped.agg(["count", "mean", "std", "min", "max"])
        stats = stats.reset_index()
        records = stats.to_dict(orient="records")
        return {"groups": group_cols, "summary": records}

    stats = working[numeric_fields].agg(
        ["count", "mean", "std", "min", "max", "median"]
    )
    result = stats.to_dict()
    return {"groups": [], "summary": result}


def compute_trends(
    df: pd.DataFrame,
    schema: Dict[str, Any],
    date_field: Optional[str] = None,
    metric: Optional[str] = None,
    freq: str = "M",
    group_by: Optional[str] = None,
) -> Dict[str, Any]:
    datetime_fields = schema["datetime_fields"]
    if not datetime_fields:
        return {"date_field": None, "series": []}

    date_col = date_field or schema.get("primary_date_field") or datetime_fields[0]
    if date_col not in df.columns:
        return {"date_field": None, "series": []}

    working = df.copy()
    working[date_col] = pd.to_datetime(working[date_col], errors="coerce")
    working = working.dropna(subset=[date_col])

    numeric_fields = schema["numeric_fields"]
    if metric and metric in numeric_fields:
        value_cols = [metric]
    else:
        value_cols = numeric_fields[:1]
    if not value_cols:
        return {"date_field": date_col, "series": []}

    working = working.set_index(date_col)

    if group_by and group_by in df.columns:
        grouped = (
            working.groupby(group_by)[value_cols]
            .resample(freq)
            .sum()
            .reset_index()
            .rename(columns={date_col: "period"})
        )
        records = grouped.to_dict(orient="records")
        return {
            "date_field": date_col,
            "frequency": freq,
            "group_by": group_by,
            "series": records,
        }

    aggregated = working[value_cols].resample(freq).sum().reset_index()
    aggregated = aggregated.rename(columns={date_col: "period"})
    records = aggregated.to_dict(orient="records")
    return {
        "date_field": date_col,
        "frequency": freq,
        "group_by": None,
        "series": records,
    }


def compute_groupby_analytics(
    df: pd.DataFrame,
    schema: Dict[str, Any],
    dimensions: Optional[List[str]] = None,
    metrics: Optional[List[str]] = None,
    agg: str = "sum",
) -> Dict[str, Any]:
    if not dimensions:
        return {"dimensions": [], "result": []}

    dim_cols = [d for d in dimensions if d in df.columns]
    if not dim_cols:
        return {"dimensions": [], "result": []}

    numeric_fields = schema["numeric_fields"]
    if metrics:
        value_cols = [m for m in metrics if m in numeric_fields]
    else:
        value_cols = numeric_fields
    if not value_cols:
        return {"dimensions": dim_cols, "result": []}

    grouped = df.groupby(dim_cols, dropna=False)[value_cols]

    if agg == "mean":
        aggregated = grouped.mean()
    elif agg == "max":
        aggregated = grouped.max()
    elif agg == "min":
        aggregated = grouped.min()
    else:
        aggregated = grouped.sum()

    aggregated = aggregated.reset_index()
    records = aggregated.to_dict(orient="records")
    return {"dimensions": dim_cols, "result": records}


def compute_anomaly_overview(
    df: pd.DataFrame,
    schema: Dict[str, Any],
    metric: Optional[str] = None,
    group_by: Optional[str] = None,
    method: str = "iqr",
) -> Dict[str, Any]:
    numeric_fields = schema["numeric_fields"]
    if not numeric_fields:
        return {"metric": None, "method": method, "overview": []}

    target = metric if metric in numeric_fields else numeric_fields[0]
    series = df[target].dropna()
    if series.empty:
        return {"metric": target, "method": method, "overview": []}

    if method == "zscore":
        mean = series.mean()
        std = series.std(ddof=0) or 1.0
        z_scores = (series - mean) / std
        threshold = 3.0
        mask = z_scores.abs() > threshold
        lower = float(mean - threshold * std)
        upper = float(mean + threshold * std)
    else:
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1 or 1.0
        lower = float(q1 - 1.5 * iqr)
        upper = float(q3 + 1.5 * iqr)
        mask = (series < lower) | (series > upper)

    anomalies = df.loc[series.index[mask]]
    total_count = int(len(series))
    anomaly_count = int(mask.sum())
    ratio = float(anomaly_count / total_count) if total_count else 0.0

    if group_by and group_by in df.columns:
        group_counts = (
            anomalies.groupby(group_by)[target]
                .agg(anomaly_count="count", anomaly_mean="mean")
                .reset_index()
        )
        group_records = group_counts.to_dict(orient="records")
    else:
        group_records = []

    return {
        "metric": target,
        "method": method,
        "thresholds": {"lower": lower, "upper": upper},
        "counts": {
            "total": total_count,
            "anomalies": anomaly_count,
            "ratio": ratio,
        },
        "by_group": group_records,
    }


def compute_quality_overview(
    df: pd.DataFrame,
    schema: Dict[str, Any],
) -> Dict[str, Any]:
    total_rows = int(len(df))
    col_completeness = []
    for name in df.columns:
        non_null_ratio = float(1.0 - df[name].isna().mean())
        col_completeness.append({"column": name, "non_null_ratio": non_null_ratio})
    if col_completeness:
        col_completeness_sorted = sorted(
            col_completeness, key=lambda x: x["non_null_ratio"]
        )
    else:
        col_completeness_sorted = []
    completeness = (
        float(
            sum(c["non_null_ratio"] for c in col_completeness) / len(col_completeness)
        )
        if col_completeness
        else 1.0
    )
    datetime_fields = schema.get("datetime_fields", [])
    date_col = schema.get("primary_date_field") or (
        datetime_fields[0] if datetime_fields else None
    )
    recency_days = None
    if date_col and date_col in df.columns:
        try:
            s = pd.to_datetime(df[date_col], errors="coerce")
            s = s.dropna()
            if not s.empty:
                try:
                    tz = getattr(s.dt, "tz", None)
                    if tz is not None:
                        s = s.dt.tz_localize(None)
                except Exception:
                    pass
                max_date = s.max()
                recency_days = int((pd.Timestamp.now() - max_date).days)
        except Exception:
            recency_days = None
    numeric_fields = schema.get("numeric_fields", [])
    anomaly_ratio = 0.0
    if numeric_fields:
        target = numeric_fields[0]
        series = df[target].dropna()
        if not series.empty:
            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)
            iqr = q3 - q1 or 1.0
            lower = float(q1 - 1.5 * iqr)
            upper = float(q3 + 1.5 * iqr)
            mask = (series < lower) | (series > upper)
            total_count = int(len(series))
            anomaly_ratio = (
                float(mask.sum() / total_count) if total_count else 0.0
            )
    completeness_score = completeness * 100.0
    anomaly_score = max(0.0, 100.0 - anomaly_ratio * 200.0)
    if recency_days is None:
        recency_score = 50.0
    else:
        recency_score = max(0.0, 100.0 - min(recency_days, 365) / 365.0 * 100.0)
    overall = round(0.5 * completeness_score + 0.2 * anomaly_score + 0.3 * recency_score)
    if overall >= 85:
        badge = "Excellent"
    elif overall >= 70:
        badge = "Good"
    elif overall >= 50:
        badge = "Fair"
    else:
        badge = "Poor"
    return {
        "overall_score": overall,
        "badge": badge,
        "components": {
            "completeness": completeness,
            "anomaly_ratio": anomaly_ratio,
            "recency_days": recency_days,
        },
        "least_complete_columns": col_completeness_sorted[:5],
        "total_rows": total_rows,
    }
