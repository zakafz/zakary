import type { Metadata } from "next";
import { StrTunezPanel } from "@/components/dashboard/strtunez-panel";

export const metadata: Metadata = { title: "STR Tunez" };

export default function StrTunezPage() {
  return <StrTunezPanel />;
}
