import Link from 'next/link'
import { ArrowLeft, AlertTriangle, ShieldCheck } from '@/components/ui/icons'

import { PreferencesControls } from '@/components/preferences/PreferencesControls'
import { legalConfig } from '@/config/legal.config'
import type { LegalDocument } from '@/i18n/legal-messages'
import { legalMessages } from '@/i18n/legal-messages'
import type { Locale } from '@/i18n/messages'

interface LegalDocumentPageProps {
	document: LegalDocument
	locale: Locale
}

export function LegalDocumentPage({
	document,
	locale,
}: LegalDocumentPageProps) {
	const common = legalMessages[locale].common
	const missing = [
		!legalConfig.ownerName && common.ownerMissing,
		!legalConfig.privacyContact && common.contactMissing,
		!legalConfig.jurisdiction && common.jurisdictionMissing,
	].filter(Boolean) as string[]

	return (
		<main className='min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 sm:py-12'>
			<div className='mx-auto max-w-3xl'>
				<div className='flex flex-wrap items-center justify-between gap-3'>
					<Link
						href='/'
						className='inline-flex items-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
					>
						<ArrowLeft className='h-4 w-4' aria-hidden='true' />
						{common.backHome}
					</Link>
					<PreferencesControls />
				</div>

				<header className='mt-10 border-b border-border pb-8'>
					<div className='mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary'>
						<ShieldCheck className='h-5 w-5' aria-hidden='true' />
					</div>
					<h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
						{document.title}
					</h1>
					<p className='mt-4 max-w-2xl text-base leading-7 text-muted-foreground'>
						{document.summary}
					</p>
					<div className='mt-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground'>
						<span>
							{common.documentVersion}: {legalConfig.version}
						</span>
						<span>
							{common.effectiveDate}: {legalConfig.effectiveDate}
						</span>
					</div>
				</header>

				{!legalConfig.isProductionReady && (
					<aside className='mt-8 rounded-2xl border border-warning/30 bg-warning/10 p-5'>
						<div className='flex items-start gap-3'>
							<AlertTriangle
								className='mt-0.5 h-5 w-5 shrink-0 text-warning'
								aria-hidden='true'
							/>
							<div>
								<h2 className='font-semibold'>{common.previewTitle}</h2>
								<p className='mt-1 text-sm leading-6 text-muted-foreground'>
									{common.previewBody}
								</p>
								<p className='mt-3 text-xs font-medium text-warning'>
									{missing.join(' · ')}
								</p>
							</div>
						</div>
					</aside>
				)}

				<div className='divide-y divide-border'>
					{document.sections.map(section => (
						<section key={section.heading} className='py-8'>
							<h2 className='text-xl font-semibold tracking-tight'>
								{section.heading}
							</h2>
							{section.paragraphs?.map(paragraph => (
								<p
									key={paragraph}
									className='mt-3 text-sm leading-7 text-muted-foreground sm:text-base'
								>
									{paragraph}
								</p>
							))}
							{section.items && (
								<ul className='mt-4 space-y-3'>
									{section.items.map(item => (
										<li
											key={item}
											className='flex gap-3 text-sm leading-6 text-muted-foreground sm:text-base'
										>
											<span
												className='mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary'
												aria-hidden='true'
											/>
											<span>{item}</span>
										</li>
									))}
								</ul>
							)}
						</section>
					))}
				</div>
			</div>
		</main>
	)
}
