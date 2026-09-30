'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function ResetPasswordRedirect() {
	const router = useRouter()
	const token = useSearchParams().get('token')
	useEffect(() => {
		router.replace(`/?auth=reset${token ? `&token=${encodeURIComponent(token)}` : ''}`)
	}, [router, token])
	return null
}
