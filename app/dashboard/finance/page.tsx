import type { Metadata } from "next";
import { FinancePanel } from "@/components/dashboard/finance-panel";

export const metadata: Metadata = { title: "Finance" };

export default function FinancePage() {
  return <FinancePanel />;
}
