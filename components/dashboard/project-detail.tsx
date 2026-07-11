"use client";

import {
  ChevronLeftIcon,
  MoreVerticalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ClientPage } from "@/components/dashboard/client-page";
import { ProjectBranding } from "@/components/dashboard/project-branding";
import { ProjectClients } from "@/components/dashboard/project-clients";
import { ProjectDialog } from "@/components/dashboard/project-dialog";
import { ProjectFinance } from "@/components/dashboard/project-finance";
import { ProjectReceipts } from "@/components/dashboard/project-receipts";
import { ProjectServices } from "@/components/dashboard/project-services";
import { ProjectTasks } from "@/components/dashboard/project-tasks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  compactCurrency,
  PROJECT_TYPE_LABEL,
  type Project,
  type ProjectClient,
  type ProjectEntry,
} from "@/data/projects";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type NewEntry = {
  kind: "expense" | "income";
  client_id: string | null;
  label: string;
  amount: number;
  date: string;
  receipt_url: string | null;
};

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "destructive";
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <span className="text-muted-foreground text-xs uppercase tracking-wide">
        {label}
      </span>
      <span
        className={cn(
          "font-semibold text-lg tabular-nums",
          tone === "success" && "text-success",
          tone === "destructive" && "text-destructive"
        )}
      >
        {value}
      </span>
    </div>
  );
}

