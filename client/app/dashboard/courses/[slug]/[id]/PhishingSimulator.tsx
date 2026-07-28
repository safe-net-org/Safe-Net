'use client'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/LocaleProvider'
import { cn } from '@/lib/utils'
import { m } from 'framer-motion'
import { AlertTriangle, Check, Flag, Globe, Mail, X } from '@/components/ui/icons'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

/**
 * The phishing simulator: a learner reads a realistic message and highlights
 * whatever looks wrong.
 *
 * Highlights are submitted as raw text plus which field they came from. The
 * client is deliberately never told which spans are the red flags — that list
 * is the answer key and stays on the server, the same way option `isCorrect`
 * flags are stripped from lesson content.
 */

export type SpanLocation = 'from' | 'subject' | 'body' | 'url' | 'page'

export interface SelectedSpan {
	location: SpanLocation
	text: string
}

export interface RedFlagFeedback {
	id: string
	span: string
	reason: string
	found: boolean
}

interface SimulatedEmail {
	from: string
	displayName?: string
	subject: string
	body: string
}

interface SimulatedSite {
	url: string
	title?: string
	page: string
}

interface PhishingSimulatorProps {
	email?: SimulatedEmail
	site?: SimulatedSite
	selectedSpans: SelectedSpan[]
	onChange: (spans: SelectedSpan[]) => void
	hasSubmitted: boolean
	feedback?: RedFlagFeedback[]
	falsePositives?: { location: string; text: string }[]
}

const MAX_SELECTION_LENGTH = 200

export function PhishingSimulator({
	email,
	site,
	selectedSpans,
	onChange,
	hasSubmitted,
	feedback,
	falsePositives,
}: PhishingSimulatorProps) {
	const { t } = useI18n()
	const containerRef = useRef<HTMLDivElement>(null)
	const [pendingSelection, setPendingSelection] = useState<SelectedSpan | null>(
		null
	)

	/**
	 * Reads the current mouse/touch selection and works out which field it
	 * landed in by walking up to the nearest [data-location] ancestor.
	 */
	const captureSelection = useCallback(() => {
		if (hasSubmitted) return

		const selection = window.getSelection()
		const text = selection?.toString().trim()
		if (!selection || !text) {
			setPendingSelection(null)
			return
		}

		if (text.length > MAX_SELECTION_LENGTH) {
			toast.error(t.dashboardSimulator.tooLong)
			setPendingSelection(null)
			return
		}

		const anchor =
			selection.anchorNode instanceof Element
				? selection.anchorNode
				: selection.anchorNode?.parentElement
		const field = anchor?.closest('[data-location]')
		const location = field?.getAttribute('data-location') as
			| SpanLocation
			| undefined

		if (!location) {
			setPendingSelection(null)
			return
		}

		setPendingSelection({ location, text })
	}, [hasSubmitted, t.dashboardSimulator.tooLong])

	useEffect(() => {
		document.addEventListener('selectionchange', captureSelection)
		return () => document.removeEventListener('selectionchange', captureSelection)
	}, [captureSelection])

	const addFlag = () => {
		if (!pendingSelection) return

		const isDuplicate = selectedSpans.some(
			span =>
				span.location === pendingSelection.location &&
				span.text.toLowerCase() === pendingSelection.text.toLowerCase()
		)
		if (isDuplicate) {
			toast.info(t.dashboardSimulator.alreadyFlagged)
		} else {
			onChange([...selectedSpans, pendingSelection])
		}

		window.getSelection()?.removeAllRanges()
		setPendingSelection(null)
	}

	const removeFlag = (index: number) => {
		onChange(selectedSpans.filter((_, i) => i !== index))
	}

	return (
		<div ref={containerRef} className='space-y-4'>
			<div className='flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3'>
				<AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-amber-400' />
				<p className='text-xs text-white/70 sm:text-sm'>
					{t.dashboardSimulator.warning}
				</p>
			</div>

			{email && <EmailView email={email} />}
			{site && <SiteView site={site} />}

			{!hasSubmitted && (
				<div className='flex items-center gap-2'>
					<Button
						size='sm'
						onClick={addFlag}
						disabled={!pendingSelection}
						className='gap-1.5'
					>
						<Flag className='h-3.5 w-3.5' />
						{pendingSelection
							? t.dashboardSimulator.flagSelectedTemplate.replace(
									'{text}',
									truncate(pendingSelection.text)
								)
							: t.dashboardSimulator.flagCta}
					</Button>
				</div>
			)}

			<FlaggedList
				spans={selectedSpans}
				hasSubmitted={hasSubmitted}
				onRemove={removeFlag}
			/>

			{hasSubmitted && feedback && (
				<FeedbackPanel feedback={feedback} falsePositives={falsePositives} />
			)}
		</div>
	)
}

