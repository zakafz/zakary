"use client";

import {
  GripVerticalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  ClientCellEditor,
  ClientCellValue,
} from "@/components/dashboard/project-client-cell";
import { ProjectEntries } from "@/components/dashboard/project-entries";
import { TagOptionsDialog } from "@/components/dashboard/tag-options-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  COLUMN_TYPES,
  type ColumnType,
  currency,
  type ProjectClient,
  type ProjectColumn,
  type ProjectEntry,
  type TagOption,
} from "@/data/projects";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const REVEAL = 72;
const NAME_W = 168;
const EARNED_W = 96;

type AddClientEntry = (payload: {
  clientId: string;
  kind: "income" | "expense";
  label: string;
  amount: number;
  date: string;
  receiptUrl: string | null;
}) => Promise<void>;

function colWidth(type: ColumnType) {
  if (type === "text" || type === "tags") {
    return 200;
  }
  if (type === "date") {
    return 150;
  }
  return 140;
}

/* ------------------------------ add column ------------------------------- */

function AddColumnDialog({
  onAdd,
}: {
  onAdd: (name: string, type: ColumnType) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ColumnType>("text");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    await onAdd(name.trim(), type);
    setName("");
    setType("text");
    setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          aria-label="Add column"
          className="shrink-0 rounded-none border-border"
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add column</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <Input
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="Column name (e.g. Phone, Address)"
            type="text"
            value={name}
          />
          <Select onValueChange={(v) => setType(v as ColumnType)} value={type}>
            <SelectTrigger className="rounded-none border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {COLUMN_TYPES.map((t) => (
                <SelectItem className="rounded-none" key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button className="w-full" type="submit">
              Add column
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------- header ---------------------------------- */

function HeaderCell({
  column,
  editing,
  onRename,
  onDelete,
  onOptions,
  onReorder,
  index,
}: {
  column: ProjectColumn;
  editing: boolean;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onOptions: (id: string, options: TagOption[]) => void;
  onReorder: (from: number, to: number) => void;
  index: number;
}) {
  const [name, setName] = useState(column.name);

  function save() {
    const value = name.trim();
    if (value && value !== column.name) {
      onRename(column.id, value);
    } else {
      setName(column.name);
    }
  }

  const style = {
    width: colWidth(column.type),
    minWidth: colWidth(column.type),
  };

  if (!editing) {
    return (
      <div
        className="shrink-0 px-3 py-2 font-medium text-muted-foreground text-sm"
        style={style}
      >
        {column.name}
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag handle for column reordering
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: drag handle for column reordering
    <div
      className="flex shrink-0 items-center gap-1 bg-secondary/40 px-2 py-2"
      draggable
      onDragOver={(e) => e.preventDefault()}
      onDragStart={(e) => e.dataTransfer.setData("text/plain", String(index))}
      onDrop={(e) => {
        e.preventDefault();
        onReorder(Number(e.dataTransfer.getData("text/plain")), index);
      }}
      style={style}
    >
      <GripVerticalIcon className="size-3.5 shrink-0 cursor-grab text-muted-foreground" />
      <input
        aria-label={`Rename ${column.name}`}
        className="w-full min-w-0 bg-transparent font-medium text-sm outline-none"
        onBlur={save}
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      {column.type === "tags" ? (
        <TagOptionsDialog
          column={column}
          onChange={(options) => onOptions(column.id, options)}
        />
      ) : null}
      <ConfirmDelete
        confirmLabel="Delete column"
        description={
          <>Delete the “{column.name}” column and its values everywhere?</>
        }
        onConfirm={() => onDelete(column.id)}
        title="Delete column?"
        triggerClassName="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
        triggerLabel={`Delete ${column.name} column`}
      >
        <XIcon className="size-3.5" />
      </ConfirmDelete>
    </div>
  );
}

/* ------------------------------- row ------------------------------------- */

function ClientRow({
  client,
  columns,
  earned,
  onEdit,
  onDelete,
}: {
  client: ProjectClient;
  columns: ProjectColumn[];
  earned: number;
  onEdit: (client: ProjectClient) => void;
  onDelete: (id: string) => void;
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
    setOffset(Math.max(-REVEAL, Math.min(REVEAL, startOffset.current + delta)));
  }
  function onPointerUp() {
    if (!dragging) {
      return;
    }
    setDragging(false);
    setOffset((current) => {
      if (current < -REVEAL / 2) {
        return -REVEAL;
      }
      if (current > REVEAL / 2) {
        return REVEAL;
      }
      return 0;
    });
  }

  function edit() {
    setOffset(0);
    onEdit(client);
  }

  return (
    <div className="relative overflow-hidden border-border/60 border-b">
      <button
        aria-label={`Edit ${client.name}`}
        className="absolute inset-y-0 left-0 flex items-center justify-center bg-primary pl-1 text-primary-foreground"
        onClick={edit}
        style={{ width: REVEAL }}
        type="button"
      >
        <PencilIcon className="size-5" />
      </button>
      <ConfirmDelete
        description={
          <>
            This removes “{client.name}”. Their logged entries stay in the
            project totals.
          </>
        }
        onConfirm={() => onDelete(client.id)}
        title="Delete client?"
        triggerClassName="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive pr-1 text-white"
        triggerLabel={`Delete ${client.name}`}
        triggerStyle={{ width: REVEAL }}
      >
        <Trash2Icon className="size-5" />
      </ConfirmDelete>

      <div
        className="flex touch-pan-y items-start bg-background"
        onPointerCancel={onPointerUp}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
      >
        <div
          className="shrink-0 px-3 py-2.5 font-medium text-[15px]"
          style={{ width: NAME_W, minWidth: NAME_W }}
        >
          {client.name}
        </div>
        {columns.map((column) => (
          <div
            className="shrink-0 px-3 py-2.5 text-sm"
            key={column.id}
            style={{
              width: colWidth(column.type),
              minWidth: colWidth(column.type),
            }}
          >
            <ClientCellValue column={column} value={client.data?.[column.id]} />
          </div>
        ))}
        <div
          className={cn(
            "shrink-0 px-3 py-2.5 text-right font-semibold text-[15px] tabular-nums",
            earned < 0 ? "text-destructive" : "text-success"
          )}
          style={{ width: EARNED_W, minWidth: EARNED_W }}
        >
          {currency.format(earned)}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- edit sheet --------------------------------- */

function EditClientSheet({
  client,
  columns,
  entries,
  onClose,
  onSave,
  onAddEntry,
  onRemoveEntry,
}: {
  client: ProjectClient;
  columns: ProjectColumn[];
  entries: ProjectEntry[];
  onClose: () => void;
  onSave: (id: string, name: string, data: Record<string, unknown>) => void;
  onAddEntry: AddClientEntry;
  onRemoveEntry: (id: string) => void;
}) {
  const [name, setName] = useState(client.name);
  const [data, setData] = useState<Record<string, unknown>>(client.data ?? {});

  function commit() {
    onSave(client.id, name.trim() || client.name, data);
  }

  const earnings = entries.filter(
    (e) => e.client_id === client.id && e.kind === "income"
  );
  const expenses = entries.filter(
    (e) => e.client_id === client.id && e.kind === "expense"
  );

  return (
    <Sheet
      onOpenChange={(next) => {
        if (!next) {
          commit();
          onClose();
        }
      }}
      open
    >
      <SheetContent
        className="w-full gap-0 overflow-y-auto sm:max-w-md"
        side="right"
      >
        <SheetHeader className="border-border/60 border-b">
          <SheetTitle>Edit client</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-muted-foreground text-sm">
              Name
            </span>
            <Input
              onChange={(e) => setName(e.target.value)}
              type="text"
              value={name}
            />
          </div>
          {columns.map((column) => (
            <div className="flex flex-col gap-1.5" key={column.id}>
              <span className="font-medium text-muted-foreground text-sm">
                {column.name}
              </span>
              <ClientCellEditor
                column={column}
                onChange={(value) =>
                  setData((prev) => ({ ...prev, [column.id]: value }))
                }
                value={data[column.id]}
              />
            </div>
          ))}

          <div className="border-border border-t pt-4">
            <ProjectEntries
              addTitle={`Earning from ${client.name}`}
              emptyText="No earnings yet."
              entries={earnings}
              inline
              kind="income"
              labelPlaceholder="What was it for?"
              onAdd={(label, amount, date, receiptUrl) =>
                onAddEntry({
                  clientId: client.id,
                  kind: "income",
                  label,
                  amount,
                  date,
                  receiptUrl,
                })
              }
              onRemove={onRemoveEntry}
              title="Earnings"
            />
          </div>
          <div className="border-border border-t pt-4">
            <ProjectEntries
              addTitle={`Expense for ${client.name}`}
              emptyText="No expenses yet."
              entries={expenses}
              inline
              kind="expense"
              labelPlaceholder="e.g. Parts, Materials"
              onAdd={(label, amount, date, receiptUrl) =>
                onAddEntry({
                  clientId: client.id,
                  kind: "expense",
                  label,
                  amount,
                  date,
                  receiptUrl,
                })
              }
              onRemove={onRemoveEntry}
              title="Expenses"
            />
          </div>

          <Button
            className="w-full rounded-none"
            onClick={() => {
              commit();
              onClose();
            }}
            type="button"
          >
            Done
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------- panel ----------------------------------- */

export function ProjectClients({
  projectId,
  entries,
  onAddEntry,
  onRemoveEntry,
}: {
  projectId: string;
  entries: ProjectEntry[];
  onAddEntry: AddClientEntry;
  onRemoveEntry: (id: string) => void;
}) {
  const supabase = createClient();
  const [clients, setClients] = useState<ProjectClient[]>([]);
  const [columns, setColumns] = useState<ProjectColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [editColumns, setEditColumns] = useState(false);
  const [editing, setEditing] = useState<ProjectClient | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase
        .from("project_clients")
        .select("*")
        .eq("project_id", projectId)
        .order("name", { ascending: true }),
      supabase
        .from("project_columns")
        .select("*")
        .eq("project_id", projectId)
        .order("position", { ascending: true }),
    ]).then(([clientRes, columnRes]) => {
      if (!active) {
        return;
      }
      if (clientRes.data) {
        setClients(clientRes.data as ProjectClient[]);
      }
      if (columnRes.data) {
        setColumns(columnRes.data as ProjectColumn[]);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [supabase, projectId]);

  async function addClient(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    const value = name.trim();
    setName("");
    const { data } = await supabase
      .from("project_clients")
      .insert({ project_id: projectId, name: value })
      .select()
      .single();
    if (data) {
      setClients((prev) =>
        [...prev, data as ProjectClient].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    }
  }

  function patchClient(id: string, patch: Partial<ProjectClient>) {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  }

  async function saveClient(
    id: string,
    nextName: string,
    data: Record<string, unknown>
  ) {
    patchClient(id, { name: nextName, data });
    await supabase
      .from("project_clients")
      .update({ name: nextName, data })
      .eq("id", id);
  }

  async function removeClient(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("project_clients").delete().eq("id", id);
  }

  async function addColumn(columnName: string, type: ColumnType) {
    const { data } = await supabase
      .from("project_columns")
      .insert({
        project_id: projectId,
        name: columnName,
        type,
        position: columns.length,
        options: [],
      })
      .select()
      .single();
    if (data) {
      setColumns((prev) => [...prev, data as ProjectColumn]);
    }
  }

  async function patchColumn(id: string, patch: Partial<ProjectColumn>) {
    setColumns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
    await supabase.from("project_columns").update(patch).eq("id", id);
  }

  async function removeColumn(id: string) {
    setColumns((prev) => prev.filter((c) => c.id !== id));
    await supabase.from("project_columns").delete().eq("id", id);
  }

  async function reorderColumns(from: number, to: number) {
    if (from === to) {
      return;
    }
    const next = [...columns];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setColumns(next.map((c, i) => ({ ...c, position: i })));
    await Promise.all(
      next.map((c, i) =>
        supabase.from("project_columns").update({ position: i }).eq("id", c.id)
      )
    );
  }

  function netFor(clientId: string) {
    return entries
      .filter((e) => e.client_id === clientId)
      .reduce(
        (acc, e) => acc + (e.kind === "income" ? e.amount : -e.amount),
        0
      );
  }

  const query = search.trim().toLowerCase();
  const filtered = query
    ? clients.filter((c) => {
        if (c.name.toLowerCase().includes(query)) {
          return true;
        }
        return Object.values(c.data ?? {}).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(query)
        );
      })
    : clients;

  const gridWidth =
    NAME_W + EARNED_W + columns.reduce((acc, c) => acc + colWidth(c.type), 0);

  return (
    <div className="flex flex-col">
      <form className="flex items-center gap-2" onSubmit={addClient}>
        <Input
          className="rounded-none border-border"
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a client…"
          type="text"
          value={name}
        />
        <Button
          aria-label="Add client"
          className="aspect-square h-auto shrink-0 self-stretch rounded-none"
          size="sm"
          type="submit"
        >
          <PlusIcon />
        </Button>
      </form>

      <div className="mt-2 flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            className="rounded-none border-border pl-9"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            type="search"
            value={search}
          />
        </div>
        <AddColumnDialog onAdd={addColumn} />
        <Button
          aria-label={editColumns ? "Done editing columns" : "Edit columns"}
          className="shrink-0 rounded-none border-border"
          onClick={() => setEditColumns((v) => !v)}
          size="icon-sm"
          type="button"
          variant={editColumns ? "default" : "outline"}
        >
          <PencilIcon />
        </Button>
      </div>

      <div className="mt-3">
        {loading ? (
          <p className="py-8 text-center text-muted-foreground text-sm">
            Loading…
          </p>
        ) : null}
        {!loading && clients.length === 0 ? (
          <EmptyState
            description="Add your first one above."
            icon={UsersIcon}
            title="No clients yet"
          />
        ) : null}
        {!loading && clients.length > 0 ? (
          <div className="overflow-x-auto border border-border">
            <div style={{ minWidth: gridWidth }}>
              <div className="flex items-stretch border-border border-b bg-card">
                <div
                  className="shrink-0 px-3 py-2 font-medium text-muted-foreground text-sm"
                  style={{ width: NAME_W, minWidth: NAME_W }}
                >
                  Client
                </div>
                {columns.map((column, index) => (
                  <HeaderCell
                    column={column}
                    editing={editColumns}
                    index={index}
                    key={column.id}
                    onDelete={removeColumn}
                    onOptions={(id, options) => patchColumn(id, { options })}
                    onRename={(id, next) => patchColumn(id, { name: next })}
                    onReorder={reorderColumns}
                  />
                ))}
                <div
                  className="ml-auto shrink-0 px-3 py-2 text-right font-medium text-muted-foreground text-sm"
                  style={{ width: EARNED_W, minWidth: EARNED_W }}
                >
                  Net
                </div>
              </div>

              {filtered.map((client) => (
                <ClientRow
                  client={client}
                  columns={columns}
                  earned={netFor(client.id)}
                  key={client.id}
                  onDelete={removeClient}
                  onEdit={setEditing}
                />
              ))}
              {filtered.length === 0 ? (
                <EmptyState
                  description="Try a different search."
                  icon={SearchIcon}
                  title="No matches"
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {editing ? (
        <EditClientSheet
          client={editing}
          columns={columns}
          entries={entries}
          onAddEntry={onAddEntry}
          onClose={() => setEditing(null)}
          onRemoveEntry={onRemoveEntry}
          onSave={saveClient}
        />
      ) : null}
    </div>
  );
}
