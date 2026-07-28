'use client'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminService } from '@/services/admin/admin.service'
import { IStageWithCourses } from '@/services/admin/admin.types'
import { getDifficultyLabel } from '@/services/learning/learning.types'
import { useI18n } from '@/i18n/LocaleProvider'
import { translateStageTitle } from '@/i18n/content-translations'
import { generateSlug } from '@/utils/transliterate'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, m } from 'framer-motion'
import {
    AlertCircle,
    ChevronDown,
    Loader2,
    Plus,
    Sparkles,
    Target,
    X,
} from '@/components/ui/icons'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface CourseFormData {
	stageId: string
	slug: string
	title: string
	description: string
	difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

interface CreateCourseDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	stages: IStageWithCourses[]
	onSuccess: () => void
}

export default function CreateCourseDialog({
	open,
	onOpenChange,
	stages,
	onSuccess,
}: CreateCourseDialogProps) {
	const { locale, t } = useI18n()
	const c = t.adminCourseComponents.createCourseDialog
	const [isSubmitting, setIsSubmitting] = useState(false)

	const courseSchema = useMemo(
		() =>
			z.object({
				stageId: z.string().min(1, c.validation.stageRequired),
				slug: z
					.string()
					.min(1, c.validation.slugRequired)
					.regex(/^[a-z0-9-]+$/, c.validation.slugPattern),
				title: z.string().min(3, c.validation.titleMin).max(255),
				description: z.string().min(10, c.validation.descriptionMin),
				difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'] as const),
			}),
		[c]
	)

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
		reset,
		setValue,
	} = useForm<CourseFormData>({
		resolver: zodResolver(courseSchema),
		defaultValues: {
			difficulty: 'MEDIUM',
			title: '',
			slug: '',
			description: '',
			stageId: '',
		},
	})

	const title = useWatch({ control, name: 'title' })

	useEffect(() => {
		if (title) {
			const slug = generateSlug(title)
			setValue('slug', slug, { shouldValidate: true })
		}
	}, [title, setValue])

	const onSubmit = async (data: CourseFormData) => {
		setIsSubmitting(true)
		try {
			await adminService.createCourse(data)
			toast.success(c.toast.created)
			reset()
			onOpenChange(false)
			onSuccess()
		} catch (error) {
			console.error('Create course error:', error)
			toast.error(c.toast.error)
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
								<h3 className='text-2xl font-bold text-white'>
									{c.header.title}
								</h3>
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
										<label className='mb-2 flex items-center gap-2 text-sm font-semibold text-white'>
											{c.basicInfo.slugLabel}
											<span className='text-xs font-normal text-gray-500'>
												{c.basicInfo.slugHint}
											</span>
										</label>
										<input
											{...register('slug')}
											className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
											placeholder={c.basicInfo.slugPlaceholder}
										/>
										{errors.slug && (
											<p className='mt-2 text-sm text-red-400'>
												{errors.slug.message}
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
											className='w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
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
									<Target className='h-5 w-5 text-green-400' />
									{c.settings.heading}
								</h4>

								<div className='space-y-6'>
									<div>
										<label className='mb-2 block text-sm font-semibold text-white'>
											{c.settings.stageLabel}
										</label>
										<Controller
											name='stageId'
											control={control}
											render={({ field }) => (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<button
															type='button'
															className='flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all hover:bg-white/10'
														>
															<span>
																{field.value
																	? translateStageTitle(
																			locale,
																			stages.find(s => s.id === field.value)?.title || ''
																		) ||
																	  c.settings.stagePlaceholder
																	: c.settings.stagePlaceholder}
															</span>
															<ChevronDown className='ml-2 h-4 w-4 flex-shrink-0 text-gray-400' />
														</button>
													</DropdownMenuTrigger>
													<DropdownMenuContent className='w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto border-white/10 bg-overlay z-[9999]'>
														{stages.map(stage => (
															<DropdownMenuItem
																key={stage.id}
																onClick={() => field.onChange(stage.id)}
																className='cursor-pointer text-white hover:bg-white/10'
															>
																{translateStageTitle(locale, stage.title)}
															</DropdownMenuItem>
														))}
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										/>
										{errors.stageId && (
											<p className='mt-2 text-sm text-red-400'>
												{errors.stageId.message}
											</p>
										)}
									</div>

									<div>
										<label className='mb-2 block text-sm font-semibold text-white'>
											{c.settings.difficultyLabel}
										</label>
										<Controller
											name='difficulty'
											control={control}
											render={({ field }) => (
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<button
															type='button'
															className='flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-all hover:bg-white/10'
														>
																<span>
																	{getDifficultyLabel(
																		field.value,
																		c.settings.difficultyOptions
																	)}
																</span>
															<ChevronDown className='ml-2 h-4 w-4 flex-shrink-0 text-gray-400' />
														</button>
													</DropdownMenuTrigger>
													<DropdownMenuContent className='w-[var(--radix-dropdown-menu-trigger-width)] border-white/10 bg-overlay z-[9999]'>
														<DropdownMenuItem
															onClick={() => field.onChange('EASY')}
															className='cursor-pointer text-white hover:bg-white/10'
														>
															{c.settings.difficultyOptions.easy}
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => field.onChange('MEDIUM')}
															className='cursor-pointer text-white hover:bg-white/10'
														>
															{c.settings.difficultyOptions.medium}
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => field.onChange('HARD')}
															className='cursor-pointer text-white hover:bg-white/10'
														>
															{c.settings.difficultyOptions.hard}
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											)}
										/>
									</div>
								</div>
							</div>

							{/* Info Block */}
							<div className='flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4'>
								<AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400' />
								<div>
									<p className='text-sm font-semibold text-blue-300'>
										{c.infoBlock.title}
									</p>
									<p className='mt-1 text-sm text-gray-400'>
										{c.infoBlock.body}
									</p>
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
											{c.buttons.submit}
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
