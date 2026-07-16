'use client'
import { Shield } from 'lucide-react'

import { useI18n } from '@/i18n/LocaleProvider'

export default function Footer() {
	const { t } = useI18n()
	return (
		<footer className='bg-slate-800/50 border-t border-slate-800 py-12'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='grid md:grid-cols-3 gap-8 mb-8'>
					<div>
						<div className='flex items-center gap-3 mb-4'>
							<div className='w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center'>
								<Shield className='w-6 h-6 text-white' />
							</div>
							<div>
								<h4 className='text-lg font-bold text-white'>SafeNet</h4>
								<p className='text-xs text-slate-400'>{t.footer.tagline}</p>
							</div>
						</div>
						<p className='text-sm text-slate-400 leading-relaxed'>
							{t.footer.description}
						</p>
					</div>
					<div>
						<h5 className='text-white font-semibold mb-4'>
							{t.footer.navigation}
						</h5>
						<div className='space-y-2'>
							<a
								href='#features'
								className='block text-sm text-slate-400 hover:text-white transition-colors'
							>
								{t.nav.features}
							</a>
							<a
								href='#topics'
								className='block text-sm text-slate-400 hover:text-white transition-colors'
							>
								{t.nav.topics}
							</a>
							<a
								href='#stats'
								className='block text-sm text-slate-400 hover:text-white transition-colors'
							>
								{t.nav.statistics}
							</a>
						</div>
					</div>
					<div>
						<h5 className='text-white font-semibold mb-4'>{t.footer.contact}</h5>
						<div className='space-y-2'>
							<p className='text-sm text-slate-400'>SafeNet Team</p>
							<p className='text-sm text-slate-400'>Moscow, 2025</p>
						</div>
					</div>
				</div>
				<div className='pt-8 border-t border-slate-700 text-center'>
					<p className='text-sm text-slate-500'>
						© 2025 SafeNet — {t.footer.rights}
					</p>
				</div>
			</div>
		</footer>
	)
}
