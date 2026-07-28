'use client'

import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/config/pages-url.config'
import { useAchievements } from '@/hooks/learning/useAchievements'
import { useI18n } from '@/i18n/LocaleProvider'
import type { Messages } from '@/i18n/messages'
import { cn } from '@/lib/utils'
import type {
	AchievementTier,
	IAchievement,
} from '@/services/learning/learning.types'
import { formatDate } from '@/utils/date-time/dateFormatter'
import { AnimatePresence, m } from 'framer-motion'
import { icons, Lock, AppIcon, Sparkles, Trophy } from '@/components/ui/icons'
import { createElement, useState } from 'react'

// Apple-style easing curves
const appleEasing = [0.42, 0, 0.58, 1] as const
const appleEaseOut = [0.16, 1, 0.3, 1] as const

// Rarity is the whole point of tiers, so each one gets a visibly different
// treatment rather than the single purple every card used to share.
const tierStyles = (
	t: Messages['dashboardAchievements']
): Record<
	AchievementTier,
	{ label: string; icon: string; card: string; badge: string }
> => ({
	BRONZE: {
		label: t.tiers.bronze,
		icon: 'text-amber-700 dark:text-amber-600',
		card: 'from-amber-600/5 to-amber-700/5 border-amber-600/20',
		badge:
			'bg-amber-100 text-amber-800 ring-amber-300 dark:bg-amber-600/15 dark:text-amber-500 dark:ring-amber-600/30',
	},
	SILVER: {
		label: t.tiers.silver,
		icon: 'text-slate-600 dark:text-slate-300',
		card: 'from-slate-300/5 to-slate-400/5 border-slate-300/20',
		badge:
			'bg-slate-200 text-slate-800 ring-slate-300 dark:bg-slate-300/15 dark:text-slate-200 dark:ring-slate-300/30',
	},
	GOLD: {
		label: t.tiers.gold,
		icon: 'text-yellow-700 dark:text-yellow-400',
		card: 'from-yellow-500/5 to-orange-500/5 border-yellow-500/25',
		badge:
			'bg-yellow-100 text-yellow-800 ring-yellow-300 dark:bg-yellow-500/15 dark:text-yellow-400 dark:ring-yellow-500/30',
	},
	PLATINUM: {
		label: t.tiers.platinum,
		icon: 'text-cyan-700 dark:text-cyan-300',
		card: 'from-cyan-400/5 to-violet-500/10 border-cyan-400/25',
		badge:
			'bg-cyan-100 text-cyan-800 ring-cyan-300 dark:bg-cyan-400/15 dark:text-cyan-300 dark:ring-cyan-400/30',
	},
})

// Function to get an icon by slug
const getIconBySlug = (slug: string): AppIcon => {
	const pascalCase = slug
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('')

	// Use named import from icons object
	const icon = icons[pascalCase as keyof typeof icons]
	return (icon as AppIcon) || Trophy
}

function AchievementIcon({
	slug,
	className,
}: {
	slug: string
	className: string
}) {
	return createElement(getIconBySlug(slug), {
		className,
		strokeWidth: 1.5,
		'aria-hidden': true,
	})
}

