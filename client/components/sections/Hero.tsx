import { ArrowRight, Play, ShieldCheck, Sparkles } from 'lucide-react'

import { AuthDialog } from '../Auth/AuthDialog'
import DemoCard from './DemoCard'

export default function Hero() {
	return (
		<section className='relative overflow-hidden'>
			<div className='absolute inset-0 bg-linear-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10'></div>
			<div className='absolute inset-0'>
				<div className='absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse'></div>
				<div
					className='absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse'
					style={{ animationDelay: '1s' }}
				></div>
			</div>
			<div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32'>
				<div className='grid lg:grid-cols-2 gap-12 items-center'>
					<div>
						<div className='inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-6'>
							<Sparkles className='w-4 h-4 text-indigo-400' />
							<span className='text-sm text-indigo-300 font-medium'>
								A modern cybersecurity training platform
							</span>
						</div>
						<h2 className='text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6'>
							<span className='bg-linear-to-r from-white to-slate-300 bg-clip-text text-transparent'>
								Cybersecurity Simulator
							</span>
						</h2>
						<p className='text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed'>
							Learn to spot phishing, malicious sites, and dangerous links in
							an interactive game. Complete levels, earn points, and become
							the guardian of your own data.
						</p>
						<div className='flex flex-wrap gap-4 mb-8'>
							<AuthDialog
								triggerButton={{
									text: 'Start Learning',
									className:
										'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-2 group text-normal',
									icon: (
										<Play className='w-5 h-5 group-hover:scale-110 transition-transform' />
									),
									position: 'start',
								}}
							/>
							<a
								href='/guard'
								className='bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-semibold transition-all border border-slate-700 flex items-center gap-2 group'
							>
								<ShieldCheck className='w-5 h-5 text-indigo-400' />
								Try AI Guard
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
