'use client'

import { adminService } from '@/services/admin/admin.service'
import { AnimatePresence, m } from 'framer-motion'
import {
	BarChart3,
	BookOpen,
	ChevronDown,
	LayoutDashboard,
	LogOut,
	Menu,
	Settings,
	Users,
	X,
} from '@/components/ui/icons'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

const menuItems = [
	{
		label: 'Home',
		href: '/dashboard/admin',
		icon: LayoutDashboard,
	},
	{
		label: 'Management',
		icon: BookOpen,
		submenu: [
			{ label: 'Courses', href: '/dashboard/admin/learning/courses' },
			{ label: 'Tests', href: '/dashboard/admin/learning/tests' },
		],
	},
	{
		label: 'Users',
		href: '/dashboard/admin/users',
		icon: Users,
	},
	{
		label: 'Statistics',
		icon: BarChart3,
		submenu: [
			{ label: 'Overview', href: '/dashboard/admin/stats/overview' },
			{ label: 'Course analytics', href: '/dashboard/admin/stats/courses' },
		],
	},
	{
		label: 'Settings',
		href: '/dashboard/admin/settings',
		icon: Settings,
	},
]

export default function AdminSidebar() {
	const pathname = usePathname()
	const router = useRouter()
	const [isMobileOpen, setIsMobileOpen] = useState(false)
	const [expandedMenu, setExpandedMenu] = useState<string | null>('Management')
	const [isLoggingOut, setIsLoggingOut] = useState(false)

	const handleLogout = async () => {
		setIsLoggingOut(true)
		try {
			await adminService.logout()
			toast.success('You have logged out')
			router.push('/login')
		} catch {
			toast.error('Error while logging out')
		} finally {
			setIsLoggingOut(false)
		}
	}

	const toggleMenu = (label: string) => {
		setExpandedMenu(expandedMenu === label ? null : label)
	}

	return (
		<>
			{/* Mobile Toggle */}
			<button
				onClick={() => setIsMobileOpen(!isMobileOpen)}
				className='fixed top-4 left-4 z-50 md:hidden p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800'
			>
				{isMobileOpen ? (
					<X className='w-5 h-5' />
				) : (
					<Menu className='w-5 h-5' />
				)}
			</button>

			{/* Overlay */}
			<AnimatePresence>
				{isMobileOpen && (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setIsMobileOpen(false)}
						className='fixed inset-0 bg-black/50 z-30 md:hidden'
					/>
				)}
			</AnimatePresence>

			{/* Sidebar */}
			<m.aside
				initial={isMobileOpen ? { x: -280 } : undefined}
				animate={isMobileOpen ? { x: 0 } : undefined}
				exit={{ x: -280 }}
				className='fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto z-40 md:translate-x-0 flex flex-col'
			>
				{/* Logo */}
				<div className='sticky top-0 p-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
					<Link
						href='/dashboard/admin'
						className='flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition'
					>
						<div className='w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm'>
							SN
						</div>
						<span className='hidden sm:inline'>Safe-Net</span>
					</Link>
				</div>

				{/* Navigation */}
				<nav className='flex-1 px-3 py-6 space-y-2'>
					{menuItems.map(item => {
						const Icon = item.icon
						const isActive = pathname === item.href
						const isSubmenuActive = item.submenu?.some(
							sub => pathname === sub.href
						)

						return (
							<div key={item.label}>
								{item.submenu ? (
									<>
										<m.button
											whileHover={{ x: 4 }}
											onClick={() => toggleMenu(item.label)}
											className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition ${
												isSubmenuActive
													? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
													: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
											}`}
										>
											<span className='flex items-center gap-3 flex-1'>
												<Icon className='w-5 h-5' />
												<span className='font-medium'>{item.label}</span>
											</span>
											<m.div
												animate={{
													rotate: expandedMenu === item.label ? 180 : 0,
												}}
											>
												<ChevronDown className='w-4 h-4' />
											</m.div>
										</m.button>

										{/* Submenu */}
										<AnimatePresence>
											{expandedMenu === item.label && (
												<m.div
													initial={{ opacity: 0, height: 0 }}
													animate={{ opacity: 1, height: 'auto' }}
													exit={{ opacity: 0, height: 0 }}
													className='space-y-1 mt-1 ml-4'
												>
													{item.submenu.map(sub => (
														<Link
															key={sub.href}
															href={sub.href}
															onClick={() => setIsMobileOpen(false)}
															className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
																pathname === sub.href
																	? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
																	: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
															}`}
														>
															<div className='w-2 h-2 rounded-full bg-current' />
															{sub.label}
														</Link>
													))}
												</m.div>
											)}
										</AnimatePresence>
									</>
								) : (
									<Link
										href={item.href!}
										onClick={() => setIsMobileOpen(false)}
										className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
											isActive
												? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
												: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
										}`}
									>
										<Icon className='w-5 h-5' />
										<span>{item.label}</span>
									</Link>
								)}
							</div>
						)
					})}
				</nav>

				{/* Logout Button */}
				<div className='sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'>
					<m.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						onClick={handleLogout}
						disabled={isLoggingOut}
						className='w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg font-medium transition disabled:opacity-50'
					>
						<LogOut className='w-4 h-4' />
						Logout
					</m.button>
				</div>
			</m.aside>

			{/* Main Content Spacer */}
			<div className='hidden md:block w-64' />
		</>
	)
}
