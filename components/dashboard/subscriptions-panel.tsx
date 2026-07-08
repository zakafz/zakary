"use client";

import { format } from "date-fns";
import {
  BookOpenIcon,
  Clapperboard,
  CloudIcon,
  Code2Icon,
  CreditCardIcon,
  DumbbellIcon,
  Gamepad2Icon,
  ImageIcon,
  Loader2Icon,
  type LucideIcon,
  MusicIcon,
  NewspaperIcon,
  PencilIcon,
  PlusIcon,
  RepeatIcon,
  ShoppingBagIcon,
  SmartphoneIcon,
  SparklesIcon,
  Trash2Icon,
  TvIcon,
  ZapIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Cycle, nextOccurrence } from "@/lib/recurrence";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Subscription = {
  id: string;
  name: string;
  amount: number;
  cycle: Cycle;
  next_billing: string | null;
  icon: string | null;
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

// Curated lucide icons a subscription can be tagged with. The key is what we
// persist in the `icon` column; unknown/empty values fall back to Repeat.
const SUB_ICONS: Record<string, LucideIcon> = {
  repeat: RepeatIcon,
  music: MusicIcon,
  video: Clapperboard,
  tv: TvIcon,
  cloud: CloudIcon,
  gaming: Gamepad2Icon,
  fitness: DumbbellIcon,
  news: NewspaperIcon,
  utility: ZapIcon,
  phone: SmartphoneIcon,
  shopping: ShoppingBagIcon,
  dev: Code2Icon,
  ai: SparklesIcon,
  reading: BookOpenIcon,
  card: CreditCardIcon,
};

const ICON_KEYS = Object.keys(SUB_ICONS);
const DEFAULT_ICON = "repeat";
const ICON_BUCKET = "subscription-icons";
const HTTP_URL = /^https?:\/\//;

/** An uploaded image icon is stored as a URL; curated icons are short keys. */
export function isImageIcon(icon: string | null): icon is string {
  return !!icon && HTTP_URL.test(icon);
}

export function subIcon(key: string | null): LucideIcon {
  return (key && SUB_ICONS[key]) || RepeatIcon;
}

const REVEAL = 64;

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {ICON_KEYS.map((key) => {
        const Icon = SUB_ICONS[key];
        const active = key === value;
        return (
          <button
            aria-label={key}
            aria-pressed={active}
            className={cn(
              "flex aspect-square items-center justify-center border transition-colors",
              active
                ? "border-primary bg-secondary text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
            key={key}
            onClick={() => onChange(key)}
            type="button"
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}

function SubscriptionRow({
  sub,
  onEdit,
  onRemove,
}: {
  sub: Subscription;
  onEdit: (sub: Subscription) => void;
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
    setOffset(Math.max(-REVEAL, Math.min(REVEAL, startOffset.current + delta)));
  }
  function onPointerUp() {
    if (!dragging) {
      return;
    }
    setDragging(false);
    setOffset((current) => {
      if (current < -REVEAL / 2) {
        return -REVEAL;
      }
      if (current > REVEAL / 2) {
        return REVEAL;
      }
      return 0;
    });
  }

  function handleEdit() {
    setOffset(0);
    onEdit(sub);
  }

  const nextLabel = sub.next_billing
    ? nextOccurrence(sub.next_billing, sub.cycle).toLocaleDateString("en-CA", {
        month: "short",
        day: "numeric",
      })
    : null;
  const Icon = subIcon(sub.icon);

  return (
    <div className="relative overflow-hidden">
      {/* Edit action revealed on right-swipe */}
      <button
        aria-label={`Edit ${sub.name}`}
        className="absolute inset-y-0 left-0 flex items-center justify-center bg-primary pl-1 text-primary-foreground"
        onClick={handleEdit}
        style={{ width: REVEAL }}
        type="button"
      >
        <PencilIcon className="size-5" />
      </button>

      {/* Delete action revealed on left-swipe */}
      <ConfirmDelete
        description={
          <>
            This permanently removes the “{sub.name}” subscription. This can’t
            be undone.
          </>
        }
        onConfirm={() => onRemove(sub.id)}
        title="Delete subscription?"
        triggerClassName="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive pr-1 text-white"
        triggerLabel={`Delete ${sub.name}`}
        triggerStyle={{ width: REVEAL }}
      >
        <Trash2Icon className="size-5" />
      </ConfirmDelete>

      <div
        className={cn(
          "flex touch-pan-y items-center gap-3 bg-background py-3",
          offset < 0 && "pr-4",
          offset > 0 && "pl-4"
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
        <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary text-secondary-foreground">
          {isImageIcon(sub.icon) ? (
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="44px"
              src={sub.icon}
            />
          ) : (
            <Icon className="size-5" />
          )}
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

function SubscriptionDialog({
  editing,
  open,
  onOpenChange,
  onSaved,
}: {
  editing: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (sub: Subscription, isNew: boolean) => void;
}) {
  const supabase = createClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(editing?.name ?? "");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [cycle, setCycle] = useState<Cycle>(editing?.cycle ?? "monthly");
  const [icon, setIcon] = useState(editing?.icon ?? DEFAULT_ICON);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(ICON_BUCKET)
      .upload(path, file, { upsert: false });
    if (!error) {
      const { data } = supabase.storage.from(ICON_BUCKET).getPublicUrl(path);
      setIcon(data.publicUrl);
    }
    setUploading(false);
  }
  const [nextBilling, setNextBilling] = useState<Date>(
    editing?.next_billing
      ? nextOccurrence(editing.next_billing, editing.cycle)
      : new Date()
  );

  const isEditing = editing !== null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number.parseFloat(amount);
    if (!(name.trim() && Number.isFinite(value) && value > 0)) {
      return;
    }
    const payload = {
      name: name.trim(),
      amount: Math.abs(value),
      cycle,
      icon,
      next_billing: format(nextBilling, "yyyy-MM-dd"),
    };

    setSaving(true);
    const query = isEditing
      ? supabase
          .from("subscriptions")
          .update(payload)
          .eq("id", editing.id)
          .select()
          .single()
      : supabase.from("subscriptions").insert(payload).select().single();
    const { data, error } = await query;
    setSaving(false);

    if (error || !data) {
      return;
    }
    onSaved(data as Subscription, !isEditing);
    onOpenChange(false);
  }

  let submitLabel = isEditing ? "Save changes" : "Add subscription";
  if (saving) {
    submitLabel = "Saving…";
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit subscription" : "Add subscription"}
          </DialogTitle>
          <DialogDescription>Track a recurring payment.</DialogDescription>
        </DialogHeader>
        <form className="flex min-w-0 flex-col gap-3" onSubmit={submit}>
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
          <div className="flex flex-col gap-2">
            <span className="font-medium text-muted-foreground text-sm">
              Icon
            </span>
            <div className="flex items-center gap-3">
              <button
                aria-label="Upload image icon"
                aria-pressed={isImageIcon(icon)}
                className={cn(
                  "relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-secondary text-muted-foreground transition-colors",
                  isImageIcon(icon) ? "border-primary" : "border-border"
                )}
                onClick={() => fileInput.current?.click()}
                type="button"
              >
                {(() => {
                  if (uploading) {
                    return <Loader2Icon className="size-5 animate-spin" />;
                  }
                  if (isImageIcon(icon)) {
                    return (
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        sizes="44px"
                        src={icon}
                      />
                    );
                  }
                  return <ImageIcon className="size-5" />;
                })()}
              </button>
              <span className="text-muted-foreground text-sm">
                {isImageIcon(icon)
                  ? "Tap to replace, or pick an icon below"
                  : "Upload an image, or pick an icon below"}
              </span>
              <input
                accept="image/*"
                className="hidden"
                onChange={handleFile}
                ref={fileInput}
                type="file"
              />
            </div>
            <IconPicker onChange={setIcon} value={icon} />
          </div>
          <DatePicker onChange={setNextBilling} value={nextBilling} />
          <DialogFooter>
            <Button
              className="w-full"
              disabled={saving || uploading}
              type="submit"
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SubscriptionsPanel() {
  const supabase = createClient();
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Cycle | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);

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

  function openAdd() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(sub: Subscription) {
    setEditing(sub);
    setDialogOpen(true);
  }

  function handleSaved(saved: Subscription, isNew: boolean) {
    setSubs((prev) => {
      const next = isNew
        ? [...prev, saved]
        : prev.map((s) => (s.id === saved.id ? saved : s));
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });
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
        <Button
          aria-label="Add subscription"
          className="aspect-square h-auto shrink-0 self-stretch rounded-none"
          onClick={openAdd}
          size="sm"
          type="button"
        >
          <PlusIcon />
        </Button>
      </div>

      <SubscriptionDialog
        editing={editing}
        key={editing?.id ?? "new"}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
        open={dialogOpen}
      />

      <p className="mt-3 text-muted-foreground text-sm">
        ≈ {currency.format(monthlyTotal)} / month
      </p>

      <div className="mt-4 flex flex-col divide-y divide-border/60">
        {loading ? (
          <p className="shimmer py-12 text-center text-muted-foreground text-sm">
            Loading…
          </p>
        ) : null}
        {filtered.map((sub) => (
          <SubscriptionRow
            key={sub.id}
            onEdit={openEdit}
            onRemove={removeSub}
            sub={sub}
          />
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
