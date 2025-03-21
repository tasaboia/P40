-- AlterTable
ALTER TABLE "Testimony" ADD COLUMN     "churchId" TEXT;

-- AddForeignKey
ALTER TABLE "Testimony" ADD CONSTRAINT "Testimony_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE SET NULL ON UPDATE CASCADE;
