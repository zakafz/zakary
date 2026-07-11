"use client";

import { ChevronLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ClientCellEditor } from "@/components/dashboard/project-client-cell";
import { ProjectEntries } from "@/components/dashboard/project-entries";
import { ProjectReceipts } from "@/components/dashboard/project-receipts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  Project,
  ProjectClient,
  ProjectColumn,
  ProjectEntry,
} from "@/data/projects";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AddClientEntry = (payload: {
  clientId: string;
  kind: "income" | "expense";
  label: string;
  amount: number;
  date: string;
  receiptUrl: string | null;
}) => Promise<void>;

const TABS = ["info", "receipts", "ledger"] as const;
type Tab = (typeof TABS)[number];

const TAB_LABEL: Record<Tab, string> = {
  info: "Info",
  receipts: "Receipts",
  ledger: "Earnings",
};

export function ClientPage({
  project,
  client,
  entries,
  onBack,
  onAddEntry,
  onRemoveEntry,
  onClientSaved,
}: {
  project: Project;
  client: ProjectClient;
  entries: ProjectEntry[];
  onBack: () => void;
  onAddEntry: AddClientEntry;
  onRemoveEntry: (id: string) => void;
  onClientSaved: (client: ProjectClient) => void;
}) {
  const supabase = createClient();
  const [tab, setTab] = useState<Tab>("info");
  const [columns, setColumns] = useState<ProjectColumn[]>([]);
  const [name, setName] = useState(client.name);
  const [data, setData] = useState<Record<string, unknown>>(client.data ?? {});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("project_columns")
      .select("*")
      .eq("project_id", project.id)
      .order("position", { ascending: true })
      .then(({ data: cols }) => {
        if (cols) {
          setColumns(cols as ProjectColumn[]);
        }
      });
  }, [supabase, project.id]);

  async function save() {
    setSaving(true);
    const nextName = name.trim() || client.name;
    await supabase
      .from("project_clients")
      .update({ name: nextName, data })
      .eq("id", client.id);
    setSaving(false);
    setDirty(false);
    onClientSaved({ ...client, name: nextName, data });
  }

  const earnings = entries.filter(
    (e) => e.client_id === client.id && e.kind === "income"
  );
  const expenses = entries.filter(
    (e) => e.client_id === client.id && e.kind === "expense"
  );
  const net =
    earnings.reduce((a, e) => a + e.amount, 0) -
    expenses.reduce((a, e) => a + e.amount, 0);

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
        <div className="flex size-10 shrink-0 items-center justify-center bg-secondary font-semibold text-secondary-foreground">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="truncate font-semibold text-lg leading-tight">
            {name || client.name}
          </h2>
          <span className="text-muted-foreground text-sm">{project.name}</span>
        </div>
      </div>

      <div className="mt-6 flex gap-1 border-border border-b">
        {TABS.map((t) => (
          <button
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2 font-medium text-sm transition-colors",
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
            key={t}
            onClick={() => setTab(t)}
            type="button"
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "info" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-muted-foreground text-sm">
                Name
              </span>
              <Input
                className="rounded-none border-border"
                onChange={(e) => {
                  setName(e.target.value);
                  setDirty(true);
                }}
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
                  onChange={(value) => {
                    setData((prev) => ({ ...prev, [column.id]: value }));
                    setDirty(true);
                  }}
                  value={data[column.id]}
                />
              </div>
            ))}
            <Button
              className="rounded-none"
              disabled={!dirty || saving}
              onClick={save}
              type="button"
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        ) : null}

        {tab === "receipts" ? (
          <ProjectReceipts
            client={client}
            projectId={project.id}
            projectName={project.name}
          />
        ) : null}

        {tab === "ledger" ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border border-border p-4">
              <span className="text-muted-foreground text-sm uppercase tracking-wide">
                Net
              </span>
              <span
                className={cn(
                  "font-semibold text-lg tabular-nums",
                  net < 0 ? "text-destructive" : "text-success"
                )}
              >
                {new Intl.NumberFormat("en-CA", {
                  style: "currency",
                  currency: "CAD",
                }).format(net)}
              </span>
            </div>
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
        ) : null}
      </div>
    </div>
  );
}
