import Link from 'next/link'

import { ArrowLeft, Home, Shield, ShieldAlert } from '@/components/ui/icons'

interface NotFoundViewProps {
	copy: {
		heading: string
		description: string
		back: string
		goHome: string
		footer: string
	}
}

export function NotFoundView({ copy }: NotFoundViewProps) {
	return (
		<div className='flex min-h-screen items-center justify-center bg-slate-950 px-4'>
			<div className='w-full max-w-2xl text-center'>
				<div className='mb-12 flex justify-center'>
					<div className='relative h-64 w-64'>
						<div className='absolute inset-0 animate-pulse rounded-full bg-slate-800/50 blur-xl' />
						<div className='absolute inset-0 flex items-center justify-center'>
							<div className='flex h-32 w-32 items-center justify-center rounded-3xl border border-slate-700/50 bg-linear-to-br from-slate-800 to-slate-900 shadow-2xl'>
								<ShieldAlert
									className='h-16 w-16 text-slate-500'
									strokeWidth={1.5}
									aria-hidden='true'
								/>
							</div>
						</div>
						<div className='absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 shadow-lg'>
							<Shield
								className='h-6 w-6 text-slate-600'
								strokeWidth={2}
								aria-hidden='true'
							/>
						</div>
						<div className='absolute bottom-8 left-8 h-16 w-16 rounded-2xl border border-slate-800 bg-slate-900 opacity-60 shadow-lg' />
					</div>
				</div>

				<h1 className='mb-4 text-[80px] font-semibold leading-none tracking-tighter text-white sm:text-[100px]'>
					404
				</h1>
				<h2 className='mb-3 text-[28px] font-semibold tracking-tight text-white sm:text-[32px]'>
					{copy.heading}
				</h2>
				<p className='mx-auto mb-10 max-w-md text-[17px] leading-relaxed text-slate-400'>
					{copy.description}
				</p>

				<div className='flex flex-col items-center justify-center gap-3 sm:flex-row'>
					<Link
						href='/dashboard'
						className='inline-flex min-w-[140px] items-center justify-center gap-2 rounded-[12px] border border-slate-800 bg-slate-900 px-6 py-3.5 text-[15px] font-medium text-white transition-colors duration-300 hover:bg-slate-800'
					>
						<ArrowLeft className='h-4 w-4' strokeWidth={2} aria-hidden='true' />
						<span>{copy.back}</span>
					</Link>
					<Link
						href='/'
						className='inline-flex min-w-[140px] items-center justify-center gap-2 rounded-[12px] bg-white px-6 py-3.5 text-[15px] font-medium text-slate-900 shadow-sm transition-colors duration-300 hover:bg-slate-100'
					>
						<Home className='h-4 w-4' strokeWidth={2} aria-hidden='true' />
						<span>{copy.goHome}</span>
					</Link>
				</div>

				<div className='mt-16 border-t border-slate-800 pt-8'>
					<div className='flex items-center justify-center gap-2 text-slate-500'>
						<Shield className='h-4 w-4' strokeWidth={2} aria-hidden='true' />
						<span className='text-[13px] font-medium'>{copy.footer}</span>
					</div>
				</div>
			</div>
		</div>
	)
}
