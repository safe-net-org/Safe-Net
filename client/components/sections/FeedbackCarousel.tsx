'use client'

import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Star } from '@/components/ui/icons'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { MOTION } from '@/config/motion.config'
import { useI18n } from '@/i18n/LocaleProvider'
import { feedbackService } from '@/services/feedback/feedback.service'
import { cn } from '@/lib/utils'

export default function FeedbackCarousel() {
	const { t, locale } = useI18n()
	const reduceMotion = useReducedMotion()
	const { data: reviews = [] } = useQuery({
		queryKey: ['featured-feedback'],
		queryFn: () => feedbackService.getFeatured(),
		staleTime: 60_000,
	})
	const [active, setActive] = useState(0)
	const [direction, setDirection] = useState(1)
	const [paused, setPaused] = useState(false)

	useEffect(() => {
		if (reviews.length < 2 || paused || reduceMotion) return
		const timer = window.setInterval(() => {
			setDirection(1)
			setActive(current => (current + 1) % reviews.length)
		}, 6000)
		return () => window.clearInterval(timer)
	}, [paused, reduceMotion, reviews.length])

	if (reviews.length === 0) return null
	const review = reviews[Math.min(active, reviews.length - 1)]

	const move = (nextDirection: number) => {
		setDirection(nextDirection)
		setActive(current =>
			(current + nextDirection + reviews.length) % reviews.length
		)
	}

	return (
		<section
			className='border-y border-border bg-secondary/35 py-20 sm:py-24'
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocusCapture={() => setPaused(true)}
			onBlurCapture={() => setPaused(false)}
		>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='mx-auto mb-12 max-w-2xl text-center'>
					<h2 className='mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
						{t.feedbackLanding.heading}
					</h2>
					<p className='text-base leading-7 text-muted-foreground sm:text-lg'>
						{t.feedbackLanding.subtitle}
					</p>
				</div>

				<div className='mx-auto max-w-4xl'>
					<div className='relative min-h-72 overflow-hidden rounded-3xl border border-border bg-card shadow-sm'>
						<AnimatePresence initial={false} custom={direction} mode='wait'>
							<m.article
								key={review.id}
								custom={direction}
								initial={
									reduceMotion
										? { opacity: 0 }
										: { opacity: 0, x: direction * 72 }
								}
								animate={{ opacity: 1, x: 0 }}
								exit={
									reduceMotion
										? { opacity: 0 }
										: { opacity: 0, x: direction * -72 }
								}
								transition={{
									duration: reduceMotion ? 0 : MOTION.carousel,
									ease: MOTION.ease,
								}}
								drag={reviews.length > 1 && !reduceMotion ? 'x' : false}
								dragConstraints={{ left: 0, right: 0 }}
								dragElastic={0.12}
								onDragEnd={(_, info) => {
									if (Math.abs(info.offset.x) < 45) return
									move(info.offset.x < 0 ? 1 : -1)
								}}
								className='absolute inset-0 flex cursor-grab flex-col items-center justify-center px-7 py-10 text-center active:cursor-grabbing sm:px-14'
							>
								<div className='mb-7 flex gap-1' aria-label={`${review.rating}/5`}>
									{[1, 2, 3, 4, 5].map(value => (
										<Star
											key={value}
											className={cn(
												'size-5',
												value <= review.rating
													? 'fill-amber-400 text-amber-400'
													: 'text-muted-foreground/30'
											)}
										/>
									))}
								</div>
								<blockquote className='max-w-3xl text-lg leading-8 text-card-foreground sm:text-xl'>
									“{review.message}”
								</blockquote>
								<footer className='mt-7'>
									<p className='font-semibold text-card-foreground'>
										{review.authorName}
									</p>
									<p className='mt-1 text-xs text-muted-foreground'>
										{new Intl.DateTimeFormat(locale, {
											dateStyle: 'medium',
										}).format(new Date(review.createdAt))}
									</p>
								</footer>
							</m.article>
						</AnimatePresence>
					</div>

					{reviews.length > 1 && (
						<div className='mt-6 flex items-center justify-center gap-4'>
							<Button
								variant='outline'
								size='icon'
								onClick={() => move(-1)}
								aria-label={t.feedbackLanding.previous}
								className='rounded-full'
							>
								<ArrowLeft className='size-4' />
							</Button>
							<div className='flex items-center gap-2'>
								{reviews.map((item, index) => (
									<button
										key={item.id}
										type='button'
										onClick={() => {
											setDirection(index > active ? 1 : -1)
											setActive(index)
										}}
										aria-label={`${index + 1} / ${reviews.length}`}
										aria-current={index === active}
										className={cn(
											'h-2 rounded-full transition-[width,background-color] duration-500',
											index === active
												? 'w-8 bg-brand'
												: 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
										)}
									/>
								))}
							</div>
							<Button
								variant='outline'
								size='icon'
								onClick={() => move(1)}
								aria-label={t.feedbackLanding.next}
								className='rounded-full'
							>
								<ArrowRight className='size-4' />
							</Button>
						</div>
					)}
				</div>
			</div>
		</section>
	)
}
