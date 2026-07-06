"use client";

import { format } from "date-fns";
import { PlusIcon, WalletIcon } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ReceiptPicker } from "@/components/dashboard/project-entries";
import { SwipeRow } from "@/components/dashboard/swipe-row";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  currency,
  type EntryKind,
  type ProjectEntry,
  shortDate,
} from "@/data/projects";
import { cn } from "@/lib/utils";

type Period = "all" | "month" | "30d" | "year";

const PERIODS: { id: Period; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "month", label: "This month" },
  { id: "30d", label: "Last 30 days" },
  { id: "year", label: "This year" },
];

function inPeriod(dateISO: string, period: Period) {
  if (period === "all") {
    return true;
  }
  const d = new Date(`${dateISO}T00:00:00`);
  const now = new Date();
  if (period === "month") {
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  }
  if (period === "year") {
    return d.getFullYear() === now.getFullYear();
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  cutoff.setHours(0, 0, 0, 0);
  return d >= cutoff;
}

type AddEntry = (payload: {
  kind: EntryKind;
  label: string;
  amount: number;
  date: string;
  receiptUrl: string | null;
}) => Promise<void>;

function FinanceAddForm({
  onAdd,
  onDone,
}: {
  onAdd: AddEntry;
  onDone: () => void;
}) {
  const [kind, setKind] = useState<EntryKind>("income");
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const isIncome = kind === "income";

  async function submit() {
    const value = Number.parseFloat(amount);
    if (!(label.trim() && Number.isFinite(value) && value > 0)) {
      return;
    }
    setSaving(true);
    await onAdd({
      kind,
      label: label.trim(),
      amount: Math.abs(value),
      date: format(date, "yyyy-MM-dd"),
      receiptUrl,
    });
    setSaving(false);
    onDone();
  }

  return (
    <div className="mt-3 flex flex-col gap-4 border border-border p-3">
      <div className="flex">
        {(["income", "expense"] as const).map((k) => (
          <button
            className={cn(
              "flex-1 border px-3 py-2 font-medium text-sm capitalize transition-colors",
              kind === k
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
            key={k}
            onClick={() => setKind(k)}
            type="button"
          >
            {k === "income" ? "Earning" : "Expense"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1 py-1">
        <span
          className={cn(
            "font-semibold text-4xl",
            isIncome ? "text-success" : "text-muted-foreground"
          )}
        >
          {isIncome ? "+ $" : "$"}
        </span>
        <input
          className="min-w-0 flex-1 bg-transparent text-left font-semibold text-4xl tabular-nums outline-none [appearance:textfield] placeholder:text-muted-foreground/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          inputMode="decimal"
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          type="number"
          value={amount}
        />
      </div>
      <Input
        onChange={(e) => setLabel(e.target.value)}
        placeholder={isIncome ? "What was it for?" : "e.g. Parts, Software"}
        type="text"
        value={label}
      />
      <DatePicker onChange={setDate} value={date} />
      <ReceiptPicker
        name={receiptName}
        onChange={(url, fileName) => {
          setReceiptUrl(url);
          setReceiptName(fileName);
        }}
        url={receiptUrl}
      />
      <Button
        className="w-full rounded-none"
        disabled={saving}
        onClick={submit}
        type="button"
      >
        {saving ? "Adding…" : "Add"}
      </Button>
    </div>
  );
}

export function ProjectFinance({
  entries,
  onAdd,
  onRemove,
}: {
  entries: ProjectEntry[];
  onAdd: AddEntry;
  onRemove: (id: string) => void;
}) {
  const [period, setPeriod] = useState<Period>("all");
  const [adding, setAdding] = useState(false);

  const filtered = entries
    .filter((e) => inPeriod(e.date, period))
    .sort((a, b) => b.date.localeCompare(a.date));

  const income = filtered
    .filter((e) => e.kind === "income")
    .reduce((acc, e) => acc + e.amount, 0);
  const expense = filtered
    .filter((e) => e.kind === "expense")
    .reduce((acc, e) => acc + e.amount, 0);
  const net = income - expense;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <Select onValueChange={(v) => setPeriod(v as Period)} value={period}>
          <SelectTrigger className="flex-1 rounded-none border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {PERIODS.map((p) => (
              <SelectItem className="rounded-none" key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          aria-label="Add entry"
          className="aspect-square h-auto shrink-0 self-stretch rounded-none"
          onClick={() => setAdding((v) => !v)}
          size="sm"
          type="button"
          variant={adding ? "secondary" : "default"}
        >
          <PlusIcon />
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 border border-border p-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            In
          </span>
          <span className="font-semibold text-[15px] text-success tabular-nums">
            {currency.format(income)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            Out
          </span>
          <span className="font-semibold text-[15px] tabular-nums">
            {currency.format(expense)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            Net
          </span>
          <span
            className={cn(
              "font-semibold text-[15px] tabular-nums",
              net < 0 ? "text-destructive" : "text-success"
            )}
          >
            {currency.format(net)}
          </span>
        </div>
      </div>

      {adding ? (
        <FinanceAddForm onAdd={onAdd} onDone={() => setAdding(false)} />
      ) : null}

      <div className="mt-3 flex flex-col divide-y divide-border/60">
        {filtered.map((e) => (
          <SwipeRow
            deleteDescription={
              <>This permanently removes “{e.label}”. This can’t be undone.</>
            }
            deleteLabel={`Delete ${e.label}`}
            deleteTitle="Delete entry?"
            key={e.id}
            onDelete={() => onRemove(e.id)}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-semibold text-[15px] leading-tight">
                {e.label}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground text-sm">
                {shortDate(e.date)}
                {e.receipt_url ? (
                  <a
                    className="text-foreground/70 underline-offset-2 hover:text-foreground hover:underline"
                    href={e.receipt_url}
                    onClick={(ev) => ev.stopPropagation()}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Receipt
                  </a>
                ) : null}
              </span>
            </div>
            <span
              className={cn(
                "shrink-0 font-semibold text-[15px] tabular-nums",
                e.kind === "income" ? "text-success" : "text-foreground"
              )}
            >
              {e.kind === "income" ? "+ " : "− "}
              {currency.format(e.amount)}
            </span>
          </SwipeRow>
        ))}
        {filtered.length === 0 ? (
          <EmptyState
            description="Add an earning or expense above."
            icon={WalletIcon}
            title="Nothing here yet"
          />
        ) : null}
      </div>
    </div>
  );
}
