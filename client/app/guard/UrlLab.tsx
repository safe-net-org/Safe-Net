'use client'

import { analyzeUrl, scoreUrl } from '@safe-net/guard-core'
import { useMemo, useState } from 'react'
import { translateRiskSignal } from '@/i18n/guard-signal-messages'
import { useI18n } from '@/i18n/LocaleProvider'

const REFERENCE_URL = 'https://paypal.com/login'
const reference = scoreUrl(REFERENCE_URL, analyzeUrl(REFERENCE_URL))

function buildUrl(protocol: 'https' | 'http', subdomain: string, domain: string, path: string): string | null {
	const host = [subdomain.trim(), domain.trim()].filter(Boolean).join('.')
	if (!host || /[\s/@?#:]/u.test(host) || !path.startsWith('/') || /\s/u.test(path)) return null
	const candidate = `${protocol}://${host}${path}`
	if (candidate.length > 2048) return null
	try {
		const parsed = new URL(candidate)
		if (!parsed.hostname || !['http:', 'https:'].includes(parsed.protocol)) return null
		return candidate
	} catch { return null }
}

export function UrlLab() {
	const { locale, t } = useI18n()
	const copy = t.guardPage.lab
	const [protocol, setProtocol] = useState<'https' | 'http'>('https')
	const [subdomain, setSubdomain] = useState('paypal.com')
	const [domain, setDomain] = useState('verify-account.example')
	const [path, setPath] = useState('/login')
	const [example, setExample] = useState<'subdomain' | 'long' | 'idn' | 'risky' | null>('risky')
	const loadExample = (kind: 'subdomain' | 'long' | 'idn' | 'risky') => {
		setProtocol('https')
		setExample(kind)
		if (kind === 'subdomain') { setSubdomain('mail'); setDomain('google.com'); setPath('/mail/u/0/') }
		if (kind === 'long') { setSubdomain('updates'); setDomain('example.test'); setPath(`/articles/${'account-notice-'.repeat(8)}`) }
		if (kind === 'idn') { setSubdomain('пример'); setDomain('example.test'); setPath('/information') }
		if (kind === 'risky') { setSubdomain('paypal.com'); setDomain('verify-account.example'); setPath('/login') }
	}
	const currentUrl = useMemo(() => buildUrl(protocol, subdomain, domain, path), [protocol, subdomain, domain, path])
	const current = useMemo(() => currentUrl ? scoreUrl(currentUrl, analyzeUrl(currentUrl)) : null, [currentUrl])
	const referenceKeys = new Set(reference.signals.map(signal => signal.key))
	const currentKeys = new Set(current?.signals.map(signal => signal.key) ?? [])
	const added = current?.signals.filter(signal => !referenceKeys.has(signal.key)) ?? []
	const removed = reference.signals.filter(signal => !currentKeys.has(signal.key))
	const labels = t.guardComponents.urlScanner.levels

	return (
		<section className='mb-20 rounded-2xl border border-border bg-card p-5 text-foreground sm:p-7' aria-labelledby='url-lab-heading'>
			<h2 id='url-lab-heading' className='text-2xl font-bold'>{copy.heading}</h2>
			<p className='mt-2 text-sm text-muted-foreground'>{copy.intro}</p>
			<div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
				<label className='text-sm'>{copy.protocol}
					<select value={protocol} onChange={event => { setProtocol(event.target.value as 'http' | 'https'); setExample(null) }} className='mt-1 block w-full rounded-lg border border-input bg-background p-2 font-mono text-sm'>
						<option value='https'>HTTPS</option><option value='http'>HTTP</option>
					</select>
				</label>
				<label className='text-sm'>{copy.subdomain}
					<input value={subdomain} onChange={event => { setSubdomain(event.target.value); setExample(null) }} className='mt-1 block w-full rounded-lg border border-input bg-background p-2 font-mono text-sm' spellCheck={false} />
				</label>
				<label className='text-sm'>{copy.domain}
					<input value={domain} onChange={event => { setDomain(event.target.value); setExample(null) }} className='mt-1 block w-full rounded-lg border border-input bg-background p-2 font-mono text-sm' spellCheck={false} />
				</label>
				<label className='text-sm'>{copy.path}
					<input value={path} onChange={event => { setPath(event.target.value); setExample(null) }} className='mt-1 block w-full rounded-lg border border-input bg-background p-2 font-mono text-sm' spellCheck={false} />
				</label>
			</div>
			<div className='mt-3 flex flex-wrap gap-2'>
				<button type='button' onClick={() => loadExample('subdomain')} aria-pressed={example === 'subdomain'} className='rounded-full border border-input px-3 py-1.5 text-xs hover:bg-secondary aria-pressed:bg-secondary'>{copy.benignExample}</button>
				<button type='button' onClick={() => loadExample('long')} aria-pressed={example === 'long'} className='rounded-full border border-input px-3 py-1.5 text-xs hover:bg-secondary aria-pressed:bg-secondary'>{copy.longExample}</button>
				<button type='button' onClick={() => loadExample('idn')} aria-pressed={example === 'idn'} className='rounded-full border border-input px-3 py-1.5 text-xs hover:bg-secondary aria-pressed:bg-secondary'>{copy.idnExample}</button>
				<button type='button' onClick={() => loadExample('risky')} aria-pressed={example === 'risky'} className='rounded-full border border-input px-3 py-1.5 text-xs hover:bg-secondary aria-pressed:bg-secondary'>{copy.riskyExample}</button>
			</div>
			{example && <p aria-live='polite' className='mt-3 text-sm text-muted-foreground'>{example === 'subdomain' ? copy.exampleSubdomain : example === 'long' ? copy.exampleLong : example === 'idn' ? copy.exampleIdn : copy.exampleRisky}</p>}
			<div aria-live='polite' className='mt-5 grid gap-3 sm:grid-cols-2'>
				<div className='min-w-0 rounded-xl border border-border bg-background p-4'>
					<h3 className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{copy.reference}</h3>
					<p className='mt-2 break-all font-mono text-xs'>{REFERENCE_URL}</p>
					<p className='mt-2 text-sm font-semibold'>{reference.score}/100 · {labels[reference.level]}</p>
				</div>
				<div className='min-w-0 rounded-xl border border-border bg-background p-4'>
					<h3 className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>{copy.changed}</h3>
					{current && currentUrl ? <><p className='mt-2 break-all font-mono text-xs'>{currentUrl}</p><p className='mt-2 text-sm font-semibold'>{current.score}/100 · {labels[current.level]}</p></> : <p className='mt-2 text-sm text-destructive'>{copy.invalid}</p>}
				</div>
			</div>
			{current && <div className='mt-4 grid gap-4 sm:grid-cols-2'>
				<div><h3 className='text-sm font-semibold'>{copy.added}</h3><ul className='mt-2 list-disc space-y-1 pl-5 text-sm'>{added.length ? added.map(signal => <li key={signal.key}>{translateRiskSignal(locale, signal, current.features)}</li>) : <li>{copy.none}</li>}</ul></div>
				<div><h3 className='text-sm font-semibold'>{copy.removed}</h3><ul className='mt-2 list-disc space-y-1 pl-5 text-sm'>{removed.length ? removed.map(signal => <li key={signal.key}>{translateRiskSignal(locale, signal, reference.features)}</li>) : <li>{copy.none}</li>}</ul></div>
			</div>}
			<p className='mt-4 text-xs text-muted-foreground'>{copy.caution}</p>
		</section>
	)
}
