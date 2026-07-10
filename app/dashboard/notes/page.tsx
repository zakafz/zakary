import type { Metadata } from "next";
import { NotesPanel } from "@/components/dashboard/notes-panel";

export const metadata: Metadata = { title: "Notes" };

export default function NotesPage() {
  return <NotesPanel />;
}
