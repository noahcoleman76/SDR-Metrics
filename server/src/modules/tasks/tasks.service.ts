import { TaskCategory } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { shouldResetDaily, shouldResetWeekly } from "../../utils/dates.js";

export async function resetExpiredTasks(userId: string) {
  const tasks = await prisma.task.findMany({ where: { userId, completedAt: { not: null } } });
  const expiredIds = tasks
    .filter((task) => {
      if (!task.completedAt) return false;
      if (task.category === "DAILY") return shouldResetDaily(task.completedAt);
      if (task.category === "WEEKLY") return shouldResetWeekly(task.completedAt);
      return false;
    })
    .map((task) => task.id);
  if (expiredIds.length) {
    await prisma.task.updateMany({ where: { userId, id: { in: expiredIds } }, data: { completedAt: null } });
  }
}

export async function list(userId: string) {
  await resetExpiredTasks(userId);
  return prisma.task.findMany({ where: { userId }, orderBy: [{ category: "asc" }, { position: "asc" }] });
}

export async function create(userId: string, data: { name: string; details?: string | null; link?: string | null; category: TaskCategory }) {
  const count = await prisma.task.count({ where: { userId, category: data.category } });
  return prisma.task.create({ data: { userId, name: data.name, details: data.details, link: data.link, category: data.category, position: count } });
}

export async function update(userId: string, id: string, data: Partial<{ name: string; details: string | null; link: string | null; category: TaskCategory; completedAt: Date | null; position: number }>) {
  await assertOwns(userId, id);
  return prisma.task.update({ where: { id }, data });
}

export async function complete(userId: string, id: string) {
  const task = await assertOwns(userId, id);
  if (task.category === "AD_HOC") {
    await prisma.task.delete({ where: { id } });
    return { deleted: true, task };
  }
  return { deleted: false, task: await prisma.task.update({ where: { id }, data: { completedAt: new Date() } }) };
}

export async function reorder(userId: string, items: Array<{ id: string; category: TaskCategory; position: number }>) {
  const ids = items.map((item) => item.id);
  const count = await prisma.task.count({ where: { userId, id: { in: ids } } });
  if (count !== ids.length) throw new ApiError(403, "Cannot reorder tasks that do not belong to you");
  await prisma.$transaction(items.map((item) => prisma.task.update({ where: { id: item.id }, data: { category: item.category, position: item.position } })));
  return list(userId);
}

export async function remove(userId: string, id: string) {
  await assertOwns(userId, id);
  await prisma.task.delete({ where: { id } });
}

async function assertOwns(userId: string, id: string) {
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) throw new ApiError(404, "Task not found");
  return task;
}
