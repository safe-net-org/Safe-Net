'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { analyzeUrl, scoreUrl } from '@safe-net/guard-core'
import { m } from 'framer-motion'
import {
	ArrowRight,
	Cpu,
	ShieldAlert,
	ShieldCheck,
	ShieldQuestion,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

/**
 * The live scanner.
 *
 * It imports `@safe-net/guard-core` — the same package the extension ships —
 * so this page is not a mock or a recording. Whatever verdict you see here is
 * the verdict the extension would give, because it is literally the same
 * function. That is also why it runs entirely in the browser: no request, no
 * telemetry, nothing to leak.
 */

const EXAMPLES = [
	{ url: 'https://sberbа nk.ru/login'.replace(' ', ''), note: 'Cyrillic "а"' },
	{ url: 'https://paypa1.com', note: 'digit 1 for l' },
	{ url: 'https://micros0ft-alerts.com', note: 'zero for o' },
	{ url: 'https://sberbank.com.verify-account.info/login', note: 'brand as subdomain' },
	{ url: 'https://mail.google.com', note: 'genuinely safe' },
] as const

const LEVEL = {
	danger: {
		label: 'Dangerous',
		Icon: ShieldAlert,
		ring: 'ring-red-500/40',
		text: 'text-red-400',
		bar: 'bg-red-500',
		bg: 'bg-red-500/10',
	},
	suspicious: {
		label: 'Suspicious',
		Icon: ShieldQuestion,
		ring: 'ring-amber-500/40',
		text: 'text-amber-400',
		bar: 'bg-amber-500',
		bg: 'bg-amber-500/10',
	},
	safe: {
		label: 'Safe',
		Icon: ShieldCheck,
		ring: 'ring-emerald-500/40',
		text: 'text-emerald-400',
		bar: 'bg-emerald-500',
		bg: 'bg-emerald-500/10',
	},
} as const

type Level = keyof typeof LEVEL

const SEVERITY_COLOR: Record<string, string> = {
	high: 'text-red-400',
	medium: 'text-amber-400',
	low: 'text-white/40',
}

interface MlVerdict {
	score: number
	level: string
	ml_probability: number
	rule_score: number
	method: string
}

const ML_URL =
	process.env.NEXT_PUBLIC_ML_URL?.replace(/\/$/, '') ?? 'http://localhost:8000'

const METHOD_LABEL: Record<string, string> = {
	'rule-override': 'Rules overrode the model',
	ml: 'Model-driven',
	blend: 'Model + rules blended',
	rules: 'Rules only',
}

export function UrlScanner() {
	const [input, setInput] = useState(EXAMPLES[0].url)
	const [submitted, setSubmitted] = useState<string | null>(EXAMPLES[0].url)
	const [ml, setMl] = useState<MlVerdict | null>(null)
	const [mlState, setMlState] = useState<'idle' | 'loading' | 'unavailable'>(
		'idle'
	)

	const result = useMemo(() => {
		if (!submitted?.trim()) return null
		try {
			return scoreUrl(submitted, analyzeUrl(submitted))
		} catch {
			return null
		}
	}, [submitted])

	// The local engine is the answer; the neural net is an optional second
	// opinion. If the ML service is not running, the scanner simply does not show
	// that panel — it never blocks or degrades the instant local verdict.
	useEffect(() => {
		if (!submitted?.trim()) return
		const controller = new AbortController()
		const timeout = setTimeout(() => controller.abort(), 4000)
		setMl(null)
		setMlState('loading')

		fetch(`${ML_URL}/predict`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url: submitted }),
			signal: controller.signal,
		})
			.then(res => (res.ok ? res.json() : Promise.reject()))
			.then((data: MlVerdict) => {
				setMl(data)
				setMlState('idle')
			})
			.catch(() => setMlState('unavailable'))
			.finally(() => clearTimeout(timeout))

		return () => {
			clearTimeout(timeout)
			controller.abort()
		}
	}, [submitted])

	const level: Level = (result?.level as Level) ?? 'safe'
	const meta = LEVEL[level]

	return (
		<div className='space-y-6'>
			<form
				onSubmit={e => {
					e.preventDefault()
					setSubmitted(input)
				}}
				className='flex flex-col gap-2 sm:flex-row'
			>
				<input
					value={input}
					onChange={e => setInput(e.target.value)}
					spellCheck={false}
					aria-label='URL to scan'
					placeholder='Paste any URL…'
					className='flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/25'
				/>
				<Button type='submit' className='gap-1.5'>
					Scan <ArrowRight className='h-4 w-4' />
				</Button>
			</form>

			<div className='flex flex-wrap gap-1.5'>
				{EXAMPLES.map(example => (
					<button
						key={example.url}
						type='button'
						onClick={() => {
							setInput(example.url)
							setSubmitted(example.url)
						}}
						className='rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-white/60 transition-colors hover:border-white/25 hover:text-white'
					>
						{example.url.replace('https://', '')}
						<span className='ml-1.5 font-sans text-white/30'>{example.note}</span>
					</button>
				))}
			</div>

			{result && (
				<m.div
					key={submitted}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					className={cn(
						'space-y-4 rounded-2xl border border-white/10 p-4 ring-1 sm:p-6',
						meta.bg,
						meta.ring
					)}
				>
					<div className='flex items-center gap-3'>
						<meta.Icon className={cn('h-7 w-7 shrink-0', meta.text)} />
						<div className='min-w-0 flex-1'>
							<div className='flex items-baseline gap-2'>
								<span className={cn('text-2xl font-bold', meta.text)}>
									{result.score}
								</span>
								<span className='text-xs text-white/40'>/ 100</span>
								<span className={cn('text-sm font-semibold', meta.text)}>
									{meta.label}
								</span>
							</div>
							<div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10'>
								<m.div
									initial={{ width: 0 }}
									animate={{ width: `${result.score}%` }}
									transition={{ duration: 0.5, ease: 'easeOut' }}
									className={cn('h-full', meta.bar)}
								/>
							</div>
						</div>
					</div>

					{result.signals.length > 0 ? (
						<ul className='space-y-2 border-t border-white/10 pt-3'>
							{result.signals.map(signal => (
								<li key={signal.key} className='flex items-start gap-2'>
									<span
										className={cn(
											'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current',
											SEVERITY_COLOR[signal.severity] ?? 'text-white/40'
										)}
									/>
									<p className='text-xs leading-relaxed text-white/70'>
										{signal.message}
									</p>
								</li>
							))}
						</ul>
					) : (
						<p className='border-t border-white/10 pt-3 text-xs text-white/50'>
							No red flags found. Recognising what is normal matters as much as
							spotting what is not.
						</p>
					)}
				</m.div>
			)}

			{/* Optional second opinion from the neural net. */}
			{ml && (
				<m.div
					key={`ml-${submitted}`}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					className='rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5'
				>
					<div className='mb-3 flex items-center gap-2'>
						<Cpu className='h-4 w-4 text-cyan-400' />
						<span className='text-xs font-semibold uppercase tracking-wide text-cyan-300'>
							Neural network — second opinion
						</span>
					</div>
					<div className='grid grid-cols-3 gap-3 text-center'>
						<Stat
							label='BERT says'
							value={`${Math.round(ml.ml_probability * 100)}%`}
							hint='phishing'
						/>
						<Stat label='Rules say' value={String(ml.rule_score)} hint='/ 100' />
						<Stat
							label='Final'
							value={String(ml.score)}
							hint={ml.level}
							emphasis
						/>
					</div>
					<p className='mt-3 border-t border-white/10 pt-2.5 text-[11px] leading-relaxed text-white/50'>
						{METHOD_LABEL[ml.method] ?? ml.method}.{' '}
						{ml.method === 'rule-override' && ml.ml_probability > 0.5 && ml.score < 40
							? 'The model flagged this, but the deterministic rules recognised a known-safe site and overruled it.'
							: ml.method === 'rule-override' && ml.score >= 70
								? 'The rules are certain, so no model probability can argue this down.'
								: 'The model decides where the rules are silent.'}
					</p>
				</m.div>
			)}

			<p className='text-[11px] leading-relaxed text-white/30'>
				The verdict runs entirely in your browser using{' '}
				<code className='font-mono text-white/50'>@safe-net/guard-core</code> —
				the same package the extension ships, sending nothing anywhere.{' '}
				{mlState === 'unavailable'
					? 'The neural-network layer is offline (start it with bun run dev).'
					: 'The neural network is an optional second opinion.'}
			</p>
		</div>
	)
}

function Stat({
	label,
	value,
	hint,
	emphasis,
}: {
	label: string
	value: string
	hint?: string
	emphasis?: boolean
}) {
	return (
		<div
			className={
				'rounded-xl border p-2.5 ' +
				(emphasis
					? 'border-cyan-400/25 bg-cyan-400/[0.06]'
					: 'border-white/10 bg-white/[0.02]')
			}
		>
			<div className='text-[10px] uppercase tracking-wide text-white/40'>
				{label}
			</div>
			<div
				className={
					'mt-0.5 text-xl font-bold ' +
					(emphasis ? 'text-cyan-300' : 'text-white')
				}
			>
				{value}
			</div>
			{hint && <div className='text-[10px] text-white/30'>{hint}</div>}
		</div>
	)
}
