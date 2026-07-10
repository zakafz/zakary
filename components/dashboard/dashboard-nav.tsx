"use client";

import {
  CalendarDaysIcon,
  FolderIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  NotebookIcon,
  RepeatIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Tab = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const TABS: Tab[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/dashboard/finance", label: "Finance", icon: WalletIcon },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDaysIcon },
  { href: "/dashboard/projects", label: "Projects", icon: FolderIcon },
  {
    href: "/dashboard/subscriptions",
    label: "Subscriptions",
    icon: RepeatIcon,
  },
  // Tasks tab hidden for now — restore this entry and app/dashboard/tasks to bring it back.
  // { href: "/dashboard/tasks", label: "Tasks", icon: ListChecksIcon },
  { href: "/dashboard/notes", label: "Notes", icon: NotebookIcon },
  { href: "/dashboard/passwords", label: "Passwords", icon: KeyRoundIcon },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <div
      aria-label="Dashboard sections"
      className="flex gap-1 overflow-x-auto overflow-y-hidden border-border border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
    >
      {TABS.map((tab) => {
        // The Overview tab only matches its exact path; the rest match their
        // segment so nested routes keep the parent tab highlighted.
        const isActive =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            aria-selected={isActive}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 font-medium text-sm transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            href={tab.href}
            key={tab.href}
            role="tab"
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
