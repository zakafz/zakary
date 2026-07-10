export type TransactionType = "purchase" | "transfer" | "deposit";

export type TransactionCategory =
  | "shopping"
  | "transportation"
  | "food"
  | "bills";

export const CATEGORIES: { id: TransactionCategory; label: string }[] = [
  { id: "shopping", label: "Shopping" },
  { id: "transportation", label: "Transportation" },
  { id: "food", label: "Food & Drink" },
  { id: "bills", label: "Bills" },
];

/** Category palette, shared across every finance chart and breakdown. */
export const CATEGORY_COLOR: Record<TransactionCategory, string> = {
  shopping: "#a78bfa",
  transportation: "#38bdf8",
  food: "#fbbf24",
  bills: "#34d399",
};

/** Display labels keyed by category id. */
export const CATEGORY_LABEL: Record<TransactionCategory, string> =
  Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<
    TransactionCategory,
    string
  >;

export type Transaction = {
  id: string;
  merchant: string;
  type: TransactionType;
  category?: TransactionCategory;
  pending?: boolean;
  /** Negative = money out, positive = money in. In CAD. */
  amount: number;
  note?: string;
  /** ISO date string (YYYY-MM-DD). */
  date: string;
};
