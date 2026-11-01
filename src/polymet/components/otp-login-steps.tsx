import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeftIcon, ArrowRightIcon, Loader2Icon, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { OTP_LENGTH, OTP_RESEND_COOLDOWN_S } from "@/polymet/components/admin-auth-provider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function maskEmail(val: string): string {
  const [local, domain] = val.split("@");
  if (!domain) return val;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}***${local.slice(-1)}@${domain}`;
}

interface EmailStepProps {
  defaultEmail?: string;
  onSubmit: (email: string) => Promise<string | null>;
}

export function LoginEmailStep({ defaultEmail = "", onSubmit }: EmailStepProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    setError(null);
    const err = await onSubmit(email);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Internflare Admin</h1>
        <p className="text-sm text-muted-foreground">Enter your work email and we'll send you a one-time sign-in code.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Work email</Label>
        <div className="relative">
          <MailIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="name@internflare.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? "email-error" : undefined}
            className="h-11 pl-9"
            disabled={loading}
          />
        </div>
        {error && (
          <p id="email-error" role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" className="h-11 w-full" disabled={loading || !email.trim()}>
        {loading ? <Loader2Icon className="size-4 animate-spin" /> : <>Send code <ArrowRightIcon className="size-4" /></>}
      </Button>
    </form>
  );
}

interface CodeStepProps {
  email: string;
  onVerify: (code: string) => Promise<{ error: string; mustRestart: boolean } | null>;
  onResend: () => Promise<string | null>;
  onBack: () => void;
}

export function LoginCodeStep({ email, onVerify, onResend, onBack }: CodeStepProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(OTP_RESEND_COOLDOWN_S);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const verify = async (value: string) => {
    if (value.length !== OTP_LENGTH || verifying) return;
    setVerifying(true);
    setError(null);
    const result = await onVerify(value);
    setVerifying(false);
    if (result) {
      setError(result.error);
      setLocked(result.mustRestart);
      setCode("");
    }
  };

  const resend = async () => {
    setResending(true);
    const err = await onResend();
    setResending(false);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setLocked(false);
    setCode("");
    setCooldown(OTP_RESEND_COOLDOWN_S);
  };

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        verify(code);
      }}
    >
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-3.5" /> Use a different email
      </button>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a {OTP_LENGTH}-digit code to <span className="font-medium text-foreground">{maskEmail(email)}</span>. It expires in 10 minutes.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="otp">Sign-in code</Label>
        <InputOTP
          id="otp"
          maxLength={OTP_LENGTH}
          value={code}
          onChange={(v) => {
            setCode(v.replace(/\D/g, ""));
            if (error && !locked) setError(null);
          }}
          onComplete={verify}
          disabled={verifying || locked}
          autoFocus
          inputMode="numeric"
          pattern="^[0-9]*$"
          containerClassName="justify-between"
        >
          <InputOTPGroup className="w-full justify-between gap-2">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className="h-12 w-full max-w-12 rounded-md border text-lg font-semibold first:rounded-md last:rounded-md data-[active=true]:ring-primary"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
      <Button type="submit" className="h-11 w-full" disabled={code.length !== OTP_LENGTH || verifying || locked}>
        {verifying ? <Loader2Icon className="size-4 animate-spin" /> : "Verify and sign in"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Didn't get it?{" "}
        {cooldown > 0 ? (
          <span>Resend in {cooldown}s</span>
        ) : (
          <button type="button" onClick={resend} disabled={resending} className="font-medium text-primary hover:underline disabled:opacity-50">
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
      </p>
    </form>
  );
}
