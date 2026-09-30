import { goalKeys, monthInputKeys, type AarGoals, type AarMonth, type AarQuarter, type GoalKey, type MonthInputKey } from "../types/aar";

export type MetricKey = MonthInputKey | "callsPerDay" | "emailsPerDay" | "connectRate" |
  "prospectsPerDay" | "hvaGoalRate" | "hvaToBooked" | "bookedGoalRate" |
  "bookedToHeld" | "heldGoalRate" | "heldToStage1" | "stage1GoalRate";

export type MetricRow = {
  key: MetricKey;
  label: string;
  format: "count" | "percent";
  input?: MonthInputKey;
  source?: string;
};

export const coachingRows: MetricRow[] = [
  { key: "workingDays", label: "Working days", format: "count", input: "workingDays", source: "Working days minus time off" },
  { key: "calls", label: "Calls made", format: "count", input: "calls", source: "Outreach > Reports > Overview" },
  { key: "callsPerDay", label: "Calls per working day", format: "count" },
  { key: "emails", label: "Emails sent", format: "count", input: "emails", source: "Outreach > Reports > Overview" },
  { key: "emailsPerDay", label: "Emails per working day", format: "count" },
  { key: "connects", label: "Connects", format: "count", input: "connects", source: "Outreach > Reports > Overview" },
  { key: "connectRate", label: "Call-to-connect rate", format: "percent" },
  { key: "prospectsAdded", label: "Prospects added to sequence", format: "count", input: "prospectsAdded", source: "Outreach > Reports > Overview" },
  { key: "prospectsPerDay", label: "Prospects added per working day", format: "count" },
  { key: "accountsWorked", label: "Accounts worked", format: "count", input: "accountsWorked", source: "Outreach > Reports > Team Performance" },
  { key: "overdueTasks", label: "Overdue tasks", format: "count", input: "overdueTasks", source: "Outreach > Reports > Overview" }
];

export const kpiRows: MetricRow[] = [
  { key: "hvas", label: "HVAs", format: "count", input: "hvas", source: "Dashboard, last month" },
  { key: "hvaGoalRate", label: "HVA to goal", format: "percent" },
  { key: "hvaToBooked", label: "HVA to disco booked", format: "percent" },
  { key: "discosBooked", label: "Discos booked", format: "count", input: "discosBooked", source: "Dashboard" },
  { key: "bookedGoalRate", label: "Discos booked to goal", format: "percent" },
  { key: "bookedToHeld", label: "Discos booked to held", format: "percent" },
  { key: "discosHeld", label: "Discos held", format: "count", input: "discosHeld" },
  { key: "heldGoalRate", label: "Discos held to goal", format: "percent" },
  { key: "heldToStage1", label: "Discos held to Stage 1", format: "percent" },
  { key: "stage1s", label: "Stage 1s", format: "count", input: "stage1s" },
  { key: "stage1GoalRate", label: "Stage 1s to quota", format: "percent" }
];

export function currentQuarter(now = new Date()) {
  return { year: now.getFullYear(), quarter: Math.floor(now.getMonth() / 3) + 1 };
}

export function shiftQuarter(year: number, quarter: number, offset: number) {
  const date = new Date(year, (quarter - 1 + offset) * 3, 1);
  return currentQuarter(date);
}

export function quarterMonths(quarter: number) {
  return [quarter * 3 - 2, quarter * 3 - 1, quarter * 3];
}

export function emptyMonth(year: number, month: number): AarMonth {
  return { year, month, ...Object.fromEntries(monthInputKeys.map((key) => [key, null])) } as AarMonth;
}

export function emptyGoals(): AarGoals {
  return Object.fromEntries(goalKeys.map((key) => [key, null])) as AarGoals;
}

export function normalizeQuarter(data: AarQuarter): AarQuarter {
  return {
    ...data,
    months: quarterMonths(data.quarter).map((month) => ({ ...emptyMonth(data.year, month), ...data.months.find((item) => item.month === month) })),
    goals: { ...emptyGoals(), ...data.goals }
  };
}

function sum(months: AarMonth[], key: MonthInputKey): number | null {
  const values = months.map((month) => month[key]).filter((value): value is number => value !== null);
  return values.length ? values.reduce((total, value) => total + value, 0) : null;
}

function divide(numerator: number | null, denominator: number | null): number | null {
  return numerator === null || denominator === null || denominator === 0 ? null : numerator / denominator;
}

export function metricValue(key: MetricKey, months: AarMonth[], goals: AarGoals, month?: number): number | null {
  const relevant = month === undefined ? months : months.filter((item) => item.month === month);
  const value = (field: MonthInputKey) => sum(relevant, field);
  const ratio = (numerator: MonthInputKey, denominator: MonthInputKey) => {
    const matched = relevant.filter((item) => item[numerator] !== null && item[denominator] !== null);
    return divide(sum(matched, numerator), sum(matched, denominator));
  };
  const daily = (field: MonthInputKey) => {
    const result = ratio(field, "workingDays");
    return result === null ? null : Math.round(result);
  };
  const toGoal = (field: GoalKey) => {
    const entered = relevant.filter((item) => item[field] !== null);
    const actual = sum(entered, field);
    const goal = goals[field];
    return divide(actual, goal === null ? null : goal * entered.length);
  };

  if ((monthInputKeys as readonly string[]).includes(key)) return value(key as MonthInputKey);
  switch (key) {
    case "callsPerDay": return daily("calls");
    case "emailsPerDay": return daily("emails");
    case "connectRate": return ratio("connects", "calls");
    case "prospectsPerDay": return daily("prospectsAdded");
    case "hvaGoalRate": return toGoal("hvas");
    case "hvaToBooked": return ratio("discosBooked", "hvas");
    case "bookedGoalRate": return toGoal("discosBooked");
    case "bookedToHeld": return ratio("discosHeld", "discosBooked");
    case "heldGoalRate": return toGoal("discosHeld");
    case "heldToStage1": return ratio("stage1s", "discosHeld");
    case "stage1GoalRate": return toGoal("stage1s");
  }
  return null;
}

const countFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const percentFormat = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 });

export function formatMetric(value: number | null, format: MetricRow["format"]) {
  if (value === null) return "-";
  return format === "percent" ? percentFormat.format(value) : countFormat.format(value);
}
