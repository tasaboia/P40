/*
  Warnings:

  - You are about to drop the column `maxParticipants` on the `PrayerTurn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "maxParticipantsPerTurn" INTEGER DEFAULT 2,
ADD COLUMN     "shiftDuration" INTEGER DEFAULT 60;

-- AlterTable
ALTER TABLE "PrayerTurn" DROP COLUMN "maxParticipants",
ALTER COLUMN "duration" SET DEFAULT 60;
