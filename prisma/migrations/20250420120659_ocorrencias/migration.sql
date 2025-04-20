-- CreateEnum
CREATE TYPE "OccurrenceType" AS ENUM ('TESTIMONY', 'TECHNICAL_ISSUE', 'LEADER_ABSENCE', 'LEADER_DELAY', 'OTHER');

-- CreateTable
CREATE TABLE "Occurrence" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "churchId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "type" "OccurrenceType" NOT NULL,
    "prayerTurnId" TEXT NOT NULL,
    "relatedLeaderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Occurrence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_prayerTurnId_fkey" FOREIGN KEY ("prayerTurnId") REFERENCES "PrayerTurn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occurrence" ADD CONSTRAINT "Occurrence_relatedLeaderId_fkey" FOREIGN KEY ("relatedLeaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
