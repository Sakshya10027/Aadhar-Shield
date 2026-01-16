from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from ..services.data_loader import get_dataset_manager
from ..services.analytics import (
    compute_summary_statistics,
    compute_trends,
    compute_groupby_analytics,
    compute_anomaly_overview,
)
from ..models.responses import (
    SchemaResponse,
    SummaryResponse,
    TrendsResponse,
    GroupByResponse,
    AnomalyResponse,
    ClusterSummaryResponse,
    QualityResponse,
)
from ..services.ml import compute_kmeans_clusters
from ..services.analytics import compute_quality_overview

api_router = APIRouter()


@api_router.get("/schema", response_model=SchemaResponse)
def get_schema(dataset: Optional[str] = None) -> SchemaResponse:
    manager = get_dataset_manager()
    metadata = manager.list_datasets()
    if dataset:
        if dataset not in metadata:
            raise HTTPException(status_code=404, detail="Dataset not found")
        datasets = {dataset: metadata[dataset]}
    else:
        datasets = metadata
    return SchemaResponse.from_metadata(datasets)


@api_router.get("/summary", response_model=SummaryResponse)
def get_summary(
    dataset: str = Query(...),
    metrics: Optional[List[str]] = Query(None),
    group_by: Optional[List[str]] = Query(None),
) -> SummaryResponse:
    manager = get_dataset_manager()
    df = manager.get_dataframe(dataset)
    schema = manager.get_schema(dataset)
    result = compute_summary_statistics(df, schema, metrics=metrics, group_by=group_by)
    return SummaryResponse(dataset=dataset, result=result)


@api_router.get("/trends", response_model=TrendsResponse)
def get_trends(
    dataset: str = Query(...),
    date_field: Optional[str] = Query(None),
    metric: Optional[str] = Query(None),
    freq: str = Query("M"),
    group_by: Optional[str] = Query(None),
) -> TrendsResponse:
    manager = get_dataset_manager()
    df = manager.get_dataframe(dataset)
    schema = manager.get_schema(dataset)
    result = compute_trends(
        df,
        schema,
        date_field=date_field,
        metric=metric,
        freq=freq,
        group_by=group_by,
    )
    return TrendsResponse(dataset=dataset, result=result)


@api_router.get("/groupby", response_model=GroupByResponse)
def get_groupby(
    dataset: str = Query(...),
    dimensions: Optional[List[str]] = Query(None),
    metrics: Optional[List[str]] = Query(None),
    agg: str = Query("sum"),
) -> GroupByResponse:
    manager = get_dataset_manager()
    df = manager.get_dataframe(dataset)
    schema = manager.get_schema(dataset)
    result = compute_groupby_analytics(
        df,
        schema,
        dimensions=dimensions,
        metrics=metrics,
        agg=agg,
    )
    return GroupByResponse(dataset=dataset, result=result)


@api_router.get("/anomalies", response_model=AnomalyResponse)
def get_anomalies(
    dataset: str = Query(...),
    metric: Optional[str] = Query(None),
    group_by: Optional[str] = Query(None),
    method: str = Query("iqr"),
) -> AnomalyResponse:
    manager = get_dataset_manager()
    df = manager.get_dataframe(dataset)
    schema = manager.get_schema(dataset)
    result = compute_anomaly_overview(
        df,
        schema,
        metric=metric,
        group_by=group_by,
        method=method,
    )
    return AnomalyResponse(dataset=dataset, result=result)


@api_router.get("/clusters", response_model=ClusterSummaryResponse)
def get_clusters(
    dataset: str = Query(...),
    n_clusters: int = Query(3, ge=1, le=10),
) -> ClusterSummaryResponse:
    manager = get_dataset_manager()
    df = manager.get_dataframe(dataset)
    schema = manager.get_schema(dataset)
    result = compute_kmeans_clusters(df, schema, n_clusters=n_clusters)
    return ClusterSummaryResponse(dataset=dataset, result=result)


@api_router.get("/quality", response_model=QualityResponse)
def get_quality(
    dataset: str = Query(...),
) -> QualityResponse:
    manager = get_dataset_manager()
    df = manager.get_dataframe(dataset)
    schema = manager.get_schema(dataset)
    result = compute_quality_overview(df, schema)
    return QualityResponse(dataset=dataset, result=result)
