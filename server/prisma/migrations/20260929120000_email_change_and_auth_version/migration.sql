ALTER TABLE "users" ADD COLUMN "auth_version" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "email_change_tokens" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "new_email" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    CONSTRAINT "email_change_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "email_change_tokens_token_hash_key" ON "email_change_tokens"("token_hash");
CREATE INDEX "email_change_tokens_user_id_idx" ON "email_change_tokens"("user_id");
ALTER TABLE "email_change_tokens" ADD CONSTRAINT "email_change_tokens_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
