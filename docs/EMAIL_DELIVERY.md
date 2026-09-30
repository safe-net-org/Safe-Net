# Free password-reset email delivery

SafeNet uses standard SMTP, so reset messages can be delivered to any user
address. The recipient is always the email entered during registration.

## Recommended no-payment setup: Brevo Free

Brevo currently includes transactional SMTP in its free plan. Create an
account, verify a sender, then copy the SMTP credentials from
**Transactional → Settings → SMTP & API** into `server/.env`:

```dotenv
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_REQUIRE_TLS=true
SMTP_USER=<Brevo SMTP login>
SMTP_PASSWORD=<Brevo SMTP key>
SMTP_FROM=SafeNet <verified-sender@example.com>
```

Restart the API after changing the environment. Do not commit `server/.env` or
share the SMTP key.

The application remains provider-neutral: Gmail SMTP, Mailjet, a hosted mail
server, or another standard SMTP relay can be used later without a code change.
Gmail requires two-step verification plus an application password and is better
suited to personal testing than production delivery.


## Local delivery regression

`bun run test:mail` checks actual SMTP delivery into Mailpit in both English
and Russian: verification, password reset, new-address confirmation and
old-address notification. It consumes the delivered links through HTTP and
checks replay rejection and session revocation. This proves the local SMTP
path; it does not prove deliverability into Gmail, Yandex or other real inboxes.

Run it after `bun run test:http` against the same dedicated `safenet_e2e_*`
database, with the same `SAFE_NET_TEST_DATABASE_URL` and test JWT secrets.
Start Mailpit with SMTP on localhost:1025 and its API on localhost:8025.
Override `SAFE_NET_TEST_SMTP_PORT`, `SAFE_NET_TEST_MAILPIT_URL` and
`SAFE_NET_TEST_MAIL_API_PORT` when those ports are occupied. The helper uses
reserved `.test` addresses and overrides only its own API process's mail
configuration; it never sends to a real recipient or changes `server/.env`.
The CI HTTP job runs this check with a pinned Mailpit image.
