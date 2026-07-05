"use client";

import { TagsIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  type ProjectColumn,
  TAG_COLORS,
  type TagOption,
  tagChip,
} from "@/data/projects";
import { cn } from "@/lib/utils";

export function TagOptionsDialog({
  column,
  onChange,
}: {
  column: ProjectColumn;
  onChange: (options: TagOption[]) => void;
}) {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0].id);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const value = label.trim();
    if (!value) {
      return;
    }
    onChange([
      ...column.options,
      { id: crypto.randomUUID(), label: value, color },
    ]);
    setLabel("");
  }

  function remove(id: string) {
    onChange(column.options.filter((o) => o.id !== id));
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          aria-label={`Tags for ${column.name}`}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          type="button"
        >
          <TagsIcon className="size-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{column.name} tags</DialogTitle>
          <DialogDescription>
            Define the tags available for this column.
          </DialogDescription>
        </DialogHeader>

        {column.options.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {column.options.map((opt) => (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-sm",
                  tagChip(opt.color)
                )}
                key={opt.id}
              >
                {opt.label}
                <button
                  aria-label={`Remove ${opt.label}`}
                  onClick={() => remove(opt.id)}
                  type="button"
                >
                  <XIcon className="size-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <form className="flex flex-col gap-3" onSubmit={add}>
          <Input
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Tag name (e.g. VIP, Overdue)"
            type="text"
            value={label}
          />
          <div className="flex flex-wrap gap-2">
            {TAG_COLORS.map((c) => (
              <button
                aria-label={c.id}
                aria-pressed={color === c.id}
                className={cn(
                  "size-6 rounded-full ring-offset-2 ring-offset-background transition-shadow",
                  c.swatch,
                  color === c.id ? "ring-2 ring-ring" : ""
                )}
                key={c.id}
                onClick={() => setColor(c.id)}
                type="button"
              />
            ))}
          </div>
          <Button className="w-full" type="submit">
            Add tag
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
