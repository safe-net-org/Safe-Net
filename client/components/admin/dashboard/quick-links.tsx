'use client'

import { m } from 'framer-motion'
import { BarChart3, BookOpen, Users } from '@/components/ui/icons'
import Link from 'next/link'

const quickLinks = [
	{
		icon: BookOpen,
		label: 'Manage courses',
		href: '/dashboard/admin/learning/courses',
		color: 'from-purple-500 to-purple-600',
	},
	{
		icon: Users,
		label: 'Users',
		href: '/dashboard/admin/users',
		color: 'from-blue-500 to-blue-600',
	},
	{
		icon: BarChart3,
		label: 'Statistics',
		href: '/dashboard/admin/stats/overview',
		color: 'from-green-500 to-green-600',
	},
]

export default function QuickLinks() {
	return (
		<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
			{quickLinks.map((link, i) => {
				const Icon = link.icon
				return (
					<m.div
						key={link.href}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: i * 0.1 }}
					>
						<Link
							href={link.href}
							className={`block p-6 rounded-xl bg-linear-to-br ${link.color} text-white hover:shadow-lg transition-shadow`}
						>
							<Icon className='w-8 h-8 mb-3' />
							<p className='font-semibold'>{link.label}</p>
						</Link>
					</m.div>
				)
			})}
		</div>
	)
}
