# Calendar Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Apple-Calendar-style Calendar tab to the dashboard with month/week/day views, full event CRUD backed by Supabase, and read-only overlays for personal tasks and subscription renewals.

**Architecture:** A self-contained module under `components/dashboard/calendar/`. A top-level `CalendarPanel` owns state (current date, view, events) and data fetching; presentational view components (`MonthView`, `WeekView`, `DayView`) receive a unified `CalendarItem[]` and render it. Events are created/edited via a shadcn `Dialog`; events and overlays are inspected via a `Popover`. All date math uses `date-fns`; view transitions use `motion`. Subscription recurrence is computed by a shared `lib/recurrence.ts` (extracted from `subscriptions-panel.tsx` so both tabs share semantics).

**Tech Stack:** Next 16 (App Router), React 19, Supabase JS client, `date-fns`, `motion`, Tailwind v4, existing shadcn primitives (`Dialog`, `Select`, `Input`, `DatePicker`, `Badge`, `Popover`, `ConfirmDelete`, `EmptyState`, `Button`).

---

## Testing note (read first)

**This repo has no test framework** (no Jest/Vitest/Playwright; `bun run lint` runs Biome). Per the codebase reality, the standard TDD test-first steps are replaced with this per-task verification loop:

1. Implement the change.
2. Run `bun run lint` — expect no new errors on touched files.
3. Where the change is visible, verify in the preview server (`bun --bun next dev`) via the preview tools: reload, check `preview_console_logs` for errors, `preview_snapshot`/`preview_screenshot` for correctness.
4. Commit.

Do not invent a test runner. "Verify" below always means lint + preview observation.

## File Structure

Create:
- `lib/recurrence.ts` — shared cycle-advance + occurrence helpers (extracted from subscriptions).
- `components/dashboard/calendar/calendar-types.ts` — types + color map.
- `components/dashboard/calendar/calendar-utils.ts` — range/grid math, event→item mapping, overlay building.
- `components/dashboard/calendar/event-dialog.tsx` — create/edit event form.
- `components/dashboard/calendar/item-popover.tsx` — detail popover for events (edit/delete) and overlays (read-only).
- `components/dashboard/calendar/month-view.tsx`
- `components/dashboard/calendar/week-view.tsx`
- `components/dashboard/calendar/day-view.tsx`
- `components/dashboard/calendar/calendar-panel.tsx` — top-level panel.

Modify:
- `components/dashboard/subscriptions-panel.tsx` — import `nextOccurrence`/`ADVANCE` from `lib/recurrence.ts` (remove local copies).
- `components/dashboard/dashboard-tabs.tsx` — register the Calendar tab.

Database:
- New `public.events` table + RLS (Supabase migration).

---

### Task 1: Database — `events` table + RLS

**Files:** none (Supabase migration via MCP `apply_migration`).

- [ ] **Step 1: Inspect existing tables** to confirm no `events` table exists.

Run MCP `list_tables` (schema `public`). Expected: no `events` table present.

- [ ] **Step 2: Apply the migration**

Use MCP `apply_migration` with name `create_events_table` and this SQL:

```sql
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  color text not null default 'neutral'
    check (color = any (array['neutral','blue','green','sky','purple','red'])),
  note text,
  created_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events are viewable by owner"
  on public.events for select using (auth.uid() = user_id);
create policy "events are insertable by owner"
  on public.events for insert with check (auth.uid() = user_id);
create policy "events are updatable by owner"
  on public.events for update using (auth.uid() = user_id);
create policy "events are deletable by owner"
  on public.events for delete using (auth.uid() = user_id);

create index events_user_starts_idx on public.events (user_id, starts_at);
```

- [ ] **Step 3: Verify**

Run MCP `list_tables` again. Expected: `events` present with the columns above and RLS enabled. Run MCP `get_advisors` (type `security`) — expect no new RLS-disabled warning for `events`.

- [ ] **Step 4: Commit** (migration is remote; no local file to commit — skip if nothing changed locally).

---

### Task 2: Shared recurrence helper (`lib/recurrence.ts`)

Extract subscription recurrence math so the calendar overlay and the subscriptions tab share identical semantics.

**Files:**
- Create: `lib/recurrence.ts`
- Modify: `components/dashboard/subscriptions-panel.tsx`

- [ ] **Step 1: Create `lib/recurrence.ts`**

