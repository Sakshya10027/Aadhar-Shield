from pathlib import Path
from typing import Any, Dict

import pandas as pd

from ..core.config import settings
from .schema_inference import infer_schema


class DatasetManager:
    def __init__(self, data_dir: Path) -> None:
        self.data_dir = data_dir
        self._dataframes: Dict[str, pd.DataFrame] = {}
        self._metadata: Dict[str, Dict[str, Any]] = {}
        self._discover_datasets()

    def _discover_datasets(self) -> None:
        if not self.data_dir.exists():
            return
        for path in self.data_dir.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in {".csv", ".parquet", ".pq", ".xlsx", ".xls"}:
                continue
            df = self._load_file(path)
            name = path.stem
            schema = infer_schema(df)
            self._dataframes[name] = df
            self._metadata[name] = {
                "name": name,
                "path": str(path),
                "rows": int(df.shape[0]),
                "columns": int(df.shape[1]),
                "schema": schema,
            }

    def _load_file(self, path: Path) -> pd.DataFrame:
        suffix = path.suffix.lower()
        if suffix == ".csv":
            return pd.read_csv(path)
        if suffix in {".parquet", ".pq"}:
            return pd.read_parquet(path)
        if suffix in {".xlsx", ".xls"}:
            return pd.read_excel(path)
        raise ValueError(f"Unsupported file type: {suffix}")

    def list_datasets(self) -> Dict[str, Dict[str, Any]]:
        return self._metadata

    def get_dataframe(self, name: str) -> pd.DataFrame:
        if name not in self._dataframes:
            raise KeyError(f"Dataset not found: {name}")
        return self._dataframes[name]

    def get_schema(self, name: str) -> Dict[str, Any]:
        if name not in self._metadata:
            raise KeyError(f"Dataset not found: {name}")
        return self._metadata[name]["schema"]


_dataset_manager: DatasetManager = DatasetManager(settings.data_dir)


def get_dataset_manager() -> DatasetManager:
    return _dataset_manager

