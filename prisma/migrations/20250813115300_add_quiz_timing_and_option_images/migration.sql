-- AlterTable
ALTER TABLE "public"."Quiz" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "startTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."QuizAttempt" ADD COLUMN     "focusLossCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "questionOrder" TEXT[];
