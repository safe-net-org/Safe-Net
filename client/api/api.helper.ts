import axios from 'axios'

export const getContentType = () => ({
	'Content-Type': 'application/json'
})

interface ApiErrorData {
	message?: string | string[]
}

export const errorCatch = (error: unknown): string => {
	if (axios.isAxiosError<ApiErrorData>(error)) {
		const message = error.response?.data?.message
		if (Array.isArray(message)) return message[0] ?? 'Request failed'
		if (message) return message
	}
	return error instanceof Error ? error.message : 'Request failed'
}
