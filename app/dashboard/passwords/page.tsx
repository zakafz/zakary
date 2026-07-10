import type { Metadata } from "next";
import { PasswordsPanel } from "@/components/dashboard/passwords-panel";

export const metadata: Metadata = { title: "Passwords" };

export default function PasswordsPage() {
  return <PasswordsPanel />;
}
