'use client'

import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/pages-url.config'
import { useAchievements } from '@/hooks/learning/useAchievements'
import { useHomeData } from '@/hooks/learning/useHomeData'
import { useProfile } from '@/hooks/user/useProfile'
import { useI18n } from '@/i18n/LocaleProvider'
import { translateStageTitle } from '@/i18n/content-translations'
import { selectPlural } from '@/i18n/plural'
import * as icons from '@/components/ui/icons'
import {
	AlertCircle,
	Award,
	BookOpen,
	Play,
	RefreshCw,
	Shield,
	Sparkles,
	Trophy,
	Zap,
	type AppIcon,
} from '@/components/ui/icons'
import { useMemo } from 'react'
import { AppleCourseCard } from './components/AppleCourseCard'
import { AppleStatCard } from './components/AppleStatCard'
import { EmptyState } from './components/EmptyState'
import { SectionHeader } from './components/SectionHeader'
import { ShimmerSkeleton } from './components/ShimmerSkeleton'
import { WelcomeCard } from './components/WelcomeCard'

const getIconBySlug = (slug: string): AppIcon => {
	const pascalCase = slug
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('')
	const icon = icons[pascalCase as keyof typeof icons]
	return (icon as AppIcon) || Shield
}

interface DashboardErrorStateProps {
	title: string
	description: string
	retryLabel: string
	onRetry: () => void
}

function DashboardErrorState({
	title,
	description,
	retryLabel,
	onRetry,
}: DashboardErrorStateProps) {
	return (
		<div
			role='alert'
			className='col-span-full flex flex-col items-start gap-4 rounded-2xl border border-destructive/25 bg-destructive/5 p-5 sm:flex-row sm:items-center'
		>
			<div className='flex min-w-0 flex-1 items-start gap-3'>
				<AlertCircle
					className='mt-0.5 size-5 shrink-0 text-destructive'
					aria-hidden='true'
				/>
				<div>
					<h3 className='font-semibold text-foreground'>{title}</h3>
					<p className='mt-1 text-sm leading-6 text-muted-foreground'>
						{description}
					</p>
				</div>
			</div>
			<Button
				type='button'
				variant='outline'
				size='sm'
				onClick={onRetry}
				className='shrink-0'
			>
				<RefreshCw aria-hidden='true' />
				{retryLabel}
			</Button>
		</div>
	)
}

