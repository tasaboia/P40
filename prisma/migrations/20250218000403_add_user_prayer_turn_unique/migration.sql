/*
  Warnings:

  - A unique constraint covering the columns `[userId,prayerTurnId]` on the table `UserShift` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserShift_userId_prayerTurnId_key" ON "UserShift"("userId", "prayerTurnId");
