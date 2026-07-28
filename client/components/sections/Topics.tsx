'use client'

import { useHomeData } from '@/hooks/learning/useHomeData'
import { TOPIC_COLOR_BY_SLUG, TOPIC_COLORS } from '@/config/colors.config'
import { useI18n } from '@/i18n/LocaleProvider'
import { translateStageCopy } from '@/i18n/content-translations'
import { selectPlural } from '@/i18n/plural'
import { m } from 'framer-motion'
import * as icons from '@/components/ui/icons'
import { AppIcon, Shield } from '@/components/ui/icons'
import { MOTION } from '@/config/motion.config'

// Function to get an icon by slug
const getIconBySlug = (slug: string): AppIcon => {
	// Convert a stored icon slug to the matching Phosphor compatibility name.
	// Example: 'dangerous-links' -> 'DangerousLinks'
	const pascalCase = slug
		.split('-')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('')

	// Indexed off lucide's own export map rather than cast through
	// Record<string, AppIcon>: the module also exports non-icon members, so
	// that cast is a lie TypeScript rightly rejects.
	const icon = icons[pascalCase as keyof typeof icons]

	// Return the found icon or Shield as a fallback
	return (icon as AppIcon) || Shield
}

export default function Topics() {
	const { stages, isStagesLoading } = useHomeData()
	const { t, locale } = useI18n()

	if (isStagesLoading) {
		return (
			<section id='topics' className='border-y border-border bg-secondary/35 py-20'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
						{[...Array(8)].map((_, i) => (
							<div
								key={i}
								className='min-h-[150px] animate-pulse rounded-xl border border-border bg-card p-5'
							/>
						))}
					</div>
				</div>
			</section>
		)
	}

	return (
		<section id='topics' className='border-y border-border bg-secondary/35 py-20'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='text-center mb-14'>
					<h3 className='mb-4 text-3xl font-semibold text-foreground sm:text-4xl'>
						{t.topicsSection.heading}
					</h3>
					<p className='mx-auto max-w-2xl text-lg text-muted-foreground'>
						{t.topicsSection.subtitle}
					</p>
				</div>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
					{stages.map((stage, index) => {
						// Get the icon dynamically by slug from stage.icon or stage.slug
						const Icon = getIconBySlug(stage.icon || stage.slug)

						// Pick a color by slug (consistent) or by index (cyclical)
						const strokeColor =
							TOPIC_COLOR_BY_SLUG[stage.slug] || TOPIC_COLORS[index % TOPIC_COLORS.length]

						const stageCopy = translateStageCopy(locale, stage.title, stage.subtitle ?? '')

						return (
							<m.div
								key={stage.id}
								initial={{ opacity: 0, y: 6 }}
								whileInView={{ opacity: 1, y: 0 }}
								whileHover={{
									y: -6,
									scale: 1.012,
									transition: {
										duration: MOTION.hover,
										ease: MOTION.ease,
									},
								}}
								viewport={{ once: true }}
								transition={{
									duration: MOTION.reveal,
									delay: index * 0.035,
									ease: MOTION.ease,
								}}
								className='h-full'
							>
								<div className='group relative h-full min-h-[150px] overflow-hidden rounded-xl border border-foreground/15 bg-card p-5 text-card-foreground shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-brand/40 hover:shadow-lg'>
									<div
										className='absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
										style={{
											background: `radial-gradient(circle at top right, color-mix(in oklab, ${strokeColor} 69%, transparent) 0%, transparent 70%)`,
										}}
									/>
									<div className='relative flex flex-col justify-between h-full'>
										<div>
											<div className='flex items-center justify-between mb-3'>
												<div className='text-5xl drop-shadow-sm'>
													<Icon
														size={34}
														stroke={strokeColor}
														strokeWidth={1.5}
													/>
												</div>
												<div className='text-sm text-muted-foreground'>
													{stage.totalLessons}{' '}
													{selectPlural(locale, stage.totalLessons, {
														one: t.topicsSection.lessonWordOne,
														few: t.topicsSection.lessonWordFew,
														many: t.topicsSection.lessonWordMany,
													})}
												</div>
											</div>
											<h4 className='text-lg font-semibold tracking-wide text-card-foreground transition-colors duration-300 group-hover:text-brand'>
												{stageCopy.title}
											</h4>
											<p className='mt-1 text-sm text-muted-foreground'>
												{stageCopy.subtitle}
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
