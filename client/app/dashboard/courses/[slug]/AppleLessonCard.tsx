import Link from 'next/link'

import { BookOpen, CheckCircle2, Play } from '@/components/ui/icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useI18n } from '@/i18n/LocaleProvider'
import { selectPlural } from '@/i18n/plural'
import { cn } from '@/lib/utils'

interface Lesson {
	id: string
	title: string
	order: number
	tasksCount: number
	completed: boolean
}
interface AppleLessonCardProps {
	lesson: Lesson
	slug: string
	index: number
}
const AppleLessonCard = ({ lesson, slug, index }: AppleLessonCardProps) => {
	const { locale, t } = useI18n()
	const isCompleted = lesson.completed
	return (
		<Link
			href={`/dashboard/courses/${slug}/${lesson.id}`}
			className='block group'
			tabIndex={index}
		>
			<Card
				className={cn(
					'relative overflow-hidden bg-white/3 backdrop-blur-2xl border border-white/10',
					'hover:border-white/20 hover:bg-white/5 hover:shadow-2xl hover:shadow-white/10 hover:scale-[1.02]',
					'transition-all duration-700 rounded-3xl w-full h-full sm:h-auto min-h-[200px] sm:min-h-60'
				)}
			>
				{}
				<div className='absolute inset-0 bg-linear-to-r from-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
				<CardContent className='p-4 sm:p-6 lg:p-8 relative z-10 flex flex-col h-full'>
					{}
					<div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 flex-1'>
						<div className='flex items-start gap-3 min-w-0 flex-1'>
							{}
							<div
								className={cn(
									'w-2.5 h-2.5 rounded-full shadow-lg transition-all duration-500 shrink-0 mt-2',
									'sm:w-3 sm:h-3',
									isCompleted
										? 'bg-emerald-400 shadow-emerald-400/50 scale-110'
										: 'bg-white/20 group-hover:bg-blue-400 group-hover:scale-110'
								)}
							/>
							<div className='flex flex-col min-w-0 gap-3 sm:gap-4'>
								<h3 className='text-lg sm:text-xl lg:text-2xl font-black text-white group-hover:text-white/95 transition-all leading-tight flex-1 min-w-0 truncate'>
									{lesson.title}
								</h3>
								<div className='flex flex-wrap gap-2'>
									<div className='font-semibold text-white/60 sm:text-sm mt-0.5'>
										{t.dashboardLesson.badges.lessonNumTemplate.replace(
											'{order}',
											String(lesson.order)
										)}
									</div>
									<Badge className='bg-white/10 backdrop-blur-sm border-white/20 text-white/80 px-2 py-0.5 text-xs sm:px-3 sm:py-1 rounded-md shrink-0'>
										{lesson.tasksCount}{' '}
										{selectPlural(locale, lesson.tasksCount, {
											one: t.dashboardLesson.sidebar.taskWordOne,
											few: t.dashboardLesson.sidebar.taskWordFew,
											many: t.dashboardLesson.sidebar.taskWordMany,
										})}
									</Badge>
								</div>
							</div>
						</div>
					</div>
					{}
					<div className='flex items-center justify-between pt-4 sm:pt-5 border-t border-white/10 mt-auto'>
						<div className='text-sm sm:text-base font-semibold text-white/60 flex items-center gap-2 flex-1 min-w-0'>
							<div
								className={cn(
									'w-8 h-8 sm:w-9 sm:h-9 p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0',
									'group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-all'
								)}
							>
								<BookOpen className='w-3.5 h-3.5 sm:w-4 sm:h-4' />
							</div>
							<span className='truncate hidden sm:inline'>
								{lesson.completed
									? t.dashboardComponents.retake
									: t.dashboardCourseDetail.startLesson}
							</span>
						</div>
						<div
							className={cn(
								'w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-lg border border-white/10 shrink-0',
								'transition-all duration-700',
								isCompleted
									? 'bg-emerald-500/10 text-emerald-400'
									: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 group-hover:rotate-12'
							)}
						>
							{isCompleted ? (
								<CheckCircle2 className='w-5 h-5 sm:w-6 sm:h-6' />
							) : (
								<Play className='w-5 h-5 sm:w-6 sm:h-6 ml-0.5' />
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	)
}
export default AppleLessonCard
