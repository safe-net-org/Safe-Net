'use client'

import { cn } from '@/lib/utils'
import { IUserDetail } from '@/services/admin/admin.types'
import { useI18n } from '@/i18n/LocaleProvider'
import { m } from 'framer-motion'
import {
	Activity,
	Award,
	BookOpen,
	FileText,
	TrendingUp,
	Trophy,
	Zap,
} from '@/components/ui/icons'
import { useState } from 'react'
import UserAchievementsBlock from './user-achievements-block'
import UserActivityBlock from './user-activity-block'
import UserCertificatesBlock from './user-certificates-block'
import UserCoursesBlock from './user-courses-block'
import UserInfoBlock from './user-info-block'
import UserTestsBlock from './user-tests-block'

interface UserDetailViewProps {
	user: IUserDetail
	onUserUpdated: () => void
}

type TabValue =
	| 'courses'
	| 'activity'
	| 'tests'
	| 'certificates'
	| 'achievements'

export default function UserDetailView({
	user,
	onUserUpdated,
}: UserDetailViewProps) {
	const { t } = useI18n()
	const c = t.adminUserComponents.userDetailView
	const [activeTab, setActiveTab] = useState<TabValue>('courses')

	const completionRate =
		user.statistics.totalCourses > 0
			? Math.round(
					(user.statistics.completedCourses / user.statistics.totalCourses) *
						100
				)
			: 0

	return (
		<div className='space-y-6'>
			{/* User Info Block */}
			<UserInfoBlock user={user} onUserUpdated={onUserUpdated} />

			{/* Stats Cards */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
				<StatCard
					label={c.stats.totalCourses}
					value={user.statistics.totalCourses}
					icon={<BookOpen className='w-5 h-5' />}
					color='blue'
					description={c.stats.enrolled}
				/>
				<StatCard
					label={c.stats.completed}
					value={user.statistics.completedCourses}
					icon={<Trophy className='w-5 h-5' />}
					color='emerald'
					description={c.stats.percentOfAllTemplate.replace(
						'{percent}',
						String(completionRate)
					)}
				/>
				<StatCard
					label={c.stats.inProgress}
					value={user.statistics.inProgressCourses}
					icon={<TrendingUp className='w-5 h-5' />}
					color='purple'
					description={c.stats.active}
				/>
				<StatCard
					label={c.stats.tests}
					value={user.statistics.totalTests}
					icon={<FileText className='w-5 h-5' />}
					color='amber'
					description={c.stats.averageScoreTemplate.replace(
						'{score}',
						String(user.statistics.averageTestScore)
					)}
				/>
				<StatCard
					label={c.stats.certificates}
					value={user.statistics.certificates}
					icon={<Award className='w-5 h-5' />}
					color='pink'
					description={c.stats.received}
				/>
			</div>

			{/* Quick Stats Bar */}
			<m.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className='flex items-center gap-4 p-4 bg-linear-to-r from-blue-500/5 to-purple-500/5 border border-white/10 rounded-xl'
			>
				<div className='flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg'>
					<Zap className='w-4 h-4 text-amber-400' />
					<span className='text-sm font-semibold text-white'>
						{c.quickStats.lessonsCompletedTemplate.replace(
							'{count}',
							String(user.statistics.totalLessons)
						)}
					</span>
				</div>
				<div className='flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg'>
					<Trophy className='w-4 h-4 text-purple-400' />
					<span className='text-sm font-semibold text-white'>
						{c.quickStats.achievementsTemplate.replace(
							'{count}',
							String(user.statistics.achievements)
						)}
					</span>
				</div>
				{user.statistics.averageTestScore > 0 && (
					<div className='flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg'>
						<TrendingUp className='w-4 h-4 text-emerald-400' />
						<span className='text-sm font-semibold text-white'>
							{c.quickStats.successRateTemplate.replace(
								'{score}',
								String(user.statistics.averageTestScore)
							)}
						</span>
					</div>
				)}
			</m.div>

			{/* Tabs - Apple Style */}
			<div className='space-y-6'>
				<div className='flex items-center gap-3 p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl w-fit'>
					<TabButton
						active={activeTab === 'courses'}
						onClick={() => setActiveTab('courses')}
						icon={<BookOpen className='w-4 h-4' />}
						label={c.tabs.courses}
						badge={user.statistics.totalCourses}
					/>
					<TabButton
						active={activeTab === 'activity'}
						onClick={() => setActiveTab('activity')}
						icon={<Activity className='w-4 h-4' />}
						label={c.tabs.activity}
					/>
					<TabButton
						active={activeTab === 'tests'}
						onClick={() => setActiveTab('tests')}
						icon={<FileText className='w-4 h-4' />}
						label={c.tabs.tests}
						badge={user.statistics.totalTests}
					/>
					<TabButton
						active={activeTab === 'certificates'}
						onClick={() => setActiveTab('certificates')}
						icon={<Award className='w-4 h-4' />}
						label={c.tabs.certificates}
						badge={user.statistics.certificates}
					/>
					<TabButton
						active={activeTab === 'achievements'}
						onClick={() => setActiveTab('achievements')}
						icon={<Trophy className='w-4 h-4' />}
						label={c.tabs.achievements}
						badge={user.statistics.achievements}
					/>
				</div>

				{/* Tab Content */}
				<m.div
					key={activeTab}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					{activeTab === 'courses' && (
						<UserCoursesBlock courses={user.courses} />
					)}
					{activeTab === 'activity' && (
						<UserActivityBlock activities={user.recentActivity} />
					)}
					{activeTab === 'tests' && (
						<UserTestsBlock testResults={user.testResults} />
					)}
					{activeTab === 'certificates' && (
						<UserCertificatesBlock certificates={user.certificates} />
					)}
					{activeTab === 'achievements' && (
						<UserAchievementsBlock achievements={user.achievements} />
					)}
				</m.div>
			</div>
		</div>
	)
}

function StatCard({
	label,
	value,
	icon,
	color = 'blue',
	description,
}: {
	label: string
	value: string | number
	icon: React.ReactNode
	color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'pink'
	description?: string
}) {
	const colorClasses = {
		blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/30',
		emerald:
			'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 hover:border-emerald-500/30',
		purple:
			'from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/30',
		amber:
			'from-amber-500/10 to-amber-600/5 border-amber-500/20 hover:border-amber-500/30',
		pink: 'from-pink-500/10 to-pink-600/5 border-pink-500/20 hover:border-pink-500/30',
	}

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			whileHover={{ y: -4 }}
			className={`p-5 rounded-xl bg-linear-to-br ${colorClasses[color]} border backdrop-blur-sm transition-all cursor-default`}
		>
			<div className='flex items-start justify-between mb-3'>
				<div className='text-white/60'>{icon}</div>
				<span className='text-3xl font-black text-white'>{value}</span>
			</div>
			<p className='text-sm font-bold text-white mb-1'>{label}</p>
			{description && (
				<p className='text-xs font-medium text-white/40'>{description}</p>
			)}
		</m.div>
	)
}

// TabButton component matching the file's style
function TabButton({
	active,
	onClick,
	icon,
	label,
	badge,
}: {
	active: boolean
	onClick: () => void
	icon: React.ReactNode
	label: string
	badge?: number
}) {
	return (
		<button
			onClick={onClick}
			className={cn(
				'relative px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2',
				active
					? 'bg-white text-black shadow-lg shadow-white/20'
					: 'text-white/60 hover:text-white hover:bg-white/5'
			)}
		>
			<span className={cn(active ? 'text-black' : 'text-white/60')}>
				{icon}
			</span>
			<span>{label}</span>
			{badge !== undefined && badge > 0 && (
				<span
					className={cn(
						'px-2 py-0.5 rounded-md text-xs font-bold',
						active ? 'bg-black/10 text-black' : 'bg-white/10 text-white/60'
					)}
				>
					{badge}
				</span>
			)}
		</button>
	)
}
