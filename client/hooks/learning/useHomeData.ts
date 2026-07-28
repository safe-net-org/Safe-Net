import { learningService } from '@/services/learning/learning.service'
import { useQuery } from '@tanstack/react-query'

export function useHomeData() {
	const stagesQuery = useQuery({
		queryKey: ['learning', 'stages'],
		queryFn: () => learningService.getStages(),
	})

	const coursesQuery = useQuery({
		queryKey: ['user', 'courses', 'home'],
		queryFn: async () => {
			const [allCourses, completedCourses] = await Promise.all([
				learningService.getMyCourses(),
				learningService.getCompletedCourses(),
			])
			const completedIds = new Set(completedCourses.map(c => c.id))
			const activeCourses = allCourses.filter(
				course => !completedIds.has(course.id)
			)

			const totalXp = allCourses.reduce(
				(acc, course) => acc + (course.totalXp || 0),
				0
			)

			return {
				active: activeCourses,
				completedCount: completedCourses.length,
				totalXp,
			}
		},
	})

	return {
		stages: stagesQuery.data ?? [],
		isStagesLoading: stagesQuery.isLoading,
		isStagesError: stagesQuery.isError,
		stagesError: stagesQuery.error,
		refetchStages: stagesQuery.refetch,
		myCourses: coursesQuery.data?.active ?? [],
		completedCount: coursesQuery.data?.completedCount ?? 0,
		totalXp: coursesQuery.data?.totalXp ?? 0,
		isMyCoursesLoading: coursesQuery.isLoading,
		isMyCoursesError: coursesQuery.isError,
		myCoursesError: coursesQuery.error,
		refetchMyCourses: coursesQuery.refetch,
	}
}
