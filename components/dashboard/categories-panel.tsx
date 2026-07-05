"use client";

import { WalletIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Label, Pie, PieChart } from "recharts";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/data/finance";
import { createClient } from "@/lib/supabase/client";

type Slice = "shopping" | "transportation" | "food" | "bills" | "other";

type MonthOption = {
  key: string; // "all" or "YYYY-MM"
  label: string;
  start: string | null; // inclusive YYYY-MM-DD
  end: string | null; // exclusive YYYY-MM-DD (first day of next month)
};

const firstOfMonthISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;

function monthOption(d: Date): MonthOption {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  return {
    key: firstOfMonthISO(start).slice(0, 7),
    label: start.toLocaleDateString("en-CA", {
      month: "long",
      year: "numeric",
    }),
    start: firstOfMonthISO(start),
    end: firstOfMonthISO(next),
  };
}

const ALL_MONTHS: MonthOption = {
  key: "all",
  label: "All time",
  start: null,
  end: null,
};

/** Build month options from the oldest transaction month up to the current month. */
function buildMonths(oldest: Date): MonthOption[] {
  const now = new Date();
  const list: MonthOption[] = [];
  let d = new Date(now.getFullYear(), now.getMonth(), 1);
  while (
    d.getFullYear() > oldest.getFullYear() ||
    (d.getFullYear() === oldest.getFullYear() &&
      d.getMonth() >= oldest.getMonth())
  ) {
    list.push(monthOption(d));
    d = new Date(d.getFullYear(), d.getMonth() - 1, 1);
  }
  return [ALL_MONTHS, ...list];
}

/** Derive the query range for a "YYYY-MM" key (or "all"). */
function rangeFromKey(key: string): {
  start: string | null;
  end: string | null;
} {
  if (key === "all") {
    return { start: null, end: null };
  }
  const [y, m] = key.split("-").map(Number);
  return monthOption(new Date(y, m - 1, 1));
}

const CURRENT_MONTH_KEY = firstOfMonthISO(new Date()).slice(0, 7);

const SLICE_COLOR: Record<Slice, string> = {
  shopping: "#a78bfa",
  transportation: "#38bdf8",
  food: "#fbbf24",
  bills: "#34d399",
  other: "#a1a1aa",
};

const SLICE_LABEL: Record<Slice, string> = {
  ...(Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<
    Slice,
    string
  >),
  other: "Other",
};

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

const chartConfig = {
  amount: { label: "Spent" },
  shopping: { label: "Shopping", color: SLICE_COLOR.shopping },
  transportation: {
    label: "Transportation",
    color: SLICE_COLOR.transportation,
  },
  food: { label: "Food & Drink", color: SLICE_COLOR.food },
  bills: { label: "Bills", color: SLICE_COLOR.bills },
  other: { label: "Other", color: SLICE_COLOR.other },
} satisfies ChartConfig;

export function CategoriesPanel() {
  const supabase = createClient();
  const [months, setMonths] = useState<MonthOption[]>([]);
  const [selected, setSelected] = useState<string>(CURRENT_MONTH_KEY);
  const [totals, setTotals] = useState<Record<Slice, number>>({
    shopping: 0,
    transportation: 0,
    food: 0,
    bills: 0,
    other: 0,
  });
  const [loading, setLoading] = useState(true);

  // Build the month list from the oldest transaction in the table.
  useEffect(() => {
    let active = true;
    supabase
      .from("transactions")
      .select("date")
      .order("date", { ascending: true })
      .limit(1)
      .then(({ data }) => {
        if (!active) {
          return;
        }
        const oldestRaw = (data as { date: string }[] | null)?.[0]?.date;
        const oldest = oldestRaw
          ? new Date(`${oldestRaw}T00:00:00`)
          : new Date();
        setMonths(buildMonths(oldest));
      });
    return () => {
      active = false;
    };
  }, [supabase]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const { start, end } = rangeFromKey(selected);

    let query = supabase
      .from("transactions")
      .select("amount, category")
      .eq("type", "purchase");
    if (start && end) {
      query = query.gte("date", start).lt("date", end);
    }

    query.then(({ data }) => {
      if (!(active && data)) {
        if (active) {
          setLoading(false);
        }
        return;
      }
      const next: Record<Slice, number> = {
        shopping: 0,
        transportation: 0,
        food: 0,
        bills: 0,
        other: 0,
      };
      for (const row of data as { amount: number; category: Slice | null }[]) {
        const key: Slice = row.category ?? "other";
        next[key] += Math.abs(row.amount);
      }
      setTotals(next);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [supabase, selected]);

  const { chartData, total } = useMemo(() => {
    const entries = (Object.keys(totals) as Slice[])
      .map((slice) => ({
        slice,
        label: SLICE_LABEL[slice],
        amount: Math.round(totals[slice] * 100) / 100,
        fill: SLICE_COLOR[slice],
      }))
      .filter((e) => e.amount > 0)
      .sort((a, b) => b.amount - a.amount);
    const sum = entries.reduce((acc, e) => acc + e.amount, 0);
    return { chartData: entries, total: sum };
  }, [totals]);

  return (
    <div className="mt-6 flex flex-col gap-6">
      {/* Month filter */}
      <Select onValueChange={setSelected} value={selected}>
        <SelectTrigger className="w-full rounded-none border-border">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          {months.map((m) => (
            <SelectItem className="rounded-none" key={m.key} value={m.key}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(() => {
        if (loading) {
          return (
            <p className="py-16 text-center text-muted-foreground text-sm">
              Loading…
            </p>
          );
        }
        if (chartData.length === 0) {
          return (
            <EmptyState
              description="No purchases for the selected month."
              icon={WalletIcon}
              title="No spending"
            />
          );
        }
        return (
          <>
            <ChartContainer
              className="mx-auto aspect-square w-full max-w-[260px]"
              config={chartConfig}
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="label" />}
                  cursor={false}
                />
                <Pie
                  data={chartData}
                  dataKey="amount"
                  innerRadius={72}
                  nameKey="label"
                  paddingAngle={2}
                  stroke="none"
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox) {
                        return null;
                      }
                      if (!("cx" in viewBox)) {
                        return null;
                      }
                      const cx = viewBox.cx ?? 0;
                      const cy = viewBox.cy ?? 0;
                      return (
                        <text
                          dominantBaseline="middle"
                          textAnchor="middle"
                          x={cx}
                          y={cy}
                        >
                          <tspan
                            className="fill-foreground font-semibold text-2xl"
                            x={cx}
                            y={cy}
                          >
                            {currency.format(total)}
                          </tspan>
                          <tspan
                            className="fill-muted-foreground text-xs"
                            x={cx}
                            y={cy + 22}
                          >
                            Total spent
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Breakdown legend */}
            <div className="flex flex-col divide-y divide-border/60">
              {chartData.map((e) => (
                <div className="flex items-center gap-3 py-2.5" key={e.slice}>
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: e.fill }}
                  />
                  <span className="flex-1 font-medium text-sm">{e.label}</span>
                  <span className="text-muted-foreground text-sm tabular-nums">
                    {total > 0 ? Math.round((e.amount / total) * 100) : 0}%
                  </span>
                  <span className="w-24 text-right font-semibold text-sm tabular-nums">
                    {currency.format(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          </>
        );
      })()}
    </div>
  );
}
