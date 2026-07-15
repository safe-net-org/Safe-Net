'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import authService from '@/services/auth/auth.service'
import { errorCatch } from '@/api/api.helper'
import { CheckCircle2, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function ResetForm() {
	const token = useSearchParams().get('token') ?? ''
	const [password, setPassword] = useState('')
	const [confirm, setConfirm] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [done, setDone] = useState(false)
	const [loading, setLoading] = useState(false)

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		if (password.length < 6) {
			setError('Password must be at least 6 characters.')
			return
		}
		if (password !== confirm) {
			setError('Passwords do not match.')
			return
		}
		setLoading(true)
		try {
			await authService.resetPassword(token, password)
			setDone(true)
		} catch (err) {
			setError(errorCatch(err) || 'This reset link is invalid or has expired.')
		} finally {
			setLoading(false)
		}
	}

	if (!token) {
		return (
			<Panel>
				<div className='space-y-3 text-center'>
					<ShieldAlert className='mx-auto h-8 w-8 text-amber-400' />
					<h1 className='text-xl font-bold'>Missing reset token</h1>
					<p className='text-sm text-slate-400'>
						Open the link from your reset email, or request a new one.
					</p>
					<Link
						href='/forgot-password'
						className='inline-block text-sm text-purple-300 hover:text-purple-200'
					>
						Request a new link
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
					<h1 className='text-xl font-bold'>Password reset</h1>
					<p className='text-sm text-slate-400'>
						Your password has been changed. You can now sign in with it.
					</p>
					<Link
						href='/'
						className='inline-block rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500'
					>
						Go to sign in
					</Link>
				</div>
			</Panel>
		)
	}

	return (
		<Panel>
			<h1 className='text-xl font-bold'>Set a new password</h1>
			<form onSubmit={onSubmit} className='mt-6 space-y-4'>
				<Input
					type='password'
					required
					value={password}
					onChange={e => setPassword(e.target.value)}
					placeholder='New password'
					autoComplete='new-password'
				/>
				<Input
					type='password'
					required
					value={confirm}
					onChange={e => setConfirm(e.target.value)}
					placeholder='Confirm new password'
					autoComplete='new-password'
				/>
				{error && <p className='text-sm text-red-400'>{error}</p>}
				<Button type='submit' disabled={loading} className='w-full'>
					{loading ? 'Resetting…' : 'Reset password'}
				</Button>
			</form>
		</Panel>
	)
}

function Panel({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex min-h-screen items-center justify-center bg-slate-900 px-4 text-slate-100'>
			<div className='w-full max-w-md rounded-2xl border border-slate-800 bg-slate-800/50 p-8'>
				{children}
			</div>
		</div>
	)
}

export default function ResetPasswordPage() {
	return (
		<Suspense fallback={<Panel>Loading…</Panel>}>
			<ResetForm />
		</Suspense>
	)
}
