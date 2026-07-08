"use client";

import { format, isSameMonth, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge/badge";
import { cn } from "@/lib/utils";
import { type CalendarItem, EVENT_COLORS } from "./calendar-types";
import { daysInRange, itemsOnDay, viewRange } from "./calendar-utils";
import { ItemPopover } from "./item-popover";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_CHIPS = 3;

export function MonthView({
  anchor,
  items,
  onSelectDay,
  onEdit,
  onDelete,
}: {
  anchor: Date;
  items: CalendarItem[];
  onSelectDay: (day: Date) => void;
  onEdit: (item: CalendarItem) => void;
  onDelete: (id: string) => void;
}) {
  const { from, to } = viewRange("month", anchor);
  const days = daysInRange(from, to);

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-7 border-border/60 border-b">
        {WEEKDAYS.map((w) => (
          <div
            className="py-1.5 text-center font-medium text-muted-foreground text-xs"
            key={w}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayItems = itemsOnDay(items, day);
          const inMonth = isSameMonth(day, anchor);
          return (
            <div
              className={cn(
                "flex min-h-20 flex-col gap-1 border-border/40 border-r border-b p-1",
                !inMonth && "bg-muted/30 text-muted-foreground"
              )}
              key={day.toISOString()}
            >
              <button
                className="self-end"
                onClick={() => onSelectDay(day)}
                type="button"
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center text-xs tabular-nums transition-colors hover:bg-accent",
                    isToday(day) &&
                      "bg-primary font-semibold text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </button>
              <div className="flex flex-col gap-0.5">
                {dayItems.slice(0, MAX_CHIPS).map((it) => (
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
                {dayItems.length > MAX_CHIPS ? (
                  <button
                    className="pl-1 text-left text-[10px] text-muted-foreground hover:text-foreground"
                    onClick={() => onSelectDay(day)}
                    type="button"
                  >
                    +{dayItems.length - MAX_CHIPS} more
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
