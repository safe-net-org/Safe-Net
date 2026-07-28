import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { Resend } from 'resend'

type MailLocale = 'en' | 'ru'

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;')
}

export function buildPasswordResetEmail(link: string, locale: MailLocale) {
	const safeLink = escapeHtml(link)
	const copy =
		locale === 'ru'
			? {
					subject: 'Сброс пароля SafeNet',
					preheader: 'Ссылка для сброса пароля действует 30 минут.',
					eyebrow: 'Безопасность аккаунта',
					title: 'Сброс пароля',
					intro: 'Мы получили запрос на изменение пароля вашего аккаунта SafeNet.',
					action: 'Создать новый пароль',
					expiry: 'Ссылка одноразовая и действует 30 минут.',
					ignore:
						'Если вы не отправляли этот запрос, ничего делать не нужно. Ваш пароль останется прежним.',
					fallback: 'Если кнопка не открывается, скопируйте ссылку:',
				}
			: {
					subject: 'Reset your SafeNet password',
					preheader: 'Your password reset link is valid for 30 minutes.',
					eyebrow: 'Account security',
					title: 'Reset your password',
					intro: 'We received a request to change the password for your SafeNet account.',
					action: 'Create a new password',
					expiry: 'This single-use link expires in 30 minutes.',
					ignore:
						'If you did not make this request, no action is needed. Your password will stay unchanged.',
					fallback: 'If the button does not open, copy this link:',
				}

	const text = [
		copy.title,
		'',
		copy.intro,
		'',
		`${copy.action}: ${link}`,
		'',
		copy.expiry,
		copy.ignore,
	].join('\n')

	const html = `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${copy.subject}</title>
</head>
<body style="margin:0;background:#f5f5f3;color:#242424;font-family:Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">${copy.preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f3;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px">
        <tr><td style="padding:0 0 16px;font-size:18px;font-weight:700;color:#242424">SafeNet</td></tr>
        <tr><td style="background:#ffffff;border:1px solid #e7e5e1;border-radius:18px;padding:36px">
          <div style="margin-bottom:14px;color:#6556d9;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${copy.eyebrow}</div>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#242424">${copy.title}</h1>
          <p style="margin:0 0 24px;color:#5f5e5b;font-size:16px;line-height:1.6">${copy.intro}</p>
          <a href="${safeLink}" style="display:inline-block;border-radius:10px;background:#6556d9;color:#ffffff;padding:13px 20px;text-decoration:none;font-size:15px;font-weight:700">${copy.action}</a>
          <p style="margin:24px 0 8px;color:#5f5e5b;font-size:14px;line-height:1.6">${copy.expiry}</p>
          <p style="margin:0;color:#5f5e5b;font-size:14px;line-height:1.6">${copy.ignore}</p>
          <div style="margin-top:24px;border-top:1px solid #eceae6;padding-top:20px">
            <p style="margin:0 0 8px;color:#8b8984;font-size:12px;line-height:1.5">${copy.fallback}</p>
            <p style="margin:0;word-break:break-all;color:#6556d9;font-size:12px;line-height:1.5">${safeLink}</p>
          </div>
        </td></tr>
        <tr><td style="padding:16px 4px 0;color:#8b8984;font-size:12px;line-height:1.5">SafeNet · Learn. Play. Stay Safe.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

	return { subject: copy.subject, text, html }
}

@Injectable()
export class PasswordResetMailer {
	private readonly resend: Resend | null
	private readonly transporter: ReturnType<typeof nodemailer.createTransport> | null
	private readonly from: string | null

	constructor(config: ConfigService) {
		const resendApiKey = config.get<string>('RESEND_API_KEY')?.trim()
		const resendFrom = config.get<string>('RESEND_FROM')?.trim()
		const host = config.get<string>('SMTP_HOST')?.trim()
		const from = config.get<string>('SMTP_FROM')?.trim()
		const user = config.get<string>('SMTP_USER')?.trim()
		const pass = config.get<string>('SMTP_PASSWORD')
		const isProduction = config.get<string>('NODE_ENV') === 'production'

		if ((user && !pass) || (!user && pass)) {
			throw new Error('SMTP_USER and SMTP_PASSWORD must be configured together')
		}
		if (isProduction && !resendApiKey && (!host || !from)) {
			throw new Error(
				'RESEND_API_KEY and RESEND_FROM, or SMTP_HOST and SMTP_FROM, are required in production'
			)
		}
		if (resendApiKey && !(resendFrom ?? from)) {
			throw new Error('RESEND_FROM or SMTP_FROM is required with RESEND_API_KEY')
		}

		this.resend = resendApiKey ? new Resend(resendApiKey) : null
		this.from = resendFrom ?? from ?? null
		if (this.resend) {
			this.transporter = null
			return
		}

		if (!host || !from) {
			this.transporter = null
			return
		}

		const secure = config.get<string>('SMTP_SECURE') === 'true'
		const configuredPort = config.get<string>('SMTP_PORT')
		const port = configuredPort
			? Number.parseInt(configuredPort, 10)
			: secure
				? 465
				: 587
		if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
			throw new Error('SMTP_PORT must be a valid TCP port')
		}

		this.transporter = nodemailer.createTransport({
			host,
			port,
			secure,
			requireTLS:
				!secure &&
				config.get<string>('SMTP_REQUIRE_TLS', isProduction ? 'true' : 'false') ===
					'true',
			auth: user && pass ? { user, pass } : undefined,
		})
	}

	isConfigured() {
		return Boolean(this.from && (this.resend || this.transporter))
	}

	async sendResetLink(to: string, link: string, locale: MailLocale = 'en') {
		if (!this.from) return false

		const message = buildPasswordResetEmail(link, locale)
		if (this.resend) {
			const { error } = await this.resend.emails.send({
				from: this.from,
				to,
				...message,
			})
			if (error) throw new Error(`Resend email delivery failed: ${error.message}`)
			return true
		}
		if (!this.transporter) return false

		await this.transporter.sendMail({
			from: this.from,
			to,
			...message,
		})
		return true
	}
}
