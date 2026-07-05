"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type TransactionCategory } from "@/data/finance";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Period = "weekly" | "monthly" | "yearly";

type Budget = { amount: number; period: Period };

const PERIODS: { id: Period; label: string; short: string }[] = [
  { id: "weekly", label: "Weekly", short: "wk" },
  { id: "monthly", label: "Monthly", short: "mo" },
  { id: "yearly", label: "Yearly", short: "yr" },
];

const PERIOD_SHORT: Record<Period, string> = {
  weekly: "wk",
  monthly: "mo",
  yearly: "yr",
};

const CAT_COLOR: Record<TransactionCategory, string> = {
  shopping: "#a78bfa",
  transportation: "#38bdf8",
  food: "#fbbf24",
  bills: "#34d399",
};

const OVER_COLOR = "#f87171";

// Normalise any budget period to a monthly figure for the summary.
const TO_MONTHLY: Record<Period, number> = {
  weekly: 52 / 12,
  monthly: 1,
  yearly: 1 / 12,
};

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

function isoLocal(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function periodStart(period: Period) {
  const d = new Date();
  if (period === "weekly") {
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  } else if (period === "monthly") {
    d.setDate(1);
  } else {
    d.setMonth(0, 1);
  }
  return isoLocal(d);
}

const yearStart = () => `${new Date().getFullYear()}-01-01`;

type Purchase = {
  amount: number;
  category: TransactionCategory | null;
  date: string;
};

const DEFAULT_BUDGETS: Record<TransactionCategory, Budget> = {
  shopping: { amount: 0, period: "weekly" },
  transportation: { amount: 0, period: "weekly" },
  food: { amount: 0, period: "weekly" },
  bills: { amount: 0, period: "monthly" },
};

export function BudgetPanel() {
  const supabase = createClient();
  const [budgets, setBudgets] =
    useState<Record<TransactionCategory, Budget>>(DEFAULT_BUDGETS);
  const [drafts, setDrafts] = useState<Record<TransactionCategory, string>>({
    shopping: "",
    transportation: "",
    food: "",
    bills: "",
  });
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("budgets").select("category, amount, period"),
      supabase
        .from("transactions")
        .select("amount, category, date")
        .eq("type", "purchase")
        .gte("date", yearStart()),
    ]).then(([budgetRes, txnRes]) => {
      if (!active) {
        return;
      }
      const next = { ...DEFAULT_BUDGETS };
      const nextDrafts: Record<TransactionCategory, string> = {
        shopping: "",
        transportation: "",
        food: "",
        bills: "",
      };
      for (const row of (budgetRes.data ?? []) as {
        category: TransactionCategory;
        amount: number;
        period: Period;
      }[]) {
        next[row.category] = {
          amount: Number(row.amount),
          period: row.period,
        };
        nextDrafts[row.category] = row.amount ? String(row.amount) : "";
      }
      setBudgets(next);
      setDrafts(nextDrafts);
      setPurchases((txnRes.data ?? []) as Purchase[]);
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  async function save(category: TransactionCategory, budget: Budget) {
    setBudgets((prev) => ({ ...prev, [category]: budget }));
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return;
    }
    await supabase.from("budgets").upsert(
      {
        user_id: user.id,
        category,
        amount: budget.amount,
        period: budget.period,
      },
      { onConflict: "user_id,category" }
    );
  }

  function usedFor(category: TransactionCategory, period: Period) {
    const start = periodStart(period);
    return purchases
      .filter((p) => p.category === category && p.date >= start)
      .reduce((acc, p) => acc + Math.abs(p.amount), 0);
  }

  const monthlyBudget = CATEGORIES.reduce(
    (acc, c) => acc + budgets[c.id].amount * TO_MONTHLY[budgets[c.id].period],
    0
  );
  const monthStart = periodStart("monthly");
  const spentThisMonth = purchases
    .filter((p) => p.date >= monthStart)
    .reduce((acc, p) => acc + Math.abs(p.amount), 0);
  const remaining = monthlyBudget - spentThisMonth;
  const overBudget = remaining < 0;
  const usedPct =
    monthlyBudget > 0
      ? Math.min(100, (spentThisMonth / monthlyBudget) * 100)
      : 0;

  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="flex flex-col gap-3 border border-border p-4">
        <div className="flex items-end justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">
              Monthly budget
            </span>
            <span className="font-semibold text-3xl tabular-nums">
              {currency.format(monthlyBudget)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">
              {overBudget ? "Over by" : "Left this month"}
            </span>
            <span
              className={cn(
                "font-semibold text-xl tabular-nums",
                overBudget ? "text-destructive" : "text-success"
              )}
            >
              {currency.format(Math.abs(remaining))}
            </span>
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-[width]"
            style={{
              width: `${usedPct}%`,
              backgroundColor: overBudget ? OVER_COLOR : "var(--primary)",
            }}
          />
        </div>

        <span className="text-muted-foreground text-sm tabular-nums">
          {currency.format(spentThisMonth)} spent this month
        </span>
      </div>

      {CATEGORIES.map((c) => {
        const budget = budgets[c.id];
        const used = usedFor(c.id, budget.period);
        const over = budget.amount > 0 && used > budget.amount;
        const pct =
          budget.amount > 0 ? Math.min(100, (used / budget.amount) * 100) : 0;
        const color = over ? OVER_COLOR : CAT_COLOR[c.id];

        return (
          <div
            className="flex flex-col gap-2.5 border border-border p-4"
            key={c.id}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: CAT_COLOR[c.id] }}
                />
                <span className="font-medium text-sm">{c.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-muted-foreground">$</span>
                  <input
                    className="w-14 bg-transparent text-right tabular-nums outline-none placeholder:text-muted-foreground/50"
                    inputMode="decimal"
                    onBlur={(e) =>
                      save(c.id, {
                        amount: Math.max(
                          0,
                          Number.parseFloat(e.target.value) || 0
                        ),
                        period: budget.period,
                      })
                    }
                    onChange={(e) =>
                      setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                    placeholder="0"
                    value={drafts[c.id]}
                  />
                </div>
                <Select
                  onValueChange={(v) =>
                    save(c.id, { amount: budget.amount, period: v as Period })
                  }
                  value={budget.period}
                >
                  <SelectTrigger
                    aria-label="Recurrence"
                    className="h-7 w-auto rounded-none border-border px-2 text-xs"
                  >
                    <SelectValue>/{PERIOD_SHORT[budget.period]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    {PERIODS.map((p) => (
                      <SelectItem
                        className="rounded-none"
                        key={p.id}
                        value={p.id}
                      >
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-[width]"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground tabular-nums">
                {currency.format(used)} spent this {budget.period.slice(0, -2)}
              </span>
              {budget.amount > 0 ? (
                <span
                  className={cn(
                    "tabular-nums",
                    over ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {over
                    ? `${currency.format(used - budget.amount)} over`
                    : `${currency.format(budget.amount - used)} left`}
                </span>
              ) : (
                <span className="text-muted-foreground">No budget set</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
