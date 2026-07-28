'use client'

import RecentActivityFeed from '@/components/admin/dashboard/recent-activity-feed'
import StatWidgets from '@/components/admin/dashboard/stat-widgets'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/pages-url.config'
import { useAdminStats } from '@/hooks/admin/useAdminStats'
import { useI18n } from '@/i18n/LocaleProvider'

import { m, type Variants } from 'framer-motion'
import {
	AlertCircle,
	ArrowRight,
	BookOpen,
	FileQuestion,
	RefreshCw,
	Sparkles,
	Users,
} from '@/components/ui/icons'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

const containerVariants = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: {
			duration: 0.3,
			staggerChildren: 0.05,
		},
	},
}

// Typed as Variants (and `ease` kept literal): a bare object widens `ease` to
// string, which framer-motion's Easing union rejects.
const itemVariants: Variants = {
	hidden: { opacity: 0, y: 10 },
	show: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
			ease: 'easeOut',
		},
	},
}

interface AdminDataStateProps {
	title: string
	description: string
	retryLabel: string
	onRetry: () => void
}

function AdminDataState({
	title,
	description,
	retryLabel,
	onRetry,
}: AdminDataStateProps) {
	return (
		<div className='flex min-h-[65vh] items-center justify-center p-4'>
			<div
				role='alert'
				className='w-full max-w-lg rounded-2xl border border-destructive/25 bg-card p-6 text-center shadow-sm sm:p-8'
			>
				<div className='mx-auto flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive'>
					<AlertCircle aria-hidden='true' />
				</div>
				<h1 className='mt-4 text-xl font-semibold text-foreground'>{title}</h1>
				<p className='mt-2 text-sm leading-6 text-muted-foreground'>
					{description}
				</p>
				<Button type='button' onClick={onRetry} className='mt-5'>
					<RefreshCw aria-hidden='true' />
					{retryLabel}
				</Button>
			</div>
		</div>
	)
}

