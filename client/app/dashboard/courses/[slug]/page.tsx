'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { m } from 'framer-motion'

import {
	Award,
	BookOpen,
	CheckCircle2,
	Clock,
	Play,
	Sparkles,
	Target,
	Users,
	Zap,
} from '@/components/ui/icons'

import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/config/pages-url.config'
import { useCourseDetail } from '@/hooks/learning/useCourseDetail'
import { useI18n } from '@/i18n/LocaleProvider'
import { translateCourseCopy, translateStageTitle } from '@/i18n/content-translations'
import { cn } from '@/lib/utils'
import {
	getDifficultyLabel,
	ICourseDetail,
} from '@/services/learning/learning.types'
import { formatDate } from '@/utils/date-time/dateFormatter'
import { secondsToHMS } from '@/utils/date-time/secondsToHMS'
import { type ReactNode, useMemo, useState } from 'react'
import AppleLessonCard from './AppleLessonCard'

type CourseTest = ICourseDetail['tests'][number]

export default function CourseDetailPage() {
	const { t, locale } = useI18n()
	const { course, isLoading, lessons, tests } = useCourseDetail()
	const [activeTab, setActiveTab] = useState<'lessons' | 'tests'>('lessons')
	const courseCopy = course
		? translateCourseCopy(locale, course.title, course.description)
		: null
	const stageTitle = course?.stage?.title
		? translateStageTitle(locale, course.stage.title)
		: course?.stage?.title
	const stats = useMemo(() => {
		const completedLessons = lessons.filter(lesson => lesson.completed).length
		const totalLessons = lessons.length
		return { completedLessons, totalLessons }
	}, [lessons])
	if (isLoading) return <AppleSkeleton />
	if (!course) return <AppleNotFound />

	return (
		<>
			<div className='fixed inset-0 pointer-events-none overflow-hidden -z-10'>
				<div className='absolute top-10 sm:top-20 left-5 sm:left-10 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] bg-white/3 rounded-full blur-[60px] sm:blur-[80px]' />
				<div
					className='absolute top-1/2 right-10 sm:right-20 w-[150px] sm:w-[250px] h-[150px] sm:h-[250px] bg-indigo-500/4 rounded-full blur-2xl sm:blur-[60px] animate-pulse'
					style={{ animationDuration: '12s' }}
				/>
			</div>
			<div className='space-y-6 sm:space-y-8 lg:space-y-12'>
				<Breadcrumb
					showBackButton
					items={[
						{
							label: t.dashboardCourseDetail.breadcrumbCourses,
							href: ROUTES.COURSES,
							icon: BookOpen,
						},
						{ label: courseCopy!.title },
					]}
				/>

				<m.section
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					className='relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/3 backdrop-blur-2xl border border-white/5 shadow-2xl p-5 sm:p-6 md:p-8 lg:p-12'
				>
					<div className='absolute inset-0 bg-linear-to-r from-white/2 via-transparent to-white/2' />
					<div className='relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 items-start lg:items-center'>
						{ }
						<div className='lg:col-span-3 space-y-4 sm:space-y-5'>
							<Badge className='bg-white/10 backdrop-blur-sm border-white/20 text-white/80 px-3 sm:px-4 py-1 sm:py-1.5 rounded-xl w-fit text-xs sm:text-sm'>
								<Users className='w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 opacity-80' />
								{stageTitle || t.dashboardCourseDetail.generalCourse}
							</Badge>
							<div>
								<CardTitle className='text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-black text-white leading-tight mb-3 sm:mb-4 tracking-tight'>
									{courseCopy!.title}
								</CardTitle>
								<p className='text-base sm:text-lg lg:text-xl text-white/70 max-w-2xl leading-relaxed font-light'>
									{courseCopy!.description}
								</p>
							</div>
							<div className='flex flex-wrap items-center gap-2.5 sm:gap-3 md:gap-4 pt-2 sm:pt-4'>
								<Badge className='bg-white/10 backdrop-blur-sm border-white/20 text-white/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl capitalize text-xs sm:text-sm'>
									{getDifficultyLabel(
										course.difficulty,
										t.dashboardLessonDetail.difficulty
									)}
								</Badge>
								<div className='text-sm sm:text-base text-white/60 flex items-center gap-1.5 sm:gap-2'>
									<Clock className='w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70' />
									{t.dashboardCourseDetail.lessonsCountTemplate
										.replace('{completed}', String(stats.completedLessons))
										.replace('{total}', String(stats.totalLessons))}
								</div>
								<div className='text-sm sm:text-base font-semibold text-white flex items-center gap-1.5 sm:gap-2'>
									<Zap className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400' />
									{t.dashboardCourseDetail.xpTemplate.replace(
										'{xp}',
										String(course.totalXp)
									)}
								</div>
							</div>
						</div>
						{ }
						<div className='lg:col-span-2 space-y-4 sm:space-y-5'>
							<div className='space-y-2.5 sm:space-y-3'>
								<div className='flex justify-between text-xs sm:text-sm text-white/60'>
									<span className='font-medium'>
										{t.dashboardCourseDetail.overallProgress}
									</span>
									<span className='font-bold text-white'>
										{course.progress}%
									</span>
								</div>
								<Progress
									value={course.progress}
									className='h-2 sm:h-2.5 bg-white/5 border border-white/10 rounded-full [&>div]:bg-linear-to-r [&>div]:from-blue-500 [&>div]:to-purple-500 [&>div]:shadow-lg'
								/>
							</div>
							<div className='grid grid-cols-2 gap-2.5 sm:gap-3'>
								<div className='text-center p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10'>
									<div className='text-xl sm:text-2xl font-black text-white mb-0.5 sm:mb-1'>
										{stats.completedLessons}
									</div>
									<div className='text-[10px] sm:text-xs text-white/60'>
										/ {stats.totalLessons}
									</div>
								</div>
								<div className='text-center p-3 sm:p-4 bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/10'>
									<div className='text-xl sm:text-2xl font-black text-blue-400 mb-0.5 sm:mb-1'>
										{tests.length}
									</div>
									<div className='text-[10px] sm:text-xs text-white/60'>
										{t.dashboardCourseDetail.testsCountLabel}
									</div>
								</div>
							</div>
						</div>
					</div>
				</m.section>
				{ }
				<m.section
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className='flex gap-2 sm:gap-3 p-1 sm:p-1.5 bg-white/4 backdrop-blur-2xl border border-white/4 rounded-xl sm:rounded-2xl'>
						<button
							onClick={() => setActiveTab('lessons')}
							className={cn(
								'relative flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden',
								activeTab === 'lessons'
									? 'text-white'
									: 'text-white/50 hover:text-white/70'
							)}
						>
							{activeTab === 'lessons' && (
								<m.div
									layoutId='activeTab'
									className='absolute inset-0 bg-white/4 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl'
									transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
								/>
							)}
							<span className='relative z-10 flex items-center justify-center gap-1.5 sm:gap-2'>
								<BookOpen className='w-3.5 h-3.5 sm:w-4.5 sm:h-4.5' />
								<span className='hidden xs:inline'>
									{t.dashboardCourseDetail.tabs.lessons}
								</span>{' '}
								({lessons.length})
							</span>
						</button>
						<button
							onClick={() => setActiveTab('tests')}
							className={cn(
								'relative flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 overflow-hidden',
								activeTab === 'tests'
									? 'text-white'
									: 'text-white/50 hover:text-white/70'
							)}
						>
							{activeTab === 'tests' && (
								<m.div
									layoutId='activeTab'
									className='absolute inset-0 bg-white/4 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl'
									transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
								/>
							)}
							<span className='relative z-10 flex items-center justify-center gap-1.5 sm:gap-2'>
								<Award className='w-3.5 h-3.5 sm:w-4.5 sm:h-4.5' />
								<span className='hidden xs:inline'>
									{t.dashboardCourseDetail.tabs.tests}
								</span>{' '}
								({tests.length})
							</span>
						</button>
					</div>
				</m.section>
				{ }
				<div className='grid grid-cols-1 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8'>
					{ }
					<section className='xl:col-span-2 space-y-4 sm:space-y-5'>
						{activeTab === 'lessons' ? (
							lessons.length > 0 ? (
									lessons.map((lesson, index) => (
									<AppleLessonCard
										key={lesson.id}
										lesson={lesson}
										slug={course.slug}
										index={index}
									/>
								))
							) : (
								<AppleEmptyState
									icon={
										<BookOpen className='w-12 h-12 sm:w-16 sm:h-16 text-white/20' />
									}
									title={t.dashboardCourseDetail.emptyLessons}
								/>
							)
						) : tests.length > 0 ? (
								tests.map(test => (
								<AppleTestCard key={test.id} test={test} />
							))
						) : (
							<AppleEmptyState
								icon={
									<Award className='w-12 h-12 sm:w-16 sm:h-16 text-white/20' />
								}
								title={t.dashboardCourseDetail.emptyTests}
							/>
						)}
					</section>
					{ }
					<div className='xl:col-span-1 space-y-5 sm:space-y-6'>
						{ }
						<Card className='bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden'>
							<CardContent className='p-6 sm:p-8 text-center'>
								<m.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									className='w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 bg-linear-to-br from-blue-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl'
								>
									<Sparkles className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
								</m.div>
								<h3 className='text-lg sm:text-xl font-black text-white mb-2 sm:mb-3 leading-tight'>
									{t.dashboardCourseDetail.startNow.title}
								</h3>
								<p className='text-white/60 mb-5 sm:mb-6 text-xs sm:text-sm leading-relaxed'>
									{t.dashboardCourseDetail.startNow.subtitle}
								</p>
								{lessons[0] && (
									<Link
										href={`${ROUTES.COURSES}/${course.slug}/${lessons[0].id}`}
									>
										<Button
											size='lg'
											className='w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-white/80 shadow-2xl shadow-white/20 font-bold text-sm sm:text-base'
										>
											<Play className='w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2' />
											{t.dashboardCourseDetail.startNow.cta}
										</Button>
									</Link>
								)}
							</CardContent>
						</Card>
						{ }
						<Card className='bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl'>
							<CardHeader className='pb-3 sm:pb-4'>
								<CardTitle className='text-base sm:text-lg font-black text-white flex items-center gap-2'>
									<Target className='w-4 h-4 sm:w-5 sm:h-5 text-blue-400' />
									{t.dashboardCourseDetail.progressDetails.title}
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4 sm:space-y-5 pt-0'>
								<div className='space-y-2.5 sm:space-y-3'>
									<div className='flex justify-between text-xs sm:text-sm text-white/60'>
										<span>{t.dashboardCourseDetail.progressDetails.course}</span>
										<span className='font-semibold text-white'>
											{course.progress}%
										</span>
									</div>
									<Progress
										value={course.progress}
										className='h-2 sm:h-2.5 bg-white/5 border border-white/10 rounded-full [&>div]:bg-linear-to-r [&>div]:from-blue-500 [&>div]:to-purple-500 [&>div]:shadow-lg'
									/>
								</div>
								<div className='space-y-2.5 sm:space-y-3'>
									<div className='flex justify-between text-xs sm:text-sm text-white/60'>
										<span>{t.dashboardCourseDetail.progressDetails.lessons}</span>
										<span className='font-semibold text-white'>
											{Math.round(
												(stats.completedLessons / stats.totalLessons) * 100
											) || 0}
											%
										</span>
									</div>
									<Progress
										value={
											Math.round(
												(stats.completedLessons / stats.totalLessons) * 100
											) || 0
										}
										className='h-2 sm:h-2.5 bg-white/5 border border-white/10 rounded-full [&>div]:bg-linear-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500 [&>div]:shadow-lg'
									/>
								</div>
							</CardContent>
						</Card>
						{tests[0] && (
							<Card className='bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl'>
								<CardContent className='p-5 sm:p-6 text-center'>
									<div className='w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-linear-to-br from-yellow-500/20 to-orange-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center border border-yellow-500/20 backdrop-blur-sm shadow-lg'>
										<Award className='w-6 h-6 sm:w-7 sm:h-7 text-yellow-400' />
									</div>
									<h4 className='text-sm sm:text-base font-black text-white mb-1.5 sm:mb-2 leading-tight'>
										{tests[0].title}
									</h4>
									{tests[0].score !== null ? (
										<>
											<div className='text-xs sm:text-sm text-white/60 mb-4 sm:mb-5'>
												{t.dashboardCourseDetail.testCard.resultTemplate.replace(
													'{score}',
													String(tests[0].score)
												)}
											</div>
											<Link href={`${ROUTES.HOME}/tests/${tests[0].id}`}>
												<Button className='w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border-white/20 bg-white/2 backdrop-blur-sm hover:bg-white/5 font-semibold text-white hover:text-white text-xs sm:text-sm'>
													{t.dashboardCourseDetail.testCard.retake}
												</Button>
											</Link>
										</>
									) : (
										<>
											<div className='text-xs sm:text-sm text-white/60 mb-4 sm:mb-5'>
												{t.dashboardCourseDetail.testCard.passingScoreTemplate.replace(
													'{score}',
													String(tests[0].passingScore)
												)}
											</div>
											<Link href={`${ROUTES.HOME}/tests/${tests[0].id}`}>
												<Button className='w-full h-10 sm:h-11 rounded-xl sm:rounded-2xl border-white/20 bg-white/2 backdrop-blur-sm hover:bg-white/5 font-semibold text-white hover:text-white text-xs sm:text-sm'>
													{t.dashboardCourseDetail.testCard.takeTest}
												</Button>
											</Link>
										</>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
const AppleTestCard = ({ test }: { test: CourseTest }) => {
	const { t, locale } = useI18n()
	return (
	<Link href={`${ROUTES.TESTS}/${test.id}`} className='block group'>
		<Card className='group relative overflow-hidden bg-white/3 backdrop-blur-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-700 hover:shadow-2xl hover:shadow-white/10 hover:scale-[1.01] rounded-2xl sm:rounded-3xl'>
			<CardContent className='p-5 sm:p-6 lg:p-8 relative z-10'>
				<div className='w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-all shadow-lg backdrop-blur-sm'>
					<Award className='w-6 h-6 sm:w-7 sm:h-7' />
				</div>
				<h3 className='text-base sm:text-lg lg:text-xl font-black text-white group-hover:text-white/95 transition-all mb-4 sm:mb-5 leading-tight'>
					{test.title}
				</h3>
				<div className='flex items-center justify-between pt-4 sm:pt-5 border-t border-white/10'>
					{test.score !== null &&
					test.time !== null &&
					test.lastAttemptDate !== null ? (
						<div className='flex flex-col gap-3'>
							<div className='flex gap-3 items-center'>
								<p className='text-xs sm:text-base font-semibold text-white/60'>
									{t.dashboardCourseDetail.testListCard.resultLabel}
								</p>
								<Badge className='bg-green-500/10 text-green-400 border-yellow-500/20 font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl backdrop-blur-sm text-xs sm:text-sm'>
									{test.score}%
								</Badge>
							</div>
							<div className='flex gap-2'>
								<p className='text-xs sm:text-base font-semibold text-white/60'>
									{t.dashboardCourseDetail.testListCard.completedInLabel}
								</p>
								<p className='text-xs sm:text-base text-white'>
									{secondsToHMS(test.time, locale)}
								</p>
							</div>
							<div className='flex gap-2'>
								<p className='text-xs sm:text-base font-semibold text-white/60'>
									{t.dashboardCourseDetail.testListCard.dateLabel}
								</p>
								<p className='text-xs sm:text-base text-white'>
									{formatDate(test.lastAttemptDate)}
								</p>
							</div>
						</div>
					) : (
						<div className='flex gap-3 items-center'>
							<p className='text-xs sm:text-base font-semibold text-white/60'>
								{t.dashboardCourseDetail.testListCard.passingScoreLabel}
							</p>
							<Badge className='bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl backdrop-blur-sm text-xs sm:text-sm'>
								{test.passingScore}%
							</Badge>
						</div>
					)}
					<div
						className={cn(
							'w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-lg border border-white/10 shrink-0',
							'transition-all duration-700',
							test.score ?? 0
								? 'bg-emerald-500/10 text-emerald-400'
								: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110 group-hover:rotate-12'
						)}
					>
						{test.score !== null ? (
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
const AppleEmptyState = ({ icon, title }: { icon: ReactNode; title: string }) => {
	const { t } = useI18n()
	return (
	<Card className='relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/5 bg-white/2 backdrop-blur-2xl shadow-2xl p-8 sm:p-12 text-center'>
		<div className='relative z-10 flex flex-col items-center justify-center space-y-3 sm:space-y-4'>
			<div className='w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/20 shadow-lg mb-1 sm:mb-2'>
				{icon}
			</div>
			<h3 className='text-xl sm:text-2xl font-black text-white'>{title}</h3>
			<p className='text-base sm:text-lg text-white/60 max-w-md leading-relaxed'>
				{t.dashboardCourseDetail.contentComingSoon}
			</p>
		</div>
	</Card>
	)
}
const AppleSkeleton = () => (
	<>
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className='space-y-6 sm:space-y-8 lg:space-y-12 '
		>
			<Skeleton className='h-8 sm:h-10 w-48 sm:w-64 rounded-xl bg-white/5' />
			<Skeleton className='h-[280px] sm:h-80 rounded-2xl sm:rounded-3xl bg-white/5' />
			<div className='flex gap-3 sm:gap-4 p-1 sm:p-1.5 bg-white/5 backdrop-blur-2xl rounded-xl sm:rounded-3xl'>
				<Skeleton className='flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5' />
				<Skeleton className='flex-1 h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5' />
			</div>
			<div className='grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8'>
				<div className='xl:col-span-2 space-y-4 sm:space-y-5'>
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton
							key={i}
							className='h-48 sm:h-56 rounded-2xl sm:rounded-3xl bg-white/5'
						/>
					))}
				</div>
				<div className='space-y-5 sm:space-y-6'>
					<Skeleton className='h-52 sm:h-60 rounded-2xl sm:rounded-3xl bg-white/5' />
					<Skeleton className='h-40 sm:h-48 rounded-2xl sm:rounded-3xl bg-white/5' />
					<Skeleton className='h-36 sm:h-44 rounded-2xl sm:rounded-3xl bg-white/5' />
				</div>
			</div>
		</m.div>
	</>
)
const AppleNotFound = () => {
	const router = useRouter()
	const { t } = useI18n()
	return (
		<div className='min-h-screen flex items-center justify-center'>
			<Card className='w-full max-w-lg bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl p-8 sm:p-12 text-center'>
				<BookOpen className='w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 text-white/20' />
				<CardTitle className='text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3'>
					{t.dashboardCourseDetail.notFound.title}
				</CardTitle>
				<p className='text-base sm:text-lg text-white/60 mb-6 sm:mb-8 leading-relaxed'>
					{t.dashboardCourseDetail.notFound.subtitle}
				</p>
				<Button
					onClick={() => router.back()}
					className='w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-white/80 shadow-2xl font-bold text-sm sm:text-base'
				>
					{t.dashboardCourseDetail.notFound.back}
				</Button>
			</Card>
		</div>
	)
}
