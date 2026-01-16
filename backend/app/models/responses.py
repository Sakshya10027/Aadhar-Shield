from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ColumnSchema(BaseModel):
    name: str
    dtype: str
    role: str
    nullable: bool


class DatasetSchema(BaseModel):
    name: str
    path: str
    rows: int
    columns: int
    numeric_fields: List[str]
    categorical_fields: List[str]
    datetime_fields: List[str]
    primary_date_field: Optional[str]
    schema: List[ColumnSchema]


class SchemaResponse(BaseModel):
    datasets: List[DatasetSchema]

    @classmethod
    def from_metadata(cls, metadata: Dict[str, Dict[str, Any]]) -> "SchemaResponse":
        datasets: List[DatasetSchema] = []
        for name, info in metadata.items():
            schema_info = info["schema"]
            columns = [
                ColumnSchema(
                    name=c["name"],
                    dtype=c["dtype"],
                    role=c["role"],
                    nullable=c["nullable"],
                )
                for c in schema_info["columns"]
            ]
            datasets.append(
                DatasetSchema(
                    name=name,
                    path=info["path"],
                    rows=info["rows"],
                    columns=info["columns"],
                    numeric_fields=schema_info["numeric_fields"],
                    categorical_fields=schema_info["categorical_fields"],
                    datetime_fields=schema_info["datetime_fields"],
                    primary_date_field=schema_info.get("primary_date_field"),
                    schema=columns,
                )
            )
        return cls(datasets=datasets)


class SummaryResponse(BaseModel):
    dataset: str
    result: Dict[str, Any]


class TrendsResponse(BaseModel):
    dataset: str
    result: Dict[str, Any]


class GroupByResponse(BaseModel):
    dataset: str
    result: Dict[str, Any]


class AnomalyResponse(BaseModel):
    dataset: str
    result: Dict[str, Any]


class ClusterSummaryResponse(BaseModel):
    dataset: str
    result: Dict[str, Any]


class QualityResponse(BaseModel):
    dataset: str
    result: Dict[str, Any]
