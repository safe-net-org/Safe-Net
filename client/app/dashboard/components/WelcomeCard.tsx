import { GraduationCap, Sparkles } from '@/components/ui/icons'

import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/i18n/LocaleProvider'
import { memo } from 'react'

interface WelcomeCardProps {
	greeting: string
	userName: string
	message: string
}

export const WelcomeCard = memo(({ greeting, userName, message }: WelcomeCardProps) => {
	const { t } = useI18n()
	return (
		<div className='lg:col-span-3 relative overflow-hidden rounded-3xl md:rounded-[28px] bg-linear-to-br from-indigo-600/10 via-purple-600/5 to-transparent border border-white/4 backdrop-blur-xl p-8 md:p-10 flex flex-col justify-center group hover:border-white/8 transition-all duration-700 ease-out hover-shadow-brand-wide hover:scale-[1.01]'>
			{}
			<div className='absolute inset-0 bg-linear-to-br from-white/2 via-transparent to-white/1 opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
			<div className='absolute inset-0 dashboard-brand-radial opacity-0 group-hover:opacity-100 transition-opacity duration-700' />
			{}
			<div className='absolute inset-0 overflow-hidden'>
				<div
					className='absolute top-[15%] left-[10%] w-1.5 h-1.5 bg-indigo-400/20 rounded-full animate-ping'
					style={{ animationDuration: '4s' }}
				/>
				<div
					className='absolute top-[25%] right-[15%] w-1 h-1 bg-purple-400/20 rounded-full animate-ping'
					style={{ animationDuration: '3.5s', animationDelay: '1.2s' }}
				/>
				<div
					className='absolute bottom-[30%] left-[30%] w-1 h-1 bg-pink-400/20 rounded-full animate-ping'
					style={{ animationDuration: '3s', animationDelay: '0.8s' }}
				/>
			</div>
			{}
			<div className='absolute -top-4 -right-4 md:top-4 md:right-4 p-6 md:p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-1000 ease-out'>
				<GraduationCap className='w-40 h-40 md:w-56 md:h-56 text-indigo-400 rotate-12 group-hover:rotate-6 group-hover:scale-105 transition-all duration-1000 ease-out' />
			</div>
			<div className='relative z-10 space-y-4'>
				<Badge
					variant='outline'
					className='w-fit border-indigo-300/60 bg-indigo-100/80 px-3 py-1 text-indigo-800 shadow-sm transition-all duration-500 ease-out hover:scale-105 hover:bg-indigo-100 dark:border-indigo-400/20 dark:bg-indigo-500/8 dark:text-indigo-300 dark:hover:bg-indigo-500/12 backdrop-blur-sm cursor-default'
				>
					<Sparkles className='w-3.5 h-3.5 mr-2 inline animate-pulse' />
					<span className='font-medium text-sm'>{greeting}</span>
				</Badge>
				<h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight animate-in fade-in slide-in-from-left-6 duration-1000 ease-out'>
					{t.dashboardHome.hi}
					<span className='text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400 inline-block ml-3'>
						{userName}
					</span>
					!
				</h1>
				<p className='text-slate-400 max-w-lg text-base md:text-lg leading-relaxed animate-in fade-in slide-in-from-left-6 duration-1000 delay-150 ease-out font-normal'>
					{message}
				</p>
			</div>
		</div>
	)
})
WelcomeCard.displayName = 'WelcomeCard'
