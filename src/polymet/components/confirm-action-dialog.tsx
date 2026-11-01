import { useState } from "react";
import { AlertTriangleIcon, Loader2Icon, ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { useAdminAuth } from "@/polymet/components/admin-auth-provider";
import { cn } from "@/lib/utils";

export interface ConfirmActionPayload {
  reason: string;
  note: string;
}

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  target?: string;
  consequences?: string[];
  confirmLabel?: string;
  destructive?: boolean;
  requireReason?: boolean;
  reasonOptions?: string[];
  requireAcknowledgement?: boolean;
  onConfirm: (payload: ConfirmActionPayload) => void | Promise<void>;
}

export function ConfirmActionDialog({
  open, onOpenChange, title, description, target, consequences = [], confirmLabel = "Confirm",
  destructive, requireReason = true, reasonOptions, requireAcknowledgement, onConfirm,
}: ConfirmActionDialogProps) {
  const { role } = useAdminRole();
  const { admin } = useAdminAuth();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [ack, setAck] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasonValid = !requireReason || (reasonOptions ? reason.length > 0 : note.trim().length >= 10);
  const canSubmit = reasonValid && (!requireAcknowledgement || ack) && !isSubmitting;

  const reset = () => {
    setReason("");
    setNote("");
    setAck(false);
    setIsSubmitting(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !isSubmitting) {
          reset();
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                destructive ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400" : "bg-accent text-accent-foreground",
              )}
            >
              {destructive ? <AlertTriangleIcon className="size-4" /> : <ShieldAlertIcon className="size-4" />}
            </span>
            <div className="space-y-1 text-left">
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </div>
          </div>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!canSubmit) return;
            setIsSubmitting(true);
            try {
              await onConfirm({ reason, note });
              reset();
              onOpenChange(false);
            } catch {
              // Failed request toast is handled by apiClient; dialog remains open for correction
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {target && (
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
              <span className="text-xs text-muted-foreground">Affected record</span>
              <p className="font-medium">{target}</p>
            </div>
          )}

          {consequences.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">What will happen</p>
              <ul className="space-y-1 text-sm">
                {consequences.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/50" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reasonOptions && (
            <div className="space-y-1.5">
              <Label htmlFor="confirm-reason">Reason{requireReason && <span className="text-red-600"> *</span>}</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="confirm-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="confirm-note">
              {reasonOptions ? "Internal note" : "Reason"}
              {requireReason && !reasonOptions && <span className="text-red-600"> *</span>}
            </Label>
            <Textarea
              id="confirm-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={reasonOptions ? "Optional context for reviewers (internal only)" : "Explain the decision (min. 10 characters). Internal only."}
              rows={3}
            />
          </div>

          {requireAcknowledgement && (
            <label className="flex items-start gap-2 text-sm">
              <Checkbox checked={ack} onCheckedChange={(v) => setAck(v === true)} className="mt-0.5" />
              <span>I understand the impact of this action and have verified the record.</span>
            </label>
          )}

          <p className="text-xs text-muted-foreground">
            Recorded in the audit log as <span className="font-medium text-foreground">{admin?.name ?? "Administrator"}</span> ({role.label}) with timestamp and reason.
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="bg-background"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant={destructive ? "destructive" : "default"} disabled={!canSubmit}>
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
