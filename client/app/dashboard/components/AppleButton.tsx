import Link from 'next/link'

import { cn } from '@/lib/utils'
import { memo, type ReactNode } from 'react'

interface AppleButtonProps {
	href: string
	variant?: 'primary' | 'secondary'
	children: ReactNode
}

export const AppleButton = memo(({ href, variant = 'primary', children }: AppleButtonProps) => {
	return (
		<Link
			href={href}
			className={cn(
				'inline-flex items-center justify-center px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105',
				variant === 'primary'
					? 'bg-white text-black hover:bg-white/80'
					: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-xl border border-white/20'
			)}
		>
			{children}
		</Link>
	)
})
AppleButton.displayName = 'AppleButton'
