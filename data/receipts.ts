import { currency } from "@/data/projects";

export type ProjectService = {
  id: string;
  project_id: string;
  name: string;
  price: number;
  position: number;
  created_at: string;
};

export type ProjectBranding = {
  project_id: string;
  display_name: string;
  prefix: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  footer_note: string | null;
};

export type ReceiptStatus = "draft" | "sent";

export type Receipt = {
  id: string;
  project_id: string;
  client_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  number: number;
  issued_date: string;
  reference_label: string | null;
  reference_value: string | null;
  paid_by: string | null;
  notes: string | null;
  total: number;
  pdf_url: string | null;
  status: ReceiptStatus;
  created_at: string;
};

export type ReceiptItem = {
  id: string;
  receipt_id: string;
  service_id: string | null;
  description: string;
  unit_price: number;
  quantity: number;
  amount: number;
  position: number;
};

/** A draft line item before it is persisted. */
export type DraftItem = {
  service_id: string | null;
  description: string;
  unit_price: number;
  quantity: number;
};

export const EMPTY_BRANDING = (projectId: string): ProjectBranding => ({
  project_id: projectId,
  display_name: "",
  prefix: "",
  logo_url: null,
  phone: null,
  email: null,
  address: null,
  footer_note: null,
});

/** Formats a receipt number like `LABO-0008` (prefix optional). */
export function receiptNo(prefix: string | null | undefined, n: number) {
  const padded = String(n).padStart(4, "0");
  return prefix ? `${prefix}-${padded}` : `#${padded}`;
}

export function itemAmount(item: Pick<DraftItem, "unit_price" | "quantity">) {
  return item.unit_price * (item.quantity || 1);
}

export function receiptTotal(items: DraftItem[]) {
  return items.reduce((sum, i) => sum + itemAmount(i), 0);
}

export const money = (n: number) => currency.format(n);
