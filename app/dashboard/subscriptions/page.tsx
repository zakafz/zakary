import type { Metadata } from "next";
import { SubscriptionsPanel } from "@/components/dashboard/subscriptions-panel";

export const metadata: Metadata = { title: "Subscriptions" };

export default function SubscriptionsPage() {
  return <SubscriptionsPanel />;
}
