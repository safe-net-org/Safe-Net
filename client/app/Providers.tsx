'use client'
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren, useState } from 'react'
import { Toaster } from 'sonner'
import { ThemeProvider, useTheme } from '@/components/theme/ThemeProvider'
import { CookieNotice } from '@/components/legal/CookieNotice'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import type { Locale } from '@/i18n/messages'
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget'

interface ProvidersProps extends PropsWithChildren {
	initialLocale: Locale
}

function AppToaster() {
	const { mounted, resolvedTheme } = useTheme()

	return (
		<Toaster position='top-right' theme={mounted ? resolvedTheme : 'system'} richColors expand />
	)
}

export function Providers({ children, initialLocale }: ProvidersProps) {
	const [client] = useState(new QueryClient())
	return (
		<QueryClientProvider client={client}>
			<ThemeProvider>
				<LocaleProvider initialLocale={initialLocale}>
					<MotionConfig reducedMotion='user'>
						<LazyMotion features={domAnimation}>
							{children}
							<CookieNotice />
							<FeedbackWidget />
						</LazyMotion>
					</MotionConfig>
					<AppToaster />
				</LocaleProvider>
			</ThemeProvider>
		</QueryClientProvider>
	)
}