```ts
import { addDays, addMonths, addYears } from "date-fns";

export type Cycle = "weekly" | "monthly" | "yearly";

export const ADVANCE: Record<Cycle, (d: Date) => Date> = {
  weekly: (d) => addDays(d, 7),
  monthly: (d) => addMonths(d, 1),
  yearly: (d) => addYears(d, 1),
};

/**
 * A billing date in the past just means we haven't rolled it forward yet.
 * Advance by the cycle until it lands today or later.
 */
export function nextOccurrence(iso: string, cycle: Cycle): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let date = new Date(`${iso}T00:00:00`);
  while (date < today) {
    date = ADVANCE[cycle](date);
  }
  return date;
}

/**
 * All occurrences of a recurring date that fall within [from, to] inclusive.
 * Starts from the first occurrence on/after `from`, then advances by cycle.
 */
export function occurrencesInRange(
  iso: string,
  cycle: Cycle,
  from: Date,
  to: Date
): Date[] {
  const out: Date[] = [];
  let date = new Date(`${iso}T00:00:00`);
  // Fast-forward to the window start.
  while (date < from) {
    date = ADVANCE[cycle](date);
  }
  while (date <= to) {
    out.push(new Date(date));
    date = ADVANCE[cycle](date);
  }
  return out;
}
```

- [ ] **Step 2: Refactor `subscriptions-panel.tsx` to use it**

In `components/dashboard/subscriptions-panel.tsx`:
- Remove the local `ADVANCE` const and the local `nextOccurrence` function.
- Remove the now-unused `addDays, addMonths, addYears` from the `date-fns` import (keep `format`).
- Add: `import { ADVANCE, type Cycle, nextOccurrence } from "@/lib/recurrence";`
- Remove the local `type Cycle = ...` line (now imported). Keep everything else identical.

- [ ] **Step 3: Verify**

Run: `bun run lint`
Expected: no errors. Then in preview, open the Subscriptions tab and confirm "Next <date>" labels still render correctly (behavior unchanged).

- [ ] **Step 4: Commit**

```bash
git add lib/recurrence.ts components/dashboard/subscriptions-panel.tsx
git commit -m "refactor: extract subscription recurrence into lib/recurrence"
```

---

### Task 3: Calendar types + color map (`calendar-types.ts`)

**Files:**
- Create: `components/dashboard/calendar/calendar-types.ts`

- [ ] **Step 1: Write the file**

```ts
export type EventColor =
  | "neutral"
  | "blue"
  | "green"
  | "sky"
  | "purple"
  | "red";

export const EVENT_COLOR_KEYS: EventColor[] = [
  "neutral",
  "blue",
  "green",
  "sky",
  "purple",
  "red",
];

/** Badge className per color (user-specified shadcn custom-color palette). */
export const EVENT_COLORS: Record<EventColor, string> = {
  neutral: "bg-secondary text-secondary-foreground",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  green: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  sky: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  purple:
    "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  red: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
};

/** Row as stored in Supabase. */
export type CalendarEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  color: EventColor;
  note: string | null;
};

export type CalendarView = "month" | "week" | "day";

export type ItemKind = "event" | "task" | "subscription";

/** Unified render item covering events and read-only overlays. */
export type CalendarItem = {
  id: string;
  kind: ItemKind;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: EventColor;
  /** Present only when kind === "event"; enables edit/delete. */
  event?: CalendarEvent;
  /** Present only when kind === "subscription". */
  amount?: number;
};
```

- [ ] **Step 2: Verify** — `bun run lint` (expect no errors).

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/calendar/calendar-types.ts
git commit -m "feat: calendar types and color map"
```

---

### Task 4: Calendar utils (`calendar-utils.ts`)

Range math for each view, event→item mapping, and overlay building.

**Files:**
- Create: `components/dashboard/calendar/calendar-utils.ts`

- [ ] **Step 1: Write the file**

```ts
import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { nextOccurrence, occurrencesInRange } from "@/lib/recurrence";
import type { Cycle } from "@/lib/recurrence";
import type { CalendarEvent, CalendarItem, CalendarView } from "./calendar-types";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
};

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  cycle: Cycle;
  next_billing: string | null;
};

