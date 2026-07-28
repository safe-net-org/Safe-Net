'use client'

import Link from 'next/link'
import { m } from 'framer-motion'
import { useSyncExternalStore } from 'react'

import { useI18n } from '@/i18n/LocaleProvider'
import { legalMessages } from '@/i18n/legal-messages'

const STORAGE_KEY = 'safenet-essential-storage-notice-v1'
const STORAGE_EVENT = 'safenet-storage-notice-change'

function subscribe(callback: () => void) {
	window.addEventListener('storage', callback)
	window.addEventListener(STORAGE_EVENT, callback)
	return () => {
		window.removeEventListener('storage', callback)
		window.removeEventListener(STORAGE_EVENT, callback)
	}
}

function getSnapshot() {
	return window.localStorage.getItem(STORAGE_KEY) !== 'acknowledged'
}

export function CookieNotice() {
	const { locale } = useI18n()
	const copy = legalMessages[locale].cookieNotice
	const isVisible = useSyncExternalStore(subscribe, getSnapshot, () => false)

	if (!isVisible) return null

	return (
		<m.aside
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			role='status'
			aria-label={copy.ariaLabel}
			className='fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-3xl rounded-2xl border border-border bg-popover/95 p-4 text-popover-foreground shadow-2xl backdrop-blur-xl sm:bottom-5 sm:flex sm:items-center sm:gap-5 sm:p-5'
		>
			<div className='min-w-0 flex-1'>
				<p className='text-sm font-semibold'>{copy.title}</p>
				<p className='mt-1 text-xs leading-5 text-muted-foreground sm:text-sm'>
					{copy.body}{' '}
					<Link
						href='/legal/cookies'
						className='font-medium text-primary underline-offset-4 hover:underline'
					>
						{copy.learnMore}
					</Link>
				</p>
			</div>
			<button
				type='button'
				onClick={() => {
					window.localStorage.setItem(STORAGE_KEY, 'acknowledged')
					window.dispatchEvent(new Event(STORAGE_EVENT))
				}}
				className='mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover sm:mt-0 sm:w-auto'
			>
				{copy.action}
			</button>
		</m.aside>
	)
}
