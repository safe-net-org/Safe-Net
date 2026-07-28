import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher'
import { cn } from '@/lib/utils'

export function PreferencesControls({
	className,
}: {
	className?: string
}) {
	return (
		<div className={cn('flex shrink-0 items-center gap-2', className)}>
			<ThemeSwitcher />
			<LanguageSwitcher />
		</div>
	)
}
