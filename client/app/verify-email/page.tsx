'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function VerifyEmailRedirect() {
	const router = useRouter()
	const token = useSearchParams().get('token')
	useEffect(() => {
		router.replace(`/?auth=verify${token ? `&token=${encodeURIComponent(token)}` : ''}`)
	}, [router, token])
	return null
}
