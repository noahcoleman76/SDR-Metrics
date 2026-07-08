import type { AccountSection, IcmStatus, OpportunityStatus, TaskCategory } from "../types/models";

export const taskCategoryLabels: Record<TaskCategory, string> = {
  DAILY: "Daily recurring tasks",
  WEEKLY: "Weekly recurring tasks",
  AD_HOC: "Ad hoc tasks"
};

export const accountSectionLabels: Record<AccountSection, string> = {
  LEAD_MILLING: "Lead Milling",
  PRIORITY_ACCOUNTS: "Priority Accounts"
};

export const opportunityStatusLabels: Record<OpportunityStatus, string> = {
  STAGE_0: "Stage 0",
  STAGE_1_PENDING: "Stage 1 Pending",
  CLEAN: "Clean",
  DUPLICATE: "Duplicate"
};

export const icmLabels: Record<IcmStatus, string> = {
  PENDING: "Pending",
  YES: "Yes",
  NO: "No"
};
