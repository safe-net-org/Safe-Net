'use client'

import { learningService } from '@/services/learning/learning.service'
import { useQuery } from '@tanstack/react-query'

export function useAchievements() {
	const userAchievementsQuery = useQuery({
		queryKey: ['user', 'achievements'],
		queryFn: () => learningService.getUserAchievements(),
		staleTime: 30000,
	})

	const allAchievementsQuery = useQuery({
		queryKey: ['achievements', 'all'],
		queryFn: () => learningService.getAllAchievements(),
		staleTime: 60000,
	})

	return {
		userAchievements: userAchievementsQuery.data,
		achievements: allAchievementsQuery.data,
		isUserAchievementsLoading: userAchievementsQuery.isLoading,
		isUserAchievementsError: userAchievementsQuery.isError,
		userAchievementsError: userAchievementsQuery.error,
		refetchUserAchievements: userAchievementsQuery.refetch,
		isLoading:
			userAchievementsQuery.isLoading || allAchievementsQuery.isLoading,
		isError: userAchievementsQuery.isError || allAchievementsQuery.isError,
		error: userAchievementsQuery.error || allAchievementsQuery.error,
		refetch: () => {
			userAchievementsQuery.refetch()
			allAchievementsQuery.refetch()
		},
	}
}
