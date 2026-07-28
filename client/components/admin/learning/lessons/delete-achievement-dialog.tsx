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
import { useI18n } from '@/i18n/LocaleProvider'
import { AnimatePresence, m } from 'framer-motion'
import { AlertTriangle, Loader2 } from '@/components/ui/icons'

interface DeleteAchievementDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	achievementTitle: string
	onConfirm: () => void | Promise<void>
	isDeleting?: boolean
}

export function DeleteAchievementDialog({
	open,
	onOpenChange,
	achievementTitle,
	onConfirm,
	isDeleting = false,
}: DeleteAchievementDialogProps) {
	const { t } = useI18n()
	const c = t.adminLessonComponents.deleteAchievementDialog
	const handleConfirm = async () => {
		await onConfirm()
		onOpenChange(false)
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AnimatePresence mode='wait'>
				{open && (
					<AlertDialogContent className='bg-overlay/95 backdrop-blur-2xl border border-red-500/20 text-white'>
						<m.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ duration: 0.2 }}
						>
							<AlertDialogHeader>
								<div className='flex items-center gap-3 mb-4'>
									<div className='p-3 rounded-full bg-red-500/10'>
										<AlertTriangle className='w-6 h-6 text-red-400' />
									</div>
									<AlertDialogTitle className='text-xl'>
										{c.title}
									</AlertDialogTitle>
								</div>
								<AlertDialogDescription className='text-gray-300 space-y-3'>
									<p>
										{c.descriptionPrefix}{' '}
										<span className='font-semibold text-white'>
											&ldquo;{achievementTitle}&rdquo;
										</span>
										?
									</p>
									<div className='p-3 rounded-lg bg-red-500/10 border border-red-500/20'>
										<p className='text-sm text-red-300'>
											⚠️ {c.warning}
										</p>
									</div>
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className='mt-6'>
								<AlertDialogCancel
									disabled={isDeleting}
									className='bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
								>
									{c.cancel}
								</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleConfirm}
									disabled={isDeleting}
									className='gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
								>
									{isDeleting ? (
										<>
											<Loader2 className='w-4 h-4 animate-spin' />
											{c.deleting}
										</>
									) : (
										c.confirm
									)}
								</AlertDialogAction>
							</AlertDialogFooter>
						</m.div>
					</AlertDialogContent>
				)}
			</AnimatePresence>
		</AlertDialog>
	)
}
