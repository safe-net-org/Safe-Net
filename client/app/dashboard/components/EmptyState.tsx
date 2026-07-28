import Link from 'next/link'

import { ChevronRight } from '@/components/ui/icons'

import { Button } from '@/components/ui/button'
import { memo, type ReactNode } from 'react'

interface EmptyStateProps {
	icon: ReactNode
	title: string
	description: string
	actionLabel?: string
	actionHref?: string
}

export const EmptyState = memo(
	({ icon, title, description, actionLabel, actionHref }: EmptyStateProps) => {
		return (
			<div className='col-span-full relative rounded-[28px] overflow-hidden border border-dashed border-slate-700/50 bg-linear-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 backdrop-blur-xl p-10 md:p-14 text-center hover:border-slate-600/60 transition-all duration-1000 ease-out group'>
				<div className='absolute top-0 left-1/4 w-80 h-80 bg-indigo-500/3 rounded-full blur-3xl group-hover:bg-indigo-500/5 transition-all duration-1000 ease-out' />
				<div className='absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/3 rounded-full blur-3xl group-hover:bg-purple-500/5 transition-all duration-1000 ease-out' />
				<div className='relative z-10'>
					<div className='mx-auto w-24 h-24 rounded-[20px] bg-linear-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center mb-7 group-hover:scale-105 group-hover:rotate-2 group-hover:border-slate-600/60 transition-all duration-1000 ease-out shadow-xl shadow-black/10 relative overflow-hidden'>
						<div className='absolute inset-0 bg-linear-to-br from-indigo-500/4 to-purple-500/4 opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
						<div className='relative z-10 text-slate-500 group-hover:text-slate-400 transition-colors duration-500'>
							{icon}
						</div>
					</div>
					<h3 className='text-xl md:text-2xl font-bold text-foreground mb-4 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-700 ease-out'>
						{title}
					</h3>
					<p className='text-slate-400 group-hover:text-slate-300 mb-10 max-w-md mx-auto text-sm md:text-base leading-relaxed transition-colors duration-500 font-normal'>
						{description}
					</p>
					{actionLabel && actionHref && (
						<Button
							variant='default'
							className='relative bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover-shadow-brand transition-all duration-700 ease-out hover:scale-105 border-0 overflow-hidden group/btn rounded-[14px] px-6 py-3 font-semibold'
							asChild
						>
							<Link
								href={actionHref}
								className='inline-flex items-center gap-2.5'
							>
								<div className='absolute inset-0 bg-linear-to-r from-purple-600 to-pink-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-1000 ease-out' />
								<span className='relative z-10'>{actionLabel}</span>
								<ChevronRight className='relative z-10 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-700 ease-out' />
							</Link>
						</Button>
					)}
				</div>
			</div>
		)
	}
)
EmptyState.displayName = 'EmptyState'
