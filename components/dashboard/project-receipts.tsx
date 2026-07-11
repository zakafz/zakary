"use client";

import {
  DownloadIcon,
  Loader2Icon,
  PlusIcon,
  ReceiptTextIcon,
  SendIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  generateReceiptPdf,
  type ReceiptDocData,
  ReceiptDocument,
} from "@/components/dashboard/receipt-document";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ProjectClient,
  type ProjectColumn,
  shortDate,
} from "@/data/projects";
import {
  type DraftItem,
  EMPTY_BRANDING,
  money,
  type ProjectBranding,
  type ProjectService,
  type Receipt,
  type ReceiptItem,
  receiptNo,
  receiptTotal,
} from "@/data/receipts";
import { createClient } from "@/lib/supabase/client";
import { cn, formatPhone } from "@/lib/utils";

const RECEIPT_BUCKET = "receipts";

const CAR_RE = /car|vehicle|voiture|auto/i;
const EMAIL_RE = /email|courriel|e-?mail/i;
const PHONE_RE = /phone|tel/i;
const PAID_BY_OPTIONS = ["Cash", "Interac"];

/** Locates the phone / car / email columns so a picked client auto-fills. */
function detectColumns(columns: ProjectColumn[]) {
  const phone =
    columns.find((c) => c.type === "phone") ??
    columns.find((c) => PHONE_RE.test(c.name));
  const car = columns.find((c) => CAR_RE.test(c.name));
  const email = columns.find((c) => EMAIL_RE.test(c.name));
  return { phone, car, email };
}

