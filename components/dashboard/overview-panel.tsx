"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Cycle = "weekly" | "monthly" | "yearly";

const TO_MONTHLY: Record<Cycle, number> = {
  weekly: 52 / 12,
  monthly: 1,
  yearly: 1 / 12,
};

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

type Stats = {
  spent: number;
  subsMonthly: number;
  subsCount: number;
  activeTasks: number;
  passwords: number;
};

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border border-border p-4">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span className="font-semibold text-2xl tabular-nums">{value}</span>
      {sub ? (
        <span className="text-muted-foreground text-sm">{sub}</span>
      ) : null}
    </div>
  );
}

export function OverviewPanel() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase
        .from("transactions")
        .select("amount")
        .eq("type", "purchase")
        .gte("date", monthStart()),
      supabase.from("subscriptions").select("amount, cycle"),
      supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("done", false),
      supabase.from("passwords").select("*", { count: "exact", head: true }),
    ]).then(([txnRes, subRes, taskRes, pwRes]) => {
      if (!active) {
        return;
      }
      const spent = ((txnRes.data ?? []) as { amount: number }[]).reduce(
        (acc, r) => acc + Math.abs(r.amount),
        0
      );
      const subs = (subRes.data ?? []) as { amount: number; cycle: Cycle }[];
      const subsMonthly = subs.reduce(
        (acc, s) => acc + s.amount * TO_MONTHLY[s.cycle],
        0
      );
      setStats({
        spent,
        subsMonthly,
        subsCount: subs.length,
        activeTasks: taskRes.count ?? 0,
        passwords: pwRes.count ?? 0,
      });
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  if (!stats) {
    return (
      <p className="mt-6 py-12 text-center text-muted-foreground text-sm">
        Loading…
      </p>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <StatCard
        label="Spent this month"
        sub={new Date().toLocaleDateString("en-CA", { month: "long" })}
        value={currency.format(stats.spent)}
      />
      <StatCard
        label="Subscriptions"
        sub={`${stats.subsCount} active`}
        value={`${currency.format(stats.subsMonthly)}/mo`}
      />
      <StatCard
        label="Active tasks"
        sub="to do"
        value={String(stats.activeTasks)}
      />
      <StatCard
        label="Passwords"
        sub="in vault"
        value={String(stats.passwords)}
      />
    </div>
  );
}
