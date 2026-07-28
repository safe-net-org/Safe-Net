'use client'

import { m } from 'framer-motion'
import { ArrowRight, ScanSearch, ShieldCheck } from '@/components/ui/icons'

import { MOTION } from '@/config/motion.config'
import { useI18n } from '@/i18n/LocaleProvider'

const fallbackIcons = [ScanSearch, ShieldCheck, ArrowRight]

export default function Testimonials() {
	const { t } = useI18n()

	return (
		<section className='border-y border-border bg-secondary/35 py-20 sm:py-24'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='mx-auto mb-12 max-w-2xl text-center'>
					<h2 className='mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
						{t.testimonialsSection.heading}
					</h2>
					<p className='text-base leading-7 text-muted-foreground sm:text-lg'>
						{t.testimonialsSection.subtitle}
					</p>
				</div>

				<div className='grid gap-4 md:grid-cols-3'>
					{t.testimonialsSection.items.map((item, index) => {
								const Icon = fallbackIcons[index]
								return (
									<m.article
										key={item.author}
										initial={{ opacity: 0, y: 8 }}
										whileInView={{ opacity: 1, y: 0 }}
										viewport={{ once: true }}
										transition={{
											duration: MOTION.reveal,
											delay: index * MOTION.stagger,
											ease: MOTION.ease,
										}}
										className='rounded-2xl border border-border bg-card p-6 shadow-sm'
									>
										<div className='mb-8 flex items-center justify-between'>
											<span className='text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground'>
												0{index + 1}
											</span>
											<div className='flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand'>
												<Icon className='size-4.5' aria-hidden='true' />
											</div>
										</div>
										<h3 className='mb-3 text-lg font-semibold text-card-foreground'>
											{item.author}
										</h3>
										<p className='text-sm leading-6 text-muted-foreground'>
											{item.text}
										</p>
									</m.article>
								)
						})}
				</div>
			</div>
		</section>
	)
}
