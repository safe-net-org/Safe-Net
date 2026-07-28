import { themeBootstrapScript } from '@/components/theme/ThemeProvider'
import { SITE_NAME } from '@/constants/seo.constants'
import { getServerLocale } from '@/i18n/server'
import { messages } from '@/i18n/messages'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import { Providers } from './Providers'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getServerLocale()
	return {
		title: {
			default: SITE_NAME,
			template: `%s | ${SITE_NAME}`
		},
		description: messages[locale].seo.rootDescription,
		icons: '/favicon.ico'
	}
}

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	const locale = await getServerLocale()
	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				<script id='safenet-theme' dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
			</head>
			<body
				className={`${GeistSans.variable} ${GeistMono.variable} bg-background text-foreground antialiased`}
			>
				<Providers initialLocale={locale}>{children}</Providers>
			</body>
		</html>
	)
}
