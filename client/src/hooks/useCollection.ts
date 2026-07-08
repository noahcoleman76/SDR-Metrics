import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export function useCollection<T>(path: string, key: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api<Record<string, T[]>>(path);
      setItems(data[key] ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load data");
    } finally {
      setLoading(false);
    }
  }, [key, path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, setItems, loading, error, reload: load };
}
