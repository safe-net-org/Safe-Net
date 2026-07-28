import { BookOpen, ChartLine, FileText, Home, MessageSquareText, Shield, Trophy, Users } from '@/components/ui/icons'

import { ROUTES } from '@/config/pages-url.config'
import type { Messages } from '@/i18n/messages'
import { NavItem } from './navigation.types'

// Admin Menu Items. Labels come from the shared dashboard shell's translations
// so the sidebar reads correctly for admins too, even though the admin pages
// themselves are translated in a separate pass.
export const getAdminNavItems = (t: Messages['dashboardNav']): NavItem[] => [
	{
		label: t.management,
		href: ROUTES.ADMIN.ROOT,
		icon: <Shield className='w-[18px] h-[18px]' />,
		adminOnly: true,
		children: [
			{ label: t.courses, href: ROUTES.ADMIN.LEARNING.COURSES },
			{ label: t.tests, href: `${ROUTES.ADMIN.ROOT}/learning/tests` },
		],
	},
	{
		label: t.users,
		href: ROUTES.ADMIN.USERS,
		icon: <Users className='w-[18px] h-[18px]' />,
		adminOnly: true,
	},
	{
		label: t.statistics,
		href: ROUTES.ADMIN.STATS,
		icon: <ChartLine className='w-[18px] h-[18px]' />,
		adminOnly: true,
	},
	{
		label: t.feedback,
		href: ROUTES.ADMIN.FEEDBACK,
		icon: <MessageSquareText className='w-[18px] h-[18px]' />,
		adminOnly: true,
	},
]

// User Menu Items
export const getNavItems = (t: Messages['dashboardNav']): NavItem[] => [
	{
		label: t.home,
		href: ROUTES.HOME,
		icon: <Home className='w-[18px] h-[18px]' />,
	},
	{
		label: t.myCourses,
		href: ROUTES.COURSES,
		icon: <BookOpen className='w-[18px] h-[18px]' />,
	},
	{
		label: t.certificates,
		href: ROUTES.CERTIFICATES,
		icon: <FileText className='w-[18px] h-[18px]' />,
	},
	{
		label: t.achievements,
		href: ROUTES.ACHIEVEMENTS,
		icon: <Trophy className='w-[18px] h-[18px]' />,
	},
]
