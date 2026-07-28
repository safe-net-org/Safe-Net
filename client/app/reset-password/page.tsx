'use client'

import { PreferencesControls } from '@/components/preferences/PreferencesControls'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/i18n/LocaleProvider'
import authService from '@/services/auth/auth.service'
import { CheckCircle2, ShieldAlert } from '@/components/ui/icons'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function ResetForm() {
	const { t } = useI18n()
	const token = useSearchParams().get('token') ?? ''
	const [password, setPassword] = useState('')
	const [confirm, setConfirm] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [done, setDone] = useState(false)
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		if (password.length < 8) {
			setError(t.resetPassword.errors.tooShort)
			return
		}
		if (password !== confirm) {
			setError(t.resetPassword.errors.mismatch)
			return
		}
		setLoading(true)
		try {
			await authService.resetPassword(token, password)
			setDone(true)
		} catch {
			setError(t.resetPassword.errors.invalidToken)
		} finally {
			setLoading(false)
		}
	}

	if (!token) {
		return (
			<Panel>
				<div className='space-y-3 text-center'>
					<ShieldAlert className='mx-auto h-8 w-8 text-amber-400' />
					<h1 className='text-xl font-bold'>
						{t.resetPassword.missingToken.title}
					</h1>
					<p className='text-sm text-slate-400'>
						{t.resetPassword.missingToken.body}
					</p>
					<Link
						href='/forgot-password'
						className='inline-block text-sm text-purple-300 hover:text-purple-200'
					>
						{t.resetPassword.missingToken.cta}
					</Link>
				</div>
			</Panel>
		)
	}

	if (done) {
		return (
			<Panel>
				<div className='space-y-3 text-center'>
					<CheckCircle2 className='mx-auto h-8 w-8 text-emerald-400' />
					<h1 className='text-xl font-bold'>{t.resetPassword.done.title}</h1>
					<p className='text-sm text-slate-400'>{t.resetPassword.done.body}</p>
					<Link
						href='/'
						className='inline-block rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500'
					>
						{t.resetPassword.done.cta}
					</Link>
				</div>
			</Panel>
		)
	}

	return (
		<Panel>
			<h1 className='text-xl font-bold'>{t.resetPassword.form.title}</h1>
			<form onSubmit={onSubmit} className='mt-6 space-y-4'>
				<Input
					type='password'
					required
					value={password}
					onChange={e => setPassword(e.target.value)}
					placeholder={t.resetPassword.form.passwordPlaceholder}
					autoComplete='new-password'
				/>
				<Input
					type='password'
					required
					value={confirm}
					onChange={e => setConfirm(e.target.value)}
					placeholder={t.resetPassword.form.confirmPlaceholder}
					autoComplete='new-password'
				/>
				{error && (
					<p role='alert' className='text-sm text-destructive'>
						{error}
					</p>
				)}
				<Button type='submit' disabled={loading} className='w-full'>
					{loading ? t.resetPassword.form.submitting : t.resetPassword.form.submit}
				</Button>
			</form>
		</Panel>
	)
}

function Panel({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex min-h-screen items-center justify-center bg-background px-4 text-foreground'>
			<div className='w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm'>
				<PreferencesControls className='mb-4 justify-end' />
				{children}
			</div>
		</div>
	)
}

function LoadingFallback() {
	const { t } = useI18n()
	return <Panel>{t.resetPassword.loading}</Panel>
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<ResetForm />
		</Suspense>
	)
}
