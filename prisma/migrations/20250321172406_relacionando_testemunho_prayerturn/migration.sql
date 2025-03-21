/*
  Warnings:

  - Added the required column `prayerTurnId` to the `Testimony` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Testimony" ADD COLUMN     "prayerTurnId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Testimony" ADD CONSTRAINT "Testimony_prayerTurnId_fkey" FOREIGN KEY ("prayerTurnId") REFERENCES "PrayerTurn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