/** The [from, to] date range visible for a given view + anchor date. */
export function viewRange(view: CalendarView, anchor: Date): {
  from: Date;
  to: Date;
} {
  if (view === "day") {
    return { from: startOfDay(anchor), to: endOfDay(anchor) };
  }
  if (view === "week") {
    return {
      from: startOfWeek(anchor, { weekStartsOn: 0 }),
      to: endOfWeek(anchor, { weekStartsOn: 0 }),
    };
  }
  // month view renders full weeks around the month
  return {
    from: startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 }),
    to: endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 }),
  };
}

export function daysInRange(from: Date, to: Date): Date[] {
  return eachDayOfInterval({ start: from, end: to });
}

export function eventToItem(ev: CalendarEvent): CalendarItem {
  return {
    id: ev.id,
    kind: "event",
    title: ev.title,
    start: new Date(ev.starts_at),
    end: new Date(ev.ends_at),
    allDay: ev.all_day,
    color: ev.color,
    event: ev,
  };
}

/** Build the read-only overlay items (tasks + subscription renewals) in range. */
export function buildOverlays(
  tasks: Task[],
  subs: Subscription[],
  from: Date,
  to: Date
): CalendarItem[] {
  const items: CalendarItem[] = [];

  for (const t of tasks) {
    if (!t.due_date) {
      continue;
    }
    const day = new Date(`${t.due_date}T00:00:00`);
    if (day >= startOfDay(from) && day <= endOfDay(to)) {
      items.push({
        id: `task-${t.id}`,
        kind: "task",
        title: t.title,
        start: day,
        end: day,
        allDay: true,
        color: "neutral",
      });
    }
  }

  for (const s of subs) {
    if (!s.next_billing) {
      continue;
    }
    const days = occurrencesInRange(s.next_billing, s.cycle, from, to);
    for (const day of days) {
      items.push({
        id: `sub-${s.id}-${day.toISOString()}`,
        kind: "subscription",
        title: s.name,
        start: day,
        end: day,
        allDay: true,
        color: "neutral",
        amount: s.amount,
      });
    }
  }

  return items;
}

/** Items whose start day matches `day` (all-day + timed alike), start-sorted. */
export function itemsOnDay(items: CalendarItem[], day: Date): CalendarItem[] {
  return items
    .filter((it) => isSameDay(it.start, day))
    .sort((a, b) => {
      if (a.allDay !== b.allDay) {
        return a.allDay ? -1 : 1;
      }
      return a.start.getTime() - b.start.getTime();
    });
}

export { nextOccurrence };
```

- [ ] **Step 2: Verify** — `bun run lint` (expect no errors).

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/calendar/calendar-utils.ts
git commit -m "feat: calendar range and overlay utilities"
```

---

### Task 5: Event dialog (`event-dialog.tsx`)

Create/edit form mirroring `SubscriptionDialog`. Reuses `Dialog`, `Input`, `DatePicker`, `Button`, and a color swatch picker.

