import { useCallback, useEffect, useRef, useState } from "react";
import { createQueryRequestGate } from "@/polymet/lib/query-request-gate";

export interface AdminQueryState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  retry: () => void;
  cancel: () => void;
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
export function useAdminQuery<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  enabled = true,
): AdminQueryState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const requestGate = useRef(createQueryRequestGate());

  useEffect(() => {
    if (!enabled) {
      requestGate.current.cancel();
      setLoading(false);
      setError(null);
      setData(undefined);
      return;
    }

    let active = true;
    const request = requestGate.current.begin();
    setLoading(true);
    setError(null);
    setData(undefined);
    fetcher(request.signal)
      .then((result) => {
        if (active && request.isCurrent()) setData(result);
      })
      .catch((err: unknown) => {
        if (active && request.isCurrent())
          setError(err instanceof Error ? err.message : "Request failed");
      })
      .finally(() => {
        if (active && request.isCurrent()) setLoading(false);
      });
    return () => {
      active = false;
      request.cancel();
    };
  }, [fetcher, attempt, enabled]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  const cancel = useCallback(() => {
    requestGate.current.cancel();
    setData(undefined);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, retry, cancel };
}
