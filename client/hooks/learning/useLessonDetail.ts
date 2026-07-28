'use client'

import {
	ILesson,
	ITask,
	ITaskAnswerResponse,
	learningService,
} from '@/services/learning/learning.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

type LessonWithNav = ILesson & {
	courseTitle: string
	courseSlug: string
	estimatedDuration: number
	previousLessonId?: string | null
	nextLessonId?: string | null
}

// ✅ Utility for working with localStorage
const getCompletedTasks = (): Set<string> => {
	if (typeof window === 'undefined') return new Set()
	const stored = localStorage.getItem('completedTasks')
	return stored ? new Set(JSON.parse(stored)) : new Set()
}

const saveCompletedTask = (taskId: string) => {
	const completed = getCompletedTasks()
	completed.add(taskId)
	localStorage.setItem('completedTasks', JSON.stringify([...completed]))
}

export function useLessonDetail() {
	const params = useParams()
	const router = useRouter()
	const queryClient = useQueryClient()
	const lessonId = params.id as string

	const {
		data: lesson,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['lesson', lessonId],
		queryFn: async () => {
			const data = await learningService.getLessonDetail(lessonId)

			// ✅ Apply the saved completed state from localStorage
			const completedTasks = getCompletedTasks()
			const tasksWithCompleted = data.tasks?.map(task => ({
				...task,
				completed: task.completed || completedTasks.has(task.id),
			}))

			return {
				...data,
				tasks: tasksWithCompleted,
				courseTitle: data.courseTitle,
				courseSlug: data.courseSlug,
				estimatedDuration: data.estimatedDuration || 15,
			} as LessonWithNav
		},
		enabled: !!lessonId,
	})

	// Local progress calculations
	const tasks = (lesson?.tasks || []) as ITask[]
	const totalTasks = tasks.length
	const completedTasks = tasks.filter(t => t.completed).length
	const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

	// ✅ Mutation for submitting an answer to a task
	const answerMutation = useMutation({
		mutationFn: (payload: {
			taskId: string
			selectedOptionIds: string[]
			textAnswer?: string
			selectedSpans?: { location: string; text: string }[]
		}) =>
			learningService.answerTask(payload.taskId, {
				selectedOptionIds: payload.selectedOptionIds,
				textAnswer: payload.textAnswer,
				selectedSpans: payload.selectedSpans,
			}),
		onSuccess: (res: ITaskAnswerResponse, variables) => {
			// ✅ Save to localStorage if the answer is correct
			if (res.isCorrect) {
				saveCompletedTask(variables.taskId)
			}

			// Update the lesson cache
			queryClient.setQueryData<LessonWithNav>(['lesson', lessonId], prev => {
				if (!prev || !prev.tasks) return prev
				return {
					...prev,
					tasks: prev.tasks.map((task: ITask) =>
						task.id === variables.taskId
							? { ...task, completed: res.isCorrect }
							: task
					),
				}
			})

			// ✅ Show the result with an explanation
			if (res.isCorrect) {
				toast.success(`Correct! +${res.awardedXp} XP`)
			} else {
				toast.error('Incorrect. Try again!')
			}

			// If the lesson is complete
			if (res.lessonCompleted) {
				toast.success('Lesson completed!')
			}

			// If a certificate was issued
			if (res.certificateIssued) {
				toast.success('Certificate earned!')
			}

			// ✅ If there are new achievements
			if (res.newAchievements && res.newAchievements.length > 0) {
				res.newAchievements.forEach(achievement => {
					toast.success(`Achievement unlocked: ${achievement.title}`)
				})
			}
		},
		onError: error => {
			toast.error('Error submitting answer')
			console.error(error)
		},
	})

	// ✅ Return a Promise with the result (including the explanation)
	const answerTask = async (
		taskId: string,
		payload: {
			selectedOptionIds: string[]
			textAnswer?: string
			selectedSpans?: { location: string; text: string }[]
		}
	): Promise<ITaskAnswerResponse> => {
		return answerMutation.mutateAsync({ taskId, ...payload })
	}

	// Navigation between lessons
	const goToPrevLesson = () => {
		if (lesson?.previousLessonId) {
			router.push(
				`/dashboard/courses/${lesson.courseSlug}/${lesson.previousLessonId}`
			)
		}
	}

	const goToNextLesson = () => {
		if (lesson?.nextLessonId) {
			router.push(
				`/dashboard/courses/${lesson.courseSlug}/${lesson.nextLessonId}`
			)
		}
	}

	return {
		lesson: lesson || null,
		isLoading,
		isError,
		error,
		// Progress
		tasks,
		totalTasks,
		completedTasks,
		progress,
		estimatedDuration: lesson?.estimatedDuration || 1080,
		// Working with answers
		answerTask,
		isAnswering: answerMutation.isPending,
		// Navigation
		goToPrevLesson,
		goToNextLesson,
	}
}
