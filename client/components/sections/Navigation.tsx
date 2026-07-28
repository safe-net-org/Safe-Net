'use client'

import Link from 'next/link'
import { LogIn, LogOut, Menu, Shield, X } from '@/components/ui/icons'
import { useState } from 'react'

import { AuthDialog } from '@/components/Auth/AuthDialog'
import { PreferencesControls } from '@/components/preferences/PreferencesControls'
import { useLogout } from '@/hooks/user/useLogout'
import { useProfile } from '@/hooks/user/useProfile'
import { useI18n } from '@/i18n/LocaleProvider'

export default function Navigation() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const { user, isLoading } = useProfile()
	const { logout } = useLogout()
	const { t } = useI18n()
	const isAuthenticated = !!user?.isLoggedIn

	const handleLogout = () => {
		setMobileMenuOpen(false)
		logout()
	}

	return (
		<nav
			className='sticky top-0 z-50 border-b border-landing-border bg-landing/80 backdrop-blur-xl'
			aria-label={t.nav.primaryNavigation}
		>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between h-16'>
					<a
						href='#top'
						className='flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60'
						aria-label='SafeNet'
					>
						<div className='w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center'>
							<Shield className='w-6 h-6 text-white' />
						</div>
						<div>
							<span className='block text-lg font-bold'>SafeNet</span>
							<p className='-mt-1 text-xs text-muted-foreground'>{t.footer.tagline}</p>
						</div>
					</a>

					{/* Desktop Navigation */}
					<div className='hidden lg:flex items-center gap-5'>
						<a
							href='#features'
							className='text-sm text-landing-muted hover:text-landing-foreground transition-colors'
						>
							{t.nav.features}
						</a>
						<a
							href='#topics'
							className='text-sm text-landing-muted hover:text-landing-foreground transition-colors'
						>
							{t.nav.topics}
						</a>
						<a
							href='#stats'
							className='text-sm text-landing-muted hover:text-landing-foreground transition-colors'
						>
							{t.nav.statistics}
						</a>
						<a
							href='#guard'
							className='text-sm font-medium text-landing-accent hover:text-landing-accent-hover transition-colors'
						>
							{t.nav.aiGuard}
						</a>

						<PreferencesControls />

						{!isLoading && !isAuthenticated && (
							<AuthDialog
								triggerButton={{
									text: t.nav.signIn,
									icon: <LogIn className='size-4' aria-hidden='true' />,
									position: 'start',
									className:
										'inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60'
								}}
							/>
						)}

						{!isLoading && isAuthenticated && user && (
							<div className='flex items-center gap-1.5'>
								<Link
									href='/dashboard'
									className='relative flex size-9 items-center justify-center rounded-full bg-linear-to-r from-indigo-500 to-purple-500 text-base font-semibold text-white shadow-sm transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60'
									aria-label={t.nav.profile}
									title={t.nav.profile}
								>
									{user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
								</Link>
								<button
									type='button'
									onClick={handleLogout}
									className='flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40'
									aria-label={t.nav.logout}
									title={t.nav.logout}
								>
									<LogOut className='size-4' aria-hidden='true' />
								</button>
							</div>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						type='button'
						className='lg:hidden rounded-lg p-2 text-landing-muted transition-colors hover:bg-landing-surface hover:text-landing-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60'
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
						aria-expanded={mobileMenuOpen}
						aria-controls='landing-mobile-menu'
					>
						{mobileMenuOpen ? (
							<X className='w-6 h-6' aria-hidden='true' />
						) : (
							<Menu className='w-6 h-6' aria-hidden='true' />
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<div
						id='landing-mobile-menu'
						className='lg:hidden space-y-3 border-t border-landing-border py-4'
						aria-label={t.nav.mobileMenu}
					>
						<a
							href='#features'
							onClick={() => setMobileMenuOpen(false)}
							className='block text-sm text-landing-muted hover:text-landing-foreground transition-colors'
						>
							{t.nav.features}
						</a>
						<a
							href='#topics'
							onClick={() => setMobileMenuOpen(false)}
							className='block text-sm text-landing-muted hover:text-landing-foreground transition-colors'
						>
							{t.nav.topics}
						</a>
						<a
							href='#stats'
							onClick={() => setMobileMenuOpen(false)}
							className='block text-sm text-landing-muted hover:text-landing-foreground transition-colors'
						>
							{t.nav.statistics}
						</a>
						<a
							href='#guard'
							onClick={() => setMobileMenuOpen(false)}
							className='block text-sm font-medium text-landing-accent hover:text-landing-accent-hover transition-colors'
						>
							{t.nav.aiGuard}
						</a>

						<PreferencesControls />

						{!isLoading && !isAuthenticated && (
							<AuthDialog
								triggerButton={{
									text: t.nav.signIn,
									icon: <LogIn className='size-4' aria-hidden='true' />,
									position: 'start',
									className:
										'flex h-10 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60'
								}}
							/>
						)}

						{!isLoading && isAuthenticated && user && (
							<>
								<Link
									href='/dashboard'
									onClick={() => setMobileMenuOpen(false)}
									className='flex items-center gap-3 rounded-xl border border-landing-border bg-landing-surface p-3 text-sm text-landing-foreground'
								>
									<span className='flex size-8 items-center justify-center rounded-full bg-linear-to-r from-indigo-500 to-purple-500 font-semibold text-white'>
										{user.name?.charAt(0).toUpperCase() ||
											user.email?.charAt(0).toUpperCase() ||
											'?'}
									</span>
									<span className='min-w-0 truncate'>{user.name || user.email}</span>
								</Link>
								<button
									type='button'
									onClick={handleLogout}
									className='flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40'
								>
									<LogOut className='w-4 h-4' aria-hidden='true' />
									{t.nav.logout}
								</button>
							</>
						)}
					</div>
				)}
			</div>
		</nav>
	)
}
