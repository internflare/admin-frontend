import { useState } from "react";

/**
 * Share inline admin forms' submitting/error lifecycle. `run` awaits the entire
 * action, including caller-owned success/reset/refetch callbacks; thrown failures
 * retain Error.message or use the supplied fallback. It never retries mutations,
 * closes dialogs, emits toasts, or interprets permissions/session failures.
 * Validation and duplicate-submit guards remain in each form. `reset` clears both
 * fields when its owner resets a dialog; form values are untouched on failure.
 */
export function useAdminMutation(fallback: string) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSubmitting(false);
    setError(null);
  };

  const run = async (action: () => void | Promise<void>) => {
    setSubmitting(true);
    setError(null);
    try {
      await action();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : fallback);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, error, run, reset };
}
