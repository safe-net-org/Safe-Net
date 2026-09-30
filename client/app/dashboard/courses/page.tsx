'use client'
import { ArrowUpRight, Award, BookOpen, Sparkles, Zap } from '@/components/ui/icons'

import { ROUTES } from '@/config/pages-url.config'
import { useCourses } from '@/hooks/learning/useCourses'
import { useProfile } from '@/hooks/user/useProfile'
import { useI18n } from '@/i18n/LocaleProvider'
import { learningService } from '@/services/learning/learning.service'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { AppleButton } from '@/app/dashboard/components/AppleButton'
import { AppleCourseCard } from '@/app/dashboard/components/AppleCourseCard'
import { AppleLoadingGrid } from '@/app/dashboard/components/AppleLoadingGrid'
import { AppleStatCard } from '@/app/dashboard/components/AppleStatCard'
import { EmptyState } from '@/app/dashboard/components/EmptyState'
import { TabButton } from '@/app/dashboard/components/TabButton'

export default function CoursesPage() {
	const { locale, t } = useI18n()
	const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>(
		'active'
	)
	const { user } = useProfile()

	const { courses: activeCourses, isLoading: isActiveLoading } =
		useCourses('active')
	const { courses: completedCourses, isLoading: isCompletedLoading } =
		useCourses('completed')
	const catalog = useQuery({
		queryKey: ['learning', 'catalog', locale],
		queryFn: async () => {
			const stages = await learningService.getStages()
			return Promise.all(stages.map(async stage => ({
				stage,
				courses: await learningService.getCoursesByStage(stage.slug),
			})))
		},
	})

	const stats = useMemo(() => {
		const allCourses = [...activeCourses, ...completedCourses]
		return {
			totalCourses: allCourses.length,
			activeCount: activeCourses.length,
			completedCount: completedCourses.length,
			totalXP: allCourses.reduce((sum, c) => sum + (c.totalXp || 0), 0),
			allCourses,
		}
	}, [activeCourses, completedCourses])

	return (
		<>
			<div className='space-y-16'>
				{/* Header */}
				<div className='space-y-8'>
					{/* Title */}
					<div className='space-y-4'>
						<div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10'>
							<Sparkles className='w-4 h-4 text-blue-400' />
							<span className='text-sm font-medium text-slate-400'>
								{user?.name
									? t.dashboardCourses.hiTemplate.replace('{name}', user.name)
									: t.dashboardCourses.welcome}
							</span>
						</div>
						<h1 className='text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none'>
							{t.dashboardCourses.title}
						</h1>
						<p className='text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed'>
							{t.dashboardCourses.subtitle}
						</p>
					</div>

					{/* Stats */}
					<div className='grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6'>
						<AppleStatCard
							label={t.dashboardCourses.stats.active}
							value={stats.activeCount}
							icon={<BookOpen className='w-6 h-6' />}
							color='from-blue-500/20 to-cyan-500/20'
							iconColor='text-blue-400'
						/>
						<AppleStatCard
							label={t.dashboardCourses.stats.completed}
							value={stats.completedCount}
							icon={<Award className='w-6 h-6' />}
							color='from-emerald-500/20 to-teal-500/20'
							iconColor='text-emerald-400'
						/>
						<AppleStatCard
							label={t.dashboardCourses.stats.totalXp}
							value={stats.totalXP.toLocaleString()}
							icon={<Zap className='w-6 h-6' />}
							color='from-amber-500/20 to-orange-500/20'
							iconColor='text-amber-400'
						/>
					</div>
				</div>

				{/* Tabs */}
				<div>
					<div className='inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10'>
						<TabButton
							active={activeTab === 'active'}
							onClick={() => setActiveTab('active')}
						>
							{t.dashboardCourses.tabs.active}
							<span className='ml-2 text-xs opacity-60'>
								{stats.activeCount}
							</span>
						</TabButton>
						<TabButton
							active={activeTab === 'completed'}
							onClick={() => setActiveTab('completed')}
						>
							{t.dashboardCourses.tabs.completed}
							<span className='ml-2 text-xs opacity-60'>
								{stats.completedCount}
							</span>
						</TabButton>
						<TabButton
							active={activeTab === 'all'}
							onClick={() => setActiveTab('all')}
						>
							{t.dashboardCourses.tabs.all}
							<span className='ml-2 text-xs opacity-60'>
								{stats.totalCourses}
							</span>
						</TabButton>
					</div>
				</div>

				{/* Courses Grid */}
				<div>
					{/* Active Tab */}
					{activeTab === 'active' && (
						<>
							{isActiveLoading ? (
								<AppleLoadingGrid />
							) : activeCourses.length === 0 ? (
								<EmptyState
									icon={<BookOpen className='w-16 h-16' />}
									title={t.dashboardCourses.empty.noActiveTitle}
									description={t.dashboardCourses.empty.noActiveDesc}
									actionLabel={t.dashboardCourses.empty.openCatalog}
									actionHref='#catalog'
								/>
							) : (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
									{activeCourses.map((course, index) => (
										<AppleCourseCard
											key={course.id}
											course={course}
											index={index}
										/>
									))}
								</div>
							)}
						</>
					)}

					{/* Completed Tab */}
					{activeTab === 'completed' && (
						<>
							{isCompletedLoading ? (
								<AppleLoadingGrid />
							) : completedCourses.length === 0 ? (
								<EmptyState
									icon={<Award className='w-16 h-16' />}
									title={t.dashboardCourses.empty.noCompletedTitle}
									description={t.dashboardCourses.empty.noCompletedDesc}
									actionLabel={t.dashboardCourses.empty.openCatalog}
									actionHref='#catalog'
								/>
							) : (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
									{completedCourses.map((course, index) => (
										<AppleCourseCard
											key={course.id}
											course={course}
											index={index}
										/>
									))}
								</div>
							)}
						</>
					)}

					{/* All Tab */}
					{activeTab === 'all' && (
						<>
							{isActiveLoading || isCompletedLoading ? (
								<AppleLoadingGrid />
							) : stats.allCourses.length === 0 ? (
								<EmptyState
									icon={<BookOpen className='w-16 h-16' />}
									title={t.dashboardCourses.empty.noneTitle}
									description={t.dashboardCourses.empty.noneDesc}
									actionLabel={t.dashboardCourses.empty.selectCourse}
									actionHref='#catalog'
								/>
							) : (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'>
									{stats.allCourses.map((course, index) => (
										<AppleCourseCard
											key={course.id}
											course={course}
											index={index}
										/>
									))}
								</div>
							)}
						</>
					)}
				</div>

				<section id='catalog' className='space-y-8 scroll-mt-8' aria-labelledby='catalog-title'>
					<h2 id='catalog-title' className='text-3xl font-bold'>
						{t.dashboardCourses.cta.catalog}
					</h2>
					{catalog.isLoading && <AppleLoadingGrid />}
					{catalog.isError && (
						<p role='alert' className='text-red-400'>
							{t.dashboardHome.dataStates.pathErrorDescription}
						</p>
					)}
					{catalog.data?.map(({ stage, courses }) => (
						<div key={stage.id} className='space-y-4'>
							<h3 className='text-xl font-semibold'>{stage.title}</h3>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
								{courses.map(course => (
									<Link
										key={course.id}
										href={`${ROUTES.COURSES}/${course.slug}`}
										className='rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-blue-400/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'
									>
										<h4 className='font-semibold'>{course.title}</h4>
										<p className='mt-2 text-sm text-slate-400'>{course.description}</p>
									</Link>
								))}
							</div>
						</div>
					))}
				</section>

				{/* CTA Section */}
				{stats.totalCourses > 0 && (
					<div className='pt-16'>
						<div className='relative overflow-hidden rounded-3xl bg-linear-to-br from-white/5 to-white/2 backdrop-blur-2xl border border-white/10 p-8 md:p-12'>
							{/* Background elements */}
							<div className='absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl' />
							<div className='absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl' />

							<div className='relative z-10 space-y-6'>
								<div>
									<h3 className='text-2xl md:text-3xl font-bold mb-2'>
										{t.dashboardCourses.cta.title}
									</h3>
									<p className='text-slate-400 text-lg'>
										{t.dashboardCourses.cta.subtitle}
									</p>
								</div>
								<div className='flex flex-wrap gap-4'>
									<AppleButton href='#catalog' variant='primary'>
										{t.dashboardCourses.cta.catalog}
										<ArrowUpRight className='w-4 h-4 ml-2' />
									</AppleButton>
									<AppleButton href={ROUTES.CERTIFICATES} variant='secondary'>
										{t.dashboardCourses.cta.certificates}
									</AppleButton>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	)
}
