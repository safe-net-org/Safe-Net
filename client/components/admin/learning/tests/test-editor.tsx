'use client'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/LocaleProvider'
import { adminService } from '@/services/admin/admin.service'
import { ITest } from '@/services/admin/admin.types'
import { zodResolver } from '@hookform/resolvers/zod'
import { m } from 'framer-motion'
import { Edit2, Loader2, Save, Settings, X } from '@/components/ui/icons'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface TestEditData {
	title: string
	description?: string
	passingScore: number
}

interface TestEditorProps {
	test: ITest
	onUpdate: () => void
}

export default function TestEditor({ test, onUpdate }: TestEditorProps) {
	const { t } = useI18n()
	const c = t.adminTestComponents.testEditor
	const [isEditing, setIsEditing] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const testEditSchema = useMemo(
		() =>
			z.object({
				title: z.string().min(3, c.validation.titleMin).max(255),
				description: z.string().optional(),
				passingScore: z.number().min(0).max(100),
			}),
		[c]
	)

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<TestEditData>({
		resolver: zodResolver(testEditSchema),
		defaultValues: {
			title: test.title,
			description: test.description || '',
			passingScore: test.passingScore || 80,
		},
	})

	const onSubmit = async (data: TestEditData) => {
		setIsSubmitting(true)
		try {
			await adminService.updateTest(test.id, data)
			toast.success(c.toasts.updated)
			setIsEditing(false)
			onUpdate()
		} catch {
			toast.error(c.toasts.updateError)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div data-admin-form className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
			{/* Header */}
			<div className="p-6 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent border-b border-white/10">
				<div className="flex items-center gap-3">
					<Settings className="w-6 h-6 text-purple-400" />
					<h2 className="text-xl font-bold text-white">{c.header}</h2>
				</div>
			</div>

			<div className="p-6">
				{!isEditing ? (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="space-y-6"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="space-y-1">
								<p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{c.fields.title}</p>
								<p className="text-white font-medium text-lg">{test.title}</p>
							</div>

							<div className="space-y-1">
								<p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{c.fields.passingScore}</p>
								<p className="text-white font-medium">{test.passingScore || 80}%</p>
							</div>
						</div>

						<div className="space-y-1">
							<p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{c.fields.description}</p>
							<p className="text-gray-400 text-sm leading-relaxed">
								{test.description || c.fields.noDescription}
							</p>
						</div>

						{test.course && (
							<div className="space-y-1">
								<p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{c.fields.course}</p>
								<p className="text-purple-400 text-sm">{test.course.title}</p>
							</div>
						)}

						<div className="pt-4">
							<Button
								onClick={() => setIsEditing(true)}
								className="gap-2 bg-white text-black hover:bg-white/90 font-semibold px-8"
							>
								<Edit2 className="w-4 h-4" />
								{c.editSettings}
							</Button>
						</div>
					</m.div>
				) : (
					<m.form
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						onSubmit={handleSubmit(onSubmit)}
						className="space-y-5"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-400">{c.form.testTitleLabel}</label>
								<input
									type="text"
									{...register('title')}
									className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
								/>
								{errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium text-gray-400">{c.form.passingScoreLabel}</label>
								<input
									type="number"
									{...register('passingScore', { valueAsNumber: true })}
									className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition"
								/>
								{errors.passingScore && <p className="text-xs text-red-400">{errors.passingScore.message}</p>}
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-400">{c.form.descriptionLabel}</label>
							<textarea
								{...register('description')}
								rows={4}
								className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition resize-none"
							/>
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
					</m.form>
				)}
			</div>
		</div>
	)
}
