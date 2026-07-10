"use client";

import {
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CalendarRangeIcon,
  CoinsIcon,
  HashIcon,
  type LucideIcon,
  PiggyBankIcon,
  ReceiptIcon,
  TrendingDownIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  type Transaction,
  type TransactionCategory,
} from "@/data/finance";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const money = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 2,
});

// Whole-dollar format for the compact 3-up summary cards so long values don't
// blow out the grid on narrow screens.
const money0 = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const WEEK = { weekStartsOn: 1 } as const;

type Range = { from: Date; to: Date };
type PresetId =
  | "this-week"
  | "last-week"
  | "this-month"
  | "last-month"
  | "last-30"
  | "this-year"
  | "all"
  | "custom";

const PRESETS: { id: PresetId; label: string; range: () => Range }[] = [
  {
    id: "this-week",
    label: "This week",
    range: () => ({
      from: startOfWeek(new Date(), WEEK),
      to: endOfWeek(new Date(), WEEK),
    }),
  },
  {
    id: "last-week",
    label: "Last week",
    range: () => ({
      from: startOfWeek(subWeeks(new Date(), 1), WEEK),
      to: endOfWeek(subWeeks(new Date(), 1), WEEK),
    }),
  },
  {
    id: "this-month",
    label: "This month",
    range: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    id: "last-month",
    label: "Last month",
    range: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    id: "last-30",
    label: "Last 30 days",
    range: () => ({ from: subDays(new Date(), 29), to: new Date() }),
  },
  {
    id: "this-year",
    label: "This year",
    range: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }),
  },
  {
    id: "all",
    label: "All time",
    range: () => ({ from: new Date(2000, 0, 1), to: new Date() }),
  },
];

type Stats = {
  income: number;
  expenses: number;
  net: number;
  count: number;
  avgDaily: number;
  savingsRate: number;
  biggestExpense: Transaction | null;
  biggestIncome: Transaction | null;
  smallestIncome: Transaction | null;
  incomeList: Transaction[];
  categories: { category: TransactionCategory; amount: number }[];
};

function biggest(
  list: Transaction[],
  value: (t: Transaction) => number
): Transaction | null {
  let best: Transaction | null = null;
  for (const t of list) {
    if (!best || value(t) > value(best)) {
      best = t;
    }
  }
  return best;
}

function smallest(
  list: Transaction[],
  value: (t: Transaction) => number
): Transaction | null {
  let least: Transaction | null = null;
  for (const t of list) {
    if (!least || value(t) < value(least)) {
      least = t;
    }
  }
  return least;
}

