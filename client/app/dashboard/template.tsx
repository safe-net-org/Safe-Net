'use client'

import { m, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { MOTION } from '@/config/motion.config'

export default function DashboardTemplate({ children }: { children: ReactNode }) {
	const reduceMotion = useReducedMotion()

	return (
		<m.div
			initial={reduceMotion ? false : { opacity: 0.15, y: 32 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: reduceMotion ? 0 : MOTION.page,
				ease: MOTION.ease,
			}}
			className='mx-auto min-h-full w-full max-w-[1600px] px-4 py-6 will-change-transform sm:px-6 sm:py-8 lg:px-8'
		>
			{children}
		</m.div>
	)
}
