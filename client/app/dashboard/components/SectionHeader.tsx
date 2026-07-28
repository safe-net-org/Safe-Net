import Link from 'next/link'

import { ArrowRight } from '@/components/ui/icons'

import { memo, type ReactNode } from 'react'

interface SectionHeaderProps {
	icon: ReactNode
	title: string
	subtitle: string
	actionLabel?: string
	actionHref?: string
	showAction?: boolean
}

export const SectionHeader = memo(
	({
		icon,
		title,
		subtitle,
		actionLabel,
		actionHref,
		showAction = true,
	}: SectionHeaderProps) => {
		return (
			<div className='flex items-center justify-between flex-wrap gap-4'>
				{}
				<div className='flex items-center gap-4'>
					<div className='p-3 rounded-2xl bg-linear-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/40 backdrop-blur-sm group-hover:border-indigo-500/30 group-hover:bg-linear-to-br group-hover:from-slate-800/60 group-hover:to-indigo-500/10 group-hover:scale-105 transition-all duration-500 ease-out shadow-lg shadow-black/10'>
						{icon}
					</div>
					<div>
						<h2 className='text-xl md:text-2xl font-bold text-white tracking-tight transition-all duration-500 ease-out drop-shadow-sm'>
							{title}
						</h2>
						<p className='text-sm text-slate-400 mt-1 transition-colors duration-500 font-medium'>
							{subtitle}
						</p>
					</div>
				</div>
				{showAction && actionLabel && actionHref && (
					<Link
						href={actionHref}
						className='group/btn inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-linear-to-r from-white/6 to-white/4 hover:from-white/12 hover:to-white/8 border border-white/8 hover:border-white/15 backdrop-blur-xl text-sm font-semibold text-slate-300 hover:text-white transition-all duration-500 ease-out hover-shadow-foreground hover:scale-[1.02] active:scale-[0.98]'
					>
						<span className='relative'>
							{actionLabel}
							<span className='absolute inset-x-0 -bottom-0.5 h-px bg-linear-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500' />
						</span>
						<ArrowRight className='w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-300 ease-out' />
					</Link>
				)}
			</div>
		)
	}
)
SectionHeader.displayName = 'SectionHeader'
