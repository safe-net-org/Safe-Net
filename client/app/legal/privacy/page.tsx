import type { Metadata } from 'next'

import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage'
import { getServerLocale } from '@/i18n/server'
import { legalMessages } from '@/i18n/legal-messages'

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getServerLocale()
	return { title: legalMessages[locale].privacy.title }
}

export default async function PrivacyPage() {
	const locale = await getServerLocale()
	return (
		<LegalDocumentPage
			document={legalMessages[locale].privacy}
			locale={locale}
		/>
	)
}
