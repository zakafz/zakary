"use client";

import { format } from "date-fns";
import { CalendarIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { type ProjectColumn, tagChip } from "@/data/projects";
import { cn } from "@/lib/utils";

function asString(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function asTags(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

const INPUT =
  "flex h-9 w-full rounded-none border border-border bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring";

/* ----------------------------- read-only view ---------------------------- */

export function ClientCellValue({
  column,
  value,
}: {
  column: ProjectColumn;
  value: unknown;
}) {
  if (column.type === "tags") {
    const ids = asTags(value);
    if (ids.length === 0) {
      return <span className="text-muted-foreground/40">—</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {ids.map((id) => {
          const opt = column.options.find((o) => o.id === id);
          if (!opt) {
            return null;
          }
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                tagChip(opt.color)
              )}
              key={id}
            >
              {opt.label}
            </span>
          );
        })}
      </div>
    );
  }

  if (column.type === "date") {
    const raw = asString(value);
    return raw ? (
      <span>{format(new Date(`${raw}T00:00:00`), "MMM d, yyyy")}</span>
    ) : (
      <span className="text-muted-foreground/40">—</span>
    );
  }

  const text = asString(value);
  return text ? (
    <span className="whitespace-pre-wrap break-words">{text}</span>
  ) : (
    <span className="text-muted-foreground/40">—</span>
  );
}

/* ------------------------------- editors --------------------------------- */

function DateField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const raw = asString(value);
  const date = raw ? new Date(`${raw}T00:00:00`) : undefined;

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          className="w-full justify-start rounded-none font-normal"
          type="button"
          variant="outline"
        >
          <CalendarIcon />
          {date ? (
            format(date, "PPP")
          ) : (
            <span className="text-muted-foreground">Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          autoFocus
          mode="single"
          onSelect={(d) => {
            onChange(d ? format(d, "yyyy-MM-dd") : null);
            setOpen(false);
          }}
          selected={date}
        />
        {date ? (
          <Button
            className="w-full rounded-none"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            size="sm"
            type="button"
            variant="ghost"
          >
            Clear
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function TagField({
  column,
  value,
  onChange,
}: {
  column: ProjectColumn;
  value: unknown;
  onChange: (value: string[]) => void;
}) {
  const selected = asTags(value);

  function toggle(id: string) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id]
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className="h-auto min-h-9 w-full flex-wrap justify-start gap-1 rounded-none py-1.5 font-normal"
          type="button"
          variant="outline"
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground">Select tags…</span>
          ) : (
            selected.map((id) => {
              const opt = column.options.find((o) => o.id === id);
              return opt ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                    tagChip(opt.color)
                  )}
                  key={id}
                >
                  {opt.label}
                </span>
              ) : null;
            })
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-1">
        {column.options.length === 0 ? (
          <p className="p-2 text-muted-foreground text-sm">
            No tags defined. Add some from the column's tag settings.
          </p>
        ) : (
          column.options.map((opt) => (
            <button
              className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-secondary"
              key={opt.id}
              onClick={() => toggle(opt.id)}
              type="button"
            >
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                  tagChip(opt.color)
                )}
              >
                {opt.label}
              </span>
              {selected.includes(opt.id) ? (
                <CheckIcon className="size-4" />
              ) : null}
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}

export function ClientCellEditor({
  column,
  value,
  onChange,
}: {
  column: ProjectColumn;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (column.type === "tags") {
    return <TagField column={column} onChange={onChange} value={value} />;
  }
  if (column.type === "date") {
    return <DateField onChange={onChange} value={value} />;
  }
  if (column.type === "text") {
    return (
      <Textarea
        aria-label={column.name}
        className="rounded-none border-border"
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        value={asString(value)}
      />
    );
  }
  return (
    <input
      aria-label={column.name}
      className={INPUT}
      inputMode={column.type === "number" ? "decimal" : "text"}
      onChange={(e) => onChange(e.target.value)}
      type={column.type === "phone" ? "tel" : column.type}
      value={asString(value)}
    />
  );
}
