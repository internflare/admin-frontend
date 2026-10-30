import { forwardRef, useState, type ReactNode } from "react";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAdminRole } from "@/polymet/components/admin-role-provider";
import { AccessDenied } from "@/polymet/components/state-views";
import { PERMISSION_LABELS, type Permission } from "@/polymet/data/admin-roles";
import { recordDemoAction } from "@/polymet/lib/demo-actions";

/** Page-level guard. UI only — the backend must enforce the same rule. */
export function PermissionGuard({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can, role } = useAdminRole();
  if (!can(permission)) {
    return <AccessDenied permissionLabel={PERMISSION_LABELS[permission]} roleLabel={role.label} />;
  }
  return <>{children}</>;
}

interface PermissionButtonProps extends ButtonProps {
  permission: Permission;
}

/** Button that is disabled with an explanation when the role lacks permission. */
export const PermissionButton = forwardRef<HTMLButtonElement, PermissionButtonProps>(
  ({ permission, children, disabled, ...props }, ref) => {
    const { can } = useAdminRole();
    const allowed = can(permission);
    if (allowed) {
      return (
        <Button ref={ref} disabled={disabled} {...props}>
          {children}
        </Button>
      );
    }
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Button ref={ref} {...props} disabled aria-disabled className={props.className}>
              <LockIcon className="mr-1.5 size-3.5" />
              {children}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Requires “{PERMISSION_LABELS[permission]}”</TooltipContent>
      </Tooltip>
    );
  },
);
PermissionButton.displayName = "PermissionButton";

/** Restricted value; authorised admins can reveal it, and the reveal is audited. */
export function MaskedValue({
  value,
  masked,
  permission,
  label = "value",
}: {
  value: string;
  masked: string;
  permission: Permission;
  label?: string;
}) {
  const { can } = useAdminRole();
  const [revealed, setRevealed] = useState(false);
  if (!can(permission)) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
        <LockIcon className="size-3" /> {masked}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-xs">{revealed ? value : masked}</span>
      <button
        type="button"
        className="rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={revealed ? `Hide ${label}` : `Reveal ${label}`}
        onClick={() => {
          if (!revealed) recordDemoAction(`Revealed ${label}`, "Reveal of restricted data is written to the audit log.");
          setRevealed((r) => !r);
        }}
      >
        {revealed ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
      </button>
    </span>
  );
}