export default function AchievementsPage() {
	const { t } = useI18n()
	const { achievements, userAchievements, isLoading } = useAchievements()
	const [hoveredCard, setHoveredCard] = useState<string | null>(null)
	const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all')

	const earnedIds = new Set(userAchievements?.map(ua => ua.achievement.id))
	const earnedCount = earnedIds.size
	const totalCount = achievements?.length || 0
	const hasAchievements = earnedCount > 0
	const earnedXp =
		userAchievements?.reduce(
			(total, ua) => total + (ua.achievement.xpReward ?? 0),
			0
		) ?? 0

	// Sort: completed first, then by date received
	const sortedAchievements = achievements?.slice().sort((a, b) => {
		const aEarned = earnedIds.has(a.id)
		const bEarned = earnedIds.has(b.id)

		// Completed first
		if (aEarned && !bEarned) return -1
		if (!aEarned && bEarned) return 1

		// Among completed items - by date received (newest first)
		if (aEarned && bEarned) {
			const aDate = userAchievements?.find(
				ua => ua.achievement.id === a.id
			)?.earnedAt
			const bDate = userAchievements?.find(
				ua => ua.achievement.id === b.id
			)?.earnedAt
			if (aDate && bDate) {
				return new Date(bDate).getTime() - new Date(aDate).getTime()
			}
		}

		return 0
	})

	const filteredAchievements = sortedAchievements?.filter(ach => {
		if (filter === 'earned') return earnedIds.has(ach.id)
		if (filter === 'locked') return !earnedIds.has(ach.id)
		return true
	})

	if (isLoading) {
		return (
			<div className='space-y-6'>
				<Skeleton className='h-8 w-64 bg-white/5' />
				<div className='grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					{[...Array(6)].map((_, i) => (
						<Skeleton key={i} className='h-64 bg-white/5' />
					))}
				</div>
			</div>
		)
	}

	return (
		<div className='space-y-6 sm:space-y-8'>
				<Breadcrumb
					showBackButton
					items={[
						{ label: t.dashboardAchievements.breadcrumb.home, href: ROUTES.HOME },
						{
							label: t.dashboardAchievements.breadcrumb.achievements,
							href: ROUTES.ACHIEVEMENTS,
						},
					]}
				/>

				{/* Hero Section */}
				<div className='relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 p-6 shadow-2xl shadow-yellow-500/5 sm:rounded-3xl sm:p-8 md:p-12'>
					{/* Animated background */}
					<div className='pointer-events-none absolute inset-0 overflow-hidden'>
						<div className='absolute -right-20 -top-20 h-64 w-64 animate-pulse rounded-full bg-yellow-500/20 blur-3xl' />
						<div className='absolute -bottom-20 -left-20 h-64 w-64 animate-pulse rounded-full bg-purple-500/20 blur-3xl delay-700' />
					</div>

					<div className='relative grid gap-6 sm:gap-8 md:grid-cols-2'>
						{/* Left Content */}
						<div className='space-y-4'>
							<m.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className='flex items-center gap-3'
							>
								<div className='rounded-xl bg-gradient-to-br from-yellow-500/30 to-orange-500/30 p-2.5 shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-500/30 sm:rounded-2xl sm:p-3'>
									<Trophy className='h-6 w-6 text-amber-700 dark:text-yellow-400 sm:h-8 sm:w-8' />
								</div>
								<h1 className='text-2xl font-bold text-foreground sm:text-3xl md:text-4xl'>
									{t.dashboardAchievements.title}
								</h1>
							</m.div>

							<p className='text-sm text-muted-foreground sm:text-base md:text-lg'>
								{hasAchievements
									? t.dashboardAchievements.subtitleEarnedTemplate
											.replace('{earned}', String(earnedCount))
											.replace('{total}', String(totalCount))
									: t.dashboardAchievements.subtitleNone}
							</p>

							{/* Filter Tabs */}
							<div className='flex flex-wrap gap-2'>
								<Button
									variant='default'
									size='sm'
									onClick={() => setFilter('all')}
									className={
										filter === 'all'
											? ''
											: 'border-border bg-card text-card-foreground hover:bg-accent'
									}
								>
									{t.dashboardAchievements.filters.all}
								</Button>
								<Button
									variant='default'
									size='sm'
									onClick={() => setFilter('earned')}
									className={
										filter === 'earned'
											? ''
											: 'border-border bg-card text-card-foreground hover:bg-accent'
									}
								>
									{t.dashboardAchievements.filters.receivedTemplate.replace(
										'{count}',
										String(earnedCount)
									)}
								</Button>
								<Button
									variant='default'
									size='sm'
									onClick={() => setFilter('locked')}
									className={
										filter === 'locked'
											? ''
											: 'border-border bg-card text-card-foreground hover:bg-accent'
									}
								>
									{t.dashboardAchievements.filters.lockedTemplate.replace(
										'{count}',
										String(totalCount - earnedCount)
									)}
								</Button>
							</div>
						</div>

						{/* Right Content - Progress */}
						{hasAchievements && (
							<div className='flex flex-col justify-center space-y-3 sm:space-y-4'>
								<StatCard
									icon={Trophy}
									label={t.dashboardAchievements.stats.progress}
									value={`${Math.round((earnedCount / totalCount) * 100)}%`}
									color='yellow'
									delay={0.1}
								/>
								<StatCard
									icon={Sparkles}
									label={t.dashboardAchievements.stats.bonusXp}
									value={earnedXp}
									color='purple'
									delay={0.2}
								/>
							</div>
						)}
					</div>
				</div>

				{/* Achievements Grid */}
				<div className='grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3'>
					<AnimatePresence mode='popLayout'>
						{filteredAchievements?.map((achievement, index) => {
							const userAchievement = userAchievements?.find(
								ua => ua.achievement.id === achievement.id
							)
							const isEarned = !!userAchievement

							return (
								<AchievementCard
									key={achievement.id}
									achievement={achievement}
									earnedAt={userAchievement?.earnedAt}
									isEarned={isEarned}
									index={index}
									isHovered={hoveredCard === achievement.id}
									onHover={setHoveredCard}
								/>
							)
						})}
					</AnimatePresence>
				</div>

				{filteredAchievements?.length === 0 && (
					<Card className='border-white/20 bg-slate-800/50 shadow-lg'>
						<CardContent className='flex flex-col items-center justify-center py-12 text-center sm:py-16'>
							<div className='mb-4 rounded-full bg-white/10 p-4 shadow-inner sm:p-6'>
								<Lock className='h-8 w-8 text-white/50 sm:h-12 sm:w-12' />
							</div>
							<h3 className='mb-2 text-lg font-semibold text-white sm:text-xl'>
								{t.dashboardAchievements.empty.title}
							</h3>
							<p className='mb-6 text-sm text-white/70 sm:text-base'>
								{filter === 'earned'
									? t.dashboardAchievements.empty.filterEarned
									: t.dashboardAchievements.empty.filterLocked}
							</p>
							{filter !== 'all' && (
								<Button onClick={() => setFilter('all')}>
									{t.dashboardAchievements.empty.showAll}
								</Button>
							)}
						</CardContent>
					</Card>
				)}
				</div>
	)
}

