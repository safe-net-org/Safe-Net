import userService from '@/services/user/user.service'
import { transformUserToState } from '@/utils/transform-user-to-state'
import { useQuery } from '@tanstack/react-query'


export function useProfile() {
	const { data, isLoading } = useQuery({
		queryKey: ['profile'],
		queryFn: () => userService.fetchProfile(),
		refetchInterval: 1800000
	})
	const profile = data?.data
	const userState = profile ? transformUserToState(profile) : null
	return {
		isLoading,
		user: {
			...profile,
			...userState
		}
	}
}
