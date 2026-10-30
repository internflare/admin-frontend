import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ADMIN_ROLES, CURRENT_ADMIN, type AdminRoleId } from "@/polymet/data/admin-roles";
import { ADMIN_USERS } from "@/polymet/data/dashboard-data";
import { useAdminRole } from "@/polymet/components/admin-role-provider";

export interface SignedInAdmin {
  id: string;
  name: string;
  email: string;
  roleLabel: string;
  avatar?: string;
}

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_S = 30;

type RequestResult = { ok: true } | { ok: false; error: string };
type VerifyResult = { ok: true } | { ok: false; error: string; attemptsLeft: number };

interface AdminAuthContextValue {
  admin: SignedInAdmin | null;
  requestCode: (email: string) => Promise<RequestResult>;
  verifyCode: (email: string, code: string) => Promise<VerifyResult>;
  signOut: () => void;
}

const DEFAULT_ADMIN: SignedInAdmin = { ...CURRENT_ADMIN, roleLabel: ADMIN_ROLES[0].label };

/** Default context keeps standalone page previews signed in. */
const AdminAuthContext = createContext<AdminAuthContextValue>({
  admin: DEFAULT_ADMIN,
  requestCode: async () => ({ ok: true }),
  verifyCode: async () => ({ ok: true }),
  signOut: () => undefined,
});

const STORAGE_KEY = "internflare-admin-session";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readSession(): SignedInAdmin | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SignedInAdmin) : null;
  } catch {
    return null;
  }
}

/**
 * Demo OTP flow. Codes are generated in the browser and shown in a toast
 * because no email service is connected. In production the backend issues,
 * hashes, emails and verifies the code; the client never sees it.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { setRoleId } = useAdminRole();
  const [admin, setAdmin] = useState<SignedInAdmin | null>(() => readSession());
  const pending = useRef<{ email: string; code: string; expiresAt: number; attempts: number } | null>(null);

  const applyRole = useCallback(
    (roleLabel: string) => {
      const role = ADMIN_ROLES.find((r) => r.label === roleLabel);
      if (role) setRoleId(role.id as AdminRoleId);
    },
    [setRoleId],
  );

  // Restore the role of a session persisted from an earlier page load.
  useEffect(() => {
    if (admin) applyRole(admin.roleLabel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestCode = useCallback(async (rawEmail: string): Promise<RequestResult> => {
    const email = rawEmail.trim().toLowerCase();
    await wait(700);
    const account = ADMIN_USERS.find((a) => a.email.toLowerCase() === email);
    if (!account) return { ok: false, error: "No administrator account uses this email address." };
    if (account.status !== "Active") return { ok: false, error: "This admin invitation hasn't been accepted yet. Check your inbox for the invite." };
    const code = Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10)).join("");
    pending.current = { email, code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 };
    toast.info(`Demo mode — your code is ${code}`, {
      description: `Email delivery isn't connected, so the code for ${email} is shown here.`,
      duration: 20000,
    });
    return { ok: true };
  }, []);

  const verifyCode = useCallback(
    async (rawEmail: string, code: string): Promise<VerifyResult> => {
      const email = rawEmail.trim().toLowerCase();
      await wait(600);
      const p = pending.current;
      if (!p || p.email !== email) return { ok: false, error: "Request a new code to continue.", attemptsLeft: 0 };
      if (Date.now() > p.expiresAt) {
        pending.current = null;
        return { ok: false, error: "This code has expired. Request a new one.", attemptsLeft: 0 };
      }
      if (p.code !== code) {
        p.attempts += 1;
        const attemptsLeft = OTP_MAX_ATTEMPTS - p.attempts;
        if (attemptsLeft <= 0) {
          pending.current = null;
          return { ok: false, error: "Too many incorrect attempts. Request a new code.", attemptsLeft: 0 };
        }
        return { ok: false, error: `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left.`, attemptsLeft };
      }
      pending.current = null;
      const account = ADMIN_USERS.find((a) => a.email.toLowerCase() === email)!;
      const signedIn: SignedInAdmin = {
        id: account.id,
        name: account.name,
        email: account.email,
        roleLabel: account.role,
        avatar: account.id === CURRENT_ADMIN.id ? CURRENT_ADMIN.avatar : undefined,
      };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(signedIn));
      } catch {
        /* storage unavailable — session lasts for this tab only */
      }
      applyRole(account.role);
      setAdmin(signedIn);
      return { ok: true };
    },
    [applyRole],
  );

  const signOut = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    pending.current = null;
    setAdmin(null);
  }, []);

  const value = useMemo(() => ({ admin, requestCode, verifyCode, signOut }), [admin, requestCode, verifyCode, signOut]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
