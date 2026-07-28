'use client'

import { Button } from '@/components/ui/button'
// Import DropdownMenu components
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminService } from '@/services/admin/admin.service'
import { Difficulty, ICourse } from '@/services/admin/admin.types'
import { getDifficultyLabel } from '@/services/learning/learning.types'
import { useI18n } from '@/i18n/LocaleProvider'
import { zodResolver } from '@hookform/resolvers/zod'
import { m } from 'framer-motion'
import { ChevronDown, Edit2, Loader2, Save, X } from '@/components/ui/icons'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface CourseEditData {
	title: string
	description: string
	difficulty: 'EASY' | 'MEDIUM' | 'HARD'
}

interface CourseEditFormProps {
	course: ICourse
	onSuccess: () => void
}

export default function CourseEditForm({ course, onSuccess }: CourseEditFormProps) {
	const { t } = useI18n()
	const c = t.adminCourseComponents.courseEditForm
	const [isEditing, setIsEditing] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const courseEditSchema = useMemo(
		() =>
			z.object({
				title: z.string().min(3, c.validation.titleMin).max(255),
				description: z.string().min(10, c.validation.descriptionMin),
				difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
			}),
		[c]
	)

	const {
		register,
		handleSubmit,
		setValue, // Used to update the value from the dropdown
		control,
		formState: { errors },
		reset,
	} = useForm<CourseEditData>({
		resolver: zodResolver(courseEditSchema),
		defaultValues: {
			title: course.title,
			description: course.description,
			difficulty: (course.difficulty as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM',
		},
	})

	const currentDifficulty = useWatch({ control, name: 'difficulty' })

	const onSubmit = async (data: CourseEditData) => {
		setIsSubmitting(true)
		try {
			await adminService.updateCourse(course.id, data)
			toast.success(c.toast.updated)
			setIsEditing(false)
			onSuccess()
		} catch {
			toast.error(c.toast.updateError)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<m.div data-admin-form initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
			{!isEditing ? (
				<div className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="space-y-1">
							<p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{c.viewLabels.title}</p>
							<p className="text-white font-medium text-lg">{course.title}</p>
						</div>

						<div className="space-y-1">
							<p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{c.viewLabels.difficulty}</p>
							<p className="text-white font-medium">
								{getDifficultyLabel(
									course.difficulty || Difficulty.EASY,
									c.form.difficultyOptions
								)}
							</p>
						</div>
					</div>

					<div className="space-y-1">
						<p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{c.viewLabels.description}</p>
						<p className="text-gray-400 text-sm leading-relaxed">{course.description}</p>
					</div>

					<div className="pt-4">
						<Button
							onClick={() => setIsEditing(true)}
							className="gap-2 bg-white text-black hover:bg-white/90 font-semibold px-8"
						>
							<Edit2 className="w-4 h-4" />
							{c.editButton}
						</Button>
					</div>
				</div>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-400">{c.form.titleLabel}</label>
							<input
								type="text"
								{...register('title')}
								className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
							/>
							{errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-400">{c.form.difficultyLabel}</label>
							{/* Dropdown Menu instead of Select */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										type="button"
										className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition outline-none"
									>
										<span>
											{getDifficultyLabel(
												currentDifficulty,
												c.form.difficultyOptions
											)}
										</span>
										<ChevronDown className="w-4 h-4 text-gray-400" />
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align="start"
									className="w-56 bg-overlay border-white/10 text-white"
								>
									<DropdownMenuItem
										onClick={() => setValue('difficulty', 'EASY')}
										className="hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer"
									>
										{c.form.difficultyOptions.easy}
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setValue('difficulty', 'MEDIUM')}
										className="hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer"
									>
										{c.form.difficultyOptions.medium}
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => setValue('difficulty', 'HARD')}
										className="hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer"
									>
										{c.form.difficultyOptions.hard}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium text-gray-400">{c.form.descriptionLabel}</label>
						<textarea
							{...register('description')}
							rows={4}
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition resize-none"
						/>
						{errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
					</div>

					<div className="flex items-center gap-3 pt-4">
						<Button
							type="submit"
							disabled={isSubmitting}
							className="gap-2 bg-white text-black hover:bg-white/90 font-semibold px-8"
						>
							{isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
							{c.buttons.save}
						</Button>

						<Button
							type="button"
							variant="ghost"
							onClick={() => {
								setIsEditing(false)
								reset()
							}}
							className="gap-2 text-gray-400 hover:text-white hover:bg-white/5"
						>
							<X className="w-4 h-4" />
							{c.buttons.cancel}
						</Button>
					</div>
				</form>
			)}
		</m.div>
	)
}
