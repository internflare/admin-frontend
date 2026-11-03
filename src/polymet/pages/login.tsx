import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockIcon, ShieldCheckIcon } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { InternflareLogo } from "@/polymet/layouts/admin-sidebar";
import { useAdminAuth } from "@/polymet/components/admin-auth-provider";
import { LoginCodeStep, LoginEmailStep } from "@/polymet/components/otp-login-steps";
import { SessionSkeleton } from "@/polymet/components/state-views";

export default function LoginPage() {
  const { admin, isLoadingSession, requestCode, verifyCode } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string | null>(null);
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  if (isLoadingSession) {
    return <SessionSkeleton login />;
  }

  if (admin) return <Navigate to={from} replace />;

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-[#1d1d1d] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-[#fd7128]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-[380px] rounded-full bg-[#591e00]/70 blur-3xl" />
        <div className="relative [&_span.text-muted-foreground]:text-white/60">
          <InternflareLogo />
        </div>
        <div className="relative max-w-md space-y-4">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#fd7128]">Ecosystem control centre</p>
          <h2 className="text-3xl font-semibold leading-tight">One console for internflareJobs, SquadCot and the platform behind them.</h2>
          <p className="text-sm text-white/60">Access is limited to active administrator accounts verified against the database.</p>
        </div>
        <ul className="relative space-y-2 text-xs text-white/60">
          <li className="flex items-center gap-2"><ShieldCheckIcon className="size-4 text-[#fd7128]" /> Passwordless sign-in with single-use codes</li>
          <li className="flex items-center gap-2"><LockIcon className="size-4 text-[#fd7128]" /> Role-based access, least privilege by default</li>
        </ul>
      </aside>

      <main className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <InternflareLogo />
          </div>
          {email === null ? (
            <LoginEmailStep
              onSubmit={async (value) => {
                const res = await requestCode(value);
                if (!res.ok) return res.error;
                setEmail(value.trim().toLowerCase());
                return null;
              }}
            />
          ) : (
            <LoginCodeStep
              key={email}
              email={email}
              onBack={() => setEmail(null)}
              onResend={async () => {
                const res = await requestCode(email);
                return res.ok ? null : res.error;
              }}
              onVerify={async (code) => {
                const res = await verifyCode(email, code);
                if (res.ok) {
                  navigate(from, { replace: true });
                  return null;
                }
                return { error: res.error, mustRestart: res.locked || res.attemptsLeft === 0 };
              }}
            />
          )}
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Passwordless Email Delivery</p>
            <p className="mt-0.5 leading-relaxed">
              Single-use 6-digit codes are emailed only after an active administrator account is found in the database. Codes expire after 5 minutes.
            </p>
          </div>
          <p className="text-center text-[11px] text-muted-foreground">Need access? Ask a super administrator to send you an invitation.</p>
        </div>
      </main>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}
