import type { Metadata } from 'next'
import {
	BookOpen,
	Cpu,
	Eye,
	Gauge,
	Globe,
	Lock,
	Puzzle,
	ShieldCheck,
	Target,
	WifiOff,
} from 'lucide-react'
import { UrlScanner } from './UrlScanner'

export const metadata: Metadata = {
	title: 'SafeNet Guard — the browser extension',
	description:
		'A Chrome extension that scores every link before the page loads, using the same rule engine the Safe-Net courses teach.',
}

const LAYERS = [
	{
		Icon: Gauge,
		title: '1 — Local rules',
		body: 'IDN homographs, typosquatting, leet-squatting, brand impersonation, URL structure. Under 5 ms, offline, zero data sent anywhere.',
		accent: true,
	},
	{
		Icon: Globe,
		title: '2 — Threat intel',
		body: 'RDAP/WHOIS age, DNS blocklists over DoH, URLhaus, Certificate Transparency. Network calls, opt-in.',
	},
	{
		Icon: Cpu,
		title: '3 — Machine learning',
		body: 'A fine-tuned BERT classifier in ml-service/. Optional — the extension is fully functional without it.',
	},
	{
		Icon: Eye,
		title: '4 — Page analysis',
		body: 'Login forms posting over HTTP, external form actions, obfuscated scripts, crypto wallet drainers asking for a seed phrase.',
	},
]

const PRINCIPLES = [
	{
		Icon: WifiOff,
		title: 'Local first',
		body: 'Layer 1 sends nothing. A tool that inspects every page you open must not be the thing that leaks your browsing.',
	},
	{
		Icon: Target,
		title: 'Precision over paranoia',
		body: 'Flagging everything is not protection, it is noise — and noise gets uninstalled. mail.google.com must stay green.',
	},
	{
		Icon: Lock,
		title: 'Explains itself',
		body: 'Every verdict names the specific signal that caused it. A warning you cannot understand teaches nothing.',
	},
]

export default function GuardPage() {
	return (
		<div className='min-h-screen bg-[#0A0F1D] text-white'>
			<div className='mx-auto max-w-5xl px-6 py-16 sm:py-24'>
				{/* Hero */}
				<div className='mb-16 max-w-3xl'>
					<div className='mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1'>
						<Puzzle className='h-3.5 w-3.5 text-purple-400' />
						<span className='font-mono text-[11px] uppercase tracking-[0.15em] text-purple-300'>
							Browser extension
						</span>
					</div>

					<h1 className='text-4xl font-bold tracking-tight sm:text-5xl'>
						SafeNet Guard
					</h1>

					<p className='mt-5 text-lg leading-relaxed text-white/60'>
						Over a thousand phishing sites go live every hour. The dangerous ones
						are not ugly — <span className='font-mono text-white/80'>sberbаnk.ru</span>{' '}
						is pixel-identical to the real thing, but the{' '}
						<span className='text-white/80'>а</span> is Cyrillic. Guard reads every
						URL before the page loads and says so.
					</p>
				</div>

				{/* The point of the whole project */}
				<section className='mb-16 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/[0.07] to-transparent p-6 sm:p-8'>
					<div className='mb-4 flex items-center gap-2'>
						<BookOpen className='h-4 w-4 text-purple-400' />
						<h2 className='text-sm font-semibold uppercase tracking-wide text-purple-300'>
							One engine, three places
						</h2>
					</div>
					<p className='max-w-3xl leading-relaxed text-white/70'>
						The course teaches a rule. The simulator tests whether you learned
						it. The extension enforces it while you browse. All three run{' '}
						<code className='rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-white/90'>
							@safe-net/guard-core
						</code>{' '}
						— one implementation.
					</p>
					<p className='mt-3 max-w-3xl text-sm leading-relaxed text-white/40'>
						That is not a slogan; it is the fix for a real bug. The rules were
						written twice, and the copies drifted: the courses taught{' '}
						<span className='font-mono'>paypa1.com</span> as the textbook example
						of phishing while the detector scored it 8/100 — safe. Sharing the
						engine makes that contradiction impossible, and the tests now assert
						it.
					</p>
				</section>

				{/* Live scanner */}
				<section className='mb-16'>
					<h2 className='mb-2 text-2xl font-bold'>Try it</h2>
					<p className='mb-6 text-sm text-white/50'>
						This is the real engine, not a demo recording.
					</p>
					<UrlScanner />
				</section>

				{/* Layers */}
				<section className='mb-16'>
					<h2 className='mb-2 text-2xl font-bold'>Four layers</h2>
					<p className='mb-6 text-sm text-white/50'>
						Only the first is required. Everything else degrades gracefully.
					</p>
					<div className='grid gap-3 sm:grid-cols-2'>
						{LAYERS.map(layer => (
							<div
								key={layer.title}
								className={
									'rounded-2xl border p-5 ' +
									(layer.accent
										? 'border-purple-500/25 bg-purple-500/[0.07]'
										: 'border-white/10 bg-white/[0.02]')
								}
							>
								<layer.Icon
									className={
										'mb-3 h-5 w-5 ' +
										(layer.accent ? 'text-purple-400' : 'text-white/40')
									}
								/>
								<h3 className='mb-1.5 font-semibold'>{layer.title}</h3>
								<p className='text-sm leading-relaxed text-white/50'>
									{layer.body}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Principles */}
				<section className='mb-16'>
					<h2 className='mb-6 text-2xl font-bold'>Design rules</h2>
					<div className='grid gap-3 sm:grid-cols-3'>
						{PRINCIPLES.map(principle => (
							<div
								key={principle.title}
								className='rounded-2xl border border-white/10 bg-white/[0.02] p-5'
							>
								<principle.Icon className='mb-3 h-5 w-5 text-emerald-400' />
								<h3 className='mb-1.5 font-semibold'>{principle.title}</h3>
								<p className='text-sm leading-relaxed text-white/50'>
									{principle.body}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Install */}
				<section className='rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8'>
					<div className='mb-4 flex items-center gap-2'>
						<ShieldCheck className='h-5 w-5 text-emerald-400' />
						<h2 className='text-xl font-bold'>Run it locally</h2>
					</div>
					<ol className='space-y-2 text-sm text-white/60'>
						<li>
							<span className='text-white/30'>1.</span>{' '}
							<code className='rounded bg-white/10 px-1.5 py-0.5 font-mono text-white/90'>
								bun run build:ext
							</code>{' '}
							from the repository root.
						</li>
						<li>
							<span className='text-white/30'>2.</span> Open{' '}
							<code className='rounded bg-white/10 px-1.5 py-0.5 font-mono text-white/90'>
								chrome://extensions
							</code>
							, enable Developer mode.
						</li>
						<li>
							<span className='text-white/30'>3.</span> Load unpacked →{' '}
							<code className='rounded bg-white/10 px-1.5 py-0.5 font-mono text-white/90'>
								extension/.output/chrome-mv3
							</code>
						</li>
					</ol>
					<p className='mt-4 text-xs text-white/30'>
						The ML layer is optional:{' '}
						<code className='font-mono'>bun run setup:ml</code> once, then{' '}
						<code className='font-mono'>bun run dev</code> starts it alongside the
						API and the web app.
					</p>
				</section>
			</div>
		</div>
	)
}
