"use client";

import { CheckIcon, ListChecksIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ProjectTask } from "@/data/projects";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "done";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "done", label: "Done" },
];

const REVEAL = 64;

function TaskRow({
  task,
  onToggle,
  onRemove,
}: {
  task: ProjectTask;
  onToggle: (id: string, done: boolean) => void;
  onRemove: (id: string) => void;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    startX.current = e.clientX;
    startOffset.current = offset;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) {
      return;
    }
    const delta = e.clientX - startX.current;
    setOffset(Math.max(-REVEAL, Math.min(0, startOffset.current + delta)));
  }
  function onPointerUp() {
    if (!dragging) {
      return;
    }
    setDragging(false);
    setOffset((current) => (current < -REVEAL / 2 ? -REVEAL : 0));
  }

  const due = task.due_date
    ? new Date(`${task.due_date}T00:00:00`).toLocaleDateString("en-CA", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="relative overflow-hidden border border-border">
      <ConfirmDelete
        description={
          <>This permanently removes “{task.title}”. This can’t be undone.</>
        }
        onConfirm={() => onRemove(task.id)}
        title="Delete task?"
        triggerClassName="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive pr-1 text-white"
        triggerLabel={`Delete ${task.title}`}
        triggerStyle={{ width: REVEAL }}
      >
        <Trash2Icon className="size-5" />
      </ConfirmDelete>

      <div
        className={cn(
          "group flex touch-pan-y items-center gap-3 bg-background px-3 py-3",
          offset < 0 && "pr-4"
        )}
        onPointerCancel={onPointerUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
      >
        <button
          aria-label={task.done ? "Mark as not done" : "Mark as done"}
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-none border transition-colors",
            task.done
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/50 text-transparent"
          )}
          onClick={() => onToggle(task.id, !task.done)}
          type="button"
        >
          <CheckIcon className="size-3.5" />
        </button>

        <p
          className={cn(
            "min-w-0 flex-1 truncate text-[15px]",
            task.done ? "text-muted-foreground line-through" : ""
          )}
        >
          {task.title}
        </p>

        {due ? (
          <span className="shrink-0 text-muted-foreground text-sm">{due}</span>
        ) : null}
      </div>
    </div>
  );
}

export function ProjectTasks({ projectId }: { projectId: string }) {
  const supabase = createClient();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [title, setTitle] = useState("");

  useEffect(() => {
    let active = true;
    supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("done", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (active && data) {
          setTasks(data as ProjectTask[]);
        }
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [supabase, projectId]);

  const filtered = tasks.filter((t) => {
    if (filter === "active") {
      return !t.done;
    }
    if (filter === "done") {
      return t.done;
    }
    return true;
  });
  const activeCount = tasks.filter((t) => !t.done).length;

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }
    const value = title.trim();
    setTitle("");
    const { data } = await supabase
      .from("project_tasks")
      .insert({ project_id: projectId, title: value })
      .select()
      .single();
    if (data) {
      setTasks((prev) => [data as ProjectTask, ...prev]);
    }
  }

  async function toggle(id: string, done: boolean) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    await supabase.from("project_tasks").update({ done }).eq("id", id);
  }

  async function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("project_tasks").delete().eq("id", id);
  }

  return (
    <div className="flex flex-col">
      <form className="flex items-center gap-2" onSubmit={addTask}>
        <Input
          className="rounded-none border-border"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          type="text"
          value={title}
        />
        <Button
          aria-label="Add task"
          className="aspect-square h-auto shrink-0 self-stretch rounded-none"
          size="sm"
          type="submit"
        >
          <PlusIcon />
        </Button>
      </form>

      <div className="mt-4 flex gap-1 self-start border border-border p-0.5">
        {FILTERS.map((f) => (
          <button
            className={cn(
              "px-3 py-1 font-medium text-sm transition-colors",
              filter === f.id
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            key={f.id}
            onClick={() => setFilter(f.id)}
            type="button"
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {loading ? (
          <p className="py-12 text-center text-muted-foreground text-sm">
            Loading…
          </p>
        ) : null}
        {filtered.map((task) => (
          <TaskRow
            key={task.id}
            onRemove={remove}
            onToggle={toggle}
            task={task}
          />
        ))}
        {loading || filtered.length > 0 || tasks.length > 0 ? null : (
          <EmptyState
            description="Add your first one above."
            icon={ListChecksIcon}
            title="No tasks yet"
          />
        )}
        {loading || filtered.length > 0 || tasks.length === 0 ? null : (
          <EmptyState icon={ListChecksIcon} title="Nothing here" />
        )}
      </div>

      {activeCount > 0 ? (
        <p className="mt-4 text-muted-foreground text-sm">
          {activeCount} active {activeCount === 1 ? "task" : "tasks"}
        </p>
      ) : null}
    </div>
  );
}
