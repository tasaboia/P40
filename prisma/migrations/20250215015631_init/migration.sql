-- CreateEnum
CREATE TYPE "Region" AS ENUM ('BRAZIL', 'EUROPE', 'NORTH_AMERICA', 'LATIN_AMERICA', 'GLOBAL');

-- CreateTable
CREATE TABLE "TimeZone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "offset" TEXT NOT NULL,

    CONSTRAINT "TimeZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "timeZoneId" TEXT NOT NULL,

    CONSTRAINT "Zion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimeZone_name_key" ON "TimeZone"("name");

-- AddForeignKey
ALTER TABLE "Zion" ADD CONSTRAINT "Zion_timeZoneId_fkey" FOREIGN KEY ("timeZoneId") REFERENCES "TimeZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
