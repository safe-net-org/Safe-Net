'use client'

import {
	ArrowLeft,
	BookOpen,
	Cpu,
	Download,
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
} from '@/components/ui/icons'
import Link from 'next/link'
import { PreferencesControls } from '@/components/preferences/PreferencesControls'
import { useI18n } from '@/i18n/LocaleProvider'
import { GuardComparison } from './GuardComparison'
import { HomographReveal } from './HomographReveal'
import { UrlScanner } from './UrlScanner'

function Kbd({ children }: { children: React.ReactNode }) {
	return (
		<code className='rounded bg-slate-700/60 px-1.5 py-0.5 font-mono text-[13px] text-slate-200'>
			{children}
		</code>
	)
}

export function GuardPageContent() {
	const { t } = useI18n()

	const ENGINE_NODES = [
		{ Icon: GraduationCap, ...t.guardPage.engine.nodes.course },
		{ Icon: Target, ...t.guardPage.engine.nodes.simulator },
		{ Icon: Puzzle, ...t.guardPage.engine.nodes.extension },
	]

	const LAYERS = [
		{ Icon: Gauge, ...t.guardPage.layers.local, accent: true },
		{ Icon: Globe, ...t.guardPage.layers.intel, accent: false },
		{ Icon: Cpu, ...t.guardPage.layers.ml, accent: false },
		{ Icon: Eye, ...t.guardPage.layers.page, accent: false },
	]

	const PRINCIPLES = [
		{ Icon: WifiOff, ...t.guardPage.principles.localFirst },
		{ Icon: Target, ...t.guardPage.principles.precision },
		{ Icon: Lock, ...t.guardPage.principles.explains },
	]

	return (
		<div className='min-h-screen bg-background text-foreground'>
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
					<div className='flex flex-wrap items-center justify-end gap-3'>
						<PreferencesControls />
						<div className='inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1'>
							<Puzzle className='h-3.5 w-3.5 text-indigo-400' />
							<span className='text-xs font-medium text-slate-300'>
								{t.guardPage.topBar.badge}
							</span>
						</div>
					</div>
				</div>

				{/* Hero */}
				<section className='grid items-center gap-10 pt-6 pb-16 lg:grid-cols-2 lg:gap-14 lg:pt-12'>
					<div>
						<h1 className='text-4xl font-bold tracking-tight text-white sm:text-5xl'>
							{t.guardPage.hero.title}
						</h1>
						<p className='mt-6 max-w-xl text-lg leading-relaxed text-slate-400'>
							{t.guardPage.hero.subtitle}
						</p>

						<div className='mt-7 flex flex-wrap gap-2.5'>
							<span className='inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300'>
								<Zap className='h-3.5 w-3.5 text-amber-400' />
								{t.guardPage.hero.badgeFast}
							</span>
							<span className='inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300'>
								<WifiOff className='h-3.5 w-3.5 text-emerald-400' />
								{t.guardPage.hero.badgeZero}
							</span>
						</div>

						<div className='mt-8 flex flex-wrap gap-3'>
							<a
								href='#scanner'
								className='group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-transform hover:scale-[1.02]'
							>
								{t.guardPage.hero.cta}
								<Zap className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
							</a>
							<a
								href='#install'
								className='inline-flex items-center gap-2 rounded-xl border border-slate-600 px-5 py-3 font-semibold text-slate-200 transition-colors hover:border-slate-400 hover:text-white'
							>
								<Download className='h-4 w-4' />
								{t.guardPage.hero.downloadCta}
							</a>
						</div>
					</div>

					<HomographReveal />
				</section>

				{/* One engine, three places */}
				<section className='mb-20 rounded-2xl border border-slate-700 bg-slate-800 p-6 sm:p-8'>
					<div className='mb-6 flex items-center gap-2'>
						<BookOpen className='h-4 w-4 text-indigo-400' />
						<h2 className='text-sm font-semibold uppercase tracking-wide text-indigo-300'>
							{t.guardPage.engine.heading}
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
						{t.guardPage.engine.paragraphIntro} <Kbd>@safe-net/guard-core</Kbd> —{' '}
						{t.guardPage.engine.paragraphMiddle}{' '}
						<span className='font-mono text-slate-300'>paypa1.com</span>{' '}
						{t.guardPage.engine.paragraphExample} {t.guardPage.engine.paragraphOutro}
					</p>
				</section>

				{/* Live scanner */}
				<section id='scanner' className='mb-20 scroll-mt-8'>
					<div className='mb-6'>
						<h2 className='text-3xl font-bold text-white sm:text-4xl'>
							{t.guardPage.scanner.heading}
						</h2>
						<p className='mt-2 text-slate-400'>{t.guardPage.scanner.subtitle}</p>
					</div>
					<div className='rounded-2xl border border-slate-700 bg-slate-800 p-5 sm:p-7'>
						<UrlScanner />
					</div>
				</section>

				{/* Layers */}
				<section className='mb-20'>
					<h2 className='text-3xl font-bold text-white sm:text-4xl'>
						{t.guardPage.layers.heading}
					</h2>
					<p className='mb-6 mt-2 text-slate-400'>{t.guardPage.layers.subtitle}</p>
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
						{t.guardPage.principles.heading}
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
				<section
					id='install'
					className='scroll-mt-8 rounded-2xl border border-slate-700 bg-slate-800 p-6 sm:p-8'
				>
					<div className='mb-5 flex items-center gap-2'>
						<ShieldCheck className='h-5 w-5 text-emerald-400' />
						<h2 className='text-xl font-bold text-white'>
							{t.guardPage.install.heading}
						</h2>
					</div>

					<div className='mb-6 flex flex-wrap items-center gap-4'>
						<a
							href='/downloads/safenet-guard-chrome.zip'
							download
							className='group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition-transform hover:scale-[1.02]'
						>
							<Download className='h-4 w-4 transition-transform group-hover:translate-y-0.5' />
							{t.guardPage.install.downloadCta}
						</a>
						<span className='text-xs text-slate-500'>
							{t.guardPage.install.downloadHint}
						</span>
					</div>

					<ol className='space-y-3 text-sm text-slate-300'>
						<li className='flex gap-3'>
							<span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 font-mono text-xs text-slate-400'>
								1
							</span>
							<span>{t.guardPage.install.step1}</span>
						</li>
						<li className='flex gap-3'>
							<span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 font-mono text-xs text-slate-400'>
								2
							</span>
							<span>
								{t.guardPage.install.step2Prefix}{' '}
								<Kbd>chrome://extensions</Kbd>
								{t.guardPage.install.step2Suffix}
							</span>
						</li>
						<li className='flex gap-3'>
							<span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 font-mono text-xs text-slate-400'>
								3
							</span>
							<span>{t.guardPage.install.step3}</span>
						</li>
					</ol>
					<p className='mt-5 text-xs text-slate-500'>
						{t.guardPage.install.sourcePrefix}{' '}
						<Kbd>bun run build:ext</Kbd> {t.guardPage.install.sourceMiddle}{' '}
						<Kbd>extension/.output/chrome-mv3</Kbd>
					</p>
					<p className='mt-2 text-xs text-slate-500'>
						{t.guardPage.install.footnotePrefix}{' '}
						<Kbd>bun run setup:ml</Kbd> {t.guardPage.install.footnoteMiddle}{' '}
						<Kbd>bun run dev</Kbd> {t.guardPage.install.footnoteSuffix}
					</p>
				</section>
			</div>
		</div>
	)
}
