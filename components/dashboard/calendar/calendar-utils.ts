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
