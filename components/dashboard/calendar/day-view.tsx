"use client";

import { format, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge/badge";
import { cn } from "@/lib/utils";
import { type CalendarItem, EVENT_COLORS } from "./calendar-types";
import { itemsOnDay } from "./calendar-utils";
import { ItemPopover } from "./item-popover";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_PX = 48;

/** A single day column: all-day chips on top, timed items positioned by hour. */
export function DayColumn({
  day,
  items,
  onEdit,
  onDelete,
  onCreateAt,
  showHourLabels,
}: {
  day: Date;
  items: CalendarItem[];
  onEdit: (item: CalendarItem) => void;
  onDelete: (id: string) => void;
  onCreateAt: (day: Date, hour: number) => void;
  showHourLabels: boolean;
}) {
  const dayItems = itemsOnDay(items, day);
  const allDay = dayItems.filter((it) => it.allDay);
  const timed = dayItems.filter((it) => !it.allDay);

  return (
    <div className="flex min-w-0 flex-1 flex-col border-border/40 border-r">
      <div
        className={cn(
          "sticky top-0 z-10 flex flex-col items-center gap-1 border-border/60 border-b bg-background py-1.5",
          isToday(day) && "text-foreground"
        )}
      >
        <span className="text-muted-foreground text-xs">
          {format(day, "EEE")}
        </span>
        <span
          className={cn(
            "flex size-6 items-center justify-center text-sm tabular-nums",
            isToday(day) && "bg-primary font-semibold text-primary-foreground"
          )}
        >
          {format(day, "d")}
        </span>
        <div className="flex w-full flex-col gap-0.5 px-1">
          {allDay.map((it) => (
            <ItemPopover
              item={it}
              key={it.id}
              onDelete={onDelete}
              onEdit={onEdit}
            >
              <button className="w-full text-left" type="button">
                <Badge
                  className={cn(
                    "w-full justify-start truncate",
                    EVENT_COLORS[it.color]
                  )}
                  size="sm"
                >
                  {it.title}
                </Badge>
              </button>
            </ItemPopover>
          ))}
        </div>
      </div>

      <div className="relative" style={{ height: HOURS.length * HOUR_PX }}>
        {HOURS.map((h) => (
          <button
            className="absolute inset-x-0 border-border/30 border-b hover:bg-accent/40"
            key={h}
            onClick={() => onCreateAt(day, h)}
            style={{ top: h * HOUR_PX, height: HOUR_PX }}
            type="button"
          >
            {showHourLabels ? (
              <span className="absolute top-0 left-1 text-[10px] text-muted-foreground">
                {format(new Date().setHours(h, 0, 0, 0), "ha")}
              </span>
            ) : null}
          </button>
        ))}
        {timed.map((it) => {
          const top =
            (it.start.getHours() + it.start.getMinutes() / 60) * HOUR_PX;
          const durHrs = Math.max(
            0.5,
            (it.end.getTime() - it.start.getTime()) / 3_600_000
          );
          return (
            <ItemPopover
              item={it}
              key={it.id}
              onDelete={onDelete}
              onEdit={onEdit}
            >
              <button
                className="absolute inset-x-0.5"
                style={{ top, height: durHrs * HOUR_PX }}
                type="button"
              >
                <Badge
                  className={cn(
                    "h-full w-full flex-col items-start justify-start truncate",
                    EVENT_COLORS[it.color]
                  )}
                  size="sm"
                >
                  {it.title}
                </Badge>
              </button>
            </ItemPopover>
          );
        })}
      </div>
    </div>
  );
}

export function DayView(props: {
  anchor: Date;
  items: CalendarItem[];
  onEdit: (item: CalendarItem) => void;
  onDelete: (id: string) => void;
  onCreateAt: (day: Date, hour: number) => void;
}) {
  return (
    <div className="flex">
      <DayColumn
        day={props.anchor}
        items={props.items}
        onCreateAt={props.onCreateAt}
        onDelete={props.onDelete}
        onEdit={props.onEdit}
        showHourLabels
      />
    </div>
  );
}
