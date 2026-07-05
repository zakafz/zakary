"use client";

import { format } from "date-fns";
import {
  CoinsIcon,
  Loader2Icon,
  PaperclipIcon,
  PlusIcon,
  ReceiptIcon,
  XIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SwipeRow } from "@/components/dashboard/swipe-row";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { currency, type EntryKind, type ProjectEntry } from "@/data/projects";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const RECEIPT_BUCKET = "project-receipts";

/** Uploads a receipt file to storage and reports its public URL to the parent. */
function ReceiptPicker({
  url,
  name,
  onChange,
}: {
  url: string | null;
  name: string | null;
  onChange: (url: string | null, name: string | null) => void;
}) {
  const supabase = createClient();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    setError(null);
    const ext = file.name.split(".").pop() ?? "pdf";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(path, file, { upsert: false });
    if (uploadError) {
      setError(uploadError.message);
    } else {
      const { data } = supabase.storage.from(RECEIPT_BUCKET).getPublicUrl(path);
      onChange(data.publicUrl, file.name);
    }
    setUploading(false);
  }

  function clear() {
    onChange(null, null);
    setError(null);
    if (input.current) {
      input.current.value = "";
    }
  }

  return (
    <>
      <input
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFile}
        ref={input}
        type="file"
      />
      {url ? (
        <div className="flex items-center gap-2 border border-border px-3 py-2 text-sm">
          <PaperclipIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate">
            {name ?? "Receipt attached"}
          </span>
          <button
            aria-label="Remove receipt"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={clear}
            type="button"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      ) : (
        <Button
          className="w-full rounded-none"
          disabled={uploading}
          onClick={() => input.current?.click()}
          type="button"
          variant="outline"
        >
          {uploading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <PaperclipIcon className="size-4" />
          )}
          {uploading ? "Uploading…" : "Attach receipt"}
        </Button>
      )}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </>
  );
}

export function ProjectEntries({
  kind,
  title,
  addTitle,
  labelPlaceholder,
  entries,
  onAdd,
  onRemove,
  emptyText,
  inline = false,
}: {
  kind: EntryKind;
  title: string;
  addTitle: string;
  labelPlaceholder: string;
  entries: ProjectEntry[];
  onAdd: (
    label: string,
    amount: number,
    date: string,
    receiptUrl: string | null
  ) => Promise<void>;
  onRemove: (id: string) => void;
  emptyText: string;
  /** Render the add form inline instead of a modal dialog (for use inside a Sheet). */
  inline?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const isIncome = kind === "income";
  const EmptyIcon = isIncome ? CoinsIcon : ReceiptIcon;

  function reset() {
    setLabel("");
    setAmount("");
    setDate(new Date());
    setReceiptUrl(null);
    setReceiptName(null);
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const value = Number.parseFloat(amount);
    if (!(label.trim() && Number.isFinite(value) && value > 0)) {
      return;
    }
    setSaving(true);
    await onAdd(
      label.trim(),
      Math.abs(value),
      format(date, "yyyy-MM-dd"),
      receiptUrl
    );
    setSaving(false);
    reset();
    setOpen(false);
  }

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const showInlineForm = inline && open;

  const formEl = (
    <form className="flex min-w-0 flex-col gap-4" onSubmit={submit}>
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
        placeholder={labelPlaceholder}
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
        onClick={() => submit()}
        type="button"
      >
        {saving ? "Adding…" : "Add"}
      </Button>
    </form>
  );

  const addButton = inline ? (
    <Button
      aria-label={addTitle}
      className="aspect-square size-9 shrink-0 rounded-none"
      onClick={() => {
        setOpen((v) => !v);
        reset();
      }}
      size="sm"
      type="button"
      variant={open ? "secondary" : "default"}
    >
      <PlusIcon />
    </Button>
  ) : (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          reset();
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          aria-label={addTitle}
          className="aspect-square size-9 shrink-0 rounded-none"
          size="sm"
          type="button"
        >
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{addTitle}</DialogTitle>
          <DialogDescription>
            {isIncome ? "Log money coming in." : "Log a cost."}
          </DialogDescription>
        </DialogHeader>
        {formEl}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          {title}
        </h3>
        {addButton}
      </div>

      {showInlineForm ? (
        <div className="mt-3 border border-border p-3">{formEl}</div>
      ) : null}

      <div className="mt-2 flex flex-col divide-y divide-border/60">
        {sorted.map((entry) => (
          <SwipeRow
            deleteDescription={
              <>
                This permanently removes “{entry.label}”. This can’t be undone.
              </>
            }
            deleteLabel={`Delete ${entry.label}`}
            deleteTitle="Delete entry?"
            key={entry.id}
            onDelete={() => onRemove(entry.id)}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-semibold text-[15px] leading-tight">
                {entry.label}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground text-sm">
                {new Date(`${entry.date}T00:00:00`).toLocaleDateString(
                  "en-CA",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )}
                {entry.receipt_url ? (
                  <a
                    className="inline-flex items-center gap-1 text-foreground/70 underline-offset-2 hover:text-foreground hover:underline"
                    href={entry.receipt_url}
                    onClick={(e) => e.stopPropagation()}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <PaperclipIcon className="size-3.5" />
                    Receipt
                  </a>
                ) : null}
              </span>
            </div>
            <span
              className={cn(
                "shrink-0 font-semibold text-[15px] tabular-nums",
                isIncome ? "text-success" : "text-foreground"
              )}
            >
              {isIncome ? "+ " : "− "}
              {currency.format(entry.amount)}
            </span>
          </SwipeRow>
        ))}
        {entries.length === 0 ? (
          <EmptyState icon={EmptyIcon} title={emptyText} />
        ) : null}
      </div>
    </div>
  );
}
