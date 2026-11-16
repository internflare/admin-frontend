import { useCallback, useEffect, useRef, useState } from "react";
import {
  createDebouncedAdminSearch,
  normalizeAdminSearch,
  type AdminSearchState,
} from "@/polymet/lib/admin-search";

export function useAdminSearch(initialValue = "", debounceEmpty = false) {
  const [input, setInput] = useState(initialValue);
  const [state, setState] = useState<AdminSearchState>(() => {
    const initial = normalizeAdminSearch(initialValue);
    return initial.query ? { phase: "pending" } : initial;
  });
  const scheduler = useRef<ReturnType<typeof createDebouncedAdminSearch> | null>(null);

  useEffect(() => {
    const instance = createDebouncedAdminSearch(setState, { debounceEmpty });
    scheduler.current = instance;
    if (initialValue.trim()) instance.update(initialValue);
    return () => {
      instance.dispose();
      if (scheduler.current === instance) scheduler.current = null;
    };
  }, [debounceEmpty, initialValue]);

  const update = useCallback((value: string) => {
    setInput(value);
    scheduler.current?.update(value);
  }, []);

  return { input, state, update };
}
