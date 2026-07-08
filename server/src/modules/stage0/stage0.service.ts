import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/api-error.js";

type Stage0Input = {
  accountName: string;
  opportunityNumber?: string | null;
  link?: string | null;
  createdDate?: Date | null;
  accountExecutive?: string | null;
  nextStep?: string | null;
};

export function list(userId: string) {
  return prisma.stage0Record.findMany({ where: { userId }, orderBy: [{ createdAt: "desc" }] });
}

export async function create(userId: string, data: Stage0Input) {
  return prisma.stage0Record.create({ data: { userId, ...data } });
}

export async function update(userId: string, id: string, data: Partial<Stage0Input>) {
  await assertOwns(userId, id);
  return prisma.stage0Record.update({ where: { id }, data });
}

export async function moveToOpportunity(userId: string, id: string) {
  const record = await assertOwns(userId, id);
  return prisma.$transaction(async (tx) => {
    const opportunity = await tx.opportunity.create({
      data: {
        userId,
        accountName: record.accountName,
        opportunityNumber: record.opportunityNumber,
        link: record.link,
        createdDate: record.createdDate,
        accountExecutive: record.accountExecutive,
        inIcm: "PENDING"
      }
    });
    await tx.stage0Record.delete({ where: { id } });
    return opportunity;
  });
}

export async function remove(userId: string, id: string) {
  await assertOwns(userId, id);
  await prisma.stage0Record.delete({ where: { id } });
}

async function assertOwns(userId: string, id: string) {
  const record = await prisma.stage0Record.findFirst({ where: { id, userId } });
  if (!record) throw new ApiError(404, "Stage 0 record not found");
  return record;
}
