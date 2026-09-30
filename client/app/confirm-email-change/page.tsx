'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/LocaleProvider'
import authService from '@/services/auth/auth.service'

function Confirmation() {
	const { t } = useI18n()
	const token = useSearchParams().get('token')
	const [pending, setPending] = useState(false)
	const [status, setStatus] = useState<'idle' | 'done' | 'error'>('idle')

	async function confirm() {
		if (!token) return
		setPending(true)
		try {
			await authService.confirmEmailChange(token)
			setStatus('done')
		} catch {
			setStatus('error')
		} finally {
			setPending(false)
		}
	}

	return (
		<main className='mx-auto max-w-xl px-5 py-16'>
			<h1 className='text-3xl font-semibold tracking-tight'>{t.account.confirmTitle}</h1>
			<p className='mt-4 text-muted-foreground'>{t.account.confirmDescription}</p>
			{!token || status === 'error' ? (
				<p role='alert' className='mt-6 text-sm text-destructive'>{t.account.invalid}</p>
			) : status === 'done' ? (
				<p role='status' className='mt-6 text-sm text-emerald-600'>{t.account.confirmed}</p>
			) : (
				<Button className='mt-6' disabled={pending} onClick={() => void confirm()}>{pending ? t.account.confirming : t.account.confirm}</Button>
			)}
			<Link href='/dashboard/account' className='mt-8 block text-sm underline underline-offset-4'>{t.account.back}</Link>
		</main>
	)
}

export default function ConfirmEmailChangePage() {
	return <Suspense><Confirmation /></Suspense>
}
