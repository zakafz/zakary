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
import type { Cycle } from "@/lib/recurrence";
import { occurrencesInRange } from "@/lib/recurrence";
import type {
  CalendarEvent,
  CalendarItem,
  CalendarView,
  EventColor,
} from "./calendar-types";

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
  color: EventColor;
};

/** The [from, to] date range visible for a given view + anchor date. */
export function viewRange(
  view: CalendarView,
  anchor: Date
): {
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
        color: s.color,
        amount: s.amount,
      });
    }
  }

  return items;
}

export type ProjectMeta = {
  id: string;
  type: "business" | "project";
  name: string;
};
export type ClientRow = {
  id: string;
  project_id: string;
  name: string;
  data: Record<string, unknown> | null;
};
export type DateColumn = { id: string; project_id: string };
export type PaymentRow = {
  id: string;
  project_id: string;
  label: string;
  date: string;
};

/** A personal finance transaction — the source of the daily money totals. */
export type MoneyTxn = {
  amount: number;
  type: "purchase" | "transfer" | "deposit";
  date: string;
};

/** Income/expense totals for a single day, keyed by `yyyy-MM-dd`. */
export type DayMoney = { income: number; expense: number };

/**
 * Aggregate personal transactions into per-day income/expense totals — the same
 * rows the finance trends use, so the calendar matches. Transfers (e.g. balance
 * adjustments) are excluded; income is any money in, expense is a purchase out.
 * Keyed by the stored `yyyy-MM-dd` string so views can look a day up directly.
 */
export function moneyByDay(txns: MoneyTxn[]): Map<string, DayMoney> {
  const map = new Map<string, DayMoney>();
  for (const txn of txns) {
    if (txn.type === "transfer") {
      continue;
    }
    const day = map.get(txn.date) ?? { income: 0, expense: 0 };
    if (txn.amount > 0) {
      day.income += txn.amount;
    } else if (txn.type === "purchase") {
      day.expense += Math.abs(txn.amount);
    }
    map.set(txn.date, day);
  }
  return map;
}

export type ProjectOverlaySource = {
  projects: ProjectMeta[];
  clients: ClientRow[];
  dateColumns: DateColumn[];
  payments: PaymentRow[];
};

type Range = { from: Date; to: Date };

/** Parse a stored `yyyy-MM-dd` string to a local Date, or null if in-range. */
function dayInRange(iso: unknown, range: Range): Date | null {
  if (typeof iso !== "string" || iso === "") {
    return null;
  }
  const day = new Date(`${iso}T00:00:00`);
  if (
    Number.isNaN(day.getTime()) ||
    day < startOfDay(range.from) ||
    day > endOfDay(range.to)
  ) {
    return null;
  }
  return day;
}

function dateColumnsByProject(columns: DateColumn[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const col of columns) {
    const existing = map.get(col.project_id);
    if (existing) {
      existing.push(col.id);
    } else {
      map.set(col.project_id, [col.id]);
    }
  }
  return map;
}

/** Client date-column values for business projects → all-day markers. */
function clientDateItems(
  source: ProjectOverlaySource,
  projectsById: Map<string, ProjectMeta>,
  range: Range
): CalendarItem[] {
  const cols = dateColumnsByProject(source.dateColumns);
  const items: CalendarItem[] = [];
  for (const client of source.clients) {
    const project = projectsById.get(client.project_id);
    if (project?.type !== "business") {
      continue;
    }
    for (const colId of cols.get(client.project_id) ?? []) {
      const day = dayInRange(client.data?.[colId], range);
      if (day) {
        items.push({
          id: `client-${client.id}-${colId}`,
          kind: "client-date",
          title: client.name,
          start: day,
          end: day,
          allDay: true,
          color: "purple",
          context: project.name,
        });
      }
    }
  }
  return items;
}

/** Logged payments for regular "project"-type projects → all-day markers. */
function paymentItems(
  source: ProjectOverlaySource,
  projectsById: Map<string, ProjectMeta>,
  range: Range
): CalendarItem[] {
  const items: CalendarItem[] = [];
  for (const payment of source.payments) {
    const project = projectsById.get(payment.project_id);
    if (project?.type !== "project") {
      continue;
    }
    const day = dayInRange(payment.date, range);
    if (day) {
      items.push({
        id: `payment-${payment.id}`,
        kind: "payment",
        title: payment.label,
        start: day,
        end: day,
        allDay: true,
        color: "green",
        context: project.name,
      });
    }
  }
  return items;
}

/**
 * Read-only markers pulled from the projects tab: a client's date-column values
 * (business projects) and logged payments (regular projects). Names only — no
 * amounts — mirroring how tasks/subscriptions overlay the calendar.
 */
export function buildProjectOverlays(
  source: ProjectOverlaySource,
  from: Date,
  to: Date
): CalendarItem[] {
  const projectsById = new Map(source.projects.map((p) => [p.id, p]));
  const range = { from, to };
  return [
    ...clientDateItems(source, projectsById, range),
    ...paymentItems(source, projectsById, range),
  ];
}

/** Items whose start day matches `day` (all-day + timed alike), start-sorted. */
export function itemsOnDay(items: CalendarItem[], day: Date): CalendarItem[] {
  return items
    .filter((it) => isSameDay(it.start, day))
    .sort((a, b) => {
      // The user's own events surface ahead of read-only overlays.
      const aEvent = a.kind === "event";
      const bEvent = b.kind === "event";
      if (aEvent !== bEvent) {
        return aEvent ? -1 : 1;
      }
      if (a.allDay !== b.allDay) {
        return a.allDay ? -1 : 1;
      }
      return a.start.getTime() - b.start.getTime();
    });
}
