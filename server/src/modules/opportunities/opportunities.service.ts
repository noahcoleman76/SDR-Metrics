import { IcmStatus, OpportunityStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/api-error.js";
import { assertOpportunityNumberAvailable } from "./opportunity-number.js";

type OpportunityInput = {
  accountName: string;
  opportunityNumber?: string | null;
  link?: string | null;
  createdDate?: Date | null;
  approvedDate?: Date | null;
  accountExecutive?: string | null;
  status?: OpportunityStatus;
  inIcm?: IcmStatus;
};

export function list(userId: string) {
  return prisma.opportunity.findMany({ where: { userId }, orderBy: [{ createdAt: "desc" }] });
}

export async function create(userId: string, data: OpportunityInput) {
  await assertOpportunityNumberAvailable(userId, data.opportunityNumber);
  return prisma.opportunity.create({ data: { userId, ...data } });
}

export async function update(userId: string, id: string, data: Partial<OpportunityInput>) {
  await assertOwns(userId, id);
  await assertOpportunityNumberAvailable(userId, data.opportunityNumber, { opportunityId: id });
  return prisma.opportunity.update({ where: { id }, data });
}

export async function remove(userId: string, id: string) {
  await assertOwns(userId, id);
  await prisma.opportunity.delete({ where: { id } });
}

async function assertOwns(userId: string, id: string) {
  const opportunity = await prisma.opportunity.findFirst({ where: { id, userId } });
  if (!opportunity) throw new ApiError(404, "Opportunity not found");
  return opportunity;
}
