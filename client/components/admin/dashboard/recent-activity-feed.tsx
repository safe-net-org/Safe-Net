'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import {
	ActivityType,
	type IAdminStats,
} from '@/services/admin/admin.types'
import { toRelative } from '@/utils/date-time/dateFormatter'
import {
	Award,
	BookOpen,
	CheckCircle2,
	Clock,
	FileText,
	Trophy,
	UserPlus,
	type AppIcon,
} from '@/components/ui/icons'

type Activity = IAdminStats['recentActivity'][number]

interface RecentActivityFeedProps {
	activities: Activity[]
}

interface ActivityAppearance {
	icon: AppIcon
	className: string
	label: string
}

export default function RecentActivityFeed({
	activities,
}: RecentActivityFeedProps) {
	const { t, locale } = useI18n()
	const c = t.adminStats.overview.recentActivity
	const relativeTimeLocale = locale === 'ru' ? 'ru-RU' : 'en-US'

	const activityConfig: Record<ActivityType, ActivityAppearance> = {
		[ActivityType.USER_REGISTERED]: {
			icon: UserPlus,
			className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
			label: c.types.signUp,
		},
		[ActivityType.COURSE_COMPLETED]: {
			icon: CheckCircle2,
			className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
			label: c.types.courseCompleted,
		},
		[ActivityType.LESSON_COMPLETED]: {
			icon: BookOpen,
			className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
			label: c.types.lessonCompleted,
		},
		[ActivityType.TEST_PASSED]: {
			icon: FileText,
			className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
			label: c.types.testPassed,
		},
		[ActivityType.CERTIFICATE_ISSUED]: {
			icon: Award,
			className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
			label: c.types.certificateIssued,
		},
		[ActivityType.ACHIEVEMENT_UNLOCKED]: {
			icon: Trophy,
			className: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
			label: c.types.achievementUnlocked,
		},
	}

	return (
		<section
			aria-labelledby='recent-activity-heading'
			className='rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6'
		>
			<div className='mb-4 sm:mb-5'>
				<h2
					id='recent-activity-heading'
					className='text-lg font-semibold text-foreground sm:text-xl'
				>
					{c.heading}
				</h2>
				<p className='mt-1 text-sm text-muted-foreground'>
					{activities.length > 0
						? c.subtitleTemplate.replace('{count}', String(activities.length))
						: c.emptySubtitle}
				</p>
			</div>

			{activities.length === 0 ? (
				<div className='rounded-xl border border-dashed border-border p-6 text-center'>
					<Clock
						className='mx-auto size-9 text-muted-foreground'
						aria-hidden='true'
					/>
					<h3 className='mt-3 font-medium text-foreground'>{c.empty}</h3>
					<p className='mx-auto mt-1 max-w-sm text-sm leading-6 text-muted-foreground'>
						{c.emptyDescription}
					</p>
				</div>
			) : (
				<ol className='max-h-[34rem] space-y-1 overflow-y-auto pr-1'>
					{activities.map(activity => {
						const appearance = activityConfig[activity.type]
						const Icon = appearance?.icon ?? Clock
						const score = activity.metadata?.score
						const courseTitle = activity.metadata?.courseTitle
						const hasScore =
							typeof score === 'number' ||
							(typeof score === 'string' && score.trim().length > 0)
						const hasCourseTitle =
							typeof courseTitle === 'string' && courseTitle.trim().length > 0

						return (
							<li
								key={activity.id}
								className='border-b border-border/50 py-4 last:border-b-0'
							>
								<div className='flex items-start gap-3'>
									<div
										className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
											appearance?.className ??
											'bg-muted text-muted-foreground'
										}`}
									>
										<Icon className='size-4' aria-hidden='true' />
									</div>

									<div className='min-w-0 flex-1'>
										<div className='flex flex-wrap items-start justify-between gap-x-3 gap-y-1'>
											<div className='min-w-0'>
												<p className='truncate text-sm font-medium text-foreground'>
													{activity.userName}
												</p>
												<p className='truncate text-xs text-muted-foreground'>
													{activity.userEmail}
												</p>
											</div>
											<span className='rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground'>
												{appearance?.label ?? c.types.event}
											</span>
										</div>

										<p className='mt-2 text-sm leading-5 text-muted-foreground'>
											{activity.description}
										</p>

										{(hasScore || hasCourseTitle) && (
											<dl className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
												{hasScore && (
													<div className='flex gap-1'>
														<dt>{c.scoreLabel}</dt>
														<dd className='font-medium text-foreground'>
															{String(score)}%
														</dd>
													</div>
												)}
												{hasCourseTitle && (
													<div className='flex min-w-0 gap-1'>
														<dt>{c.courseLabel}</dt>
														<dd className='truncate font-medium text-foreground'>
															{courseTitle}
														</dd>
													</div>
												)}
											</dl>
										)}

										<time
											dateTime={activity.timestamp}
											className='mt-2 block text-xs text-muted-foreground'
										>
											{toRelative(activity.timestamp, relativeTimeLocale) ??
												c.justNow}
										</time>
									</div>
								</div>
							</li>
						)
					})}
				</ol>
			)}
		</section>
	)
}
