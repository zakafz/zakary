"use client";

import type { CalendarItem } from "./calendar-types";
import { type DayMoney, daysInRange, viewRange } from "./calendar-utils";
import { TimeGrid } from "./day-view";

export function WeekView({
  anchor,
  items,
  money,
  onEdit,
  onDelete,
  onCreateAt,
}: {
  anchor: Date;
  items: CalendarItem[];
  money: Map<string, DayMoney>;
  onEdit: (item: CalendarItem) => void;
  onDelete: (id: string) => void;
  onCreateAt: (day: Date, hour: number) => void;
}) {
  const { from, to } = viewRange("week", anchor);
  const days = daysInRange(from, to);

  return (
    <TimeGrid
      days={days}
      items={items}
      money={money}
      onCreateAt={onCreateAt}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );
}
