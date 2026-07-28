'use client'

import { Monitor, Moon, Sun } from '@/components/ui/icons'

import { useI18n } from '@/i18n/LocaleProvider'
import { cn } from '@/lib/utils'
import { useTheme, type ThemePreference } from './ThemeProvider'

export function ThemeSwitcher({ className }: { className?: string }) {
	const { theme, setTheme } = useTheme()
	const { t } = useI18n()
	const options: {
		value: ThemePreference
		label: string
		icon: typeof Monitor
	}[] = [
		{ value: 'system', label: t.preferences.systemTheme, icon: Monitor },
		{ value: 'light', label: t.preferences.lightTheme, icon: Sun },
		{ value: 'dark', label: t.preferences.darkTheme, icon: Moon }
	]

	return (
		<div
			className={cn(
				'inline-flex items-center rounded-full border border-border bg-secondary/80 p-0.5',
				className
			)}
			role='group'
			aria-label={t.preferences.theme}
		>
			{options.map(option => {
				const Icon = option.icon
				return (
					<button
						key={option.value}
						type='button'
						onClick={() => setTheme(option.value)}
						aria-label={option.label}
						aria-pressed={theme === option.value}
						title={option.label}
						className={cn(
							'flex size-7 items-center justify-center rounded-full transition-[color,background-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
							theme === option.value
								? 'scale-100 bg-background text-foreground shadow-sm'
								: 'scale-95 text-muted-foreground hover:scale-100 hover:text-foreground'
						)}
					>
						<Icon className='size-3.5' aria-hidden='true' />
					</button>
				)
			})}
		</div>
	)
}
