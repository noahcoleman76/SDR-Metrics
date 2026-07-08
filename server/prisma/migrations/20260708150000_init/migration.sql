CREATE TYPE "TaskCategory" AS ENUM ('DAILY', 'WEEKLY', 'AD_HOC');
CREATE TYPE "AccountSection" AS ENUM ('LEAD_MILLING', 'PRIORITY_ACCOUNTS');
CREATE TYPE "OpportunityStatus" AS ENUM ('STAGE_0', 'STAGE_1_PENDING', 'CLEAN', 'DUPLICATE');
CREATE TYPE "IcmStatus" AS ENUM ('PENDING', 'YES', 'NO');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Task" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" "TaskCategory" NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "link" TEXT,
  "section" "AccountSection" NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Opportunity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "opportunityNumber" TEXT,
  "link" TEXT,
  "createdDate" TIMESTAMP(3),
  "approvedDate" TIMESTAMP(3),
  "accountExecutive" TEXT,
  "status" "OpportunityStatus" NOT NULL DEFAULT 'STAGE_1_PENDING',
  "inIcm" "IcmStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Stage0Record" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "opportunityNumber" TEXT,
  "link" TEXT,
  "createdDate" TIMESTAMP(3),
  "accountExecutive" TEXT,
  "nextStep" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Stage0Record_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Task_userId_category_position_idx" ON "Task"("userId", "category", "position");
CREATE INDEX "Account_userId_section_position_idx" ON "Account"("userId", "section", "position");
CREATE INDEX "Opportunity_userId_approvedDate_idx" ON "Opportunity"("userId", "approvedDate");
CREATE INDEX "Opportunity_userId_opportunityNumber_idx" ON "Opportunity"("userId", "opportunityNumber");
CREATE INDEX "Stage0Record_userId_opportunityNumber_idx" ON "Stage0Record"("userId", "opportunityNumber");

ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Stage0Record" ADD CONSTRAINT "Stage0Record_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
