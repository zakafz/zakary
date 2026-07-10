"use client";

import { format } from "date-fns";
import {
  ArrowLeftRightIcon,
  CarIcon,
  CreditCardIcon,
  type LucideIcon,
  PlusIcon,
  ReceiptIcon,
  ScaleIcon,
  ShoppingBagIcon,
  Trash2Icon,
  UtensilsIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BudgetPanel } from "@/components/dashboard/budget-panel";
import { CategoriesPanel } from "@/components/dashboard/categories-panel";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TrendsAdvanced } from "@/components/dashboard/trends-advanced";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  type Transaction,
  type TransactionCategory,
} from "@/data/finance";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

const PAGE_SIZE = 10;

type FinanceView = "trends" | "categories" | "budget";
type TrendsMode = "general" | "advanced";

type Flow = "expense" | "income";

const CATEGORY_ICON: Record<TransactionCategory, LucideIcon> = {
  shopping: ShoppingBagIcon,
  transportation: CarIcon,
  food: UtensilsIcon,
  bills: ReceiptIcon,
};

const CATEGORY_STYLE: Record<
  TransactionCategory,
  { icon: string; tile: string; chipActive: string }
> = {
  shopping: {
    icon: "text-purple-400",
    tile: "bg-purple-500/15 text-purple-400",
    chipActive: "border-purple-500/40 bg-purple-500/15 text-purple-400",
  },
  transportation: {
    icon: "text-sky-400",
    tile: "bg-sky-500/15 text-sky-400",
    chipActive: "border-sky-500/40 bg-sky-500/15 text-sky-400",
  },
  food: {
    icon: "text-amber-400",
    tile: "bg-amber-500/15 text-amber-400",
    chipActive: "border-amber-500/40 bg-amber-500/15 text-amber-400",
  },
  bills: {
    icon: "text-emerald-400",
    tile: "bg-emerald-500/15 text-emerald-400",
    chipActive: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
  },
};

function formatAmount(amount: number) {
  const sign = amount < 0 ? "−" : "+";
  return `${sign} ${currency.format(Math.abs(amount))} CAD`;
}

