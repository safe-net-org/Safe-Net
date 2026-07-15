'use client'

import { useHomeData } from '@/hooks/learning/useHomeData'
import { m } from 'framer-motion'
import * as icons from 'lucide-react'
import { LucideIcon, Shield } from 'lucide-react'

// Color palette for stages
const colorPalette = [
	'#3b82f6', // blue
	'#ec4899', // pink
	'#8b5cf6', // purple
	'#f59e0b', // amber
	'#10b981', // emerald
	'#06b6d4', // cyan
	'#f97316', // orange
	'#6366f1', // indigo
]

// Color mapping by slug for consistency
const colorMap: Record<string, string> = {
	basics: '#3b82f6', // blue
	phishing: '#ec4899', // pink
	'dangerous-links': '#f59e0b', // amber
	passwords: '#8b5cf6', // purple
	malware: '#ef4444', // red
	'social-media': '#06b6d4', // cyan
	privacy: '#10b981', // emerald
	advanced: '#f97316', // orange
}

// Function to get an icon by slug
const getIconBySlug = (slug: string): LucideIcon => {
	// Convert slug to PascalCase for lucide-react
	// Example: 'dangerous-links' -> 'DangerousLinks'
	const pascalCase = slug
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('')

	// Indexed off lucide's own export map rather than cast through
	// Record<string, LucideIcon>: the module also exports non-icon members, so
	// that cast is a lie TypeScript rightly rejects.
	const icon = icons[pascalCase as keyof typeof icons]

	// Return the found icon or Shield as a fallback
	return (icon as LucideIcon) || Shield
}

export default function Topics() {
	const { stages, isStagesLoading } = useHomeData()

	if (isStagesLoading) {
		return (
			<section id='topics' className='py-20 bg-slate-800/30'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
						{[...Array(8)].map((_, i) => (
							<div
								key={i}
								className='bg-slate-800/70 rounded-xl p-5 border border-slate-700 min-h-[150px] animate-pulse'
							/>
						))}
					</div>
				</div>
			</section>
		)
	}

	return (
		<section id='topics' className='py-20 bg-slate-800/30'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='text-center mb-14'>
					<h3 className='text-3xl sm:text-4xl font-bold text-white mb-4'>
						Learning Stages
					</h3>
					<p className='text-lg text-slate-400 max-w-2xl mx-auto'>
						Explore different aspects of cybersecurity step by step
					</p>
				</div>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
					{stages.map((stage, index) => {
						// Get the icon dynamically by slug from stage.icon or stage.slug
						const Icon = getIconBySlug(stage.icon || stage.slug)

						// Pick a color by slug (consistent) or by index (cyclical)
						const strokeColor =
							colorMap[stage.slug] || colorPalette[index % colorPalette.length]

						return (
							<m.div
								key={stage.id}
								initial={{ opacity: 0, y: 30, scale: 0.95 }}
								whileInView={{ opacity: 1, y: 0, scale: 1 }}
								viewport={{ once: true }}
								transition={{
									duration: 0.5,
									delay: index * 0.1,
									ease: [0.25, 0.8, 0.25, 1],
								}}
							>
								<div className='relative overflow-hidden bg-slate-800/70 rounded-xl p-5 border border-slate-700 group transition-all duration-500 ease-out hover:border-transparent hover:shadow-2xl hover:shadow-indigo-500/25 hover:-translate-y-3 hover:scale-[1.03] hover:bg-linear-to-br hover:from-slate-800/80 hover:to-slate-700/60 min-h-[150px]'>
									<div
										className='absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 blur-2xl'
										style={{
											background: `radial-gradient(circle at top right, ${strokeColor}B0 0%, transparent 70%)`,
										}}
									/>
									<div className='relative flex flex-col justify-between h-full'>
										<div>
											<div className='flex items-center justify-between mb-3'>
												<m.div
													whileHover={{
														rotate: [0, 5, -5, 0],
														scale: 1.15,
														transition: { duration: 0.5 },
													}}
													className='text-5xl drop-shadow-sm'
												>
													<Icon
														size={34}
														stroke={strokeColor}
														strokeWidth={1.5}
													/>
												</m.div>
												<div className='text-sm text-slate-400'>
													{stage.totalLessons}{' '}
													{stage.totalLessons === 1 ? 'lesson' : 'lessons'}
												</div>
											</div>
											<h4 className='text-lg font-semibold text-white tracking-wide group-hover:text-indigo-300 transition-colors duration-300'>
												{stage.title}
											</h4>
											<p className='text-sm text-slate-400 mt-1'>
												{stage.subtitle}
											</p>
										</div>
									</div>
								</div>
							</m.div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
