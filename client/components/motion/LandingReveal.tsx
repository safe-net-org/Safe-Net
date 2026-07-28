'use client'

import { m, useReducedMotion } from 'framer-motion'
import type { PropsWithChildren } from 'react'

import { MOTION } from '@/config/motion.config'

export function LandingReveal({ children }: PropsWithChildren) {
	const reduceMotion = useReducedMotion()

	return (
		<m.div
			initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.04 }}
			transition={{
				duration: reduceMotion ? 0.38 : MOTION.landing,
				ease: MOTION.ease,
			}}
		>
			{children}
		</m.div>
	)
}