// Stat Card Component
function StatCard({
	icon: Icon,
	label,
	value,
	color,
	delay,
}: {
	icon: AppIcon
	label: string
	value: number | string
	color: 'yellow' | 'purple'
	delay: number
}) {
	const colorClasses = {
		yellow:
			'from-yellow-500/30 to-orange-500/30 border-yellow-500/30 text-yellow-400 shadow-yellow-500/20',
		purple:
			'from-purple-500/30 to-pink-500/30 border-purple-500/30 text-purple-400 shadow-purple-500/20',
	}

	return (
		<m.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay }}
			className={cn(
				'flex items-center gap-3 rounded-xl border bg-gradient-to-br p-3 shadow-lg sm:gap-4 sm:rounded-2xl sm:p-4',
				colorClasses[color]
			)}
		>
			<Icon className='h-6 w-6 sm:h-8 sm:w-8' />
			<div>
				<div className='text-xl font-bold text-white sm:text-2xl'>{value}</div>
				<div className='text-xs text-white/70 sm:text-sm'>{label}</div>
			</div>
		</m.div>
	)
}

// Achievement Card Component
function AchievementCard({
	achievement,
	earnedAt,
	isEarned,
	index,
	isHovered,
	onHover,
}: {
	achievement: IAchievement
	earnedAt?: string
	isEarned: boolean
	index: number
	isHovered: boolean
	onHover: (id: string | null) => void
}) {
	const { t } = useI18n()
	// A secret achievement's reveal is its reward, so an unearned one shows
	// neither its name nor how to get it.
	const isHiddenSecret = achievement.isSecret && !isEarned
	const tierStylesMap = tierStyles(t.dashboardAchievements)
	const tier = tierStylesMap[achievement.tier] ?? tierStylesMap.BRONZE
	const title = isHiddenSecret
		? t.dashboardAchievements.secret.title
		: achievement.title
	const description = isHiddenSecret
		? t.dashboardAchievements.secret.description
		: achievement.description

	return (
		<m.div
			layout
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-100px' }}
			transition={{
				delay: index * 0.05,
				duration: 0.7,
				ease: appleEasing,
			}}
			className='group relative h-full'
		>
			<m.div
				whileHover={{
					scale: 1.02,
					transition: {
						duration: 0.4,
						ease: appleEasing,
					},
				}}
				whileTap={{ scale: 0.98 }}
				transition={{
					scale: {
						duration: 0.6,
						ease: appleEaseOut,
					},
				}}
				onHoverStart={() => onHover(achievement.id)}
				onHoverEnd={() => onHover(null)}
				className={cn(
					'relative h-full overflow-hidden rounded-2xl border backdrop-blur-xl p-4 cursor-pointer sm:p-6',
					isEarned
						? cn('bg-gradient-to-br', tier.card)
						: 'bg-gradient-to-br from-white/[0.02] to-white/[0.01] border-white/10 opacity-60'
				)}
			>
				{/* Subtle gradient overlay */}
				<m.div
					className='absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/5 to-purple-600/10 opacity-0'
					animate={{
						opacity: isHovered && isEarned ? 1 : 0,
					}}
					transition={{
						opacity: {
							duration: isHovered ? 0.5 : 0.7,
							ease: isHovered ? appleEasing : appleEaseOut,
						},
					}}
				/>

				{/* Border highlight on hover */}
				<m.div
					className='absolute inset-0 rounded-2xl border border-purple-400/0'
					animate={{
						borderColor: isHovered
							? isEarned
								? 'color-mix(in oklab, var(--chart-purple) 30%, transparent)'
								: 'color-mix(in oklab, var(--foreground) 10%, transparent)'
							: 'transparent',
					}}
					transition={{
						borderColor: {
							duration: isHovered ? 0.4 : 0.6,
							ease: isHovered ? appleEasing : appleEaseOut,
						},
					}}
				/>

				<div className='relative flex h-full flex-col'>
					{/* Icon with subtle scale */}
					<m.div
						className='mb-4 inline-block sm:mb-5'
						animate={{
							scale: isHovered && isEarned ? 1.08 : 1,
						}}
						transition={{
							scale: {
								duration: isHovered ? 0.3 : 0.5,
								ease: isHovered ? appleEasing : appleEaseOut,
							},
						}}
					>
						{isEarned ? (
							<AchievementIcon
								slug={achievement.icon || 'trophy'}
								className={cn(
									'w-9 h-9 sm:w-11 sm:h-11 transition-all duration-500',
									tier.icon
								)}
							/>
						) : (
							<Lock
								className='w-9 h-9 sm:w-11 sm:h-11 text-white/30 transition-all duration-500'
								strokeWidth={1.5}
							/>
						)}
					</m.div>

					{/* Tier + XP reward */}
					<div className='mb-2 flex flex-wrap items-center gap-1.5'>
						<span
							className={cn(
								'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1',
								isEarned
									? tier.badge
									: 'bg-white/5 text-white/40 ring-white/10'
							)}
						>
							{tier.label}
						</span>
						{!isHiddenSecret && (
							<span
								className={cn(
									'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ring-1',
								isEarned
										? 'bg-purple-100 text-purple-800 ring-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:ring-purple-500/30'
										: 'bg-white/5 text-white/40 ring-white/10'
								)}
							>
								{t.dashboardAchievements.xpRewardTemplate.replace(
									'{xp}',
									String(achievement.xpReward)
								)}
							</span>
						)}
					</div>

					{/* Title */}
					<h3
						className={cn(
							'text-sm font-semibold mb-1.5 leading-snug tracking-tight transition-colors duration-500 ease-out sm:text-base sm:mb-2',
							isEarned
								? 'text-white group-hover:text-purple-200'
								: 'text-white/50'
						)}
					>
						{title}
					</h3>

					{/* Description */}
					<p
						className={cn(
							'text-xs mb-3 line-clamp-2 leading-relaxed transition-colors duration-500 ease-out flex-1 sm:text-sm sm:mb-4',
							isEarned
								? 'text-white/60 group-hover:text-white/70'
								: 'text-white/40'
						)}
					>
						{description}
					</p>

					{/* Date with subtle fade */}
					{isEarned && earnedAt && (
						<m.div
							initial={{ opacity: 0.4 }}
							animate={{
								opacity: isHovered ? 0.7 : 0.4,
							}}
							transition={{
								opacity: {
									duration: isHovered ? 0.3 : 0.5,
									ease: isHovered ? appleEasing : appleEaseOut,
								},
							}}
						>
							<p className='text-white/40 text-xs font-medium tracking-wide'>
								{formatDate(earnedAt)}
							</p>
						</m.div>
					)}
				</div>
			</m.div>
		</m.div>
	)
}
