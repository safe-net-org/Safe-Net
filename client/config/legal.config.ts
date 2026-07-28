export const CURRENT_LEGAL_VERSION = '2026-07-26'

const ownerName = process.env.NEXT_PUBLIC_LEGAL_ENTITY?.trim() || null
const privacyContact = process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() || null
const jurisdiction = process.env.NEXT_PUBLIC_LEGAL_JURISDICTION?.trim() || null

export const legalConfig = {
	version: CURRENT_LEGAL_VERSION,
	effectiveDate: '2026-07-26',
	ownerName,
	privacyContact,
	jurisdiction,
	isProductionReady: Boolean(ownerName && privacyContact && jurisdiction),
} as const
