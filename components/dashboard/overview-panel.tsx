"use client";

import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CalendarClockIcon,
  WalletIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart/chart";
import { CATEGORIES, type TransactionCategory } from "@/data/finance";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Cycle = "weekly" | "monthly" | "yearly";
type Period = "weekly" | "monthly" | "yearly";
type Slice = TransactionCategory | "other";

const TO_MONTHLY: Record<Cycle, number> = {
  weekly: 52 / 12,
  monthly: 1,
  yearly: 1 / 12,
};

const SLICE_COLOR: Record<Slice, string> = {
  shopping: "#a78bfa",
  transportation: "#38bdf8",
  food: "#fbbf24",
  bills: "#34d399",
  other: "#a1a1aa",
};

const SLICE_LABEL: Record<Slice, string> = {
  shopping: "Shopping",
  transportation: "Transportation",
  food: "Food & Drink",
  bills: "Bills",
  other: "Other",
};

const CATEGORY_ORDER: Slice[] = [...CATEGORIES.map((c) => c.id), "other"];

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

/** Every day of the current month, oldest first. */
function currentMonthDays() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const count = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => {
    const day = i + 1;
    return { key: `${y}-${pad(m + 1)}-${pad(day)}`, day };
  });
}

const ADVANCE: Record<Cycle, (d: Date) => Date> = {
  weekly: (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7),
  monthly: (d) => new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()),
  yearly: (d) => new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()),
};

/** Roll a (possibly past) billing date forward to its next occurrence. */
function nextOccurrence(iso: string, cycle: Cycle): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let date = new Date(`${iso}T00:00:00`);
  while (date < today) {
    date = ADVANCE[cycle](date);
  }
  return date;
}

function daysUntil(date: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
}

function dueLabel(days: number) {
  if (days <= 0) {
    return "Today";
  }
  if (days === 1) {
    return "Tomorrow";
  }
  return `in ${days} days`;
}

type Txn = { amount: number; category: Slice | null; date: string };
type Sub = {
  name: string;
  amount: number;
  cycle: Cycle;
  next_billing: string | null;
};
type Budget = { category: TransactionCategory; amount: number; period: Period };

type NextPayment = { name: string; amount: number; date: Date; days: number };
type CategoryLine = { slice: Slice; spent: number; budget: number };

type Data = {
  thisMonth: number;
  lastMonth: number;
  subsMonthly: number;
  trend: { key: string; day: number; total: number }[];
  nextPayment: NextPayment | null;
  categories: CategoryLine[];
};

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col border border-border p-4", className)}>
      {children}
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
      {children}
    </span>
  );
}

function SpentCard({ data }: { data: Data }) {
  const delta = data.thisMonth - data.lastMonth;
  const up = delta > 0;
  const pct =
    data.lastMonth > 0 ? Math.round((delta / data.lastMonth) * 100) : null;
  return (
    <Card>
      <Heading>Spent this month</Heading>
      <span className="mt-1 font-semibold text-3xl tabular-nums">
        {money.format(data.thisMonth)}
      </span>
      {data.lastMonth > 0 ? (
        <span
          className={cn(
            "mt-1 inline-flex items-center gap-1 text-sm",
            up ? "text-destructive" : "text-success"
          )}
        >
          {up ? (
            <ArrowUpRightIcon className="size-4" />
          ) : (
            <ArrowDownRightIcon className="size-4" />
          )}
          {pct === null ? money.format(Math.abs(delta)) : `${Math.abs(pct)}%`}
          <span className="text-muted-foreground">vs last month</span>
        </span>
      ) : (
        <span className="mt-1 text-muted-foreground text-sm">
          {new Date().toLocaleDateString("en-CA", { month: "long" })}
        </span>
      )}
    </Card>
  );
}

function NextPaymentCard({ data }: { data: Data }) {
  const next = data.nextPayment;
  return (
    <Card>
      <Heading>Next payment</Heading>
      {next ? (
        <>
          <div className="mt-1 flex items-center gap-2">
            <CalendarClockIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-semibold text-lg">
              {next.name}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="font-semibold text-2xl tabular-nums">
              {money.format(next.amount)}
            </span>
            <span className="text-muted-foreground text-sm">
              {dueLabel(next.days)}
            </span>
          </div>
          <span className="mt-1 text-muted-foreground text-xs">
            {next.date.toLocaleDateString("en-CA", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            {" · "}
            {money.format(data.subsMonthly)}/mo total
          </span>
        </>
      ) : (
        <span className="mt-2 text-muted-foreground text-sm">
          No upcoming subscriptions.
        </span>
      )}
    </Card>
  );
}

const trendConfig = {
  cumulative: { label: "Spent", color: "var(--primary)" },
} satisfies ChartConfig;

function TrendChart({ data }: { data: Data }) {
  const today = new Date().getDate();
  const monthLabel = new Date().toLocaleDateString("en-CA", { month: "long" });

  // Running total through today; future days are left out so the line ends
  // at "spent so far this month" instead of flat-lining to the month's end.
  let running = 0;
  const points = data.trend
    .filter((d) => d.day <= today)
    .map((d) => {
      running += d.total;
      return { day: d.day, cumulative: running };
    });
  const total = running;
  const lastDay = data.trend.at(-1)?.day ?? 30;
  const ticks = [1, 5, 10, 15, 20, 25, lastDay].filter((t) => t <= lastDay);

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <Heading>Spent this month</Heading>
        <span className="text-muted-foreground text-xs">{monthLabel}</span>
      </div>
      <span className="mt-1 font-semibold text-2xl tabular-nums">
        {money.format(total)}
      </span>
      <ChartContainer className="mt-2 h-40 w-full" config={trendConfig}>
        <AreaChart
          data={points}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <CartesianGrid horizontal={false} vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="day"
            domain={[1, lastDay]}
            fontSize={10}
            interval="preserveStartEnd"
            tickLine={false}
            tickMargin={8}
            ticks={ticks}
            type="number"
          />
          <YAxis domain={[0, "dataMax"]} hide />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => money.format(Number(value))}
                labelFormatter={(v) => `${monthLabel} ${v}`}
              />
            }
          />
          <Area
            dataKey="cumulative"
            fill="var(--primary)"
            fillOpacity={0.15}
            stroke="var(--primary)"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  );
}

