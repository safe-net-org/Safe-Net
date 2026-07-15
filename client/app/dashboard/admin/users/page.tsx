'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { adminService } from '@/services/admin/admin.service'
import { UserStatus } from '@/services/admin/admin.types'
import { UserRoleLabel } from '@/services/auth/auth.types'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { AnimatePresence, m } from 'framer-motion'
import {
    Activity,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    Download,
    Eye,
    Filter,
    Lock,
    LockOpen,
    Search,
    Shield,
    Sparkles,
    User,
    Users,
    X,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

export default function UsersPage() {
	const [search, setSearch] = useState('')
	const [roleFilter, setRoleFilter] = useState('all')
	const [statusFilter, setStatusFilter] = useState('all')
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage, setItemsPerPage] = useState(20)
	const [blockingUserId, setBlockingUserId] = useState<string | null>(null)

	// Combobox open states
	const [openRole, setOpenRole] = useState(false)
	const [openStatus, setOpenStatus] = useState(false)
	const [openLimit, setOpenLimit] = useState(false)

	// Block Dialog State
	const [blockDialogOpen, setBlockDialogOpen] = useState(false)
	const [blockDialogData, setBlockDialogData] = useState<{
		userId: string
		status: UserStatus
		userName: string
	} | null>(null)

	const {
		data: users = [],
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['admin-users'],
		queryFn: () => adminService.getUsers(),
	})

	const filteredUsers = useMemo(() => {
		if (!users) return []
		return users.filter(user => {
			const matchSearch =
				user.name.toLowerCase().includes(search.toLowerCase()) ||
				user.email.toLowerCase().includes(search.toLowerCase())
			const matchRole =
				roleFilter === 'all' || user.rights.includes(roleFilter as any)
			const matchStatus = statusFilter === 'all' || user.status === statusFilter
			return matchSearch && matchRole && matchStatus
		})
	}, [users, search, roleFilter, statusFilter])

	const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
	const paginatedUsers = filteredUsers.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage
	)

	const handleFilterChange = (setter: any) => (value: any) => {
		setter(value)
		setCurrentPage(1)
	}

	const hasActiveFilters =
		search || roleFilter !== 'all' || statusFilter !== 'all'

	const clearFilters = () => {
		setSearch('')
		setRoleFilter('all')
		setStatusFilter('all')
		setCurrentPage(1)
	}

	const openBlockDialog = (
		userId: string,
		currentStatus: UserStatus,
		userName: string
	) => {
		setBlockDialogData({ userId, status: currentStatus, userName })
		setBlockDialogOpen(true)
	}

	const confirmToggleBlockUser = async () => {
		if (!blockDialogData) return
		const isBlocked = blockDialogData.status === UserStatus.BLOCKED
		const newStatus = isBlocked ? UserStatus.ACTIVE : UserStatus.BLOCKED
		setBlockingUserId(blockDialogData.userId)
		setBlockDialogOpen(false)
		try {
			await adminService.updateUser(blockDialogData.userId, {
				status: newStatus,
			})
			toast.success(
				isBlocked ? `User unblocked` : `User blocked`
			)
			await refetch()
		} catch (error: any) {
			toast.error('Error updating status')
		} finally {
			setBlockingUserId(null)
			setBlockDialogData(null)
		}
	}

	const handleExportCSV = () => {
		try {
			const headers = [
				'ID',
				'Name',
				'Email',
				'Roles',
				'Status',
				'Registration date',
			]
			const rows = filteredUsers.map(user => [
				user.id,
				user.name,
				user.email,
				user.rights.join('; '),
				user.status === UserStatus.ACTIVE ? 'Active' : 'Blocked',
				format(new Date(user.createdAt), 'dd.MM.yyyy HH:mm'),
			])
			const csvContent = [
				headers.join(','),
				...rows.map(row =>
					row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
				),
			].join('\n')
			const blob = new Blob(['\ufeff' + csvContent], {
				type: 'text/csv;charset=utf-8;',
			})
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `users_export.csv`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
		} catch (error) {
			toast.error('Export error')
		}
	}

	const roles = [
		{ value: 'all', label: 'All roles', icon: Users },
		{ value: 'USER', label: 'User', icon: User },
		{ value: 'ADMIN', label: 'Admin', icon: Shield },
	]

	const statuses = [
		{ value: 'all', label: 'All statuses', icon: Activity },
		{ value: 'ACTIVE', label: 'Active', icon: CheckCircle2 },
		{ value: 'BLOCKED', label: 'Blocked', icon: Lock },
	]

	const limits = [
		{ value: 10, label: '10 rows' },
		{ value: 20, label: '20 rows' },
		{ value: 50, label: '50 rows' },
		{ value: 100, label: '100 rows' },
	]

	if (isLoading) {
		return (
			<div className='min-h-screen p-8'>
				<div className='max-w-[1400px] mx-auto space-y-6'>
					<div className='h-12 w-64 bg-white/5 rounded-2xl animate-pulse' />
					<div className='h-[600px] bg-white/5 rounded-3xl animate-pulse' />
				</div>
			</div>
		)
	}

	return (
		<TooltipProvider delayDuration={200}>
			<div className='min-h-screen text-white selection:bg-blue-500/30 font-sans'>
				<div className='relative max-w-[1400px] mx-auto px-6 py-8 space-y-6'>
					{/* Header Section - Apple Style */}
					<m.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className='flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2'
					>
						<div className='space-y-1'>
							<h1 className='text-5xl font-bold tracking-tight text-white'>
								Users
							</h1>
							<div className='flex items-center gap-2 text-white/50 text-sm'>
								<Sparkles className='w-4 h-4' />
								<span>
									Total users:{' '}
									<span className='text-white font-semibold'>
										{users.length}
									</span>
								</span>
							</div>
						</div>

						<Button
							onClick={handleExportCSV}
							disabled={filteredUsers.length === 0}
							className='bg-white text-black hover:bg-white/80 font-semibold rounded-xl px-5 h-11 shadow-lg transition-all active:scale-[0.98] disabled:opacity-50'
						>
							<Download className='w-5 h-5 mr-2' />
							Export CSV
						</Button>
					</m.div>

					{/* Filters Bar - Minimal Apple Style */}
					<m.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className='flex flex-col lg:flex-row gap-3 items-stretch lg:items-center'
					>
						{/* Search Input */}
						<div className='relative flex-1 group'>
							<div className='absolute inset-y-0 left-4 flex items-center pointer-events-none'>
								<Search className='w-5 h-5 text-white/40 group-focus-within:text-white/60 transition-colors' />
							</div>
							<input
								type='text'
								placeholder='Find a user...'
								value={search}
								onChange={e => handleFilterChange(setSearch)(e.target.value)}
								className='w-full pl-12 pr-4 h-12 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10
                  text-white placeholder:text-white/40 font-medium
                  focus:outline-none focus:bg-white/[0.07] focus:border-white/20
                  transition-all duration-200'
							/>
							{search && (
								<button
									onClick={() => setSearch('')}
									className='absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors'
								>
									<X className='w-4 h-4' />
								</button>
							)}
						</div>

						{/* Filters Group */}
						<div className='flex items-center gap-2'>
							{/* Role Filter */}
							<Popover open={openRole} onOpenChange={setOpenRole}>
								<PopoverTrigger asChild>
									<Button
										role='combobox'
										aria-expanded={openRole}
										className={cn(
											'h-12 rounded-xl border px-4 min-w-[140px] justify-between transition-all duration-200 font-medium',
											roleFilter !== 'all'
												? 'bg-blue-500/10 border-blue-500/30 text-blue-200 hover:bg-blue-500/15'
												: 'bg-white/5 border-white/10 text-white/70 hover:bg-white/[0.07] hover:text-white'
										)}
									>
										<div className='flex items-center gap-2'>
											<Shield
												className={cn(
													'w-4 h-4',
													roleFilter !== 'all'
														? 'text-blue-400'
														: 'text-white/40'
												)}
											/>
											<span className='truncate text-sm'>
												{roles.find(r => r.value === roleFilter)?.label}
											</span>
										</div>
										<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-30' />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className='w-[200px] p-1 bg-[#0E172B] border-white/10 shadow-2xl rounded-xl backdrop-blur-2xl'
									align='end'
								>
									<Command className='bg-transparent text-white'>
										<CommandList>
											<CommandGroup>
												{roles.map(role => (
													<CommandItem
														key={role.value}
														value={role.value}
														onSelect={() => {
															handleFilterChange(setRoleFilter)(role.value)
															setOpenRole(false)
														}}
														className='text-white/70 hover:bg-white/5 hover:text-white cursor-pointer py-2.5 px-3 rounded-lg mb-0.5 last:mb-0 transition-colors'
													>
														<role.icon className='mr-2.5 h-4 w-4' />
														<span className='font-medium text-sm'>
															{role.label}
														</span>
														{roleFilter === role.value && (
															<Check className='ml-auto h-4 w-4 text-blue-400' />
														)}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>

							{/* Status Filter */}
							<Popover open={openStatus} onOpenChange={setOpenStatus}>
								<PopoverTrigger asChild>
									<Button
										role='combobox'
										aria-expanded={openStatus}
										className={cn(
											'h-12 rounded-xl border px-4 min-w-[140px] justify-between transition-all duration-200 font-medium',
											statusFilter !== 'all'
												? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/15'
												: 'bg-white/5 border-white/10 text-white/70 hover:bg-white/[0.07] hover:text-white'
										)}
									>
										<div className='flex items-center gap-2'>
											<Activity
												className={cn(
													'w-4 h-4',
													statusFilter !== 'all'
														? 'text-emerald-400'
														: 'text-white/40'
												)}
											/>
											<span className='truncate text-sm'>
												{statuses.find(s => s.value === statusFilter)?.label}
											</span>
										</div>
										<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-30' />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className='w-[200px] p-1 bg-[#0E172B] border-white/10 shadow-2xl rounded-xl backdrop-blur-2xl'
									align='end'
								>
									<Command className='bg-transparent text-white'>
										<CommandList>
											<CommandGroup>
												{statuses.map(status => (
													<CommandItem
														key={status.value}
														value={status.value}
														onSelect={() => {
															handleFilterChange(setStatusFilter)(status.value)
															setOpenStatus(false)
														}}
														className='text-white/70 hover:bg-white/5 hover:text-white cursor-pointer py-2.5 px-3 rounded-lg mb-0.5 last:mb-0 transition-colors'
													>
														<status.icon className='mr-2.5 h-4 w-4' />
														<span className='font-medium text-sm'>
															{status.label}
														</span>
														{statusFilter === status.value && (
															<Check className='ml-auto h-4 w-4 text-emerald-400' />
														)}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>

							{/* Reset Button */}
							<AnimatePresence>
								{hasActiveFilters && (
									<m.button
										initial={{ opacity: 0, scale: 0.8 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.8 }}
										onClick={clearFilters}
										className='h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center
                      text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0'
										title='Reset all filters'
									>
										<X className='w-5 h-5' />
									</m.button>
								)}
							</AnimatePresence>
						</div>
					</m.div>

					{/* Table Container - Clean Apple Design */}
					<AnimatePresence mode='wait'>
						{filteredUsers.length === 0 ? (
							<m.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className='flex flex-col items-center justify-center py-20 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/5'
							>
								<div className='w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5'>
									<Filter className='w-8 h-8 text-white/20' />
								</div>
								<h3 className='text-xl font-semibold text-white mb-1.5'>
									Nothing found
								</h3>
								<p className='text-white/50 mb-6 text-sm'>
									Try changing your search parameters
								</p>
								<Button
									onClick={clearFilters}
									variant='outline'
									className='h-10 px-6 rounded-xl border-white/10 text-white hover:bg-white/5 bg-transparent font-medium'
								>
									Reset filters
								</Button>
							</m.div>
						) : (
							<m.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className='bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden'
							>
								<div className='overflow-x-auto'>
									<table className='w-full'>
										<thead className='bg-white/[0.02] border-b border-white/5'>
											<tr>
												{[
													'User',
													'Email',
													'Roles',
													'Status',
													'Date',
													'Actions',
												].map(h => (
													<th
														key={h}
														className='px-5 py-4 text-left text-xs font-semibold text-white/50 uppercase tracking-wider first:pl-6 last:pr-6'
													>
														{h}
													</th>
												))}
											</tr>
										</thead>
										<tbody className='divide-y divide-white/5'>
											{paginatedUsers.map((user, idx) => (
												<m.tr
													key={user.id}
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ delay: idx * 0.01 }}
													className='group hover:bg-white/[0.02] transition-colors duration-150'
												>
													<td className='px-5 py-4 first:pl-6'>
														<div className='flex items-center gap-3'>
															<div className='w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-semibold text-white text-sm'>
																{user.name?.charAt(0).toUpperCase()}
															</div>
															<span className='font-semibold text-white text-sm'>
																{user.name}
															</span>
														</div>
													</td>
													<td className='px-5 py-4 text-sm font-medium text-white/50'>
														{user.email}
													</td>
													<td className='px-5 py-4'>
														<div className='flex gap-1.5'>
															{user.rights.map(role => (
																<span
																	key={role}
																	className={cn(
																		'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold',
																		role === 'ADMIN'
																			? 'bg-amber-500/10 text-amber-300'
																			: 'bg-blue-500/10 text-blue-300'
																	)}
																>
																	{role === 'ADMIN' ? (
																		<Shield className='w-3 h-3' />
																	) : (
																		<User className='w-3 h-3' />
																	)}
																	{UserRoleLabel[role]}
																</span>
															))}
														</div>
													</td>
													<td className='px-5 py-4'>
														<span
															className={cn(
																'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold',
																user.status === UserStatus.ACTIVE
																	? 'bg-emerald-500/10 text-emerald-400'
																	: 'bg-red-500/10 text-red-400'
															)}
														>
															{user.status === UserStatus.ACTIVE ? (
																<CheckCircle2 className='w-3 h-3' />
															) : (
																<Lock className='w-3 h-3' />
															)}
															{user.status === UserStatus.ACTIVE
																? 'Active'
																: 'Blocked'}
														</span>
													</td>
													<td className='px-5 py-4 text-sm font-medium text-white/50'>
														{format(new Date(user.createdAt), 'dd.MM.yyyy')}
													</td>
													<td className='px-5 py-4 last:pr-6'>
														<div className='flex items-center gap-1.5 transition-opacity duration-150'>
															<Tooltip>
																<TooltipTrigger asChild>
																	<Link
																		href={`/dashboard/admin/users/${user.id}`}
																		className='p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors'
																	>
																		<Eye className='w-4.5 h-4.5' />
																	</Link>
																</TooltipTrigger>
																<TooltipContent className='bg-[#0E172B] border-white/10 text-white text-xs'>
																	Profile
																</TooltipContent>
															</Tooltip>

															<Tooltip>
																<TooltipTrigger asChild>
																	<button
																		onClick={() =>
																			openBlockDialog(
																				user.id,
																				user.status,
																				user.name
																			)
																		}
																		className={cn(
																			'p-2 rounded-lg transition-colors',
																			user.status === UserStatus.BLOCKED
																				? 'text-emerald-400 hover:bg-emerald-500/10'
																				: 'text-red-400 hover:bg-red-500/10'
																		)}
																	>
																		{user.status === UserStatus.BLOCKED ? (
																			<LockOpen className='w-4.5 h-4.5' />
																		) : (
																			<Lock className='w-4.5 h-4.5' />
																		)}
																	</button>
																</TooltipTrigger>
																<TooltipContent className='bg-[#0E172B] border-white/10 text-white text-xs'>
																	{user.status === UserStatus.BLOCKED
																		? 'Unblock'
																		: 'Block'}
																</TooltipContent>
															</Tooltip>
														</div>
													</td>
												</m.tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Pagination */}
								<div className='flex items-center justify-between gap-4 px-6 py-4 border-t border-white/5 bg-white/[0.01]'>
									<div className='flex items-center gap-3 text-sm text-white/50 font-medium'>
										<Popover open={openLimit} onOpenChange={setOpenLimit}>
											<PopoverTrigger asChild>
												<Button
													variant='ghost'
													role='combobox'
													aria-expanded={openLimit}
													className='h-9 gap-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg px-3'
												>
													<span className='text-sm'>{itemsPerPage} rows</span>
													<ChevronsUpDown className='h-3.5 w-3.5 opacity-50' />
												</Button>
											</PopoverTrigger>
											<PopoverContent
												className='w-[130px] p-1 bg-[#0E172B] border-white/10 shadow-2xl rounded-xl backdrop-blur-2xl'
												align='start'
											>
												<Command className='bg-transparent text-white'>
													<CommandList>
														<CommandGroup>
															{limits.map(limit => (
																<CommandItem
																	key={limit.value}
																	value={limit.value.toString()}
																	onSelect={() => {
																		setItemsPerPage(limit.value)
																		setCurrentPage(1)
																		setOpenLimit(false)
																	}}
																	className='text-white/70 hover:bg-white/10 hover:text-white cursor-pointer rounded-lg py-2.5 px-3 text-sm mb-0.5 last:mb-0 transition-colors'
																>
																	<span className='font-medium'>
																		{limit.value} rows
																	</span>
																	{itemsPerPage === limit.value && (
																		<Check className='ml-auto h-3.5 w-3.5 text-blue-400' />
																	)}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
										<span className='hidden sm:inline text-sm'>
											{(currentPage - 1) * itemsPerPage + 1}-
											{Math.min(
												currentPage * itemsPerPage,
												filteredUsers.length
											)}{' '}
											of {filteredUsers.length}
										</span>
									</div>

									<div className='flex gap-2'>
										<Button
											variant='ghost'
											size='icon'
											onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
											disabled={currentPage === 1}
											className='h-9 w-9 rounded-lg hover:bg-white/10 disabled:opacity-20 text-white transition-all active:scale-95'
										>
											<ChevronLeft className='w-4.5 h-4.5' />
										</Button>
										<Button
											variant='ghost'
											size='icon'
											onClick={() =>
												setCurrentPage(p => Math.min(totalPages, p + 1))
											}
											disabled={currentPage === totalPages}
											className='h-9 w-9 rounded-lg hover:bg-white/10 disabled:opacity-20 text-white transition-all active:scale-95'
										>
											<ChevronRight className='w-4.5 h-4.5' />
										</Button>
									</div>
								</div>
							</m.div>
						)}
					</AnimatePresence>
				</div>

				{/* Block Dialog */}
				<AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
					<AlertDialogContent className='bg-[#0A0F1D] border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-md'>
						<AlertDialogHeader>
							<AlertDialogTitle className='text-xl font-bold text-white'>
								{blockDialogData?.status === UserStatus.BLOCKED
									? 'Unblock?'
									: 'Block?'}
							</AlertDialogTitle>
							<AlertDialogDescription className='text-white/60 text-sm mt-1.5'>
								Are you sure you want to change the status of user
								<br />
								<span className='text-white font-semibold bg-white/5 px-2 py-0.5 rounded-md'>
									{blockDialogData?.userName}
								</span>
								?
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter className='mt-4 gap-2'>
							<AlertDialogCancel className='bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl h-10 px-5 font-medium'>
								Cancel
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={confirmToggleBlockUser}
								className={cn(
									'rounded-xl text-white border-0 h-10 px-5 font-semibold',
									blockDialogData?.status === UserStatus.BLOCKED
										? 'bg-emerald-600 hover:bg-emerald-700'
										: 'bg-red-600 hover:bg-red-700'
								)}
							>
								Confirm
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</TooltipProvider>
	)
}
