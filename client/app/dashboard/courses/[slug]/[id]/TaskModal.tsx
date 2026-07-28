'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/i18n/LocaleProvider'
import { cn } from '@/lib/utils'
import { AnimatePresence, m } from 'framer-motion'
import { CheckCircle2, ChevronRight, RotateCcw, X, XCircle } from '@/components/ui/icons'
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import {
	PhishingSimulator,
	RedFlagFeedback,
	SelectedSpan,
} from './PhishingSimulator'

type TaskType =
	| 'SINGLE_CHOICE'
	| 'MULTI_CHOICE'
	| 'SHORT_ANSWER'
	| 'TEXT_INPUT'
	| 'PHISHING_EMAIL'
	| 'PHISHING_SITE'

interface Task {
	id: string
	order: number
	type: TaskType
	title: string
	question?: string
	explanation?: string
	points: number
	difficulty: 'EASY' | 'MEDIUM' | 'HARD'
	options: Array<{ id: string; text: string }>
	completed?: boolean
	/** Present only on PHISHING_EMAIL tasks — never includes the red flags. */
	email?: {
		from: string
		displayName?: string
		subject: string
		body: string
	}
	/** Present only on PHISHING_SITE tasks. */
	site?: { url: string; title?: string; page: string }
}

export interface AnswerPayload {
	selectedOptionIds: string[]
	textAnswer?: string
	selectedSpans?: SelectedSpan[]
}

interface TaskModalProps {
	isOpen: boolean
	onClose: () => void
	tasks: Task[]
	currentTaskIndex: number
	onTaskChange: (index: number) => void
	answerTask: (
		taskId: string,
		payload: AnswerPayload
	) => Promise<{
		isCorrect: boolean
		explanation?: string
		awardedXp: number
		redFlagFeedback?: RedFlagFeedback[]
		falsePositives?: { location: string; text: string }[]
	}>
	isAnswering: boolean
}

const subscribeToPortalReady = () => () => undefined
const getPortalClientSnapshot = () => true
const getPortalServerSnapshot = () => false

