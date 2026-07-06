export type ProjectType = "business" | "project";

export type Project = {
  id: string;
  type: ProjectType;
  name: string;
  logo_url: string | null;
  /** Agreed total/price — only meaningful for the "project" type. */
  total: number;
  created_at: string;
};

export type ProjectClient = {
  id: string;
  project_id: string;
  name: string;
  notes: string | null;
  /** Values for the project's custom columns, keyed by column id. */
  data: Record<string, unknown>;
  created_at: string;
};

export type ColumnType = "text" | "number" | "phone" | "date" | "tags";

export const COLUMN_TYPES: { id: ColumnType; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "number", label: "Number" },
  { id: "phone", label: "Phone" },
  { id: "date", label: "Date" },
  { id: "tags", label: "Tags" },
];

export type TagOption = { id: string; label: string; color: string };

export type ProjectColumn = {
  id: string;
  project_id: string;
  name: string;
  type: ColumnType;
  position: number;
  /** For tag columns: the allowed tags, each with a color. */
  options: TagOption[];
};

/** Semi-transparent tag palette. `swatch` is solid (for the picker). */
export const TAG_COLORS: { id: string; swatch: string; chip: string }[] = [
  {
    id: "purple",
    swatch: "bg-purple-500",
    chip: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
  {
    id: "sky",
    swatch: "bg-sky-500",
    chip: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  },
  {
    id: "emerald",
    swatch: "bg-emerald-500",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "amber",
    swatch: "bg-amber-500",
    chip: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  {
    id: "rose",
    swatch: "bg-rose-500",
    chip: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  {
    id: "blue",
    swatch: "bg-blue-500",
    chip: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  {
    id: "pink",
    swatch: "bg-pink-500",
    chip: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  },
  {
    id: "slate",
    swatch: "bg-slate-500",
    chip: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  },
];

export function tagChip(color: string) {
  return (
    TAG_COLORS.find((c) => c.id === color)?.chip ??
    "bg-secondary text-secondary-foreground border-border"
  );
}

export type EntryKind = "expense" | "income";

export type ProjectEntry = {
  id: string;
  project_id: string;
  client_id: string | null;
  kind: EntryKind;
  label: string;
  /** Always stored positive; the kind carries the direction. */
  amount: number;
  date: string;
  /** Public URL of an uploaded receipt file, if any. */
  receipt_url: string | null;
};

export type ProjectTask = {
  id: string;
  project_id: string;
  title: string;
  done: boolean;
  due_date: string | null;
};

export type ProjectNote = {
  id: string;
  project_id: string;
  body: string;
  created_at: string;
};

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  business: "Business",
  project: "Project",
};

export const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

const TRAILING_ZEROS = /\.?0+$/;

/**
 * Compact currency for tight summary cards: $1.55K, $3.4K, $1.2M. Values under
 * 1,000 keep their exact amount. Trailing zeros are trimmed.
 */
export function compactCurrency(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs < 1000) {
    return currency.format(n);
  }
  const [value, suffix] =
    abs >= 1_000_000 ? [abs / 1_000_000, "M"] : [abs / 1000, "K"];
  const text = value.toFixed(2).replace(TRAILING_ZEROS, "");
  return `${sign}$${text}${suffix}`;
}

export function shortDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
