import type { Metadata } from 'next'
import { getServerLocale } from '@/i18n/server'
import { messages } from '@/i18n/messages'
import { GuardPageContent } from './GuardPageContent'

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getServerLocale()
	return {
		title: messages[locale].seo.guardTitle,
		description: messages[locale].seo.guardDescription,
	}
}

export default function GuardPage() {
	return <GuardPageContent />
}
