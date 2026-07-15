'use client'

import { IconPicker } from '@/components/ui/icon-picker'
import { adminService } from '@/services/admin/admin.service'
import { generateSlug } from '@/utils/transliterate'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence, m } from 'framer-motion'
import { AlertCircle, Loader2, Plus, Sparkles, Target, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const stageSchema = z.object({
	order: z.number().int().positive('Order must be greater than 0'),
	slug: z
		.string()
		.min(1, 'Slug is required')
		.regex(/^[a-z0-9-]+$/, 'Slug may only contain letters, numbers, and hyphens'),
	title: z.string().min(3, 'Title must be at least 3 characters').max(255),
	subtitle: z.string().optional(),
	icon: z.string().optional(),
})

type StageFormData = z.infer<typeof stageSchema>

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
	const [isSubmitting, setIsSubmitting] = useState(false)
	const nextStageOrder = existingStagesCount + 1

	const {
		register,
		handleSubmit,
		watch,
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

	const title = watch('title')
	const icon = watch('icon') || 'BookOpen'

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
			toast.success('Stage created successfully')
			reset()
			onOpenChange(false)
			onSuccess()
		} catch (error) {
			console.error('Create stage error:', error)
			toast.error('Error creating stage')
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
									Create a new stage
								</h3>
								<p className='mt-1 text-sm text-gray-500'>
									Add a learning stage to organize courses
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
									Basic information
								</h4>

								<div className='space-y-6'>
									<div>
										<label className='mb-2 block text-sm font-semibold text-white'>
											Order number
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
											Stage title
										</label>
										<input
											{...register('title')}
											className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
											placeholder='Enter stage title'
										/>
										{errors.title && (
											<p className='mt-2 text-sm text-red-400'>
												{errors.title.message}
											</p>
										)}
									</div>

									<div>
										<label className='mb-2 flex items-center gap-2 text-sm font-semibold text-white'>
											Slug
											<span className='text-xs font-normal text-gray-500'>
												(generated automatically)
											</span>
										</label>
										<input
											{...register('slug')}
											className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
											placeholder='etap-1'
										/>
										{errors.slug && (
											<p className='mt-2 text-sm text-red-400'>
												{errors.slug.message}
											</p>
										)}
									</div>

									<div>
										<label className='mb-2 flex items-center gap-2 text-sm font-semibold text-white'>
											Subtitle{' '}
											<span className='text-xs font-normal text-gray-500'>
												(optional)
											</span>
										</label>
										<input
											{...register('subtitle')}
											className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-blue-500/50 focus:bg-white/10'
											placeholder='Brief stage description'
										/>
									</div>
								</div>
							</div>

							{/* Settings */}
							<div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
								<h4 className='mb-4 flex items-center gap-2 text-lg font-semibold text-white'>
									<Target className='h-5 w-5 text-green-400' />
									Appearance
								</h4>

								<div>
									<label className='mb-2 block text-sm font-semibold text-white'>
										Icon (Lucide)
									</label>
									<IconPicker
										value={icon}
										onValueChange={value => setValue('icon', value)}
									/>
									<p className='mt-2 text-xs text-gray-500'>
										Choose an icon from the Lucide React library
									</p>
								</div>
							</div>

							{/* Info Block */}
							<div className='flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4'>
								<AlertCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400' />
								<div>
									<p className='text-sm font-semibold text-blue-300'>
										Tip: Automatic transliteration
									</p>
									<p className='mt-1 text-sm text-gray-400'>
										The slug is generated automatically from the stage title,
										with support for Russian text
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
											Creating...
										</>
									) : (
										<>
											<Plus className='mr-2 inline h-5 w-5' />
											Create stage
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
