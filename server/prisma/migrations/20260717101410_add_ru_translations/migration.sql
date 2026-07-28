-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "description_ru" TEXT,
ADD COLUMN     "title_ru" TEXT;

-- AlterTable
ALTER TABLE "lesson_blocks" ADD COLUMN     "content_ru" TEXT,
ADD COLUMN     "title_ru" TEXT;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "title_ru" TEXT;

-- AlterTable
ALTER TABLE "stages" ADD COLUMN     "subtitle_ru" TEXT,
ADD COLUMN     "title_ru" TEXT;

-- AlterTable
ALTER TABLE "task_options" ADD COLUMN     "text_ru" TEXT;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "explanation_ru" TEXT,
ADD COLUMN     "meta_ru" JSONB,
ADD COLUMN     "question_ru" TEXT,
ADD COLUMN     "title_ru" TEXT;

-- AlterTable
ALTER TABLE "test_question_options" ADD COLUMN     "text_ru" TEXT;

-- AlterTable
ALTER TABLE "test_questions" ADD COLUMN     "text_ru" TEXT;

-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "description_ru" TEXT,
ADD COLUMN     "title_ru" TEXT;
