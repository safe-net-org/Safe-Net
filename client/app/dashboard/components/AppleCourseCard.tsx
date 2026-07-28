import Link from 'next/link'

import { ArrowUpRight, Award, Zap } from '@/components/ui/icons'

import { useI18n } from '@/i18n/LocaleProvider'
import { translateCourseCopy, translateStageTitle } from '@/i18n/content-translations'
import { IUserCourse } from '@/services/learning/learning.types'
import { memo } from 'react'

interface AppleCourseCardProps {
	course: IUserCourse
	index: number
}

export const AppleCourseCard = memo(({ course, index }: AppleCourseCardProps) => {
	const { t, locale } = useI18n()
	const courseCopy = translateCourseCopy(locale, course.title)
	const stageTitle = course.stageTitle
		? translateStageTitle(locale, course.stageTitle)
		: course.stageTitle
	return (
		<Link
			href={`/dashboard/courses/${course.slug}`}
			className='group h-64 flex flex-col'
			style={{ animationDelay: `${index * 50}ms` }}
		>
			<div className='relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/8 hover:border-white/20 transition-all duration-400 hover:scale-[1.01] flex-1 flex flex-col'>
				{}
				<div className='absolute inset-0 bg-linear-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/3 group-hover:to-pink-500/5 transition-all duration-600 ease-out' />
				{}
				<div className='absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out bg-linear-to-r from-transparent via-white/5 to-transparent' />
				{}
				<div className='relative z-10 flex-1 flex flex-col p-6 md:p-8 space-y-6 overflow-hidden'>
					{}
					<div className='flex items-start justify-between gap-4 shrink-0'>
						<div className='flex-1 space-y-2'>
							{}
							{stageTitle && (
								<div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-slate-400 group-hover:bg-white/15 transition-colors duration-300'>
									<div className='w-1.5 h-1.5 rounded-full bg-blue-400' />
									{stageTitle}
								</div>
							)}
							{}
							<h3 className='text-xl md:text-2xl font-bold leading-tight group-hover:text-slate-200 group-hover:drop-shadow-sm transition-all duration-400'>
								{courseCopy.title}
							</h3>
						</div>
						{}
						{course.completed && (
							<div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-sm group-hover:bg-emerald-500/20 transition-all duration-300 shrink-0'>
								<Award className='w-4 h-4 text-emerald-400' />
							</div>
						)}
					</div>
					{}
					<div className='flex-1 flex flex-col justify-end space-y-3'>
						<div className='flex items-center justify-between text-sm'>
							<span className='text-slate-400 font-medium'>
								{t.dashboardComponents.progress}
							</span>
							<span className='font-bold text-slate-200'>
								{Math.round(course.progress)}%
							</span>
						</div>
						{}
						<div className='relative h-2 bg-white/5 rounded-full overflow-hidden backdrop-blur-xl border border-white/10'>
							<div
								className='absolute inset-y-0 left-0 bg-linear-to-r from-blue-500/90 to-purple-500/90 rounded-full transition-all duration-800 ease-out shadow-sm'
								style={{
									width: `${course.progress}%`,
								}}
							/>
						</div>
					</div>
				</div>
				{}
				<div className='flex items-center justify-between pt-4 pb-6 px-6 md:px-8 border-t border-white/10 mt-auto shrink-0'>
					<div className='flex items-center gap-2 text-sm text-slate-400'>
						<Zap className='w-4 h-4 text-amber-400' />
						<span className='font-medium'>{course.totalXp} XP</span>
					</div>
					<div className='flex items-center gap-1.5 text-sm font-medium text-slate-300 group-hover:text-blue-300 group-hover:gap-2 transition-all duration-300'>
						<span>
							{course.completed
								? t.dashboardComponents.retake
								: t.dashboardComponents.continueLabel}
						</span>
						<ArrowUpRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300' />
					</div>
				</div>
			</div>
		</Link>
	)
})
AppleCourseCard.displayName = 'AppleCourseCard'
