'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProfile } from '@/hooks/user/useProfile'
import { useI18n } from '@/i18n/LocaleProvider'
import userService from '@/services/user/user.service'

export default function AccountPage() {
	const { t } = useI18n()
	const { user } = useProfile()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [pending, setPending] = useState(false)
	const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setPending(true)
		setStatus('idle')
		try {
			await userService.requestEmailChange(email, password)
			setPassword('')
			setStatus('sent')
		} catch {
			setStatus('error')
		} finally {
			setPending(false)
		}
	}

	return (
		<div className='mx-auto max-w-2xl px-5 py-10 sm:px-8'>
			<h1 className='text-3xl font-semibold tracking-tight'>{t.account.title}</h1>
			<p className='mt-3 text-sm leading-6 text-muted-foreground'>{t.account.description}</p>
			<form onSubmit={submit} className='mt-8 space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-7'>
				<div>
					<label className='mb-2 block text-sm font-medium' htmlFor='current-email'>{t.account.currentEmail}</label>
					<Input id='current-email' value={user?.email ?? ''} readOnly disabled />
				</div>
				<div>
					<label className='mb-2 block text-sm font-medium' htmlFor='new-email'>{t.account.newEmail}</label>
					<Input id='new-email' type='email' autoComplete='email' required value={email} onChange={event => setEmail(event.target.value)} />
				</div>
				<div>
					<label className='mb-2 block text-sm font-medium' htmlFor='current-password'>{t.account.currentPassword}</label>
					<Input id='current-password' type='password' autoComplete='current-password' required value={password} onChange={event => setPassword(event.target.value)} />
				</div>
				<Button type='submit' disabled={pending || !user?.email}>{pending ? t.account.requesting : t.account.request}</Button>
				{status !== 'idle' && <p role='status' className={`text-sm ${status === 'error' ? 'text-destructive' : 'text-emerald-600'}`}>{status === 'sent' ? t.account.sent : t.account.error}</p>}
			</form>
		</div>
	)
}