function columnValue(client: ProjectClient, column?: ProjectColumn) {
  if (!column) {
    return "";
  }
  const value = client.data?.[column.id];
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function statusBadge(status: Receipt["status"]) {
  return status === "sent"
    ? "bg-success/15 text-success"
    : "bg-secondary text-muted-foreground";
}

/** supabase-js hides the response body on non-2xx; dig the real message out. */
async function extractFnError(error: { message: string; context?: unknown }) {
  const ctx = (error as { context?: Response }).context;
  if (ctx && typeof ctx.json === "function") {
    try {
      const body = await ctx.json();
      return body.detail ?? body.error ?? error.message;
    } catch {
      // fall through to the generic message
    }
  }
  return error.message;
}

function docData(
  receipt: Receipt,
  items: { description: string; amount: number }[],
  branding: ProjectBranding
): ReceiptDocData {
  return {
    number: receiptNo(branding.prefix, receipt.number),
    date: shortDate(receipt.issued_date),
    business: {
      name: branding.display_name || "Business",
      logoUrl: branding.logo_url,
      phone: branding.phone,
      email: branding.email,
      address: branding.address,
      footerNote: branding.footer_note,
    },
    customer: {
      name: receipt.customer_name,
      email: receipt.customer_email,
      phone: receipt.customer_phone,
    },
    referenceLabel: receipt.reference_label,
    referenceValue: receipt.reference_value,
    paidBy: receipt.paid_by,
    items,
    total: receipt.total,
  };
}

/* ------------------------------ new receipt ------------------------------ */

type FormItem = {
  service_id: string | null;
  description: string;
  amount: string;
};

function NewReceiptDrawer({
  open,
  onOpenChange,
  clients,
  columns,
  services,
  lockedClient,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ProjectClient[];
  columns: ProjectColumn[];
  services: ProjectService[];
  lockedClient: ProjectClient | null;
  onCreate: (payload: {
    clientId: string | null;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string | null;
    referenceLabel: string;
    referenceValue: string;
    paidBy: string;
    issuedDate: string;
    items: DraftItem[];
  }) => Promise<void>;
}) {
  const cols = useMemo(() => detectColumns(columns), [columns]);
  const refLabel = cols.car?.name ?? "Vehicle";

  const [clientId, setClientId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [refValue, setRefValue] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [items, setItems] = useState<FormItem[]>([]);
  const [saving, setSaving] = useState(false);

  const fillFromClient = useCallback(
    (c: ProjectClient) => {
      setEmail(columnValue(c, cols.email));
      setPhone(formatPhone(columnValue(c, cols.phone)));
      setRefValue(columnValue(c, cols.car));
    },
    [cols]
  );

  const reset = useCallback(() => {
    setClientId("");
    setNewName("");
    setPaidBy("");
    setDate(new Date());
    setItems([]);
    if (lockedClient) {
      fillFromClient(lockedClient);
    } else {
      setEmail("");
      setPhone("");
      setRefValue("");
    }
  }, [lockedClient, fillFromClient]);

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  function selectClient(value: string) {
    setClientId(value);
    const c = clients.find((x) => x.id === value);
    if (c) {
      fillFromClient(c);
    }
  }

  const total = receiptTotal(
    items.map((i) => ({
      service_id: i.service_id,
      description: i.description,
      unit_price: Number.parseFloat(i.amount) || 0,
      quantity: 1,
    }))
  );

  function addLine(value: string) {
    if (value === "__custom__") {
      setItems((prev) => [
        ...prev,
        { service_id: null, description: "", amount: "" },
      ]);
      return;
    }
    const svc = services.find((s) => s.id === value);
    if (svc) {
      setItems((prev) => [
        ...prev,
        {
          service_id: svc.id,
          description: svc.name,
          amount: String(svc.price),
        },
      ]);
    }
  }

  function setItem(index: number, patch: Partial<FormItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  function removeLine(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const usingNewClient = !lockedClient && clientId === "__new__";

  function resolveCustomer(): { clientId: string | null; name: string } | null {
    if (lockedClient) {
      return { clientId: lockedClient.id, name: lockedClient.name };
    }
    if (usingNewClient) {
      const name = newName.trim();
      return name ? { clientId: null, name } : null;
    }
    const c = clients.find((x) => x.id === clientId);
    return c ? { clientId: c.id, name: c.name } : null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleanItems = items
      .filter((i) => i.description.trim())
      .map((i) => ({
        service_id: i.service_id,
        description: i.description.trim(),
        unit_price: Number.parseFloat(i.amount) || 0,
        quantity: 1,
      }));
    if (cleanItems.length === 0) {
      return;
    }
    const customer = resolveCustomer();
    if (!customer) {
      return;
    }

    setSaving(true);
    await onCreate({
      clientId: customer.clientId,
      customerName: customer.name,
      customerEmail: email.trim() || null,
      customerPhone: phone.trim() || null,
      referenceLabel: refLabel.trim() || "Reference",
      referenceValue: refValue.trim(),
      paidBy: paidBy.trim(),
      issuedDate: date.toISOString().slice(0, 10),
      items: cleanItems,
    });
    setSaving(false);
    onOpenChange(false);
  }

  return (
    <Drawer onOpenChange={onOpenChange} open={open}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>New receipt</DrawerTitle>
        </DrawerHeader>
        <form
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5"
          id="new-receipt-form"
          onSubmit={submit}
        >
          {/* Customer */}
          <section className="flex flex-col gap-3">
            <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
              Customer
            </h3>
            {lockedClient ? (
              <div className="flex items-center gap-2 border border-border bg-secondary/40 px-3 py-2">
                <span className="font-medium text-sm">{lockedClient.name}</span>
              </div>
            ) : (
              <Select onValueChange={selectClient} value={clientId}>
                <SelectTrigger className="w-full rounded-none border-border">
                  <SelectValue placeholder="Select a client…" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem className="rounded-none" value="__new__">
                    + New client
                  </SelectItem>
                  {clients.map((c) => (
                    <SelectItem
                      className="rounded-none"
                      key={c.id}
                      value={c.id}
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {usingNewClient ? (
              <Input
                className="rounded-none border-border"
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New client name"
                value={newName}
              />
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                className="rounded-none border-border"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                type="email"
                value={email}
              />
              <Input
                className="rounded-none border-border"
                inputMode="tel"
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="Phone"
                type="tel"
                value={phone}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-muted-foreground text-sm">
                {refLabel}
              </span>
              <Input
                className="rounded-none border-border"
                onChange={(e) => setRefValue(e.target.value)}
                placeholder="e.g. Ferrari 458 Italia"
                value={refValue}
              />
            </div>
          </section>

          {/* Line items */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                Services
              </h3>
              <span className="font-semibold text-sm tabular-nums">
                {money(total)}
              </span>
            </div>
            {items.length > 0 ? (
              <div className="flex flex-col border border-border">
                {items.map((item, index) => (
                  <div
                    className="group flex items-center gap-2 border-border/60 border-b px-3 py-2 last:border-b-0"
                    key={index}
                  >
                    <input
                      className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
                      onChange={(e) =>
                        setItem(index, { description: e.target.value })
                      }
                      placeholder="Description"
                      value={item.description}
                    />
                    <div className="flex shrink-0 items-center text-muted-foreground">
                      <span className="text-sm">$</span>
                      <input
                        aria-label="Amount"
                        className="no-spinner w-16 bg-transparent text-right font-medium text-[15px] text-foreground tabular-nums outline-none placeholder:text-muted-foreground"
                        inputMode="decimal"
                        onChange={(e) =>
                          setItem(index, { amount: e.target.value })
                        }
                        placeholder="0.00"
                        type="number"
                        value={item.amount}
                      />
                    </div>
                    <button
                      aria-label="Remove line"
                      className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      onClick={() => removeLine(index)}
                      type="button"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="border border-border border-dashed px-3 py-4 text-center text-muted-foreground text-sm">
                Add a service or a custom line below.
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <button
                  className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
                  key={s.id}
                  onClick={() => addLine(s.id)}
                  type="button"
                >
                  <PlusIcon className="size-3.5 text-muted-foreground" />
                  {s.name}
                  <span className="text-muted-foreground tabular-nums">
                    {money(s.price)}
                  </span>
                </button>
              ))}
              <button
                className="flex items-center gap-1.5 border border-border border-dashed px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-secondary hover:text-foreground"
                onClick={() => addLine("__custom__")}
                type="button"
              >
                <PlusIcon className="size-3.5" />
                Custom line
              </button>
            </div>
          </section>

          {/* Payment */}
          <section className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-muted-foreground text-sm">
                Paid by
              </span>
              <Select onValueChange={setPaidBy} value={paidBy}>
                <SelectTrigger className="h-9 w-full rounded-none border-border">
                  <SelectValue placeholder="Select…" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {PAID_BY_OPTIONS.map((o) => (
                    <SelectItem className="rounded-none" key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="font-medium text-muted-foreground text-sm">
                Date
              </span>
              <DatePicker
                className="h-9 rounded-none border-border"
                onChange={setDate}
                value={date}
              />
            </div>
          </section>
        </form>
        <DrawerFooter>
          <Button
            className="w-full rounded-none"
            disabled={saving}
            form="new-receipt-form"
            type="submit"
          >
            {saving ? (
              <>
                <Loader2Icon className="animate-spin" />
                Creating…
              </>
            ) : (
              `Create receipt · ${money(total)}`
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/* ------------------------------ detail view ------------------------------ */

function ReceiptDetailDrawer({
  receipt,
  branding,
  onClose,
  onSent,
  onDeleted,
}: {
  receipt: Receipt;
  branding: ProjectBranding;
  onClose: () => void;
  onSent: () => void;
  onDeleted: (id: string) => void;
}) {
  const supabase = createClient();
  const [items, setItems] = useState<{ description: string; amount: number }[]>(
    []
  );
  const [busy, setBusy] = useState<null | "download" | "send">(null);
  const [email, setEmail] = useState(receipt.customer_email ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("receipt_items")
      .select("*")
      .eq("receipt_id", receipt.id)
      .order("position", { ascending: true })
      .then(({ data: rows }) => {
        if (rows) {
          setItems(
            (rows as ReceiptItem[]).map((i) => ({
              description: i.description,
              amount: i.amount,
            }))
          );
        }
      });
  }, [supabase, receipt.id]);

  const data = useMemo(
    () => docData(receipt, items, branding),
    [receipt, items, branding]
  );

  async function download() {
    setBusy("download");
    try {
      const blob = await generateReceiptPdf(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(null);
    }
  }

  async function ensurePdfUrl(): Promise<string | null> {
    if (receipt.pdf_url) {
      return receipt.pdf_url;
    }
    const blob = await generateReceiptPdf(data);
    const path = `${receipt.id}.pdf`;
    const { error } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(path, blob, { upsert: true, contentType: "application/pdf" });
    if (error) {
      return null;
    }
    const { data: pub } = supabase.storage
      .from(RECEIPT_BUCKET)
      .getPublicUrl(path);
    await supabase
      .from("receipts")
      .update({ pdf_url: pub.publicUrl })
      .eq("id", receipt.id);
    return pub.publicUrl;
  }

  async function send() {
    setMsg(null);
    if (!email.trim()) {
      setMsg("Enter a recipient email.");
      return;
    }
    setBusy("send");
    try {
      const pdfUrl = await ensurePdfUrl();
      if (!pdfUrl) {
        setMsg("Couldn't prepare the PDF. Try Download instead.");
        return;
      }
      const { data: result, error } = await supabase.functions.invoke(
        "send-receipt",
        {
          body: {
            to: email.trim(),
            number: data.number,
            businessName: data.business.name,
            customerName: data.customer.name,
            total: money(data.total),
            pdfUrl,
          },
        }
      );
      if (error) {
        setMsg(`Couldn't send: ${await extractFnError(error)}`);
        return;
      }
      const resultErr = (result as { error?: string } | null)?.error;
      if (resultErr) {
        setMsg(`Couldn't send: ${resultErr}`);
        return;
      }
      await supabase
        .from("receipts")
        .update({ status: "sent" })
        .eq("id", receipt.id);
      onSent();
      setMsg("Sent ✓");
    } finally {
      setBusy(null);
    }
  }

  const scale = 0.44;

  return (
    <Drawer onOpenChange={(o) => (o ? null : onClose())} open>
      <DrawerContent>
        <DrawerHeader className="flex-row items-center justify-between">
          <DrawerTitle>{data.number}</DrawerTitle>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-medium text-xs capitalize",
              statusBadge(receipt.status)
            )}
          >
            {receipt.status}
          </span>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-secondary/30 p-5">
          <div
            className="mx-auto overflow-hidden border border-border shadow-lg"
            style={{ width: 794 * scale, height: 1123 * scale }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <ReceiptDocument data={data} />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-1.5">
            <span className="font-medium text-muted-foreground text-sm">
              Recipient email
            </span>
            <Input
              className="rounded-none border-border bg-background"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@email.com"
              type="email"
              value={email}
            />
            {msg ? (
              <p className="text-muted-foreground text-sm">{msg}</p>
            ) : null}
          </div>
        </div>

        <DrawerFooter className="flex-row gap-2">
          <Button
            className="flex-1 rounded-none"
            disabled={busy !== null}
            onClick={download}
            type="button"
            variant="outline"
          >
            {busy === "download" ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <DownloadIcon />
            )}
            PDF
          </Button>
          <Button
            className="flex-1 rounded-none"
            disabled={busy !== null}
            onClick={send}
            type="button"
          >
            {busy === "send" ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <SendIcon />
            )}
            Send
          </Button>
          <ConfirmDelete
            description={
              <>Delete receipt {data.number}? This can't be undone.</>
            }
            onConfirm={() => {
              onDeleted(receipt.id);
              onClose();
            }}
            title="Delete receipt?"
            triggerClassName="flex size-9 shrink-0 items-center justify-center border border-border text-muted-foreground transition-colors hover:text-destructive"
            triggerLabel={`Delete ${data.number}`}
          >
            <Trash2Icon className="size-4" />
          </ConfirmDelete>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/* -------------------------------- panel ---------------------------------- */

export function ProjectReceipts({
  projectId,
  projectName,
  client,
}: {
  projectId: string;
  projectName: string;
  client?: ProjectClient | null;
}) {
  const supabase = createClient();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [clients, setClients] = useState<ProjectClient[]>([]);
  const [columns, setColumns] = useState<ProjectColumn[]>([]);
  const [services, setServices] = useState<ProjectService[]>([]);
  const [branding, setBranding] = useState<ProjectBranding>(
    EMPTY_BRANDING(projectId)
  );
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [detail, setDetail] = useState<Receipt | null>(null);

  const lockedClient = client ?? null;

  useEffect(() => {
    let active = true;
    const receiptQuery = supabase
      .from("receipts")
      .select("*")
      .eq("project_id", projectId)
      .order("number", { ascending: false });
    if (client) {
      receiptQuery.eq("client_id", client.id);
    }
    Promise.all([
      receiptQuery,
      supabase.from("project_clients").select("*").eq("project_id", projectId),
      supabase
        .from("project_services")
        .select("*")
        .eq("project_id", projectId)
        .order("position"),
      supabase
        .from("project_branding")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle(),
      supabase
        .from("project_columns")
        .select("*")
        .eq("project_id", projectId)
        .order("position"),
    ]).then(([rRes, cRes, sRes, bRes, colRes]) => {
      if (!active) {
        return;
      }
      setReceipts((rRes.data as Receipt[]) ?? []);
      setClients((cRes.data as ProjectClient[]) ?? []);
      setColumns((colRes.data as ProjectColumn[]) ?? []);
      setServices((sRes.data as ProjectService[]) ?? []);
      setBranding(
        (bRes.data as ProjectBranding | null) ?? {
          ...EMPTY_BRANDING(projectId),
          display_name: projectName,
        }
      );
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [supabase, projectId, projectName, client]);

  async function ensureClient(
    clientId: string | null,
    name: string
  ): Promise<string | null> {
    if (clientId) {
      return clientId;
    }
    const { data } = await supabase
      .from("project_clients")
      .insert({ project_id: projectId, name })
      .select("*")
      .single();
    if (!data) {
      return null;
    }
    const created = data as ProjectClient;
    setClients((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name))
    );
    return created.id;
  }

  async function createReceipt(payload: {
    clientId: string | null;
    customerName: string;
    customerEmail: string | null;
    customerPhone: string | null;
    referenceLabel: string;
    referenceValue: string;
    paidBy: string;
    issuedDate: string;
    items: DraftItem[];
  }) {
    const clientId = await ensureClient(payload.clientId, payload.customerName);

    const nextNumber =
      receipts.reduce((max, r) => Math.max(max, r.number), 0) + 1;
    const total = receiptTotal(payload.items);

    const { data: receipt } = await supabase
      .from("receipts")
      .insert({
        project_id: projectId,
        client_id: clientId,
        customer_name: payload.customerName,
        customer_email: payload.customerEmail,
        customer_phone: payload.customerPhone,
        number: nextNumber,
        issued_date: payload.issuedDate,
        reference_label: payload.referenceLabel,
        reference_value: payload.referenceValue || null,
        paid_by: payload.paidBy || null,
        total,
        status: "draft",
      })
      .select()
      .single();

    if (!receipt) {
      return;
    }
    const created = receipt as Receipt;

    await supabase.from("receipt_items").insert(
      payload.items.map((it, i) => ({
        receipt_id: created.id,
        service_id: it.service_id,
        description: it.description,
        unit_price: it.unit_price,
        quantity: it.quantity,
        amount: it.unit_price * it.quantity,
        position: i,
      }))
    );

    setReceipts((prev) => [created, ...prev]);
    setDetail(created);
  }

  async function removeReceipt(id: string) {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    await supabase.from("receipts").delete().eq("id", id);
  }

  function markSent(id: string) {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "sent" } : r))
    );
  }

  return (
    <div className="flex flex-col">
      <Button
        className="w-full rounded-none"
        onClick={() => setNewOpen(true)}
        type="button"
      >
        <PlusIcon />
        New receipt
      </Button>

      <div className="mt-4 flex flex-col divide-y divide-border/60 border border-border">
        {loading ? (
          <p className="shimmer py-12 text-center text-muted-foreground text-sm">
            Loading…
          </p>
        ) : null}
        {receipts.map((r) => (
          <button
            className="flex items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-secondary/40"
            key={r.id}
            onClick={() => setDetail(r)}
            type="button"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium text-[15px] leading-tight">
                {receiptNo(branding.prefix, r.number)}
              </span>
              <span className="truncate text-muted-foreground text-sm">
                {r.customer_name} · {shortDate(r.issued_date)}
              </span>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 font-medium text-[11px] capitalize",
                statusBadge(r.status)
              )}
            >
              {r.status}
            </span>
            <span className="shrink-0 font-semibold text-[15px] tabular-nums">
              {money(r.total)}
            </span>
          </button>
        ))}
        {loading || receipts.length > 0 ? null : (
          <EmptyState
            description="Create a receipt and send it to your client."
            icon={ReceiptTextIcon}
            title="No receipts yet"
          />
        )}
      </div>

      <NewReceiptDrawer
        clients={clients}
        columns={columns}
        lockedClient={lockedClient}
        onCreate={createReceipt}
        onOpenChange={setNewOpen}
        open={newOpen}
        services={services}
      />

      {detail ? (
        <ReceiptDetailDrawer
          branding={branding}
          onClose={() => setDetail(null)}
          onDeleted={removeReceipt}
          onSent={() => markSent(detail.id)}
          receipt={detail}
        />
      ) : null}
    </div>
  );
}
