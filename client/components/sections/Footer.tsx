'use client'

import { Shield } from '@/components/ui/icons'
import Link from 'next/link'

import { useI18n } from '@/i18n/LocaleProvider'

export default function Footer() {
	const { t } = useI18n()
	const year = new Date().getFullYear()

	return (
		<footer className='border-t border-border bg-card/70 py-12'>
			<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
				<div className='mb-8 grid gap-10 md:grid-cols-3'>
					<div>
						<div className='mb-4 flex items-center gap-3'>
							<div className='flex size-10 items-center justify-center rounded-xl bg-brand text-white'>
								<Shield className='size-5' aria-hidden='true' />
							</div>
							<div>
								<p className='text-lg font-semibold text-foreground'>SafeNet</p>
								<p className='text-xs text-muted-foreground'>{t.footer.tagline}</p>
							</div>
						</div>
						<p className='max-w-sm text-sm leading-6 text-muted-foreground'>
							{t.footer.description}
						</p>
					</div>
					<div>
						<h2 className='mb-4 text-sm font-semibold text-foreground'>
							{t.footer.navigation}
						</h2>
						<div className='space-y-2'>
							<a
								href='#features'
								className='block text-sm text-muted-foreground transition-colors hover:text-foreground'
							>
								{t.nav.features}
							</a>
							<a
								href='#topics'
								className='block text-sm text-muted-foreground transition-colors hover:text-foreground'
							>
								{t.nav.topics}
							</a>
							<a
								href='#stats'
								className='block text-sm text-muted-foreground transition-colors hover:text-foreground'
							>
								{t.nav.statistics}
							</a>
							<Link
								href='/guard'
								className='block text-sm text-muted-foreground transition-colors hover:text-foreground'
							>
								{t.nav.aiGuard}
							</Link>
						</div>
					</div>
					<div>
						<h2 className='mb-4 text-sm font-semibold text-foreground'>
							{t.footer.legal}
						</h2>
						<div className='space-y-2'>
							<Link
								href='/legal/privacy'
								className='block text-sm text-muted-foreground transition-colors hover:text-foreground'
							>
								{t.footer.privacy}
							</Link>
							<Link
								href='/legal/terms'
								className='block text-sm text-muted-foreground transition-colors hover:text-foreground'
							>
								{t.footer.terms}
							</Link>
							<Link
								href='/legal/cookies'
								className='block text-sm text-muted-foreground transition-colors hover:text-foreground'
							>
								{t.footer.cookies}
							</Link>
							<Link
								href='/legal/security'
								className='block text-sm text-muted-foreground transition-colors hover:text-foreground'
							>
								{t.footer.security}
							</Link>
						</div>
					</div>
				</div>
				<div className='flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
					<p>
						© {year} SafeNet — {t.footer.rights}
					</p>
					<p>
						<span className='font-medium text-foreground'>{t.footer.preview}.</span>{' '}
						{t.footer.detailsPending}
					</p>
				</div>
			</div>
		</footer>
	)
}
