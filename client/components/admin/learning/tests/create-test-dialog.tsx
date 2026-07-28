'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useI18n } from '@/i18n/LocaleProvider'
import { adminService } from '@/services/admin/admin.service'
import { ICourse } from '@/services/admin/admin.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, m } from 'framer-motion'
import {
    AlertCircle,
    ChevronDown,
    FileQuestion,
    Loader2,
    Plus,
    Sparkles,
    X,
} from '@/components/ui/icons'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface TestFormData {
	title: string
	description?: string
	courseId?: string
	passingScore?: number
}

interface CreateTestDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	courses: ICourse[]
	onSuccess: () => void
}

export default function CreateTestDialog({
	open,
	onOpenChange,
	courses,
	onSuccess,
}: CreateTestDialogProps) {
	const { t } = useI18n()
	const c = t.adminTestComponents.createTestDialog
	const [isSubmitting, setIsSubmitting] = useState(false)

	const testSchema = useMemo(
		() =>
			z.object({
				title: z.string().min(3, c.validation.titleMin).max(255),
				description: z.string().min(10, c.validation.descriptionMin).optional(),
				courseId: z.string().optional(),
				passingScore: z.number().min(0).max(100).optional(),
			}),
		[c]
	)

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		reset,
	} = useForm<TestFormData>({
		resolver: zodResolver(testSchema),
		defaultValues: {
			title: '',
			description: '',
			courseId: '',
			passingScore: 80,
		},
	})

	const onSubmit = async (data: TestFormData) => {
		setIsSubmitting(true)
		try {
			await adminService.createTest(data)
			toast.success(c.toasts.created)
			reset()
			onOpenChange(false)
			onSuccess()
		} catch (error) {
			console.error('Create test error:', error)
			toast.error(c.toasts.createError)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<AnimatePresence>
			{open && (
				<m.div
					data-admin-form
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 z-[100] bg-overlay overflow-y-scroll'
				>
					{/* Header */}
					<div className='border-b border-white/10 bg-overlay/80 backdrop-blur-xl'>
						<div className='mx-auto flex max-w-4xl items-center justify-between px-6 py-4'>
							<div>
								<h3 className='text-2xl font-bold text-white'>{c.header.title}</h3>
								<p className='mt-1 text-sm text-gray-500'>
									{c.header.subtitle}
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
							{/* Basic Info */}
							<div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
								<h4 className='mb-4 flex items-center gap-2 text-lg font-semibold text-white'>
									<Sparkles className='h-5 w-5 text-blue-400' />
									{c.basicInfo.heading}
								</h4>

								<div className='space-y-6'>
									<div>
										<label className='mb-2 block text-sm font-semibold text-white'>
											{c.basicInfo.titleLabel}
										</label>
										<input
											{...register('title')}
											className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
											placeholder={c.basicInfo.titlePlaceholder}
										/>
										{errors.title && (
											<p className='mt-2 text-sm text-red-400'>
												{errors.title.message}
											</p>
										)}
									</div>

									<div>
										<label className='mb-2 block text-sm font-semibold text-white'>
											{c.basicInfo.descriptionLabel}
										</label>
										<textarea
											{...register('description')}
											rows={4}
											className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 resize-none'
											placeholder={c.basicInfo.descriptionPlaceholder}
										/>
										{errors.description && (
											<p className='mt-2 text-sm text-red-400'>
												{errors.description.message}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Settings */}
							<div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
								<h4 className='mb-4 flex items-center gap-2 text-lg font-semibold text-white'>
									<FileQuestion className='h-5 w-5 text-purple-400' />
									{c.settings.heading}
								</h4>

								<div className='grid gap-6 md:grid-cols-2'>
									<div>
										<label className='mb-2 block text-sm font-semibold text-white'>
											{c.settings.courseLabel}
										</label>
										<Controller
											name='courseId'
											control={control}
											render={({ field }) => (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<button
															type='button'
															className='flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all hover:bg-white/10'
														>
															<span className='truncate'>
																{field.value
																	? courses.find((course) => course.id === field.value)
																			?.title || c.settings.selectCourse
																	: c.settings.noCourse}
															</span>
															<ChevronDown className='h-4 w-4 text-gray-400 flex-shrink-0 ml-2' />
														</button>
													</DropdownMenuTrigger>
													<DropdownMenuContent className='w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto bg-overlay border-white/10 z-[9999]'>
														<DropdownMenuItem
															onClick={() => field.onChange('')}
															className='text-white hover:bg-white/10 cursor-pointer'
														>
															{c.settings.noCourse}
														</DropdownMenuItem>
														{courses.map((course) => (
															<DropdownMenuItem
																key={course.id}
																onClick={() => field.onChange(course.id)}
																className='text-white hover:bg-white/10 cursor-pointer'
															>
																{course.title}
															</DropdownMenuItem>
														))}
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										/>
									</div>

									<div>
										<label className='mb-2 block text-sm font-semibold text-white'>
											{c.settings.passingScoreLabel}
										</label>
										<input
											{...register('passingScore', { valueAsNumber: true })}
											type='number'
											min='0'
											max='100'
											className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
											placeholder={c.settings.passingScorePlaceholder}
										/>
									</div>
								</div>
							</div>

							{/* Info Block */}
							<div className='rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6'>
								<div className='flex items-start gap-3'>
									<div className='rounded-lg bg-blue-500/10 p-2'>
										<AlertCircle className='h-5 w-5 text-blue-400' />
									</div>
									<div>
										<h5 className='font-semibold text-white'>
											{c.infoBlock.heading}
										</h5>
										<p className='mt-1 text-sm text-gray-400'>
											{c.infoBlock.body}
										</p>
									</div>
								</div>
							</div>

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
									{c.buttons.cancel}
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
											{c.buttons.creating}
										</>
									) : (
										<>
											<Plus className='mr-2 inline h-5 w-5' />
											{c.buttons.create}
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
