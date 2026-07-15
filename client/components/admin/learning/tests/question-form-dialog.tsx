'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminService } from '@/services/admin/admin.service'
import { ITestQuestion, TaskType } from '@/services/admin/admin.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, m } from 'framer-motion'
import {
    CheckCircle2,
    ChevronDown,
    Loader2,
    Plus,
    Sparkles,
    Trash2,
    X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const questionSchema = z.object({
	testId: z.string(),
	order: z.number().int().positive(),
	text: z.string().min(5, 'Minimum 5 characters'),
	type: z.nativeEnum(TaskType),
	options: z
		.array(
			z.object({
				text: z.string().min(1, 'Option cannot be empty'),
				isCorrect: z.boolean(),
			})
		)
		.optional(),
})

type QuestionFormData = z.infer<typeof questionSchema>

const TaskTypeLabels: Record<TaskType, string> = {
	[TaskType.SINGLE_CHOICE]: 'Single Choice',
	[TaskType.MULTI_CHOICE]: 'Multiple Choice',
	[TaskType.SHORT_ANSWER]: 'Short Answer',
	[TaskType.PHISHING_EMAIL]: 'Phishing: Email',
	[TaskType.PHISHING_SITE]: 'Phishing: Website',
	[TaskType.TEXT_INPUT]: 'Text Input',
}

interface CreateQuestionDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	testId: string
	nextOrder: number
	onSuccess: () => void
	/**
	 * When set, the dialog edits this question instead of creating one.
	 * questions-list already passed this prop, but it did not exist here — so
	 * "edit question" silently created a duplicate instead.
	 */
	editQuestion?: ITestQuestion
}

