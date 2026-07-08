export type TaskCategory = "DAILY" | "WEEKLY" | "AD_HOC";
export type AccountSection = "LEAD_MILLING" | "PRIORITY_ACCOUNTS";
export type OpportunityStatus = "STAGE_0" | "STAGE_1_PENDING" | "CLEAN" | "DUPLICATE";
export type IcmStatus = "PENDING" | "YES" | "NO";

export type User = { id: string; email: string };

export type Task = {
  id: string;
  userId: string;
  name: string;
  category: TaskCategory;
  position: number;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Account = {
  id: string;
  userId: string;
  name: string;
  link: string | null;
  section: AccountSection;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type Opportunity = {
  id: string;
  userId: string;
  accountName: string;
  opportunityNumber: string | null;
  link: string | null;
  createdDate: string | null;
  approvedDate: string | null;
  accountExecutive: string | null;
  status: OpportunityStatus;
  inIcm: IcmStatus;
  createdAt: string;
  updatedAt: string;
};

export type Stage0Record = {
  id: string;
  userId: string;
  accountName: string;
  opportunityNumber: string | null;
  link: string | null;
  createdDate: string | null;
  accountExecutive: string | null;
  nextStep: string | null;
  createdAt: string;
  updatedAt: string;
};
