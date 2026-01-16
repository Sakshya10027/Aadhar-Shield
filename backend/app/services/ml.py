from typing import Any, Dict, List, Optional

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


def compute_kmeans_clusters(
    df: pd.DataFrame,
    schema: Dict[str, Any],
    n_clusters: int = 3,
    sample_size: int = 50000,
) -> Dict[str, Any]:
    numeric_fields: List[str] = schema.get("numeric_fields", [])
    if not numeric_fields:
        return {
            "n_clusters": 0,
            "feature_names": [],
            "cluster_sizes": [],
            "cluster_proportions": [],
            "cluster_centers": [],
        }

    working = df[numeric_fields].dropna()
    if working.empty:
        return {
            "n_clusters": 0,
            "feature_names": numeric_fields,
            "cluster_sizes": [],
            "cluster_proportions": [],
            "cluster_centers": [],
        }

    if len(working) > sample_size:
        working = working.sample(sample_size, random_state=42)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(working)

    if n_clusters > len(working):
        n_clusters = max(1, len(working))

    model = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
    model.fit(X_scaled)

    centers_scaled = model.cluster_centers_
    centers = scaler.inverse_transform(centers_scaled)

    labels = model.labels_
    counts = np.bincount(labels, minlength=n_clusters)
    total = counts.sum() if counts.size else 0
    proportions = (counts / total).tolist() if total else [0.0] * len(counts)

    cluster_centers: List[Dict[str, float]] = []
    for idx, center in enumerate(centers):
        cluster_centers.append(
            {
                "cluster": int(idx),
                "values": {
                    field: float(value) for field, value in zip(numeric_fields, center)
                },
            }
        )

    return {
        "n_clusters": int(n_clusters),
        "feature_names": numeric_fields,
        "cluster_sizes": [int(c) for c in counts.tolist()],
        "cluster_proportions": proportions,
        "cluster_centers": cluster_centers,
    }

