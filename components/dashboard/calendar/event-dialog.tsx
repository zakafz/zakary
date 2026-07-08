"use client";

import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  type CalendarEvent,
  EVENT_COLOR_KEYS,
  EVENT_COLORS,
  type EventColor,
} from "./calendar-types";

/** Combine a date and a "HH:mm" string into a Date. */
function withTime(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

export function EventDialog({
  editing,
  initialDate,
  open,
  onOpenChange,
  onSaved,
}: {
  editing: CalendarEvent | null;
  initialDate: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (ev: CalendarEvent, isNew: boolean) => void;
}) {
  const supabase = createClient();
  const isEditing = editing !== null;
  const startSeed = editing ? new Date(editing.starts_at) : initialDate;
  const endSeed = editing ? new Date(editing.ends_at) : initialDate;

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(editing?.title ?? "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [note, setNote] = useState(editing?.note ?? "");
  const [color, setColor] = useState<EventColor>(editing?.color ?? "blue");
  const [allDay, setAllDay] = useState(editing?.all_day ?? false);
  const [day, setDay] = useState<Date>(startSeed);
  const [startTime, setStartTime] = useState(format(startSeed, "HH:mm"));
  const [endTime, setEndTime] = useState(
    format(
      editing ? endSeed : new Date(startSeed.getTime() + 3_600_000),
      "HH:mm"
    )
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    if (!title.trim()) {
      setErrorMsg("Give the event a title.");
      return;
    }
    const starts = allDay
      ? new Date(new Date(day).setHours(0, 0, 0, 0))
      : withTime(day, startTime);
    const ends = allDay
      ? new Date(new Date(day).setHours(23, 59, 0, 0))
      : withTime(day, endTime);
    if (ends < starts) {
      setErrorMsg("The end time must be after the start time.");
      return;
    }

    const payload = {
      title: title.trim(),
      note: note.trim() || null,
      color,
      all_day: allDay,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
    };

    setSaving(true);
    const query = isEditing
      ? supabase
          .from("events")
          .update(payload)
          .eq("id", editing.id)
          .select()
          .single()
      : supabase.from("events").insert(payload).select().single();
    const { data, error } = await query;
    setSaving(false);
    if (error || !data) {
      setErrorMsg(error?.message ?? "Could not save the event. Please retry.");
      return;
    }
    onSaved(data as CalendarEvent, !isEditing);
    onOpenChange(false);
  }

  let submitLabel = isEditing ? "Save changes" : "Add event";
  if (saving) {
    submitLabel = "Saving…";
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit event" : "New event"}</DialogTitle>
          <DialogDescription>Add it to your calendar.</DialogDescription>
        </DialogHeader>
        <form className="flex min-w-0 flex-col gap-3" onSubmit={submit}>
          <Input
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            type="text"
            value={title}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              type="checkbox"
            />
            All day
          </label>

          <DatePicker onChange={setDay} value={day} />

          {allDay ? null : (
            <div className="flex gap-2">
              <Input
                className="flex-1"
                onChange={(e) => setStartTime(e.target.value)}
                type="time"
                value={startTime}
              />
              <Input
                className="flex-1"
                onChange={(e) => setEndTime(e.target.value)}
                type="time"
                value={endTime}
              />
            </div>
          )}

          <div className="flex gap-2">
            {EVENT_COLOR_KEYS.map((key) => (
              <button
                aria-label={key}
                aria-pressed={color === key}
                className={cn(
                  "size-7 border transition-transform",
                  EVENT_COLORS[key],
                  color === key ? "scale-110 border-primary" : "border-border"
                )}
                key={key}
                onClick={() => setColor(key)}
                type="button"
              />
            ))}
          </div>

          <Textarea
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            value={note}
          />

          {errorMsg ? (
            <p className="text-destructive text-sm">{errorMsg}</p>
          ) : null}

          <DialogFooter>
            <Button className="w-full" disabled={saving} type="submit">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
