'use client'

import { PreferencesControls } from '@/components/preferences/PreferencesControls'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/i18n/LocaleProvider'
import authService from '@/services/auth/auth.service'
import { ArrowLeft, MailCheck } from '@/components/ui/icons'
import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
	const { t } = useI18n()
	const [email, setEmail] = useState('')
	const [sent, setSent] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setLoading(true)
		try {
			await authService.forgotPassword(email.trim())
			// The API returns the same response whether or not the account exists,
			// so the UI does too — never confirm which emails are registered.
			setSent(true)
		} catch {
			setError(t.forgotPassword.requestFailed)
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className='flex min-h-screen items-center justify-center bg-background px-4 text-foreground'>
			<div className='w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm'>
				<PreferencesControls className='mb-4 justify-end' />
				{sent ? (
					<div className='space-y-4 text-center'>
						<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15'>
							<MailCheck className='h-6 w-6 text-emerald-400' />
						</div>
						<h1 className='text-xl font-bold'>{t.forgotPassword.checkEmail.title}</h1>
						<p className='text-sm leading-6 text-muted-foreground'>
							{t.forgotPassword.checkEmail.bodyPrefix}{' '}
							<span className='text-foreground'>{email}</span>
							{t.forgotPassword.checkEmail.bodySuffix}
						</p>
						<Link
							href='/'
							className='inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-strong'
						>
							<ArrowLeft className='h-4 w-4' />
							{t.forgotPassword.backToHome}
						</Link>
					</div>
				) : (
					<>
						<h1 className='text-xl font-bold'>{t.forgotPassword.title}</h1>
						<p className='mt-2 text-sm text-muted-foreground'>
							{t.forgotPassword.subtitle}
						</p>
						<form onSubmit={onSubmit} className='mt-6 space-y-4'>
							<Input
								type='email'
								required
								value={email}
								onChange={e => setEmail(e.target.value)}
								placeholder={t.forgotPassword.emailPlaceholder}
								autoComplete='email'
							/>
							{error && (
								<p role='alert' className='text-sm text-destructive'>
									{error}
								</p>
							)}
							<Button type='submit' disabled={loading} className='w-full'>
								{loading ? t.forgotPassword.sending : t.forgotPassword.send}
							</Button>
						</form>
						<Link
							href='/'
							className='mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'
						>
							<ArrowLeft className='h-4 w-4' />
							{t.forgotPassword.backToHome}
						</Link>
					</>
				)}
			</div>
		</main>
	)
}
