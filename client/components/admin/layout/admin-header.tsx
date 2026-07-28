'use client'

import { m } from 'framer-motion'
import { Bell, ChevronDown, Search, User } from '@/components/ui/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function AdminHeader() {
	const pathname = usePathname()
	const [showUserMenu, setShowUserMenu] = useState(false)

	const getPageTitle = () => {
		if (pathname.includes('/learning/courses')) return 'Content management'
		if (pathname.includes('/users')) return 'Users'
		if (pathname.includes('/stats')) return 'Statistics'
		if (pathname.includes('/settings')) return 'Settings'
		return 'Admin panel'
	}

	return (
		<m.header
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			className='fixed top-0 right-0 left-0 md:left-64 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 z-30 flex items-center px-6 gap-4'
		>
			{/* Title */}
			<div className='flex-1'>
				<h1 className='text-lg font-semibold text-gray-900 dark:text-white'>
					{getPageTitle()}
				</h1>
			</div>

			{/* Search Bar (Hidden on mobile) */}
			<div className='hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg flex-1 max-w-xs'>
				<Search className='w-4 h-4 text-gray-400' />
				<input
					type='text'
					placeholder='Search...'
					className='bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 flex-1'
				/>
			</div>

			{/* Notifications */}
			<m.button
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.95 }}
				className='relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition'
			>
				<Bell className='w-5 h-5' />
				<span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse' />
			</m.button>

			{/* User Menu */}
			<div className='relative'>
				<m.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => setShowUserMenu(!showUserMenu)}
					className='flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition'
				>
					<User className='w-4 h-4' />
					<span className='hidden sm:inline text-sm font-medium'>Admin</span>
					<ChevronDown className='w-4 h-4' />
				</m.button>

				{showUserMenu && (
					<m.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className='absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg z-50'
					>
						<Link
							href='/dashboard/admin/settings'
							className='block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition border-b border-gray-200 dark:border-gray-800'
						>
							Profile
						</Link>
						<button className='w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition'>
							Logout
						</button>
					</m.div>
				)}
			</div>
		</m.header>
	)
}
