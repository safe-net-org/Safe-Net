-- Preserve existing rows. If duplicate certificates already exist, fail
-- before changing data so their owner can decide which public IDs to retain.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "certificates"
    GROUP BY "user_id", "course_id" HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate user/course certificates exist; reconcile them before applying this migration. No certificates were deleted.';
  END IF;
END $$;

CREATE UNIQUE INDEX "certificates_user_id_course_id_key"
ON "certificates"("user_id", "course_id");
DROP INDEX "certificates_user_id_course_id_idx";
