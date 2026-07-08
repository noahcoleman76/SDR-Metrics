import { endOfMonth, endOfQuarter, endOfYear, isWithinInterval, parseISO, startOfMonth, startOfQuarter, startOfYear } from "date-fns";

export type Period = "month" | "quarter" | "year";

export function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

export function inCurrentPeriod(dateValue: string | null, period: Period) {
  if (!dateValue) return false;
  const date = parseISO(dateValue);
  const now = new Date();
  const interval =
    period === "month"
      ? { start: startOfMonth(now), end: endOfMonth(now) }
      : period === "quarter"
        ? { start: startOfQuarter(now), end: endOfQuarter(now) }
        : { start: startOfYear(now), end: endOfYear(now) };
  return isWithinInterval(date, interval);
}
