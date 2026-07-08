import { addDays, addWeeks, isBefore, startOfDay, startOfWeek } from "date-fns";

export function shouldResetDaily(completedAt: Date, now = new Date()) {
  return isBefore(completedAt, startOfDay(now));
}

export function shouldResetWeekly(completedAt: Date, now = new Date()) {
  const thisMonday = startOfWeek(now, { weekStartsOn: 1 });
  return isBefore(completedAt, thisMonday);
}

export function nextDailyReset(now = new Date()) {
  return addDays(startOfDay(now), 1);
}

export function nextWeeklyReset(now = new Date()) {
  return addWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);
}
