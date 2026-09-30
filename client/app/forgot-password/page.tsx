'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ForgotPasswordRedirect() {
	const router = useRouter()
	useEffect(() => router.replace('/?auth=forgot'), [router])
	return null
}
