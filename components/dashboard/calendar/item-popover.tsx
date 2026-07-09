"use client";

import { format } from "date-fns";
import {
  CheckIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  RepeatIcon,
  Trash2Icon,
} from "lucide-react";
import { useState } from "react";
import { ConfirmDelete } from "@/components/dashboard/confirm-delete";
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
  const [menuOpen, setMenuOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setMenuOpen(false);
    }
  }

  const isEvent = item.kind === "event" && item.event;
  const when = item.allDay
    ? format(item.start, "EEE, MMM d")
    : `${format(item.start, "EEE, MMM d")} · ${format(item.start, "p")} – ${format(item.end, "p")}`;

  return (
    <Popover modal onOpenChange={handleOpenChange} open={open}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-64 rounded-none p-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {item.kind === "task" ? <CheckIcon className="size-4" /> : null}
              {item.kind === "subscription" ? (
                <RepeatIcon className="size-4" />
              ) : null}
              <p className="font-semibold text-sm leading-tight">
                {item.title}
              </p>
            </div>

            {isEvent ? (
              <div className="relative shrink-0">
                <button
                  aria-label="Event actions"
                  className="flex size-6 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMenuOpen((v) => !v)}
                  type="button"
                >
                  <EllipsisVerticalIcon className="size-4" />
                </button>
                {menuOpen ? (
                  <div className="absolute top-full right-0 z-20 mt-1 flex w-32 flex-col border border-border bg-popover">
                    <button
                      className="flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                      onClick={() => {
                        setMenuOpen(false);
                        setOpen(false);
                        onEdit(item);
                      }}
                      type="button"
                    >
                      <PencilIcon className="size-4" /> Edit
                    </button>
                    <ConfirmDelete
                      description={
                        <>This permanently removes “{item.title}”.</>
                      }
                      onConfirm={() => onDelete(item.event?.id ?? "")}
                      title="Delete event?"
                      triggerClassName="flex items-center gap-2 px-3 py-2 text-left text-destructive text-sm transition-colors hover:bg-accent"
                      triggerLabel={`Delete ${item.title}`}
                    >
                      <Trash2Icon className="size-4" /> Delete
                    </ConfirmDelete>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <p className="text-muted-foreground text-xs">{when}</p>

          {item.kind === "subscription" && item.amount !== undefined ? (
            <p className="text-muted-foreground text-xs">
              {currency.format(item.amount)}
            </p>
          ) : null}

          {item.event?.note ? (
            <p className="whitespace-pre-wrap text-sm">{item.event.note}</p>
          ) : null}

          {isEvent ? null : (
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
