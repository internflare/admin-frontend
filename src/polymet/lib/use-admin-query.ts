import { useCallback, useEffect, useState } from "react";

export interface AdminQueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Runs a promise-returning query with a common loading/error/retry contract.
 * Changing `fetcher` or calling `retry` starts a fresh request and clears stale
 * data; only the latest mounted effect may commit results, so late responses from
 * an old query or an unmounted page are ignored. Rejections become a readable
 * string and are exposed rather than thrown to rendering code. Authentication and
 * permission failures are not reinterpreted here; existing session/API handling
 * and page permission guards remain authoritative.
 */
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