**Files:**
- Create: `components/dashboard/calendar/event-dialog.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { format } from "date-fns";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  type CalendarEvent,
  EVENT_COLOR_KEYS,
  EVENT_COLORS,
  type EventColor,
} from "./calendar-types";

/** Combine a date and a "HH:mm" string into a Date. */
function withTime(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

export function EventDialog({
  editing,
  initialDate,
  open,
  onOpenChange,
  onSaved,
}: {
  editing: CalendarEvent | null;
  initialDate: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (ev: CalendarEvent, isNew: boolean) => void;
}) {
  const supabase = createClient();
  const isEditing = editing !== null;
  const startSeed = editing ? new Date(editing.starts_at) : initialDate;
  const endSeed = editing ? new Date(editing.ends_at) : initialDate;

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(editing?.title ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [color, setColor] = useState<EventColor>(editing?.color ?? "blue");
  const [allDay, setAllDay] = useState(editing?.all_day ?? false);
  const [day, setDay] = useState<Date>(startSeed);
  const [startTime, setStartTime] = useState(format(startSeed, "HH:mm"));
  const [endTime, setEndTime] = useState(
    format(editing ? endSeed : new Date(startSeed.getTime() + 3_600_000), "HH:mm")
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }
    const starts = allDay ? new Date(day.setHours(0, 0, 0, 0)) : withTime(day, startTime);
    const ends = allDay
      ? new Date(new Date(day).setHours(23, 59, 0, 0))
      : withTime(day, endTime);
    if (ends < starts) {
      return;
    }

    const payload = {
      title: title.trim(),
      note: note.trim() || null,
      color,
      all_day: allDay,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
    };

    setSaving(true);
    const query = isEditing
      ? supabase.from("events").update(payload).eq("id", editing.id).select().single()
      : supabase.from("events").insert(payload).select().single();
    const { data, error } = await query;
    setSaving(false);
    if (error || !data) {
      return;
    }
    onSaved(data as CalendarEvent, !isEditing);
    onOpenChange(false);
  }

  let submitLabel = isEditing ? "Save changes" : "Add event";
  if (saving) {
    submitLabel = "Saving…";
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>Add it to your calendar.</DialogDescription>
        </DialogHeader>
        <form className="flex min-w-0 flex-col gap-3" onSubmit={submit}>
          <Input
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            type="text"
            value={title}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              type="checkbox"
            />
            All day
          </label>

          <DatePicker onChange={setDay} value={day} />

          {allDay ? null : (
            <div className="flex gap-2">
              <Input
                className="flex-1"
                onChange={(e) => setStartTime(e.target.value)}
                type="time"
                value={startTime}
              />
              <Input
                className="flex-1"
                onChange={(e) => setEndTime(e.target.value)}
                type="time"
                value={endTime}
              />
            </div>
          )}

          <div className="flex gap-2">
            {EVENT_COLOR_KEYS.map((key) => (
              <button
                aria-label={key}
                aria-pressed={color === key}
                className={cn(
                  "size-7 border transition-transform",
                  EVENT_COLORS[key],
                  color === key
                    ? "scale-110 border-primary"
                    : "border-border"
                )}
                key={key}
                onClick={() => setColor(key)}
                type="button"
              />
            ))}
          </div>

          <Textarea
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            value={note}
          />

          <DialogFooter>
            <Button className="w-full" disabled={saving} type="submit">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify** — `bun run lint`. Confirm `components/ui/textarea.tsx` exports `Textarea` (it exists per repo listing); if the export name differs, adjust the import.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/calendar/event-dialog.tsx
git commit -m "feat: calendar event create/edit dialog"
```

---

### Task 6: Item popover (`item-popover.tsx`)

A wrapper that renders a trigger and, on click, a `Popover` with item details. Events show Edit/Delete; overlays are read-only.

**Files:**
- Create: `components/dashboard/calendar/item-popover.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { format } from "date-fns";
import {
  CheckIcon,
  PencilIcon,
  RepeatIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CalendarItem } from "./calendar-types";

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

export function ItemPopover({
  item,
  children,
  onEdit,
  onDelete,
}: {
  item: CalendarItem;
  children: React.ReactNode;
  onEdit: (item: CalendarItem) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const when = item.allDay
    ? format(item.start, "EEE, MMM d")
    : `${format(item.start, "EEE, MMM d")} · ${format(item.start, "p")} – ${format(item.end, "p")}`;

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-64 rounded-none p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {item.kind === "task" ? <CheckIcon className="size-4" /> : null}
            {item.kind === "subscription" ? (
              <RepeatIcon className="size-4" />
            ) : null}
            <p className="font-semibold text-sm leading-tight">{item.title}</p>
          </div>
          <p className="text-muted-foreground text-xs">{when}</p>

          {item.kind === "subscription" && item.amount != null ? (
            <p className="text-muted-foreground text-xs">
              {currency.format(item.amount)}
            </p>
          ) : null}

          {item.event?.note ? (
            <p className="whitespace-pre-wrap text-sm">{item.event.note}</p>
          ) : null}

          {item.kind === "event" && item.event ? (
            <div className="mt-1 flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  setOpen(false);
                  onEdit(item);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <PencilIcon className="size-4" /> Edit
              </Button>
              <ConfirmDelete
                description={<>This permanently removes “{item.title}”.</>}
                onConfirm={() => onDelete(item.event?.id ?? "")}
                title="Delete event?"
                triggerClassName="flex flex-1 items-center justify-center gap-1.5 border border-border bg-transparent px-3 py-1.5 text-destructive text-sm transition-colors hover:bg-card"
                triggerLabel={`Delete ${item.title}`}
              >
                <Trash2Icon className="size-4" /> Delete
              </ConfirmDelete>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              {item.kind === "task" ? "Task" : "Subscription"} · manage in its tab
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Verify** — `bun run lint`. Confirm `ConfirmDelete` accepts `triggerClassName`, `triggerLabel`, `onConfirm`, `title`, `description`, and children (it does, per `subscriptions-panel.tsx` usage). Adjust if its prop names differ.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/calendar/item-popover.tsx
git commit -m "feat: calendar item detail popover"
```