function computeStats(txns: Transaction[], range: Range): Stats {
  const incomes = txns.filter((t) => t.amount > 0 && t.type !== "transfer");
  const purchases = txns.filter((t) => t.amount < 0 && t.type === "purchase");

  const income = incomes.reduce((s, t) => s + t.amount, 0);
  const expenses = purchases.reduce((s, t) => s + Math.abs(t.amount), 0);

  const byCategory = new Map<TransactionCategory, number>();
  for (const t of purchases) {
    if (t.category) {
      byCategory.set(
        t.category,
        (byCategory.get(t.category) ?? 0) + Math.abs(t.amount)
      );
    }
  }

  const days = Math.max(1, differenceInCalendarDays(range.to, range.from) + 1);
  const categories = [...byCategory.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const net = income - expenses;

  return {
    income,
    expenses,
    net,
    // Count only the income + purchases the stats actually summarise; transfers
    // are excluded so the number lines up with the income/expense figures.
    count: incomes.length + purchases.length,
    avgDaily: expenses / days,
    // Share of incoming money kept after expenses. 0 when nothing came in.
    savingsRate: income > 0 ? (net / income) * 100 : 0,
    biggestExpense: biggest(purchases, (t) => Math.abs(t.amount)),
    biggestIncome: biggest(incomes, (t) => t.amount),
    smallestIncome: smallest(incomes, (t) => t.amount),
    incomeList: [...incomes].sort((a, b) => b.amount - a.amount),
    categories,
  };
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive";
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border border-border p-3">
      <span className="truncate text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn(
          "truncate font-semibold text-base tabular-nums sm:text-lg",
          tone === "success" ? "text-success" : "",
          tone === "destructive" ? "text-destructive" : ""
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Highlight({
  icon: Icon,
  label,
  primary,
  secondary,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  primary: string;
  secondary?: string;
  tone?: "success" | "destructive";
}) {
  return (
    <div className="flex items-center gap-3 border border-border p-3">
      <div className="flex size-9 shrink-0 items-center justify-center bg-secondary text-secondary-foreground">
        <Icon className="size-4" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-muted-foreground text-xs uppercase tracking-wide">
          {label}
        </span>
        <span
          className={cn(
            "truncate font-semibold text-sm tabular-nums",
            tone === "success" ? "text-success" : "",
            tone === "destructive" ? "text-destructive" : ""
          )}
        >
          {primary}
        </span>
        {secondary ? (
          <span className="truncate text-muted-foreground text-xs">
            {secondary}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CategoryBreakdown({ stats }: { stats: Stats }) {
  if (stats.categories.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-3 border border-border p-4">
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Spending by category
      </span>
      {stats.categories.map((c) => {
        const pct = stats.expenses > 0 ? (c.amount / stats.expenses) * 100 : 0;
        return (
          <div className="flex flex-col gap-1.5" key={c.category}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0"
                  style={{ backgroundColor: CATEGORY_COLOR[c.category] }}
                />
                {CATEGORY_LABEL[c.category]}
              </span>
              <span className="tabular-nums">
                {money.format(c.amount)}
                <span className="text-muted-foreground">
                  {" · "}
                  {Math.round(pct)}%
                </span>
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary">
              <div
                className="h-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: CATEGORY_COLOR[c.category],
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const INCOME_PREVIEW = 4;

function IncomeList({ incomes }: { incomes: Transaction[] }) {
  const [expanded, setExpanded] = useState(false);

  if (incomes.length === 0) {
    return null;
  }

  const shown = expanded ? incomes : incomes.slice(0, INCOME_PREVIEW);
  const hiddenCount = incomes.length - shown.length;

  return (
    <div className="flex flex-col gap-1 border border-border p-4">
      <span className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
        Income ({incomes.length})
      </span>
      <div className="flex flex-col divide-y divide-border/60">
        {shown.map((income) => (
          <div className="flex items-center gap-3 py-2.5" key={income.id}>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium text-sm">
                {income.merchant}
              </span>
              <span className="text-muted-foreground text-xs">
                {format(new Date(`${income.date}T00:00:00`), "MMM d, yyyy")}
              </span>
            </div>
            <span className="shrink-0 font-semibold text-sm text-success tabular-nums">
              {money.format(income.amount)}
            </span>
          </div>
        ))}
      </div>
      {incomes.length > INCOME_PREVIEW ? (
        <button
          className="mt-2 self-start font-medium text-muted-foreground text-sm hover:text-foreground"
          onClick={() => setExpanded((prev) => !prev)}
          type="button"
        >
          {expanded ? "Show less" : `Show all (${hiddenCount} more)`}
        </button>
      ) : null}
    </div>
  );
}

function StatsView({ stats }: { stats: Stats }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          label="Income"
          tone="success"
          value={money0.format(stats.income)}
        />
        <StatCard label="Expenses" value={money0.format(stats.expenses)} />
        <StatCard
          label="Net"
          tone={stats.net < 0 ? "destructive" : "success"}
          value={money0.format(stats.net)}
        />
      </div>

      {stats.count === 0 ? (
        <EmptyState
          description="No transactions in this range."
          icon={ReceiptIcon}
          title="Nothing here"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {stats.biggestExpense ? (
              <Highlight
                icon={ArrowDownRightIcon}
                label="Biggest expense"
                primary={money.format(Math.abs(stats.biggestExpense.amount))}
                secondary={stats.biggestExpense.merchant}
                tone="destructive"
              />
            ) : null}
            {stats.biggestIncome ? (
              <Highlight
                icon={ArrowUpRightIcon}
                label="Biggest income"
                primary={money.format(stats.biggestIncome.amount)}
                secondary={stats.biggestIncome.merchant}
                tone="success"
              />
            ) : null}
            {stats.smallestIncome ? (
              <Highlight
                icon={CoinsIcon}
                label="Smallest income"
                primary={money.format(stats.smallestIncome.amount)}
                secondary={stats.smallestIncome.merchant}
                tone="success"
              />
            ) : null}
            {stats.income > 0 ? (
              <Highlight
                icon={PiggyBankIcon}
                label="Savings rate"
                primary={`${Math.round(stats.savingsRate)}%`}
                secondary="of income kept"
                tone={stats.savingsRate < 0 ? "destructive" : "success"}
              />
            ) : null}
            <Highlight
              icon={HashIcon}
              label="Transactions"
              primary={String(stats.count)}
              secondary={`across ${stats.categories.length} categories`}
            />
            <Highlight
              icon={TrendingDownIcon}
              label="Avg. daily spend"
              primary={money.format(stats.avgDaily)}
            />
          </div>

          <IncomeList incomes={stats.incomeList} />
          <CategoryBreakdown stats={stats} />
        </>
      )}
    </>
  );
}

function RangeSelector({
  presetId,
  custom,
  onPreset,
  onCustom,
}: {
  presetId: PresetId;
  custom: DateRange | undefined;
  onPreset: (id: PresetId) => void;
  onCustom: (range: DateRange | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const customLabel =
    presetId === "custom" && custom?.from
      ? `${format(custom.from, "MMM d")} – ${format(custom.to ?? custom.from, "MMM d")}`
      : "Custom";

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {PRESETS.map((p) => (
        <button
          className={cn(
            "shrink-0 border px-3 py-1.5 font-medium text-sm transition-colors",
            presetId === p.id
              ? "border-primary bg-secondary text-foreground"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
          key={p.id}
          onClick={() => onPreset(p.id)}
          type="button"
        >
          {p.label}
        </button>
      ))}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 border px-3 py-1.5 font-medium text-sm transition-colors",
            presetId === "custom"
              ? "border-primary bg-secondary text-foreground"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <CalendarRangeIcon className="size-3.5" />
          {customLabel}
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto rounded-none p-0">
          <Calendar
            autoFocus
            mode="range"
            numberOfMonths={1}
            onSelect={onCustom}
            selected={custom}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function TrendsAdvanced() {
  const supabase = createClient();
  const [presetId, setPresetId] = useState<PresetId>("this-month");
  const [custom, setCustom] = useState<DateRange | undefined>(undefined);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const range: Range = useMemo(() => {
    if (presetId === "custom" && custom?.from) {
      return { from: custom.from, to: custom.to ?? custom.from };
    }
    const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[2];
    return preset.range();
  }, [presetId, custom]);

  const fromISO = format(range.from, "yyyy-MM-dd");
  const toISO = format(range.to, "yyyy-MM-dd");

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("transactions")
      .select("*")
      .gte("date", fromISO)
      .lte("date", toISO)
      .order("date", { ascending: false })
      .then(({ data }) => {
        if (!active) {
          return;
        }
        setTxns((data ?? []) as Transaction[]);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [supabase, fromISO, toISO]);

  const stats = useMemo(() => computeStats(txns, range), [txns, range]);

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <RangeSelector
          custom={custom}
          onCustom={(r) => {
            setCustom(r);
            setPresetId("custom");
          }}
          onPreset={setPresetId}
          presetId={presetId}
        />
        <span className="text-muted-foreground text-xs">
          {format(range.from, "PP")} – {format(range.to, "PP")}
        </span>
      </div>

      {loading ? (
        <p className="shimmer py-12 text-center text-muted-foreground text-sm">
          Loading…
        </p>
      ) : (
        <StatsView stats={stats} />
      )}
    </div>
  );
}
