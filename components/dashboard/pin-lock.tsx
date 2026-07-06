"use client";

import { DeleteIcon, LockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A soft PIN gate over the dashboard. NOTE: this is not real security — the PIN
 * lives in the client bundle and can be bypassed by a technical user. Real
 * access control is the Supabase login. This just keeps casual eyes out.
 *
 * Unlock is remembered for the browser-tab session, so a reload stays unlocked
 * but a fresh open of the app asks again.
 */
const PIN = "3080";
const SESSION_KEY = "dashboard-unlocked";
const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const DOTS = ["a", "b", "c", "d"];

function dotClass(error: boolean, filled: boolean) {
  if (error) {
    return "border-destructive bg-destructive";
  }
  if (filled) {
    return "border-foreground bg-foreground";
  }
  return "border-muted-foreground/40";
}

export function PinLock({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  function press(digit: string) {
    if (error || entry.length >= 4) {
      return;
    }
    const next = entry + digit;
    setEntry(next);
    if (next.length < 4) {
      return;
    }
    if (next === PIN) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
      window.setTimeout(() => {
        setEntry("");
        setError(false);
      }, 600);
    }
  }

  function back() {
    if (error) {
      return;
    }
    setEntry((prev) => prev.slice(0, -1));
  }

  // Avoid a hydration flash before we know the session state.
  if (!mounted) {
    return null;
  }
  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-background px-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <LockIcon className="size-7 text-muted-foreground" />
        <h1 className="font-serif text-2xl italic">Locked</h1>
        <p className="text-muted-foreground text-sm">
          {error ? "Wrong PIN, try again" : "Enter your PIN to continue"}
        </p>
      </div>

      <div className="flex gap-4">
        {DOTS.map((id, i) => (
          <span
            className={cn(
              "size-3.5 rounded-none border transition-colors",
              dotClass(error, i < entry.length)
            )}
            key={id}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {DIGITS.map((d) => (
          <button
            className="flex size-16 items-center justify-center rounded-none border border-border font-medium text-2xl tabular-nums transition-colors hover:bg-secondary active:bg-secondary/70"
            key={d}
            onClick={() => press(d)}
            type="button"
          >
            {d}
          </button>
        ))}
        <div aria-hidden className="size-16" />
        <button
          className="flex size-16 items-center justify-center rounded-none border border-border font-medium text-2xl tabular-nums transition-colors hover:bg-secondary active:bg-secondary/70"
          onClick={() => press("0")}
          type="button"
        >
          0
        </button>
        <button
          aria-label="Delete last digit"
          className="flex size-16 items-center justify-center rounded-none text-muted-foreground transition-colors hover:text-foreground active:bg-secondary/70"
          onClick={back}
          type="button"
        >
          <DeleteIcon className="size-6" />
        </button>
      </div>
    </div>
  );
}
