/*
  Warnings:

  - You are about to drop the column `churchId` on the `CheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `leaderLink` on the `CheckIn` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `CheckIn` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_churchId_fkey";

-- DropIndex
DROP INDEX "CheckIn_userId_eventId_key";

-- AlterTable
ALTER TABLE "CheckIn" DROP COLUMN "churchId",
DROP COLUMN "leaderLink",
DROP COLUMN "phoneNumber";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "leaderLink" TEXT,
ADD COLUMN     "otherChurch" TEXT;
