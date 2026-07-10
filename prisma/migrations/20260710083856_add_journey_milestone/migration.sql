-- CreateEnum
CREATE TYPE "JourneyIcon" AS ENUM ('GRADUATION_CAP', 'BRAIN', 'WORKFLOW', 'BUILDING2', 'GLOBE', 'ZAP', 'IMAGE', 'TARGET', 'SPARKLES', 'AWARD', 'CODE2', 'TERMINAL_SQUARE');

-- CreateTable
CREATE TABLE "JourneyMilestone" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" "JourneyIcon" NOT NULL,
    "accent" "AccentColor" NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "subItems" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JourneyMilestone_order_idx" ON "JourneyMilestone"("order");
