'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import { formatDate } from '@/utils/date-time/dateFormatter'
import { m } from 'framer-motion'
import { Activity, BookOpen, FileText, TrendingUp, Trophy } from '@/components/ui/icons'

interface RecentActivity {
	type: 'lesson' | 'test' | 'course' | 'achievement'
	title: string
	course?: string
	score?: number
	date: string
	description?: string
}

interface UserActivityBlockProps {
	activities: RecentActivity[]
}

export default function UserActivityBlock({
	activities,
}: UserActivityBlockProps) {
	const { t } = useI18n()
	const c = t.adminUserComponents.userActivityBlock

	const activityConfig = {
		lesson: {
			icon: BookOpen,
			color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
			bgHover: 'group-hover:from-blue-500/15 group-hover:to-blue-600/10',
			iconColor: 'text-blue-400',
			label: c.types.lesson,
		},
		test: {
			icon: FileText,
			color: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
			bgHover: 'group-hover:from-emerald-500/15 group-hover:to-emerald-600/10',
			iconColor: 'text-emerald-400',
			label: c.types.test,
		},
		course: {
			icon: Trophy,
			color: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
			bgHover: 'group-hover:from-amber-500/15 group-hover:to-amber-600/10',
			iconColor: 'text-amber-400',
			label: c.types.course,
		},
		achievement: {
			icon: Trophy,
			color: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
			bgHover: 'group-hover:from-purple-500/15 group-hover:to-purple-600/10',
			iconColor: 'text-purple-400',
			label: c.types.achievement,
		},
		default: {
			icon: Activity,
			color: 'from-white/5 to-white/5 border-white/10',
			bgHover: 'group-hover:from-white/10 group-hover:to-white/10',
			iconColor: 'text-white/60',
			label: c.types.default,
		},
	}

	if (!activities || activities.length === 0) {
		return (
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='flex flex-col items-center justify-center py-16 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/5'
			>
				<TrendingUp className='w-12 h-12 text-white/20 mb-4' />
				<p className='text-white/50'>{c.empty}</p>
			</m.div>
		)
	}

	return (
		<div className='space-y-3'>
			{activities.map((activity, idx) => {
				const config =
					activityConfig[activity.type as keyof typeof activityConfig] ||
					activityConfig.default
				const Icon = config.icon

				const formattedDate =
					formatDate(activity.date, {
						format: 'medium',
						locale: 'en-US',
						gracefulFail: true,
					}) || c.dateUnknown

				return (
					<m.div
						key={`${activity.type}-${idx}`}
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: idx * 0.05 }}
						className='group'
					>
						<div
							className={`relative bg-linear-to-br ${config.color} backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${config.bgHover}`}
						>
							<div className='flex items-start gap-4'>
								<div
									className={`shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-white/5 to-white/10 flex items-center justify-center ${config.iconColor}`}
								>
									<Icon className='w-5 h-5' />
								</div>

								<div className='flex-1 min-w-0'>
									<div className='flex items-start justify-between gap-2 mb-1'>
										<h4 className='font-medium text-white text-sm leading-tight'>
											{activity.title || c.untitled}
										</h4>
										{activity.score !== undefined && (
											<span className='shrink-0 text-xs font-semibold text-emerald-400'>
												{activity.score}%
											</span>
										)}
									</div>

									{activity.course && (
										<p className='text-white/60 text-xs mb-2'>
											{activity.course || c.unknownCourse}
										</p>
									)}

									{activity.description && (
										<p className='text-white/50 text-xs mb-2 line-clamp-1'>
											{activity.description}
										</p>
									)}

									<span className='text-white/40 text-xs'>{formattedDate}</span>
								</div>
							</div>
						</div>
					</m.div>
				)
			})}
		</div>
	)
}
