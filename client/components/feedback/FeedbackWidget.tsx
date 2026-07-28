'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquarePlus, Send, Star } from '@/components/ui/icons'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { AuthDialog } from '@/components/Auth/AuthDialog'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useProfile } from '@/hooks/user/useProfile'
import { useI18n } from '@/i18n/LocaleProvider'
import { feedbackService } from '@/services/feedback/feedback.service'
import { cn } from '@/lib/utils'

export function FeedbackWidget() {
	const { t } = useI18n()
	const { user } = useProfile()
	const pathname = usePathname()
	const queryClient = useQueryClient()
	const [open, setOpen] = useState(false)
	const [rating, setRating] = useState(0)
	const [message, setMessage] = useState('')
	const isSignedIn = Boolean(user.id)

	const mutation = useMutation({
		mutationFn: () =>
			feedbackService.create({ rating, message, sourcePage: pathname }),
		onSuccess: () => {
			toast.success(t.feedback.success)
			setOpen(false)
			setRating(0)
			setMessage('')
			queryClient.invalidateQueries({ queryKey: ['admin-feedback'] })
		},
		onError: () => toast.error(t.feedback.error),
	})

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					className='fixed bottom-5 right-5 z-40 h-11 rounded-full bg-brand px-4 text-white shadow-lg shadow-brand/20 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-brand-strong'
					aria-label={t.feedback.button}
				>
					<MessageSquarePlus className='size-4' />
					<span className='hidden sm:inline'>{t.feedback.button}</span>
				</Button>
			</DialogTrigger>
			<DialogContent className='border-border bg-card text-card-foreground duration-500'>
				<DialogHeader>
					<DialogTitle>{t.feedback.title}</DialogTitle>
					<DialogDescription>{t.feedback.description}</DialogDescription>
				</DialogHeader>

				{isSignedIn ? (
					<form
						className='space-y-5'
						onSubmit={event => {
							event.preventDefault()
							if (rating && message.trim().length >= 10) mutation.mutate()
						}}
					>
						<div className='space-y-2'>
							<Label>{t.feedback.rating}</Label>
							<div className='flex gap-1' role='radiogroup'>
								{[1, 2, 3, 4, 5].map(value => (
									<button
										key={value}
										type='button'
										role='radio'
										aria-checked={rating === value}
										aria-label={`${value}/5`}
										onClick={() => setRating(value)}
										className='rounded-lg p-1.5 transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
									>
										<Star
											className={cn(
												'size-6 transition-colors duration-300',
												value <= rating
													? 'fill-amber-400 text-amber-400'
													: 'text-muted-foreground'
											)}
										/>
									</button>
								))}
							</div>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='feedback-message'>{t.feedback.message}</Label>
							<Textarea
								id='feedback-message'
								value={message}
								onChange={event => setMessage(event.target.value)}
								minLength={10}
								maxLength={2000}
								rows={5}
								placeholder={t.feedback.placeholder}
								className='resize-none'
							/>
							<p className='text-right text-xs text-muted-foreground'>
								{message.length}/2000
							</p>
						</div>
						<DialogFooter>
							<Button
								type='submit'
								disabled={
									mutation.isPending || rating === 0 || message.trim().length < 10
								}
								className='bg-brand text-white hover:bg-brand-strong'
							>
								<Send className='size-4' />
								{mutation.isPending ? t.feedback.sending : t.feedback.send}
							</Button>
						</DialogFooter>
					</form>
				) : (
					<div className='space-y-4'>
						<p className='text-sm text-muted-foreground'>
							{t.feedback.signInRequired}
						</p>
						<AuthDialog
							triggerButton={{
								text: t.feedback.signIn,
								className:
									'inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-strong',
							}}
						/>
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
