"use client";

import { ImageIcon, Loader2Icon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Project } from "@/data/projects";
import { createClient } from "@/lib/supabase/client";

const LOGO_BUCKET = "project-logos";

export function ProjectDialog({
  editing,
  open,
  onOpenChange,
  onSaved,
}: {
  editing: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (project: Project, isNew: boolean) => void;
}) {
  const supabase = createClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState(editing?.name ?? "");
  const [total, setTotal] = useState(
    editing?.total ? String(editing.total) : ""
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(
    editing?.logo_url ?? null
  );

  const isEditing = editing !== null;

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
      setLogoUrl(data.publicUrl);
    }
    setUploading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    const payload = {
      type: "project" as const,
      name: name.trim(),
      logo_url: logoUrl,
      total: Math.abs(Number.parseFloat(total) || 0),
    };

    setSaving(true);
    const query = isEditing
      ? supabase
          .from("projects")
          .update(payload)
          .eq("id", editing.id)
          .select()
          .single()
      : supabase.from("projects").insert(payload).select().single();
    const { data, error } = await query;
    setSaving(false);

    if (error || !data) {
      return;
    }
    onSaved(data as Project, !isEditing);
    onOpenChange(false);
  }

  let submitLabel = isEditing ? "Save changes" : "Create project";
  if (saving) {
    submitLabel = "Saving…";
  }

  function renderLogo() {
    if (uploading) {
      return <Loader2Icon className="size-5 animate-spin" />;
    }
    if (logoUrl) {
      return (
        <Image
          alt=""
          className="object-cover"
          fill
          sizes="56px"
          src={logoUrl}
        />
      );
    }
    return <ImageIcon className="size-5" />;
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit project" : "New project"}
          </DialogTitle>
          <DialogDescription>
            A single engagement with an agreed total (e.g. an app build).
          </DialogDescription>
        </DialogHeader>

        <form className="flex min-w-0 flex-col gap-4" onSubmit={submit}>
          <div className="flex items-center gap-3">
            <button
              aria-label="Upload logo"
              className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary text-muted-foreground"
              onClick={() => fileInput.current?.click()}
              type="button"
            >
              {renderLogo()}
            </button>
            <div className="flex flex-col text-sm">
              <span className="font-medium">Logo</span>
              <span className="text-muted-foreground">
                {logoUrl ? "Tap to replace" : "Tap to upload an image"}
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

          <Input
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            type="text"
            value={name}
          />

          <div className="flex flex-col gap-1.5">
            <span className="font-medium text-muted-foreground text-sm">
              Agreed total
            </span>
            <Input
              inputMode="decimal"
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={total}
            />
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              disabled={saving || uploading}
              type="submit"
            >
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
