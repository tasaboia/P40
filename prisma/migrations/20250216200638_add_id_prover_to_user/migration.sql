/*
  Warnings:

  - A unique constraint covering the columns `[idProver]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "idProver" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_idProver_key" ON "User"("idProver");
