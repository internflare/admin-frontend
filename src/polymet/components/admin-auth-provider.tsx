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
import { ADMIN_ROLES, type AdminRoleId, type Permission } from "@/polymet/data/admin-roles";
import { useAdminRole } from "@/polymet/components/admin-role-provider";

export interface SignedInAdmin {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  avatar?: string;
  permissions?: string[];
}

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_S = 30;

type RequestResult = { ok: true } | { ok: false; error: string };
type VerifyResult = { ok: true } | { ok: false; error: string; attemptsLeft: number };

interface AdminAuthContextValue {
  admin: SignedInAdmin | null;
  isLoadingSession: boolean;
  requestCode: (email: string) => Promise<RequestResult>;
  verifyCode: (email: string, code: string) => Promise<VerifyResult>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue>({
  admin: null,
  isLoadingSession: true,
  requestCode: async () => ({ ok: true }),
  verifyCode: async () => ({ ok: true }),
  signOut: () => undefined,
});

/**
 * Live Admin Authentication Provider (Phase 2).
 *
 * Replaces simulated browser timers with real backend authentication endpoints:
 * - Session Hydration: Calls GET /auth/me with credentials: "include" to verify active HTTP-Only cookie.
 * - OTP Dispatch: Calls POST /auth/request-code (delivered exclusively to admin email).
 * - Code Verification: Calls POST /auth/verify-code to establish session.
 * - Sign Out: Calls POST /auth/logout and revokes server/cookie credentials.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { setRoleId, setPermissions } = useAdminRole();
  const [admin, setAdmin] = useState<SignedInAdmin | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const applyRole = useCallback(
    (roleLabel: string, permissions?: string[]) => {
      const role = ADMIN_ROLES.find((r) => r.label === roleLabel);
      if (role) {
        setRoleId(role.id as AdminRoleId);
      }
      if (permissions && Array.isArray(permissions)) {
        setPermissions(permissions as Permission[]);
      }
    },
    [setRoleId, setPermissions],
  );

  // Initial session hydration on app boot via GET /auth/me
  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      try {
        const response = await apiClient.get<{ admin: SignedInAdmin }>("/auth/me", {
          silentErrorToast: true,
        });

        if (isMounted && response?.admin) {
          setAdmin(response.admin);
          applyRole(response.admin.roleLabel, response.admin.permissions);
        }
      } catch {
        if (isMounted) {
          setAdmin(null);
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
      setPermissions(null);
    };

    window.addEventListener("internflare:unauthorized", handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener("internflare:unauthorized", handleUnauthorized);
    };
  }, [applyRole, setPermissions]);

  // Request OTP: Dispatches single-use code to work email
  const requestCode = useCallback(async (rawEmail: string): Promise<RequestResult> => {
    const email = rawEmail.trim().toLowerCase();
    try {
      await apiClient.post("/auth/request-code", { email });
      toast.success("Your OTP has been sent to your email", {
        description: "Please check your inbox for the single-use 6-digit verification code.",
        duration: 7000,
      });
      return { ok: true };
    } catch (err: unknown) {
      let errorMsg = "No administrator account uses this email address.";
      if (err instanceof ApiError) {
        errorMsg = err.data?.message || err.data?.error || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      return { ok: false, error: errorMsg };
    }
  }, []);

  // Verify OTP: Sets HTTP-Only admin_session cookie on 200 OK
  const verifyCode = useCallback(
    async (rawEmail: string, code: string): Promise<VerifyResult> => {
      const email = rawEmail.trim().toLowerCase();
      try {
        const res = await apiClient.post<{ ok: boolean; admin: SignedInAdmin }>("/auth/verify-code", {
          email,
          code,
        });

        const signedIn = res.admin;
        applyRole(signedIn.roleLabel, signedIn.permissions);
        setAdmin(signedIn);
        toast.success("Authentication successful", {
          description: `Welcome back, ${signedIn.name}.`,
          duration: 4000,
        });
        return { ok: true };
      } catch (err: unknown) {
        let attemptsLeft = 0;
        let message = "Invalid code. Please try again.";

        if (err instanceof ApiError) {
          message = err.data?.message || err.data?.error || err.message;
          attemptsLeft = typeof err.data?.attemptsLeft === "number" ? err.data.attemptsLeft : 0;
        } else if (err instanceof Error) {
          message = err.message;
        }

        return { ok: false, error: message, attemptsLeft };
      }
    },
    [applyRole],
  );

  // Sign out: Invalidate session on backend and clear local state
  const signOut = useCallback(() => {
    setAdmin(null);
    setPermissions(null);
    apiClient
      .post("/auth/logout", {}, { silentErrorToast: true })
      .catch(() => {
        /* ignore network failure on logout */
      });
    toast.info("Signed out", { description: "Your administrator session has ended." });
  }, [setPermissions]);

  const value = useMemo(
    () => ({ admin, isLoadingSession, requestCode, verifyCode, signOut }),
    [admin, isLoadingSession, requestCode, verifyCode, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
