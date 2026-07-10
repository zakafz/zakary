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

function sign(net: number) {
  if (net > 0) {
    return "+";
  }
  if (net < 0) {
    return "−";
  }
  return "";
}

/** Tight net for narrow cells: whole dollars under $1K, `$1.2K` above. */
function netLabel(net: number) {
  const abs = Math.abs(net);
  const amount = abs >= 1000 ? compactCurrency(abs) : `$${Math.round(abs)}`;
  return `${sign(net)}${amount}`;
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
        "max-w-full truncate text-center font-medium text-[11px] tabular-nums",
        netTone(net),
        className
      )}
    >
      {netLabel(net)}
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
