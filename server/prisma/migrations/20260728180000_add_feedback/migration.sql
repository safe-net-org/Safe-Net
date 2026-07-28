CREATE TYPE "FeedbackStatus" AS ENUM ('NEW', 'REVIEWED', 'ARCHIVED');

CREATE TABLE "feedback" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "source_page" TEXT,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'NEW',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "feedback_status_created_at_idx" ON "feedback"("status", "created_at");
CREATE INDEX "feedback_featured_created_at_idx" ON "feedback"("featured", "created_at");
CREATE INDEX "feedback_user_id_created_at_idx" ON "feedback"("user_id", "created_at");

ALTER TABLE "feedback"
ADD CONSTRAINT "feedback_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
