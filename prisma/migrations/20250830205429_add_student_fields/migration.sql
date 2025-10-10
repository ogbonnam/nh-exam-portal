-- AlterTable
ALTER TABLE "public"."Quiz" ADD COLUMN     "canTeacherEdit" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "className" TEXT,
ADD COLUMN     "yearGroup" TEXT;
