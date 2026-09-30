'use client'

import { useI18n } from '@/i18n/LocaleProvider'
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

export function useLessonDetail() {
	const { t } = useI18n()
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

			return {
				...data,
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
			selectedSpans?: { location: string; text: string; start: number; end: number }[]
		}) =>
			learningService.answerTask(payload.taskId, {
				selectedOptionIds: payload.selectedOptionIds,
				textAnswer: payload.textAnswer,
				selectedSpans: payload.selectedSpans,
			}),
		onSuccess: (res: ITaskAnswerResponse, variables) => {
			// Update the lesson cache
			queryClient.setQueryData<LessonWithNav>(['lesson', lessonId], prev => {
				if (!prev || !prev.tasks) return prev
				return {
					...prev,
					tasks: prev.tasks.map((task: ITask) =>
						task.id === variables.taskId
							? { ...task, completed: task.completed || res.isCorrect }
							: task
					),
				}
			})

			// ✅ Show the result with an explanation
			if (res.isCorrect) {
				toast.success(t.dashboardLesson.toasts.correctTemplate.replace('{xp}', String(res.awardedXp)))
			} else {
				toast.error(t.dashboardLesson.toasts.incorrect)
			}

			// If the lesson is complete
			if (res.lessonCompleted) {
				toast.success(t.dashboardLesson.toasts.lessonCompleted)
			}

			// If a certificate was issued
			if (res.certificateIssued) {
				toast.success(t.dashboardLesson.toasts.certificateEarned)
			}

			// ✅ If there are new achievements
			if (res.newAchievements && res.newAchievements.length > 0) {
				toast.success(t.dashboardLesson.toasts.achievementsTemplate.replace('{count}', String(res.newAchievements.length)))
			}
		},
		onError: error => {
			toast.error(t.dashboardLesson.toasts.submitError)
			console.error(error)
		},
	})

	// ✅ Return a Promise with the result (including the explanation)
	const answerTask = async (
		taskId: string,
		payload: {
			selectedOptionIds: string[]
			textAnswer?: string
			selectedSpans?: { location: string; text: string; start: number; end: number }[]
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
