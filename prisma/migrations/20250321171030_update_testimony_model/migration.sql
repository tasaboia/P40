-- CreateEnum
CREATE TYPE "TestimonyType" AS ENUM ('HEALING', 'DELIVERANCE', 'TRANSFORMATION', 'SALVATION', 'BLESSING', 'PROVISION', 'MIRACLE', 'ENCOURAGEMENT', 'FAITH', 'PEACE');

-- CreateTable
CREATE TABLE "Testimony" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "type" "TestimonyType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimony_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Testimony" ADD CONSTRAINT "Testimony_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
