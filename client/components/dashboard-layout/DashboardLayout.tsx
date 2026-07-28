'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { AnimatePresence, m } from 'framer-motion'

import { ChevronDown, LogOut, Menu, Shield, ShieldCheck, X } from '@/components/ui/icons'

import { useProfile } from '@/hooks/user/useProfile'
import { useEffect, useState } from 'react'

import { PreferencesControls } from '@/components/preferences/PreferencesControls'
import { useLogout } from '@/hooks/user/useLogout'
import { useI18n } from '@/i18n/LocaleProvider'
import { getAdminNavItems, getNavItems } from './navigation.data'

interface NavItem {
	label: string
	href: string
	icon: React.ReactNode
	adminOnly?: boolean
	children?: { label: string; href: string }[]
}

export default function DashboardSidebar() {
	const pathname = usePathname()
	const { user } = useProfile()
	const { logout } = useLogout()
	const { t } = useI18n()
	const navItems = getNavItems(t.dashboardNav)
	const adminNavItems = getAdminNavItems(t.dashboardNav)
	const [expandedItems, setExpandedItems] = useState<string[]>([])
	const [isMobileOpen, setIsMobileOpen] = useState(false)
	const [isInitialLoad, setIsInitialLoad] = useState(true)

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsInitialLoad(false)
		}, 1000)
		return () => clearTimeout(timer)
	}, [])

	const toggleExpand = (label: string) => {
		setExpandedItems(prev =>
			prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
		)
	}

	const isActive = (href: string) => {
		if (href === '/dashboard') return pathname === href
		return pathname.startsWith(href)
	}

	const handleLogout = () => logout('/')

	const filteredAdminItems = adminNavItems.filter(item => !item.adminOnly || user?.isAdmin)

	const isGroupActive = (item: NavItem) => {
		if (!item.children) return isActive(item.href)
		return item.children.some(child => pathname.startsWith(child.href))
	}

	const isChildActive = (href: string) => pathname.startsWith(href)

	const renderNavItem = (item: NavItem, index: number, idPrefix: string) => {
		const isOpen = expandedItems.includes(item.label)
		const groupIsActive = isGroupActive(item)
		const regionId = `${idPrefix}-dashboard-nav-${item.href.replaceAll('/', '-') || 'home'}`

		return (
			<m.div
				key={item.href}
				initial={isInitialLoad ? { x: -20, opacity: 0 } : false}
				animate={{ x: 0, opacity: 1 }}
				transition={{
					delay: index * 0.03,
					duration: 0.4,
					ease: [0.4, 0, 0.2, 1]
				}}
			>
				{item.children ? (
					<div>
						<m.button
							whileHover={{ x: 3 }}
							whileTap={{ scale: 0.98 }}
							transition={{
								type: 'spring',
								stiffness: 400,
								damping: 25
							}}
							type='button'
							onClick={() => toggleExpand(item.label)}
							className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 ${
								isOpen
									? 'bg-sidebar-accent/70 text-sidebar-accent-foreground'
									: 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
							} ${groupIsActive ? 'border border-sidebar-border' : ''}`}
							aria-expanded={isOpen}
							aria-controls={regionId}
						>
							<div className='flex items-center gap-3'>
								<div className='opacity-80'>{item.icon}</div>
								<span className='tracking-tight'>{item.label}</span>
							</div>
							<m.div
								animate={{ rotate: isOpen ? 180 : 0 }}
								transition={{
									duration: 0.25,
									type: 'spring',
									stiffness: 250,
									damping: 25
								}}
							>
								<ChevronDown className='w-4 h-4 opacity-50' strokeWidth={2.5} />
							</m.div>
						</m.button>

						<AnimatePresence mode='wait' initial={false}>
							{isOpen && (
								<m.div
									key={`dropdown-${item.label}`}
									id={regionId}
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: 'auto' }}
									exit={{ opacity: 0, height: 0 }}
									transition={{
										duration: 0.25,
										ease: [0.4, 0, 0.2, 1],
										height: { duration: 0.25 }
									}}
									className='overflow-hidden'
									layout
									role='region'
								>
									<div className='ml-8 mt-1 space-y-0.5 border-l-2 border-sidebar-border pl-3.5 py-1.5'>
										{item.children.map((child, childIndex) => {
											const childIsActive = isChildActive(child.href)
											return (
												<m.div
													key={child.href}
													initial={{ x: -10, opacity: 0, scale: 0.95 }}
													animate={{ x: 0, opacity: 1, scale: 1 }}
													exit={{ x: -10, opacity: 0, scale: 0.95 }}
													transition={{
														duration: 0.2,
														delay: childIndex * 0.05,
														ease: [0.4, 0, 0.2, 1]
													}}
													whileHover={{ x: 3, width: 'calc(100% - 3px)' }}
													whileTap={{ scale: 0.98 }}
												>
													<Link
														href={child.href}
														onClick={() => {
															setIsMobileOpen(false)
														}}
														className={`block px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
															childIsActive
																? 'bg-navigation-active text-navigation-active-foreground shadow-sm'
																: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
														}`}
													>
														{child.label}
													</Link>
												</m.div>
											)
										})}
									</div>
								</m.div>
							)}
						</AnimatePresence>
					</div>
				) : (
					<m.div
						whileHover={{ x: 3 }}
						whileTap={{ scale: 0.98 }}
						transition={{ type: 'spring', stiffness: 400, damping: 25 }}
					>
						<Link
							href={item.href}
							onClick={() => setIsMobileOpen(false)}
							className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 ${
								isActive(item.href)
									? 'bg-navigation-active text-navigation-active-foreground shadow-sm'
									: 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
							}`}
						>
							<div className='opacity-80'>{item.icon}</div>
							<span className='tracking-tight'>{item.label}</span>
						</Link>
					</m.div>
				)}
			</m.div>
		)
	}

	const renderSidebarContent = (idPrefix: string) => (
		<m.div
			initial={isInitialLoad ? { opacity: 0, x: -20 } : false}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
			className='flex flex-col h-full'
		>
			<div className='px-5 pb-3 pt-5'>
				<m.div
					initial={isInitialLoad ? { y: -20, opacity: 0 } : false}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
					className='flex items-center justify-between'
				>
					<Link href='/dashboard' className='flex items-center gap-3'>
						<m.div
							whileHover={{ scale: 1.05, rotate: 5 }}
							whileTap={{ scale: 0.95 }}
							transition={{ type: 'spring', stiffness: 400, damping: 17 }}
							className='w-9 h-9 bg-linear-to-br from-blue-500 to-blue-600 rounded-[11px] flex items-center justify-center shadow-md'
						>
							<Shield className='w-5 h-5 text-white' strokeWidth={2.5} />
						</m.div>
						<span className='text-[18px] font-semibold text-sidebar-foreground tracking-tight'>
							SafeNet
						</span>
					</Link>
					<m.button
						whileHover={{ scale: 1.1, rotate: 90 }}
						whileTap={{ scale: 0.9 }}
						transition={{ type: 'spring', stiffness: 400, damping: 17 }}
						type='button'
						onClick={() => setIsMobileOpen(false)}
						className='lg:hidden p-2 hover:bg-sidebar-accent rounded-xl transition-colors'
						aria-label={t.nav.closeMenu}
					>
						<X className='w-5 h-5 text-muted-foreground' strokeWidth={2} aria-hidden='true' />
					</m.button>
				</m.div>
				<PreferencesControls className='mt-4' />
			</div>

			{/* Profile identity and explicit logout action */}
			{user && (
				<m.div
					initial={isInitialLoad ? { y: -10, opacity: 0 } : false}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
					className='px-4 pb-4'
				>
					<div className='rounded-[14px] border border-sidebar-border bg-sidebar-accent/40 px-3.5 py-3'>
						<div className='flex items-center gap-3.5'>
							<div className='relative'>
								<div className='w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-[15px] shadow-md'>
									{user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
								</div>
								{user.isAdmin && (
									<div className='absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-linear-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center border-[2.5px] border-sidebar shadow-sm'>
										<ShieldCheck className='w-2.5 h-2.5 text-white' strokeWidth={3} />
									</div>
								)}
							</div>
							<div className='flex-1 min-w-0 text-left'>
								<p className='text-[13.5px] font-semibold text-sidebar-foreground truncate leading-tight'>
									{user.name || t.dashboardNav.student}
								</p>
								<p className='text-[11.5px] text-muted-foreground truncate leading-tight mt-1'>
									{user.email}
								</p>
							</div>
						</div>
						<m.button
							type='button'
							onClick={handleLogout}
							whileHover={{ y: -2 }}
							whileTap={{ scale: 0.985 }}
							transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
							className='mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/20 px-3 py-2 text-[12.5px] font-medium text-destructive transition-[color,background-color,border-color] duration-300 hover:border-destructive/30 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40'
						>
							<LogOut className='size-4' strokeWidth={2} aria-hidden='true' />
							{t.nav.logout}
						</m.button>
					</div>
				</m.div>
			)}

			{/* Navigation */}
			<nav className='flex-1 px-4 py-2 overflow-y-auto'>
				<div className='space-y-1'>
					{/* Admin Section */}
					{filteredAdminItems.length > 0 && (
						<>
							<div className='space-y-0.5 mb-3'>
								{filteredAdminItems.map((item, index) => renderNavItem(item, index, idPrefix))}
							</div>
							<div className='h-px bg-linear-to-r from-transparent via-sidebar-border to-transparent my-4'></div>
						</>
					)}
					{/* User Navigation */}
					<div className='space-y-0.5'>
						{navItems.map((item, index) => renderNavItem(item, index, idPrefix))}
					</div>
				</div>
			</nav>
		</m.div>
	)

	return (
		<>
			{/* Mobile Menu Button */}
			<m.button
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				transition={{ type: 'spring', stiffness: 400, damping: 17 }}
				type='button'
				onClick={() => setIsMobileOpen(true)}
				className='lg:hidden fixed top-4 left-4 z-50 p-3 bg-sidebar/90 backdrop-blur-2xl rounded-[14px] shadow-lg border border-sidebar-border'
				aria-label={t.nav.openMenu}
				aria-expanded={isMobileOpen}
				aria-controls='dashboard-mobile-sidebar'
			>
				<Menu className='w-5 h-5 text-sidebar-foreground' strokeWidth={2.5} aria-hidden='true' />
			</m.button>

			{/* The slot preserves the desktop layout while the actual navigation is
			    viewport-fixed, so rapid document scrolling never exposes its edge. */}
			<div className='hidden w-[280px] shrink-0 lg:block'>
				<aside
					className='fixed inset-y-0 left-0 z-30 flex h-dvh w-[280px] flex-col border-r border-sidebar-border bg-sidebar/90 text-sidebar-foreground backdrop-blur-2xl'
					aria-label={t.nav.primaryNavigation}
				>
					{renderSidebarContent('desktop')}
				</aside>
			</div>

			{/* Mobile Sidebar */}
			<AnimatePresence mode='wait'>
				{isMobileOpen && (
					<>
						{/* Backdrop */}
						<m.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
							onClick={() => setIsMobileOpen(false)}
							className='lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-md'
							aria-hidden='true'
						/>
						{/* Sidebar */}
						<m.aside
							id='dashboard-mobile-sidebar'
							initial={{ x: -300, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: -300, opacity: 0 }}
							transition={{
								type: 'spring',
								damping: 30,
								stiffness: 300,
								mass: 0.5
							}}
							className='lg:hidden fixed top-0 left-0 z-50 w-[280px] h-screen bg-sidebar/95 text-sidebar-foreground backdrop-blur-2xl border-r border-sidebar-border flex flex-col shadow-2xl'
							role='dialog'
							aria-modal='true'
							aria-label={t.nav.mobileMenu}
						>
							{renderSidebarContent('mobile')}
						</m.aside>
					</>
				)}
			</AnimatePresence>
		</>
	)
}
