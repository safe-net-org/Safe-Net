import type { Metadata } from 'next'

import { LegalDocumentPage } from '@/components/legal/LegalDocumentPage'
import { getServerLocale } from '@/i18n/server'
import { legalMessages } from '@/i18n/legal-messages'

export async function generateMetadata(): Promise<Metadata> {
	const locale = await getServerLocale()
	return { title: legalMessages[locale].security.title }
}

export default async function SecurityPage() {
	const locale = await getServerLocale()
	return (
		<LegalDocumentPage
			document={legalMessages[locale].security}
			locale={locale}
		/>
	)
}
