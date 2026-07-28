'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import { selectPlural } from '@/i18n/plural'
import { AnimatePresence, m } from 'framer-motion'
import { AlertTriangle, Loader2 } from '@/components/ui/icons'
import { useState } from 'react'

interface DeleteCourseDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	courseTitle: string
	lessonsCount: number
	onConfirm: () => Promise<void>
}

export function DeleteCourseDialog({
	open,
	onOpenChange,
	courseTitle,
	lessonsCount,
	onConfirm,
}: DeleteCourseDialogProps) {
	const { locale, t } = useI18n()
	const c = t.adminCourseComponents.deleteCourseDialog
	const [isDeleting, setIsDeleting] = useState(false)

	const handleConfirm = async () => {
		setIsDeleting(true)
		try {
			await onConfirm()
			onOpenChange(false)
		} catch (error) {
			console.error('Delete error:', error)
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<AnimatePresence>
			{open && (
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
				>
					<m.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: 'spring', damping: 25, stiffness: 300 }}
						className='relative w-full max-w-md rounded-2xl border border-red-500/20 bg-overlay p-6 shadow-2xl'
					>
						{/* Icon */}
						<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10'>
							<AlertTriangle className='h-8 w-8 text-red-400' />
						</div>

						{/* Content */}
						<div className='text-center'>
							<h3 className='mb-2 text-2xl font-bold text-white'>
								{c.title}
							</h3>
							<p className='mb-2 text-gray-400'>
								{c.bodyPrefix}{' '}
								<span className='font-semibold text-white'>
									&ldquo;{courseTitle}&rdquo;
								</span>
								?
							</p>
							{lessonsCount > 0 && (
								<div className='mx-auto mb-2 max-w-xs rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-400'>
									<p className='font-semibold'>{c.attention}</p>
									<p className='mt-1 text-xs'>
										{c.lessonsWarningTemplate.replace(
											'{count}',
											String(lessonsCount)
										).replace(
											'{lessonWord}',
											selectPlural(locale, lessonsCount, {
												one: c.lessonWordOne,
												few: c.lessonWordFew,
												many: c.lessonWordMany,
											})
										)}
									</p>
								</div>
							)}
							<p className='text-sm text-red-400'>
								{c.irreversibleNote}
							</p>
						</div>

						{/* Actions */}
						<div className='mt-6 flex gap-3'>
							<m.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => onOpenChange(false)}
								disabled={isDeleting}
								className='flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-gray-300 transition-all hover:bg-white/10 disabled:opacity-50'
							>
								{c.buttons.cancel}
							</m.button>
							<m.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={handleConfirm}
								disabled={isDeleting}
								className='flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50'
							>
								{isDeleting ? (
									<>
										<Loader2 className='mr-2 inline h-4 w-4 animate-spin' />
										{c.buttons.deleting}
									</>
								) : (
									c.buttons.confirm
								)}
							</m.button>
						</div>
					</m.div>
				</m.div>
			)}
		</AnimatePresence>
	)
}
