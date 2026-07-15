'use client'

import { formatDate } from '@/utils/date-time/dateFormatter'
import { m } from 'framer-motion'
import * as icons from 'lucide-react'
import { LucideIcon, Trophy } from 'lucide-react'

interface Achievement {
	id: string
	title: string
	description: string
	icon: string
	earnedAt: string // Renamed from unlockedAt to earnedAt
}

interface UserAchievementsBlockProps {
	achievements: Achievement[]
}

// Apple-style easing curves
// `as const` matters: without it these widen to number[], which framer-motion's
// Easing type rejects — it wants a fixed 4-tuple.
const appleEasing = [0.42, 0, 0.58, 1] as const
const appleEaseOut = [0.16, 1, 0.3, 1] as const

// Get an icon component by slug
const getIconBySlug = (slug: string): LucideIcon => {
	const pascalCase = slug
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('')

	// Indexed off lucide's own export map rather than cast through
	// Record<string, LucideIcon>: the module also exports non-icon members, so
	// that cast is a lie TypeScript rightly rejects.
	const icon = icons[pascalCase as keyof typeof icons]
	return (icon as LucideIcon) || Trophy
}

export default function UserAchievementsBlock({
	achievements,
}: UserAchievementsBlockProps) {
	if (!achievements || achievements.length === 0) {
		return (
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, ease: appleEasing }}
				className='flex flex-col items-center justify-center py-20 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/5'
			>
				<m.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.6, ease: appleEasing }}
					className='w-20 h-20 rounded-3xl bg-linear-to-br from-white/10 to-white/5 flex items-center justify-center mb-5'
				>
					<Trophy className='w-10 h-10 text-white/20' />
				</m.div>
				<m.h3
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.6, ease: appleEasing }}
					className='text-lg font-bold text-white mb-2'
				>
					No achievements
				</m.h3>
				<m.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.6, ease: appleEasing }}
					className='text-white/50 text-sm'
				>
					Achievements will appear after completing certain tasks
				</m.p>
			</m.div>
		)
	}

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
			{achievements.map((achievement, idx) => {
				const formattedDate =
					formatDate(achievement.earnedAt, {
						format: 'date-medium',
						locale: 'en-US',
						gracefulFail: true,
					}) || 'Date unknown'

				const Icon = getIconBySlug(achievement.icon || 'trophy')

				return (
					<m.div
						key={achievement.id}
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-100px' }}
						transition={{
							delay: idx * 0.05,
							duration: 0.7,
							ease: appleEasing,
						}}
						className='group relative'
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
							className='relative bg-linear-to-br from-purple-500/5 to-purple-600/5 border border-purple-500/20 backdrop-blur-xl rounded-2xl p-6 overflow-hidden cursor-pointer'
						>
							{/* Subtle gradient overlay */}
							<m.div
								className='absolute inset-0 bg-linear-to-br from-purple-500/0 via-purple-500/5 to-purple-600/10 opacity-0'
								whileHover={{
									opacity: 1,
									transition: { duration: 0.5, ease: appleEasing },
								}}
								transition={{
									opacity: {
										duration: 0.7,
										ease: appleEaseOut,
									},
								}}
							/>

							{/* Border highlight on hover */}
							<m.div
								className='absolute inset-0 rounded-2xl border border-purple-400/0'
								whileHover={{
									borderColor: 'rgba(168, 85, 247, 0.3)',
									transition: { duration: 0.4, ease: appleEasing },
								}}
								transition={{
									borderColor: {
										duration: 0.6,
										ease: appleEaseOut,
									},
								}}
							/>

							<div className='relative'>
								{/* Icon with subtle scale */}
								<m.div
									className='mb-5 inline-block'
									whileHover={{
										scale: 1.08,
										transition: {
											duration: 0.3,
											ease: appleEasing,
										},
									}}
									transition={{
										scale: {
											duration: 0.5,
											ease: appleEaseOut,
										},
									}}
								>
									<Icon
										className='w-11 h-11 text-purple-400 transition-all duration-500'
										strokeWidth={1.5}
									/>
								</m.div>

								{/* Title */}
								<h3 className='font-semibold text-white text-base mb-2 leading-snug tracking-tight transition-colors duration-500 ease-out group-hover:text-purple-200'>
									{achievement.title}
								</h3>

								{/* Description */}
								<p className='text-white/60 text-sm mb-4 line-clamp-2 leading-relaxed transition-colors duration-500 ease-out group-hover:text-white/70'>
									{achievement.description}
								</p>

								{/* Date with subtle fade */}
								<m.div
									initial={{ opacity: 0.4 }}
									whileHover={{
										opacity: 0.7,
										transition: { duration: 0.3 },
									}}
									transition={{
										opacity: {
											duration: 0.5,
											ease: appleEaseOut,
										},
									}}
								>
									<p className='text-white/40 text-xs font-medium tracking-wide'>
										{formattedDate}
									</p>
								</m.div>
							</div>
						</m.div>
					</m.div>
				)
			})}
		</div>
	)
}
