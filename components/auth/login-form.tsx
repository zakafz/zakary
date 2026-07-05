"use client";

import { ArrowLeftIcon, AtSignIcon, Loader2Icon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase();
const OTP_LENGTH = 6;
const OTP_SLOTS = Array.from({ length: OTP_LENGTH }, (_, i) => `otp-slot-${i}`);

type Step = "email" | "otp";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError("Enter your email address.");
      return;
    }
    // Soft client-side allowlist check; the hard gate lives in middleware.
    if (ADMIN_EMAIL && normalized !== ADMIN_EMAIL) {
      setError("This email isn't authorized.");
      return;
    }

    setLoading(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { shouldCreateUser: false },
    });
    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }
    setCode("");
    setStep("otp");
  }

  async function verifyCode(value: string) {
    setError(null);
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: value,
      type: "email",
    });

    if (verifyError) {
      setLoading(false);
      setCode("");
      setError(verifyError.message);
      return;
    }

    // Session cookie is set; let the server pick it up and route in.
    router.replace(redirectTo);
    router.refresh();
  }

  function onCodeChange(value: string) {
    setCode(value);
    if (value.length === OTP_LENGTH) {
      verifyCode(value);
    }
  }

  return (
    <div className="relative w-full overflow-hidden md:h-screen">
      <div
        className={cn(
          "relative mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col justify-between p-6 md:p-8"
        )}
      >
        <div className="flex justify-center pt-4">
          <div className="flex h-full items-center justify-center">
            <div className="group relative flex cursor-pointer items-center justify-center bg-primary p-2 pt-1 font-medium font-serif text-primary-foreground">
              <div className="text-lg italic">zakary</div>
              <div className="-bottom-3 absolute border border-border bg-accent px-0.5 text-primary text-sm">
                fofana
              </div>
            </div>
          </div>
        </div>

        <div className="fade-in slide-in-from-bottom-4 w-full animate-in space-y-3 duration-500">
          {step === "email" ? (
            <>
              <h1 className="font-bold text-2xl tracking-tight">
                Admin access
              </h1>
              <form className="space-y-3" onSubmit={sendCode}>
                <InputGroup>
                  <InputGroupInput
                    autoComplete="email"
                    autoFocus
                    inputMode="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                  />
                  <InputGroupAddon align="inline-start">
                    <AtSignIcon />
                  </InputGroupAddon>
                </InputGroup>

                <Button className="w-full" disabled={loading} type="submit">
                  {loading ? <Loader2Icon className="animate-spin" /> : null}
                  Continue with email
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex flex-col space-y-1">
                <h1 className="font-bold text-2xl tracking-tight">
                  Enter your code
                </h1>
                <p className="text-base text-muted-foreground">
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <InputOTP
                  autoFocus
                  containerClassName="w-full"
                  disabled={loading}
                  maxLength={OTP_LENGTH}
                  onChange={onCodeChange}
                  value={code}
                >
                  <InputOTPGroup className="w-full gap-2">
                    {OTP_SLOTS.map((slot, i) => (
                      <InputOTPSlot
                        className="h-14 flex-1 rounded-md border-l font-medium text-lg first:rounded-l-md last:rounded-r-md"
                        index={i}
                        key={slot}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>

                {loading ? (
                  <p className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2Icon className="size-4 animate-spin" /> Verifying…
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  disabled={loading}
                  onClick={() => sendCode()}
                  type="button"
                  variant="outline"
                >
                  Resend code
                </Button>
                <Button
                  className="w-full text-muted-foreground"
                  disabled={loading}
                  onClick={() => {
                    setStep("email");
                    setError(null);
                    setCode("");
                  }}
                  type="button"
                  variant="ghost"
                >
                  <ArrowLeftIcon /> Use a different email
                </Button>
              </div>
            </>
          )}

          {error ? (
            <p className="text-center text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <p className="text-center text-muted-foreground text-xs">
          Restricted area. Access is limited to authorized accounts.
        </p>
      </div>
    </div>
  );
}
