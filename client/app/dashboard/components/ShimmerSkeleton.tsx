import { cn } from '@/lib/utils'
import { memo } from 'react'

export const ShimmerSkeleton = memo(
	({
		height = 'h-48',
		variant = 'card',
	}: {
		height?: string
		variant?: 'card' | 'compact'
	}) => {
		return (
			<div
				className={cn(
					'relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-slate-700/40',
					height
				)}
			>
				<div className='absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] bg-linear-to-r from-transparent via-slate-600/10 to-transparent' />
				{variant === 'compact' ? (
					<>
						<div className='absolute left-4 top-1/2 size-10 -translate-y-1/2 rounded-xl bg-slate-800/40 backdrop-blur-sm animate-pulse' />
						<div
							className='absolute left-16 right-5 top-[30px] h-3 rounded-full bg-slate-800/40 backdrop-blur-sm animate-pulse'
							style={{ animationDelay: '0.2s' }}
						/>
						<div
							className='absolute left-16 right-14 top-[52px] h-2 rounded-full bg-slate-800/40 backdrop-blur-sm animate-pulse'
							style={{ animationDelay: '0.4s' }}
						/>
					</>
				) : (
					<>
						<div className='absolute top-5 left-5 w-14 h-14 rounded-2xl bg-slate-800/40 backdrop-blur-sm animate-pulse' />
						<div
							className='absolute top-5 right-5 w-20 h-7 rounded-[12px] bg-slate-800/40 backdrop-blur-sm animate-pulse'
							style={{ animationDelay: '0.2s' }}
						/>
						<div
							className='absolute bottom-5 left-5 right-5 h-2.5 rounded-full bg-slate-800/40 backdrop-blur-sm animate-pulse'
							style={{ animationDelay: '0.4s' }}
						/>
					</>
				)}
			</div>
		)
	}
)
ShimmerSkeleton.displayName = 'ShimmerSkeleton'
