import { AccountSection } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/api-error.js";

export function list(userId: string) {
  return prisma.account.findMany({ where: { userId }, orderBy: [{ section: "asc" }, { position: "asc" }] });
}

export async function create(userId: string, data: { name: string; link?: string | null; section: AccountSection }) {
  const count = await prisma.account.count({ where: { userId, section: data.section } });
  return prisma.account.create({ data: { userId, ...data, position: count } });
}

export async function update(userId: string, id: string, data: Partial<{ name: string; link: string | null; section: AccountSection; position: number }>) {
  await assertOwns(userId, id);
  return prisma.account.update({ where: { id }, data });
}

export async function reorder(userId: string, items: Array<{ id: string; section: AccountSection; position: number }>) {
  const ids = items.map((item) => item.id);
  const count = await prisma.account.count({ where: { userId, id: { in: ids } } });
  if (count !== ids.length) throw new ApiError(403, "Cannot reorder accounts that do not belong to you");
  await prisma.$transaction(items.map((item) => prisma.account.update({ where: { id: item.id }, data: { section: item.section, position: item.position } })));
  return list(userId);
}

export async function remove(userId: string, id: string) {
  await assertOwns(userId, id);
  await prisma.account.delete({ where: { id } });
}

async function assertOwns(userId: string, id: string) {
  const account = await prisma.account.findFirst({ where: { id, userId } });
  if (!account) throw new ApiError(404, "Account not found");
  return account;
}
