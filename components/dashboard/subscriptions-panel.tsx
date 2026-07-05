"use client";

import { format } from "date-fns";
import { PlusIcon, RepeatIcon, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Cycle = "weekly" | "monthly" | "yearly";

type Subscription = {
  id: string;
  name: string;
  amount: number;
  cycle: Cycle;
  next_billing: string | null;
};

const CYCLES: { id: Cycle; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

const CYCLE_LABEL: Record<Cycle, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

// Normalise any cycle to a monthly cost for the summary.
const TO_MONTHLY: Record<Cycle, number> = {
  weekly: 52 / 12,
  monthly: 1,
  yearly: 1 / 12,
};

const REVEAL = 64;

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

function SubscriptionRow({
  sub,
  onRemove,
}: {
  sub: Subscription;
  onRemove: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
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

  const nextLabel = sub.next_billing
    ? new Date(`${sub.next_billing}T00:00:00`).toLocaleDateString("en-CA", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="relative overflow-hidden">
      <button
        aria-label={`Delete ${sub.name}`}
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive text-white"
        onClick={() => onRemove(sub.id)}
        style={{ width: REVEAL }}
        type="button"
      >
        <Trash2Icon className="size-5" />
      </button>

      <div
        className="flex touch-pan-y items-center gap-3 bg-background py-3"
        onPointerCancel={onPointerUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <RepeatIcon className="size-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate font-semibold text-[15px] leading-tight">
            {sub.name}
          </p>
          <p className="truncate text-muted-foreground text-sm">
            {CYCLE_LABEL[sub.cycle]}
            {nextLabel ? ` • Next ${nextLabel}` : ""}
          </p>
        </div>
        <p className="shrink-0 font-semibold text-[15px] tabular-nums">
          {currency.format(sub.amount)}
        </p>
      </div>
    </div>
  );
}

export function SubscriptionsPanel() {
  const supabase = createClient();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Cycle | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [nextBilling, setNextBilling] = useState<Date>(new Date());

  useEffect(() => {
    let active = true;
    supabase
      .from("subscriptions")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data }) => {
        if (active && data) {
          setSubs(data as Subscription[]);
        }
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [supabase]);

  const filtered =
    filter === "all" ? subs : subs.filter((s) => s.cycle === filter);
  const monthlyTotal = subs.reduce(
    (acc, s) => acc + s.amount * TO_MONTHLY[s.cycle],
    0
  );

  function resetForm() {
    setName("");
    setAmount("");
    setCycle("monthly");
    setNextBilling(new Date());
  }

  async function addSub(e: React.FormEvent) {
    e.preventDefault();
    const value = Number.parseFloat(amount);
    if (!(name.trim() && Number.isFinite(value) && value > 0)) {
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        name: name.trim(),
        amount: Math.abs(value),
        cycle,
        next_billing: format(nextBilling, "yyyy-MM-dd"),
      })
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      return;
    }
    setSubs((prev) =>
      [...prev, data as Subscription].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    resetForm();
    setDialogOpen(false);
  }

  async function removeSub(id: string) {
    setSubs((prev) => prev.filter((s) => s.id !== id));
    await supabase.from("subscriptions").delete().eq("id", id);
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <Select
          onValueChange={(v) => setFilter(v as Cycle | "all")}
          value={filter}
        >
          <SelectTrigger className="flex-1 rounded-none border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem className="rounded-none" value="all">
              All cycles
            </SelectItem>
            {CYCLES.map((c) => (
              <SelectItem className="rounded-none" key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (open) {
              resetForm();
            }
          }}
          open={dialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              aria-label="Add subscription"
              className="aspect-square h-auto shrink-0 self-stretch rounded-none"
              size="sm"
              type="button"
            >
              <PlusIcon />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Add subscription</DialogTitle>
              <DialogDescription>Track a recurring payment.</DialogDescription>
            </DialogHeader>
            <form className="flex min-w-0 flex-col gap-3" onSubmit={addSub}>
              <Input
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (e.g. Netflix)"
                type="text"
                value={name}
              />
              <Input
                inputMode="decimal"
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                step="0.01"
                type="number"
                value={amount}
              />
              <div className="flex gap-2">
                {CYCLES.map((c) => (
                  <button
                    className={cn(
                      "flex-1 border px-3 py-2 font-medium text-sm transition-colors",
                      cycle === c.id
                        ? "border-primary bg-secondary text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                    key={c.id}
                    onClick={() => setCycle(c.id)}
                    type="button"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <DatePicker onChange={setNextBilling} value={nextBilling} />
              <DialogFooter>
                <Button className="w-full" disabled={saving} type="submit">
                  {saving ? "Saving…" : "Add subscription"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <p className="mt-3 text-muted-foreground text-sm">
        ≈ {currency.format(monthlyTotal)} / month
      </p>

      <div className="mt-4 flex flex-col divide-y divide-border/60">
        {loading ? (
          <p className="py-12 text-center text-muted-foreground text-sm">
            Loading…
          </p>
        ) : null}
        {filtered.map((sub) => (
          <SubscriptionRow key={sub.id} onRemove={removeSub} sub={sub} />
        ))}
        {loading || filtered.length > 0 || subs.length > 0 ? null : (
          <EmptyState
            description="Add your first one above."
            icon={RepeatIcon}
            title="No subscriptions yet"
          />
        )}
        {loading || filtered.length > 0 || subs.length === 0 ? null : (
          <EmptyState
            description="Nothing for this cycle."
            icon={RepeatIcon}
            title="No subscriptions"
          />
        )}
      </div>
    </div>
  );
}
