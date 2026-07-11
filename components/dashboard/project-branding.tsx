"use client";

import { CheckIcon, ImageIcon, Loader2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type ProjectBranding as Branding,
  EMPTY_BRANDING,
  receiptNo,
} from "@/data/receipts";
import { createClient } from "@/lib/supabase/client";

const LOGO_BUCKET = "project-logos";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-medium text-muted-foreground text-sm">{label}</span>
      {children}
    </div>
  );
}

export function ProjectBranding({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const supabase = createClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [branding, setBranding] = useState<Branding>(EMPTY_BRANDING(projectId));
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    supabase
      .from("project_branding")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) {
          return;
        }
        if (data) {
          setBranding(data as Branding);
        } else {
          setBranding({
            ...EMPTY_BRANDING(projectId),
            display_name: projectName,
          });
        }
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [supabase, projectId, projectName]);

  function set<K extends keyof Branding>(key: K, value: Branding[K]) {
    setBranding((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(path, file, { upsert: false });
    if (!error) {
      const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
      set("logo_url", data.publicUrl);
    }
    setUploading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase
      .from("project_branding")
      .upsert(
        { ...branding, project_id: projectId },
        { onConflict: "project_id" }
      );
    setSaving(false);
    setSaved(true);
  }

  if (loading) {
    return (
      <p className="shimmer py-12 text-center text-muted-foreground text-sm">
        Loading…
      </p>
    );
  }

  function renderLogo() {
    if (uploading) {
      return <Loader2Icon className="size-5 animate-spin" />;
    }
    if (branding.logo_url) {
      return (
        // biome-ignore lint/performance/noImgElement: needs natural aspect ratio, not a cropped fill
        // biome-ignore lint/correctness/useImageSize: sized via h-14 + w-auto
        <img
          alt=""
          className="h-14 w-auto object-contain"
          src={branding.logo_url}
        />
      );
    }
    return <ImageIcon className="size-5" />;
  }

  function renderSaveLabel() {
    if (saving) {
      return (
        <>
          <Loader2Icon className="animate-spin" />
          Saving…
        </>
      );
    }
    if (saved) {
      return (
        <>
          <CheckIcon />
          Saved
        </>
      );
    }
    return "Save branding";
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={save}>
      <div className="flex items-center gap-3">
        <button
          className="flex h-20 min-w-20 max-w-56 shrink-0 items-center justify-center overflow-hidden border border-border bg-secondary px-4 text-muted-foreground"
          onClick={() => fileInput.current?.click()}
          type="button"
        >
          {renderLogo()}
        </button>
        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm">Receipt logo</span>
          <span className="text-muted-foreground text-xs">
            Shown at the top of every receipt. PNG with transparency works best.
          </span>
        </div>
        <input
          accept="image/*"
          className="hidden"
          onChange={handleFile}
          ref={fileInput}
          type="file"
        />
      </div>

      <Field label="Business name (as shown on receipts)">
        <Input
          className="rounded-none border-border"
          onChange={(e) => set("display_name", e.target.value)}
          placeholder="Project name"
          value={branding.display_name}
        />
      </Field>

      <Field label="Receipt number prefix">
        <Input
          className="rounded-none border-border uppercase"
          maxLength={8}
          onChange={(e) => set("prefix", e.target.value.toUpperCase())}
          placeholder="Prefix"
          value={branding.prefix}
        />
        <span className="text-muted-foreground text-xs">
          Receipts will be numbered {receiptNo(branding.prefix || "UNSET", 8)}.
        </span>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Phone">
          <Input
            className="rounded-none border-border"
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 (438) 929-8554"
            value={branding.phone ?? ""}
          />
        </Field>
        <Field label="Email">
          <Input
            className="rounded-none border-border"
            onChange={(e) => set("email", e.target.value)}
            placeholder="contact@name.com"
            type="email"
            value={branding.email ?? ""}
          />
        </Field>
      </div>

      <Field label="Address">
        <Input
          className="rounded-none border-border"
          onChange={(e) => set("address", e.target.value)}
          placeholder="123 rue nadon"
          value={branding.address ?? ""}
        />
      </Field>

      <Field label="Footer note">
        <Textarea
          className="rounded-none border-border"
          onChange={(e) => set("footer_note", e.target.value)}
          placeholder="Thank you for choosing {companyName}"
          rows={2}
          value={branding.footer_note ?? ""}
        />
      </Field>

      <Button className="rounded-none" disabled={saving} type="submit">
        {renderSaveLabel()}
      </Button>
    </form>
  );
}