---

### Task 7: Month view (`month-view.tsx`)

**Files:**
- Create: `components/dashboard/calendar/month-view.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client";

import { format, isSameMonth, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  type CalendarItem,
  EVENT_COLORS,
} from "./calendar-types";
import { daysInRange, itemsOnDay, viewRange } from "./calendar-utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS = 3;

export function MonthView({
  anchor,
  items,
  onSelectDay,
  onSelectItem,
  itemRef,
}: {
  anchor: Date;
  items: CalendarItem[];
  onSelectDay: (day: Date) => void;
  onSelectItem: (item: CalendarItem) => void;
  itemRef: (item: CalendarItem, node: HTMLButtonElement | null) => void;
}) {
  const { from, to } = viewRange("month", anchor);
  const days = daysInRange(from, to);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 border-border/60 border-b">
        {WEEKDAYS.map((w) => (
          <div
            className="py-1.5 text-center font-medium text-muted-foreground text-xs"
            key={w}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayItems = itemsOnDay(items, day);
          const inMonth = isSameMonth(day, anchor);
          return (
            <button
              className={cn(
                "flex min-h-20 flex-col gap-1 border-border/40 border-r border-b p-1 text-left transition-colors hover:bg-accent",
                !inMonth && "bg-muted/30 text-muted-foreground"
              )}
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              type="button"
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center self-end text-xs tabular-nums",
                  isToday(day) &&
                    "bg-primary font-semibold text-primary-foreground"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="flex flex-col gap-0.5">
                {dayItems.slice(0, MAX_CHIPS).map((it) => (
                  <button
                    className="w-full text-left"
                    key={it.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectItem(it);
                    }}
                    ref={(node) => itemRef(it, node)}
                    type="button"
                  >
                    <Badge
                      className={cn(
                        "w-full justify-start truncate",
                        EVENT_COLORS[it.color]
                      )}
                      size="sm"
                    >
                      {it.title}
                    </Badge>
                  </button>
                ))}
                {dayItems.length > MAX_CHIPS ? (
                  <span className="pl-1 text-[10px] text-muted-foreground">
                    +{dayItems.length - MAX_CHIPS} more
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

Note on `itemRef`: the popover needs a trigger anchored to the chip. The panel keeps a
`Map<string, HTMLElement>` via `itemRef` and renders one controlled `ItemPopover` against
the selected item's node. Simpler alternative allowed during implementation: wrap each chip
directly in `<ItemPopover>` instead of the ref map — if you do, drop the `itemRef` prop and
`onSelectItem` becomes unused here. Prefer whichever is cleaner once wiring Task 10; keep it
consistent across all three views.

- [ ] **Step 2: Verify** — `bun run lint`.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/calendar/month-view.tsx
git commit -m "feat: calendar month view"
```

---

### Task 8: Week + Day views (`week-view.tsx`, `day-view.tsx`)

Time-grid columns. Day view is the single-column case; Week is 7 columns. To keep files
focused and DRY, put the shared hour-column renderer in `day-view.tsx` and have `week-view.tsx`
compose 7 day columns.

**Files:**
- Create: `components/dashboard/calendar/day-view.tsx`
- Create: `components/dashboard/calendar/week-view.tsx`

- [ ] **Step 1: Write `day-view.tsx`**

