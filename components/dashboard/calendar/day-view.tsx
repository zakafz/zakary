"use client";

import { format, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge/badge";
import { cn } from "@/lib/utils";
import { type CalendarItem, EVENT_COLORS } from "./calendar-types";
import { itemsOnDay } from "./calendar-utils";
import { ItemPopover } from "./item-popover";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_PX = 48;
const BODY_HEIGHT = HOURS.length * HOUR_PX;

type GridProps = {
  days: Date[];
  items: CalendarItem[];
  onEdit: (item: CalendarItem) => void;
  onDelete: (id: string) => void;
  onCreateAt: (day: Date, hour: number) => void;
};

/**
 * A time-grid shared by the day and week views. Everything lives in one CSS
 * grid (a time-axis column plus one column per day) so the header row, the
 * all-day row, and the hour lines stay aligned across every column.
 */
export function TimeGrid({
  days,
  items,
  onEdit,
  onDelete,
  onCreateAt,
}: GridProps) {
  return (
    <div className="overflow-x-auto">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `3rem repeat(${days.length}, minmax(6rem, 1fr))`,
        }}
      >
        {/* Row 1 — weekday + date headers */}
        <div className="border-border/60 border-b" />
        {days.map((day) => (
          <div
            className="flex flex-col items-center gap-1 border-border/40 border-b border-l py-1.5"
            key={`head-${day.toISOString()}`}
          >
            <span className="text-muted-foreground text-xs">
              {format(day, "EEE")}
            </span>
            <span
              className={cn(
                "flex size-6 items-center justify-center text-sm tabular-nums",
                isToday(day) &&
                  "bg-primary font-semibold text-primary-foreground"
              )}
            >
              {format(day, "d")}
            </span>
          </div>
        ))}

        {/* Row 2 — all-day items (grid keeps every cell the same height) */}
        <div className="flex items-start justify-end border-border/40 border-b px-1 py-1 text-[10px] text-muted-foreground">
          all-day
        </div>
        {days.map((day) => (
          <div
            className="flex flex-col gap-0.5 border-border/40 border-b border-l p-1"
            key={`allday-${day.toISOString()}`}
          >
            {itemsOnDay(items, day)
              .filter((it) => it.allDay)
              .map((it) => (
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
        ))}

        {/* Row 3 — hour axis */}
        <div className="relative" style={{ height: BODY_HEIGHT }}>
          {HOURS.map((h) =>
            h === 0 ? null : (
              <span
                className="-translate-y-1/2 absolute right-1 text-[10px] text-muted-foreground"
                key={h}
                style={{ top: h * HOUR_PX }}
              >
                {format(new Date().setHours(h, 0, 0, 0), "ha")}
              </span>
            )
          )}
        </div>

        {/* Row 3 — day bodies */}
        {days.map((day) => {
          const timed = itemsOnDay(items, day).filter((it) => !it.allDay);
          return (
            <div
              className="relative border-border/40 border-l"
              key={`body-${day.toISOString()}`}
              style={{ height: BODY_HEIGHT }}
            >
              {HOURS.map((h) => (
                <button
                  className="absolute inset-x-0 border-border/20 border-t hover:bg-accent/40"
                  key={h}
                  onClick={() => onCreateAt(day, h)}
                  style={{ top: h * HOUR_PX, height: HOUR_PX }}
                  type="button"
                />
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
          );
        })}
      </div>
    </div>
  );
}

export function DayView({
  anchor,
  items,
  onEdit,
  onDelete,
  onCreateAt,
}: {
  anchor: Date;
  items: CalendarItem[];
  onEdit: (item: CalendarItem) => void;
  onDelete: (id: string) => void;
  onCreateAt: (day: Date, hour: number) => void;
}) {
  return (
    <TimeGrid
      days={[anchor]}
      items={items}
      onCreateAt={onCreateAt}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
}
