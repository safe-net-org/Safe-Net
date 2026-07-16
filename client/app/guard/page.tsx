import type { Metadata } from 'next'
import {
	ArrowLeft,
	BookOpen,
	Cpu,
	Eye,
	Gauge,
	Globe,
	GraduationCap,
	Lock,
	Puzzle,
	ShieldCheck,
	Target,
	WifiOff,
	Zap,
} from 'lucide-react'
import Link from 'next/link'
import { GuardComparison } from './GuardComparison'
import { HomographReveal } from './HomographReveal'
import { UrlScanner } from './UrlScanner'

export const metadata: Metadata = {
	title: 'SafeNet Guard — the browser extension',
	description:
		'A Chrome extension that scores every link before the page loads, using the same rule engine the Safe-Net courses teach.',
}

const ENGINE_NODES = [
	{ Icon: GraduationCap, label: 'The course', note: 'teaches the rule' },
	{ Icon: Target, label: 'The simulator', note: 'tests you learned it' },
	{ Icon: Puzzle, label: 'The extension', note: 'enforces it live' },
]

const LAYERS = [
	{
		Icon: Gauge,
		title: 'Local rules',
		body: 'IDN homographs, typosquatting, leet-squatting, brand impersonation, URL structure. Under 5 ms, offline, zero data sent anywhere.',
		accent: true,
	},
	{
		Icon: Globe,
		title: 'Threat intel',
		body: 'RDAP/WHOIS age, DNS blocklists over DoH, URLhaus, Certificate Transparency. Network calls, opt-in.',
	},
	{
		Icon: Cpu,
		title: 'Machine learning',
		body: 'A fine-tuned BERT classifier, blended with the rules. Optional — the extension is fully functional without it.',
	},
	{
		Icon: Eye,
		title: 'Page analysis',
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

function Kbd({ children }: { children: React.ReactNode }) {
	return (
		<code className='rounded bg-slate-700/60 px-1.5 py-0.5 font-mono text-[13px] text-slate-200'>
			{children}
		</code>
	)
}

export default function GuardPage() {
	return (
		<div className='min-h-screen bg-slate-900 text-slate-100'>
			<div className='mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8'>
				{/* Top bar */}
				<div className='flex items-center justify-between py-6'>
					<Link
						href='/'
						className='inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white'
					>
						<ArrowLeft className='h-4 w-4' />
						Safe-Net
					</Link>
					<div className='inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1'>
						<Puzzle className='h-3.5 w-3.5 text-indigo-400' />
						<span className='text-xs font-medium text-slate-300'>
							Browser extension · AI
						</span>
					</div>
				</div>

				{/* Hero */}
				<section className='grid items-center gap-10 pt-6 pb-16 lg:grid-cols-2 lg:gap-14 lg:pt-12'>
					<div>
						<h1 className='text-4xl font-bold tracking-tight text-white sm:text-5xl'>
							Reads every link before you click.
						</h1>
						<p className='mt-6 max-w-xl text-lg leading-relaxed text-slate-400'>
							Over a thousand phishing sites go live every hour, and the dangerous
							ones are not ugly. Guard scores every URL before the page loads,
							blending a neural network with deterministic rules.
						</p>

						<div className='mt-7 flex flex-wrap gap-2.5'>
							<span className='inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300'>
								<Zap className='h-3.5 w-3.5 text-amber-400' />
								Under 5 ms, on your device
							</span>
							<span className='inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300'>
								<WifiOff className='h-3.5 w-3.5 text-emerald-400' />
								Zero bytes sent
							</span>
						</div>

						<a
							href='#scanner'
							className='group mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-transform hover:scale-[1.02]'
						>
							Try the live scanner
							<Zap className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
						</a>
					</div>

					<HomographReveal />
				</section>

				{/* One engine, three places */}
				<section className='mb-20 rounded-2xl border border-slate-700 bg-slate-800 p-6 sm:p-8'>
					<div className='mb-6 flex items-center gap-2'>
						<BookOpen className='h-4 w-4 text-indigo-400' />
						<h2 className='text-sm font-semibold uppercase tracking-wide text-indigo-300'>
							One engine, three places
						</h2>
					</div>

					<div className='flex flex-col items-stretch gap-3 sm:flex-row sm:items-center'>
						{ENGINE_NODES.map((node, i) => (
							<div key={node.label} className='flex items-center gap-3 sm:flex-1'>
								<div className='flex flex-1 items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 p-4'>
									<node.Icon className='h-5 w-5 shrink-0 text-indigo-400' />
									<div>
										<div className='font-semibold text-white'>{node.label}</div>
										<div className='text-xs text-slate-400'>{node.note}</div>
									</div>
								</div>
								{i < ENGINE_NODES.length - 1 && (
									<span className='hidden text-slate-600 sm:block'>→</span>
								)}
							</div>
						))}
					</div>

					<p className='mt-6 max-w-3xl text-sm leading-relaxed text-slate-400'>
						All three run <Kbd>@safe-net/guard-core</Kbd> — one implementation.
						That is not a slogan; it is the fix for a real bug. The rules were
						written twice and drifted: the courses taught{' '}
						<span className='font-mono text-slate-300'>paypa1.com</span> as the
						textbook example of phishing while the detector scored it 8/100, safe.
						Sharing the engine makes that contradiction impossible, and the tests
						now assert it.
					</p>
				</section>

				{/* Live scanner */}
				<section id='scanner' className='mb-20 scroll-mt-8'>
					<div className='mb-6'>
						<h2 className='text-3xl font-bold text-white sm:text-4xl'>Try it</h2>
						<p className='mt-2 text-slate-400'>
							The real engine, running in your browser right now — not a
							recording.
						</p>
					</div>
					<div className='rounded-2xl border border-slate-700 bg-slate-800 p-5 sm:p-7'>
						<UrlScanner />
					</div>
				</section>

				{/* Layers */}
				<section className='mb-20'>
					<h2 className='text-3xl font-bold text-white sm:text-4xl'>Four layers</h2>
					<p className='mb-6 mt-2 text-slate-400'>
						Only the first is required. Everything else degrades gracefully.
					</p>
					<div className='grid gap-4 sm:grid-cols-2'>
						{LAYERS.map((layer, i) => (
							<div
								key={layer.title}
								className={
									'rounded-2xl border p-5 transition-colors ' +
									(layer.accent
										? 'border-indigo-500/40 bg-slate-800'
										: 'border-slate-700 bg-slate-800 hover:border-slate-600')
								}
							>
								<div className='mb-3 flex items-center gap-3'>
									<div
										className={
											'flex h-9 w-9 items-center justify-center rounded-xl ' +
											(layer.accent ? 'bg-indigo-500/20' : 'bg-slate-700')
										}
									>
										<layer.Icon
											className={
												'h-5 w-5 ' +
												(layer.accent ? 'text-indigo-400' : 'text-slate-400')
											}
										/>
									</div>
									<span className='font-mono text-xs text-slate-500'>
										{String(i + 1).padStart(2, '0')}
									</span>
									<h3 className='font-semibold text-white'>{layer.title}</h3>
								</div>
								<p className='text-sm leading-relaxed text-slate-400'>
									{layer.body}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Comparison */}
				<GuardComparison />

				{/* Principles */}
				<section className='mb-20'>
					<h2 className='mb-6 text-3xl font-bold text-white sm:text-4xl'>
						Design rules
					</h2>
					<div className='grid gap-4 sm:grid-cols-3'>
						{PRINCIPLES.map(principle => (
							<div
								key={principle.title}
								className='rounded-2xl border border-slate-700 bg-slate-800 p-5 transition-colors hover:border-slate-600'
							>
								<div className='mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10'>
									<principle.Icon className='h-5 w-5 text-emerald-400' />
								</div>
								<h3 className='mb-1.5 font-semibold text-white'>
									{principle.title}
								</h3>
								<p className='text-sm leading-relaxed text-slate-400'>
									{principle.body}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Install */}
				<section className='rounded-2xl border border-slate-700 bg-slate-800 p-6 sm:p-8'>
					<div className='mb-5 flex items-center gap-2'>
						<ShieldCheck className='h-5 w-5 text-emerald-400' />
						<h2 className='text-xl font-bold text-white'>Run it locally</h2>
					</div>
					<ol className='space-y-3 text-sm text-slate-300'>
						<li className='flex gap-3'>
							<span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 font-mono text-xs text-slate-400'>
								1
							</span>
							<span>
								<Kbd>bun run build:ext</Kbd> from the repository root.
							</span>
						</li>
						<li className='flex gap-3'>
							<span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 font-mono text-xs text-slate-400'>
								2
							</span>
							<span>
								Open <Kbd>chrome://extensions</Kbd>, enable Developer mode.
							</span>
						</li>
						<li className='flex gap-3'>
							<span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 font-mono text-xs text-slate-400'>
								3
							</span>
							<span>
								Load unpacked → <Kbd>extension/.output/chrome-mv3</Kbd>
							</span>
						</li>
					</ol>
					<p className='mt-5 text-xs text-slate-500'>
						The ML layer is optional: <Kbd>bun run setup:ml</Kbd> once, then{' '}
						<Kbd>bun run dev</Kbd> starts it alongside the API and the web app.
					</p>
				</section>
			</div>
		</div>
	)
}
