-- Existing users remain NULL rather than being falsely recorded as having
-- accepted documents they never saw. New registrations populate these fields.
ALTER TABLE "users"
ADD COLUMN "terms_accepted_at" TIMESTAMP(3),
ADD COLUMN "privacy_accepted_at" TIMESTAMP(3),
ADD COLUMN "legal_version" TEXT,
ADD COLUMN "legal_locale" TEXT;

ALTER TABLE "users"
ADD CONSTRAINT "users_legal_consent_complete_check"
CHECK (
    (
        "terms_accepted_at" IS NULL
        AND "privacy_accepted_at" IS NULL
        AND "legal_version" IS NULL
    )
    OR
    (
        "terms_accepted_at" IS NOT NULL
        AND "privacy_accepted_at" IS NOT NULL
        AND "legal_version" IS NOT NULL
    )
);

ALTER TABLE "users"
ADD CONSTRAINT "users_legal_locale_check"
CHECK ("legal_locale" IS NULL OR "legal_locale" IN ('en', 'ru'));

-- Consent evidence is write-once. A legacy account can record consent once,
-- but a populated audit record cannot later be rewritten.
CREATE FUNCTION "prevent_legal_consent_rewrite"()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD."legal_version" IS NOT NULL
       AND (
           NEW."terms_accepted_at" IS DISTINCT FROM OLD."terms_accepted_at"
           OR NEW."privacy_accepted_at" IS DISTINCT FROM OLD."privacy_accepted_at"
           OR NEW."legal_version" IS DISTINCT FROM OLD."legal_version"
           OR NEW."legal_locale" IS DISTINCT FROM OLD."legal_locale"
       )
    THEN
        RAISE EXCEPTION 'user legal consent fields are immutable';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "users_legal_consent_immutable"
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION "prevent_legal_consent_rewrite"();