```tsx
"use client";

import { format, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type CalendarItem, EVENT_COLORS } from "./calendar-types";
import { itemsOnDay } from "./calendar-utils";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_PX = 48;

/** A single day column: all-day chips on top, timed items positioned by hour. */
export function DayColumn({
  day,
  items,
  onSelectItem,
  onCreateAt,
  showHourLabels,
}: {
  day: Date;
  items: CalendarItem[];
  onSelectItem: (item: CalendarItem) => void;
  onCreateAt: (day: Date, hour: number) => void;
  showHourLabels: boolean;
}) {
  const dayItems = itemsOnDay(items, day);
  const allDay = dayItems.filter((it) => it.allDay);
  const timed = dayItems.filter((it) => !it.allDay);

  return (
    <div className="flex min-w-0 flex-1 flex-col border-border/40 border-r">
      <div
        className={cn(
          "sticky top-0 z-10 flex flex-col items-center gap-1 border-border/60 border-b bg-background py-1.5",
          isToday(day) && "text-foreground"
        )}
      >
        <span className="text-muted-foreground text-xs">
          {format(day, "EEE")}
        </span>
        <span
          className={cn(
            "flex size-6 items-center justify-center text-sm tabular-nums",
            isToday(day) && "bg-primary font-semibold text-primary-foreground"
          )}
        >
          {format(day, "d")}
        </span>
        <div className="flex w-full flex-col gap-0.5 px-1">
          {allDay.map((it) => (
            <button key={it.id} onClick={() => onSelectItem(it)} type="button">
              <Badge
                className={cn("w-full justify-start truncate", EVENT_COLORS[it.color])}
                size="sm"
              >
                {it.title}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <div className="relative" style={{ height: HOURS.length * HOUR_PX }}>
        {HOURS.map((h) => (
          <button
            className="absolute inset-x-0 border-border/30 border-b hover:bg-accent/40"
            key={h}
            onClick={() => onCreateAt(day, h)}
            style={{ top: h * HOUR_PX, height: HOUR_PX }}
            type="button"
          >
            {showHourLabels ? (
              <span className="absolute top-0 left-1 text-[10px] text-muted-foreground">
                {format(new Date().setHours(h, 0, 0, 0), "ha")}
              </span>
            ) : null}
          </button>
        ))}
        {timed.map((it) => {
          const top = (it.start.getHours() + it.start.getMinutes() / 60) * HOUR_PX;
          const durHrs = Math.max(
            0.5,
            (it.end.getTime() - it.start.getTime()) / 3_600_000
          );
          return (
            <button
              className="absolute inset-x-0.5"
              key={it.id}
              onClick={() => onSelectItem(it)}
              style={{ top, height: durHrs * HOUR_PX }}
              type="button"
            >
              <Badge
                className={cn(
                  "h-full w-full flex-col items-start justify-start truncate",
                  EVENT_COLORS[it.color]
                )}
                size="sm"
              >
                {it.title}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DayView(props: {
  anchor: Date;
  items: CalendarItem[];
  onSelectItem: (item: CalendarItem) => void;
  onCreateAt: (day: Date, hour: number) => void;
}) {
  return (
    <div className="flex">
      <DayColumn
        day={props.anchor}
        items={props.items}
        onCreateAt={props.onCreateAt}
        onSelectItem={props.onSelectItem}
        showHourLabels
      />
    </div>
  );
}
```

- [ ] **Step 2: Write `week-view.tsx`**

```tsx
"use client";

import { Fragment } from "react";
import { DayColumn } from "./day-view";
import type { CalendarItem } from "./calendar-types";
import { daysInRange, viewRange } from "./calendar-utils";

export function WeekView({
  anchor,
  items,
  onSelectItem,
  onCreateAt,
}: {
  anchor: Date;
  items: CalendarItem[];
  onSelectItem: (item: CalendarItem) => void;
  onCreateAt: (day: Date, hour: number) => void;
}) {
  const { from, to } = viewRange("week", anchor);
  const days = daysInRange(from, to);

  return (
    <div className="flex overflow-x-auto">
      {days.map((day, i) => (
        <Fragment key={day.toISOString()}>
          <DayColumn
            day={day}
            items={items}
            onCreateAt={onCreateAt}
            onSelectItem={onSelectItem}
            showHourLabels={i === 0}
          />
        </Fragment>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify** — `bun run lint`.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/calendar/day-view.tsx components/dashboard/calendar/week-view.tsx
git commit -m "feat: calendar week and day views"
```

---

### Task 9: Calendar panel (`calendar-panel.tsx`)

Owns state + data + view switching + nav + CRUD, and mounts the dialog + a single controlled popover.

