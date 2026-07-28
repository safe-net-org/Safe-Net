'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Eye, EyeOff, MessageSquareText, Star } from '@/components/ui/icons'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/i18n/LocaleProvider'
import {
	feedbackService,
	type AdminFeedback,
	type FeedbackStatus,
} from '@/services/feedback/feedback.service'

const statusOptions: FeedbackStatus[] = ['NEW', 'REVIEWED', 'ARCHIVED']

export default function AdminFeedbackPage() {
	const { t, locale } = useI18n()
	const queryClient = useQueryClient()
	const [search, setSearch] = useState('')
	const [status, setStatus] = useState<FeedbackStatus | ''>('')
	const [rating, setRating] = useState('')
	const [featured, setFeatured] = useState('')
	const [page, setPage] = useState(1)

	const query = useQuery({
		queryKey: ['admin-feedback', search, status, rating, featured, page],
		queryFn: () =>
			feedbackService.getAdmin({
				search: search || undefined,
				status: status || undefined,
				rating: rating ? Number(rating) : undefined,
				featured:
					featured === 'true' ? true : featured === 'false' ? false : undefined,
				page,
			}),
	})

	const update = useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string
			data: { status?: FeedbackStatus; featured?: boolean }
		}) => feedbackService.updateAdmin(id, data),
		onSuccess: () => {
			toast.success(t.feedbackAdmin.saved)
			queryClient.invalidateQueries({ queryKey: ['admin-feedback'] })
			queryClient.invalidateQueries({ queryKey: ['featured-feedback'] })
		},
		onError: () => toast.error(t.feedbackAdmin.saveError),
	})

	const statusLabel = (value: FeedbackStatus) =>
		({
			NEW: t.feedbackAdmin.new,
			REVIEWED: t.feedbackAdmin.reviewed,
			ARCHIVED: t.feedbackAdmin.archived,
		})[value]

	return (
		<div className='space-y-6'>
			<header className='flex items-start gap-3'>
				<div className='rounded-xl bg-brand/10 p-2.5 text-brand'>
					<MessageSquareText className='size-5' />
				</div>
				<div>
					<h1 className='text-2xl font-semibold text-foreground'>
						{t.feedbackAdmin.title}
					</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						{t.feedbackAdmin.subtitle}
					</p>
				</div>
			</header>

			<div className='grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-4'>
				<Input
					value={search}
					onChange={event => {
						setSearch(event.target.value)
						setPage(1)
					}}
					placeholder={t.feedbackAdmin.search}
					className='md:col-span-1'
				/>
				<select
					value={status}
					onChange={event => {
						setStatus(event.target.value as FeedbackStatus | '')
						setPage(1)
					}}
					className='h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground'
				>
					<option value=''>{t.feedbackAdmin.allStatuses}</option>
					{statusOptions.map(value => (
						<option key={value} value={value}>
							{statusLabel(value)}
						</option>
					))}
				</select>
				<select
					value={rating}
					onChange={event => {
						setRating(event.target.value)
						setPage(1)
					}}
					className='h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground'
				>
					<option value=''>{t.feedbackAdmin.allRatings}</option>
					{[5, 4, 3, 2, 1].map(value => (
						<option key={value} value={value}>
							{value} / 5
						</option>
					))}
				</select>
				<select
					value={featured}
					onChange={event => {
						setFeatured(event.target.value)
						setPage(1)
					}}
					className='h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground'
				>
					<option value=''>{t.feedbackAdmin.allVisibility}</option>
					<option value='true'>{t.feedbackAdmin.featuredOnly}</option>
					<option value='false'>{t.feedbackAdmin.notFeatured}</option>
				</select>
			</div>

			<div className='space-y-3'>
				{query.data?.items.map(item => (
					<FeedbackCard
						key={item.id}
						item={item}
						locale={locale}
						statusLabel={statusLabel}
						copy={t.feedbackAdmin}
						disabled={update.isPending}
						onUpdate={data => update.mutate({ id: item.id, data })}
					/>
				))}
				{!query.isLoading && query.data?.items.length === 0 && (
					<div className='rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground'>
						{t.feedbackAdmin.empty}
					</div>
				)}
			</div>

			{query.data && query.data.totalPages > 1 && (
				<div className='flex items-center justify-center gap-3'>
					<Button
						variant='outline'
						disabled={page === 1}
						onClick={() => setPage(value => value - 1)}
					>
						←
					</Button>
					<span className='text-sm text-muted-foreground'>
						{page} / {query.data.totalPages}
					</span>
					<Button
						variant='outline'
						disabled={page === query.data.totalPages}
						onClick={() => setPage(value => value + 1)}
					>
						→
					</Button>
				</div>
			)}
		</div>
	)
}

function FeedbackCard({
	item,
	locale,
	statusLabel,
	copy,
	disabled,
	onUpdate,
}: {
	item: AdminFeedback
	locale: string
	statusLabel: (status: FeedbackStatus) => string
	copy: ReturnType<typeof useI18n>['t']['feedbackAdmin']
	disabled: boolean
	onUpdate: (data: { status?: FeedbackStatus; featured?: boolean }) => void
}) {
	return (
		<article className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
			<div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
				<div className='min-w-0 space-y-3'>
					<div className='flex flex-wrap items-center gap-2'>
						<strong className='text-sm text-card-foreground'>{item.user.name}</strong>
						<span className='text-sm text-muted-foreground'>{item.user.email}</span>
						<Badge variant='outline'>{statusLabel(item.status)}</Badge>
						{item.featured && (
							<Badge className='bg-brand text-white'>
								<Eye className='size-3' />
								{copy.featuredOnly}
							</Badge>
						)}
					</div>
					<div className='flex gap-0.5' aria-label={`${item.rating}/5`}>
						{[1, 2, 3, 4, 5].map(value => (
							<Star
								key={value}
								className={`size-4 ${
									value <= item.rating
										? 'fill-amber-400 text-amber-400'
										: 'text-muted-foreground/40'
								}`}
							/>
						))}
					</div>
					<p className='max-w-4xl whitespace-pre-wrap text-sm leading-6 text-card-foreground'>
						{item.message}
					</p>
					<div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'>
						<span>
							{new Intl.DateTimeFormat(locale, {
								dateStyle: 'medium',
								timeStyle: 'short',
							}).format(new Date(item.createdAt))}
						</span>
						{item.sourcePage && <span>{copy.page}: {item.sourcePage}</span>}
					</div>
				</div>
				<div className='flex shrink-0 flex-wrap gap-2'>
					{item.status === 'NEW' && (
						<Button
							size='sm'
							variant='outline'
							disabled={disabled}
							onClick={() => onUpdate({ status: 'REVIEWED' })}
						>
							<Check className='size-4' />
							{copy.reviewed}
						</Button>
					)}
					<Button
						size='sm'
						variant={item.featured ? 'outline' : 'default'}
						disabled={disabled || item.status === 'ARCHIVED'}
						onClick={() => onUpdate({ featured: !item.featured })}
					>
						{item.featured ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
						{item.featured ? copy.unfeature : copy.feature}
					</Button>
					{item.status !== 'ARCHIVED' && (
						<Button
							size='sm'
							variant='ghost'
							disabled={disabled}
							onClick={() => onUpdate({ status: 'ARCHIVED' })}
						>
							{copy.archived}
						</Button>
					)}
				</div>
			</div>
		</article>
	)
}
