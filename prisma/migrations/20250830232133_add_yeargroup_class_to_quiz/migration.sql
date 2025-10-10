-- AlterTable
ALTER TABLE "public"."Quiz" ADD COLUMN     "className" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "yearGroup" TEXT NOT NULL DEFAULT 'Unknown';
