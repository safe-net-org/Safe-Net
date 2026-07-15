'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
	AnimatePresence,
	m,
	Transition,
	useAnimation,
	usePresence,
} from 'framer-motion'

import { ChevronDown, LogOut, Menu, Shield, ShieldCheck, X } from 'lucide-react'

import { useProfile } from '@/hooks/user/useProfile'
import { useEffect, useState } from 'react'

import { useLogout } from '@/hooks/user/useLogout'
import { adminNavItems, navItems } from './navigation.data'

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
	const [expandedItems, setExpandedItems] = useState<string[]>([])
	const [isMobileOpen, setIsMobileOpen] = useState(false)
	const [hasAnimated, setHasAnimated] = useState(false)
	const [isInitialLoad, setIsInitialLoad] = useState(true)

	useEffect(() => {
		setHasAnimated(true)
		const timer = setTimeout(() => {
			setIsInitialLoad(false)
		}, 1000)
		return () => clearTimeout(timer)
	}, [])

	const toggleExpand = (label: string) => {
		setExpandedItems(prev =>
			prev.includes(label)
				? prev.filter(item => item !== label)
				: [...prev, label]
		)
	}

	const isActive = (href: string) => {
		if (href === '/dashboard') return pathname === href
		return pathname.startsWith(href)
	}

	const handleLogout = () => logout('/')

	const filteredAdminItems = adminNavItems.filter(
		item => !item.adminOnly || user?.isAdmin
	)

	const useDropdownAnimation = (isOpen: boolean) => {
		const controls = useAnimation()
		const [isPresent, safeToRemove] = usePresence()

		useEffect(() => {
			if (isOpen) {
				controls.start({ opacity: 1, height: 'auto' })
			} else {
				controls.start({ opacity: 0, height: 0 }).then(() => {
					if (!isPresent && safeToRemove) {
						safeToRemove()
					}
				})
			}
		}, [isOpen, controls, isPresent, safeToRemove])

		// `transition` is typed explicitly because returning it from a function
		// widens `ease` to number[], which framer-motion's Easing type rejects.
		const transition: Transition = {
			duration: 0.25,
			ease: [0.4, 0, 0.2, 1],
			height: { duration: 0.25 },
		}

		return {
			controls,
			initial: { opacity: 0, height: 0 },
			transition,
		}
	}

	const isGroupActive = (item: NavItem) => {
		if (!item.children) return isActive(item.href)
		return item.children.some(child => pathname.startsWith(child.href))
	}

	const isChildActive = (href: string) => pathname.startsWith(href)

	const renderNavItem = (item: NavItem, index: number, isAdmin = false) => {
		const isOpen = expandedItems.includes(item.label)
		const { controls, initial, transition } = useDropdownAnimation(isOpen)
		const groupIsActive = isGroupActive(item)

		return (
			<m.div
				key={item.href}
				initial={isInitialLoad ? { x: -20, opacity: 0 } : false}
				animate={{ x: 0, opacity: 1 }}
				transition={{
					delay: index * 0.03,
					duration: 0.4,
					ease: [0.4, 0, 0.2, 1],
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
								damping: 25,
							}}
							onClick={() => toggleExpand(item.label)}
							className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 ${
								isOpen
									? 'bg-gray-100 dark:bg-gray-800/70 text-gray-900 dark:text-white'
									: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70'
							} ${groupIsActive ? 'border border-gray-300/70 dark:border-gray-600/70' : ''}`}
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
									damping: 25,
								}}
							>
								<ChevronDown className='w-4 h-4 opacity-50' strokeWidth={2.5} />
							</m.div>
						</m.button>

						<AnimatePresence mode='wait' initial={false}>
							{isOpen && (
								<m.div
									key={`dropdown-${item.label}`}
									initial={initial}
									animate={controls}
									exit={{ opacity: 0, height: 0 }}
									transition={transition}
									className='overflow-hidden'
									layout
									aria-expanded={isOpen}
									role='region'
								>
									<div className='ml-8 mt-1 space-y-0.5 border-l-2 border-gray-200/70 dark:border-gray-700/70 pl-3.5 py-1.5'>
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
														ease: [0.4, 0, 0.2, 1],
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
																? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
																: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/70 hover:text-gray-900 dark:hover:text-gray-100'
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
									? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
									: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70'
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

	const SidebarContent = () => (
		<m.div
			initial={isInitialLoad ? { opacity: 0, x: -20 } : false}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
			className='flex flex-col h-full'
		>
			<m.div
				initial={isInitialLoad ? { y: -20, opacity: 0 } : false}
				animate={{ y: 0, opacity: 1 }}
				transition={{ delay: 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
				className='flex items-center justify-between px-6 py-5'
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
					<span className='text-[18px] font-semibold text-gray-900 dark:text-white tracking-tight'>
						SafeNet
					</span>
				</Link>
				<m.button
					whileHover={{ scale: 1.1, rotate: 90 }}
					whileTap={{ scale: 0.9 }}
					transition={{ type: 'spring', stiffness: 400, damping: 17 }}
					onClick={() => setIsMobileOpen(false)}
					className='lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors'
				>
					<X className='w-5 h-5 text-gray-500' strokeWidth={2} />
				</m.button>
			</m.div>

			{/* Profile Section with Logout */}
			{user && (
				<m.div
					initial={isInitialLoad ? { y: -10, opacity: 0 } : false}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
					className='px-4 pb-4'
				>
					<m.button
						whileHover={{ scale: 1.01 }}
						whileTap={{ scale: 0.99 }}
						transition={{ type: 'spring', stiffness: 400, damping: 25 }}
						onClick={handleLogout}
						className='w-full flex items-center gap-3.5 px-3.5 py-3 rounded-[14px] bg-gray-50/80 dark:bg-gray-800/40 transition-all duration-200 border border-gray-200/40 dark:border-gray-700/40 group'
					>
						<div className='relative'>
							<div className='w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-[15px] shadow-md'>
								{user.name?.charAt(0).toUpperCase() ||
									user.email?.charAt(0).toUpperCase() ||
									'?'}
							</div>
							{user.isAdmin && (
								<div className='absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-linear-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center border-[2.5px] border-white dark:border-gray-900 shadow-sm'>
									<ShieldCheck
										className='w-2.5 h-2.5 text-white'
										strokeWidth={3}
									/>
								</div>
							)}
						</div>
						<div className='flex-1 min-w-0 text-left'>
							<p className='text-[13.5px] font-semibold text-gray-900 dark:text-white truncate leading-tight transition-colors'>
								{user.name || 'User'}
							</p>
							<p className='text-[11.5px] text-gray-500 dark:text-gray-400 truncate leading-tight mt-1'>
								{user.email}
							</p>
						</div>
						<LogOut
							className='w-[18px] h-[18px] text-gray-400 transition-colors hover:text-red-600 cursor-pointer'
							strokeWidth={2}
						/>
					</m.button>
				</m.div>
			)}

			{/* Navigation */}
			<nav className='flex-1 px-4 py-2 overflow-y-auto'>
				<div className='space-y-1'>
					{/* Admin Section */}
					{filteredAdminItems.length > 0 && (
						<>
							<div className='space-y-0.5 mb-3'>
								{filteredAdminItems.map((item, index) =>
									renderNavItem(item, index, true)
								)}
							</div>
							<div className='h-px bg-linear-to-r from-transparent via-gray-200 dark:via-gray-700/50 to-transparent my-4'></div>
						</>
					)}
					{/* User Navigation */}
					<div className='space-y-0.5'>
						{navItems.map((item, index) => renderNavItem(item, index))}
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
				onClick={() => setIsMobileOpen(true)}
				className='lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-[14px] shadow-lg border border-gray-200/60 dark:border-gray-800/60'
				aria-label='Open menu'
			>
				<Menu
					className='w-5 h-5 text-gray-700 dark:text-gray-300'
					strokeWidth={2.5}
				/>
			</m.button>

			{/* Desktop Sidebar */}
			<aside className='hidden lg:flex w-[280px] h-screen bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border-r border-gray-200/60 dark:border-gray-800/60 flex-col sticky top-0'>
				<SidebarContent />
			</aside>

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
							initial={{ x: -300, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: -300, opacity: 0 }}
							transition={{
								type: 'spring',
								damping: 30,
								stiffness: 300,
								mass: 0.5,
							}}
							className='lg:hidden fixed top-0 left-0 z-50 w-[280px] h-screen bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-r border-gray-200/60 dark:border-gray-800/60 flex flex-col shadow-2xl'
							role='dialog'
							aria-modal='true'
							aria-label='Mobile menu'
						>
							<SidebarContent />
						</m.aside>
					</>
				)}
			</AnimatePresence>
		</>
	)
}