export default function CreateQuestionDialog({
	open,
	onOpenChange,
	testId,
	nextOrder,
	onSuccess,
	editQuestion,
}: CreateQuestionDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const isEditing = Boolean(editQuestion)

	const {
		register,
		handleSubmit,
		watch,
		control,
		formState: { errors },
		reset,
	} = useForm<QuestionFormData>({
		resolver: zodResolver(questionSchema),
		defaultValues: {
			testId,
			order: nextOrder,
			text: '',
			type: TaskType.SINGLE_CHOICE,
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

	// Repopulate whenever a different question is opened for editing; without
	// this the form keeps whatever the previous open left behind.
	useEffect(() => {
		if (!open) return

		reset(
			editQuestion
				? {
						testId,
						order: editQuestion.order,
						text: editQuestion.text,
						type: editQuestion.type,
						options: editQuestion.options?.map(option => ({
							text: option.text,
							isCorrect: option.isCorrect ?? false,
						})) ?? [
							{ text: '', isCorrect: false },
							{ text: '', isCorrect: false },
						],
					}
				: {
						testId,
						order: nextOrder,
						text: '',
						type: TaskType.SINGLE_CHOICE,
						options: [
							{ text: '', isCorrect: false },
							{ text: '', isCorrect: false },
						],
					}
		)
	}, [open, editQuestion, testId, nextOrder, reset])

	const onSubmit = async (data: QuestionFormData) => {
		setIsSubmitting(true)
		try {
			if (editQuestion) {
				await adminService.updateTestQuestion(editQuestion.id, data)
				toast.success('Question updated')
			} else {
				await adminService.createTestQuestion(data)
				toast.success('Question added')
			}
			reset()
			onOpenChange(false)
			onSuccess()
		} catch (error) {
			toast.error(
				isEditing ? 'Error updating question' : 'Error creating question'
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<AnimatePresence>
			{open && (
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 z-[100] bg-[#0A0F1D] overflow-y-scroll'
				>
					{/* Header */}
					<div className='border-b border-white/10 bg-[#0A0F1D]/80 backdrop-blur-xl'>
						<div className='mx-auto flex max-w-4xl items-center justify-between px-6 py-4'>
							<div>
								<h3 className='text-2xl font-bold text-white'>
									{isEditing ? 'Edit Question' : 'Add Question'}
								</h3>
								<p className='mt-1 text-sm text-gray-500'>
									{isEditing
										? 'Update this question'
										: 'Create a question to test knowledge'}
								</p>
							</div>
							<m.button
								whileHover={{ scale: 1.1, rotate: 90 }}
								whileTap={{ scale: 0.9 }}
								onClick={() => {
									onOpenChange(false)
									reset()
								}}
								className='rounded-xl bg-white/5 p-3 text-gray-400 transition-colors hover:bg-white/10 hover:text-white'
							>
								<X className='h-5 w-5' />
							</m.button>
						</div>
					</div>

					{/* Content */}
					<div className='mx-auto max-w-4xl px-6 py-8'>
						<m.form
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							onSubmit={handleSubmit(onSubmit)}
							className='space-y-8'
						>
							{/* Question Info */}
							<div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
								<h4 className='mb-4 flex items-center gap-2 text-lg font-semibold text-white'>
									<Sparkles className='h-5 w-5 text-blue-400' />
									Question Information
								</h4>

								<div className='space-y-6'>
									<div>
										<label className='mb-2 block text-sm font-semibold text-white'>
											Question Type
										</label>
										<Controller
											name='type'
											control={control}
											render={({ field }) => (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<button
															type='button'
															className='flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all hover:bg-white/10'
														>
															<span>{TaskTypeLabels[field.value]}</span>
															<ChevronDown className='ml-2 h-4 w-4 flex-shrink-0 text-gray-400' />
														</button>
													</DropdownMenuTrigger>
													<DropdownMenuContent className='w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto border-white/10 bg-[#0A0F1D] z-[9999]'>
														{Object.entries(TaskTypeLabels).map(([key, label]) => (
															<DropdownMenuItem
																key={key}
																onClick={() => field.onChange(key)}
																className='cursor-pointer text-white hover:bg-white/10'
															>
																{label}
															</DropdownMenuItem>
														))}
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										/>
									</div>

									<div>
										<label className='mb-2 block text-sm font-semibold text-white'>
											Order Number
										</label>
										<input
											{...register('order', { valueAsNumber: true })}
											type='number'
											min='1'
											className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
										/>
									</div>

									<div>
										<label className='mb-2 block text-sm font-semibold text-white'>
											Question Text
										</label>
										<textarea
											{...register('text')}
											rows={3}
											className='w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
											placeholder='Enter question...'
										/>
										{errors.text && (
											<p className='mt-2 text-sm text-red-400'>
												{errors.text.message}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Options */}
							{hasOptions && (
								<div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
									<div className='mb-4 flex items-center justify-between'>
										<h4 className='flex items-center gap-2 text-lg font-semibold text-white'>
											<CheckCircle2 className='h-5 w-5 text-green-400' />
											Answer Options
										</h4>
										<m.button
											type='button'
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											onClick={() => append({ text: '', isCorrect: false })}
											className='flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-white/90'
										>
											<Plus className='h-4 w-4' />
											Add Option
										</m.button>
									</div>

									<div className='space-y-3'>
										{fields.map((field, index) => (
											<div
												key={field.id}
												className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3'
											>
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
																	// For radio - uncheck all other options
																	fields.forEach((_, i) => {
																		if (i === index) {
																			checkField.onChange(true)
																		} else {
																			// Use setValue for the rest
																			const otherField = `options.${i}.isCorrect` as const
																			control._formValues.options[i].isCorrect = false
																		}
																	})
																} else {
																	// For checkbox - just toggle
																	checkField.onChange(e.target.checked)
																}
															}}
															className='h-5 w-5 shrink-0 cursor-pointer accent-green-500'
														/>
													)}
												/>

												<input
													{...register(`options.${index}.text`)}
													className='flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
													placeholder={`Option ${index + 1}`}
												/>

												{fields.length > 2 && (
													<m.button
														type='button'
														whileHover={{ scale: 1.1 }}
														whileTap={{ scale: 0.9 }}
														onClick={() => remove(index)}
														className='rounded-lg bg-red-500/10 p-3 text-red-400 transition-colors hover:bg-red-500/20'
													>
														<Trash2 className='h-4 w-4' />
													</m.button>
												)}
											</div>
										))}
									</div>

									<p className='mt-4 text-sm text-gray-400'>
										{taskType === TaskType.SINGLE_CHOICE
											? 'Select one correct answer (radio)'
											: 'Check all correct answers (checkbox)'}
									</p>
								</div>
							)}

							{/* Actions */}
							<div className='flex gap-4'>
								<m.button
									type='button'
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									onClick={() => {
										onOpenChange(false)
										reset()
									}}
									className='flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-gray-300 transition-all hover:bg-white/10'
								>
									Cancel
								</m.button>
								<m.button
									type='submit'
									disabled={isSubmitting}
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
									className='flex-1 rounded-xl bg-white px-6 py-4 font-semibold text-black transition-all hover:bg-white/90 disabled:opacity-50'
								>
									{isSubmitting ? (
										<>
											<Loader2 className='mr-2 inline h-5 w-5 animate-spin' />
											Adding...
										</>
									) : (
										<>
											<Plus className='mr-2 inline h-5 w-5' />
											Add Question
										</>
									)}
								</m.button>
							</div>
						</m.form>
					</div>
				</m.div>
			)}
		</AnimatePresence>
	)
}
