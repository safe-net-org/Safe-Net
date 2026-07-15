'use client'

import RecentActivityFeed from '@/components/admin/dashboard/recent-activity-feed'
import StatWidgets from '@/components/admin/dashboard/stat-widgets'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/pages-url.config'
import { useAdminStats } from '@/hooks/admin/useAdminStats'
import { toTime } from '@/utils/date-time/dateFormatter'

import { m, Variants } from 'framer-motion'
import {
    ArrowRight,
    BookOpen,
    FileQuestion,
    RefreshCw,
    Sparkles,
    Users,
    Zap
} from 'lucide-react'
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

export default function AdminDashboardPage() {
	const { stats, isLoading, refetch } = useAdminStats()
	const [isRefreshing, setIsRefreshing] = useState(false)

	const handleRefresh = async () => {
		setIsRefreshing(true)
		await refetch()
		toast.success('Statistics updated')
		setIsRefreshing(false)
	}

	if (isLoading || !stats) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='flex flex-col items-center gap-4'>
					<div className='h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white' />
					<p className='text-sm text-gray-400'>Loading statistics...</p>
				</div>
			</div>
		)
	}

	const { users, content, performance, topCourses } = stats

	return (
		<m.div
			variants={containerVariants}
			initial='hidden'
			animate='show'
			className='min-h-screen space-y-6 p-4 sm:p-6 lg:p-8'
		>
			{/* Hero Header */}
			<m.div variants={itemVariants} className='space-y-4'>
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div className='space-y-2'>
						<div className='flex items-center gap-3'>
							<div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600'>
								<Sparkles className='h-5 w-5 sm:h-6 sm:w-6 text-white' />
							</div>
							<div>
								<h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-white'>
									Dashboard
								</h1>
								<p className='mt-1 text-sm text-gray-400'>
									Full overview of the Safe-Net platform
								</p>
							</div>
						</div>
					</div>

					<Button
						onClick={handleRefresh}
						disabled={isRefreshing}
						className='gap-2 rounded-xl bg-white px-4 sm:px-6 font-semibold text-black transition-all hover:bg-white/90'
					>
						<RefreshCw
							className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
						/>
						<span className='hidden sm:inline'>Refresh</span>
					</Button>
				</div>
			</m.div>

			{/* Main Grid */}
			<div className='grid gap-6 lg:grid-cols-3'>
				{/* Left Column - Stats & Charts */}
				<div className='space-y-6 lg:col-span-2'>
					{/* Stat Widgets */}
					<m.div variants={itemVariants}>
						<StatWidgets stats={stats} />
					</m.div>

					{/* Top Courses */}
					<m.div
						variants={itemVariants}
						className='rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl'
					>
						<div className='mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
							<div>
								<h2 className='text-xl sm:text-2xl font-bold text-white'>
									Popular courses
								</h2>
								<p className='mt-1 text-xs sm:text-sm text-gray-400'>
									Courses with the most students
								</p>
							</div>
							<Link href={ROUTES.ADMIN.LEARNING.COURSES}>
								<Button
									variant='ghost'
									size='sm'
									className='gap-2 text-gray-400 hover:text-white'
								>
									All courses
									<ArrowRight className='h-4 w-4' />
								</Button>
							</Link>
						</div>

						<div className='space-y-3'>
							{topCourses.slice(0, 5).map((course, index) => (
								<m.div
									key={course.id}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: index * 0.05, duration: 0.3 }}
									className='group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 transition-all hover:border-white/20 hover:bg-white/10'
								>
									<div className='flex items-center gap-3'>
										<div className='flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20'>
											<BookOpen className='h-5 w-5 sm:h-6 sm:w-6 text-blue-400' />
										</div>
										<div className='min-w-0 flex-1'>
											<h3 className='font-semibold text-white truncate'>
												{course.title}
											</h3>
											<p className='text-xs sm:text-sm text-gray-400'>
												{course.enrolledUsers} students
											</p>
										</div>
									</div>

									<div className='flex items-center gap-4 text-sm sm:text-base'>
										<div className='text-right'>
											<p className='text-xs sm:text-sm text-gray-400'>Completion</p>
											<p className='font-semibold text-white'>
												{course.completionRate}%
											</p>
										</div>
										<div className='text-right'>
											<p className='text-xs sm:text-sm text-gray-400'>Avg. score</p>
											<p className='font-semibold text-green-400'>
												{course.avgScore}%
											</p>
										</div>
									</div>
								</m.div>
							))}
						</div>
					</m.div>

					{/* Quick Actions */}
					<m.div
						variants={itemVariants}
						className='grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
					>
						<Link href={ROUTES.ADMIN.LEARNING.COURSES}>
							<div className='flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 sm:p-6 backdrop-blur-xl transition-all hover:border-blue-500/50'>
								<div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-blue-500/20'>
									<BookOpen className='h-5 w-5 sm:h-6 sm:w-6 text-blue-400' />
								</div>
								<div>
									<p className='font-semibold text-white'>Courses</p>
									<p className='text-xs sm:text-sm text-gray-400'>Content management</p>
								</div>
							</div>
						</Link>

						<Link href={ROUTES.ADMIN.LEARNING.TESTS}>
							<div className='flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4 sm:p-6 backdrop-blur-xl transition-all hover:border-purple-500/50'>
								<div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-purple-500/20'>
									<FileQuestion className='h-5 w-5 sm:h-6 sm:w-6 text-purple-400' />
								</div>
								<div>
									<p className='font-semibold text-white'>Tests</p>
									<p className='text-xs sm:text-sm text-gray-400'>Knowledge checks</p>
								</div>
							</div>
						</Link>

						<Link href={ROUTES.ADMIN.USERS}>
							<div className='flex items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-green-600/5 p-4 sm:p-6 backdrop-blur-xl transition-all hover:border-green-500/50'>
								<div className='flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-green-500/20'>
									<Users className='h-5 w-5 sm:h-6 sm:w-6 text-green-400' />
								</div>
								<div>
									<p className='font-semibold text-white'>Users</p>
									<p className='text-xs sm:text-sm text-gray-400'>Access management</p>
								</div>
							</div>
						</Link>
					</m.div>
				</div>

				{/* Right Column - Activity Feed */}
				<m.div variants={itemVariants} className='space-y-6'>
					<RecentActivityFeed activities={stats.recentActivity} />

					{/* System Status */}
					<div className='rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl'>
						<div className='mb-4 flex items-center gap-3'>
							<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20'>
								<Zap className='h-5 w-5 text-green-400' />
							</div>
							<div>
								<h3 className='font-semibold text-white'>System status</h3>
								<p className='text-xs sm:text-sm text-gray-400'>All systems operational</p>
							</div>
						</div>

						<div className='space-y-3'>
							<div className='flex items-center justify-between'>
								<span className='text-xs sm:text-sm text-gray-400'>Latest update</span>
								<span className='text-xs sm:text-sm text-gray-400'>
									{toTime(new Date()) || 'N/A'}
								</span>
							</div>
						</div>
					</div>
				</m.div>
			</div>
		</m.div>
	)
}
