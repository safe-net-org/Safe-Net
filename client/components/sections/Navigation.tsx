'use client'
import { useRouter } from 'next/navigation'

import { LogOut, Menu, Shield, X } from 'lucide-react'

import { useLogout } from '@/hooks/user/useLogout'
import { useProfile } from '@/hooks/user/useProfile'
import { useEffect, useRef, useState } from 'react'

export default function Navigation() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [showLogout, setShowLogout] = useState(false)
	const { user, isLoading } = useProfile()
	const { logout } = useLogout()
	const router = useRouter()
	const profileRef = useRef<HTMLDivElement>(null)
	const isAuthenticated = !!user?.isLoggedIn

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				profileRef.current &&
				!profileRef.current.contains(event.target as Node)
			) {
				setShowLogout(false)
			}
		}
		if (showLogout) {
			document.addEventListener('mousedown', handleClickOutside)
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [showLogout])

	const handleLogout = () => logout()

	const handleProfileClick = () => {
		setShowLogout(!showLogout)
		logout()
	}

	return (
		<nav className='sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex items-center justify-between h-16'>
					<div className='flex items-center gap-3'>
						<div className='w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center'>
							<Shield className='w-6 h-6 text-white' />
						</div>
						<div>
							<h1 className='text-lg font-bold'>SafeNet</h1>
							<p className='text-xs text-slate-400 -mt-1'>
								Learn. Play. Stay Safe.
							</p>
						</div>
					</div>

					{/* Desktop Navigation */}
					<div className='hidden md:flex items-center gap-6'>
						<a
							href='#features'
							className='text-sm text-slate-300 hover:text-white transition-colors'
						>
							Features
						</a>
						<a
							href='#topics'
							className='text-sm text-slate-300 hover:text-white transition-colors'
						>
							Topics
						</a>
						<a
							href='#stats'
							className='text-sm text-slate-300 hover:text-white transition-colors'
						>
							Statistics
						</a>
						<a
							href='#guard'
							className='text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors'
						>
							AI Guard
						</a>

						{/* User Profile with Logout */}
						{!isLoading && isAuthenticated && user && (
							<div className='relative' ref={profileRef}>
								<button
									onClick={handleProfileClick}
									className='relative w-10 h-10 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg cursor-pointer overflow-hidden group'
									title='Profile'
								>
									{/* User Initial */}
									<span
										className={`relative z-10 transition-opacity duration-300 ${showLogout ? 'opacity-0' : 'md:group-hover:opacity-0'}`}
									>
										{user?.name?.charAt(0).toUpperCase() ||
											user?.email?.charAt(0).toUpperCase() ||
											'?'}
									</span>

									{/* Dark Overlay */}
									<div
										className={`absolute inset-0 bg-black/60 transition-opacity duration-300 z-20 ${showLogout ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}
									/>

									{/* Logout Icon */}
									<LogOut
										className={`w-[18px] h-[18px] absolute inset-0 m-auto transition-opacity duration-300 z-30 text-red-400 ${showLogout ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}
									/>
								</button>

								{/* Logout Button for Touch Devices */}
								{showLogout && (
									<button
										onClick={handleLogout}
										className='absolute top-full right-0 mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-red-400 text-sm font-medium flex items-center gap-2 shadow-lg border border-slate-700 transition-colors md:hidden'
									>
										<LogOut className='w-4 h-4' />
										Log Out
									</button>
								)}

								{/* Logout action on desktop hover */}
								<div
									className='hidden md:block absolute inset-0 rounded-full cursor-pointer'
									onClick={handleLogout}
								/>
							</div>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						className='md:hidden text-slate-300'
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					>
						{mobileMenuOpen ? (
							<X className='w-6 h-6' />
						) : (
							<Menu className='w-6 h-6' />
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<div className='md:hidden py-4 space-y-3 border-t border-slate-800'>
						<a
							href='#features'
							className='block text-sm text-slate-300 hover:text-white transition-colors'
						>
							Features
						</a>
						<a
							href='#topics'
							className='block text-sm text-slate-300 hover:text-white transition-colors'
						>
							Topics
						</a>
						<a
							href='#stats'
							className='block text-sm text-slate-300 hover:text-white transition-colors'
						>
							Statistics
						</a>
						<a
							href='#guard'
							className='block text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors'
						>
							AI Guard
						</a>

						{!isLoading && isAuthenticated && user && (
							<>
								<div className='text-sm text-slate-300 p-2 bg-slate-800/50 rounded'>
									{user.name || user.email}
								</div>
								<button
									onClick={handleLogout}
									className='text-left w-full text-red-400 hover:text-red-300 transition-colors flex items-center gap-2'
								>
									<LogOut className='w-4 h-4' />
									Log Out
								</button>
							</>
						)}
					</div>
				)}
			</div>
		</nav>
	)
}