function dateLabel(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86_400_000
  );

  if (diff === 0) {
    return "Today";
  }
  if (diff === 1) {
    return "Yesterday";
  }
  return date
    .toLocaleDateString("en-CA", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

function groupByDate(transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
  const groups: { label: string; items: Transaction[] }[] = [];
  for (const txn of sorted) {
    const label = dateLabel(txn.date);
    const last = groups.at(-1);
    if (last?.label === label) {
      last.items.push(txn);
    } else {
      groups.push({ label, items: [txn] });
    }
  }
  return groups;
}

function tileIcon(txn: Transaction): LucideIcon {
  if (txn.type === "transfer") {
    return ArrowLeftRightIcon;
  }
  if (txn.type === "deposit") {
    return PlusIcon;
  }
  return txn.category ? CATEGORY_ICON[txn.category] : CreditCardIcon;
}

function subtitle(txn: Transaction) {
  let base: string;
  if (txn.type === "transfer") {
    base = "Transfer";
  } else if (txn.type === "deposit") {
    base = "Income";
  } else {
    base = txn.category ? CATEGORY_LABEL[txn.category] : "Purchase";
  }
  return txn.pending ? `${base} • Pending` : base;
}

const REVEAL = 80;

function TransactionRow({
  txn,
  onRemove,
}: {
  txn: Transaction;
  onRemove: (id: string) => void;
}) {
  const Icon = tileIcon(txn);
  const isIncome = txn.amount > 0;

  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    startOffset.current = offset;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) {
      return;
    }
    const delta = e.clientX - startX.current;
    setOffset(Math.max(-REVEAL, Math.min(0, startOffset.current + delta)));
  }

  function onPointerUp() {
    if (!dragging) {
      return;
    }
    setDragging(false);
    setOffset((current) => (current < -REVEAL / 2 ? -REVEAL : 0));
  }

  return (
    <div className="relative overflow-hidden">
      {/* Delete block revealed on swipe */}
      <ConfirmDelete
        description={
          <>
            This permanently removes “{txn.merchant}” (
            {formatAmount(txn.amount)}
            ). This can’t be undone.
          </>
        }
        onConfirm={() => onRemove(txn.id)}
        title="Delete transaction?"
        triggerClassName="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive pr-1 text-white"
        triggerLabel={`Delete ${txn.merchant}`}
        triggerStyle={{ width: REVEAL }}
      >
        <Trash2Icon className="size-5" />
      </ConfirmDelete>

      <div
        className={cn(
          "flex touch-pan-y items-center gap-3 bg-background py-3",
          offset < 0 && "pr-4"
        )}
        onPointerCancel={onPointerUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
      >
        <div
          className={cn(
            "relative flex size-11 shrink-0 items-center justify-center rounded-lg",
            txn.category
              ? CATEGORY_STYLE[txn.category].tile
              : "bg-secondary text-secondary-foreground"
          )}
        >
          <Icon className="size-5" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate font-semibold text-[15px] leading-tight">
            {txn.merchant}
          </p>
          <p className="truncate text-muted-foreground text-sm">
            {subtitle(txn)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end">
          <p
            className={cn(
              "font-semibold text-[15px] tabular-nums leading-tight",
              isIncome ? "text-success" : "text-foreground"
            )}
          >
            {formatAmount(txn.amount)}
          </p>
          {txn.note ? (
            <p className="truncate text-muted-foreground text-sm">{txn.note}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function CategoryScroller({
  value,
  onChange,
}: {
  value: TransactionCategory;
  onChange: (id: TransactionCategory) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  function update() {
    const el = ref.current;
    if (!el) {
      return;
    }
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: measure once on mount
  useEffect(() => {
    update();
  }, []);

  const left = atStart ? "black" : "transparent";
  const right = atEnd ? "black" : "transparent";
  const mask = `linear-gradient(to right, ${left}, black 2.5rem, black calc(100% - 2.5rem), ${right})`;

  return (
    <div
      className="flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onScroll={update}
      ref={ref}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      {CATEGORIES.map((c) => {
        const Icon = CATEGORY_ICON[c.id];
        const style = CATEGORY_STYLE[c.id];
        const active = c.id === value;
        return (
          <button
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-medium text-sm transition-colors",
              active
                ? style.chipActive
                : "border-border text-muted-foreground hover:text-foreground"
            )}
            key={c.id}
            onClick={() => onChange(c.id)}
            type="button"
          >
            <Icon className={cn("size-3.5", style.icon)} />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function buildTransactionRow(input: {
  flow: Flow;
  value: number;
  category: TransactionCategory;
  note: string;
  date: Date;
}) {
  const isIncome = input.flow === "income";
  const note = input.note.trim();
  return {
    merchant: note || (isIncome ? "Income" : CATEGORY_LABEL[input.category]),
    type: isIncome ? "deposit" : "purchase",
    category: isIncome ? null : input.category,
    amount: isIncome ? Math.abs(input.value) : -Math.abs(input.value),
    note: note || null,
    date: format(input.date, "yyyy-MM-dd"),
  };
}

function FlowToggle({
  value,
  onChange,
}: {
  value: Flow;
  onChange: (flow: Flow) => void;
}) {
  return (
    <div className="flex h-9 border border-border p-0.5">
      {(["expense", "income"] as const).map((f) => (
        <button
          className={cn(
            "flex flex-1 items-center justify-center px-3 font-medium text-sm capitalize transition-colors",
            value === f
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          key={f}
          onClick={() => onChange(f)}
          type="button"
        >
          {f}
        </button>
      ))}
    </div>
  );
}

function AddTransactionDialog({
  onAdded,
}: {
  onAdded: (saved: Transaction) => void;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flow, setFlow] = useState<Flow>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<TransactionCategory>("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState<Date>(new Date());

  const isIncome = flow === "income";

  function resetForm() {
    setFlow("expense");
    setAmount("");
    setCategory("food");
    setNote("");
    setDate(new Date());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number.parseFloat(amount);
    if (!(Number.isFinite(value) && value > 0)) {
      return;
    }

    const row = buildTransactionRow({ flow, value, category, note, date });
    setSaving(true);
    const { data, error } = await supabase
      .from("transactions")
      .insert(row)
      .select()
      .single();
    setSaving(false);

    if (error || !data) {
      return;
    }
    onAdded(data as Transaction);
    resetForm();
    setOpen(false);
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          resetForm();
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          aria-label="Track transaction"
          className="aspect-square h-auto shrink-0 self-stretch rounded-none"
          size="sm"
          type="button"
        >
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isIncome ? "Track income" : "Track expense"}
          </DialogTitle>
          <DialogDescription>
            {isIncome
              ? "Log money coming in to your finances."
              : "Log a new expense to your finances."}
          </DialogDescription>
        </DialogHeader>

        <form className="flex min-w-0 flex-col gap-5" onSubmit={submit}>
          <FlowToggle onChange={setFlow} value={flow} />

          <div className="flex items-center gap-1 py-2">
            <span
              className={cn(
                "font-semibold text-4xl",
                isIncome ? "text-success" : "text-muted-foreground"
              )}
            >
              {isIncome ? "+ $" : "$"}
            </span>
            <input
              autoFocus
              className={cn(
                "min-w-0 flex-1 bg-transparent text-left font-semibold text-4xl tabular-nums outline-none [appearance:textfield] placeholder:text-muted-foreground/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
                isIncome ? "text-success" : ""
              )}
              inputMode="decimal"
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={amount}
            />
          </div>

          {isIncome ? null : (
            <div className="flex flex-col gap-2">
              <span className="font-medium text-muted-foreground text-sm">
                Category
              </span>
              <CategoryScroller onChange={setCategory} value={category} />
            </div>
          )}

          <Input
            onChange={(e) => setNote(e.target.value)}
            placeholder={isIncome ? "Source (optional)" : "Note (optional)"}
            type="text"
            value={note}
          />

          <DatePicker onChange={setDate} value={date} />

          <DialogFooter>
            <Button className="w-full" disabled={saving} type="submit">
              {saving ? "Adding…" : `Add ${isIncome ? "income" : "expense"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReconcileDialog({
  balance,
  onAdded,
}: {
  balance: number | null;
  onAdded: (saved: Transaction) => void;
}) {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actual, setActual] = useState("");

  const target = Number.parseFloat(actual);
  const hasTarget = actual.trim() !== "" && Number.isFinite(target);
  // Difference we need to book so the running balance matches the real account.
  const delta =
    hasTarget && balance !== null
      ? Math.round((target - balance) * 100) / 100
      : 0;
  const balanced = hasTarget && delta === 0;

  function preview() {
    if (!hasTarget) {
      return "Enter your real account balance.";
    }
    if (balanced) {
      return "Already balanced — nothing to adjust.";
    }
    const verb = delta > 0 ? "Add" : "Remove";
    return `Will ${verb} ${formatAmount(delta)}`;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!(hasTarget && balance !== null) || delta === 0) {
      return;
    }

    const row = {
      merchant: "Balance adjustment",
      type: "transfer" as const,
      category: null,
      amount: delta,
      note: null,
      date: format(new Date(), "yyyy-MM-dd"),
    };

    setSaving(true);
    const { data, error } = await supabase
      .from("transactions")
      .insert(row)
      .select()
      .single();
    setSaving(false);

    if (error || !data) {
      return;
    }
    onAdded(data as Transaction);
    setActual("");
    setOpen(false);
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setActual("");
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          className="h-8 gap-1.5 rounded-none px-2.5 text-xs"
          disabled={balance === null}
          size="sm"
          type="button"
          variant="outline"
        >
          <ScaleIcon className="size-3.5" />
          Adjust
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reconcile balance</DialogTitle>
          <DialogDescription>
            Match your balance to your real account.
          </DialogDescription>
        </DialogHeader>

        <form className="flex min-w-0 flex-col gap-5" onSubmit={submit}>
          <div className="flex items-center justify-between border border-border p-3">
            <span className="text-muted-foreground text-sm">
              Current balance
            </span>
            <span className="font-semibold tabular-nums">
              {balance === null ? "—" : currency.format(balance)}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-medium text-muted-foreground text-sm">
              Actual balance in your account
            </span>
            <div className="flex items-center gap-1 py-1">
              <span className="font-semibold text-4xl text-muted-foreground">
                $
              </span>
              <input
                autoFocus
                className="min-w-0 flex-1 bg-transparent text-left font-semibold text-4xl tabular-nums outline-none [appearance:textfield] placeholder:text-muted-foreground/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                inputMode="decimal"
                onChange={(e) => setActual(e.target.value)}
                placeholder="0.00"
                step="0.01"
                type="number"
                value={actual}
              />
            </div>
          </div>

          <p
            className={cn(
              "text-sm tabular-nums",
              balanced ? "text-muted-foreground" : "",
              !balanced && delta > 0 ? "text-success" : "",
              !balanced && delta < 0 ? "text-foreground" : ""
            )}
          >
            {preview()}
          </p>

          <DialogFooter>
            <Button
              className="w-full"
              disabled={saving || !hasTarget || balanced}
              type="submit"
            >
              {saving ? "Adjusting…" : "Apply adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GeneralTrends({
  groups,
  loading,
  isEmpty,
  hasMore,
  loadingMore,
  hidden,
  onRemove,
  onLoadMore,
}: {
  groups: { label: string; items: Transaction[] }[];
  loading: boolean;
  isEmpty: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  hidden: boolean;
  onRemove: (id: string) => void;
  onLoadMore: () => void;
}) {
  return (
    <div className={cn("mt-6 flex flex-col", hidden ? "hidden" : "")}>
      {loading ? (
        <p className="shimmer py-12 text-center text-muted-foreground text-sm">
          Loading…
        </p>
      ) : null}

      {groups.map((group) => (
        <section className="mt-4 first:mt-0" key={group.label}>
          <h2 className="py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            {group.label}
          </h2>
          <div className="flex flex-col divide-y divide-border/60">
            {group.items.map((txn) => (
              <TransactionRow key={txn.id} onRemove={onRemove} txn={txn} />
            ))}
          </div>
        </section>
      ))}

      {isEmpty ? (
        <EmptyState
          description="Track your first one above."
          icon={ReceiptIcon}
          title="No expenses yet"
        />
      ) : null}

      {hasMore ? (
        <Button
          className="mt-4 w-full"
          disabled={loadingMore}
          onClick={onLoadMore}
          type="button"
          variant="outline"
        >
          {loadingMore ? "Loading…" : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}

export function FinancePanel() {
  const supabase = createClient();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [view, setView] = useState<FinanceView>("trends");
  const [trendsMode, setTrendsMode] = useState<TrendsMode>("general");
  const [balance, setBalance] = useState<number | null>(null);

  // Running balance = opening balance + every transaction since. The opening
  // balance lives in the table as a one-off "deposit" row, so summing every
  // amount is all it takes. PostgREST caps a single response at 1000 rows, so
  // we page through in chunks and keep going until a short page tells us we've
  // reached the end — otherwise the balance silently omits older rows.
  useEffect(() => {
    let active = true;
    const CHUNK = 1000;

    async function sumAll() {
      let total = 0;
      let start = 0;
      for (;;) {
        const { data, error } = await supabase
          .from("transactions")
          .select("amount")
          .range(start, start + CHUNK - 1);
        if (error || !data) {
          return;
        }
        total += (data as { amount: number }[]).reduce(
          (acc, r) => acc + r.amount,
          0
        );
        if (data.length < CHUNK) {
          break;
        }
        start += CHUNK;
      }
      if (active) {
        setBalance(total);
      }
    }

    sumAll();
    return () => {
      active = false;
    };
  }, [supabase]);

  // Fetch one row beyond the page so we can tell whether more exist without a
  // separate count query. Avoids the off-by-one where an exact multiple of
  // PAGE_SIZE rows looks like "there's more" and then loads nothing.
  const fetchPage = useCallback(
    async (start: number) => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(start, start + PAGE_SIZE);
      const rows = (data ?? []) as Transaction[];
      return { rows: rows.slice(0, PAGE_SIZE), more: rows.length > PAGE_SIZE };
    },
    [supabase]
  );

  useEffect(() => {
    let active = true;
    fetchPage(0).then(({ rows, more }) => {
      if (active) {
        setTransactions(rows);
        setHasMore(more);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [fetchPage]);

  async function loadMore() {
    setLoadingMore(true);
    const { rows, more } = await fetchPage(transactions.length);
    setLoadingMore(false);
    setTransactions((prev) => {
      const seen = new Set(prev.map((t) => t.id));
      return [...prev, ...rows.filter((t) => !seen.has(t.id))];
    });
    setHasMore(more);
  }

  function handleAdded(saved: Transaction) {
    setTransactions((prev) => [saved, ...prev]);
    setBalance((prev) => (prev ?? 0) + saved.amount);
  }

  async function removeTransaction(id: string) {
    const removed = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (removed) {
      setBalance((prev) => (prev ?? 0) - removed.amount);
    }
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    // Restore the optimistic removal if the delete didn't land.
    if (error && removed) {
      setTransactions((prev) =>
        prev.some((t) => t.id === id) ? prev : [removed, ...prev]
      );
      setBalance((prev) => (prev ?? 0) + removed.amount);
    }
  }

  const groups = groupByDate(transactions);

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex items-start justify-between gap-4 border border-border p-4">
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            Current balance
          </span>
          <span className="font-semibold text-3xl tabular-nums">
            {balance === null ? "—" : currency.format(balance)}
          </span>
        </div>
        <ReconcileDialog balance={balance} onAdded={handleAdded} />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-9 flex-1 border border-border p-0.5">
          {(["trends", "categories", "budget"] as const).map((v) => (
            <button
              className={cn(
                "flex flex-1 items-center justify-center px-3 font-medium text-sm capitalize transition-colors",
                view === v
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
              key={v}
              onClick={() => setView(v)}
              type="button"
            >
              {v}
            </button>
          ))}
        </div>

        <AddTransactionDialog onAdded={handleAdded} />
      </div>

      {view === "categories" ? <CategoriesPanel /> : null}
      {view === "budget" ? <BudgetPanel /> : null}
      {view === "trends" ? (
        <div className="mt-6 flex flex-col">
          <div className="flex h-9 border border-border p-0.5">
            {(["general", "advanced"] as const).map((m) => (
              <button
                className={cn(
                  "flex flex-1 items-center justify-center px-3 font-medium text-sm capitalize transition-colors",
                  trendsMode === m
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                key={m}
                onClick={() => setTrendsMode(m)}
                type="button"
              >
                {m}
              </button>
            ))}
          </div>
          {trendsMode === "advanced" ? <TrendsAdvanced /> : null}
          <GeneralTrends
            groups={groups}
            hasMore={hasMore}
            hidden={trendsMode === "advanced"}
            isEmpty={!loading && transactions.length === 0}
            loading={loading}
            loadingMore={loadingMore}
            onLoadMore={loadMore}
            onRemove={removeTransaction}
          />
        </div>
      ) : null}
    </div>
  );
}
