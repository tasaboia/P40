-- CreateTable
CREATE TABLE "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "zionId" TEXT,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "Language"("code");

-- AddForeignKey
ALTER TABLE "Language" ADD CONSTRAINT "Language_zionId_fkey" FOREIGN KEY ("zionId") REFERENCES "Zion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
