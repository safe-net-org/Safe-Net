'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminService } from '@/services/admin/admin.service'
import { Difficulty, TaskType } from '@/services/admin/admin.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { m } from 'framer-motion'
import {
    CheckCircle2,
    ChevronDown,
    Loader2,
    Plus,
    Sparkles,
    Target,
    Trash2,
    X,
} from 'lucide-react'
import { useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const taskSchema = z.object({
	lessonId: z.string(),
	order: z.number().int().positive(),
	type: z.nativeEnum(TaskType),
	title: z.string().min(3, 'Must be at least 3 characters'),
	question: z.string().optional(),
	explanation: z.string().optional(),
	points: z.number().int().min(1).max(100).optional(),
	difficulty: z.nativeEnum(Difficulty).optional(),
	options: z
		.array(
			z.object({
				text: z.string().min(1, 'Option cannot be empty'),
				isCorrect: z.boolean(),
			})
		)
		.optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

const TaskTypeLabels: Record<TaskType, string> = {
	[TaskType.SINGLE_CHOICE]: 'Single choice',
	[TaskType.MULTI_CHOICE]: 'Multiple choice',
	[TaskType.SHORT_ANSWER]: 'Short answer',
	[TaskType.PHISHING_EMAIL]: 'Phishing: Email',
	[TaskType.PHISHING_SITE]: 'Phishing: Website',
	[TaskType.TEXT_INPUT]: 'Text input',
}

const DifficultyLabels: Record<Difficulty, string> = {
	[Difficulty.EASY]: 'Easy',
	[Difficulty.MEDIUM]: 'Medium',
	[Difficulty.HARD]: 'Hard',
}

interface CreateTaskDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	lessonId: string
	onSuccess: () => void
}

export default function CreateTaskDialog({
	open,
	onOpenChange,
	lessonId,
	onSuccess,
}: CreateTaskDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		watch,
		control,
		formState: { errors },
		reset,
	} = useForm<TaskFormData>({
		resolver: zodResolver(taskSchema),
		defaultValues: {
			lessonId,
			order: 1,
			type: TaskType.SINGLE_CHOICE,
			title: '',
			question: '',
			explanation: '',
			points: 10,
			difficulty: Difficulty.MEDIUM,
			options: [
				{ text: '', isCorrect: false },
				{ text: '', isCorrect: false },
			],
		},
	})

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'options',
	})

	const taskType = watch('type')
	const hasOptions =
		taskType === TaskType.SINGLE_CHOICE || taskType === TaskType.MULTI_CHOICE

	const onSubmit = async (data: TaskFormData) => {
		setIsSubmitting(true)
		try {
			await adminService.createTask(data)
			toast.success('Task created')
			reset()
			onOpenChange(false)
			onSuccess()
		} catch (error) {
			toast.error('Error creating task')
		} finally {
			setIsSubmitting(false)
		}
	}

	if (!open) return null

	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className='fixed inset-0 z-[9999] bg-[#0A0F1D] overflow-y-auto'
		>
			{/* Header */}
			<div className='sticky top-0 border-b border-white/10 bg-[#0A0F1D]/95 backdrop-blur-xl z-10'>
				<div className='mx-auto flex max-w-5xl items-center justify-between px-6 py-4'>
					<div>
						<h3 className='text-2xl font-bold text-white'>Add task</h3>
						<p className='mt-1 text-sm text-gray-500'>
							Create a practical task for the lesson
						</p>
					</div>
					<button
						onClick={() => {
							onOpenChange(false)
							reset()
						}}
						className='rounded-xl bg-white/5 p-3 text-gray-400 transition-colors hover:bg-white/10 hover:text-white'
					>
						<X className='h-5 w-5' />
					</button>
				</div>
			</div>

			{/* Content */}
			<div className='mx-auto max-w-5xl px-6 py-8'>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
					{/* Basic Info */}
					<div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
						<h4 className='mb-4 flex items-center gap-2 text-lg font-semibold text-white'>
							<Sparkles className='h-5 w-5 text-blue-400' />
							Basic information
						</h4>

						<div className='space-y-6'>
							<div className='grid gap-6 md:grid-cols-2'>
								<div>
									<label className='mb-2 block text-sm font-semibold text-white'>
										Order number
									</label>
									<input
										{...register('order', { valueAsNumber: true })}
										type='number'
										className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500/50 focus:bg-white/10'
									/>
								</div>

								<div>
									<label className='mb-2 block text-sm font-semibold text-white'>
										Task type
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
													className='z-[10000] w-[var(--radix-dropdown-menu-trigger-width)] bg-[#0A0F1D] border-white/10'
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
									Task title
								</label>
								<input
									{...register('title')}
									className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500/50 focus:bg-white/10'
									placeholder='SQL Injection'
								/>
								{errors.title && (
									<p className='mt-2 text-sm text-red-400'>
										{errors.title.message}
									</p>
								)}
							</div>

							<div>
								<label className='mb-2 block text-sm font-semibold text-white'>
									Question
								</label>
								<textarea
									{...register('question')}
									rows={3}
									className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500/50 focus:bg-white/10 resize-none'
									placeholder='What method is used for SQL injection?'
								/>
							</div>

							<div>
								<label className='mb-2 block text-sm font-semibold text-white'>
									Explanation (optional)
								</label>
								<textarea
									{...register('explanation')}
									rows={3}
									className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500/50 focus:bg-white/10 resize-none'
									placeholder='SQL injection allows...'
								/>
							</div>
						</div>
					</div>

					{/* Settings */}
					<div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
						<h4 className='mb-4 flex items-center gap-2 text-lg font-semibold text-white'>
							<Target className='h-5 w-5 text-purple-400' />
							Settings
						</h4>

						<div className='grid gap-6 md:grid-cols-2'>
							<div>
								<label className='mb-2 block text-sm font-semibold text-white'>
									Points (XP)
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
									Difficulty
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
													{/* difficulty is optional in the schema, so field.value can be
											    undefined before the user picks one. */}
											<span>
												{DifficultyLabels[field.value ?? Difficulty.MEDIUM]}
											</span>
													<ChevronDown className='h-4 w-4 text-gray-400' />
												</button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align='start'
												className='z-[10000] w-[var(--radix-dropdown-menu-trigger-width)] bg-[#0A0F1D] border-white/10'
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
									Answer options
								</h4>
								<button
									type='button'
									onClick={() => append({ text: '', isCorrect: false })}
									className='flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90'
								>
									<Plus className='h-4 w-4' />
									Add option
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
											placeholder={`Option ${index + 1}`}
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
									? 'Select one correct answer (radio)'
									: 'Check all correct answers (checkbox)'}
							</p>
						</div>
)}


					{/* Actions */}
					<div className='flex gap-4'>
						<button
							type='button'
							onClick={() => {
								onOpenChange(false)
								reset()
							}}
							disabled={isSubmitting}
							className='flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={isSubmitting}
							className='flex-1 rounded-xl bg-white px-6 py-4 font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-50'
						>
							{isSubmitting ? (
								<>
									<Loader2 className='mr-2 inline h-5 w-5 animate-spin' />
									Creating...
								</>
							) : (
								<>
									<Plus className='mr-2 inline h-5 w-5' />
									Add task
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</m.div>
	)
}
