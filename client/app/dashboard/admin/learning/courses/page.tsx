'use client'

import CourseTree from '@/components/admin/learning/courses/course-tree'
import CreateCourseDialog from '@/components/admin/learning/courses/create-course-dialog'
import CreateStageDialog from '@/components/admin/learning/courses/create-stage-dialog'

import { Button } from '@/components/ui/button'
import { useLearningContent } from '@/hooks/admin/learning/useLearningContent'
import { useI18n } from '@/i18n/LocaleProvider'
import { AnimatePresence, m } from 'framer-motion'
import { BookOpen, Layers, Plus } from '@/components/ui/icons'
import { useMemo, useState } from 'react'

export default function CoursesPage() {
  const { t } = useI18n()
  const c = t.adminCourses.list
  const { stages, isLoading, refetch } = useLearningContent()
  const [showStageDialog, setShowStageDialog] = useState(false)
  const [showCourseDialog, setShowCourseDialog] = useState(false)

  // Statistics
  const stats = useMemo(() => {
    const stagesCount = stages?.length || 0
    const coursesCount = stages?.reduce(
      (acc, stage) => acc + (stage.courses?.length || 0),
      0
    ) || 0
    return { stagesCount, coursesCount }
  }, [stages])

  // Loading
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className='text-center'
        >
          <div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className='text-sm text-gray-400'>{c.loading}</p>
        </m.div>
      </div>
    )
  }

  return (
    <>
      <div className='min-h-screen'>
        <div className='max-w-7xl mx-auto space-y-6'>
          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'
          >
            <div className='flex-1'>
              <h1 className='text-4xl font-bold text-white mb-2'>
                {c.heading}
              </h1>
              <p className='text-gray-400'>
                {c.subtitle}
              </p>
            </div>

            <div className='flex gap-3'>
              <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setShowStageDialog(true)}
                  className='gap-2 bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold border border-white/[0.1] backdrop-blur-xl shadow-lg'
                >
                  <Plus className='w-5 h-5' />
                  {c.createStage}
                </Button>
              </m.div>
              <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
								<Button
         					onClick={() => setShowCourseDialog(true)}
		              className='border border-border bg-white text-black shadow-md hover:bg-white/80'
		            >
		              <Plus className='w-5 h-5' />
		              {c.createCourse}
		            </Button>
              </m.div>
            </div>
          </m.div>

          {/* Stats */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className='grid grid-cols-1 sm:grid-cols-2 gap-4'
          >
            <m.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className='p-6 rounded-2xl text-left transition-all bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/5'
            >
              <div className='flex items-center gap-3 mb-3'>
                <div className='p-2 rounded-xl bg-purple-500/10'>
                  <Layers className='w-5 h-5 text-purple-400' />
                </div>
                <span className='text-xs text-gray-500 uppercase font-semibold'>
                  {c.totalStages}
                </span>
              </div>
              <p className='text-3xl font-bold text-white'>
                {stats.stagesCount}
              </p>
            </m.button>

            <m.button
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className='p-6 rounded-2xl text-left transition-all bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/5'
            >
              <div className='flex items-center gap-3 mb-3'>
                <div className='p-2 rounded-xl bg-blue-500/10'>
                  <BookOpen className='w-5 h-5 text-blue-400' />
                </div>
                <span className='text-xs text-gray-500 uppercase font-semibold'>
                  {c.totalCourses}
                </span>
              </div>
              <p className='text-3xl font-bold text-white'>
                {stats.coursesCount}
              </p>
            </m.button>
          </m.div>

          {/* Course Tree */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <AnimatePresence mode='wait'>
              {stages && stages.length > 0 ? (
                <m.div
                  key='course-tree'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CourseTree stages={stages} onRefetch={refetch} />
                </m.div>
              ) : (
                <m.div
                  key='empty-state'
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className='text-center py-20 rounded-2xl bg-white/5 border border-white/10'
                >
                  <div className='w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6'>
                    <Layers className='w-10 h-10 text-gray-600' />
                  </div>
                  <h3 className='text-xl font-semibold text-white mb-2'>
                    {c.empty.title}
                  </h3>
                  <p className='text-gray-400 max-w-md mx-auto mb-8 leading-relaxed'>
                    {c.empty.description}
                  </p>
                  <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => setShowStageDialog(true)}
                      className='gap-2 bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold border border-white/[0.1] backdrop-blur-xl shadow-lg'
                    >
                      <Plus className='w-5 h-5' />
                      {c.empty.cta}
                    </Button>
                  </m.div>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        </div>
      </div>

      {/* Dialogs */}
      <CreateStageDialog
        open={showStageDialog}
        onOpenChange={setShowStageDialog}
        onSuccess={refetch}
        existingStagesCount={stats.stagesCount}
      />

      <CreateCourseDialog
        open={showCourseDialog}
        onOpenChange={setShowCourseDialog}
        stages={stages || []}
        onSuccess={refetch}
      />
    </>
  )
}
