ALTER TABLE "task_attempts" ADD COLUMN "xp_award_key" TEXT;

-- Preserve historical attempts and reserve the award key for the earliest
-- previously rewarded correct answer to each task. A separate reconciliation
-- is needed if older data already contains duplicate awarded XP.
UPDATE "task_attempts" AS attempt
SET "xp_award_key" = attempt."user_id" || ':' || attempt."task_id"
WHERE attempt."id" IN (
    SELECT DISTINCT ON ("user_id", "task_id") "id"
    FROM "task_attempts"
    WHERE "isCorrect" = TRUE AND "awardedXp" > 0
    ORDER BY "user_id", "task_id", "createdAt", "id"
);

CREATE UNIQUE INDEX "task_attempts_xp_award_key_key" ON "task_attempts"("xp_award_key");
