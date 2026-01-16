# UIDAI Analytics Backend

## Overview

Python FastAPI backend providing schema discovery and analytics APIs over locally stored UIDAI datasets.

## Requirements

- Python 3.10+
- pip

## Installation

1. Create and activate a virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Place all dataset files (CSV, Parquet, Excel) into:

```text
backend/app/data
```

## Running the API

From the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

## Folder Structure

- `app/main.py` FastAPI application entrypoint
- `app/api/router.py` API route definitions
- `app/services/data_loader.py` dataset discovery and loading
- `app/services/schema_inference.py` automatic schema inference
- `app/services/analytics.py` analytics functions
- `app/models/responses.py` response models
- `app/core/config.py` configuration (data directory)
- `app/utils/helpers.py` shared helpers
- `app/data` datasets directory

## API Endpoints

All endpoints are prefixed with `/api`.

- `GET /api/schema` returns dataset and schema metadata
- `GET /api/summary` numerical summary statistics (supports `dataset`, `metrics`, `group_by`)
- `GET /api/trends` time series aggregations (supports `dataset`, `date_field`, `metric`, `freq`, `group_by`)
- `GET /api/groupby` grouped aggregations (supports `dataset`, `dimensions`, `metrics`, `agg`)
- `GET /api/anomalies` anomaly overview for numeric metrics (supports `dataset`, `metric`, `group_by`, `method`)

All responses are JSON and designed to be consumed by the React frontend.

