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

/** Solid dot className per color — used for the compact mobile month view. */
export const EVENT_DOT: Record<EventColor, string> = {
  neutral: "bg-muted-foreground",
  blue: "bg-blue-500",
  green: "bg-green-500",
  sky: "bg-sky-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
};

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

export type ItemKind =
  | "event"
  | "task"
  | "subscription"
  | "client-date"
  | "payment";

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
  /** Secondary context line for overlays (e.g. the project name). */
  context?: string;
};
