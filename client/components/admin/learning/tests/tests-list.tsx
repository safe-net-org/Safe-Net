'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import { adminService } from '@/services/admin/admin.service'
import { useQuery } from '@tanstack/react-query'
import { m } from 'framer-motion'
import { Edit, FileText, HelpCircle, Trash2 } from '@/components/ui/icons'
import Link from 'next/link'
import { toast } from 'sonner'

interface TestsListProps {
	onTestsChange: () => void
}

export default function TestsList({ onTestsChange }: TestsListProps) {
	const { t } = useI18n()
	const c = t.adminTestComponents.testsList
	const { data: tests, isLoading } = useQuery({
		queryKey: ['tests-list'],
		queryFn: () => adminService.getTests(),
	})

	const handleDeleteTest = async (testId: string, testTitle: string) => {
		if (window.confirm(c.confirmDeleteTemplate.replace('{title}', testTitle))) {
			try {
				await adminService.deleteTest(testId)
				toast.success(c.toasts.deleted)
				onTestsChange()
			} catch {
				toast.error(c.toasts.deleteError)
			}
		}
	}

	if (isLoading) return <div className='text-center py-4'>{c.loading}</div>

	if (!tests || tests.length === 0) {
		return (
			<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
				{c.empty}
			</div>
		)
	}

	return (
		<div className='space-y-3'>
			{tests.map((test, i) => (
				<m.div
					key={test.id}
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: i * 0.05 }}
					className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition'
				>
					<div className='flex items-start justify-between gap-3'>
						<div className='flex items-start gap-3 flex-1'>
							<FileText className='w-5 h-5 text-blue-600 mt-1 shrink-0' />
							<div className='flex-1 min-w-0'>
								<p className='font-semibold text-gray-900 dark:text-white'>
									{test.title}
								</p>
								{test.description && (
									<p className='text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2'>
										{test.description}
									</p>
								)}
								<div className='flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400'>
									<span className='flex items-center gap-1'>
										<HelpCircle className='w-3 h-3' />
										{c.questionsCountTemplate.replace(
											'{count}',
											String(test.questions?.length || 0)
										)}
									</span>
									{test.course && <span>{test.course.title}</span>}
								</div>
							</div>
						</div>

						<div className='flex items-center gap-2 ml-auto shrink-0'>
							<Link
								href={`/dashboard/admin/learning/tests/${test.id}/edit`}
								className='p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition text-blue-600'
								title={c.editTitle}
							>
								<Edit className='w-4 h-4' />
							</Link>
							<button
								onClick={() => handleDeleteTest(test.id, test.title)}
								className='p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded transition text-red-600'
								title={c.deleteTitle}
							>
								<Trash2 className='w-4 h-4' />
							</button>
						</div>
					</div>
				</m.div>
			))}
		</div>
	)
}
