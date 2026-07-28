'use client'
import { ArrowRight, Play, ShieldCheck, Sparkles } from '@/components/ui/icons'

import { useI18n } from '@/i18n/LocaleProvider'
import { AuthDialog } from '../Auth/AuthDialog'
import DemoCard from './DemoCard'

export default function Hero() {
	const { t } = useI18n()
	return (
		<section className='relative overflow-hidden'>
			<div className='absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10'></div>
			<div className='absolute inset-0'>
				<div className='absolute left-20 top-20 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl'></div>
				<div
					className='absolute bottom-20 right-20 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl'
				></div>
			</div>
			<div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32'>
				<div className='grid lg:grid-cols-2 gap-12 items-center'>
					<div>
						<div className='inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-6'>
							<Sparkles className='w-4 h-4 text-indigo-400' />
							<span className='text-sm text-landing-accent font-medium'>{t.hero.badge}</span>
						</div>
						<h1 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6'>
							<span className='bg-linear-to-r from-landing-foreground to-landing-muted bg-clip-text text-transparent'>
								{t.hero.title}
							</span>
						</h1>
						<p className='text-lg sm:text-xl text-landing-muted mb-8 leading-relaxed'>
							{t.hero.subtitle}
						</p>
						<div className='flex flex-wrap gap-4 mb-8'>
							<AuthDialog
								triggerButton={{
									text: t.hero.startLearning,
									className:
										'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-[box-shadow,filter] duration-300 ease-out shadow-xl shadow-indigo-500/25 flex items-center gap-2 group text-normal hover:brightness-105',
									icon: <Play className='w-5 h-5' />,
									position: 'start',
									smoothMotion: true
								}}
							/>
							<a
								href='/guard'
								className='bg-landing-surface hover:bg-landing-surface/80 text-landing-foreground px-8 py-4 rounded-xl font-semibold transition-all border border-landing-border flex items-center gap-2 group'
							>
								<ShieldCheck className='w-5 h-5 text-indigo-400' />
								{t.hero.tryGuard}
								<ArrowRight className='w-5 h-5 group-hover:translate-x-0.5 transition-transform' />
							</a>
						</div>
					</div>
					<DemoCard />
				</div>
			</div>
		</section>
	)
}
