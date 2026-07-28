'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import { LOCALES, LOCALE_LABELS } from '@/i18n/messages'
import { cn } from '@/lib/utils'

/** Compact EN / RU toggle. Persists the choice via the locale provider. */
export function LanguageSwitcher({ className }: { className?: string }) {
	const { locale, setLocale, t } = useI18n()
	const labels = {
		en: t.preferences.english,
		ru: t.preferences.russian
	}

	return (
		<div
			className={cn(
				'inline-flex items-center rounded-full border border-border bg-secondary/80 p-0.5 text-xs',
				className
			)}
			role='group'
			aria-label={t.preferences.language}
		>
			{LOCALES.map(code => (
				<button
					key={code}
					type='button'
					onClick={() => setLocale(code)}
					aria-pressed={locale === code}
					aria-label={labels[code]}
					title={labels[code]}
					className={cn(
						'rounded-full px-2.5 py-1 font-medium transition-[color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
						locale === code
							? 'bg-background text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					{LOCALE_LABELS[code]}
				</button>
			))}
		</div>
	)
}
