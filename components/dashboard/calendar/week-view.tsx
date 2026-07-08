"use client";

import type { CalendarItem } from "./calendar-types";
import { daysInRange, viewRange } from "./calendar-utils";
import { DayColumn } from "./day-view";

export function WeekView({
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
  const { from, to } = viewRange("week", anchor);
  const days = daysInRange(from, to);

  return (
    <div className="flex overflow-x-auto">
      {days.map((day, i) => (
        <DayColumn
          day={day}
          items={items}
          key={day.toISOString()}
          onCreateAt={onCreateAt}
          onDelete={onDelete}
          onEdit={onEdit}
          showHourLabels={i === 0}
        />
      ))}
    </div>
  );
}
