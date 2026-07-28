import DashboardSidebar from '@/components/dashboard-layout/DashboardLayout'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className='flex min-h-screen bg-background text-foreground'>
			<DashboardSidebar />

			<main className='min-w-0 flex-1 overflow-x-hidden'>{children}</main>
		</div>
	)
}
