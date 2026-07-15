import { adminService } from '@/services/admin/admin.service'
import { ITest } from '@/services/admin/admin.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface UseTestReturn {
	test: ITest | undefined
	isLoading: boolean
	error: Error | null
	refetch: () => void
	/** Resolves with the payload that was sent — used by the optimistic update. */
	updateTest: (data: Partial<ITest>) => Promise<Partial<ITest>>
	isUpdating: boolean
}

/**
 * Hook for working with a single test
 * Provides type safety and encapsulation of the logic
 */
export function useTest(testId: string): UseTestReturn {
	const queryClient = useQueryClient()

	// Fetching test details
	const {
		data: test,
		isLoading,
		error,
		refetch,
	} = useQuery<ITest, Error>({
		queryKey: ['test', testId],
		queryFn: () => adminService.getTest(testId),
		enabled: Boolean(testId), // Guard against an empty ID
		staleTime: 2 * 60 * 1000, // 2 minutes
	})

	// Test update mutation
	const updateMutation = useMutation({
		mutationFn: async (data: Partial<ITest>) => {
			await adminService.updateTest(testId, data)
			return data
		},
		onMutate: async updatedData => {
			// Cancel pending queries for optimistic update
			await queryClient.cancelQueries({ queryKey: ['test', testId] })

			// Save the previous data for rollback
			const previousTest = queryClient.getQueryData<ITest>(['test', testId])

			// Optimistic update
			if (previousTest) {
				queryClient.setQueryData<ITest>(['test', testId], {
					...previousTest,
					...updatedData,
				})
			}

			return { previousTest }
		},
		onError: (error: Error, _variables, context) => {
			// Roll back on error
			if (context?.previousTest) {
				queryClient.setQueryData(['test', testId], context.previousTest)
			}

			console.error('[useTest] Update error:', error)
			toast.error('Error updating test')
		},
		onSuccess: () => {
			// Invalidate related queries
			queryClient.invalidateQueries({ queryKey: ['test', testId] })
			queryClient.invalidateQueries({ queryKey: ['tests'] })

			toast.success('Test updated')
		},
	})

	return {
		test,
		isLoading,
		error: error as Error | null,
		refetch,
		updateTest: updateMutation.mutateAsync,
		isUpdating: updateMutation.isPending,
	}
}
