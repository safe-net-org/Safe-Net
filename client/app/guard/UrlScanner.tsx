'use client'

import { analyzeUrl, scoreUrl } from '@safe-net/guard-core'
import { m } from 'framer-motion'
import {
	ArrowRight,
	Cpu,
	LockKeyhole,
	ShieldAlert,
	ShieldCheck,
	ShieldQuestion,
} from '@/components/ui/icons'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { translateRiskSignal } from '@/i18n/guard-signal-messages'
import { useI18n } from '@/i18n/LocaleProvider'
import { cn } from '@/lib/utils'

const EXAMPLE_URLS = [
	{ url: 'https://sberbа nk.ru/login'.replace(' ', ''), noteKey: 'cyrillicA' as const },
	{ url: 'https://paypαl.com', noteKey: 'greekAlpha' as const },
	{ url: 'https://paypa1.com', noteKey: 'digitOne' as const },
	{ url: 'https://micros0ft-alerts.com', noteKey: 'zeroForO' as const },
	{
		url: 'https://sberbank.com.verify-account.info/login',
		noteKey: 'brandSubdomain' as const,
	},
	{ url: 'https://mail.google.com', noteKey: 'genuinelySafe' as const },
]

type Level = 'danger' | 'suspicious' | 'safe'
type MlState = 'idle' | 'loading' | 'success' | 'unavailable' | 'error'
type ValidationError = 'required' | 'invalid' | 'tooLong'

const LEVEL_ICON: Record<Level, typeof ShieldAlert> = {
	danger: ShieldAlert,
	suspicious: ShieldQuestion,
	safe: ShieldCheck,
}

const LEVEL_STYLE: Record<
	Level,
	{ ring: string; text: string; bar: string; bg: string }
> = {
	danger: {
		ring: 'ring-red-500/30',
		text: 'text-red-600 dark:text-red-400',
		bar: 'bg-red-500',
		bg: 'bg-red-500/8',
	},
	suspicious: {
		ring: 'ring-amber-500/30',
		text: 'text-amber-700 dark:text-amber-400',
		bar: 'bg-amber-500',
		bg: 'bg-amber-500/8',
	},
	safe: {
		ring: 'ring-emerald-500/30',
		text: 'text-emerald-700 dark:text-emerald-400',
		bar: 'bg-emerald-500',
		bg: 'bg-emerald-500/8',
	},
}

const SEVERITY_COLOR: Record<string, string> = {
	high: 'text-red-500',
	medium: 'text-amber-500',
	low: 'text-muted-foreground',
}

interface MlVerdict {
	score: number
	level: Level
	ml_probability: number
	rule_score: number
	method: 'ml' | 'rules' | 'rule-override' | 'blend'
}

const ML_URL = process.env.NEXT_PUBLIC_ML_URL?.replace(/\/$/, '') || null

function validateUrl(value: string): { url?: string; error?: ValidationError } {
	const candidate = value.trim()
	if (!candidate) return { error: 'required' }
	if (candidate.length > 2048) return { error: 'tooLong' }
	if (/\s/.test(candidate)) return { error: 'invalid' }

	try {
		const parsed = new URL(candidate)
		if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
			return { error: 'invalid' }
		}
		return { url: candidate }
	} catch {
		return { error: 'invalid' }
	}
}

function sanitizeForModel(rawUrl: string): string {
	const parsed = new URL(rawUrl)
	parsed.username = ''
	parsed.password = ''
	parsed.hash = ''

	const sanitizedQuery = new URLSearchParams()
	for (const [name] of parsed.searchParams) {
		sanitizedQuery.append(name, '[redacted]')
	}
	parsed.search = sanitizedQuery.toString()

	return parsed.toString()
}

function isMlVerdict(value: unknown): value is MlVerdict {
	if (!value || typeof value !== 'object') return false
	const data = value as Record<string, unknown>

	return (
		typeof data.score === 'number' &&
		data.score >= 0 &&
		data.score <= 100 &&
		(data.level === 'safe' ||
			data.level === 'suspicious' ||
			data.level === 'danger') &&
		typeof data.ml_probability === 'number' &&
		data.ml_probability >= 0 &&
		data.ml_probability <= 1 &&
		typeof data.rule_score === 'number' &&
		data.rule_score >= 0 &&
		data.rule_score <= 100 &&
		(data.method === 'ml' ||
			data.method === 'rules' ||
			data.method === 'rule-override' ||
			data.method === 'blend')
	)
}

