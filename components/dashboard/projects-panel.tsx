"use client";

import { FolderIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProjectDetail } from "@/components/dashboard/project-detail";
import { ProjectDialog } from "@/components/dashboard/project-dialog";
import { SwipeRow } from "@/components/dashboard/swipe-row";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  currency,
  PROJECT_TYPE_LABEL,
  type Project,
  type ProjectType,
} from "@/data/projects";
import { createClient } from "@/lib/supabase/client";

type Totals = { income: number; expense: number };
type Filter = ProjectType | "all";

function ProjectLogo({ project }: { project: Project }) {
  if (project.logo_url) {
    return (
      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border">
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="44px"
          src={project.logo_url}
        />
      </div>
    );
  }
  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary font-semibold text-secondary-foreground">
      {project.name.charAt(0).toUpperCase()}
    </div>
  );
}

function metricFor(project: Project, totals: Totals | undefined) {
  const income = totals?.income ?? 0;
  const expense = totals?.expense ?? 0;
  if (project.type === "business") {
    const net = income - expense;
    return { label: "Net", value: currency.format(net), positive: net >= 0 };
  }
  const balance = project.total - income;
  return {
    label: balance > 0 ? "Balance" : "Paid off",
    value: currency.format(balance),
    positive: balance <= 0,
  };
}

export function ProjectsPanel() {
  const supabase = createClient();
  const [projects, setProjects] = useState<Project[]>([]);
  const [totals, setTotals] = useState<Record<string, Totals>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  const load = useCallback(async () => {
    const [projectRes, entryRes] = await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("project_entries").select("project_id, kind, amount"),
    ]);
    if (projectRes.data) {
      setProjects(projectRes.data as Project[]);
    }
    const next: Record<string, Totals> = {};
    for (const row of (entryRes.data ?? []) as {
      project_id: string;
      kind: "income" | "expense";
      amount: number;
    }[]) {
      const bucket = next[row.project_id] ?? { income: 0, expense: 0 };
      bucket[row.kind] += row.amount;
      next[row.project_id] = bucket;
    }
    setTotals(next);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSaved(saved: Project, isNew: boolean) {
    setProjects((prev) =>
      isNew
        ? [saved, ...prev]
        : prev.map((p) => (p.id === saved.id ? saved : p))
    );
    if (selected?.id === saved.id) {
      setSelected(saved);
    }
  }

  async function removeProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("projects").delete().eq("id", id);
  }

  function backToList() {
    setSelected(null);
    load();
  }

  if (selected) {
    return (
      <ProjectDetail
        onBack={backToList}
        onChanged={handleSaved}
        onDeleted={backToList}
        project={selected}
      />
    );
  }

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.type === filter);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <Select onValueChange={(v) => setFilter(v as Filter)} value={filter}>
          <SelectTrigger className="flex-1 rounded-none border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem className="rounded-none" value="all">
              All projects
            </SelectItem>
            <SelectItem className="rounded-none" value="business">
              Businesses
            </SelectItem>
            <SelectItem className="rounded-none" value="project">
              Projects
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          aria-label="New project"
          className="aspect-square h-auto shrink-0 self-stretch rounded-none"
          onClick={() => setDialogOpen(true)}
          size="sm"
          type="button"
        >
          <PlusIcon />
        </Button>
      </div>

      <ProjectDialog
        editing={null}
        key={dialogOpen ? "open" : "closed"}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
        open={dialogOpen}
      />

      <div className="mt-4 flex flex-col divide-y divide-border/60">
        {loading ? (
          <p className="shimmer py-12 text-center text-muted-foreground text-sm">
            Loading…
          </p>
        ) : null}
        {filtered.map((project) => {
          const metric = metricFor(project, totals[project.id]);
          return (
            <SwipeRow
              deleteDescription={
                <>
                  This permanently deletes “{project.name}” and everything in
                  it. This can’t be undone.
                </>
              }
              deleteLabel={`Delete ${project.name}`}
              deleteTitle="Delete project?"
              key={project.id}
              onClick={() => setSelected(project)}
              onDelete={() => removeProject(project.id)}
            >
              <ProjectLogo project={project} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold text-[15px] leading-tight">
                  {project.name}
                </span>
                <span className="text-muted-foreground text-sm">
                  {PROJECT_TYPE_LABEL[project.type]}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end">
                <span className="font-semibold text-[15px] tabular-nums">
                  {metric.value}
                </span>
                <span className="text-muted-foreground text-xs">
                  {metric.label}
                </span>
              </div>
            </SwipeRow>
          );
        })}
        {loading || filtered.length > 0 ? null : (
          <EmptyState
            description="Create your first one above."
            icon={FolderIcon}
            title="No projects yet"
          />
        )}
      </div>
    </div>
  );
}
