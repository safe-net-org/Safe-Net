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