export default function DashboardHome() {
	const { t, locale } = useI18n()
	const { user } = useProfile()
	const {
		myCourses,
		stages,
		completedCount,
		totalXp,
		isMyCoursesLoading,
		isMyCoursesError,
		refetchMyCourses,
		isStagesLoading,
		isStagesError,
		refetchStages,
	} = useHomeData()
	const {
		userAchievements,
		isUserAchievementsLoading,
		isUserAchievementsError,
		refetchUserAchievements,
	} = useAchievements()

	const stats = useMemo(
		() => ({
			totalXp: totalXp,
			completedCourses: completedCount,
			activeCourses: myCourses.length,
		}),
		[myCourses, completedCount, totalXp]
	)

	const recentAchievements = useMemo(
		() =>
			[...(userAchievements ?? [])]
				.sort(
					(a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
				)
				.slice(0, 4),
		[userAchievements]
	)

	const greeting = useMemo(() => {
		const hour = new Date().getHours()
		if (hour < 6) return t.dashboardHome.greeting.night
		if (hour < 12) return t.dashboardHome.greeting.morning
		if (hour < 18) return t.dashboardHome.greeting.afternoon
		return t.dashboardHome.greeting.evening
	}, [t])

	const motivationalMessage = useMemo(() => {
		if (isMyCoursesLoading) return t.dashboardHome.motivational.loading
		if (isMyCoursesError) return t.dashboardHome.motivational.unavailable
		if (stats.activeCourses === 0) return t.dashboardHome.motivational.startFirst
		if (stats.activeCourses === 1) return t.dashboardHome.motivational.oneActive
		return t.dashboardHome.motivational.activeCoursesTemplate.replace(
			'{count}',
			String(stats.activeCourses)
		)
	}, [isMyCoursesError, isMyCoursesLoading, stats.activeCourses, t])

	const statsUnavailable = isMyCoursesLoading || isMyCoursesError
	const numberLocale = locale === 'ru' ? 'ru-RU' : 'en-US'

	return (
		<div className='min-h-screen space-y-8 text-foreground'>
			<div className='grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-4'>
				<WelcomeCard
					greeting={greeting}
					userName={user?.name || t.dashboardNav.student}
					message={motivationalMessage}
				/>
				<div className='flex flex-col gap-3 lg:gap-4'>
					<AppleStatCard
						icon={<Trophy className='w-5 h-5 text-emerald-400' />}
						label={t.dashboardHome.stats.completed}
						value={
							statsUnavailable ? '—' : stats.completedCourses.toLocaleString(numberLocale)
						}
						color='from-emerald-500/10 to-transparent'
					/>
					<AppleStatCard
						icon={<Zap className='w-5 h-5 text-yellow-400' />}
						label={t.dashboardHome.stats.totalXp}
						value={statsUnavailable ? '—' : stats.totalXp.toLocaleString(numberLocale)}
						color='from-amber-500/10 to-transparent'
					/>
				</div>
			</div>

			<section className='space-y-4 md:space-y-6'>
				<SectionHeader
					icon={<Play className='w-5 h-5 text-indigo-400' />}
					title={t.dashboardHome.activeCourses.title}
					subtitle={
						isMyCoursesLoading
							? t.dashboardHome.dataStates.loadingCourses
							: isMyCoursesError
								? t.dashboardHome.dataStates.unavailable
								: stats.activeCourses > 0
							? t.dashboardHome.activeCourses.subtitleInProgressTemplate
									.replace('{count}', String(stats.activeCourses))
									.replace(
										'{courseWord}',
										selectPlural(locale, stats.activeCourses, {
											one: t.dashboardHome.activeCourses.courseWordOne,
											few: t.dashboardHome.activeCourses.courseWordFew,
											many: t.dashboardHome.activeCourses.courseWordMany,
										})
									)
							: t.dashboardHome.activeCourses.subtitleStart
					}
					actionLabel={t.dashboardHome.activeCourses.viewAll}
					actionHref={ROUTES.COURSES}
					showAction={true}
				/>
				{isMyCoursesLoading ? (
					<div
						role='status'
						aria-label={t.dashboardHome.dataStates.loadingCourses}
						className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3'
					>
						<span className='sr-only'>{t.dashboardHome.dataStates.loadingCourses}</span>
						{[1, 2, 3, 4, 5, 6].map(i => (
							<ShimmerSkeleton key={i} />
						))}
					</div>
				) : isMyCoursesError ? (
					<DashboardErrorState
						title={t.dashboardHome.dataStates.coursesErrorTitle}
						description={t.dashboardHome.dataStates.coursesErrorDescription}
						retryLabel={t.dashboardHome.dataStates.retry}
						onRetry={() => void refetchMyCourses()}
					/>
				) : myCourses.length > 0 ? (
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3'>
						{myCourses.slice(0, 6).map((course, index) => (
							<AppleCourseCard key={course.id} course={course} index={index} />
						))}
					</div>
				) : (
					<EmptyState
						icon={<BookOpen className='w-8 h-8 text-slate-600' />}
						title={t.dashboardHome.empty.title}
						description={t.dashboardHome.empty.description}
						actionLabel={t.dashboardHome.empty.cta}
						actionHref={ROUTES.COURSES}
					/>
				)}
			</section>

			<section className='space-y-4 md:space-y-6'>
				<SectionHeader
					icon={<Sparkles className='w-5 h-5 text-purple-400' />}
					title={t.dashboardHome.learningPath.heading}
					subtitle={t.dashboardHome.learningPath.subtitle}
					actionLabel={t.dashboardHome.learningPath.viewAll}
					actionHref={ROUTES.COURSES}
					showAction={true}
				/>
				{isStagesLoading ? (
					<div
						role='status'
						aria-label={t.dashboardHome.dataStates.loadingPath}
						className='grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4'
					>
						<span className='sr-only'>{t.dashboardHome.dataStates.loadingPath}</span>
						{[1, 2, 3, 4].map(i => (
							<ShimmerSkeleton key={i} height='h-32' />
						))}
					</div>
				) : isStagesError ? (
					<DashboardErrorState
						title={t.dashboardHome.dataStates.pathErrorTitle}
						description={t.dashboardHome.dataStates.pathErrorDescription}
						retryLabel={t.dashboardHome.dataStates.retry}
						onRetry={() => void refetchStages()}
					/>
				) : stages.length > 0 ? (
					<div className='grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4'>
						{stages.map(stage => {
							const Icon = getIconBySlug(stage.icon || stage.slug)
							const title = translateStageTitle(locale, stage.title)
							return (
								<article
									key={stage.id}
									className='rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm transition-colors duration-200 hover:border-border hover:bg-accent/40'
								>
									<Icon
										className='mb-2.5 size-5 text-primary'
										aria-hidden='true'
									/>
									<h3 className='mb-1 text-sm font-semibold leading-tight text-foreground'>
										{title}
									</h3>
									<p className='text-xs text-muted-foreground'>
										{stage.totalLessons}{' '}
										{selectPlural(locale, stage.totalLessons, {
											one: t.dashboardHome.learningPath.lessonWordOne,
											few: t.dashboardHome.learningPath.lessonWordFew,
											many: t.dashboardHome.learningPath.lessonWordMany,
										})}
									</p>
								</article>
							)
						})}
					</div>
				) : (
					<div className='rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center'>
						<h3 className='font-semibold text-foreground'>
							{t.dashboardHome.dataStates.pathEmptyTitle}
						</h3>
						<p className='mt-1 text-sm text-muted-foreground'>
							{t.dashboardHome.dataStates.pathEmptyDescription}
						</p>
					</div>
				)}
			</section>

			<section className='space-y-4 md:space-y-6'>
				<SectionHeader
					icon={<Award className='w-5 h-5 text-emerald-400' />}
					title={t.dashboardHome.recentAchievements.heading}
					subtitle=''
					actionLabel={t.dashboardHome.recentAchievements.viewAll}
					actionHref={ROUTES.ACHIEVEMENTS}
					showAction={true}
				/>
				{isUserAchievementsLoading ? (
					<div
						role='status'
						aria-label={t.dashboardHome.dataStates.loadingAchievements}
						className='grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4'
					>
						<span className='sr-only'>
							{t.dashboardHome.dataStates.loadingAchievements}
						</span>
						{[1, 2, 3, 4].map(i => (
							<ShimmerSkeleton key={i} height='h-24' variant='compact' />
						))}
					</div>
				) : isUserAchievementsError ? (
					<DashboardErrorState
						title={t.dashboardHome.dataStates.achievementsErrorTitle}
						description={t.dashboardHome.dataStates.achievementsErrorDescription}
						retryLabel={t.dashboardHome.dataStates.retry}
						onRetry={() => void refetchUserAchievements()}
					/>
				) : recentAchievements.length > 0 ? (
					<div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4'>
						{recentAchievements.map(userAchievement => (
							<article
								key={userAchievement.id}
								className='flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm'
							>
								<div className='flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10'>
									<Trophy
										className='size-5 text-emerald-500'
										aria-hidden='true'
									/>
								</div>
								<div className='min-w-0'>
									<h3 className='truncate text-sm font-semibold text-foreground'>
										{userAchievement.achievement.title}
									</h3>
									<p className='text-xs text-muted-foreground'>
										+{userAchievement.achievement.xpReward} XP
									</p>
								</div>
							</article>
						))}
					</div>
				) : (
					<p className='rounded-2xl border border-dashed border-border bg-card/50 p-6 text-sm text-muted-foreground'>
						{t.dashboardHome.recentAchievements.emptyText}
					</p>
				)}
			</section>
		</div>
	)
}
