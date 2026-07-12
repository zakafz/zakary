"use client";

import { WrenchIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProjectDetail } from "@/components/dashboard/project-detail";
import type { Project } from "@/data/projects";
import { createClient } from "@/lib/supabase/client";

/**
 * STR Tunez lives in the shared `projects` table as the single `business` row.
 * This panel loads it and reuses ProjectDetail (which renders the full business
 * tab set) as a standalone top-level tab, with no surrounding list.
 */
export function StrTunezPanel() {
  const supabase = createClient();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("type", "business")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    setProject((data as Project | null) ?? null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <p className="shimmer py-12 text-center text-muted-foreground text-sm">
        Loading…
      </p>
    );
  }

  if (!project) {
    return (
      <EmptyState
        description="No STR Tunez business record was found."
        icon={WrenchIcon}
        title="STR Tunez"
      />
    );
  }

  return (
    <ProjectDetail
      hideBack
      onBack={load}
      onChanged={(saved) => setProject(saved)}
      onDeleted={() => setProject(null)}
      project={project}
    />
  );
}
