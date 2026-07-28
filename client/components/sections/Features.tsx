'use client'

import { m } from 'framer-motion'
import { Smartphone, Sparkles, Target } from '@/components/ui/icons'

import { useI18n } from '@/i18n/LocaleProvider'
import { features } from '@/lib/data'
import { MOTION } from '@/config/motion.config'

const featureAccents = [
	'from-blue-500 to-cyan-500',
	'from-purple-500 to-indigo-500',
	'from-emerald-500 to-teal-500',
	'from-amber-500 to-orange-500',
	'from-fuchsia-500 to-purple-500',
	'from-slate-500 to-slate-700',
] as const

export default function Features() {
	const { t } = useI18n()

	return (
		<section id='features' className='py-20 sm:py-24'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='mx-auto mb-12 max-w-2xl text-center sm:mb-14'>
					<h2 className='mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
						{t.featuresSection.heading}
					</h2>
					<p className='text-base leading-7 text-muted-foreground sm:text-lg'>
						{t.featuresSection.subtitle}
					</p>
				</div>
				<div className='grid auto-rows-fr gap-4 md:grid-cols-2 lg:grid-cols-3'>
					{features.map((feature, index) => {
						const Icon = feature.icon
						const copy = t.featuresSection.items[index]
						const accent = featureAccents[index]

						return (
							<m.article
								key={index}
								initial={{ opacity: 0, y: 6 }}
								whileInView={{ opacity: 1, y: 0 }}
								whileHover={{ y: -4 }}
								viewport={{ once: true }}
								transition={{
									duration: MOTION.reveal,
									delay: index * 0.035,
									ease: MOTION.ease,
								}}
								className='group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm transition-[border-color,box-shadow] duration-300 ease-out hover:border-brand/30 hover:shadow-lg'
							>
								<div
									className={`pointer-events-none absolute inset-0 bg-linear-to-br ${accent} opacity-0 transition-opacity duration-300 group-hover:opacity-[0.07]`}
									aria-hidden='true'
								/>
								<div className='mb-5 flex items-center justify-between gap-3'>
								<div
									data-inverse
									className={`relative flex size-12 items-center justify-center rounded-xl bg-linear-to-br ${accent} text-white shadow-sm`}
								>
										<Icon
											className='size-6 text-white'
											strokeWidth={1.8}
											aria-hidden='true'
										/>
									</div>
									<span className='relative rounded-full border border-border bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground'>
										{copy.highlight}
									</span>
								</div>
								<h3 className='relative mb-2 text-lg font-semibold tracking-tight'>
									{copy.title}
								</h3>
								<p className='relative mb-5 flex-1 text-sm leading-6 text-muted-foreground'>
									{copy.description}
								</p>
								<div className='relative flex items-center gap-2 border-t border-border pt-4 text-xs font-medium text-muted-foreground'>
									<Sparkles className='size-3.5 text-brand' aria-hidden='true' />
									<span>{copy.stats}</span>
								</div>
							</m.article>
						)
					})}
				</div>
				<div className='mt-6 grid gap-4 md:grid-cols-2'>
					<m.div
						initial={{ opacity: 0, y: 8 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: MOTION.standard, ease: MOTION.ease }}
						viewport={{ once: true }}
						className='flex items-start gap-4 rounded-2xl border border-border bg-secondary/60 p-6'
					>
						<div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-brand shadow-sm'>
							<Target className='size-5' aria-hidden='true' />
						</div>
						<div>
							<h3 className='mb-1 font-semibold text-foreground'>
								{t.featuresSection.adaptive.title}
							</h3>
							<p className='text-sm leading-6 text-muted-foreground'>
								{t.featuresSection.adaptive.body}
							</p>
						</div>
					</m.div>
					<m.div
						initial={{ opacity: 0, y: 8 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: MOTION.standard, delay: MOTION.stagger, ease: MOTION.ease }}
						viewport={{ once: true }}
						className='flex items-start gap-4 rounded-2xl border border-border bg-secondary/60 p-6'
					>
						<div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-brand shadow-sm'>
							<Smartphone className='size-5' aria-hidden='true' />
						</div>
						<div>
							<h3 className='mb-1 font-semibold text-foreground'>
								{t.featuresSection.alwaysWithYou.title}
							</h3>
							<p className='text-sm leading-6 text-muted-foreground'>
								{t.featuresSection.alwaysWithYou.body}
							</p>
						</div>
					</m.div>
				</div>
			</div>
		</section>
	)
}
