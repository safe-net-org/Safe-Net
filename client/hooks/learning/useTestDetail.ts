'use client'

import {
	ITestAnswer,
	learningService,
} from '@/services/learning/learning.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

type TestState = 'loading' | 'not-started' | 'active' | 'completed' | 'error'
type InteractiveTestState = Exclude<TestState, 'loading' | 'error'>

export function useTestDetail() {
	const params = useParams()
	const router = useRouter()
	const queryClient = useQueryClient() // ✅ Added
	const testId = params.id as string

	// State
	const [testState, setTestState] =
		useState<InteractiveTestState>('not-started')
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [answers, setAnswers] = useState<Map<string, string[]>>(new Map())
	const [elapsedTime, setElapsedTime] = useState(0)

	const timerRef = useRef<NodeJS.Timeout | null>(null)
	const isSubmittingRef = useRef(false)

	// Data fetching
	const {
		data: test,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ['test', testId],
		queryFn: () => learningService.getTestDetail(testId),
		enabled: !!testId,
	})

	const submitMutation = useMutation({
		mutationFn: (data: { answers: ITestAnswer[]; time: number }) =>
			learningService.submitTest(testId, data.answers, data.time),
		onSuccess: result => {
			setTestState('completed')

			// ✅ KEY: Invalidate the course cache to refresh progress
			if (test?.courseSlug) {
				queryClient.invalidateQueries({
					queryKey: ['course', test.courseSlug],
				})
				queryClient.invalidateQueries({
					queryKey: ['user-courses'],
				})
			}

			if (result.passed) {
				toast.success('Test passed!')
				if (result.certificateIssued) {
					toast.success('Certificate earned!', {
						duration: 5000,
						description: 'Congratulations on completing the course!',
					})
				}
			} else {
				toast.error(`Scored ${result.score}/${result.totalPoints} points`)
			}
		},
		onError: () => {
			toast.error('Error submitting test')
			isSubmittingRef.current = false
		},
	})

	// Computed values
	const questions = useMemo(() => test?.questions || [], [test?.questions])
	const currentQuestion = questions[currentQuestionIndex]
	const totalQuestions = questions.length
	const answeredCount = answers.size
	const progress =
		totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0
	const isMultiChoice = currentQuestion?.type === 'MULTI_CHOICE'
	const courseTitle = test?.course?.title || test?.courseTitle || ''
	const courseSlug = test?.course?.slug || test?.courseSlug || ''

	// Timer management
	const startTimer = useCallback(() => {
		setElapsedTime(0)
	}, [])

	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current)
			timerRef.current = null
		}
	}, [])

	useEffect(() => {
		if (testState !== 'active') return

		timerRef.current = setInterval(() => {
			setElapsedTime(prev => prev + 1)
		}, 1000)

		return stopTimer
	}, [testState, stopTimer])

	// Answer management
	const handleOptionToggle = useCallback(
		(optionId: string) => {
			if (!currentQuestion) return

			setAnswers(prev => {
				const newAnswers = new Map(prev)
				const questionId = currentQuestion.id
				const current = newAnswers.get(questionId) || []

				if (isMultiChoice) {
					const newSelections = current.includes(optionId)
						? current.filter(id => id !== optionId)
						: [...current, optionId]
					if (newSelections.length > 0) {
						newAnswers.set(questionId, newSelections)
					} else {
						newAnswers.delete(questionId)
					}
				} else {
					newAnswers.set(questionId, [optionId])
				}

				return newAnswers
			})
		},
		[currentQuestion, isMultiChoice]
	)

	const isOptionSelected = useCallback(
		(optionId: string): boolean => {
			if (!currentQuestion) return false
			return (answers.get(currentQuestion.id) || []).includes(optionId)
		},
		[currentQuestion, answers]
	)

	// Navigation
	const goToQuestion = useCallback(
		(index: number) => {
			if (index >= 0 && index < totalQuestions) {
				setCurrentQuestionIndex(index)
			}
		},
		[totalQuestions]
	)

	const goToCourse = useCallback(() => {
		if (courseSlug) {
			router.push(`/dashboard/courses/${courseSlug}`)
		} else {
			router.push('/dashboard')
		}
	}, [courseSlug, router])

	// Test actions
	const handleStartTest = useCallback(() => {
		setTestState('active')
		startTimer()
	}, [startTimer])

	const handleSubmitTest = useCallback(() => {
		if (!test || isSubmittingRef.current) return

		if (answeredCount < totalQuestions) {
			toast.error(
				`Please answer all questions (${answeredCount}/${totalQuestions})`
			)
			return
		}

		isSubmittingRef.current = true
		stopTimer()

		const formattedAnswers: ITestAnswer[] = questions.map(q => ({
			questionId: q.id,
			selectedOptionIds: answers.get(q.id) || [],
		}))

		submitMutation.mutate({ answers: formattedAnswers, time: elapsedTime })
	}, [
		test,
		answeredCount,
		totalQuestions,
		questions,
		answers,
		elapsedTime,
		stopTimer,
		submitMutation,
	])

	// Cleanup timer on unmount
	useEffect(() => {
		return stopTimer
	}, [stopTimer])

	return {
		// State
		testState: isLoading ? 'loading' : isError ? 'error' : testState,
		currentQuestionIndex,
		answers,
		elapsedTime,

		// Data
		test: test || null,
		isLoading,
		isError,

		// Computed
		questions,
		currentQuestion,
		totalQuestions,
		answeredCount,
		progress,
		isMultiChoice,
		courseTitle,
		courseSlug,

		// Actions
		handleOptionToggle,
		isOptionSelected,
		goToQuestion,
		goToCourse,
		handleStartTest,
		handleSubmitTest,

		// Mutation state
		isSubmitting: submitMutation.isPending,
		result: submitMutation.data,
	}
}
