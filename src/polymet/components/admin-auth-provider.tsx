import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { apiClient, ApiError } from "@/polymet/lib/api-client";
import {
  ADMIN_ROLES,
  PERMISSION_LABELS,
  type AdminRoleId,
  type Permission,
} from "@/polymet/data/admin-roles";
import { useAdminRole } from "@/polymet/components/admin-role-provider";

export interface SignedInAdmin {
  id: string;
  name: string;
  email: string;
  roleId: AdminRoleId;
  roleLabel: string;
  avatar?: string;
  permissions: Permission[];
}

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_S = 60;

type RequestResult = { ok: true } | { ok: false; error: string };
type VerifyResult =
  | { ok: true }
  | { ok: false; error: string; attemptsLeft?: number; locked: boolean };

interface AdminAuthContextValue {
  admin: SignedInAdmin | null;
  isLoadingSession: boolean;
  requestCode: (email: string) => Promise<RequestResult>;
  verifyCode: (email: string, code: string) => Promise<VerifyResult>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined,
);

function isSignedInAdmin(value: unknown): value is SignedInAdmin {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "email" in value &&
    typeof value.email === "string" &&
    "roleLabel" in value &&
    typeof value.roleLabel === "string" &&
    "roleId" in value &&
    ADMIN_ROLES.some((role) => role.id === value.roleId) &&
    "permissions" in value &&
    Array.isArray(value.permissions) &&
    value.permissions.every(
      (permission: unknown) =>
        typeof permission === "string" &&
        Object.prototype.hasOwnProperty.call(PERMISSION_LABELS, permission),
    )
  );
}

// Provides authentication context for admin users, handling session hydration, OTP requests, verification, and sign-out.
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { setRoleId, setPermissions } = useAdminRole();
  const [admin, setAdmin] = useState<SignedInAdmin | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const applyRole = useCallback(
    (signedIn: SignedInAdmin) => {
      setRoleId(signedIn.roleId);
      setPermissions(signedIn.permissions);
    },
    [setRoleId, setPermissions],
  );

  // Initial session hydration on app boot via GET /auth/me
  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      try {
        const response = await apiClient.get<{ admin: unknown }>("/auth/me", {
          silentErrorToast: true,
        });

        if (!isSignedInAdmin(response?.admin)) {
          throw new Error(
            "The server returned an invalid administrator session.",
          );
        }
        if (isMounted) {
          setAdmin(response.admin);
          applyRole(response.admin);
        }
      } catch (error) {
        if (isMounted) {
          setAdmin(null);
          setPermissions([]);
          if (!(error instanceof ApiError && error.status === 401)) {
            toast.error("Unable to verify your administrator session", {
              description:
                error instanceof Error ? error.message : "Please try again.",
            });
          }
        }
      } finally {
        if (isMounted) {
          setIsLoadingSession(false);
        }
      }
    }

    hydrateSession();

    // Listen to 401 events emitted by apiClient
    const handleUnauthorized = () => {
      setAdmin(null);
      setPermissions([]);
    };

    window.addEventListener("internflare:unauthorized", handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener(
        "internflare:unauthorized",
        handleUnauthorized,
      );
    };
  }, [applyRole, setPermissions]);

  // Request OTP: Dispatches single-use code to work email
  const requestCode = useCallback(
    async (rawEmail: string): Promise<RequestResult> => {
      const email = rawEmail.trim().toLowerCase();
      try {
        const response = await apiClient.post<{
          success: boolean;
          message: string;
        }>("/auth/request-code", { email }, { silentErrorToast: true });
        if (
          response?.success !== true ||
          typeof response.message !== "string"
        ) {
          throw new Error(
            "The server did not confirm the sign-in code request.",
          );
        }
        toast.info("Check your administrator email", {
          description: response.message,
          duration: 7000,
        });
        return { ok: true };
      } catch (err: unknown) {
        let errorMsg = "Unable to request a sign-in code. Please try again.";
        if (err instanceof ApiError) {
          errorMsg = err.data?.message || err.data?.error || err.message;
        } else if (err instanceof Error) {
          errorMsg = err.message;
        }
        return { ok: false, error: errorMsg };
      }
    },
    [],
  );

  // Better Auth sets its HttpOnly session cookie after OTP verification.
  const verifyCode = useCallback(
    async (rawEmail: string, code: string): Promise<VerifyResult> => {
      const email = rawEmail.trim().toLowerCase();
      try {
        const res = await apiClient.post<{ success: boolean; admin: unknown }>(
          "/auth/verify-code",
          {
            email,
            code,
          },
          { silentErrorToast: true },
        );

        const signedIn = res.admin;
        if (res.success !== true || !isSignedInAdmin(signedIn)) {
          throw new Error(
            "The server returned an invalid administrator session.",
          );
        }
        applyRole(signedIn);
        setAdmin(signedIn);
        toast.success("Authentication successful", {
          description: `Welcome back, ${signedIn.name}.`,
          duration: 4000,
        });
        return { ok: true };
      } catch (err: unknown) {
        let attemptsLeft: number | undefined;
        let message = "Invalid code. Please try again.";

        if (err instanceof ApiError) {
          message = err.data?.message || err.data?.error || err.message;
          attemptsLeft =
            typeof err.data?.remainingAttempts === "number"
              ? err.data.remainingAttempts
              : undefined;
        } else if (err instanceof Error) {
          message = err.message;
        }

        return {
          ok: false,
          error: message,
          attemptsLeft,
          locked: err instanceof ApiError && err.status === 429,
        };
      }
    },
    [applyRole],
  );

  // Sign out: Invalidate session on backend and clear local state
  const signOut = useCallback(async () => {
    try {
      await apiClient.post("/auth/sign-out", {});
      setAdmin(null);
      setPermissions([]);
      toast.info("Signed out", {
        description: "Your administrator session has ended.",
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setAdmin(null);
        setPermissions([]);
      }
      // The API client displays logout errors; do not claim server revocation succeeded.
    }
  }, [setPermissions]);

  const value = useMemo(
    () => ({ admin, isLoadingSession, requestCode, verifyCode, signOut }),
    [admin, isLoadingSession, requestCode, verifyCode, signOut],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}
