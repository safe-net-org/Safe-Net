import { adminService } from '@/services/admin/admin.service'
import { ITest } from '@/services/admin/admin.types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Query keys for cache invalidation
 */
const TESTS_QUERY_KEYS = {
	all: ['tests'] as const,
	detail: (id: string) => ['test', id] as const,
}

interface UseTestsReturn {
	tests: ITest[] | undefined
	isLoading: boolean
	error: Error | null
	refetch: () => void
	/** Resolves with the deleted id — the optimistic cache update needs it. */
	deleteTest: (testId: string) => Promise<string>
	isDeleting: boolean
}

/**
 * Hook for managing the list of tests
 * Encapsulates the API and state logic
 */
export function useTests(): UseTestsReturn {
	const queryClient = useQueryClient()

	// Fetching the list of tests
	const {
		data: tests,
		isLoading,
		error,
		refetch,
	} = useQuery<ITest[], Error>({
		queryKey: TESTS_QUERY_KEYS.all,
		queryFn: () => adminService.getTests(),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
	})

	// Test deletion mutation
	const deleteMutation = useMutation({
		mutationFn: async (testId: string) => {
			await adminService.deleteTest(testId)
			return testId
		},
		onSuccess: deletedTestId => {
			// Optimistic UI update
			queryClient.setQueryData<ITest[]>(TESTS_QUERY_KEYS.all, old => {
				return old?.filter(test => test.id !== deletedTestId) ?? []
			})

			// Invalidate cache for consistency
			queryClient.invalidateQueries({ queryKey: TESTS_QUERY_KEYS.all })

			toast.success('Test deleted successfully')
		},
		onError: (error: Error) => {
			console.error('[useTests] Delete error:', error)
			toast.error('Error deleting test')
		},
	})

	return {
		tests,
		isLoading,
		error: error as Error | null,
		refetch,
		deleteTest: deleteMutation.mutateAsync,
		isDeleting: deleteMutation.isPending,
	}
}