**Files:**
- Create: `components/dashboard/calendar/calendar-panel.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  format,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import { CalendarPlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  type CalendarEvent,
  type CalendarItem,
  type CalendarView,
} from "./calendar-types";
import {
  buildOverlays,
  eventToItem,
  type Subscription,
  type Task,
  viewRange,
} from "./calendar-utils";
import { DayView } from "./day-view";
import { EventDialog } from "./event-dialog";
import { ItemPopover } from "./item-popover";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";

const VIEWS: CalendarView[] = ["month", "week", "day"];

export function CalendarPanel() {
  const supabase = createClient();
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [dialogDate, setDialogDate] = useState<Date>(new Date());
  const [selected, setSelected] = useState<CalendarItem | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("events").select("*"),
      supabase.from("tasks").select("id,title,done,due_date"),
      supabase.from("subscriptions").select("id,name,amount,cycle,next_billing"),
    ]).then(([ev, tk, sb]) => {
      if (!active) {
        return;
      }
      if (ev.data) {
        setEvents(ev.data as CalendarEvent[]);
      }
      if (tk.data) {
        setTasks(tk.data as Task[]);
      }
      if (sb.data) {
        setSubs(sb.data as Subscription[]);
      }
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  const items = useMemo(() => {
    const { from, to } = viewRange(view, anchor);
    return [
      ...events.map(eventToItem),
      ...buildOverlays(tasks, subs, from, to),
    ];
  }, [events, tasks, subs, view, anchor]);

  function go(dir: -1 | 1) {
    setAnchor((d) => {
      if (view === "month") {
        return dir === 1 ? addMonths(d, 1) : subMonths(d, 1);
      }
      if (view === "week") {
        return dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1);
      }
      return dir === 1 ? addDays(d, 1) : subDays(d, 1);
    });
  }

  function openCreate(day: Date, hour?: number) {
    const d = new Date(day);
    if (hour != null) {
      d.setHours(hour, 0, 0, 0);
    }
    setEditing(null);
    setDialogDate(d);
    setDialogOpen(true);
  }

  function openEdit(item: CalendarItem) {
    if (item.event) {
      setEditing(item.event);
      setDialogDate(new Date(item.event.starts_at));
      setDialogOpen(true);
    }
  }

  function selectItem(item: CalendarItem) {
    setSelected(item);
    setPopoverOpen(true);
  }

  function handleSaved(saved: CalendarEvent, isNew: boolean) {
    setEvents((prev) =>
      isNew ? [...prev, saved] : prev.map((e) => (e.id === saved.id ? saved : e))
    );
  }

  async function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setPopoverOpen(false);
    await supabase.from("events").delete().eq("id", id);
  }

  const heading =
    view === "month"
      ? format(anchor, "MMMM yyyy")
      : format(anchor, "MMM d, yyyy");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button onClick={() => go(-1)} size="sm" type="button" variant="outline">
            ‹
          </Button>
          <Button onClick={() => setAnchor(new Date())} size="sm" type="button" variant="outline">
            Today
          </Button>
          <Button onClick={() => go(1)} size="sm" type="button" variant="outline">
            ›
          </Button>
        </div>
        <span className="font-serif text-lg italic">{heading}</span>
        <Button aria-label="New event" onClick={() => openCreate(new Date())} size="sm" type="button">
          <CalendarPlusIcon className="size-4" />
        </Button>
      </div>

      <div className="flex gap-1">
        {VIEWS.map((v) => (
          <button
            className={cn(
              "flex-1 border px-3 py-1.5 font-medium text-sm capitalize transition-colors",
              view === v
                ? "border-primary bg-secondary text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
            key={v}
            onClick={() => setView(v)}
            type="button"
          >
            {v}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key={view}
          transition={{ duration: 0.15 }}
        >
          {view === "month" ? (
            <MonthView
              anchor={anchor}
              items={items}
              itemRef={() => {
                // popover anchoring handled via controlled ItemPopover below
              }}
              onSelectDay={(day) => {
                setAnchor(day);
                setView("day");
              }}
              onSelectItem={selectItem}
            />
          ) : null}
          {view === "week" ? (
            <WeekView
              anchor={anchor}
              items={items}
              onCreateAt={(day, hour) => openCreate(day, hour)}
              onSelectItem={selectItem}
            />
          ) : null}
          {view === "day" ? (
            <DayView
              anchor={anchor}
              items={items}
              onCreateAt={(day, hour) => openCreate(day, hour)}
              onSelectItem={selectItem}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Controlled detail popover for the selected item. */}
      {selected ? (
        <ItemPopoverController
          item={selected}
          onDelete={handleDelete}
          onEdit={openEdit}
          onOpenChange={setPopoverOpen}
          open={popoverOpen}
        />
      ) : null}

      <EventDialog
        editing={editing}
        initialDate={dialogDate}
        key={editing?.id ?? dialogDate.toISOString()}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
        open={dialogOpen}
      />
    </div>
  );
}

/**
 * Renders the detail popover anchored to the viewport center-top. The chips
 * themselves trigger `onSelectItem`; this controller shows details. Uses
 * ItemPopover with a hidden anchor.
 */
function ItemPopoverController({
  item,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  item: CalendarItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (item: CalendarItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={open ? "block" : "hidden"}>
      <ItemPopover item={item} onDelete={onDelete} onEdit={onEdit}>
        <span className="sr-only">Selected item</span>
      </ItemPopover>
    </div>
  );
}
```

