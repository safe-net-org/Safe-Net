'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/i18n/LocaleProvider'
import { AnimatePresence, m } from 'framer-motion'
import { AlertTriangle, Loader2 } from '@/components/ui/icons'

interface DeleteQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  questionText: string
  onConfirm: () => void | Promise<void>
  isDeleting?: boolean
}

export function DeleteQuestionDialog({
  open,
  onOpenChange,
  questionText,
  onConfirm,
  isDeleting = false,
}: DeleteQuestionDialogProps) {
  const { t } = useI18n()
  const c = t.adminTestComponents.deleteQuestionDialog
  const handleConfirm = async () => {
    await onConfirm()
    if (!isDeleting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px] bg-overlay border-white/10'>
        <AnimatePresence mode='wait'>
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className='w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4'
              >
                <AlertTriangle className='w-8 h-8 text-red-400' />
              </m.div>
              <DialogTitle className='text-center text-2xl'>
                {c.title}
              </DialogTitle>
              <DialogDescription className='text-center text-base pt-2'>
                {c.description}
              </DialogDescription>
            </DialogHeader>

            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='my-6 p-4 rounded-xl bg-white/5 border border-white/10'
            >
              <p className='text-sm text-gray-300 line-clamp-3'>
                {questionText}
              </p>
            </m.div>

            <DialogFooter className='gap-2 sm:gap-0 flex-row! space-x-5 justify-center!'>
              <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant='outline'
                  onClick={() => onOpenChange(false)}
                  disabled={isDeleting}
                  className='w-full sm:w-auto'
                >
                  {c.cancel}
                </Button>
              </m.div>
              <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant='destructive'
                  onClick={handleConfirm}
                  disabled={isDeleting}
                  className='w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white'
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      {c.deleting}
                    </>
                  ) : (
                    c.confirm
                  )}
                </Button>
              </m.div>
            </DialogFooter>
          </m.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
