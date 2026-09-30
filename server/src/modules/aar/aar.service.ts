import { prisma } from "../../config/prisma.js";

export type MonthInput = Partial<{
  workingDays: number | null;
  calls: number | null;
  emails: number | null;
  connects: number | null;
  prospectsAdded: number | null;
  accountsWorked: number | null;
  overdueTasks: number | null;
  hvas: number | null;
  discosBooked: number | null;
  discosHeld: number | null;
  stage1s: number | null;
}>;

export type GoalInput = Partial<{
  hvas: number | null;
  discosBooked: number | null;
  discosHeld: number | null;
  stage1s: number | null;
}>;

export async function getQuarter(userId: string, year: number, quarter: number) {
  const months = [quarter * 3 - 2, quarter * 3 - 1, quarter * 3];
  const [actuals, goals] = await Promise.all([
    prisma.aarMonthlyActual.findMany({ where: { userId, year, month: { in: months } }, orderBy: { month: "asc" } }),
    prisma.aarQuarterGoal.findUnique({ where: { userId_year_quarter: { userId, year, quarter } } })
  ]);
  return { year, quarter, months: actuals, goals };
}

export function updateMonth(userId: string, year: number, month: number, data: MonthInput) {
  return prisma.aarMonthlyActual.upsert({
    where: { userId_year_month: { userId, year, month } },
    update: data,
    create: { userId, year, month, ...data }
  });
}

export function updateGoals(userId: string, year: number, quarter: number, data: GoalInput) {
  return prisma.aarQuarterGoal.upsert({
    where: { userId_year_quarter: { userId, year, quarter } },
    update: data,
    create: { userId, year, quarter, ...data }
  });
}
