import { Lock, ShieldAlert, ShieldCheck } from 'lucide-react'

/**
 * The hero visual: the two addresses side by side. Pixel-identical, one letter
 * Cyrillic. This is the whole pitch in one glance, so it earns the space.
 */
export function HomographReveal() {
	return (
		<div className='relative'>
			{/* glow behind the card */}
			<div className='absolute -inset-4 rounded-3xl bg-gradient-to-br from-purple-600/20 via-transparent to-red-500/10 blur-2xl' />

			<div className='relative space-y-3 rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur-xl sm:p-6'>
				{/* Real */}
				<div className='rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5'>
					<div className='flex items-center gap-2.5'>
						<Lock className='h-3.5 w-3.5 shrink-0 text-emerald-400' />
						<span className='font-mono text-sm text-white/80'>
							https://sberbank.ru
						</span>
					</div>
					<div className='mt-2.5 flex items-center gap-1.5 text-[11px]'>
						<ShieldCheck className='h-3.5 w-3.5 text-emerald-400' />
						<span className='font-medium text-emerald-400'>Safe · the real bank</span>
					</div>
				</div>

				<div className='flex items-center justify-center'>
					<span className='rounded-full bg-white/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/40'>
						vs
					</span>
				</div>

				{/* Fake */}
				<div className='rounded-2xl border border-red-500/25 bg-red-500/[0.05] p-3.5'>
					<div className='flex items-center gap-2.5'>
						<Lock className='h-3.5 w-3.5 shrink-0 text-white/40' />
						<span className='font-mono text-sm text-white/80'>
							https://sberb
							<span className='rounded bg-red-500/25 px-0.5 text-red-300 ring-1 ring-red-500/40'>
								а
							</span>
							nk.ru
						</span>
					</div>
					<div className='mt-2.5 flex items-center justify-between'>
						<div className='flex items-center gap-1.5 text-[11px]'>
							<ShieldAlert className='h-3.5 w-3.5 text-red-400' />
							<span className='font-medium text-red-400'>
								Dangerous · Cyrillic “а”
							</span>
						</div>
						<span className='rounded-md bg-red-500/15 px-2 py-0.5 font-mono text-[11px] font-bold text-red-300 ring-1 ring-red-500/30'>
							100 / 100
						</span>
					</div>
				</div>

				<p className='pt-1 text-center text-[11px] leading-relaxed text-white/40'>
					Same pixels. One letter is Cyrillic — and Guard catches it in under
					5&nbsp;ms, before the page loads, sending nothing anywhere.
				</p>
			</div>
		</div>
	)
}