function Overview({
  project,
  income,
  expense,
}: {
  project: Project;
  income: number;
  expense: number;
}) {
  if (project.type === "business") {
    const net = income - expense;
    return (
      <div className="flex gap-3 border border-border p-4">
        <Stat label="Earned" tone="success" value={compactCurrency(income)} />
        <Stat label="Expenses" value={compactCurrency(expense)} />
        <Stat
          label="Net"
          tone={net < 0 ? "destructive" : "success"}
          value={compactCurrency(net)}
        />
      </div>
    );
  }

  const balance = project.total - income;
  const pct =
    project.total > 0 ? Math.min(100, (income / project.total) * 100) : 0;
  return (
    <div className="flex flex-col gap-3 border border-border p-4">
      <div className="flex gap-3">
        <Stat label="Total" value={compactCurrency(project.total)} />
        <Stat label="Paid" tone="success" value={compactCurrency(income)} />
        <Stat
          label="Balance"
          tone={balance > 0 ? "destructive" : "success"}
          value={compactCurrency(balance)}
        />
      </div>
      <div className="h-2 w-full overflow-hidden bg-secondary">
        <div
          className="h-full bg-success transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Logo({ project, size }: { project: Project; size: number }) {
  if (project.logo_url) {
    return (
      <div
        className="relative shrink-0 overflow-hidden border border-border"
        style={{ width: size, height: size }}
      >
        <Image
          alt=""
          className="object-cover"
          fill
          sizes={`${size}px`}
          src={project.logo_url}
        />
      </div>
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center bg-secondary font-semibold text-secondary-foreground"
      style={{ width: size, height: size }}
    >
      {project.name.charAt(0).toUpperCase()}
    </div>
  );
}

const BUSINESS_TABS = [
  "clients",
  "finance",
  "receipts",
  "services",
  "branding",
  "tasks",
] as const;
const PROJECT_TABS = ["finance", "tasks"] as const;

export function ProjectDetail({
  project,
  onBack,
  onChanged,
  onDeleted,
}: {
  project: Project;
  onBack: () => void;
  onChanged: (project: Project, isNew: boolean) => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [entries, setEntries] = useState<ProjectEntry[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ProjectClient | null>(
    null
  );
  const isBusiness = project.type === "business";
  const tabs = isBusiness ? BUSINESS_TABS : PROJECT_TABS;
  const [tab, setTab] = useState<string>(tabs[0]);

  useEffect(() => {
    let active = true;
    supabase
      .from("project_entries")
      .select("*")
      .eq("project_id", project.id)
      .then(({ data }) => {
        if (active && data) {
          setEntries(data as ProjectEntry[]);
        }
      });
    return () => {
      active = false;
    };
  }, [supabase, project.id]);

  const income = entries
    .filter((e) => e.kind === "income")
    .reduce((acc, e) => acc + e.amount, 0);
  const expense = entries
    .filter((e) => e.kind === "expense")
    .reduce((acc, e) => acc + e.amount, 0);

  async function addEntry(entry: NewEntry) {
    const { data } = await supabase
      .from("project_entries")
      .insert({ project_id: project.id, ...entry })
      .select()
      .single();
    if (data) {
      setEntries((prev) => [data as ProjectEntry, ...prev]);
    }
  }

  async function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    await supabase.from("project_entries").delete().eq("id", id);
  }

  async function deleteProject() {
    await supabase.from("projects").delete().eq("id", project.id);
    onDeleted(project.id);
  }

  const clientEntries = entries.filter((e) => e.client_id !== null);

  if (selectedClient) {
    return (
      <ClientPage
        client={selectedClient}
        entries={entries}
        onAddEntry={(p) =>
          addEntry({
            kind: p.kind,
            client_id: p.clientId,
            label: p.label,
            amount: p.amount,
            date: p.date,
            receipt_url: p.receiptUrl,
          })
        }
        onBack={() => setSelectedClient(null)}
        onClientSaved={setSelectedClient}
        onRemoveEntry={removeEntry}
        project={project}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <button
          aria-label="Back"
          className="-ml-1.5 inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          onClick={onBack}
          type="button"
        >
          <ChevronLeftIcon className="size-5" />
        </button>
        <Logo project={project} size={40} />
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="truncate font-semibold text-lg leading-tight">
            {project.name}
          </h2>
          <span className="text-muted-foreground text-sm">
            {PROJECT_TYPE_LABEL[project.type]}
          </span>
        </div>
        <Popover onOpenChange={setMenuOpen} open={menuOpen}>
          <PopoverTrigger
            aria-label="Project options"
            className="inline-flex size-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <MoreVerticalIcon className="size-5" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-36 rounded-none p-1">
            <button
              className="flex w-full items-center gap-2 rounded-none px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary"
              onClick={() => {
                setMenuOpen(false);
                setEditOpen(true);
              }}
              type="button"
            >
              <PencilIcon className="size-3.5" />
              Edit
            </button>
            <button
              className="flex w-full items-center gap-2 rounded-none px-2 py-1.5 text-left text-destructive text-sm transition-colors hover:bg-destructive/10"
              onClick={() => {
                setMenuOpen(false);
                setDeleteOpen(true);
              }}
              type="button"
            >
              <Trash2Icon className="size-3.5" />
              Delete
            </button>
          </PopoverContent>
        </Popover>
      </div>

      <AlertDialog onOpenChange={setDeleteOpen} open={deleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes “{project.name}” and everything in it —
              clients, entries, tasks and notes. This can’t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={deleteProject}
            >
              Delete project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mt-6">
        <Overview expense={expense} income={income} project={project} />
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-border border-b [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => (
          <button
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2 font-medium text-sm capitalize transition-colors",
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            key={t}
            onClick={() => setTab(t)}
            type="button"
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "clients" ? (
          <ProjectClients
            entries={clientEntries}
            onOpenClient={setSelectedClient}
            projectId={project.id}
          />
        ) : null}
        {tab === "services" ? <ProjectServices projectId={project.id} /> : null}
        {tab === "receipts" ? (
          <ProjectReceipts projectId={project.id} projectName={project.name} />
        ) : null}
        {tab === "branding" ? (
          <ProjectBranding projectId={project.id} projectName={project.name} />
        ) : null}
        {tab === "finance" ? (
          <ProjectFinance
            entries={entries}
            onAdd={(p) =>
              addEntry({
                kind: p.kind,
                client_id: null,
                label: p.label,
                amount: p.amount,
                date: p.date,
                receipt_url: p.receiptUrl,
              })
            }
            onRemove={removeEntry}
          />
        ) : null}
        {tab === "tasks" ? <ProjectTasks projectId={project.id} /> : null}
      </div>

      <ProjectDialog
        editing={project}
        key={`${project.id}-${project.name}-${project.total}-${project.logo_url}`}
        onOpenChange={setEditOpen}
        onSaved={onChanged}
        open={editOpen}
      />
    </div>
  );
}
