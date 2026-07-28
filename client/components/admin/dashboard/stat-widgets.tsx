'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import { IAdminStats } from '@/services/admin/admin.types'
import {
	Award,
	BookOpen,
	CheckCircle2,
	FileText,
	TrendingUp,
	Users,
} from '@/components/ui/icons'

interface StatWidgetsProps {
	stats: IAdminStats
}

export default function StatWidgets({ stats }: StatWidgetsProps) {
	const { t, locale } = useI18n()
	const c = t.adminStats.overview.widgets
	const numberLocale = locale === 'ru' ? 'ru-RU' : 'en-US'
	const totalAttempts = stats.performance?.totalAttempts ?? 0
	const correctAttempts = stats.performance?.correctAttempts ?? 0
	const hasAttempts = totalAttempts > 0
	const answerRate = Math.min(
		100,
		Math.max(0, stats.performance?.averageCorrectPercent ?? 0)
	)

	const widgets = [
		{
			title: c.totalUsers,
			value: stats.users?.total || 0,
			subtitle: c.activeSuffixTemplate.replace('{count}', String(stats.users?.active || 0)),
			icon: Users,
			iconClassName: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
			badge: c.thisWeekTemplate.replace(
				'{count}',
				String(stats.registrations?.week || 0)
			),
		},
		{
			title: c.courses,
			value: stats.content?.courses || 0,
			subtitle: c.lessonsSuffixTemplate.replace('{count}', String(stats.content?.lessons || 0)),
			icon: BookOpen,
			iconClassName: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
		},
		{
			title: c.answerSuccessRate,
			value: hasAttempts ? `${answerRate}%` : '—',
			subtitle: hasAttempts
				? c.correctAnswersTemplate
						.replace('{correct}', String(correctAttempts))
						.replace('{total}', String(totalAttempts))
				: c.noAttempts,
			icon: CheckCircle2,
			iconClassName: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
			progress: hasAttempts ? answerRate : undefined,
		},
		{
			title: c.certificatesIssued,
			value: stats.performance?.certificates || 0,
			subtitle: c.total,
			icon: Award,
			iconClassName: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
		},
		{
			title: c.practicalTasks,
			value: stats.content?.tasks || 0,
			subtitle: c.testsSuffixTemplate.replace('{count}', String(stats.content?.tests || 0)),
			icon: FileText,
			iconClassName: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
		},
		{
			title: c.attempts,
			value: totalAttempts,
			subtitle: c.correctAttemptsTemplate.replace(
				'{count}',
				String(correctAttempts)
			),
			icon: TrendingUp,
			iconClassName: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
		},
	]

	return (
		<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
			{widgets.map(widget => {
				const Icon = widget.icon
				return (
					<article
						key={widget.title}
						className='rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-colors duration-200 hover:border-border'
					>
						<div className='flex items-start justify-between gap-4'>
							<dl className='min-w-0'>
								<dt className='text-sm font-medium text-muted-foreground'>
									{widget.title}
								</dt>
								<dd className='mt-2 text-3xl font-semibold tracking-tight tabular-nums text-foreground'>
									{typeof widget.value === 'number'
										? widget.value.toLocaleString(numberLocale)
										: widget.value}
								</dd>
							</dl>
							<div
								className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${widget.iconClassName}`}
							>
								<Icon className='size-5' aria-hidden='true' />
							</div>
						</div>

						<div className='mt-3 flex min-h-5 items-center justify-between gap-3 text-xs text-muted-foreground'>
							<p>{widget.subtitle}</p>
							{widget.badge && (
								<span className='shrink-0 rounded-full bg-muted px-2 py-1 font-medium text-muted-foreground'>
									{widget.badge}
								</span>
							)}
						</div>

						{widget.progress !== undefined && (
							<div
								role='progressbar'
								aria-label={widget.title}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={widget.progress}
								className='mt-4 h-1.5 overflow-hidden rounded-full bg-muted'
							>
								<div
									className='h-full rounded-full bg-emerald-500'
									style={{ width: `${widget.progress}%` }}
								/>
							</div>
						)}
					</article>
				)
			})}
		</div>
	)
}
