import { addDays, addMonths, addYears } from "date-fns";

export type Cycle = "biweekly" | "monthly" | "yearly";

export const ADVANCE: Record<Cycle, (d: Date) => Date> = {
  biweekly: (d) => addDays(d, 14),
  monthly: (d) => addMonths(d, 1),
  yearly: (d) => addYears(d, 1),
};

const RETREAT: Record<Cycle, (d: Date) => Date> = {
  biweekly: (d) => addDays(d, -14),
  monthly: (d) => addMonths(d, -1),
  yearly: (d) => addYears(d, -1),
};

const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * Does `target` fall on the recurrence anchored at `iso`? Walks the schedule
 * toward the target (backward for past dates, forward for future ones) and
 * checks for an exact calendar-day landing. Monotonic, so it always terminates.
 */
export function occursOn(iso: string, cycle: Cycle, target: Date): boolean {
  const goal = new Date(target);
  goal.setHours(0, 0, 0, 0);
  let date = new Date(`${iso}T00:00:00`);
  if (date > goal) {
    while (date > goal) {
      date = RETREAT[cycle](date);
    }
  } else {
    while (date < goal) {
      date = ADVANCE[cycle](date);
    }
  }
  return ymd(date) === ymd(goal);
}

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
