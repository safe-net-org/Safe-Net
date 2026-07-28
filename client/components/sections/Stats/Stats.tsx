'use client'

import { usePublicStats } from '@/hooks/public/usePublicStats'
import { useI18n } from '@/i18n/LocaleProvider'
import { animate, m, useInView, useMotionValue, useReducedMotion } from 'framer-motion'
import { BookOpen, CheckCircle, Info, Target, Users } from '@/components/ui/icons'
import { useEffect, useRef, useState } from 'react'
import { IStatItem } from './stats.interface'
import { MOTION } from '@/config/motion.config'

function AnimatedNumber({
	value,
	suffix = '',
	duration = 1.5,
}: {
	value: number
	suffix?: string
	duration?: number
}) {
	const count = useMotionValue(0)
	const reduceMotion = useReducedMotion()
	const [display, setDisplay] = useState('0' + suffix)

	useEffect(() => {
		const unsubscribe = count.on('change', v => {
			const n = Math.floor(v)
			setDisplay(n.toLocaleString() + suffix)
		})
		const controls = animate(count, value, {
			duration: reduceMotion ? 0 : duration,
			ease: [0.22, 1, 0.36, 1],
		})
		return () => {
			unsubscribe()
			controls.stop()
		}
	}, [count, value, suffix, duration, reduceMotion])

	return <span>{display}</span>
}

function StatItem({ icon: Icon, label, value, suffix, index }: IStatItem) {
	const ref = useRef(null)
	const isInView = useInView(ref, { once: true, margin: '-20% 0px' })

	return (
		<m.div
			ref={ref}
			initial={{ opacity: 0, y: 8 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{
				duration: MOTION.reveal,
				delay: index * MOTION.stagger,
				ease: MOTION.ease,
			}}
			className='text-center'
		>
			<m.div
				whileHover={{ y: -1 }}
				transition={{ duration: MOTION.hover, ease: MOTION.ease }}
				className='mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand'
			>
				<Icon className='size-5' aria-hidden='true' />
			</m.div>
			<div className='mb-1 text-3xl font-semibold tabular-nums text-foreground'>
				{isInView ? (
					<AnimatedNumber value={value} suffix={suffix} duration={1.6} />
				) : (
					<span>0{suffix}</span>
				)}
			</div>
			<div className='text-sm text-muted-foreground'>{label}</div>
		</m.div>
	)
}

export default function Stats() {
	const { stats, isLoading, error } = usePublicStats()
	const { t } = useI18n()

	// Mapping API data to stats
	const statsData = [
		{
			label: t.statsSection.activeUsers,
			value: stats?.totalUsers ?? 0,
			icon: Users,
		},
		{
			label: t.statsSection.tasksCompleted,
			value: stats?.totalTasks ?? 0,
			icon: CheckCircle,
		},
		{
			label: t.statsSection.averageAccuracy,
			value: stats?.averageAccuracy ?? 0,
			suffix: '%',
			icon: Target,
		},
		{
			label: t.statsSection.coursesAvailable,
			value: stats?.totalLessons ?? 0,
			icon: BookOpen,
		},
	]

	// Skeleton loader
	if (isLoading) {
		return (
			<section id='stats' className='border-y border-border bg-secondary/35 py-16'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='grid grid-cols-2 gap-6 lg:grid-cols-4'>
						{[...Array(4)].map((_, i) => (
							<div key={i} className='animate-pulse text-center'>
								<div className='mx-auto mb-3 size-11 rounded-xl bg-muted' />
								<div className='mx-auto mb-1 h-8 w-24 rounded bg-muted' />
								<div className='mx-auto h-4 w-32 rounded bg-muted' />
							</div>
						))}
					</div>
				</div>
			</section>
		)
	}

	if (error || !stats) {
		return (
			<section id='stats' className='border-y border-border bg-secondary/35 py-12'>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div
						className='mx-auto flex max-w-xl items-center justify-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm'
						role='status'
					>
						<Info className='size-4 shrink-0 text-brand' aria-hidden='true' />
						<span>{t.statsSection.unavailable}</span>
					</div>
				</div>
			</section>
		)
	}

	return (
		<section id='stats' className='border-y border-border bg-secondary/35 py-16'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='grid grid-cols-2 gap-6 lg:grid-cols-4'>
					{statsData.map((stat, index) => (
						<StatItem key={stat.label} {...stat} index={index} />
					))}
				</div>
			</div>
		</section>
	)
}
