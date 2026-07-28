'use client'

import { IconPicker } from '@/components/ui/icon-picker'
import { adminService } from '@/services/admin/admin.service'
import { useI18n } from '@/i18n/LocaleProvider'
import { generateSlug } from '@/utils/transliterate'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, m } from 'framer-motion'
import { AlertCircle, Loader2, Plus, Sparkles, Target, X } from '@/components/ui/icons'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface StageFormData {
	order: number
	slug: string
	title: string
	subtitle?: string
	icon?: string
}

interface CreateStageDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess: () => void
	existingStagesCount?: number
}

export default function CreateStageDialog({
	open,
	onOpenChange,
	onSuccess,
	existingStagesCount = 0,
}: CreateStageDialogProps) {
	const { t } = useI18n()
	const c = t.adminCourseComponents.createStageDialog
	const [isSubmitting, setIsSubmitting] = useState(false)
	const nextStageOrder = existingStagesCount + 1

	const stageSchema = useMemo(
		() =>
			z.object({
				order: z.number().int().positive(c.validation.orderPositive),
				slug: z
					.string()
					.min(1, c.validation.slugRequired)
					.regex(/^[a-z0-9-]+$/, c.validation.slugPattern),
				title: z.string().min(3, c.validation.titleMin).max(255),
				subtitle: z.string().optional(),
				icon: z.string().optional(),
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
	} = useForm<StageFormData>({
		resolver: zodResolver(stageSchema),
		defaultValues: {
			order: nextStageOrder,
			title: '',
			slug: '',
			subtitle: '',
			icon: 'BookOpen',
		},
	})

	const title = useWatch({ control, name: 'title' })
	const icon = useWatch({ control, name: 'icon' }) || 'BookOpen'

	useEffect(() => {
		if (title) {
			const slug = generateSlug(title)
			setValue('slug', slug)
		}
	}, [title, setValue])

	useEffect(() => {
		if (open) {
			setValue('order', nextStageOrder)
		}
	}, [open, nextStageOrder, setValue])

	const onSubmit = async (data: StageFormData) => {
		setIsSubmitting(true)
		try {
			await adminService.createStage(data)
			toast.success(c.toast.created)
			reset()
			onOpenChange(false)
			onSuccess()
		} catch (error) {
			console.error('Create stage error:', error)
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
											{c.basicInfo.orderLabel}
										</label>
										<input
											{...register('order', { valueAsNumber: true })}
											type='number'
											min='1'
											className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
										/>
										{errors.order && (
											<p className='mt-2 text-sm text-red-400'>
												{errors.order.message}
											</p>
										)}
									</div>

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
										<label className='mb-2 flex items-center gap-2 text-sm font-semibold text-white'>
											{c.basicInfo.subtitleLabel}{' '}
											<span className='text-xs font-normal text-gray-500'>
												{c.basicInfo.subtitleOptional}
											</span>
										</label>
										<input
											{...register('subtitle')}
											className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
											placeholder={c.basicInfo.subtitlePlaceholder}
										/>
									</div>
								</div>
							</div>

							{/* Settings */}
							<div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
								<h4 className='mb-4 flex items-center gap-2 text-lg font-semibold text-white'>
									<Target className='h-5 w-5 text-green-400' />
									{c.appearance.heading}
								</h4>

								<div>
									<label className='mb-2 block text-sm font-semibold text-white'>
										{c.appearance.iconLabel}
									</label>
									<IconPicker
										value={icon}
										onValueChange={value => setValue('icon', value)}
									/>
									<p className='mt-2 text-xs text-gray-500'>
										{c.appearance.iconHint}
									</p>
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
									disabled={isSubmitting}
									className='flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-gray-300 transition-all hover:bg-white/10 disabled:opacity-50'
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
