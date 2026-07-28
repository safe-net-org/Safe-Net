'use client'

import { DeleteTestDialog } from '@/components/admin/learning/tests/delete-test-dialog'
import CreateQuestionDialog from '@/components/admin/learning/tests/question-form-dialog'
import QuestionsList from '@/components/admin/learning/tests/questions-list'
import TestEditor from '@/components/admin/learning/tests/test-editor'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/pages-url.config'
import { TEST_CONSTANTS } from '@/constants/tests.constants'
import { useTest } from '@/hooks/admin/tests/use-test'
import { useI18n } from '@/i18n/LocaleProvider'
import { adminService } from '@/services/admin/admin.service'
import { getQuestionsLabel } from '@/utils/test.utils'
import { AnimatePresence, m } from 'framer-motion'
import {
    AlertCircle,
    BookOpen,
    FileQuestion,
    Plus,
    Target,
    Trash2,
} from '@/components/ui/icons'
import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

export default function TestEditPage() {
	const { t } = useI18n()
	const c = t.adminTests.detail
	const params = useParams()
	const router = useRouter()
	const testId = params.id as string

	const [showCreateQuestion, setShowCreateQuestion] = useState(false)
	const [showDeleteDialog, setShowDeleteDialog] = useState(false)

	const { test, isLoading, refetch } = useTest(testId)

	const stats = useMemo(() => {
		const questionsCount = test?.questions?.length ?? 0
		return { questionsCount }
	}, [test?.questions?.length])

	const handleDeleteTest = async () => {
		try {
			await adminService.deleteTest(testId)
			toast.success(c.deleteSuccessToast)
			router.push('/dashboard/admin/learning/tests')
		} catch (error) {
			console.error('Delete error:', error)
			toast.error(c.deleteErrorToast)
		}
	}

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

	// Not Found
	if (!test) {
		return (
			<div className='min-h-screen flex items-center justify-center px-4'>
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className='max-w-md w-full p-12 rounded-2xl text-center bg-white/5 border border-white/10'
				>
					<div className='w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6'>
						<AlertCircle className='w-10 h-10 text-red-400' />
					</div>
					<h2 className='text-2xl font-bold text-white mb-3'>{c.notFound.title}</h2>
					<p className='text-gray-400 mb-8'>
						{c.notFound.subtitle}
					</p>
					<Button
						onClick={() => router.push('/dashboard/admin/learning/tests')}
						className='bg-white text-black hover:bg-white/80 font-semibold'
					>
						{c.notFound.back}
					</Button>
				</m.div>
			</div>
		)
	}

	return (
		<>
			<div className='min-h-screen'>
				<div className='max-w-7xl mx-auto space-y-6'>
					{/* Breadcrumb */}
					<m.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
					>
						<Breadcrumb
							showBackButton
							items={[
								{ label: c.breadcrumbTests, href: ROUTES.ADMIN.LEARNING.TESTS },
								{ label: test.title },
							]}
						/>
					</m.div>

					{/* Header */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'
					>
						<div className='flex-1'>
							<h1 className='text-4xl font-bold text-white mb-3'>
								{test.title}
							</h1>
							{test.description && (
								<p className='text-gray-400 mb-4 leading-relaxed'>
									{test.description}
								</p>
							)}
							{test.course && (
								<Badge className='gap-2 bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/15'>
									<BookOpen className='w-3.5 h-3.5' />
									{test.course.title}
								</Badge>
							)}
						</div>

						<m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Button
								variant='default'
								onClick={() => setShowDeleteDialog(true)}
								className='gap-2 border bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-800/10 hover:border-red-800/30 hover:text-red-400 transition-all'
							>
								<Trash2 className='w-4 h-4' />
								{c.deleteTest}
							</Button>
						</m.div>
					</m.div>

					{/* Stats */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.2 }}
						className='grid grid-cols-1 sm:grid-cols-2 gap-4'
					>
						<m.button
							whileHover={{ y: -4 }}
							whileTap={{ scale: 0.98 }}
							className='p-6 rounded-2xl text-left transition-all bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/5'
						>
							<div className='flex items-center gap-3 mb-3'>
								<div className='p-2 rounded-xl bg-blue-500/10'>
									<FileQuestion className='w-5 h-5 text-blue-400' />
								</div>
								<span className='text-xs text-gray-500 uppercase font-semibold'>
									{c.stats.questionsInTest}
								</span>
							</div>
							<p className='text-3xl font-bold text-white'>
								{stats.questionsCount}
							</p>
						</m.button>

						<m.button
							whileHover={{ y: -4 }}
							whileTap={{ scale: 0.98 }}
							className='p-6 rounded-2xl text-left transition-all bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/5'
						>
							<div className='flex items-center gap-3 mb-3'>
								<div className='p-2 rounded-xl bg-purple-500/10'>
									<Target className='w-5 h-5 text-purple-400' />
								</div>
								<span className='text-xs text-gray-500 uppercase font-semibold'>
									{c.stats.passingScore}
								</span>
							</div>
							<p className='text-3xl font-bold text-white'>
								{test.passingScore || 80}%
							</p>
						</m.button>
					</m.div>

					{/* Warning */}
					{stats.questionsCount < TEST_CONSTANTS.MIN_QUESTIONS_RECOMMENDED && (
						<m.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.3 }}
							className='p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4'
						>
							<div className='p-2 rounded-lg bg-amber-500/10 flex-shrink-0'>
								<AlertCircle className='w-5 h-5 text-amber-400' />
							</div>
							<div className='flex-1'>
								<h3 className='font-semibold text-amber-400 mb-1.5'>
									{c.warning.heading}
								</h3>
								<p className='text-sm text-amber-200/70 leading-relaxed'>
									{c.warning.bodyTemplate
										.replace('{min}', String(TEST_CONSTANTS.MIN_QUESTIONS_RECOMMENDED))
										.replace('{questionsLabel}', getQuestionsLabel(stats.questionsCount))}
								</p>
							</div>
						</m.div>
					)}

					{/* Test Editor */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.35 }}
						className='rounded-2xl bg-white/5 border border-white/10 p-6'
					>
						<TestEditor test={test} onUpdate={refetch} />
					</m.div>

					{/* Questions Section */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.4 }}
						className='rounded-2xl overflow-hidden bg-white/5 border border-white/10'
					>
						{/* Header */}
						<div className='p-6 bg-gradient-to-br from-white/5 to-white/[0.02] border-b border-white/10'>
							<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
								<div>
									<h2 className='text-2xl font-bold text-white mb-1'>
										{c.questions.heading}
									</h2>
									<p className='text-sm text-gray-400'>
										{stats.questionsCount === 0
											? c.questions.activatePrompt
											: c.questions.totalTemplate.replace(
													'{questionsLabel}',
													getQuestionsLabel(stats.questionsCount)
												)}
									</p>
								</div>

								<m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Button
										onClick={() => setShowCreateQuestion(true)}
										className='gap-2 bg-white text-black hover:bg-white/80 font-semibold'
									>
										<Plus className='w-5 h-5' />
										{c.questions.addQuestion}
									</Button>
								</m.div>
							</div>
						</div>

						{/* Content */}
						<div className='p-6'>
							<AnimatePresence mode='wait'>
								{stats.questionsCount > 0 ? (
									<m.div
										key='questions-list'
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{ duration: 0.3 }}
									>
										<QuestionsList
											questions={test.questions ?? []}
											testId={test.id}
											onUpdate={refetch}
										/>
									</m.div>
								) : (
									<m.div
										key='empty-state'
										initial={{ opacity: 0, scale: 0.95 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.95 }}
										transition={{ duration: 0.3 }}
										className='text-center py-16'
									>
										<div className='w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6'>
											<FileQuestion className='w-10 h-10 text-gray-600' />
										</div>
										<h3 className='text-xl font-semibold text-white mb-2'>
											{c.questions.empty}
										</h3>
										<p className='text-gray-400 max-w-md mx-auto mb-8 leading-relaxed'>
											{c.questions.emptySubtitle}
										</p>
										<m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
											<Button
												onClick={() => setShowCreateQuestion(true)}
												className='gap-2 bg-white text-black hover:bg-white/80 font-semibold'
											>
												<Plus className='w-5 h-5' />
												{c.questions.createFirst}
											</Button>
										</m.div>
									</m.div>
								)}
							</AnimatePresence>
						</div>
					</m.div>
				</div>
			</div>

			{/* Dialogs */}
			<CreateQuestionDialog
				open={showCreateQuestion}
				onOpenChange={setShowCreateQuestion}
				testId={test.id}
				onSuccess={refetch}
				nextOrder={stats.questionsCount + 1}
			/>

			<DeleteTestDialog
				open={showDeleteDialog}
				onOpenChange={setShowDeleteDialog}
				testTitle={test.title}
				questionsCount={stats.questionsCount}
				onConfirm={handleDeleteTest}
			/>
		</>
	)
}
