export const ADMIN_SEARCH_DEBOUNCE_MS = 3000;
export const ADMIN_SEARCH_MIN_LENGTH = 3;
export const ADMIN_SEARCH_MAX_LENGTH = 100;

export type AdminSearchPhase = "ready" | "pending" | "too-short" | "too-long";

export interface AdminSearchState {
  phase: AdminSearchPhase;
  query?: string;
}

export function normalizeAdminSearch(value: string): AdminSearchState {
  const query = value.trim();
  if (!query) return { phase: "ready" };
  if (query.length < ADMIN_SEARCH_MIN_LENGTH) return { phase: "too-short" };
  if (query.length > ADMIN_SEARCH_MAX_LENGTH) return { phase: "too-long" };
  return { phase: "ready", query };
}

export function createDebouncedAdminSearch(
  onChange: (state: AdminSearchState) => void,
  options: {
    debounceEmpty?: boolean;
    delayMs?: number;
    schedule?: typeof globalThis.setTimeout;
    unschedule?: typeof globalThis.clearTimeout;
  } = {},
) {
  const delayMs = options.delayMs ?? ADMIN_SEARCH_DEBOUNCE_MS;
  const schedule = options.schedule ?? globalThis.setTimeout;
  const unschedule = options.unschedule ?? globalThis.clearTimeout;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  let disposed = false;

  function clearTimer() {
    if (timer !== undefined) unschedule(timer);
    timer = undefined;
  }

  function update(value: string) {
    const currentGeneration = ++generation;
    clearTimer();
    const normalized = normalizeAdminSearch(value);
    if (normalized.phase === "too-short" || normalized.phase === "too-long") {
      onChange(normalized);
      return;
    }

    const isEmpty = !value.trim();
    if (isEmpty && !options.debounceEmpty) {
      onChange(normalized);
      return;
    }

    onChange({ phase: "pending" });
    timer = schedule(() => {
      timer = undefined;
      if (!disposed && currentGeneration === generation) onChange(normalized);
    }, delayMs);
  }

  function dispose() {
    clearTimer();
    generation++;
    disposed = true;
  }

  return { update, dispose };
}
