"use client";

import { StickyNoteIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SwipeRow } from "@/components/dashboard/swipe-row";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectNote } from "@/data/projects";
import { createClient } from "@/lib/supabase/client";

function noteStamp(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectNotes({ projectId }: { projectId: string }) {
  const supabase = createClient();
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("project_notes")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active && data) {
          setNotes(data as ProjectNote[]);
        }
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [supabase, projectId]);

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) {
      return;
    }
    setSaving(true);
    const { data } = await supabase
      .from("project_notes")
      .insert({ project_id: projectId, body: body.trim() })
      .select()
      .single();
    setSaving(false);
    if (data) {
      setNotes((prev) => [data as ProjectNote, ...prev]);
      setBody("");
    }
  }

  async function remove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("project_notes").delete().eq("id", id);
  }

  return (
    <div className="flex flex-col">
      <form className="flex flex-col gap-2" onSubmit={addNote}>
        <Textarea
          className="rounded-none border-border"
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a note…"
          rows={3}
          value={body}
        />
        <Button
          className="self-end rounded-none"
          disabled={saving}
          size="sm"
          type="submit"
        >
          {saving ? "Adding…" : "Add note"}
        </Button>
      </form>

      <div className="mt-3 flex flex-col gap-2">
        {loading ? (
          <p className="shimmer py-8 text-center text-muted-foreground text-sm">
            Loading…
          </p>
        ) : null}
        {notes.map((note) => (
          <SwipeRow
            className="px-3"
            deleteDescription={<>This permanently removes this note.</>}
            deleteLabel="Delete note"
            deleteTitle="Delete note?"
            key={note.id}
            onDelete={() => remove(note.id)}
            outerClassName="border border-border"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="whitespace-pre-wrap break-words text-[15px] leading-snug">
                {note.body}
              </span>
              <span className="text-muted-foreground text-xs">
                {noteStamp(note.created_at)}
              </span>
            </div>
          </SwipeRow>
        ))}
        {loading || notes.length > 0 ? null : (
          <EmptyState
            description="Write your first one above."
            icon={StickyNoteIcon}
            title="No notes yet"
          />
        )}
      </div>
    </div>
  );
}