**Implementation note (resolve during this task):** the controlled-popover-with-hidden-anchor
approach above is awkward. Prefer the simpler alternative flagged in Task 7: wrap each chip in
its own `<ItemPopover>` inside the view components (pass `onEdit`/`onDelete` down), and drop
`ItemPopoverController`, `selected`, `popoverOpen`, and `selectItem` from the panel. Choose one
approach and make month/week/day consistent. The panel still owns `openCreate`, `openEdit`,
`handleSaved`, `handleDelete`, and passes `onEdit`/`onDelete` to the views. Verify the chosen
approach renders a working popover in the preview before moving on.

- [ ] **Step 2: Verify** — `bun run lint`. Confirm the `motion/react` import path matches how `motion` is imported elsewhere in the repo (grep `from "motion`); adjust if the repo uses `motion` differently.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/calendar/calendar-panel.tsx
git commit -m "feat: calendar panel with views, nav, and CRUD"
```

---

### Task 10: Register the Calendar tab

**Files:**
- Modify: `components/dashboard/dashboard-tabs.tsx`

- [ ] **Step 1: Add the import + tab**

- Add `CalendarDaysIcon` to the `lucide-react` import.
- Add `import { CalendarPanel } from "./calendar-panel";` (note: file lives at
  `components/dashboard/calendar/calendar-panel.tsx`, so import path is
  `"./calendar/calendar-panel"`).
- Add `"calendar"` to the `TabId` union.
- Add to `TABS` (place after `overview`):

```tsx
{
  id: "calendar",
  label: "Calendar",
  icon: CalendarDaysIcon,
  description: "Your schedule, tasks and renewals.",
},
```

- Add a branch to `renderPanel()`:

```tsx
if (active === "calendar") {
  return <CalendarPanel />;
}
```

- [ ] **Step 2: Verify**

Run: `bun run lint`. Then in preview: open the dashboard (PIN-locked — the reviewer/executor
must be logged in and past the PIN gate), click the **Calendar** tab. Confirm:
- Month grid renders with today highlighted; `preview_console_logs` shows no errors.
- Create an event via the **+** button; it appears on its day.
- Click an event chip → detail popover → Edit changes it; Delete removes it.
- Switch Month/Week/Day; transitions are smooth and data is correct per view.
- A task with a due date shows a check chip; a subscription shows a repeat chip on its
  renewal day(s).

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/dashboard-tabs.tsx
git commit -m "feat: add Calendar tab to dashboard"
```

---

### Task 11: Final verification pass

- [ ] **Step 1:** Run `bun run lint` on the whole repo — expect clean.
- [ ] **Step 2:** Run `bun run build` — expect a successful production build (catches type errors the dev server may tolerate).
- [ ] **Step 3:** In preview, re-run the Task 10 verification checklist end to end, including mobile width (`preview_resize` mobile) and dark mode (`preview_resize` colorScheme dark) — confirm chips, grid, and time-columns remain legible.
- [ ] **Step 4:** Capture a `preview_screenshot` of the month view with events + overlays as proof.
- [ ] **Step 5:** If anything is unpolished (chip overflow, cramped week columns at mobile width), fix and re-verify before declaring done.

---

## Open decisions deferred to implementation

- **Popover anchoring** (Task 7 / Task 9): choose per-chip `ItemPopover` vs a single controlled popover. Recommendation: per-chip — simpler and correctly anchored. Make all three views consistent.
- **`motion` import path**: match the repo's existing convention (grep before writing Task 9).
- **Currency**: overlay popover uses CAD to match `subscriptions-panel.tsx`; keep consistent.
