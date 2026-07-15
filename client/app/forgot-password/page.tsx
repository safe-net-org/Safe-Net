'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import authService from '@/services/auth/auth.service'
import { ArrowLeft, MailCheck } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('')
	const [sent, setSent] = useState(false)
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		try {
			await authService.forgotPassword(email.trim())
			// The API returns the same response whether or not the account exists,
			// so the UI does too — never confirm which emails are registered.
			setSent(true)
		} catch {
			setSent(true)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-slate-900 px-4 text-slate-100'>
			<div className='w-full max-w-md rounded-2xl border border-slate-800 bg-slate-800/50 p-8'>
				{sent ? (
					<div className='space-y-4 text-center'>
						<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15'>
							<MailCheck className='h-6 w-6 text-emerald-400' />
						</div>
						<h1 className='text-xl font-bold'>Check your email</h1>
						<p className='text-sm text-slate-400'>
							If an account exists for{' '}
							<span className='text-slate-200'>{email}</span>, a password reset
							link is on its way. The link expires in 30 minutes.
						</p>
						<Link
							href='/'
							className='inline-flex items-center gap-1.5 text-sm text-purple-300 hover:text-purple-200'
						>
							<ArrowLeft className='h-4 w-4' />
							Back to home
						</Link>
					</div>
				) : (
					<>
						<h1 className='text-xl font-bold'>Reset your password</h1>
						<p className='mt-2 text-sm text-slate-400'>
							Enter your email and we&apos;ll send you a link to set a new
							password.
						</p>
						<form onSubmit={onSubmit} className='mt-6 space-y-4'>
							<Input
								type='email'
								required
								value={email}
								onChange={e => setEmail(e.target.value)}
								placeholder='you@example.com'
								autoComplete='email'
							/>
							<Button type='submit' disabled={loading} className='w-full'>
								{loading ? 'Sending…' : 'Send reset link'}
							</Button>
						</form>
						<Link
							href='/'
							className='mt-4 inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200'
						>
							<ArrowLeft className='h-4 w-4' />
							Back to home
						</Link>
					</>
				)}
			</div>
		</div>
	)
}
