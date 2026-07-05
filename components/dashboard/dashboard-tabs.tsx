"use client";

import {
  KeyRoundIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  type LucideIcon,
  RepeatIcon,
  WalletIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FinancePanel } from "./finance-panel";
import { OverviewPanel } from "./overview-panel";
import { PasswordsPanel } from "./passwords-panel";
import { SubscriptionsPanel } from "./subscriptions-panel";
import { TasksPanel } from "./tasks-panel";

type TabId = "overview" | "finance" | "subscriptions" | "tasks" | "passwords";

type Tab = {
  id: TabId;
  label: string;
  icon: LucideIcon;
  description: string;
};

const TABS: Tab[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboardIcon,
    description: "A snapshot of everything at a glance.",
  },
  {
    id: "finance",
    label: "Finance",
    icon: WalletIcon,
    description: "Accounts, spending and net worth.",
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: RepeatIcon,
    description: "Recurring payments in one place.",
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: ListChecksIcon,
    description: "Things to do and track.",
  },
  {
    id: "passwords",
    label: "Passwords",
    icon: KeyRoundIcon,
    description: "Credentials, kept safe.",
  },
];

export function DashboardTabs() {
  const [active, setActive] = useState<TabId>("overview");
  function renderPanel() {
    if (active === "overview") {
      return <OverviewPanel />;
    }
    if (active === "finance") {
      return <FinancePanel />;
    }
    if (active === "subscriptions") {
      return <SubscriptionsPanel />;
    }
    if (active === "tasks") {
      return <TasksPanel />;
    }
    return <PasswordsPanel />;
  }

  return (
    <div className="mt-6 flex flex-1 flex-col">
      <div
        aria-label="Dashboard sections"
        className="flex gap-1 overflow-x-auto border-border border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          const Icon = tab.icon;
          return (
            <button
              aria-selected={isActive}
              className={cn(
                "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 font-medium text-sm transition-colors",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
              key={tab.id}
              onClick={() => setActive(tab.id)}
              role="tab"
              type="button"
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex-1" role="tabpanel">
        {renderPanel()}
      </div>
    </div>
  );
}
