'use client'
import { Play } from '@/components/ui/icons'

import { useI18n } from '@/i18n/LocaleProvider'
import { AuthDialog } from '../Auth/AuthDialog'

export default function CTA() {
	const { t } = useI18n()
	return (
		<section className='py-20'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div data-inverse className='bg-linear-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden'>
					<div className='absolute inset-0 opacity-10'>
						<div className='absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl'></div>
						<div className='absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full blur-3xl'></div>
					</div>
					<div className='relative z-10'>
						<h3 className='text-3xl sm:text-4xl font-bold text-white mb-4'>
							{t.cta.title}
						</h3>
						<p className='text-xl text-white/90 mb-8 max-w-2xl mx-auto'>
							{t.cta.subtitle}
						</p>
						<AuthDialog
							triggerButton={{
								text: t.hero.startLearning,
								className:
									'inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg transition-[box-shadow,background-color] duration-300 ease-out shadow-xl group hover:shadow-2xl',
								icon: (
									<Play className='w-6 h-6 transition-transform duration-300 group-hover:scale-110' />
								),
								position: 'end',
								smoothMotion: true,
							}}
						/>
					</div>
				</div>
			</div>
		</section>
	)
}
