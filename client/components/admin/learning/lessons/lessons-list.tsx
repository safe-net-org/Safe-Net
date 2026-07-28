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
import { ROUTES } from '@/config/pages-url.config'
import { useI18n } from '@/i18n/LocaleProvider'
import { selectPlural } from '@/i18n/plural'
import { adminService } from '@/services/admin/admin.service'
import { ILesson } from '@/services/admin/admin.types'
import { AnimatePresence, m } from 'framer-motion'
import { AlertTriangle, Clock, Edit, Layers, Loader2, Trash2 } from '@/components/ui/icons'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

interface LessonsListProps {
	lessons: ILesson[]
	onUpdate: () => void
}

export default function LessonsList({ lessons, onUpdate }: LessonsListProps) {
	const { locale, t } = useI18n()
	const c = t.adminLessonComponents.lessonsList
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [isDeleting, setIsDeleting] = useState(false)
	const [selectedLesson, setSelectedLesson] = useState<{
		id: string
		title: string
		blocksCount: number
	} | null>(null)

	const handleDeleteClick = (lessonId: string, lessonTitle: string, blocksCount: number) => {
		setSelectedLesson({ id: lessonId, title: lessonTitle, blocksCount })
		setDeleteDialogOpen(true)
	}

	const handleDeleteConfirm = async () => {
		if (!selectedLesson) return

		setIsDeleting(true)
		try {
			await adminService.deleteLesson(selectedLesson.id)
			toast.success(c.toasts.lessonDeleted)
			onUpdate()
			setDeleteDialogOpen(false)
		} catch {
			toast.error(c.toasts.lessonDeleteError)
		} finally {
			setIsDeleting(false)
			setSelectedLesson(null)
		}
	}

	return (
		<>
			<div className='space-y-3'>
				{lessons
					?.sort((a, b) => (a.order || 0) - (b.order || 0))
					.map((lesson, i) => (
						<m.div
							key={lesson.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.05 }}
							className='flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all group'
						>
							<div className='flex-1 min-w-0'>
								<div className='flex items-center gap-2'>
									<span className='text-xs font-medium text-blue-400/80 uppercase tracking-wider'>
										№{lesson.order || i + 1}
									</span>
									<h4 className='text-white font-medium truncate'>{lesson.title}</h4>
								</div>

								<div className='flex items-center gap-4 mt-1.5'>
									<div className='flex items-center gap-1.5 text-[13px] text-gray-500'>
										<Layers className='w-3.5 h-3.5' />
										<span>
											{lesson.blocks?.length || 0}{' '}
											{selectPlural(locale, lesson.blocks?.length || 0, {
												one: c.blockWordOne,
												few: c.blockWordFew,
												many: c.blockWordMany,
											})}
										</span>
									</div>
									{lesson.estimatedDuration && (
										<div className='flex items-center gap-1.5 text-[13px] text-gray-500'>
											<Clock className='w-3.5 h-3.5' />
											<span>{c.durationTemplate.replace('{minutes}', String(lesson.estimatedDuration))}</span>
										</div>
									)}
								</div>
							</div>

							<div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
								<Link href={`${ROUTES.ADMIN.LEARNING.LESSONS}/${lesson.id}/edit`}>
									<Button
										variant='ghost'
										size='icon'
										className='h-9 w-9 text-gray-400 hover:text-white hover:bg-white/10'
									>
										<Edit className='w-4 h-4' />
									</Button>
								</Link>
								<Button
									variant='ghost'
									size='icon'
									onClick={() => handleDeleteClick(lesson.id, lesson.title, lesson.blocks?.length || 0)}
									className='h-9 w-9 text-gray-500 hover:text-red-400 hover:bg-red-500/10'
								>
									<Trash2 className='w-4 h-4' />
								</Button>
							</div>
						</m.div>
					))}
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AnimatePresence>
					{deleteDialogOpen && selectedLesson && (
						<AlertDialogContent className='border-white/20 bg-slate-900/95 backdrop-blur-xl'>
							<AlertDialogHeader>
								<AlertDialogTitle className='flex items-center gap-2 text-white'>
									<m.div
										initial={{ rotate: 0 }}
										animate={{ rotate: [0, -10, 10, -10, 0] }}
										transition={{ duration: 0.5, delay: 0.2 }}
									>
										<AlertTriangle className='h-5 w-5 text-red-500' />
									</m.div>
									{c.deleteDialog.title}
								</AlertDialogTitle>
								<AlertDialogDescription className='space-y-2 text-white/70'>
									<p>
										{c.deleteDialog.descriptionPrefix}{' '}
										<span className='font-semibold text-white'>
											&ldquo;{selectedLesson.title}&rdquo;
										</span>
										?
									</p>
									{selectedLesson.blocksCount > 0 && (
										<p className='text-sm text-red-400'>
											⚠️ {c.deleteDialog.warningPrefix}{' '}
											<span className='font-semibold'>
												{selectedLesson.blocksCount}{' '}
												{selectPlural(locale, selectedLesson.blocksCount, {
													one: c.blockWordOne,
													few: c.blockWordFew,
													many: c.blockWordMany,
												})}
											</span>
											{' '}{c.deleteDialog.warningSuffix}
										</p>
									)}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel
									disabled={isDeleting}
									className='border-white/20 bg-slate-800/50 hover:bg-slate-700/50'
								>
									{c.deleteDialog.cancel}
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDeleteConfirm}
									disabled={isDeleting}
									className='bg-red-600 hover:bg-red-700'
								>
									{isDeleting ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											{c.deleteDialog.deleting}
										</>
									) : (
										c.deleteDialog.confirm
									)}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					)}
				</AnimatePresence>
			</AlertDialog>
		</>
	)
}
