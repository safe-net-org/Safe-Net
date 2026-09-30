-- Existing historical rows may contain impossible scores. NOT VALID protects
-- new writes without rewriting or rejecting those rows during deployment.
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_score_bounds"
CHECK (
    "score" BETWEEN 0 AND 100 AND
    "correct_answers" BETWEEN 0 AND "total_questions" AND
    "total_questions" > 0
) NOT VALID;
