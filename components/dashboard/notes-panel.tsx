"use client";

import {
  ChevronLeftIcon,
  MoreVerticalIcon,
  PinIcon,
  PinOffIcon,
  PlusIcon,
  SearchIcon,
  StickyNoteIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Note, noteMatches, noteSnippet, sortNotes } from "@/data/notes";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type ProjectLite = { id: string; name: string };

const NO_PROJECT = "none";
const TRAILING_COMMA = /,$/;

function stamp(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TagChips({
  tags,
  onRemove,
}: {
  tags: string[];
  onRemove?: (tag: string) => void;
}) {
  if (tags.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          className="inline-flex items-center gap-1 border border-border px-1.5 py-0.5 text-muted-foreground text-xs"
          key={tag}
        >
          {tag}
          {onRemove ? (
            <button
              aria-label={`Remove ${tag}`}
              className="text-muted-foreground hover:text-foreground"
              onClick={() => onRemove(tag)}
              type="button"
            >
              <XIcon className="size-3" />
            </button>
          ) : null}
        </span>
      ))}
    </div>
  );
}

function CreateNoteDialog({
  open,
  onOpenChange,
  projects,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectLite[];
  onCreate: (title: string, projectId: string | null) => void;
}) {
  const [title, setTitle] = useState("");
  const [project, setProject] = useState<string>(NO_PROJECT);

  useEffect(() => {
    if (open) {
      setTitle("");
      setProject(NO_PROJECT);
    }
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      return;
    }
    onCreate(title.trim(), project === NO_PROJECT ? null : project);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New note</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <Input
            autoFocus
            className="rounded-none border-border"
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            value={title}
          />
          <Select onValueChange={setProject} value={project}>
            <SelectTrigger className="rounded-none border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem className="rounded-none" value={NO_PROJECT}>
                No project
              </SelectItem>
              {projects.map((p) => (
                <SelectItem className="rounded-none" key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button className="w-full rounded-none" type="submit">
              Create note
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NoteEditorPage({
  note,
  projectName,
  onSave,
  onDelete,
  onClose,
}: {
  note: Note;
  projectName: string | null;
  onSave: (patch: Partial<Note>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [pinned, setPinned] = useState(note.pinned);
  const [tagInput, setTagInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Keep the newest values and callback in refs so the unmount effect below
  // can run exactly once without re-subscribing every render.
  const latest = useRef({ title, body, tags, pinned });
  latest.current = { title, body, tags, pinned };
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const skipSave = useRef(false);

  // Persist on unmount (leaving the page) so nothing is lost — unless we're
  // leaving because the note was deleted.
  useEffect(
    () => () => {
      if (!skipSave.current) {
        onSaveRef.current(latest.current);
      }
    },
    []
  );

  function commitTag() {
    const value = tagInput.trim().replace(TRAILING_COMMA, "").trim();
    if (value && !tags.includes(value)) {
      setTags((prev) => [...prev, value]);
    }
    setTagInput("");
  }

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitTag();
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function handleDelete() {
    skipSave.current = true;
    onDelete();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-6 py-4">
        <div className="flex items-center gap-2 border-border border-b pb-3">
          <button
            aria-label="Back to notes"
            className="-ml-1.5 inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            <ChevronLeftIcon className="size-5" />
          </button>
          <span className="min-w-0 flex-1 truncate text-muted-foreground text-sm">
            {projectName ?? "Notes"}
          </span>
          <Popover onOpenChange={setMenuOpen} open={menuOpen}>
            <PopoverTrigger
              aria-label="Note options"
              className="-mr-1.5 inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <MoreVerticalIcon className="size-5" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40 rounded-none p-1">
              <button
                className="flex w-full items-center gap-2 rounded-none px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary"
                onClick={() => {
                  setMenuOpen(false);
                  setPinned((p) => !p);
                }}
                type="button"
              >
                {pinned ? (
                  <PinOffIcon className="size-3.5" />
                ) : (
                  <PinIcon className="size-3.5" />
                )}
                {pinned ? "Unpin" : "Pin"}
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
              <AlertDialogTitle>Delete note?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes this note. This can’t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Delete note
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <input
          className="mt-3 w-full bg-transparent font-semibold text-2xl outline-none placeholder:text-muted-foreground"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          value={title}
        />

        <RichTextEditor
          onChange={setBody}
          placeholder="Start writing…"
          value={body}
        />

        <div className="flex flex-col gap-2 border-border border-t pt-3">
          <TagChips
            onRemove={(t) => setTags(tags.filter((x) => x !== t))}
            tags={tags}
          />
          <Input
            className="rounded-none border-border"
            onBlur={commitTag}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            placeholder="Add a tag, press Enter…"
            value={tagInput}
          />
        </div>
      </div>
    </div>
  );
}

export function NotesPanel() {
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("notes").select("*").order("updated_at", {
        ascending: false,
      }),
      supabase.from("projects").select("id, name").order("name"),
    ]).then(([noteRes, projectRes]) => {
      if (!active) {
        return;
      }
      if (noteRes.data) {
        setNotes(noteRes.data as Note[]);
      }
      if (projectRes.data) {
        setProjects(projectRes.data as ProjectLite[]);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  const projectName = useCallback(
    (id: string | null) => projects.find((p) => p.id === id)?.name ?? null,
    [projects]
  );

  const visible = useMemo(
    () => sortNotes(notes.filter((n) => noteMatches(n, query))),
    [notes, query]
  );

  const openNote = openId ? notes.find((n) => n.id === openId) : null;

  async function create(title: string, projectId: string | null) {
    setCreating(false);
    const { data, error } = await supabase
      .from("notes")
      .insert({ title, project_id: projectId })
      .select()
      .single();
    if (error) {
      console.error("Failed to create note:", error.message);
      return;
    }
    if (data) {
      const note = data as Note;
      setNotes((prev) => [note, ...prev]);
      setOpenId(note.id);
    }
  }

  async function save(id: string, patch: Partial<Note>) {
    const payload = { ...patch, updated_at: new Date().toISOString() };
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...payload } : n))
    );
    await supabase.from("notes").update(payload).eq("id", id);
  }

  async function togglePin(note: Note, e: React.MouseEvent) {
    e.stopPropagation();
    const pinned = !note.pinned;
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, pinned } : n))
    );
    await supabase.from("notes").update({ pinned }).eq("id", note.id);
  }

  async function remove(id: string) {
    setOpenId(null);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notes").delete().eq("id", id);
  }

  if (openNote) {
    return (
      <NoteEditorPage
        key={openNote.id}
        note={openNote}
        onClose={() => setOpenId(null)}
        onDelete={() => remove(openNote.id)}
        onSave={(patch) => save(openNote.id, patch)}
        projectName={projectName(openNote.project_id)}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            className="rounded-none border-border pl-9"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            type="search"
            value={query}
          />
        </div>
        <Button
          aria-label="New note"
          className="aspect-square h-auto shrink-0 self-stretch rounded-none"
          onClick={() => setCreating(true)}
          size="sm"
          type="button"
        >
          <PlusIcon />
        </Button>
      </div>

      {loading ? (
        <p className="shimmer py-12 text-center text-muted-foreground text-sm">
          Loading…
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {visible.map((note) => {
          const project = projectName(note.project_id);
          return (
            <div
              className={cn(
                "group relative flex flex-col border border-border transition-colors hover:border-muted-foreground/50",
                note.pinned ? "border-l-2 border-l-primary" : ""
              )}
              key={note.id}
            >
              <button
                aria-label={note.pinned ? "Unpin note" : "Pin note"}
                aria-pressed={note.pinned}
                className={cn(
                  "absolute top-2.5 right-2.5 z-10 inline-flex size-7 items-center justify-center transition-colors",
                  note.pinned
                    ? "text-primary"
                    : "text-muted-foreground/30 hover:text-foreground"
                )}
                onClick={(e) => togglePin(note, e)}
                type="button"
              >
                <PinIcon
                  className={cn("size-4", note.pinned ? "fill-current" : "")}
                />
              </button>

              <button
                className="flex min-h-28 flex-1 flex-col p-4 text-left"
                onClick={() => setOpenId(note.id)}
                type="button"
              >
                <span className="line-clamp-1 pr-8 font-medium text-base leading-snug">
                  {note.title || "Untitled"}
                </span>
                <span className="mt-1.5 line-clamp-2 flex-1 text-muted-foreground text-sm leading-relaxed">
                  {noteSnippet(note) || "No additional text"}
                </span>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-border/60 border-t pt-2.5">
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {stamp(note.updated_at)}
                  </span>
                  {project ? (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-muted-foreground text-xs">
                        {project}
                      </span>
                    </>
                  ) : null}
                  <TagChips tags={note.tags} />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {loading || visible.length > 0 || notes.length > 0 ? null : (
        <EmptyState
          description="Create your first one with the + button."
          icon={StickyNoteIcon}
          title="No notes yet"
        />
      )}
      {loading || visible.length > 0 || notes.length === 0 ? null : (
        <EmptyState
          description="No notes match your search."
          icon={SearchIcon}
          title="Nothing found"
        />
      )}

      <CreateNoteDialog
        onCreate={create}
        onOpenChange={setCreating}
        open={creating}
        projects={projects}
      />
    </div>
  );
}
