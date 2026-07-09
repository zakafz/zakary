"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  format,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { CalendarPlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type {
  CalendarEvent,
  CalendarItem,
  CalendarView,
} from "./calendar-types";
import {
  buildOverlays,
  eventToItem,
  type Subscription,
  type Task,
  viewRange,
} from "./calendar-utils";
import { DayView } from "./day-view";
import { EventDialog } from "./event-dialog";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";

const VIEWS: CalendarView[] = ["month", "week", "day"];

export function CalendarPanel() {
  const supabase = createClient();
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [dialogDate, setDialogDate] = useState<Date>(new Date());

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("events").select("*"),
      supabase.from("tasks").select("id,title,done,due_date"),
      supabase
        .from("subscriptions")
        .select("id,name,amount,cycle,next_billing"),
    ]).then(([ev, tk, sb]) => {
      if (!active) {
        return;
      }
      if (ev.data) {
        setEvents(ev.data as CalendarEvent[]);
      }
      if (tk.data) {
        setTasks(tk.data as Task[]);
      }
      if (sb.data) {
        setSubs(sb.data as Subscription[]);
      }
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  const items = useMemo(() => {
    const { from, to } = viewRange(view, anchor);
    return [
      ...events.map(eventToItem),
      ...buildOverlays(tasks, subs, from, to),
    ];
  }, [events, tasks, subs, view, anchor]);

  function shiftAnchor(d: Date, dir: -1 | 1) {
    if (view === "month") {
      return dir === 1 ? addMonths(d, 1) : subMonths(d, 1);
    }
    if (view === "week") {
      return dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1);
    }
    return dir === 1 ? addDays(d, 1) : subDays(d, 1);
  }

  function go(dir: -1 | 1) {
    setAnchor((d) => shiftAnchor(d, dir));
  }

  function openCreate(day: Date, hour?: number) {
    const d = new Date(day);
    if (hour !== undefined) {
      d.setHours(hour, 0, 0, 0);
    }
    setEditing(null);
    setDialogDate(d);
    setDialogOpen(true);
  }

  function openEdit(item: CalendarItem) {
    if (item.event) {
      setEditing(item.event);
      setDialogDate(new Date(item.event.starts_at));
      setDialogOpen(true);
    }
  }

  function handleSaved(saved: CalendarEvent, isNew: boolean) {
    setEvents((prev) =>
      isNew
        ? [...prev, saved]
        : prev.map((e) => (e.id === saved.id ? saved : e))
    );
  }

  async function handleDelete(id: string) {
    const removed = events.find((e) => e.id === id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error && removed) {
      // Restore the row if the delete failed, keeping local state in sync.
      setEvents((prev) => [...prev, removed]);
    }
  }

  const heading =
    view === "month"
      ? format(anchor, "MMMM yyyy")
      : format(anchor, "MMM d, yyyy");

  return (
    <div className="-translate-x-1/2 relative left-1/2 flex w-screen max-w-[100vw] flex-col gap-3">
      <div className="flex items-center justify-between gap-2 px-4">
        <span className="font-serif text-2xl italic">{heading}</span>
        <div className="flex items-center gap-1">
          <Button
            className="rounded-none"
            onClick={() => setAnchor(new Date())}
            size="sm"
            type="button"
            variant="outline"
          >
            Today
          </Button>
          <Button
            aria-label="Previous"
            className="rounded-none"
            onClick={() => go(-1)}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            ‹
          </Button>
          <Button
            aria-label="Next"
            className="rounded-none"
            onClick={() => go(1)}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            ›
          </Button>
          <Button
            aria-label="New event"
            className="rounded-none"
            onClick={() => openCreate(new Date())}
            size="icon-sm"
            type="button"
          >
            <CalendarPlusIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-1 px-4">
        {VIEWS.map((v) => (
          <button
            className={cn(
              "flex-1 border px-3 py-1.5 font-medium text-sm capitalize transition-colors",
              view === v
                ? "border-primary bg-secondary text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
            key={v}
            onClick={() => setView(v)}
            type="button"
          >
            {v}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key={view}
          transition={{ duration: 0.15 }}
        >
          {view === "month" ? (
            <MonthView
              anchor={anchor}
              items={items}
              onDelete={handleDelete}
              onEdit={openEdit}
              onSelectDay={(day) => {
                setAnchor(day);
                setView("day");
              }}
            />
          ) : null}
          {view === "week" ? (
            <WeekView
              anchor={anchor}
              items={items}
              onCreateAt={(day, hour) => openCreate(day, hour)}
              onDelete={handleDelete}
              onEdit={openEdit}
            />
          ) : null}
          {view === "day" ? (
            <DayView
              anchor={anchor}
              items={items}
              onCreateAt={(day, hour) => openCreate(day, hour)}
              onDelete={handleDelete}
              onEdit={openEdit}
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      <EventDialog
        editing={editing}
        initialDate={dialogDate}
        key={editing?.id ?? dialogDate.toISOString()}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
        open={dialogOpen}
      />
    </div>
  );
}
