import type { Metadata } from "next";
import { CalendarPanel } from "@/components/dashboard/calendar/calendar-panel";

export const metadata: Metadata = { title: "Calendar" };

export default function CalendarPage() {
  return <CalendarPanel />;
}
