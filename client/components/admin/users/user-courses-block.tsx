'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import { formatDate } from '@/utils/date-time/dateFormatter'
import { m } from 'framer-motion'
import { BookOpen, Calendar, CheckCircle2, Zap } from '@/components/ui/icons'

interface Course {
	id: string
	title: string
	description: string
	progress: number
	totalXp: number
	updatedAt: string
}

interface UserCoursesBlockProps {
	courses: Course[]
}

export default function UserCoursesBlock({ courses }: UserCoursesBlockProps) {
	const { t } = useI18n()
	const c = t.adminUserComponents.userCoursesBlock

	if (!courses || courses.length === 0) {
		return (
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='flex flex-col items-center justify-center py-16 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/5'
			>
				<BookOpen className='w-12 h-12 text-white/20 mb-4' />
				<p className='text-white/50'>{c.empty}</p>
			</m.div>
		)
	}

	const completedCourses = courses.filter(c => c.progress === 100)
	const activeCourses = courses.filter(c => c.progress > 0 && c.progress < 100)
	const notStartedCourses = courses.filter(c => c.progress === 0)

	return (
		<div className='space-y-6'>
			{/* Stats */}
			<div className='grid grid-cols-3 gap-4'>
				<div className='bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4'>
					<CheckCircle2 className='w-5 h-5 text-emerald-400 mb-2' />
					<div className='text-2xl font-bold text-white mb-1'>
						{completedCourses.length}
					</div>
					<div className='text-white/60 text-xs'>{c.stats.completed}</div>
				</div>

				<div className='bg-linear-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4'>
					<Zap className='w-5 h-5 text-blue-400 mb-2' />
					<div className='text-2xl font-bold text-white mb-1'>
						{activeCourses.length}
					</div>
					<div className='text-white/60 text-xs'>{c.stats.inProgress}</div>
				</div>

				<div className='bg-linear-to-br from-gray-500/10 to-gray-600/5 border border-gray-500/20 rounded-xl p-4'>
					<BookOpen className='w-5 h-5 text-gray-400 mb-2' />
					<div className='text-2xl font-bold text-white mb-1'>
						{notStartedCourses.length}
					</div>
					<div className='text-white/60 text-xs'>{c.stats.notStarted}</div>
				</div>
			</div>

			{/* Courses List */}
			<div className='space-y-3'>
				{courses.map((course, idx) => {
					const formattedDate =
						formatDate(course.updatedAt, {
							format: 'date-medium',
							locale: 'en-US',
							gracefulFail: true,
						}) || c.recentlyFallback

					return (
						<m.div
							key={course.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: idx * 0.05 }}
							className='group'
						>
							<div className='relative bg-linear-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 backdrop-blur-sm rounded-xl p-5 transition-all duration-300'>
								<div className='flex items-start justify-between mb-3'>
									<div className='flex-1 min-w-0'>
										<h3 className='font-semibold text-white text-base mb-1 line-clamp-1 group-hover:text-blue-200 transition-colors'>
											{course.title}
										</h3>
										<p className='text-white/60 text-sm line-clamp-2 mb-2'>
											{course.description || c.noDescription}
										</p>
									</div>

									{course.progress === 100 && (
										<CheckCircle2 className='shrink-0 w-5 h-5 text-emerald-400 ml-3' />
									)}
								</div>

								{/* Progress bar */}
								<div className='mb-3'>
									<div className='flex items-center justify-between text-xs mb-1.5'>
										<span className='text-white/60'>{c.progress}</span>
										<span className='text-white/80 font-semibold'>
											{course.progress}%
										</span>
									</div>
									<div className='h-2 bg-white/5 rounded-full overflow-hidden'>
										<div
											className='h-full bg-linear-to-r from-blue-500/90 to-purple-500/90 rounded-full transition-all duration-500'
											style={{ width: `${course.progress}%` }}
										/>
									</div>
								</div>

								{/* Footer */}
								<div className='flex items-center justify-between text-xs'>
									<div className='flex items-center gap-1.5 text-white/40'>
										<Calendar className='w-3.5 h-3.5' />
										<span>{formattedDate}</span>
									</div>
									<div className='flex items-center gap-1.5 text-amber-400/80'>
										<Zap className='w-3.5 h-3.5' />
										<span className='font-semibold'>
											{c.xpTemplate.replace('{xp}', String(course.totalXp))}
										</span>
									</div>
								</div>
							</div>
						</m.div>
					)
				})}
			</div>
		</div>
	)
}
