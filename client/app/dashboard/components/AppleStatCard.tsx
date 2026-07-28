import { cn } from '@/lib/utils'
import { memo, type ReactNode } from 'react'

interface AppleStatCardProps {
	label: string
	value: ReactNode
	icon: ReactNode
	color: string
	iconColor?: string
}

export const AppleStatCard = memo(
	({ label, value, icon, color, iconColor }: AppleStatCardProps) => {
		return (
			<div className='group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02]'>
				<div
					className={cn(
						'absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
						color
					)}
				/>
				<div className='relative z-10 space-y-4'>
					<div className={cn('transition-colors duration-300', iconColor)}>
						{icon}
					</div>
					<div>
						<div className='text-4xl md:text-5xl font-bold tracking-tight mb-1'>
							{value}
						</div>
						<div className='text-sm font-medium text-slate-400'>{label}</div>
					</div>
				</div>
			</div>
		)
	}
)
AppleStatCard.displayName = 'AppleStatCard'
