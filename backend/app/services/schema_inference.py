from typing import Any, Dict, List, Optional

import pandas as pd


def infer_schema(df: pd.DataFrame) -> Dict[str, Any]:
    columns: List[Dict[str, Any]] = []
    numeric_fields: List[str] = []
    categorical_fields: List[str] = []
    datetime_fields: List[str] = []

    for name in df.columns:
        series = df[name]
        dtype = str(series.dtype)
        nullable = series.isna().any()
        role = _infer_role(series)
        if role == "numeric":
            numeric_fields.append(name)
        elif role == "categorical":
            categorical_fields.append(name)
        elif role == "datetime":
            datetime_fields.append(name)
        columns.append(
            {
                "name": name,
                "dtype": dtype,
                "role": role,
                "nullable": bool(nullable),
            }
        )

    primary_date_field: Optional[str] = datetime_fields[0] if datetime_fields else None

    return {
        "columns": columns,
        "numeric_fields": numeric_fields,
        "categorical_fields": categorical_fields,
        "datetime_fields": datetime_fields,
        "primary_date_field": primary_date_field,
    }


def _infer_role(series: pd.Series) -> str:
    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
    if pd.api.types.is_numeric_dtype(series):
        return "numeric"

    non_null = series.dropna()
    if non_null.empty:
        return "categorical"

    sample = non_null.sample(min(len(non_null), 500), random_state=42)

    parsed = pd.to_datetime(sample, errors="coerce", infer_datetime_format=True)
    if parsed.notna().mean() > 0.8:
        return "datetime"

    numeric_coerced = pd.to_numeric(sample, errors="coerce")
    if numeric_coerced.notna().mean() > 0.8:
        return "numeric"

    unique_ratio = sample.nunique() / len(sample)
    if unique_ratio < 0.2:
        return "categorical"
    return "categorical"
