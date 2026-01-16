from typing import Any, Dict

import pandas as pd


def compute_kpis(df: pd.DataFrame) -> Dict[str, Any]:
    total_rows = int(len(df))
    non_null_counts = df.notna().sum().to_dict()
    completion_ratio = {
        col: float(non_null_counts[col] / total_rows) if total_rows else 0.0
        for col in df.columns
    }
    return {
        "total_rows": total_rows,
        "field_completion_ratio": completion_ratio,
    }

