'use client'

import { m } from 'framer-motion'
import {
	ArrowRight,
	BookOpen,
	Cpu,
	Gauge,
	Globe,
	Puzzle,
	ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'

const LAYERS = [
	{ Icon: Gauge, name: 'Local rules', note: '< 5 ms · offline · zero data' },
	{ Icon: Globe, name: 'Threat intel', note: 'blocklists · WHOIS · CT logs' },
	{ Icon: Cpu, name: 'Neural network', note: 'fine-tuned BERT' },
	{ Icon: ShieldCheck, name: 'Page analysis', note: 'forms · wallet drainers' },
]

export default function GuardSection() {
	return (
		<section
			id='guard'
			className='relative overflow-hidden border-t border-slate-800 py-24'
		>
			{/* soft glow */}
			<div className='pointer-events-none absolute inset-0'>
				<div className='absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl' />
				<div className='absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl' />
			</div>

			<div className='relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='grid items-center gap-12 lg:grid-cols-2'>
					{/* Left — the story */}
					<m.div
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<div className='mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1'>
							<Puzzle className='h-3.5 w-3.5 text-purple-400' />
							<span className='font-mono text-[11px] uppercase tracking-[0.15em] text-purple-300'>
								Browser extension · AI
							</span>
						</div>

						<h3 className='text-3xl font-bold text-white sm:text-4xl'>
							SafeNet Guard
						</h3>

						<p className='mt-4 max-w-xl text-lg leading-relaxed text-slate-400'>
							The dangerous links are not ugly. Guard reads every URL before the
							page loads — combining a neural network with deterministic rules —
							and tells you what is wrong.
						</p>

						{/* the homograph reveal */}
						<div className='mt-6 rounded-2xl border border-slate-700 bg-slate-800/60 p-4 font-mono text-sm'>
							<div className='flex items-center justify-between'>
								<span className='text-slate-500'>Looks identical:</span>
							</div>
							<div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1'>
								<span className='text-slate-300'>sberbank.ru</span>
								<span className='text-slate-600'>vs</span>
								<span>
									sberb
									<span className='rounded bg-red-500/20 px-0.5 text-red-400'>
										а
									</span>
									nk.ru
								</span>
							</div>
							<p className='mt-2 text-[11px] text-slate-500'>
								The second{' '}
								<span className='text-red-400'>а</span> is Cyrillic. Guard scores
								it <span className='text-red-400'>100 / 100</span>.
							</p>
						</div>

						<div className='mt-6 flex items-center gap-2 text-sm text-slate-400'>
							<BookOpen className='h-4 w-4 text-purple-400' />
							<span>
								Same engine the courses teach and the simulator tests —{' '}
								<span className='text-slate-300'>one implementation</span>.
							</span>
						</div>

						<Link
							href='/guard'
							className='group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition-transform hover:scale-[1.02]'
						>
							Try the live scanner
							<ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
						</Link>
					</m.div>

					{/* Right — the four layers */}
					<m.div
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.15 }}
						className='space-y-3'
					>
						{LAYERS.map((layer, i) => (
							<m.div
								key={layer.name}
								initial={{ opacity: 0, x: 20 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
								className='flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800/60 p-4'
							>
								<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900'>
									<layer.Icon className='h-5 w-5 text-purple-400' />
								</div>
								<div className='min-w-0 flex-1'>
									<div className='flex items-baseline gap-2'>
										<span className='font-mono text-xs text-slate-500'>
											{i + 1}
										</span>
										<span className='font-semibold text-white'>{layer.name}</span>
									</div>
									<p className='text-sm text-slate-500'>{layer.note}</p>
								</div>
							</m.div>
						))}
						<p className='px-1 pt-1 text-xs text-slate-600'>
							Only the first layer is required. Everything else degrades
							gracefully — and layer one sends nothing anywhere.
						</p>
					</m.div>
				</div>
			</div>
		</section>
	)
}