function CategoryBars({ data }: { data: Data }) {
  return (
    <Card>
      <Heading>This month by category</Heading>
      <div className="mt-4 flex flex-col gap-3">
        {data.categories.map((c) => {
          const hasBudget = c.budget > 0;
          const ratio = hasBudget ? c.spent / c.budget : 0;
          const over = hasBudget ? c.spent > c.budget : false;
          return (
            <div className="flex flex-col gap-1.5" key={c.slice}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0"
                    style={{ backgroundColor: SLICE_COLOR[c.slice] }}
                  />
                  {SLICE_LABEL[c.slice]}
                </span>
                <span className="tabular-nums">
                  <span className={over ? "text-destructive" : ""}>
                    {money.format(c.spent)}
                  </span>
                  {hasBudget ? (
                    <span className="text-muted-foreground">
                      {" / "}
                      {money.format(c.budget)}
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(hasBudget ? ratio * 100 : 100, 100)}%`,
                    backgroundColor: over ? "#f87171" : SLICE_COLOR[c.slice],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function aggregate(
  txns: Txn[],
  days: { key: string }[],
  currentKey: string,
  prevKey: string
) {
  const dailyTotals = new Map(days.map((d) => [d.key, 0]));
  const monthByCategory = new Map<Slice, number>();
  let thisMonth = 0;
  let lastMonth = 0;
  for (const t of txns) {
    const key = t.date.slice(0, 7);
    const value = Math.abs(t.amount);
    if (key === currentKey) {
      thisMonth += value;
      if (dailyTotals.has(t.date)) {
        dailyTotals.set(t.date, (dailyTotals.get(t.date) ?? 0) + value);
      }
      const slice: Slice = t.category ?? "other";
      monthByCategory.set(slice, (monthByCategory.get(slice) ?? 0) + value);
    } else if (key === prevKey) {
      lastMonth += value;
    }
  }
  return { dailyTotals, monthByCategory, thisMonth, lastMonth };
}

function categoryLines(
  monthByCategory: Map<Slice, number>,
  budgets: Budget[]
): CategoryLine[] {
  const budgetByCategory = new Map<Slice, number>(
    budgets.map((b) => [b.category, b.amount * TO_MONTHLY[b.period]])
  );
  return CATEGORY_ORDER.map((slice) => ({
    slice,
    spent: monthByCategory.get(slice) ?? 0,
    budget: budgetByCategory.get(slice) ?? 0,
  })).filter((c) => c.spent > 0 || c.budget > 0);
}

function soonestPayment(subs: Sub[]): NextPayment | null {
  let next: NextPayment | null = null;
  for (const s of subs) {
    if (!s.next_billing) {
      continue;
    }
    const date = nextOccurrence(s.next_billing, s.cycle);
    if (!next || date < next.date) {
      next = { name: s.name, amount: s.amount, date, days: daysUntil(date) };
    }
  }
  return next;
}

function computeData(txns: Txn[], subs: Sub[], budgets: Budget[]): Data {
  const now = new Date();
  const currentKey = monthKey(now);
  const prevKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const days = currentMonthDays();
  const { dailyTotals, monthByCategory, thisMonth, lastMonth } = aggregate(
    txns,
    days,
    currentKey,
    prevKey
  );

  return {
    thisMonth,
    lastMonth,
    subsMonthly: subs.reduce(
      (acc, s) => acc + s.amount * TO_MONTHLY[s.cycle],
      0
    ),
    trend: days.map((d) => ({ ...d, total: dailyTotals.get(d.key) ?? 0 })),
    nextPayment: soonestPayment(subs),
    categories: categoryLines(monthByCategory, budgets),
  };
}

function isEmpty(data: Data) {
  return (
    data.thisMonth === 0 &&
    data.trend.every((m) => m.total === 0) &&
    !data.nextPayment
  );
}

function EmptyOverview() {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <WalletIcon className="size-8 text-muted-foreground" />
      <p className="font-medium">Nothing to show yet</p>
      <p className="text-muted-foreground text-sm">
        Add transactions and subscriptions to see your summary here.
      </p>
    </div>
  );
}

export function OverviewPanel() {
  const supabase = createClient();
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    let active = true;
    const now = new Date();
    const since = `${monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1))}-01`;
    Promise.all([
      supabase
        .from("transactions")
        .select("amount, category, date")
        .eq("type", "purchase")
        .gte("date", since),
      supabase
        .from("subscriptions")
        .select("name, amount, cycle, next_billing"),
      supabase.from("budgets").select("category, amount, period"),
    ]).then(([txnRes, subRes, budgetRes]) => {
      if (!active) {
        return;
      }
      setData(
        computeData(
          (txnRes.data ?? []) as Txn[],
          (subRes.data ?? []) as Sub[],
          (budgetRes.data ?? []) as Budget[]
        )
      );
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  if (!data) {
    return (
      <p className="py-12 text-center text-muted-foreground text-sm">
        Loading…
      </p>
    );
  }

  if (isEmpty(data)) {
    return <EmptyOverview />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SpentCard data={data} />
        <NextPaymentCard data={data} />
      </div>
      <TrendChart data={data} />
      {data.categories.length > 0 ? <CategoryBars data={data} /> : null}
    </div>
  );
}
