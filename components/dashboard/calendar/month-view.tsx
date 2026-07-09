"use client";

import { format, isSameMonth, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge/badge";
import { cn } from "@/lib/utils";
import { type CalendarItem, EVENT_COLORS } from "./calendar-types";
import { daysInRange, itemsOnDay, viewRange } from "./calendar-utils";
import { ItemPopover } from "./item-popover";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MAX_CHIPS = 3;
// The chip stays solid; only the label text fades, and only where it actually
// overflows (short labels end before the fade zone, so they show no fade).
const LABEL_FADE =
  "block w-full overflow-hidden whitespace-nowrap [mask-image:linear-gradient(to_right,black_85%,transparent)]";

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
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((w, i) => (
          <div
            className="py-2 text-center font-medium text-muted-foreground text-xs"
            key={`${w}-${i}`}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-border/40 border-t">
        {days.map((day) => {
          const dayItems = itemsOnDay(items, day);
          const inMonth = isSameMonth(day, anchor);
          return (
            <div
              className={cn(
                "flex min-h-28 flex-col gap-1 border-border/30 border-r border-b px-1 py-1.5",
                !inMonth && "opacity-40"
              )}
              key={day.toISOString()}
            >
              <button
                className="mx-auto"
                onClick={() => onSelectDay(day)}
                type="button"
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center text-sm tabular-nums",
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
                          "w-full justify-start",
                          EVENT_COLORS[it.color]
                        )}
                        size="sm"
                      >
                        <span className={LABEL_FADE}>{it.title}</span>
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
                    +{dayItems.length - MAX_CHIPS}
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
