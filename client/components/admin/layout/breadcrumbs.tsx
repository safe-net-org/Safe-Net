'use client'

import { m } from 'framer-motion'
import { ChevronRight, Home } from '@/components/ui/icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const breadcrumbLabels: Record<string, string> = {
	admin: 'Admin panel',
	learning: 'Learning',
	courses: 'Courses',
	lessons: 'Lessons',
	tests: 'Tests',
	users: 'Users',
	stats: 'Statistics',
	overview: 'Overview',
	settings: 'Settings',
	edit: 'Edit',
}

export default function Breadcrumbs() {
	const pathname = usePathname()

	const segments = pathname
		.split('/')
		.filter(Boolean)
		.filter(s => s !== 'dashboard')

	if (segments.length <= 1) return null

	return (
		<m.nav
			initial={{ opacity: 0, y: -10 }}
			animate={{ opacity: 1, y: 0 }}
			className='flex items-center gap-2 rounded-lg border border-border/70 bg-card px-6 py-3 text-sm text-muted-foreground'
		>
			<Link
				href='/dashboard/admin'
				className='flex items-center gap-1 transition-colors hover:text-foreground'
			>
				<Home className='w-4 h-4' />
				<span>Home</span>
			</Link>

			{segments.map((segment, index) => {
				const href = `/dashboard/${segments.slice(0, index + 1).join('/')}`
				const label =
					breadcrumbLabels[segment] ||
					segment.charAt(0).toUpperCase() + segment.slice(1)
				const isLast = index === segments.length - 1

				return (
					<m.div key={segment} className='flex items-center gap-2'>
						<ChevronRight className='w-4 h-4' />
						{isLast ? (
							<span className='font-medium text-foreground'>
								{label}
							</span>
						) : (
							<Link
								href={href}
								className='transition-colors hover:text-foreground'
							>
								{label}
							</Link>
						)}
					</m.div>
				)
			})}
		</m.nav>
	)
}