export function UrlScanner() {
	const { locale, t } = useI18n()
	const s = t.guardComponents.urlScanner
	const examples = EXAMPLE_URLS.map(example => ({
		url: example.url,
		note: s.examples[example.noteKey],
	}))
	const levelLabel: Record<Level, string> = {
		danger: s.levels.danger,
		suspicious: s.levels.suspicious,
		safe: s.levels.safe,
	}
	const methodLabel: Record<MlVerdict['method'], string> = {
		'rule-override': s.methodLabel.ruleOverride,
		ml: s.methodLabel.ml,
		blend: s.methodLabel.blend,
		rules: s.methodLabel.rules,
	}

	const [input, setInput] = useState(examples[0].url)
	const [submitted, setSubmitted] = useState<string | null>(examples[0].url)
	const [inputError, setInputError] = useState<ValidationError | null>(null)
	const [ml, setMl] = useState<MlVerdict | null>(null)
	const [mlState, setMlState] = useState<MlState>('idle')
	const requestRef = useRef<AbortController | null>(null)

	useEffect(() => {
		return () => requestRef.current?.abort()
	}, [])

	const result = useMemo(() => {
		if (!submitted) return null
		try {
			return scoreUrl(submitted, analyzeUrl(submitted))
		} catch {
			return null
		}
	}, [submitted])

	const resetModel = () => {
		requestRef.current?.abort()
		requestRef.current = null
		setMl(null)
		setMlState('idle')
	}

	const submitLocalScan = (candidate: string) => {
		const validation = validateUrl(candidate)
		if (!validation.url) {
			setInputError(validation.error ?? 'invalid')
			return
		}

		setInputError(null)
		setInput(validation.url)
		setSubmitted(validation.url)
		resetModel()
	}

	const requestModelOpinion = async () => {
		if (!submitted) return
		if (!ML_URL) {
			setMlState('unavailable')
			return
		}

		requestRef.current?.abort()
		const controller = new AbortController()
		requestRef.current = controller
		setMl(null)
		setMlState('loading')
		const timeout = window.setTimeout(() => controller.abort(), 6000)

		try {
			const response = await fetch(`${ML_URL}/predict`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: sanitizeForModel(submitted) }),
				signal: controller.signal,
			})
			const data: unknown = response.ok ? await response.json() : null

			if (!response.ok || !isMlVerdict(data)) {
				throw new Error('Invalid model response')
			}
			if (requestRef.current !== controller) return

			setMl(data)
			setMlState('success')
		} catch {
			if (requestRef.current !== controller) return
			setMlState('error')
		} finally {
			window.clearTimeout(timeout)
			if (requestRef.current === controller) requestRef.current = null
		}
	}

	const level: Level = (result?.level as Level) ?? 'safe'
	const meta = {
		Icon: LEVEL_ICON[level],
		label: levelLabel[level],
		...LEVEL_STYLE[level],
	}

	return (
		<div className='space-y-6'>
			<form
				onSubmit={event => {
					event.preventDefault()
					submitLocalScan(input)
				}}
				noValidate
				className='space-y-2'
			>
				<div className='flex flex-col gap-2 sm:flex-row'>
					<input
						value={input}
						onChange={event => {
							setInput(event.target.value)
							if (inputError) setInputError(null)
						}}
						spellCheck={false}
						autoComplete='off'
						inputMode='url'
						aria-label={s.urlInputAriaLabel}
						aria-invalid={Boolean(inputError)}
						aria-describedby={inputError ? 'guard-url-error' : undefined}
						placeholder={s.placeholder}
						className='min-h-10 flex-1 rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 aria-invalid:border-destructive'
					/>
					<Button type='submit' size='lg' className='gap-1.5 rounded-xl'>
						{s.scan} <ArrowRight className='size-4' aria-hidden='true' />
					</Button>
				</div>
				{inputError && (
					<p id='guard-url-error' role='alert' className='text-sm text-destructive'>
						{s.validation[inputError]}
					</p>
				)}
			</form>

			<div className='flex flex-wrap gap-1.5'>
				{examples.map(example => (
					<button
						key={example.url}
						type='button'
						onClick={() => submitLocalScan(example.url)}
						aria-label={`${example.url} — ${example.note}`}
						className='rounded-full border border-border bg-secondary/60 px-3 py-1 font-mono text-[11px] text-secondary-foreground transition-colors hover:border-brand/40 hover:bg-secondary'
					>
						{example.url.replace('https://', '')}
						<span className='ml-1.5 font-sans text-muted-foreground'>
							{example.note}
						</span>
					</button>
				))}
			</div>

			{result && (
				<m.section
					key={submitted}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
					aria-live='polite'
					aria-label={s.localVerdict}
					className={cn(
						'space-y-4 rounded-2xl border border-border p-4 ring-1 sm:p-6',
						meta.bg,
						meta.ring
					)}
				>
					<div className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
						{s.localVerdict}
					</div>
					<div className='flex items-center gap-3'>
						<meta.Icon className={cn('size-7 shrink-0', meta.text)} aria-hidden='true' />
						<div className='min-w-0 flex-1'>
							<div className='flex items-baseline gap-2'>
								<span className={cn('text-2xl font-semibold tabular-nums', meta.text)}>
									{result.score}
								</span>
								<span className='text-xs text-muted-foreground'>/ 100</span>
								<span className={cn('text-sm font-semibold', meta.text)}>
									{meta.label}
								</span>
							</div>
							<div
								className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted'
								role='progressbar'
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={result.score}
							>
								<m.div
									initial={{ width: 0 }}
									animate={{ width: `${result.score}%` }}
									transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
									className={cn('h-full', meta.bar)}
								/>
							</div>
						</div>
					</div>

					{result.signals.length > 0 ? (
						<ul className='space-y-2 border-t border-border pt-3'>
							{result.signals.map(signal => (
								<li key={signal.key} className='flex items-start gap-2'>
									<span
										className={cn(
											'mt-1.5 size-1.5 shrink-0 rounded-full bg-current',
											SEVERITY_COLOR[signal.severity] ?? 'text-muted-foreground'
										)}
										aria-hidden='true'
									/>
									<p className='text-xs leading-relaxed text-foreground'>
										{translateRiskSignal(locale, signal, result.features)}
									</p>
								</li>
							))}
						</ul>
					) : (
						<p className='border-t border-border pt-3 text-xs text-muted-foreground'>
							{s.noRedFlags}
						</p>
					)}
				</m.section>
			)}

			{result && (
				<section className='rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5'>
					<div className='flex items-start gap-3'>
						<div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand'>
							<LockKeyhole className='size-4' aria-hidden='true' />
						</div>
						<div className='min-w-0 flex-1'>
							<h3 className='text-sm font-semibold text-card-foreground'>
								{s.neuralNetworkHeading}
							</h3>
							<p className='mt-1 text-xs leading-5 text-muted-foreground'>
								{s.modelDisclosure}
							</p>
							<p className='mt-1 text-[11px] leading-5 text-muted-foreground'>
								{s.modelData}
							</p>
						</div>
					</div>

					<div className='mt-4' aria-live='polite'>
						{mlState === 'loading' ? (
							<div className='flex items-center gap-2 text-xs text-muted-foreground' role='status'>
								<Cpu className='size-4 animate-pulse text-brand' aria-hidden='true' />
								{s.mlChecking}
							</div>
						) : mlState === 'unavailable' ? (
							<p className='text-xs leading-5 text-muted-foreground' role='status'>
								{s.modelUnavailable}
							</p>
						) : mlState === 'error' ? (
							<div className='flex flex-wrap items-center gap-3'>
								<p className='text-xs leading-5 text-destructive' role='alert'>
									{s.modelFailed}
								</p>
								<Button
									type='button'
									variant='outline'
									size='sm'
									onClick={requestModelOpinion}
								>
									{s.retryModel}
								</Button>
							</div>
						) : mlState === 'idle' ? (
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={requestModelOpinion}
							>
								<Cpu className='size-4' aria-hidden='true' />
								{s.askModel}
							</Button>
						) : null}
					</div>
				</section>
			)}

			{ml && (
				<m.section
					key={`ml-${submitted}`}
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
					aria-live='polite'
					className='rounded-2xl border border-brand/25 bg-brand/5 p-4 sm:p-5'
				>
					<div className='mb-3 flex items-center gap-2'>
						<Cpu className='size-4 text-brand' aria-hidden='true' />
						<span className='text-xs font-semibold uppercase tracking-wide text-brand'>
							{s.neuralNetworkHeading}
						</span>
					</div>
					<div className='grid grid-cols-3 gap-2 sm:gap-3'>
						<Stat
							label={s.bertSays}
							value={`${Math.round(ml.ml_probability * 100)}%`}
							hint={s.phishingHint}
						/>
						<Stat label={s.rulesSay} value={String(ml.rule_score)} hint='/ 100' />
						<Stat
							label={s.final}
							value={String(ml.score)}
							hint={levelLabel[ml.level]}
							emphasis
						/>
					</div>
					<p className='mt-3 border-t border-border pt-2.5 text-[11px] leading-relaxed text-muted-foreground'>
						{methodLabel[ml.method]}.{' '}
						{ml.method === 'rule-override' &&
						ml.ml_probability > 0.5 &&
						ml.score < 40
							? s.ruleOverrideFlaggedButSafe
							: ml.method === 'rule-override' && ml.score >= 70
								? s.ruleOverrideCertain
								: s.modelDecides}
					</p>
				</m.section>
			)}

			<p className='text-[11px] leading-relaxed text-muted-foreground'>
				{s.footerPrefix}{' '}
				<code className='font-mono text-foreground'>@safe-net/guard-core</code>{' '}
				{s.footerSuffix}{' '}
				{mlState === 'unavailable' || mlState === 'error'
					? s.mlOffline
					: mlState === 'idle'
						? s.mlOptional
						: null}
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
			className={cn(
				'rounded-xl border p-2.5 text-center',
				emphasis ? 'border-brand/30 bg-brand/10' : 'border-border bg-background/70'
			)}
		>
			<div className='text-[10px] uppercase tracking-wide text-muted-foreground'>
				{label}
			</div>
			<div
				className={cn(
					'mt-0.5 text-xl font-semibold tabular-nums',
					emphasis ? 'text-brand' : 'text-foreground'
				)}
			>
				{value}
			</div>
			{hint && <div className='text-[10px] text-muted-foreground'>{hint}</div>}
		</div>
	)
}
