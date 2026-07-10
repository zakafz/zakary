"use client";

import { format, isSameMonth, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge/badge";
import { cn } from "@/lib/utils";
import { type CalendarItem, EVENT_COLORS, EVENT_DOT } from "./calendar-types";
import {
  type DayMoney,
  daysInRange,
  itemsOnDay,
  viewRange,
} from "./calendar-utils";
import { ItemPopover } from "./item-popover";
import { DayNet } from "./money-label";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MAX_CHIPS = 3;
// The chip stays solid; only the label text fades, and only where it actually
// overflows (short labels end before the fade zone, so they show no fade).
const LABEL_FADE =
  "block w-full overflow-hidden whitespace-nowrap [mask-image:linear-gradient(to_right,black_85%,transparent)]";

export function MonthView({
  anchor,
  items,
  money,
  onSelectDay,
  onEdit,
  onDelete,
}: {
  anchor: Date;
  items: CalendarItem[];
  money: Map<string, DayMoney>;
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
          const dayMoney = money.get(format(day, "yyyy-MM-dd"));
          return (
            <div
              className={cn(
                "flex min-h-20 flex-col gap-1 border-border/30 border-r border-b px-0.5 py-1.5 sm:min-h-28 sm:px-1",
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
              {dayMoney ? (
                <DayNet className="mx-auto" money={dayMoney} />
              ) : null}

              {/* Mobile: compact dots — tap the cell to open the day. */}
              {dayItems.length > 0 ? (
                <button
                  className="mt-auto flex flex-wrap justify-center gap-1 pb-0.5 sm:hidden"
                  onClick={() => onSelectDay(day)}
                  type="button"
                >
                  {dayItems.slice(0, 5).map((it) => (
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        EVENT_DOT[it.color]
                      )}
                      key={it.id}
                    />
                  ))}
                </button>
              ) : null}

              {/* Desktop: full labelled chips. */}
              <div className="hidden flex-col gap-0.5 sm:flex">
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
