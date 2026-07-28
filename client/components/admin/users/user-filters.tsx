'use client'

import { m } from 'framer-motion'
import { Search } from '@/components/ui/icons'

interface UserFiltersProps {
	search: string
	onSearchChange: (value: string) => void
	roleFilter: string
	onRoleFilterChange: (value: string) => void
	statusFilter: string
	onStatusFilterChange: (value: string) => void
}

export default function UserFilters({
	search,
	onSearchChange,
	roleFilter,
	onRoleFilterChange,
	statusFilter,
	onStatusFilterChange,
}: UserFiltersProps) {
	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6'
		>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				{/* Search */}
				<div className='relative'>
					<Search className='absolute left-3 top-3 w-5 h-5 text-gray-400' />
					<input
						type='text'
						placeholder='Search by name or email...'
						value={search}
						onChange={e => onSearchChange(e.target.value)}
						className='w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
					/>
				</div>

				{/* Role Filter */}
				<select
					value={roleFilter}
					onChange={e => onRoleFilterChange(e.target.value)}
					className='px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
				>
					<option value='all'>All roles</option>
					<option value='USER'>👤 User</option>
					<option value='ADMIN'>👨‍💼 Administrator</option>
				</select>

				{/* Status Filter */}
				<select
					value={statusFilter}
					onChange={e => onStatusFilterChange(e.target.value)}
					className='px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500'
				>
					<option value='all'>All statuses</option>
					<option value='ACTIVE'>✓ Active</option>
					<option value='BLOCKED'>✕ Blocked</option>
				</select>
			</div>
		</m.div>
	)
}
