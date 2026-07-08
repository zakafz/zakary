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
