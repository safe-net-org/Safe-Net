'use client'

import { Badge } from '@/components/ui/badge'

import { adminService } from '@/services/admin/admin.service'
import { IUserListItem } from '@/services/admin/admin.types'
import { formatDate } from '@/utils/date-time/dateFormatter'

import { m } from 'framer-motion'
import { Eye, Trash2 } from '@/components/ui/icons'
import Link from 'next/link'
import { toast } from 'sonner'

interface UsersTableProps {
	users: IUserListItem[]
	onUserUpdated: () => void
}

export default function UsersTable({ users, onUserUpdated }: UsersTableProps) {
	const handleDelete = async (userId: string, userName: string) => {
		const confirmed = window.confirm(
			`Are you sure? Enter "DELETE" to confirm deleting ${userName}`
		)

		if (confirmed) {
			try {
				await adminService.deleteUser(userId)
				toast.success('User deleted')
				onUserUpdated()
			} catch {
				toast.error('Error deleting user')
			}
		}
	}

	return (
		<div className='overflow-x-auto'>
			<table className='w-full'>
				<thead>
					<tr className='border-b border-white/10'>
						{[
							'Name',
							'Roles',
							'Status',
							'Courses',
							'Registration date',
							'Actions',
						].map(h => (
							<th
								key={h}
								className='text-left text-xs font-semibold text-white/60 pb-3 px-4 first:pl-0'
							>
								{h}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{users.map((user, idx) => {
						const createdDate =
							formatDate(user.createdAt, {
								format: 'date-medium',
								locale: 'en-US',
								gracefulFail: true,
							}) || '—'

						return (
							<m.tr
								key={user.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: idx * 0.05 }}
								className='border-b border-white/5 hover:bg-white/5 transition-colors'
							>
								<td className='py-4 px-4 pl-0'>
									<div>
										<div className='font-medium text-white'>{user.name}</div>
										<div className='text-sm text-white/60'>{user.email}</div>
									</div>
								</td>
								<td className='py-4 px-4'>
									<div className='flex gap-1.5 flex-wrap'>
										{user.rights.map(role => (
											<Badge key={role} variant='secondary' className='text-xs'>
												{role}
											</Badge>
										))}
									</div>
								</td>
								<td className='py-4 px-4'>
									<Badge
										variant={
											user.status === 'ACTIVE' ? 'default' : 'destructive'
										}
										className='text-xs'
									>
										{user.status}
									</Badge>
								</td>
								<td className='py-4 px-4'>
									<div className='text-white/80 text-sm'>
										{user.stats
											? `${user.stats.coursesCompleted} completed`
											: '—'}
									</div>
								</td>
								<td className='py-4 px-4'>
									<div className='text-white/60 text-sm'>{createdDate}</div>
								</td>
								<td className='py-4 px-4'>
									<div className='flex items-center gap-2'>
										<Link
											href={`/admin/users/${user.id}`}
											className='p-2 hover:bg-white/10 rounded-lg transition-colors'
										>
											<Eye className='w-4 h-4 text-white/60' />
										</Link>
										<button
											onClick={() => handleDelete(user.id, user.name)}
											className='p-2 hover:bg-red-500/10 rounded-lg transition-colors'
										>
											<Trash2 className='w-4 h-4 text-red-400' />
										</button>
									</div>
								</td>
							</m.tr>
						)
					})}
				</tbody>
			</table>
		</div>
	)
}
