'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import { LOCALES, LOCALE_LABELS } from '@/i18n/messages'
import { cn } from '@/lib/utils'

/** Compact EN / RU toggle. Persists the choice via the locale provider. */
export function LanguageSwitcher({ className }: { className?: string }) {
	const { locale, setLocale } = useI18n()

	return (
		<div
			className={cn(
				'inline-flex items-center rounded-full border border-slate-700 bg-slate-800 p-0.5 text-xs',
				className
			)}
			role='group'
			aria-label='Language'
		>
			{LOCALES.map(code => (
				<button
					key={code}
					type='button'
					onClick={() => setLocale(code)}
					aria-pressed={locale === code}
					className={cn(
						'rounded-full px-2.5 py-1 font-medium transition-colors',
						locale === code
							? 'bg-indigo-600 text-white'
							: 'text-slate-400 hover:text-white'
					)}
				>
					{LOCALE_LABELS[code]}
				</button>
			))}
		</div>
	)
}
