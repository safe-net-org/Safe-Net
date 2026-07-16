'use client'
import { LazyMotion, domAnimation } from 'framer-motion'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren, useState } from 'react'
import { Toaster } from 'sonner'
import { LocaleProvider } from '@/i18n/LocaleProvider'

export function Providers({ children }: PropsWithChildren) {
	const [client] = useState(new QueryClient())
	return (
		<QueryClientProvider client={client}>
			<LocaleProvider>
				<LazyMotion features={domAnimation}>{children}</LazyMotion>
				<Toaster position='top-right' theme='system' richColors expand />
			</LocaleProvider>
		</QueryClientProvider>
	)
}