export default function AdminDashboardPage() {
	const { t } = useI18n()
	const c = t.adminStats.overview
	const { stats, isLoading, error, refetch } = useAdminStats()
	const [isRefreshing, setIsRefreshing] = useState(false)

	const handleRefresh = async () => {
		setIsRefreshing(true)
		try {
			const result = await refetch()
			if (result.error) {
				toast.error(c.updateErrorToast)
				return
			}
			toast.success(c.updatedToast)
		} finally {
			setIsRefreshing(false)
		}
	}

	if (isLoading && !stats) {
		return (
			<div
				role='status'
				aria-label={c.loading}
				className='flex min-h-[65vh] items-center justify-center'
			>
				<div className='flex flex-col items-center gap-4'>
					<div className='size-10 animate-spin rounded-full border-2 border-muted border-t-primary motion-reduce:animate-none' />
					<p className='text-sm text-muted-foreground'>{c.loading}</p>
				</div>
			</div>
		)
	}

	if (!stats) {
		return (
			<AdminDataState
				title={error ? c.error.title : c.noData.title}
				description={error ? c.error.description : c.noData.description}
				retryLabel={c.retry}
				onRetry={() => void handleRefresh()}
			/>
		)
	}

	const topCourses = stats.topCourses ?? []

	return (
		<m.div
			variants={containerVariants}
			initial='hidden'
			animate='show'
			className='min-h-screen space-y-6'
		>
			<m.header variants={itemVariants} className='space-y-4'>
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div className='flex items-center gap-3'>
						<div className='flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-12'>
							<Sparkles className='size-5 sm:size-6' aria-hidden='true' />
						</div>
						<div>
							<h1 className='text-2xl font-semibold tracking-tight text-foreground sm:text-3xl'>
								{c.heading}
							</h1>
							<p className='mt-1 text-sm text-muted-foreground'>{c.subtitle}</p>
						</div>
					</div>

					<Button
						type='button'
						onClick={handleRefresh}
						disabled={isRefreshing}
						className='self-start sm:self-auto'
					>
						<RefreshCw
							className={isRefreshing ? 'animate-spin motion-reduce:animate-none' : ''}
							aria-hidden='true'
						/>
						<span>{isRefreshing ? c.refreshing : c.refresh}</span>
					</Button>
				</div>
			</m.header>

			{error && (
				<m.div
					variants={itemVariants}
					role='alert'
					className='flex flex-col gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 sm:flex-row sm:items-center'
				>
					<div className='flex min-w-0 flex-1 items-start gap-3'>
						<AlertCircle
							className='mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400'
							aria-hidden='true'
						/>
						<div>
							<p className='text-sm font-medium text-foreground'>
								{c.staleData.title}
							</p>
							<p className='mt-0.5 text-sm text-muted-foreground'>
								{c.staleData.description}
							</p>
						</div>
					</div>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={handleRefresh}
						disabled={isRefreshing}
						className='shrink-0'
					>
						<RefreshCw
							className={isRefreshing ? 'animate-spin motion-reduce:animate-none' : ''}
							aria-hidden='true'
						/>
						{c.retry}
					</Button>
				</m.div>
			)}

			<div className='grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,1fr)]'>
				<div className='min-w-0 space-y-6'>
					<m.div variants={itemVariants}>
						<StatWidgets stats={stats} />
					</m.div>

					<m.section
						variants={itemVariants}
						aria-labelledby='popular-courses-heading'
						className='rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:p-6'
					>
						<div className='mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
							<div>
								<h2
									id='popular-courses-heading'
									className='text-lg font-semibold text-foreground sm:text-xl'
								>
									{c.popularCourses.heading}
								</h2>
								<p className='mt-1 text-sm text-muted-foreground'>
									{c.popularCourses.subtitle}
								</p>
							</div>
							<Button variant='ghost' size='sm' asChild>
								<Link href={ROUTES.ADMIN.LEARNING.COURSES}>
									{c.popularCourses.allCourses}
									<ArrowRight aria-hidden='true' />
								</Link>
							</Button>
						</div>

						{topCourses.length > 0 ? (
							<ol className='space-y-2'>
								{topCourses.slice(0, 5).map((course, index) => (
									<m.li
										key={course.id}
										initial={{ opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.04, duration: 0.2 }}
										className='flex flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-3 transition-colors duration-200 hover:border-border hover:bg-accent/30 sm:flex-row sm:items-center sm:justify-between sm:p-4'
									>
										<div className='flex min-w-0 items-center gap-3'>
											<div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-11'>
												<BookOpen className='size-5' aria-hidden='true' />
											</div>
											<div className='min-w-0 flex-1'>
												<h3 className='truncate font-medium text-foreground'>
													{course.title}
												</h3>
												<p className='text-xs text-muted-foreground sm:text-sm'>
													{c.popularCourses.studentsTemplate.replace(
														'{count}',
														String(course.enrolledUsers)
													)}
												</p>
											</div>
										</div>

										<dl className='grid grid-cols-2 gap-4 pl-13 sm:flex sm:gap-6 sm:pl-0'>
											<div>
												<dt className='text-xs text-muted-foreground'>
													{c.popularCourses.completion}
												</dt>
												<dd className='mt-0.5 font-semibold tabular-nums text-foreground'>
													{course.completionRate}%
												</dd>
											</div>
											<div>
												<dt className='text-xs text-muted-foreground'>
													{c.popularCourses.avgScore}
												</dt>
												<dd className='mt-0.5 font-semibold tabular-nums text-foreground'>
													{course.avgScore}%
												</dd>
											</div>
										</dl>
									</m.li>
								))}
							</ol>
						) : (
							<div className='rounded-xl border border-dashed border-border p-6 text-center'>
								<BookOpen
									className='mx-auto size-8 text-muted-foreground'
									aria-hidden='true'
								/>
								<h3 className='mt-3 font-medium text-foreground'>
									{c.popularCourses.emptyTitle}
								</h3>
								<p className='mx-auto mt-1 max-w-md text-sm text-muted-foreground'>
									{c.popularCourses.emptyDescription}
								</p>
								<Button variant='outline' size='sm' className='mt-4' asChild>
									<Link href={ROUTES.ADMIN.LEARNING.COURSES}>
										{c.popularCourses.manageCourses}
										<ArrowRight aria-hidden='true' />
									</Link>
								</Button>
							</div>
						)}
					</m.section>

					<m.section
						variants={itemVariants}
						aria-labelledby='quick-actions-heading'
						className='space-y-3'
					>
						<h2
							id='quick-actions-heading'
							className='text-base font-semibold text-foreground'
						>
							{c.quickActions.heading}
						</h2>
						<div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
							<Link
								href={ROUTES.ADMIN.LEARNING.COURSES}
								className='flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-colors duration-200 hover:border-primary/35 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
							>
								<div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400'>
									<BookOpen className='size-5' aria-hidden='true' />
								</div>
								<div className='min-w-0'>
									<p className='font-medium text-foreground'>
										{c.quickActions.courses}
									</p>
									<p className='text-xs text-muted-foreground'>
										{c.quickActions.coursesSubtitle}
									</p>
								</div>
							</Link>

							<Link
								href={ROUTES.ADMIN.LEARNING.TESTS}
								className='flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-colors duration-200 hover:border-primary/35 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
							>
								<div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400'>
									<FileQuestion className='size-5' aria-hidden='true' />
								</div>
								<div className='min-w-0'>
									<p className='font-medium text-foreground'>
										{c.quickActions.tests}
									</p>
									<p className='text-xs text-muted-foreground'>
										{c.quickActions.testsSubtitle}
									</p>
								</div>
							</Link>

							<Link
								href={ROUTES.ADMIN.USERS}
								className='flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-colors duration-200 hover:border-primary/35 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
							>
								<div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
									<Users className='size-5' aria-hidden='true' />
								</div>
								<div className='min-w-0'>
									<p className='font-medium text-foreground'>
										{c.quickActions.users}
									</p>
									<p className='text-xs text-muted-foreground'>
										{c.quickActions.usersSubtitle}
									</p>
								</div>
							</Link>
						</div>
					</m.section>
				</div>

				<m.aside variants={itemVariants} className='min-w-0'>
					<RecentActivityFeed activities={stats.recentActivity ?? []} />
				</m.aside>
			</div>
		</m.div>
	)
}