export function TaskModal({
	isOpen,
	onClose,
	tasks,
	currentTaskIndex,
	onTaskChange,
	answerTask,
	isAnswering,
}: TaskModalProps) {
	const { t } = useI18n()
	const [selectedOptions, setSelectedOptions] = useState<string[]>([])
	const [textAnswer, setTextAnswer] = useState('')
	const [selectedSpans, setSelectedSpans] = useState<SelectedSpan[]>([])
	const [hasSubmitted, setHasSubmitted] = useState(false)
	const [answerResult, setAnswerResult] = useState<{
		isCorrect: boolean
		explanation?: string
		awardedXp: number
		redFlagFeedback?: RedFlagFeedback[]
		falsePositives?: { location: string; text: string }[]
	} | null>(null)
	const isPortalReady = useSyncExternalStore(
		subscribeToPortalReady,
		getPortalClientSnapshot,
		getPortalServerSnapshot
	)

	const currentTask = tasks[currentTaskIndex]
	const isMultiChoice = currentTask?.type === 'MULTI_CHOICE'
	const isSimulator =
		currentTask?.type === 'PHISHING_EMAIL' ||
		currentTask?.type === 'PHISHING_SITE'
	const isTextTask =
		currentTask?.type === 'SHORT_ANSWER' || currentTask?.type === 'TEXT_INPUT'
	const isChoiceTask = !isSimulator && !isTextTask
	const isLastTask = currentTaskIndex >= tasks.length - 1
	const isFirstTask = currentTaskIndex === 0

	const hasAnswer = isSimulator
		? selectedSpans.length > 0
		: isTextTask
			? textAnswer.trim().length > 0
			: selectedOptions.length > 0

	const handleOptionToggle = (optionId: string) => {
		if (hasSubmitted) return

		if (isMultiChoice) {
			setSelectedOptions(prev =>
				prev.includes(optionId)
					? prev.filter(id => id !== optionId)
					: [...prev, optionId]
			)
		} else {
			setSelectedOptions([optionId])
		}
	}

	const handleSubmit = useCallback(async () => {
		if (!hasAnswer) {
			toast.error(
				isSimulator
					? t.dashboardTaskModal.errors.flagAtLeastOne
					: isTextTask
						? t.dashboardTaskModal.errors.typeAnswer
						: t.dashboardTaskModal.errors.selectOption
			)
			return
		}

		try {
			const result = await answerTask(currentTask.id, {
				selectedOptionIds: isChoiceTask ? selectedOptions : [],
				textAnswer: isTextTask ? textAnswer.trim() : undefined,
				selectedSpans: isSimulator ? selectedSpans : undefined,
			})

			setAnswerResult(result)
			setHasSubmitted(true)
		} catch {
			toast.error(t.dashboardTaskModal.errors.submitError)
		}
	}, [
		answerTask,
		currentTask,
		hasAnswer,
		isChoiceTask,
		isSimulator,
		isTextTask,
		selectedOptions,
		selectedSpans,
		t,
		textAnswer,
	])

	const handleNext = useCallback(() => {
		if (currentTaskIndex < tasks.length - 1) {
			onTaskChange(currentTaskIndex + 1)
		}
	}, [currentTaskIndex, onTaskChange, tasks.length])

	const handlePrev = useCallback(() => {
		if (currentTaskIndex > 0) {
			onTaskChange(currentTaskIndex - 1)
		}
	}, [currentTaskIndex, onTaskChange])

	const handleRetry = useCallback(() => {
		setSelectedOptions([])
		setTextAnswer('')
		setSelectedSpans([])
		setHasSubmitted(false)
		setAnswerResult(null)
	}, [])

	// The parent keys this modal by task id, so answer state resets through a
	// clean remount when the user moves between tasks. This effect only owns
	// the window-level keyboard subscription.
	useEffect(() => {
		if (!isOpen) return

		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key === 'Enter' &&
				!hasSubmitted &&
				hasAnswer &&
				!isAnswering &&
				!isTextTask
			) {
				void handleSubmit()
			}
			if (event.key === 'Escape') onClose()
			if (event.key === 'ArrowRight' && hasSubmitted && !isLastTask) {
				handleNext()
			}
			if (event.key === 'ArrowLeft' && !isFirstTask) handlePrev()
			if (
				event.key.toLowerCase() === 'r' &&
				hasSubmitted &&
				answerResult?.isCorrect === false
			) {
				handleRetry()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [
		answerResult,
		handleNext,
		handlePrev,
		handleRetry,
		handleSubmit,
		hasAnswer,
		hasSubmitted,
		isAnswering,
		isFirstTask,
		isLastTask,
		isOpen,
		isTextTask,
		onClose,
	])

	useEffect(() => {
		if (!isOpen) return

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'

		return () => {
			document.body.style.overflow = previousOverflow
		}
	}, [isOpen])

	const progress = ((currentTaskIndex + 1) / tasks.length) * 100

	if (!currentTask || !isPortalReady) return null

	const isCorrect = answerResult?.isCorrect === true


	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Overlay */}
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm h-screen'
						onClick={onClose}
					/>

					{/* Modal */}
					<m.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						role='dialog'
						aria-modal='true'
						aria-labelledby='task-modal-title'
						className='fixed inset-3 z-[101] m-auto max-h-[calc(100dvh-1.5rem)] w-auto max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-overlay p-5 shadow-2xl sm:inset-6 sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl sm:p-8'
						onClick={e => e.stopPropagation()}
					>
						{/* Close Button */}
						<button
							onClick={onClose}
							className='absolute right-4 top-4 rounded-xl bg-white/5 p-3 text-gray-400 transition-colors hover:bg-white/10 hover:text-foreground sm:right-6 sm:top-6'
						>
							<X className='h-5 w-5' />
						</button>

						{/* Header */}
						<div className='mb-6 flex items-center justify-between'>
							<div>
								<h3 id='task-modal-title' className='pr-12 text-2xl font-bold text-white'>
									{t.dashboardTaskModal.taskTemplate
										.replace('{current}', String(currentTaskIndex + 1))
										.replace('{total}', String(tasks.length))}
								</h3>
								<Badge className='mt-2 bg-blue-500/20 text-blue-400'>
									{t.dashboardTaskModal.xpTemplate.replace(
										'{points}',
										String(currentTask.points)
									)}
								</Badge>
							</div>
						</div>

						{/* Progress */}
						<div className='mb-6 h-2 overflow-hidden rounded-full bg-white/5'>
							<m.div
								initial={{ width: 0 }}
								animate={{ width: `${progress}%` }}
								transition={{ duration: 0.5 }}
								className='h-full bg-gradient-to-r from-blue-500 to-purple-500'
							/>
						</div>

						{/* Content */}
						<div className='space-y-6'>
							{/* Question */}
							<div>
								<div className='mb-3 flex items-center gap-2'>
									<Badge
										variant='outline'
										className={cn(
											'border-white/20',
											currentTask.difficulty === 'EASY' && 'border-green-500/40 text-green-400',
											currentTask.difficulty === 'MEDIUM' && 'border-yellow-500/40 text-yellow-400',
											currentTask.difficulty === 'HARD' && 'border-red-500/40 text-red-400'
										)}
									>
										{currentTask.difficulty === 'EASY' &&
											t.dashboardTaskModal.difficulty.easy}
										{currentTask.difficulty === 'MEDIUM' &&
											t.dashboardTaskModal.difficulty.medium}
										{currentTask.difficulty === 'HARD' &&
											t.dashboardTaskModal.difficulty.hard}
									</Badge>
									{isMultiChoice && (
										<Badge variant='outline' className='border-purple-500/40 text-purple-400'>
											{t.dashboardTaskModal.selectMultiple}
										</Badge>
									)}
								</div>
								<p className='text-lg font-medium text-white'>
									{currentTask.question || currentTask.title}
								</p>
							</div>

							{/* Phishing simulator */}
							{isSimulator && (
								<PhishingSimulator
									email={currentTask.email}
									site={currentTask.site}
									selectedSpans={selectedSpans}
									onChange={setSelectedSpans}
									hasSubmitted={hasSubmitted}
									feedback={answerResult?.redFlagFeedback}
									falsePositives={answerResult?.falsePositives}
								/>
							)}

							{/* Free-text answer */}
							{isTextTask && (
								<Textarea
									value={textAnswer}
									onChange={e => setTextAnswer(e.target.value)}
									disabled={hasSubmitted}
									rows={3}
									placeholder={t.dashboardTaskModal.textPlaceholder}
									className='resize-none border-white/10 bg-white/5 text-white placeholder:text-white/30'
								/>
							)}

							{/* Options */}
							<div className={cn('space-y-3', !isChoiceTask && 'hidden')}>
								{currentTask.options.map(option => (
									<m.button
										key={option.id}
										onClick={() => handleOptionToggle(option.id)}
										disabled={hasSubmitted}
										whileHover={!hasSubmitted ? { scale: 1.01, x: 4 } : {}}
										whileTap={!hasSubmitted ? { scale: 0.98 } : {}}
										className={cn(
											'w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden',
											selectedOptions.includes(option.id)
												? 'bg-blue-500/20 border-blue-400/40 shadow-lg ring-2 ring-blue-400/20'
												: 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10',
											hasSubmitted && 'cursor-not-allowed opacity-60'
										)}
									>
										{selectedOptions.includes(option.id) && (
											<m.div
												layoutId={`selected-${option.id}`}
												className='absolute right-4 top-1/2 -translate-y-1/2'
											>
												<CheckCircle2 className='h-5 w-5 text-blue-400' />
											</m.div>
										)}
										<span className='text-white'>{option.text}</span>
									</m.button>
								))}
							</div>

							{/* Result */}
							{hasSubmitted && answerResult !== null && (
								<m.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className={cn(
										'rounded-2xl border p-4',
										isCorrect
											? 'border-green-500/40 bg-green-500/10'
											: 'border-red-500/40 bg-red-500/10'
									)}
								>
									<div className='flex items-center gap-3'>
										{isCorrect ? (
											<CheckCircle2 className='h-6 w-6 text-green-400' />
										) : (
											<XCircle className='h-6 w-6 text-red-400' />
										)}
										<div>
											<p className='font-semibold text-white'>
												{isCorrect
													? t.dashboardTaskModal.result.correct
													: t.dashboardTaskModal.result.incorrect}
											</p>
											<p className='text-sm text-gray-400'>
												{isCorrect &&
													t.dashboardTaskModal.result.earnedXpTemplate.replace(
														'{xp}',
														String(answerResult.awardedXp)
													)}
												{answerResult.explanation}
											</p>
										</div>
									</div>
								</m.div>
							)}
						</div>

						{/* Footer */}
						<div className='mt-6 flex gap-3'>
							{!hasSubmitted ? (
								<Button
									onClick={handleSubmit}
									disabled={!hasAnswer || isAnswering}
									className='w-full rounded-xl bg-white py-6 text-base font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-50'
								>
									{isAnswering
										? t.dashboardTaskModal.buttons.submitting
										: t.dashboardTaskModal.buttons.checkAnswer}
								</Button>
							) : (
								<>
									{!isCorrect && (
										<Button
											onClick={handleRetry}
											variant='outline'
											className='flex-1 rounded-xl border-white/10 py-6 text-base font-semibold'
										>
											<RotateCcw className='mr-2 h-5 w-5' />
											{t.dashboardTaskModal.buttons.retry}
										</Button>
									)}
									{!isLastTask && (
										<Button
											onClick={handleNext}
											className='flex-1 rounded-xl bg-white py-6 text-base font-semibold text-black hover:bg-white/90'
										>
											{t.dashboardTaskModal.buttons.next}
											<ChevronRight className='ml-2 h-5 w-5' />
										</Button>
									)}
								</>
							)}
						</div>
					</m.div>
				</>
			)}
		</AnimatePresence>
		,
		document.body
	)
}
