'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import { Lock, ShieldAlert, ShieldCheck } from '@/components/ui/icons'

/**
 * The hero visual: the two addresses side by side. Pixel-identical, one letter
 * Cyrillic. This is the whole pitch in one glance, so it earns the space.
 */
export function HomographReveal() {
	const { t } = useI18n()
	const h = t.guardComponents.homographReveal

	return (
		<div className='space-y-3 rounded-2xl border border-slate-700 bg-slate-800 p-5 sm:p-6'>
			{/* Real */}
			<div className='rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5'>
				<div className='flex items-center gap-2.5'>
					<Lock className='h-3.5 w-3.5 shrink-0 text-emerald-400' />
					<span className='font-mono text-sm text-slate-200'>
						https://sberbank.ru
					</span>
				</div>
				<div className='mt-2.5 flex items-center gap-1.5 text-xs'>
					<ShieldCheck className='h-3.5 w-3.5 text-emerald-400' />
					<span className='font-medium text-emerald-400'>{h.realLabel}</span>
				</div>
			</div>

			<div className='flex items-center justify-center'>
				<span className='rounded-full bg-slate-700 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-400'>
					{h.vs}
				</span>
			</div>

			{/* Fake */}
			<div className='rounded-xl border border-red-500/40 bg-red-500/5 p-3.5'>
				<div className='flex items-center gap-2.5'>
					<Lock className='h-3.5 w-3.5 shrink-0 text-slate-500' />
					<span className='font-mono text-sm text-slate-200'>
						https://sberb
						<span className='rounded bg-red-500/25 px-0.5 text-red-300 ring-1 ring-red-500/40'>
							а
						</span>
						nk.ru
					</span>
				</div>
				<div className='mt-2.5 flex items-center justify-between'>
					<div className='flex items-center gap-1.5 text-xs'>
						<ShieldAlert className='h-3.5 w-3.5 text-red-400' />
						<span className='font-medium text-red-400'>{h.fakeLabel}</span>
					</div>
					<span className='rounded-md bg-red-500/15 px-2 py-0.5 font-mono text-xs font-bold text-red-300 ring-1 ring-red-500/30'>
						100 / 100
					</span>
				</div>
			</div>

			<p className='pt-1 text-center text-xs leading-relaxed text-slate-500'>
				{h.footnote}
			</p>
		</div>
	)
}
