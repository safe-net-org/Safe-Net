'use client'

import {
	BookOpen,
	Brain,
	FishingHook,
	Lock,
	MessageCircle,
	ShoppingBag,
	Target,
} from '@/components/ui/icons'
import { m } from 'framer-motion'

import { MOTION } from '@/config/motion.config'
import { useI18n } from '@/i18n/LocaleProvider'

const stepIcons = [BookOpen, Target, Brain]
const topicCardStyles = [
	{ icon: FishingHook, color: 'from-orange-500 to-red-600' },
	{ icon: Lock, color: 'from-emerald-500 to-teal-600' },
	{ icon: MessageCircle, color: 'from-blue-500 to-cyan-600' },
	{ icon: ShoppingBag, color: 'from-purple-500 to-pink-600' },
]

export default function HowItWorks() {
	const { t } = useI18n()
	const steps = t.howItWorksSection.steps.map((step, index) => ({
		...step,
		step: String(index + 1),
		icon: stepIcons[index],
	}))
	const topicCards = t.howItWorksSection.topicCards.map((card, index) => ({
		...card,
		...topicCardStyles[index],
	}))
	return (
		<section className='py-20'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='grid lg:grid-cols-2 gap-12 items-center'>
					<div>
						<h3 className='mb-6 text-3xl font-semibold text-foreground sm:text-4xl'>
							{t.howItWorksSection.heading}
						</h3>
						<p className='mb-8 text-lg text-muted-foreground'>
							{t.howItWorksSection.subtitle}
						</p>
						<div className='space-y-6'>
							{steps.map((item, index) => {
								const Icon = item.icon
								return (
									<div key={index} className='flex gap-4 items-start'>
										<div className='shrink-0 w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center'>
											<span className='text-white font-bold text-lg'>
												{item.step}
											</span>
										</div>
										<div className='flex-1'>
											<div className='flex items-center gap-2 mb-2'>
												<Icon className='w-5 h-5 text-indigo-400' />
												<h4 className='text-lg font-semibold text-foreground'>
													{item.title}
												</h4>
											</div>
											<p className='text-sm leading-relaxed text-muted-foreground'>
												{item.description}
											</p>
										</div>
									</div>
								)
							})}
						</div>
					</div>
					<div className='relative'>
						<div className='absolute inset-0 rounded-3xl bg-linear-to-r from-cyan-500/15 to-blue-500/15 blur-2xl'></div>
						<div className='relative rounded-2xl border border-border bg-card p-6 shadow-sm'>
							<div className='grid grid-cols-2 gap-4'>
								{topicCards.map((item, index) => {
									const Icon = item.icon
									return (
										<m.div
											key={index}
											whileHover={{
												y: -6,
												scale: 1.012,
												transition: {
													duration: MOTION.hover,
													ease: MOTION.ease,
												},
											}}
											whileTap={{ scale: 0.99 }}
											className='group cursor-pointer rounded-xl border border-border bg-background/60 p-4 shadow-sm transition-[border-color,background-color,box-shadow] duration-300 hover:border-brand/30 hover:bg-accent/60 hover:shadow-lg'
										>
											<div
												className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br ${item.color}`}
											>
												<Icon className='w-6 h-6 text-white' />
											</div>
											<div className='text-sm font-semibold text-foreground'>
												{item.name}
											</div>
											<div className='mt-1 text-xs text-muted-foreground'>
												{t.howItWorksSection.exploreTopic}
											</div>
										</m.div>
									)
								})}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
