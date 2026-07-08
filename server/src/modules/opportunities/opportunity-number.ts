import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/api-error.js";

export async function assertOpportunityNumberAvailable(userId: string, opportunityNumber?: string | null, current?: { opportunityId?: string; stage0Id?: string }) {
  if (!opportunityNumber) return;
  const [opportunity, stage0] = await Promise.all([
    prisma.opportunity.findFirst({ where: { userId, opportunityNumber, id: current?.opportunityId ? { not: current.opportunityId } : undefined } }),
    prisma.stage0Record.findFirst({ where: { userId, opportunityNumber, id: current?.stage0Id ? { not: current.stage0Id } : undefined } })
  ]);
  if (opportunity || stage0) throw new ApiError(409, "Opportunity number already exists");
}
