import { compactCurrency } from "@/data/projects";
import { cn } from "@/lib/utils";
import type { DayMoney } from "./calendar-utils";

function netTone(net: number) {
  if (net > 0) {
    return "text-success";
  }
  if (net < 0) {
    return "text-destructive";
  }
  return "text-muted-foreground";
}

/** Compact net for a day (made − spent) as colored text. Green up, red down. */
export function DayNet({
  money,
  className,
}: {
  money: DayMoney;
  className?: string;
}) {
  const net = money.income - money.expense;
  return (
    <span
      className={cn(
        "text-center font-medium text-[11px] tabular-nums",
        netTone(net),
        className
      )}
    >
      {net > 0 ? "+" : ""}
      {compactCurrency(net)}
    </span>
  );
}

/** Precise income + expense lines for the day view. */
export function DayBreakdown({ money }: { money: DayMoney }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      {money.income > 0 ? (
        <span className="font-medium text-[11px] text-success tabular-nums">
          +{compactCurrency(money.income)}
        </span>
      ) : null}
      {money.expense > 0 ? (
        <span className="font-medium text-[11px] text-destructive tabular-nums">
          −{compactCurrency(money.expense)}
        </span>
      ) : null}
    </div>
  );
}
