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

/**
 * Placeholder transactions. Swap for a Supabase query once the
 * `transactions` table exists — the shape maps 1:1.
 */
export const TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    merchant: "Amzn Mktp Ca",
    type: "purchase",
    category: "shopping",
    pending: true,
    amount: -68.97,
    note: "Household",
    date: "2026-07-04",
  },
  {
    id: "t2",
    merchant: "McDonald's",
    type: "purchase",
    category: "food",
    pending: true,
    amount: -1.84,
    note: "Coffee",
    date: "2026-07-02",
  },
  {
    id: "t3",
    merchant: "Pizzeria Le Monde",
    type: "purchase",
    category: "food",
    amount: -5.81,
    note: "Lunch",
    date: "2026-07-02",
  },
  {
    id: "t4",
    merchant: "Apple.com/Bill",
    type: "purchase",
    category: "bills",
    amount: -4.59,
    note: "iCloud",
    date: "2026-07-02",
  },
  {
    id: "t5",
    merchant: "Transfer out",
    type: "transfer",
    amount: -411,
    note: "Chequing",
    date: "2026-07-02",
  },
  {
    id: "t6",
    merchant: "Payroll",
    type: "deposit",
    amount: 1240.5,
    note: "Salary",
    date: "2026-06-30",
  },
];
