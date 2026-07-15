'use client'

import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/config/pages-url.config'
import { useTestDetail } from '@/hooks/learning/useTestDetail'
import { cn } from '@/lib/utils'
import { AnimatePresence, m } from 'framer-motion'
import {
	AlertCircle,
	ArrowLeft,
	Award,
	BookOpen,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	FileQuestion,
	Loader2,
	Send,
	Sparkles,
	Target,
	Timer,
	Trophy,
	XCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const formatTime = (seconds: number): string => {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function TestPage() {
	const router = useRouter()
	const {
		testState,
		test,
		currentQuestionIndex,
		currentQuestion,
		totalQuestions,
		answeredCount,
		progress,
		isMultiChoice,
		courseTitle,
		courseSlug,
		elapsedTime,
		handleOptionToggle,
		isOptionSelected,
		goToQuestion,
		goToCourse,
		handleStartTest,
		handleSubmitTest,
		isSubmitting,
		result,
		questions,
	} = useTestDetail()

	// Loading state
	if (testState === 'loading') {
		return (
			<div>
				<div className='max-w-5xl mx-auto space-y-6'>
					<Skeleton className='h-12 w-64 bg-white/5' />
					<Skeleton className='h-48 w-full bg-white/5' />
					<Skeleton className='h-96 w-full bg-white/5' />
				</div>
			</div>
		)
	}

	// Error state
	if (testState === 'error' || !test) {
		return (
			<div>
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='max-w-md w-full'
				>
					<Card className='bg-white/5 border-red-500/20 backdrop-blur-xl'>
						<CardContent className='p-8 text-center space-y-4'>
							<AlertCircle className='w-16 h-16 mx-auto text-red-400' />
							<h2 className='text-2xl font-bold text-white'>Test not found</h2>
							<p className='text-white/60'>
								Check the link or contact the administrator
							</p>
							<Button
								onClick={() => router.push(ROUTES.HOME)}
								className='w-full'
							>
								<ArrowLeft className='w-4 h-4 mr-2' />
								Go home
							</Button>
						</CardContent>
					</Card>
				</m.div>
			</div>
		)
	}

	// Completed state
	if (testState === 'completed' && result) {
		return (
			<div>
				<div className='max-w-4xl mx-auto space-y-6'>
					<Button
						onClick={goToCourse}
						variant='ghost'
						className='p-0 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/5 group shadow-sm shrink-0 transition-all duration-300'
					>
						<ArrowLeft className='w-4 h-4 mr-2' />
						Back to course
					</Button>

					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className='space-y-6'
					>
						{/* Hero */}
						<Card className='bg-linear-to-br from-white/5 to-white/5 border-white/15 backdrop-blur-xl overflow-hidden relative'>
							<div className='absolute inset-0' />

							<CardContent className='p-8 sm:p-12 text-center space-y-6 relative z-10'>
								<m.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ type: 'spring', duration: 0.6 }}
								>
									{result.passed ? (
										<Trophy className='w-24 h-24 mx-auto text-yellow-400 drop-shadow-[0_0_24px_rgba(250,204,21,0.5)]' />
									) : (
										<XCircle className='w-24 h-24 mx-auto text-red-400' />
									)}
								</m.div>

								<div>
									<h1 className='text-4xl sm:text-5xl font-bold text-white mb-3'>
										{result.passed ? 'Congratulations!' : 'Try again'}
									</h1>
									<p className='text-xl text-white/60'>
										Scored{' '}
										<span className='font-bold text-white'>{result.score}</span>{' '}
										out of {result.totalPoints} points
									</p>
								</div>

								<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
									<div className='p-4 rounded-2xl bg-white/5 border border-white/5'>
										<Target className='w-5 h-5 text-blue-400 mx-auto mb-2' />
										<p className='text-3xl font-bold text-white'>
											{Math.round(
												(result.correctAnswers / result.totalQuestions) * 100
											)}
											%
										</p>
										<p className='text-sm text-white/60'>Accuracy</p>
									</div>

									<div className='p-4 rounded-2xl bg-white/5 border border-white/5'>
										<CheckCircle2 className='w-5 h-5 text-green-400 mx-auto mb-2' />
										<p className='text-3xl font-bold text-white'>
											{result.correctAnswers}/{result.totalQuestions}
										</p>
										<p className='text-sm text-white/60'>Correct</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Detailed results */}
						{result.answers && result.answers.length > 0 && (
							<Card className='bg-white/5 border-white/5 backdrop-blur-xl'>
								<CardContent className='p-6 space-y-4'>
									<h3 className='text-lg font-semibold text-white flex items-center gap-2'>
										<FileQuestion className='w-5 h-5' />
										Results by question
									</h3>

									<div className='space-y-3'>
										{result.answers.map((answer, idx) => {
											const question = questions[idx]
											return (
												<m.div
													key={answer.questionId}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: idx * 0.05 }}
												>
													<div
														className={cn(
															'p-4 rounded-xl border-2',
															answer.isCorrect
																? 'border-green-500/30 bg-green-500/10'
																: 'border-red-500/30 bg-red-500/10'
														)}
													>
														<div className='flex items-start gap-3'>
															{answer.isCorrect ? (
																<CheckCircle2 className='w-5 h-5 text-green-400 shrink-0 mt-0.5' />
															) : (
																<XCircle className='w-5 h-5 text-red-400 shrink-0 mt-0.5' />
															)}
															<div className='flex-1'>
																<p className='text-white/60 text-sm mb-1'>
																	Question {idx + 1}
																</p>
																<p className='text-white font-medium'>
																	{question?.text}
																</p>
															</div>
														</div>
													</div>
												</m.div>
											)
										})}
									</div>
								</CardContent>
							</Card>
						)}

						<div className='flex gap-3'>
							<Button
								onClick={goToCourse}
								size='lg'
								className='flex-1 w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-white/80 shadow-2xl shadow-white/15 font-bold text-sm sm:text-base'
							>
								Back to course
							</Button>
							{!result.passed && (
								<Button
									onClick={() => window.location.reload()}
									size='lg'
									variant='outline'
									className='flex-1 h-11 rounded-xl'
								>
									Retake
								</Button>
							)}
						</div>
					</m.div>
				</div>
			</div>
		)
	}

	// Not started state
	if (testState === 'not-started') {
		return (
			<div className='max-w-4xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12'>
				<Breadcrumb
					showBackButton
					items={[
						{ label: 'Courses', href: ROUTES.COURSES, icon: BookOpen },
						{
							label: test.courseTitle ?? 'Course',
							href: `${ROUTES.COURSES}/${test.courseSlug ?? ''}`,
						},
						{ label: test.title },
					]}
				/>

				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='space-y-6'
				>
					<Card className='bg-linear-to-br from-white/5 to-white/5 border-white/15 backdrop-blur-xl overflow-hidden relative'>
						<div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]' />

						<CardContent className='p-8 sm:p-12 space-y-8 relative z-10'>
							<div className='space-y-3'>
								<Badge variant='secondary' className='text-sm'>
									Test
								</Badge>
								<h1 className='text-4xl sm:text-5xl font-bold text-white'>
									{test.title}
								</h1>
								{test.description && (
									<p className='text-xl text-white/70'>{test.description}</p>
								)}
							</div>

							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5'>
									<div className='p-3 rounded-xl bg-blue-500/20'>
										<FileQuestion className='w-6 h-6 text-blue-400' />
									</div>
									<div>
										<p className='text-3xl font-bold text-white'>
											{test.questions.length}
										</p>
										<p className='text-sm text-white/60'>questions</p>
									</div>
								</div>

								<div className='flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5'>
									<div className='p-3 rounded-xl bg-green-500/20'>
										<Target className='w-6 h-6 text-green-400' />
									</div>
									<div>
										<p className='text-3xl font-bold text-white'>
											{test.passingScore}%
										</p>
										<p className='text-sm text-white/60'>passing score</p>
									</div>
								</div>
							</div>

							<Button
								onClick={handleStartTest}
								size='lg'
								className='w-full h-12 rounded-xl bg-white hover:bg-white/90 text-black font-bold disabled:opacity-50 shadow-lg'
							>
								<Sparkles className='w-5 h-5 mr-2' />
								Start test
							</Button>
						</CardContent>
					</Card>
				</m.div>
			</div>
		)
	}

	// Active test state
	return (
		<div>
			<div className='max-w-6xl mx-auto space-y-6'>
				{/* Header */}
				<div className='flex items-center justify-between gap-4'>
					<div className='flex items-center gap-3'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => router.back()}
							className='h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/5 group shadow-sm shrink-0 transition-all duration-300'
						>
							<ChevronLeft className='w-4 h-4 sm:w-5 sm:h-5 text-white/70 group-hover:text-white group-hover:-translate-x-1 transition-all duration-300' />
						</Button>
						<div>
							<p className='text-sm text-white/60'>{courseTitle}</p>
							<h1 className='text-xl font-bold text-white'>{test.title}</h1>
						</div>
					</div>

					<Badge
						variant='secondary'
						className='text-lg px-4 py-2 bg-white/3 backdrop-blur-2xl border border-white/5 rounded-2xl sm:rounded-3xl shadow-2xl text-white'
					>
						<Timer className='w-4 h-4 mr-2' />
						{formatTime(elapsedTime)}
					</Badge>
				</div>

				{/* Progress */}
				<Card className='bg-white/5 border-white/5 backdrop-blur-xl'>
					<CardContent className='p-6'>
						<div className='flex items-center justify-between mb-3'>
							<div className='flex items-center gap-2'>
								<Award className='w-5 h-5 text-blue-400' />
								<span className='text-white/60 font-medium'>Progress</span>
							</div>
							<div className='flex items-center gap-3'>
								<span className='text-sm text-white/60'>
									{answeredCount}/{totalQuestions}
								</span>
							</div>
						</div>
						<Progress
							value={Math.round(progress)}
							className='h-2 sm:h-2.5 bg-white/5 border border-white/5 rounded-full [&>div]:bg-linear-to-r [&>div]:from-blue-500 [&>div]:to-purple-500 [&>div]:shadow-lg'
						/>
					</CardContent>
				</Card>

				<div className='grid lg:grid-cols-[1fr,320px] gap-6'>
					{/* Question */}
					<AnimatePresence mode='wait'>
						{currentQuestion && (
							<m.div
								key={currentQuestion.id}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -20 }}
								transition={{ duration: 0.2 }}
							>
								<Card className='bg-linear-to-br from-white/5 to-white/5 border-white/15 backdrop-blur-xl overflow-hidden'>
									<CardContent className='p-8 space-y-6'>
										{/* Question header */}
										<div className='space-y-4'>
											<div className='flex items-center justify-between flex-wrap gap-3'>
												<Badge variant='secondary'>
													Question {currentQuestionIndex + 1} / {totalQuestions}
												</Badge>
												{isMultiChoice && (
													<Badge
														variant='outline'
														className='border-purple-400/40 text-purple-300'
													>
														Multiple choice
													</Badge>
												)}
											</div>

											<h2 className='text-2xl sm:text-3xl font-bold text-white leading-tight'>
												{currentQuestion.text}
											</h2>

											{isMultiChoice && (
												<p className='text-white/60 text-sm flex items-center gap-2'>
													<CheckCircle2 className='w-4 h-4' />
													You can select multiple options
												</p>
											)}
										</div>

										{/* Options */}
										<div className='space-y-3'>
											{currentQuestion.options?.map((option, idx) => {
												const isSelected = isOptionSelected(option.id)

												return (
													<m.button
														key={option.id}
														onClick={() => handleOptionToggle(option.id)}
														whileHover={{ scale: 1.005, x: 4 }}
														whileTap={{ scale: 0.995 }}
														className={cn(
															'w-full text-left p-5 rounded-2xl border-2 transition-all relative group',
															isSelected
																? 'bg-blue-500/20 border-blue-400/60 shadow-lg ring-2 ring-blue-400/20'
																: 'bg-white/5 border-white/5 hover:border-white/30 hover:bg-white/5'
														)}
													>
														<div className='flex items-center gap-4'>
															{/* Number */}
															<div
																className={cn(
																	'w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shrink-0',
																	isSelected
																		? 'bg-blue-500 text-white'
																		: 'bg-white/5 text-white/60 group-hover:bg-white/15'
																)}
															>
																{idx + 1}
															</div>

															{/* Text */}
															<span className='text-white text-lg flex-1'>
																{option.text}
															</span>

															{/* Check */}
															<AnimatePresence>
																{isSelected && (
																	<m.div
																		initial={{ scale: 0, rotate: -180 }}
																		animate={{ scale: 1, rotate: 0 }}
																		exit={{ scale: 0, rotate: 180 }}
																	>
																		<CheckCircle2 className='w-6 h-6 text-blue-400' />
																	</m.div>
																)}
															</AnimatePresence>
														</div>
													</m.button>
												)
											})}
										</div>

										{/* Navigation */}
										<div className='flex gap-3 pt-4'>
											<Button
												onClick={() => goToQuestion(currentQuestionIndex - 1)}
												disabled={currentQuestionIndex === 0}
												variant='outline'
												size='lg'
												className='flex-1 rounded-xl'
											>
												<ChevronLeft className='w-4 h-4 mr-2' />
												Back
											</Button>

											{currentQuestionIndex === totalQuestions - 1 ? (
												<Button
													onClick={handleSubmitTest}
													disabled={
														answeredCount < totalQuestions || isSubmitting
													}
													size='lg'
													className='flex-1 bg-linear-to-r from-green-500 to-emerald-500 rounded-xl'
												>
													{isSubmitting ? (
														<>
															<Loader2 className='w-4 h-4 mr-2 animate-spin' />
															Submitting...
														</>
													) : (
														<>
															<Send className='w-4 h-4 mr-2' />
															Complete
														</>
													)}
												</Button>
											) : (
												<Button
													onClick={() => goToQuestion(currentQuestionIndex + 1)}
													size='lg'
													className='flex-1 w-full rounded-xl bg-white hover:bg-white/90 text-black font-bold disabled:opacity-50 shadow-lg'
												>
													Next
													<ChevronRight className='w-4 h-4 ml-2' />
												</Button>
											)}
										</div>
									</CardContent>
								</Card>
							</m.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	)
}
