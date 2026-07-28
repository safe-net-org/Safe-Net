'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import { adminService } from '@/services/admin/admin.service'
import {
	CreateBlockDto,
	CreateLessonDto,
	BlockType,
	IBlock,
	ILesson,
} from '@/services/admin/admin.types'
import { m } from 'framer-motion'
import { AlertTriangle, Edit2, Loader2, Plus, Save, Trash2, X } from '@/components/ui/icons'
import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm, useWatch } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'

interface LessonEditorProps {
	lesson: ILesson
	onSuccess: () => void
}

type LessonTitleFormData = Pick<CreateLessonDto, 'title' | 'estimatedDuration'>
type BlockFormData = Omit<CreateBlockDto, 'lessonId' | 'type'>

export default function LessonEditor({ lesson, onSuccess }: LessonEditorProps) {
	const { t } = useI18n()
	const c = t.adminLessonComponents.lessonEditor
	const [isEditingTitle, setIsEditingTitle] = useState(false)
	const [blocks, setBlocks] = useState(lesson.blocks || [])
	const [editingBlockId, setEditingBlockId] = useState<string | null>(null)
	const [showAddBlock, setShowAddBlock] = useState(false)
	const [isSaving, setIsSaving] = useState(false)
	const [deleteDialog, setDeleteDialog] = useState<{
		open: boolean
		block: IBlock | null
	}>({ open: false, block: null })
	const [isDeleting, setIsDeleting] = useState(false)

	const {
		register,
		handleSubmit: handleTitleSubmit,
		reset: resetTitle,
	} = useForm<LessonTitleFormData>({
		defaultValues: {
			title: lesson.title,
			estimatedDuration: lesson.estimatedDuration,
		},
	})

	const onTitleSubmit = async (data: LessonTitleFormData) => {
		setIsSaving(true)
		try {
			await adminService.updateLesson(lesson.id, data)
			toast.success(c.toasts.lessonUpdated)
			setIsEditingTitle(false)
			onSuccess()
		} catch {
			toast.error(c.toasts.lessonUpdateError)
		} finally {
			setIsSaving(false)
		}
	}

	const handleAddBlock = async (blockData: BlockFormData) => {
		try {
			const newBlock = await adminService.createBlock({
				lessonId: lesson.id,
				type: BlockType.THEORY,
				...blockData,
			})
			setBlocks([...blocks, newBlock])
			toast.success(c.toasts.blockAdded)
			setShowAddBlock(false)
			onSuccess()
		} catch {
			toast.error(c.toasts.blockAddError)
		}
	}

	const handleUpdateBlock = async (blockData: BlockFormData) => {
		if (!editingBlockId) return
		try {
			await adminService.updateBlock(editingBlockId, blockData)
			setBlocks(
				blocks.map((b) =>
					b.id === editingBlockId ? { ...b, ...blockData } : b
				)
			)
			toast.success(c.toasts.blockUpdated)
			setEditingBlockId(null)
			onSuccess()
		} catch {
			toast.error(c.toasts.blockUpdateError)
		}
	}

	const handleDeleteBlock = async () => {
		if (!deleteDialog.block) return

		setIsDeleting(true)
		try {
			await adminService.deleteBlock(deleteDialog.block.id)
			setBlocks(blocks.filter((b) => b.id !== deleteDialog.block?.id))
			toast.success(c.toasts.blockDeleted)
			setDeleteDialog({ open: false, block: null })
			onSuccess()
		} catch {
			toast.error(c.toasts.blockDeleteError)
		} finally {
			setIsDeleting(false)
		}
	}

	const editingBlock = blocks.find((b) => b.id === editingBlockId)

	return (
		<>
			<div className='p-6'>
				{/* Header */}
				{!isEditingTitle ? (
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='mb-6'
					>
						<h3 className='text-xl font-bold text-white'>{lesson.title}</h3>
						<p className='mt-1 text-sm text-gray-500'>
							{c.durationTemplate.replace('{minutes}', String(lesson.estimatedDuration))}
						</p>
						<button
							onClick={() => setIsEditingTitle(true)}
							className='mt-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90'
						>
							<Edit2 className='h-4 w-4' />
							{c.editTitleButton}
						</button>
					</m.div>
				) : (
					<m.form
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onSubmit={handleTitleSubmit(onTitleSubmit)}
						className='mb-6 space-y-4'
					>
						<div>
							<label className='mb-2 block text-sm font-medium text-gray-400'>
								{c.titleFieldLabel}
							</label>
							<input
								{...register('title')}
								className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white outline-none transition-colors focus:border-purple-500/50 focus:bg-white/10'
							/>
						</div>
						<div>
							<label className='mb-2 block text-sm font-medium text-gray-400'>
								{c.durationFieldLabel}
							</label>
							<input
								{...register('estimatedDuration')}
								type='number'
								className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white outline-none transition-colors focus:border-purple-500/50 focus:bg-white/10'
							/>
						</div>
						<div className='flex gap-3'>
							<button
								type='button'
								onClick={() => {
									setIsEditingTitle(false)
									resetTitle()
								}}
								className='flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10'
							>
								{c.cancel}
							</button>
							<button
								type='submit'
								disabled={isSaving}
								className='flex-1 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:opacity-50'
							>
								<Save className='mr-2 inline h-4 w-4' />
								{c.save}
							</button>
						</div>
					</m.form>
				)}

				{/* Blocks List */}
				<div className='space-y-4'>
					<div className='flex items-center justify-between'>
						<h4 className='text-lg font-semibold text-white'>
							{c.theoryBlocksHeading}
						</h4>
						<button
							onClick={() => setShowAddBlock(true)}
							className='flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90'
						>
							<Plus className='h-4 w-4' />
							{c.addBlock}
						</button>
					</div>

					{blocks.length === 0 ? (
						<div className='rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center'>
							<p className='text-sm text-gray-500'>
								{c.emptyBlocks}
							</p>
						</div>
					) : (
						<div className='space-y-3'>
							{blocks.map((block) => (
								<div
									key={block.id}
									className='group rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20 hover:bg-white/10'
								>
									<div className='flex items-start justify-between gap-4'>
										<div className='flex-1'>
											<div className='mb-2 flex items-center gap-2'>
												<span className='flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-xs font-bold text-purple-400'>
													{block.order}
												</span>
												<h5 className='font-semibold text-white'>
													{block.title || c.untitled}
												</h5>
											</div>
											<p className='text-sm text-gray-400 line-clamp-2'>
												{block.content}
											</p>
										</div>
										<div className='flex gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
											<button
												onClick={() => setEditingBlockId(block.id)}
												className='rounded-lg bg-blue-500/10 p-2 text-blue-400 transition-colors hover:bg-blue-500/20'
												title={c.editTooltip}
											>
												<Edit2 className='h-4 w-4' />
											</button>
											<button
												onClick={() => setDeleteDialog({ open: true, block })}
												className='rounded-lg bg-red-500/10 p-2 text-red-400 transition-colors hover:bg-red-500/20'
												title={c.deleteTooltip}
											>
												<Trash2 className='h-4 w-4' />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Delete Dialog - Portal */}
			{deleteDialog.open &&
				deleteDialog.block &&
				createPortal(
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
						onClick={() => setDeleteDialog({ open: false, block: null })}
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
									{c.deleteBlockDialog.title}
								</h3>
								<p className='mb-2 text-gray-400'>
									{c.deleteBlockDialog.descriptionPrefix}{' '}
									<span className='font-semibold text-white'>
										&ldquo;{deleteDialog.block.title || c.untitled}&rdquo;
									</span>
									?
								</p>
								<p className='text-sm text-red-400'>
									{c.deleteBlockDialog.cannotUndo}
								</p>
							</div>

							<div className='mt-6 flex gap-3'>
								<button
									onClick={() => setDeleteDialog({ open: false, block: null })}
									disabled={isDeleting}
									className='flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-gray-300 transition-colors hover:bg-white/10 disabled:opacity-50'
								>
									{c.deleteBlockDialog.cancel}
								</button>
								<button
									onClick={handleDeleteBlock}
									disabled={isDeleting}
									className='flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50'
								>
									{isDeleting ? (
										<>
											<Loader2 className='mr-2 inline h-4 w-4 animate-spin' />
											{c.deleteBlockDialog.deleting}
										</>
									) : (
										c.deleteBlockDialog.confirm
									)}
								</button>
							</div>
						</m.div>
					</m.div>,
					document.body
				)}

			{/* Add Block Modal - Portal */}
			{showAddBlock &&
				createPortal(
					<BlockFormModal
						onClose={() => setShowAddBlock(false)}
						onSubmit={handleAddBlock}
					/>,
					document.body
				)}

			{/* Edit Block Modal - Portal */}
			{editingBlockId &&
				editingBlock &&
				createPortal(
					<BlockFormModal
						block={editingBlock}
						onClose={() => setEditingBlockId(null)}
						onSubmit={handleUpdateBlock}
						isEditing
					/>,
					document.body
				)}
		</>
	)
}

interface BlockFormModalProps {
	block?: IBlock
	onClose: () => void
	onSubmit: (data: BlockFormData) => Promise<void>
	isEditing?: boolean
}

function BlockFormModal({
	block,
	onClose,
	onSubmit,
	isEditing,
}: BlockFormModalProps) {
	const { t } = useI18n()
	const m2 = t.adminLessonComponents.lessonEditor.blockModal
	const textareaRef = React.useRef<HTMLTextAreaElement>(null)

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors },
	} = useForm<BlockFormData>({
		defaultValues: {
			order: block?.order || 1,
			title: block?.title || '',
			content: block?.content || '',
		},
	})

	const content = useWatch({ control, name: 'content' }) ?? ''

	// Inserts markdown syntax at the cursor position
	const insertMarkdown = (before: string, after: string = '', placeholder: string = 'text') => {
		const textarea = textareaRef.current
		if (!textarea) return

		const start = textarea.selectionStart
		const end = textarea.selectionEnd
		const selectedText = content.substring(start, end) || placeholder
		const newText = content.substring(0, start) + before + selectedText + after + content.substring(end)

		setValue('content', newText)

		// Restore focus and select the inserted text
		setTimeout(() => {
			textarea.focus()
			textarea.setSelectionRange(
				start + before.length,
				start + before.length + selectedText.length
			)
		}, 0)
	}

	const toolbarButtons = [
		{
			icon: <span className="font-bold text-lg">H1</span>,
			label: m2.toolbar.heading1,
			before: '# ',
			after: '',
			placeholder: 'Heading',
		},
		{
			icon: <span className="font-bold">H2</span>,
			label: m2.toolbar.heading2,
			before: '## ', after: '', placeholder: 'Heading',
		},
		{
			icon: <span className="font-bold text-sm">H3</span>,
			label: m2.toolbar.heading3,
			before: '### ', after: '', placeholder: 'Heading',
		},
		{
			icon: <span className="font-bold">B</span>,
			label: m2.toolbar.bold,
			before: '**', after: '**', placeholder: 'bold text',
		},
		{
			icon: <span className="italic">I</span>,
			label: m2.toolbar.italic,
			before: '*', after: '*', placeholder: 'italic',
		},
		{
			icon: <span className="line-through">S</span>,
			label: m2.toolbar.strikethrough,
			before: '~~', after: '~~', placeholder: 'strikethrough',
		},
		{
			icon: <span className="font-mono text-sm">&lt;/&gt;</span>,
			label: m2.toolbar.code,
			before: '`', after: '`', placeholder: 'code',
		},
		{
			icon: <span className="font-mono text-xs">```</span>,
			label: m2.toolbar.codeBlock,
			before: '```\n', after: '\n```', placeholder: 'code',
		},
		{
			icon: <span>•</span>,
			label: m2.toolbar.list,
			before: '- ', after: '', placeholder: 'list item',
		},
		{
			icon: <span>1.</span>,
			label: m2.toolbar.numberedList,
			before: '1. ', after: '', placeholder: 'list item',
		},
		{
			icon: <span>&ldquo;</span>,
			label: m2.toolbar.quote,
			before: '> ', after: '', placeholder: 'quote',
		},
		{
			icon: <span>🔗</span>,
			label: m2.toolbar.link,
			before: '[', after: '](url)', placeholder: 'link text',
		},
	]

	return (
		<m.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className='fixed inset-0 z- bg-overlay overflow-y-auto'
		>
			{/* Header */}
			<div className='sticky top-0 border-b border-white/10 bg-overlay/95 backdrop-blur-xl z-10'>
				<div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
					<div>
						<h3 className='text-2xl font-bold text-white'>
							{isEditing ? m2.editTitle : m2.addTitle}
						</h3>
						<p className='mt-1 text-sm text-gray-500'>
							{isEditing
								? m2.editSubtitle
								: m2.addSubtitle}
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
			<div className='mx-auto max-w-7xl px-6 py-8'>
				<form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
					<div className='grid gap-6 md:grid-cols-2'>
						<div>
							<label className='mb-2 block text-sm font-semibold text-white'>
								{m2.orderLabel}
							</label>
							<input
								{...register('order', { valueAsNumber: true })}
								type='number'
								className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-purple-500/50 focus:bg-white/10'
								placeholder='1'
							/>
						</div>

						<div>
							<label className='mb-2 block text-sm font-semibold text-white'>
								{m2.titleLabel}
							</label>
							<input
								{...register('title')}
								className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors focus:border-purple-500/50 focus:bg-white/10'
								placeholder={m2.titlePlaceholder}
							/>
						</div>
					</div>

					<div className='space-y-3'>
						<label className='mb-2 block text-sm font-semibold text-white'>
							{m2.contentLabel}
						</label>

						<div className='grid gap-4 md:grid-cols-2'>
							{/* Editor */}
							<div className='flex flex-col rounded-2xl border border-white/10 bg-white/5'>
								{/* Toolbar */}
								<div className='flex flex-wrap items-center gap-1 border-b border-white/10 p-2'>
									{toolbarButtons.map((button, index) => (
										<button
											key={index}
											type='button'
											onClick={() =>
												insertMarkdown(
													button.before,
													button.after,
													button.placeholder
												)
											}
											className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-white transition-colors hover:bg-white/10 active:scale-95'
											title={button.label}
										>
											{button.icon}
										</button>
									))}
								</div>

								{/* Editor header */}
								<div className='flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-gray-400'>
									<span>{m2.editorLabel}</span>
									<span className='text-[10px] text-gray-500'>
										{m2.markdownLabel}
									</span>
								</div>

								<textarea
									{...register('content', {
										required: m2.contentRequired,
									})}
										ref={(e) => {
											register('content').ref(e)
											textareaRef.current = e
									}}
									rows={24}
									className='min-h-[500px] w-full resize-none rounded-b-2xl bg-transparent px-4 py-3 font-mono text-sm text-white outline-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20'
									placeholder={m2.contentPlaceholder}
								/>
							</div>

							{/* Preview */}
							<div className='flex flex-col rounded-2xl border border-white/10 bg-white/5 overflow-hidden'>
								<div className='flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-gray-400'>
									<span>{m2.previewLabel}</span>
									<span className='text-[10px] text-gray-500'>
										{m2.renderLabel}
									</span>
								</div>
								<div className='min-h-[500px] overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20'>
									{content?.trim() ? (
										<div className='markdown-preview text-sm'>
											<ReactMarkdown
												components={{
													h1: ({ children }) => (
														<h1 className='mb-4 mt-6 text-3xl font-bold text-white'>
															{children}
														</h1>
													),
													h2: ({ children }) => (
														<h2 className='mb-3 mt-6 text-2xl font-bold text-white'>
															{children}
														</h2>
													),
													h3: ({ children }) => (
														<h3 className='mb-2 mt-4 text-xl font-semibold text-white'>
															{children}
														</h3>
													),
													h4: ({ children }) => (
														<h4 className='mb-2 mt-3 text-lg font-semibold text-white'>
															{children}
														</h4>
													),
													p: ({ children }) => (
														<p className='mb-4 leading-relaxed text-gray-300'>
															{children}
														</p>
													),
													ul: ({ children }) => (
														<ul className='mb-4 ml-5 list-disc space-y-2 text-gray-300'>
															{children}
														</ul>
													),
													ol: ({ children }) => (
														<ol className='mb-4 ml-5 list-decimal space-y-2 text-gray-300'>
															{children}
														</ol>
													),
													li: ({ children }) => (
														<li className='leading-relaxed'>{children}</li>
													),
														code: ({ children, className }) =>
															!className ? (
															<code className='rounded bg-purple-500/20 px-1.5 py-0.5 font-mono text-sm text-purple-300'>
																{children}
															</code>
														) : (
																<code className='block font-mono text-sm text-gray-300'>
																{children}
															</code>
														),
													pre: ({ children }) => (
														<pre className='mb-4 overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-3'>
															{children}
														</pre>
													),
													blockquote: ({ children }) => (
														<blockquote className='mb-4 border-l-4 border-purple-500 bg-purple-500/10 pl-4 py-2 italic text-gray-300'>
															{children}
														</blockquote>
													),
													a: ({ href, children }) => (
														<a
															href={href}
															className='text-blue-400 underline decoration-blue-400/30 transition-colors hover:text-blue-300 hover:decoration-blue-300/50'
															target='_blank'
															rel='noopener noreferrer'
														>
															{children}
														</a>
													),
													strong: ({ children }) => (
														<strong className='font-bold text-white'>{children}</strong>
													),
													em: ({ children }) => (
														<em className='italic text-gray-200'>{children}</em>
													),
													hr: () => (
														<hr className='my-6 border-t border-white/10' />
													),
													del: ({ children }) => (
														<del className='text-gray-400 line-through'>{children}</del>
													),
													table: ({ children }) => (
														<div className='mb-4 overflow-x-auto'>
															<table className='min-w-full border-collapse border border-white/10'>
																{children}
															</table>
														</div>
													),
													thead: ({ children }) => (
														<thead className='bg-white/5'>{children}</thead>
													),
													tbody: ({ children }) => (
														<tbody>{children}</tbody>
													),
													tr: ({ children }) => (
														<tr className='border-b border-white/10'>{children}</tr>
													),
													th: ({ children }) => (
														<th className='border border-white/10 px-4 py-2 text-left font-semibold text-white'>
															{children}
														</th>
													),
													td: ({ children }) => (
														<td className='border border-white/10 px-4 py-2 text-gray-300'>
															{children}
														</td>
													),
												}}
											>
												{content}
											</ReactMarkdown>
										</div>
									) : (
										<p className='text-xs text-gray-500'>
											{m2.previewEmptyHint}
										</p>
									)}
								</div>
							</div>
						</div>

						{errors.content && (
							<p className='mt-1 text-sm text-red-400'>
								{errors.content.message as string}
							</p>
						)}
					</div>

					{/* Actions */}
					<div className='flex gap-4 pt-6'>
						<button
							type='button'
							onClick={onClose}
							className='flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-gray-300 transition-colors hover:bg-white/10'
						>
							{m2.cancel}
						</button>
						<button
							type='submit'
							className='flex-1 rounded-xl bg-white px-6 py-4 font-semibold text-black transition-colors hover:bg-white/90'
						>
							{isEditing ? (
								<>
									<Save className='mr-2 inline h-5 w-5' />
									{m2.saveSubmit}
								</>
							) : (
								<>
									<Plus className='mr-2 inline h-5 w-5' />
									{m2.addSubmit}
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</m.div>
	)
}
