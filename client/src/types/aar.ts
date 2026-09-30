export const monthInputKeys = [
  "workingDays", "calls", "emails", "connects", "prospectsAdded", "accountsWorked",
  "overdueTasks", "hvas", "discosBooked", "discosHeld", "stage1s"
] as const;

export const goalKeys = ["hvas", "discosBooked", "discosHeld", "stage1s"] as const;

export type MonthInputKey = typeof monthInputKeys[number];
export type GoalKey = typeof goalKeys[number];

export type AarMonth = {
  id?: string;
  year: number;
  month: number;
} & Record<MonthInputKey, number | null>;

export type AarGoals = Record<GoalKey, number | null>;

export type AarQuarter = {
  year: number;
  quarter: number;
  months: AarMonth[];
  goals: AarGoals | null;
};
