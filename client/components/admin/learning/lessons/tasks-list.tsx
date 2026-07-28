'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/i18n/LocaleProvider'
import { adminService } from '@/services/admin/admin.service'
import {
	CreateTaskDto,
	ILesson,
	ITask,
	TaskType,
} from '@/services/admin/admin.types'
import { m } from 'framer-motion'
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    Edit2,
    FileQuestion,
    ListChecks,
    Loader2,
    Plus,
    Sparkles,
    Target,
    Trash2,
    X,
	type AppIcon,
} from '@/components/ui/icons'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

interface TasksListProps {
	lesson: ILesson
	onRefetch: () => void
}

type EditTaskFormData = Omit<CreateTaskDto, 'lessonId'>

const TaskTypeIcons: Record<TaskType, AppIcon> = {
	[TaskType.SINGLE_CHOICE]: CheckCircle2,
	[TaskType.MULTI_CHOICE]: ListChecks,
	[TaskType.SHORT_ANSWER]: FileQuestion,
	[TaskType.PHISHING_EMAIL]: FileQuestion,
	[TaskType.PHISHING_SITE]: FileQuestion,
	[TaskType.TEXT_INPUT]: FileQuestion,
}

export default function TasksList({ lesson, onRefetch }: TasksListProps) {
	const { t } = useI18n()
	const c = t.adminLessonComponents.tasksList

	const TaskTypeLabels: Record<TaskType, string> = {
		[TaskType.SINGLE_CHOICE]: c.taskTypeLabels.singleChoice,
		[TaskType.MULTI_CHOICE]: c.taskTypeLabels.multiChoice,
		[TaskType.SHORT_ANSWER]: c.taskTypeLabels.shortAnswer,
		[TaskType.PHISHING_EMAIL]: c.taskTypeLabels.phishingEmail,
		[TaskType.PHISHING_SITE]: c.taskTypeLabels.phishingSite,
		[TaskType.TEXT_INPUT]: c.taskTypeLabels.textInput,
	}

	const DifficultyLabels: Record<string, string> = {
		EASY: c.difficultyLabels.easy,
		MEDIUM: c.difficultyLabels.medium,
		HARD: c.difficultyLabels.hard,
	}

	const [deleteDialog, setDeleteDialog] = useState<{
		open: boolean
		task: ITask | null
	}>({ open: false, task: null })
	const [editDialog, setEditDialog] = useState<{
		open: boolean
		task: ITask | null
	}>({ open: false, task: null })
	const [isDeleting, setIsDeleting] = useState(false)

	const tasks = lesson.tasks || []

	const handleDelete = async () => {
		if (!deleteDialog.task) return

		setIsDeleting(true)
		try {
			await adminService.deleteTask(deleteDialog.task.id)
			toast.success(c.toasts.taskDeleted)
			setDeleteDialog({ open: false, task: null })
			onRefetch()
		} catch {
			toast.error(c.toasts.taskDeleteError)
		} finally {
			setIsDeleting(false)
		}
	}

	const handleUpdate = async (data: EditTaskFormData) => {
		if (!editDialog.task) return

		try {
			await adminService.updateTask(editDialog.task.id, data)
			toast.success(c.toasts.taskUpdated)
			setEditDialog({ open: false, task: null })
			onRefetch()
		} catch {
			toast.error(c.toasts.taskUpdateError)
		}
	}

	if (tasks.length === 0) {
		return (
			<div className='p-8 text-center'>
				<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-500/10'>
					<FileQuestion className='h-8 w-8 text-gray-500' />
				</div>
				<p className='text-sm text-gray-500'>
					{c.emptyTitle}
				</p>
			</div>
		)
	}

	return (
		<>
			<div className='p-6'>
				<div className='space-y-3'>
					{tasks.map(task => {
						const Icon = TaskTypeIcons[task.type] || FileQuestion
						return (
							<div
								key={task.id}
								className='group rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20 hover:bg-white/10'
							>
								<div className='flex items-start justify-between gap-4'>
									<div className='flex flex-1 items-start gap-3'>
										<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/10'>
											<Icon className='h-5 w-5 text-green-400' />
										</div>
										<div className='flex-1 min-w-0'>
											<div className='mb-1 flex items-center gap-2'>
												<span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-green-500/20 text-xs font-bold text-green-400'>
													{task.order}
												</span>
												<h5 className='font-semibold text-white truncate'>
													{task.title}
												</h5>
											</div>
											{task.question && (
												<p className='text-sm text-gray-400 line-clamp-2 mb-2'>
													{task.question}
												</p>
											)}
											<div className='flex flex-wrap items-center gap-2 text-xs'>
												<span className='rounded-full bg-purple-500/10 px-2 py-1 text-purple-400'>
													{TaskTypeLabels[task.type]}
												</span>
												{task.points && (
													<span className='rounded-full bg-yellow-500/10 px-2 py-1 text-yellow-400'>
														{task.points} {c.xpUnit}
													</span>
												)}
												{task.difficulty && (
													<span className='rounded-full bg-blue-500/10 px-2 py-1 text-blue-400'>
														{DifficultyLabels[task.difficulty]}
													</span>
												)}
											</div>
										</div>
									</div>
									<div className='flex gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
										<button
											onClick={() => setEditDialog({ open: true, task })}
											className='rounded-lg bg-blue-500/10 p-2 text-blue-400 transition-colors hover:bg-blue-500/20'
											title={c.editTooltip}
										>
											<Edit2 className='h-4 w-4' />
										</button>
										<button
											onClick={() => setDeleteDialog({ open: true, task })}
											className='rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20'
											title={c.deleteTooltip}
										>
											<Trash2 className='h-4 w-4' />
										</button>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</div>

			{/* Delete Dialog - Portal */}
			{deleteDialog.open &&
				deleteDialog.task &&
				createPortal(
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
						onClick={() => setDeleteDialog({ open: false, task: null })}
					>
						<m.div
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.98 }}
							onClick={(e) => e.stopPropagation()}
							className='relative w-full max-w-md rounded-2xl border border-red-500/20 bg-overlay p-6 shadow-2xl'
						>
							<div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10'>
								<AlertTriangle className='h-8 w-8 text-red-400' />
							</div>

							<div className='text-center'>
								<h3 className='mb-2 text-2xl font-bold text-white'>
									{c.deleteDialog.title}
								</h3>
								<p className='mb-2 text-gray-400'>
									{c.deleteDialog.descriptionPrefix}{' '}
									<span className='font-semibold text-white'>
										&ldquo;{deleteDialog.task.title}&rdquo;
									</span>
									?
								</p>
								<p className='text-sm text-red-400'>
									{c.deleteDialog.cannotUndo}
								</p>
							</div>

							<div className='mt-6 flex gap-3'>
								<button
									onClick={() => setDeleteDialog({ open: false, task: null })}
									disabled={isDeleting}
									className='flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50'
								>
									{c.deleteDialog.cancel}
								</button>
								<button
									onClick={handleDelete}
									disabled={isDeleting}
									className='flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50'
								>
									{isDeleting ? (
										<>
											<Loader2 className='mr-2 inline h-4 w-4 animate-spin' />
											{c.deleteDialog.deleting}
										</>
									) : (
										c.deleteDialog.confirm
									)}
								</button>
							</div>
						</m.div>
					</m.div>,
					document.body
				)}

			{/* Edit Dialog - Portal */}
			{editDialog.open &&
				editDialog.task &&
				createPortal(
					<EditTaskModal
						task={editDialog.task}
						onClose={() => setEditDialog({ open: false, task: null })}
						onSubmit={handleUpdate}
					/>,
					document.body
				)}
		</>
	)
}

interface EditTaskModalProps {
	task: ITask
	onClose: () => void
	onSubmit: (data: EditTaskFormData) => Promise<void>
}

function EditTaskModal({ task, onClose, onSubmit }: EditTaskModalProps) {
	const { t } = useI18n()
	const c = t.adminLessonComponents.tasksList
	const em = c.editModal

	const TaskTypeLabels: Record<TaskType, string> = {
		[TaskType.SINGLE_CHOICE]: c.taskTypeLabels.singleChoice,
		[TaskType.MULTI_CHOICE]: c.taskTypeLabels.multiChoice,
		[TaskType.SHORT_ANSWER]: c.taskTypeLabels.shortAnswer,
		[TaskType.PHISHING_EMAIL]: c.taskTypeLabels.phishingEmail,
		[TaskType.PHISHING_SITE]: c.taskTypeLabels.phishingSite,
		[TaskType.TEXT_INPUT]: c.taskTypeLabels.textInput,
	}

	const DifficultyLabels: Record<string, string> = {
		EASY: c.difficultyLabels.easy,
		MEDIUM: c.difficultyLabels.medium,
		HARD: c.difficultyLabels.hard,
	}

	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
			control,
		formState: { errors },
		} = useForm<EditTaskFormData>({
		defaultValues: {
			order: task.order,
			title: task.title,
			question: task.question || '',
			explanation: task.explanation || '',
			points: task.points || 10,
			difficulty: task.difficulty || 'MEDIUM',
			type: task.type,
			options: task.options || [],
		},
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'options',
	})

		const taskType = useWatch({ control, name: 'type' })
	const hasOptions =
		taskType === TaskType.SINGLE_CHOICE || taskType === TaskType.MULTI_CHOICE

		const onSubmitForm = async (data: EditTaskFormData) => {
		setIsSubmitting(true)
		try {
			await onSubmit(data)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className='fixed inset-0 z-[9999] bg-overlay overflow-y-auto'
		>
			{/* Header */}
			<div className='sticky top-0 border-b border-white/10 bg-overlay/95 backdrop-blur-xl z-10'>
				<div className='mx-auto flex max-w-5xl items-center justify-between px-6 py-4'>
					<div>
						<h3 className='text-2xl font-bold text-white'>
							{em.title}
						</h3>
						<p className='mt-1 text-sm text-gray-500'>
							{em.subtitle}
						</p>
					</div>
					<button
						onClick={onClose}
						className='rounded-xl bg-white/5 p-3 text-gray-400 transition-colors hover:bg-white/10 hover:text-white'
					>
						<X className='h-5 w-5' />
					</button>
				</div>
			</div>

			{/* Content */}
			<div className='mx-auto max-w-5xl px-6 py-8'>
				<form onSubmit={handleSubmit(onSubmitForm)} className='space-y-8'>
					{/* Basic Info */}
					<div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
						<h4 className='mb-4 flex items-center gap-2 text-lg font-semibold text-white'>
							<Sparkles className='h-5 w-5 text-blue-400' />
							{em.basicInfoHeading}
						</h4>

						<div className='space-y-6'>
							<div className='grid gap-6 md:grid-cols-2'>
								<div>
									<label className='mb-2 block text-sm font-semibold text-white'>
										{em.orderLabel}
									</label>
									<input
										{...register('order', { valueAsNumber: true })}
										type='number'
										className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500/50 focus:bg-white/10'
									/>
								</div>

								<div>
									<label className='mb-2 block text-sm font-semibold text-white'>
										{em.taskTypeLabel}
									</label>
									<Controller
										name='type'
										control={control}
										render={({ field }) => (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<button
														type='button'
														className='flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10'
													>
														<span>{TaskTypeLabels[field.value]}</span>
														<ChevronDown className='h-4 w-4 text-gray-400' />
													</button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align='start'
													className='z-[10000] w-[var(--radix-dropdown-menu-trigger-width)] bg-overlay border-white/10'
												>
													{Object.entries(TaskTypeLabels).map(([key, label]) => (
														<DropdownMenuItem
															key={key}
															onClick={() => field.onChange(key)}
															className='text-white hover:bg-white/10 cursor-pointer'
														>
															{label}
														</DropdownMenuItem>
													))}
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									/>
								</div>
							</div>

							<div>
								<label className='mb-2 block text-sm font-semibold text-white'>
									{em.titleLabel}
								</label>
								<input
									{...register('title', { required: em.titleRequired })}
									className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500/50 focus:bg-white/10'
									placeholder={em.titlePlaceholder}
								/>
								{errors.title && (
									<p className='mt-2 text-sm text-red-400'>
										{errors.title.message}
									</p>
								)}
							</div>

							<div>
								<label className='mb-2 block text-sm font-semibold text-white'>
									{em.questionLabel}
								</label>
								<textarea
									{...register('question')}
									rows={3}
									className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500/50 focus:bg-white/10 resize-none'
									placeholder={em.questionPlaceholder}
								/>
							</div>

							<div>
								<label className='mb-2 block text-sm font-semibold text-white'>
									{em.explanationLabel}
								</label>
								<textarea
									{...register('explanation')}
									rows={3}
									className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500/50 focus:bg-white/10 resize-none'
									placeholder={em.explanationPlaceholder}
								/>
							</div>
						</div>
					</div>

					{/* Settings */}
					<div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
						<h4 className='mb-4 flex items-center gap-2 text-lg font-semibold text-white'>
							<Target className='h-5 w-5 text-purple-400' />
							{em.settingsHeading}
						</h4>

						<div className='grid gap-6 md:grid-cols-2'>
							<div>
								<label className='mb-2 block text-sm font-semibold text-white'>
									{em.pointsLabel}
								</label>
								<input
									{...register('points', { valueAsNumber: true })}
									type='number'
									min='1'
									max='100'
									className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500/50 focus:bg-white/10'
								/>
							</div>

							<div>
								<label className='mb-2 block text-sm font-semibold text-white'>
									{em.difficultyLabel}
								</label>
								<Controller
									name='difficulty'
									control={control}
									render={({ field }) => (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button
													type='button'
													className='flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10'
												>
														<span>
															{DifficultyLabels[field.value ?? 'MEDIUM']}
														</span>
													<ChevronDown className='h-4 w-4 text-gray-400' />
												</button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align='start'
												className='z-[10000] w-[var(--radix-dropdown-menu-trigger-width)] bg-overlay border-white/10'
											>
												{Object.entries(DifficultyLabels).map(([key, label]) => (
													<DropdownMenuItem
														key={key}
														onClick={() => field.onChange(key)}
														className='text-white hover:bg-white/10 cursor-pointer'
													>
														{label}
													</DropdownMenuItem>
												))}
											</DropdownMenuContent>
										</DropdownMenu>
									)}
								/>
							</div>
						</div>
					</div>

					{/* Options */}
					{hasOptions && (
											<div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
												<div className='mb-4 flex items-center justify-between'>
													<h4 className='flex items-center gap-2 text-lg font-semibold text-white'>
														<CheckCircle2 className='h-5 w-5 text-green-400' />
														{em.optionsHeading}
													</h4>
													<button
														type='button'
														onClick={() => append({ text: '', isCorrect: false })}
														className='flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90'
													>
														<Plus className='h-4 w-4' />
														{em.addOption}
													</button>
												</div>

												<div className='space-y-3'>
													{fields.map((field, index) => (
														<div key={field.id} className='flex items-center gap-3'>
															<Controller
																name={`options.${index}.isCorrect`}
																control={control}
																render={({ field: checkField }) => (
																	<input
																		type={taskType === TaskType.SINGLE_CHOICE ? 'radio' : 'checkbox'}
																		name={taskType === TaskType.SINGLE_CHOICE ? 'correctAnswer' : undefined}
																		checked={checkField.value}
																		onChange={(e) => {
																			if (taskType === TaskType.SINGLE_CHOICE) {
																				// For radio buttons - uncheck all other options
																				fields.forEach((_, i) => {
																					if (i === index) {
																						checkField.onChange(true)
																					} else {
																						control._formValues.options[i].isCorrect = false
																					}
																				})
																			} else {
																				// For checkboxes - just toggle
																				checkField.onChange(e.target.checked)
																			}
																		}}
																		className='h-5 w-5 shrink-0 cursor-pointer accent-green-500'
																	/>
																)}
															/>
															<input
																{...register(`options.${index}.text`)}
																className='flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-green-500/50 focus:bg-white/10'
																placeholder={em.optionPlaceholderTemplate.replace('{index}', String(index + 1))}
															/>
															{fields.length > 2 && (
																<button
																	type='button'
																	onClick={() => remove(index)}
																	className='rounded-lg bg-red-500/10 p-3 text-red-400 transition-colors hover:bg-red-500/20'
																>
																	<Trash2 className='h-4 w-4' />
																</button>
															)}
														</div>
													))}
												</div>
												<p className='mt-3 text-xs text-gray-500'>
													{taskType === TaskType.SINGLE_CHOICE
														? em.singleChoiceHint
														: em.multiChoiceHint}
												</p>
											</div>
					)}


					{/* Actions */}
					<div className='flex gap-4'>
						<button
							type='button'
							onClick={onClose}
							disabled={isSubmitting}
							className='flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50'
						>
							{em.cancel}
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='flex-1 rounded-xl bg-white px-6 py-4 font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-50'
						>
							{isSubmitting ? (
								<>
									<Loader2 className='mr-2 inline h-5 w-5 animate-spin' />
									{em.saving}
								</>
							) : (
								em.submit
							)}
						</button>
					</div>
				</form>
			</div>
		</m.div>
	)
}
