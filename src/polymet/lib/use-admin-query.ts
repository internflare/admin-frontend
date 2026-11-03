import { useCallback, useEffect, useState } from "react";

export interface AdminQueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/** Wraps a service call so pages handle loading, error and retry consistently. */
export function useAdminQuery<T>(fetcher: () => Promise<T>): AdminQueryState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setData(undefined);
    fetcher()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (active)
          setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetcher, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { data, loading, error, retry };
}