function EmailView({ email }: { email: SimulatedEmail }) {
	const { t } = useI18n()
	return (
		<div className='overflow-hidden rounded-xl border border-white/15 bg-slate-900/60'>
			<div className='flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2'>
				<Mail className='h-4 w-4 text-white/50' />
				<span className='text-xs font-medium text-white/50'>
					{t.dashboardSimulator.inbox}
				</span>
			</div>

			<div className='space-y-2 p-3 sm:p-4'>
				{/* Display name and address are shown as separate rows rather than
				    "Name <addr>": the whole lesson is that the friendly name is
				    free text and only the address identifies the sender. Wrapping
				    one inside the other also double-nested any address that
				    already carried a name. */}
				{email.displayName && (
					<div className='flex flex-wrap items-baseline gap-2 text-sm'>
						<span className='shrink-0 text-xs font-medium uppercase tracking-wide text-white/40'>
							{t.dashboardSimulator.nameLabel}
						</span>
						<span className='text-white/60'>{email.displayName}</span>
					</div>
				)}
				<Field label={t.dashboardSimulator.fromLabel} location='from'>
					{email.from}
				</Field>
				<Field label={t.dashboardSimulator.subjectLabel} location='subject'>
					{email.subject}
				</Field>
				<div
					data-location='body'
					className='select-text whitespace-pre-wrap border-t border-white/10 pt-3 text-sm leading-relaxed text-white/80'
				>
					{email.body}
				</div>
			</div>
		</div>
	)
}

function SiteView({ site }: { site: SimulatedSite }) {
	return (
		<div className='overflow-hidden rounded-xl border border-white/15 bg-slate-900/60'>
			<div className='flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2'>
				<Globe className='h-4 w-4 shrink-0 text-white/50' />
				<div
					data-location='url'
					className='select-text truncate rounded bg-slate-800/80 px-2 py-1 font-mono text-xs text-white/70'
				>
					{site.url}
				</div>
			</div>

			<div className='p-3 sm:p-4'>
				{site.title && (
					<p className='mb-2 text-sm font-semibold text-white'>{site.title}</p>
				)}
				<div
					data-location='page'
					className='select-text whitespace-pre-wrap text-sm leading-relaxed text-white/80'
				>
					{site.page}
				</div>
			</div>
		</div>
	)
}

function Field({
	label,
	location,
	children,
}: {
	label: string
	location: SpanLocation
	children: React.ReactNode
}) {
	return (
		<div className='flex flex-wrap items-baseline gap-2 text-sm'>
			<span className='shrink-0 text-xs font-medium uppercase tracking-wide text-white/40'>
				{label}
			</span>
			<span
				data-location={location}
				className='select-text break-all font-mono text-white/80'
			>
				{children}
			</span>
		</div>
	)
}

function FlaggedList({
	spans,
	hasSubmitted,
	onRemove,
}: {
	spans: SelectedSpan[]
	hasSubmitted: boolean
	onRemove: (index: number) => void
}) {
	const { t } = useI18n()
	if (spans.length === 0) {
		return (
			<p className='text-xs text-white/40'>
				{t.dashboardSimulator.nothingFlagged}
			</p>
		)
	}

	return (
		<div className='flex flex-wrap gap-1.5'>
			{spans.map((span, index) => (
				<m.span
					key={`${span.location}-${span.text}-${index}`}
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					className='inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs text-amber-300 ring-1 ring-amber-500/30'
				>
					<span className='text-[10px] uppercase text-amber-400/60'>
						{span.location}
					</span>
					<span className='max-w-[180px] truncate font-mono'>{span.text}</span>
					{!hasSubmitted && (
						<button
							type='button'
							onClick={() => onRemove(index)}
							aria-label={t.dashboardSimulator.removeFlagAriaTemplate.replace(
								'{text}',
								span.text
							)}
							className='rounded-full p-0.5 hover:bg-amber-500/20'
						>
							<X className='h-3 w-3' />
						</button>
					)}
				</m.span>
			))}
		</div>
	)
}

/**
 * Revealed only after submitting. Every red flag is shown with its reason —
 * including the ones the learner walked past, since a bare "wrong" teaches
 * nothing.
 */
function FeedbackPanel({
	feedback,
	falsePositives,
}: {
	feedback: RedFlagFeedback[]
	falsePositives?: { location: string; text: string }[]
}) {
	const { t } = useI18n()
	return (
		<div className='space-y-3 rounded-xl border border-white/15 bg-slate-900/60 p-3 sm:p-4'>
			<p className='text-xs font-semibold uppercase tracking-wide text-white/50'>
				{t.dashboardSimulator.feedbackTitle}
			</p>

			<ul className='space-y-2.5'>
				{feedback.map(flag => (
					<li key={flag.id} className='flex items-start gap-2.5'>
						<span
							className={cn(
								'mt-0.5 shrink-0 rounded-full p-1',
								flag.found
									? 'bg-emerald-500/15 text-emerald-400'
									: 'bg-red-500/15 text-red-400'
							)}
						>
							{flag.found ? (
								<Check className='h-3 w-3' />
							) : (
								<X className='h-3 w-3' />
							)}
						</span>
						<div className='min-w-0'>
							<p className='break-all font-mono text-xs text-white/90'>
								{flag.span}
							</p>
							<p className='mt-0.5 text-xs leading-relaxed text-white/60'>
								{flag.reason}
							</p>
						</div>
					</li>
				))}
			</ul>

			{falsePositives && falsePositives.length > 0 && (
				<div className='border-t border-white/10 pt-2.5'>
					<p className='text-xs text-white/50'>
						{t.dashboardSimulator.falsePositivesTemplate.replace(
							'{items}',
							falsePositives.map(fp => `"${truncate(fp.text)}"`).join(', ')
						)}
					</p>
				</div>
			)}
		</div>
	)
}

function truncate(text: string, max = 24) {
	return text.length > max ? `${text.slice(0, max)}…` : text
}
