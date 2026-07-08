"use client";

import { format } from "date-fns";
import { CheckIcon, PencilIcon, RepeatIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CalendarItem } from "./calendar-types";

const currency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
});

export function ItemPopover({
  item,
  children,
  onEdit,
  onDelete,
}: {
  item: CalendarItem;
  children: React.ReactNode;
  onEdit: (item: CalendarItem) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const when = item.allDay
    ? format(item.start, "EEE, MMM d")
    : `${format(item.start, "EEE, MMM d")} · ${format(item.start, "p")} – ${format(item.end, "p")}`;

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-64 rounded-none p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {item.kind === "task" ? <CheckIcon className="size-4" /> : null}
            {item.kind === "subscription" ? (
              <RepeatIcon className="size-4" />
            ) : null}
            <p className="font-semibold text-sm leading-tight">{item.title}</p>
          </div>
          <p className="text-muted-foreground text-xs">{when}</p>

          {item.kind === "subscription" && item.amount !== null ? (
            <p className="text-muted-foreground text-xs">
              {currency.format(item.amount)}
            </p>
          ) : null}

          {item.event?.note ? (
            <p className="whitespace-pre-wrap text-sm">{item.event.note}</p>
          ) : null}

          {item.kind === "event" && item.event ? (
            <div className="mt-1 flex gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  setOpen(false);
                  onEdit(item);
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <PencilIcon className="size-4" /> Edit
              </Button>
              <ConfirmDelete
                description={<>This permanently removes “{item.title}”.</>}
                onConfirm={() => onDelete(item.event?.id ?? "")}
                title="Delete event?"
                triggerClassName="flex flex-1 items-center justify-center gap-1.5 border border-border bg-transparent px-3 py-1.5 text-destructive text-sm transition-colors hover:bg-card"
                triggerLabel={`Delete ${item.title}`}
              >
                <Trash2Icon className="size-4" /> Delete
              </ConfirmDelete>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              {item.kind === "task" ? "Task" : "Subscription"} · manage in its
              tab
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
