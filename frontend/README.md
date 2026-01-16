# UIDAI Analytics Frontend

## Overview

React and TypeScript single-page application providing an analytics dashboard for UIDAI datasets.

The application consumes the FastAPI backend metadata and analytics endpoints to render dynamic visualisations.

## Requirements

- Node.js 18+
- npm

## Installation

From the `frontend` directory:

```bash
npm install
```

## Running in development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

Ensure the backend is running at `http://localhost:8000`.

## Building for production

```bash
npm run build
```

To preview the built app:

```bash
npm run preview
```

## Folder Structure

- `src/main.tsx` React entrypoint
- `src/App.tsx` application shell and layout
- `src/pages/Home.tsx` home page wrapper
- `src/components/Dashboard.tsx` main analytics dashboard
- `src/components/KPI.tsx` key performance indicator tiles
- `src/components/Charts` chart components
- `src/services/api.ts` API client and types
- `src/hooks/useSchema.ts` hook to fetch schema metadata

