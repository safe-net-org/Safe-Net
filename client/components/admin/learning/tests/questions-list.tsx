'use client'

import { adminService } from '@/services/admin/admin.service'
import { ITestQuestion } from '@/services/admin/admin.types'
import { m } from 'framer-motion'
import { Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeleteQuestionDialog } from './DeleteQuestionDialog'
import CreateQuestionDialog from './question-form-dialog'

interface QuestionsListProps {
  questions: ITestQuestion[]
  testId: string
  onUpdate: () => void
}

export default function QuestionsList({
  questions,
  testId,
  onUpdate,
}: QuestionsListProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    question: ITestQuestion | null
  }>({ open: false, question: null })

  const [editDialog, setEditDialog] = useState<{
    open: boolean
    question: ITestQuestion | null
  }>({ open: false, question: null })

  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteDialog.question) return

    setIsDeleting(true)
    try {
      // Fixed: deleteTestQuestion instead of deleteQuestion
      await adminService.deleteTestQuestion(deleteDialog.question.id)
      toast.success('Question deleted successfully')
      onUpdate()
      setDeleteDialog({ open: false, question: null })
    } catch (error) {
      console.error('Delete question error:', error)
      toast.error('Error deleting question')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditSuccess = () => {
    setEditDialog({ open: false, question: null })
    onUpdate()
  }

  return (
    <>
      <div className='space-y-3'>
        {questions.map((question, index) => (
          <m.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -2 }}
            className='p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group'
          >
            <div className='flex items-start justify-between gap-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-xs font-semibold text-gray-500'>
                    Question {index + 1}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      question.type === 'SINGLE_CHOICE'
                        ? 'bg-blue-500/10 text-blue-400'
                        : question.type === 'MULTI_CHOICE'
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}
                  >
                    {question.type === 'SINGLE_CHOICE'
                      ? 'Single Answer'
                      : question.type === 'MULTI_CHOICE'
                      ? 'Multiple Answers'
                      : question.type === 'SHORT_ANSWER'
                      ? 'Short Answer'
                      : question.type === 'TEXT_INPUT'
                      ? 'Free Text'
                      : question.type === 'PHISHING_EMAIL'
                      ? 'Phishing Email'
                      : 'Phishing Website'}
                  </span>
                </div>
                <p className='text-white font-medium mb-2'>{question.text}</p>
                {question.options && question.options.length > 0 && (
                  <p className='text-sm text-gray-400'>
                    Options: {question.options.length}
                  </p>
                )}
              </div>

              <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                <m.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setEditDialog({ open: true, question })}
                  className='p-2 rounded-lg hover:bg-white/10 transition-colors'
                >
                  <Edit2 className='w-4 h-4 text-gray-400 hover:text-white' />
                </m.button>
                <m.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setDeleteDialog({ open: true, question })}
                  className='p-2 rounded-lg hover:bg-red-500/10 transition-colors'
                >
                  <Trash2 className='w-4 h-4 text-gray-400 hover:text-red-400' />
                </m.button>
              </div>
            </div>
          </m.div>
        ))}
      </div>

      {/* Edit Dialog */}
      <CreateQuestionDialog
        open={editDialog.open}
        onOpenChange={open =>
          !open && setEditDialog({ open: false, question: null })
        }
        testId={testId}
        onSuccess={handleEditSuccess}
        editQuestion={editDialog.question || undefined}
        nextOrder={questions.length + 1}
      />

      {/* Delete Dialog */}
      <DeleteQuestionDialog
        open={deleteDialog.open}
        onOpenChange={open =>
          !open && setDeleteDialog({ open: false, question: null })
        }
        questionText={deleteDialog.question?.text ?? ''}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}
