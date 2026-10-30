import { toast } from "sonner";

/**
 * Backend is not connected. Every administrative action is recorded locally
 * only and never changes a genuine record, payment, account or external sync.
 */
export function recordDemoAction(action: string, detail?: string) {
  toast.success(`${action} — recorded in demo mode`, {
    description:
      detail ??
      "No live record was changed. Connect the admin API to execute this action.",
  });
}

export function reportDemoFailure(action: string, detail?: string) {
  toast.error(`${action} failed`, {
    description: detail ?? "The service did not confirm the request.",
  });
}
