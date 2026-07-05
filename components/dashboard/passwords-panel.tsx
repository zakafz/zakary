"use client";

import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LockIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  checkVerifier,
  decryptString,
  deriveKey,
  encryptString,
  generateSaltB64,
  makeVerifier,
} from "@/lib/crypto";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type PasswordEntry = {
  id: string;
  name: string;
  username: string | null;
  password: string; // decrypted, in-memory only
  url: string | null;
};

const REVEAL = 64;
const GEN_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";

function generatePassword(length = 20) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => GEN_CHARS[b % GEN_CHARS.length]).join("");
}

function EntryRow({
  entry,
  onRemove,
}: {
  entry: PasswordEntry;
  onRemove: (id: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

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

  async function copyPassword() {
    await navigator.clipboard.writeText(entry.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="relative overflow-hidden">
      <ConfirmDelete
        description={
          <>
            This permanently removes the “{entry.name}” entry from your vault.
            This can’t be undone.
          </>
        }
        onConfirm={() => onRemove(entry.id)}
        title="Delete password?"
        triggerClassName="absolute inset-y-0 right-0 flex items-center justify-center bg-destructive pr-1 text-white"
        triggerLabel={`Delete ${entry.name}`}
        triggerStyle={{ width: REVEAL }}
      >
        <Trash2Icon className="size-5" />
      </ConfirmDelete>

      <div
        className={cn(
          "flex touch-pan-y items-center gap-3 bg-background py-3",
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
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate font-semibold text-[15px] leading-tight">
            {entry.name}
          </p>
          <p className="truncate font-mono text-muted-foreground text-sm">
            {revealed ? entry.password : "••••••••••"}
          </p>
          {entry.username ? (
            <p className="truncate text-muted-foreground text-xs">
              {entry.username}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            aria-label={revealed ? "Hide password" : "Show password"}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            onClick={() => setRevealed((r) => !r)}
            type="button"
          >
            {revealed ? (
              <EyeOffIcon className="size-4.5" />
            ) : (
              <EyeIcon className="size-4.5" />
            )}
          </button>
          <button
            aria-label="Copy password"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            onClick={copyPassword}
            type="button"
          >
            {copied ? (
              <CheckIcon className="size-4.5 text-success" />
            ) : (
              <CopyIcon className="size-4.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

type Gate = "loading" | "create" | "unlock" | "unlocked";

function VaultGate({
  creating,
  master,
  onMasterChange,
  error,
  busy,
  onSubmit,
}: {
  creating: boolean;
  master: string;
  onMasterChange: (value: string) => void;
  error: string | null;
  busy: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="mx-auto mt-8 flex w-full max-w-xs flex-col gap-4 border border-border p-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <LockIcon className="size-6 text-muted-foreground" />
          <p className="font-semibold">
            {creating ? "Create master password" : "Unlock vault"}
          </p>
          <p className="text-muted-foreground text-sm">
            {creating
              ? "This encrypts your passwords. You'll need it every time — it can't be recovered."
              : "Enter your master password to decrypt your vault."}
          </p>
        </div>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <Input
            autoComplete="off"
            autoFocus
            className="rounded-none border-border"
            onChange={(e) => onMasterChange(e.target.value)}
            placeholder="Master password"
            type="password"
            value={master}
          />
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
          <Button className="w-full rounded-none" disabled={busy} type="submit">
            {creating ? "Create vault" : "Unlock"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export function PasswordsPanel() {
  const supabase = createClient();

  const [gate, setGate] = useState<Gate>("loading");
  const [meta, setMeta] = useState<{ salt: string; verifier: string } | null>(
    null
  );
  const keyRef = useRef<CryptoKey | null>(null);
  const [master, setMaster] = useState("");
  const [gateError, setGateError] = useState<string | null>(null);
  const [gateBusy, setGateBusy] = useState(false);

  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");

  const q = query.trim().toLowerCase();
  const filtered = q
    ? entries.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.username?.toLowerCase().includes(q)
      )
    : entries;

  // Determine whether a vault already exists.
  useEffect(() => {
    let active = true;
    supabase
      .from("vault_meta")
      .select("salt, verifier")
      .maybeSingle()
      .then(({ data }) => {
        if (!active) {
          return;
        }
        if (data) {
          setMeta(data as { salt: string; verifier: string });
          setGate("unlock");
        } else {
          setGate("create");
        }
      });
    return () => {
      active = false;
    };
  }, [supabase]);

  async function loadEntries(key: CryptoKey) {
    const { data } = await supabase
      .from("passwords")
      .select("*")
      .order("name", { ascending: true });
    if (!data) {
      return;
    }
    const decrypted = await Promise.all(
      (data as (Omit<PasswordEntry, "password"> & { password: string })[]).map(
        async (row) => {
          let plain = "";
          try {
            plain = await decryptString(key, row.password);
          } catch {
            plain = "⚠ cannot decrypt";
          }
          return { ...row, password: plain } as PasswordEntry;
        }
      )
    );
    setEntries(decrypted);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (master.length < 8) {
      setGateError("Use at least 8 characters.");
      return;
    }
    setGateBusy(true);
    const salt = generateSaltB64();
    const key = await deriveKey(master, salt);
    const verifier = await makeVerifier(key);
    const { error } = await supabase
      .from("vault_meta")
      .insert({ salt, verifier });
    setGateBusy(false);
    if (error) {
      setGateError(error.message);
      return;
    }
    keyRef.current = key;
    setMaster("");
    setGate("unlocked");
    await loadEntries(key);
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!meta) {
      return;
    }
    setGateBusy(true);
    const key = await deriveKey(master, meta.salt);
    const ok = await checkVerifier(key, meta.verifier);
    setGateBusy(false);
    if (!ok) {
      setGateError("Incorrect master password.");
      return;
    }
    keyRef.current = key;
    setMaster("");
    setGateError(null);
    setGate("unlocked");
    await loadEntries(key);
  }

  function resetForm() {
    setName("");
    setUsername("");
    setPassword("");
    setUrl("");
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    const key = keyRef.current;
    if (!(key && name.trim() && password)) {
      return;
    }
    setSaving(true);
    const encrypted = await encryptString(key, password);
    const { data, error } = await supabase
      .from("passwords")
      .insert({
        name: name.trim(),
        username: username.trim() || null,
        password: encrypted,
        url: url.trim() || null,
      })
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      return;
    }
    const row = data as PasswordEntry;
    setEntries((prev) =>
      [...prev, { ...row, password }].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    );
    resetForm();
    setDialogOpen(false);
  }

  async function removeEntry(id: string) {
    setEntries((prev) => prev.filter((p) => p.id !== id));
    await supabase.from("passwords").delete().eq("id", id);
  }

  function handleGateSubmit(e: React.FormEvent) {
    if (gate === "create") {
      handleCreate(e);
    } else {
      handleUnlock(e);
    }
  }

  // --- Vault gate (create / unlock) ---
  if (gate !== "unlocked") {
    return (
      <VaultGate
        busy={gateBusy || gate === "loading"}
        creating={gate === "create"}
        error={gateError}
        master={master}
        onMasterChange={(value) => {
          setMaster(value);
          setGateError(null);
        }}
        onSubmit={handleGateSubmit}
      />
    );
  }

  // --- Unlocked vault ---
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
          <Input
            className="rounded-none border-border pl-9"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search passwords"
            type="text"
            value={query}
          />
        </div>
        <Dialog
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (open) {
              resetForm();
            }
          }}
          open={dialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              aria-label="Add password"
              className="aspect-square h-auto shrink-0 self-stretch rounded-none"
              size="sm"
              type="button"
            >
              <PlusIcon />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Add password</DialogTitle>
              <DialogDescription>
                Store a new credential in your vault.
              </DialogDescription>
            </DialogHeader>

            <form className="flex min-w-0 flex-col gap-3" onSubmit={addEntry}>
              <Input
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (e.g. GitHub)"
                type="text"
                value={name}
              />
              <Input
                autoComplete="off"
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or email (optional)"
                type="text"
                value={username}
              />
              <div className="flex gap-2">
                <Input
                  autoComplete="off"
                  className="font-mono"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  type="text"
                  value={password}
                />
                <Button
                  aria-label="Generate password"
                  className="aspect-square shrink-0 rounded-none"
                  onClick={() => setPassword(generatePassword())}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <RefreshCwIcon />
                </Button>
              </div>
              <Input
                autoComplete="off"
                onChange={(e) => setUrl(e.target.value)}
                placeholder="URL (optional)"
                type="text"
                value={url}
              />

              <DialogFooter>
                <Button className="w-full" disabled={saving} type="submit">
                  {saving ? "Saving…" : "Save password"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-border/60">
        {filtered.map((entry) => (
          <EntryRow entry={entry} key={entry.id} onRemove={removeEntry} />
        ))}
        {filtered.length === 0 && entries.length === 0 ? (
          <EmptyState
            description="Add your first one above."
            icon={KeyRoundIcon}
            title="No passwords yet"
          />
        ) : null}
        {filtered.length === 0 && entries.length > 0 ? (
          <EmptyState
            description="Try a different search."
            icon={SearchIcon}
            title="No matches"
          />
        ) : null}
      </div>
    </div>
  );
}
