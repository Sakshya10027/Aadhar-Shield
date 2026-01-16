import { useCallback, useEffect, useState } from "react";
import { DatasetSchema, SchemaResponse, fetchSchema } from "../services/api";

export function useSchema() {
  const [datasets, setDatasets] = useState<DatasetSchema[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setDebugLog((prev) => [...prev, `${new Date().toISOString().split("T")[1].split(".")[0]} - ${msg}`]);
  };

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setDebugLog([]);
    addLog("Initiating schema fetch...");

    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) {
        addLog("Timeout triggered (10s)");
        setLoading(false);
        setError("Schema load timed out. Please ensure backend is running.");
      }
    }, 10000);

    fetchSchema()
      .then((response) => {
        if (!cancelled) {
          addLog(`Success. Datasets found: ${response.data.datasets?.length ?? 0}`);
          setDatasets(response.data.datasets);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          addLog(`Error: ${err.message || "Unknown error"}`);
          console.error(err);
          setError("Unable to load schema metadata");
        }
      })
      .finally(() => {
        if (!cancelled) {
          clearTimeout(timeout);
          setLoading(false);
          addLog("Loading state set to false");
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const cleanup = reload();
    return cleanup;
  }, [reload]);

  return { datasets, loading, error, reload, debugLog };
}
