'use client'

import type { ReactNode } from 'react'

import { Shield } from '@/components/ui/icons'

import { NotFoundView } from '@/components/errors/NotFoundView'
import { useProfile } from '@/hooks/user/useProfile'
import { useI18n } from '@/i18n/LocaleProvider'

export default function AdminLayout({ children }: { children: ReactNode }) {
	const { isLoading, user } = useProfile()
	const { t } = useI18n()

	if (isLoading) {
		return (
			<div
				className='flex min-h-screen items-center justify-center bg-background'
				aria-label={t.dashboardHome.motivational.loading}
				role='status'
			>
				<div className='text-muted-foreground'>
					<Shield className='h-8 w-8 animate-pulse' aria-hidden='true' />
					<span className='sr-only'>{t.dashboardHome.motivational.loading}</span>
				</div>
			</div>
		)
	}

	if (!user?.isAdmin) {
		return <NotFoundView copy={t.notFound} />
	}

	return children
}
