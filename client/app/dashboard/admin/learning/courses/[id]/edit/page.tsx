'use client'

import CourseEditForm from '@/components/admin/learning/courses/course-edit-form'
import { DeleteCourseDialog } from '@/components/admin/learning/courses/delete-course-dialog'
import CreateLessonDialog from '@/components/admin/learning/lessons/create-lesson-dialog'
import LessonsList from '@/components/admin/learning/lessons/lessons-list'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/pages-url.config'
import { useI18n } from '@/i18n/LocaleProvider'
import { selectPlural } from '@/i18n/plural'
import { adminService } from '@/services/admin/admin.service'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, m } from 'framer-motion'
import { AlertCircle, BookOpen, GraduationCap, Plus, Trash2 } from '@/components/ui/icons'
import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

export default function CourseEditPage() {
	const { locale, t } = useI18n()
	const c = t.adminCourses.edit
	const params = useParams()
	const router = useRouter()
	const courseId = params.id as string

	const getLessonWord = (count: number) =>
		selectPlural(locale, count, {
			one: c.lessonWordOne,
			few: c.lessonWordFew,
			many: c.lessonWordMany,
		})

	const [showCreateLesson, setShowCreateLesson] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const {
		data: course,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['course', courseId],
		queryFn: () => adminService.getCourse(courseId),
	})

	const stats = useMemo(() => {
		const lessonsCount = course?.lessons?.length ?? 0
		return { lessonsCount }
	}, [course?.lessons?.length])

	const handleDeleteCourse = async () => {
		try {
			await adminService.deleteCourse(courseId)
			toast.success(c.deleteSuccessToast)
			router.push(ROUTES.ADMIN.LEARNING.COURSES)
		} catch {
			toast.error(c.deleteErrorToast)
		}
	}

	const getDifficultyConfig = (difficulty: string) => {
		switch (difficulty) {
			case 'EASY': return { label: c.difficulty.easy, color: 'bg-green-500/10 text-green-400 border-green-500/20' }
			case 'MEDIUM': return { label: c.difficulty.medium, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' }
			case 'HARD': return { label: c.difficulty.hard, color: 'bg-red-500/10 text-red-400 border-red-500/20' }
			default: return { label: c.difficulty.medium, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
		}
	}

	if (isLoading) return (
		<div className='min-h-screen flex items-center justify-center'>
			<div className='w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin' />
		</div>
	)

	if (!course) return (
		<div className='min-h-screen flex items-center justify-center'>
			<div className='max-w-md w-full p-12 rounded-2xl text-center bg-white/5 border border-white/10'>
				<AlertCircle className='w-10 h-10 text-red-400 mx-auto mb-6' />
				<h2 className='text-2xl font-bold text-white mb-3'>{c.notFound.title}</h2>
				<Button onClick={() => router.push(ROUTES.ADMIN.LEARNING.COURSES)} className='bg-white text-black font-semibold hover:bg-white/80'>
					{c.notFound.back}
				</Button>
			</div>
		</div>
	)

	const difficulty = getDifficultyConfig(course.difficulty || 'MEDIUM')

	return (
		<>
			<div className='max-w-7xl mx-auto space-y-6'>
				<Breadcrumb
					showBackButton
					items={[{ label: c.breadcrumbCourses, href: ROUTES.ADMIN.LEARNING.COURSES }, { label: course.title }]}
				/>

				{/* Header Card */}
				<m.div
					initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
					className='rounded-[24px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl p-8'
				>
					<div className='flex flex-col sm:flex-row sm:items-start justify-between gap-6'>
						<div className='flex-1 space-y-4'>
							<div className='flex items-center gap-3 flex-wrap'>
								<h1 className='text-3xl font-bold text-white'>{course.title}</h1>
								<span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${difficulty.color}`}>
									{difficulty.label}
								</span>
							</div>
							<p className='text-gray-400 leading-relaxed max-w-2xl'>{course.description}</p>
							<div className='flex items-center gap-2 text-sm text-gray-400'>
								<div className='w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center'>
									<GraduationCap className='w-4 h-4 text-blue-400' />
								</div>
								<span>{stats.lessonsCount} {getLessonWord(stats.lessonsCount)}</span>
							</div>
						</div>

						<Button
							onClick={() => setShowDeleteDialog(true)}
							className='gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all'
						>
							<Trash2 className='w-4 h-4' />
							{c.deleteCourse}
						</Button>
					</div>
				</m.div>

				{/* Editor */}
				<div className='rounded-[24px] bg-white/[0.03] border border-white/[0.08] overflow-hidden'>
					<div className='p-6 border-b border-white/[0.05]'>
						<h2 className='text-lg font-semibold text-white'>{c.courseInfo.heading}</h2>
					</div>
					<div className='p-6'>
						<CourseEditForm course={course} onSuccess={refetch} />
					</div>
				</div>

				{/* Lessons */}
				<div className='rounded-[24px] bg-white/[0.03] border border-white/[0.08] overflow-hidden'>
					<div className='p-6 border-b border-white/[0.05] flex items-center justify-between'>
						<div>
							<h2 className='text-lg font-semibold text-white'>{c.lessons.heading}</h2>
							<p className='text-sm text-gray-500'>{c.lessons.subtitle}</p>
						</div>
						<Button
							onClick={() => setShowCreateLesson(true)}
							className='gap-2 bg-white text-black hover:bg-white/90 font-semibold'
						>
							<Plus className='w-4 h-4' />
							{c.lessons.addLesson}
						</Button>
					</div>

					<div className='p-6'>
						<AnimatePresence mode='wait'>
							{stats.lessonsCount > 0 ? (
								<LessonsList lessons={course.lessons} onUpdate={refetch} />
							) : (
								<div className='text-center py-16 rounded-2xl border border-dashed border-white/[0.08]'>
									<BookOpen className='w-12 h-12 text-gray-700 mx-auto mb-4' />
									<h3 className='text-white font-medium mb-6'>{c.lessons.empty}</h3>
									<Button
										onClick={() => setShowCreateLesson(true)}
										className='bg-white text-black font-semibold'
									>
										{c.lessons.createFirst}
									</Button>
								</div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>

			<CreateLessonDialog
				open={showCreateLesson}
				onOpenChange={setShowCreateLesson}
				courseId={course.id}
				onSuccess={refetch}
				existingLessonsCount={stats.lessonsCount}
			/>
			<DeleteCourseDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				courseTitle={course.title}
				lessonsCount={stats.lessonsCount}
				onConfirm={handleDeleteCourse}
			/>
		</>
	)
}
