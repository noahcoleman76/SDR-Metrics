CREATE TABLE "AarMonthlyActual" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "month" INTEGER NOT NULL,
  "workingDays" INTEGER,
  "calls" INTEGER,
  "emails" INTEGER,
  "connects" INTEGER,
  "prospectsAdded" INTEGER,
  "accountsWorked" INTEGER,
  "overdueTasks" INTEGER,
  "hvas" INTEGER,
  "discosBooked" INTEGER,
  "discosHeld" INTEGER,
  "stage1s" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AarMonthlyActual_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AarQuarterGoal" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "quarter" INTEGER NOT NULL,
  "hvas" INTEGER,
  "discosBooked" INTEGER,
  "discosHeld" INTEGER,
  "stage1s" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AarQuarterGoal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AarMonthlyActual_userId_year_month_key" ON "AarMonthlyActual"("userId", "year", "month");
CREATE UNIQUE INDEX "AarQuarterGoal_userId_year_quarter_key" ON "AarQuarterGoal"("userId", "year", "quarter");

ALTER TABLE "AarMonthlyActual" ADD CONSTRAINT "AarMonthlyActual_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AarQuarterGoal" ADD CONSTRAINT "AarQuarterGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
