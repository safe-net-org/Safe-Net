import { ChevronRight, Star } from '@/components/ui/icons'

import { memo } from 'react'

interface AchievementNotificationProps {
	show: boolean
	onClose: () => void
	title: string
	description: string
}

export const AchievementNotification = memo(
	({ show, onClose, title, description }: AchievementNotificationProps) => {
		if (!show) return null
		return (
			<div className='fixed top-6 right-6 z-50 animate-in slide-in-from-top-10 fade-in duration-1000 ease-out'>
				<div className='bg-linear-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-2xl border border-indigo-400/20 rounded-[20px] p-5 shadow-brand-notification max-w-sm'>
					<div className='flex items-start gap-4'>
						<div className='p-3 rounded-[14px] bg-linear-to-br from-indigo-500/15 to-purple-500/15 border border-indigo-400/25 backdrop-blur-sm shadow-lg'>
							<Star
								className='w-5 h-5 text-indigo-400 animate-pulse'
								style={{ animationDuration: '2s' }}
							/>
						</div>
						<div className='flex-1'>
							<h4 className='font-bold text-white text-sm mb-1.5 tracking-tight'>
								{title}
							</h4>
							<p className='text-xs text-slate-400 leading-relaxed font-normal'>
								{description}
							</p>
						</div>
						<button
							onClick={onClose}
							className='text-slate-400 hover:text-white transition-colors duration-500 ease-out p-1 rounded-lg hover:bg-white/5'
						>
							<ChevronRight className='w-4 h-4 rotate-90' />
						</button>
					</div>
				</div>
			</div>
		)
	}
)
AchievementNotification.displayName = 'AchievementNotification'
