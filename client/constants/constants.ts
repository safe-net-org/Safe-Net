// Hardcoding this made deploys impossible without a code change.
export const API_URL =
	process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4200/api'
export const IS_CLIENT = typeof window !== 'undefined'
