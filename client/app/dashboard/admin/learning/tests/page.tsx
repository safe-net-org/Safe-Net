'use client'

import { AppleTestCard } from '@/components/admin/learning/tests/AppleTestCard'
import CreateTestDialog from '@/components/admin/learning/tests/create-test-dialog'
import { DeleteTestDialog } from '@/components/admin/learning/tests/delete-test-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCoursesList } from '@/hooks/admin/learning/use-courses'
import { useTests } from '@/hooks/admin/tests/use-tests'
import { useI18n } from '@/i18n/LocaleProvider'
import { ITest } from '@/services/admin/admin.types'
import { AnimatePresence, m } from 'framer-motion'
import { FileQuestion, Plus, Search, X } from '@/components/ui/icons'
import { useMemo, useState } from 'react'

export default function TestsPage() {
  const { t } = useI18n()
  const c = t.adminTests.list
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    test: ITest | null
  }>({ open: false, test: null })
  const [searchQuery, setSearchQuery] = useState('')

  const { tests, isLoading, deleteTest, isDeleting } = useTests()
  const { courses } = useCoursesList()

  // Filtering
  const filteredTests = useMemo(() => {
    if (!tests) return []

    if (!searchQuery) return tests

    const query = searchQuery.toLowerCase()
    return tests.filter(
      test =>
        test.title.toLowerCase().includes(query) ||
        test.description?.toLowerCase().includes(query) ||
        test.course?.title.toLowerCase().includes(query)
    )
  }, [tests, searchQuery])

  const handleDelete = async () => {
    if (!deleteDialog.test) return
    try {
      await deleteTest(deleteDialog.test.id)
      setDeleteDialog({ open: false, test: null })
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-sm text-gray-400'>{c.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='min-h-screen'>
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Header */}
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-bold text-white mb-2'>{c.heading}</h1>
              <p className='text-gray-400'>
                {c.subtitle}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className='border border-border bg-white text-black shadow-md hover:bg-white/80'
            >
              <Plus className='w-5 h-5' />
              {c.createTest}
            </Button>
          </div>

          {/* Stats */}
          <m.button
            whileHover={{ y: -2 }}
            className='w-full p-6 rounded-2xl text-left transition-all bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20'
          >
            <div className='flex items-center gap-3 mb-3'>
              <div className='p-2 rounded-xl bg-blue-500/10'>
                <FileQuestion className='w-5 h-5 text-blue-400' />
              </div>
              <span className='text-xs text-gray-500 uppercase font-semibold'>
                {c.totalTests}
              </span>
            </div>
            <p className='text-3xl font-bold text-white'>{tests?.length ?? 0}</p>
          </m.button>

          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <Input
              placeholder={c.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='pl-12 pr-10 h-12 bg-white/15! border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500/50'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors'
              >
                <X className='w-4 h-4 text-gray-400' />
              </button>
            )}
          </div>

          {/* Active search info */}
          {searchQuery && (
            <div className='flex items-center gap-3 text-sm'>
              <span className='text-gray-500'>{c.foundLabel}</span>
              <span className='font-bold text-white'>{filteredTests.length}</span>
            </div>
          )}

          {/* Grid */}
          <AnimatePresence mode='wait'>
            {filteredTests.length > 0 ? (
              <m.div
                key='grid'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
              >
                {filteredTests.map((test, i) => (
                  <AppleTestCard
                    key={test.id}
                    test={test}
                    index={i}
                    onDelete={t => setDeleteDialog({ open: true, test: t })}
                  />
                ))}
              </m.div>
            ) : (
              <m.div
                key='empty'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='text-center py-20'
              >
                <div className='w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4'>
                  <FileQuestion className='w-10 h-10 text-gray-600' />
                </div>
                <h3 className='text-xl font-semibold text-white mb-2'>
                  {searchQuery ? c.notFound : c.empty}
                </h3>
                <p className='text-gray-400 mb-6'>
                  {searchQuery
                    ? c.tryChangingQuery
                    : c.createFirst}
                </p>
                <Button
                  onClick={
                    searchQuery
                      ? () => setSearchQuery('')
                      : () => setShowCreateDialog(true)
                  }
                  className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                >
                  {searchQuery ? c.clearSearch : c.createTest}
                </Button>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CreateTestDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        courses={courses || []}
        onSuccess={() => {}}
      />

      <DeleteTestDialog
        open={deleteDialog.open}
        onOpenChange={open =>
          !open && setDeleteDialog({ open: false, test: null })
        }
        testTitle={deleteDialog.test?.title ?? ''}
        questionsCount={deleteDialog.test?.questions?.length ?? 0}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}
