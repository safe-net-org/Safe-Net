'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { m } from 'framer-motion'
import { Eye, EyeOff } from '@/components/ui/icons'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CURRENT_LEGAL_VERSION } from '@/config/legal.config'
import { MOTION } from '@/config/motion.config'
import { useProfile } from '@/hooks/user/useProfile'
import { useI18n } from '@/i18n/LocaleProvider'
import { legalMessages } from '@/i18n/legal-messages'
import authService from '@/services/auth/auth.service'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useRef, useState, useTransition } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { IFormData } from '@/services/auth/auth.types'
import { toast } from 'sonner'
import { IAuthDialog } from './AuthDialog.interface'

export function AuthDialog({
	triggerButton: triggerButtonProp,
	dialogSize = 'md',
	title = 'SafeNet',
	description: descriptionProp,
	showNameField = true,
	children,
}: IAuthDialog) {
	const { t, locale } = useI18n()
	const authCopy = legalMessages[locale].auth
	const triggerButton = triggerButtonProp ?? {
		text: t.authDialog.defaultTriggerText,
		className:
			'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-2 group',
		position: 'end' as const,
	}
	const description = descriptionProp ?? t.authDialog.defaultDescription
	const [open, setOpen] = useState(false)
	const [isLogin, setIsLogin] = useState(true)
	const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const titleRef = useRef<HTMLHeadingElement>(null)
	const schema = useMemo(
		() =>
			z
				.object({
					name: z.string().trim().optional(),
					email: z
						.string()
						.trim()
						.min(1, authCopy.emailRequired)
						.email(authCopy.emailInvalid),
					password: z
						.string()
						.min(1, authCopy.passwordRequired)
						.min(
							isLogin ? 6 : 8,
							isLogin
								? authCopy.loginPasswordTooShort
								: authCopy.passwordTooShort
						),
				})
				.superRefine((values, ctx) => {
					if (!isLogin && showNameField && !values.name?.trim()) {
						ctx.addIssue({
							code: 'custom',
							path: ['name'],
							message: authCopy.nameRequired,
						})
					}
				}),
		[authCopy, isLogin, showNameField]
	)
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<IFormData>({
		resolver: zodResolver(schema),
		mode: 'onBlur',
	})
	const router = useRouter()
	const queryClient = useQueryClient()
	const [isPending, startTransition] = useTransition()
	const { user } = useProfile()
	const { mutate: mutateLogin, isPending: isLoginPending } = useMutation({
		mutationKey: ['login'],
		mutationFn: (data: IFormData) => authService.main('login', data),
		onSuccess() {
			toast.success(t.authDialog.toasts.loggedIn)
			startTransition(() => {
				reset()
				setOpen(false)
				queryClient.invalidateQueries({ queryKey: ['profile'] })
				router.push('/dashboard')
			})
		},
		onError() {
			toast.error(t.authDialog.toasts.loginError)
		},
	})
	const { mutate: mutateRegister, isPending: isRegisterPending } = useMutation({
		mutationKey: ['register'],
		mutationFn: (data: IFormData) => authService.main('register', data),
		onSuccess() {
			toast.success(t.authDialog.toasts.accountCreated)
			startTransition(() => {
				reset()
				setOpen(false)
				queryClient.invalidateQueries({ queryKey: ['profile'] })
				router.push('/dashboard')
			})
		},
		onError() {
			toast.error(t.authDialog.toasts.registerError)
		},
	})
	const isLoading = isPending || isLoginPending || isRegisterPending
	const resetAuthUi = () => {
		reset()
		setAgreedToPrivacy(false)
		setShowPassword(false)
	}
	const handleModeToggle = () => {
		setIsLogin(current => !current)
		resetAuthUi()
	}
	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen)
		if (!nextOpen) resetAuthUi()
	}
	const sizeClasses = {
		sm: 'sm:max-w-sm',
		md: 'sm:max-w-md',
		lg: 'sm:max-w-lg',
		xl: 'sm:max-w-xl',
		'2xl': 'sm:max-w-2xl',
		'3xl': 'sm:max-w-3xl',
		'4xl': 'sm:max-w-4xl',
		'5xl': 'sm:max-w-5xl',
	}
	const onSubmit: SubmitHandler<IFormData> = data => {
		if (!isLogin && !agreedToPrivacy) {
			toast.error(t.authDialog.toasts.agreeRequired)
			return
		}
		if (isLogin) {
			mutateLogin({ email: data.email, password: data.password })
			return
		}
		mutateRegister({
			name: data.name,
			email: data.email,
			password: data.password,
			termsAccepted: true,
			privacyAccepted: true,
			legalVersion: CURRENT_LEGAL_VERSION,
			legalLocale: locale,
		})
	}
	const handleTriggerClick = () => {
		if (user?.isLoggedIn) {
			router.push('/dashboard')
		} else {
			setOpen(true)
		}
	}
	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<m.button
				type='button'
				className={triggerButton.className}
				onClick={handleTriggerClick}
				whileHover={
					triggerButton.smoothMotion ? { y: -3, scale: 1.015 } : undefined
				}
				whileTap={
					triggerButton.smoothMotion ? { y: 0, scale: 0.985 } : undefined
				}
				transition={{ duration: MOTION.hover, ease: MOTION.ease }}
			>
				{triggerButton.position === 'start' && triggerButton.icon && (
					<span className='mr-2'>{triggerButton.icon}</span>
				)}
				{triggerButton.text}
				{triggerButton.position === 'end' && triggerButton.icon && (
					<span className='ml-2'>{triggerButton.icon}</span>
				)}
			</m.button>
			<DialogContent
				className={`${sizeClasses[dialogSize]} border border-border bg-popover text-popover-foreground shadow-2xl`}
				onOpenAutoFocus={event => {
					event.preventDefault()
					titleRef.current?.focus({ preventScroll: true })
				}}
			>
				<DialogHeader className='text-center'>
					<DialogTitle
						ref={titleRef}
						tabIndex={-1}
						className='text-2xl font-semibold tracking-tight text-foreground outline-none'
					>
						{isLogin
							? t.authDialog.logInToTemplate.replace('{title}', title)
							: t.authDialog.signUpForTemplate.replace('{title}', title)}
					</DialogTitle>
					<DialogDescription className='mt-2 text-muted-foreground'>
						{isLogin
							? description
							: t.authDialog.createAccountTemplate.replace('{title}', title)}
					</DialogDescription>
				</DialogHeader>
				<form className='space-y-4 mt-4' onSubmit={handleSubmit(onSubmit)}>
					{!isLogin && showNameField && (
						<div className='space-y-2'>
							<Label htmlFor='name'>
								{t.authDialog.nameLabel}
							</Label>
								<Input
									id='name'
									type='text'
									autoComplete='name'
									required
									aria-invalid={Boolean(errors.name)}
									aria-describedby={errors.name ? 'name-error' : undefined}
									placeholder={t.authDialog.namePlaceholder}
									className='border-input bg-background/70'
									{...register('name')}
								/>
								{errors.name && (
									<p id='name-error' role='alert' className='text-xs text-destructive'>
										{errors.name.message}
									</p>
								)}
						</div>
					)}
					<div className='space-y-2'>
						<Label htmlFor='email'>
							{t.authDialog.emailLabel}
						</Label>
							<Input
								id='email'
								type='email'
								inputMode='email'
								autoComplete='email'
								required
								aria-invalid={Boolean(errors.email)}
								aria-describedby={errors.email ? 'email-error' : undefined}
								placeholder='your@email.com'
								className='border-input bg-background/70'
								{...register('email')}
							/>
							{errors.email && (
								<p id='email-error' role='alert' className='text-xs text-destructive'>
									{errors.email.message}
								</p>
							)}
					</div>
					<div className='space-y-2'>
						<Label htmlFor='password'>
							{t.authDialog.passwordLabel}
						</Label>
						{/* The eye toggle is positioned against this wrapper, which holds
						    only the input — so the "Forgot password?" link below can no
						    longer push its vertical centre off. */}
						<div className='relative'>
								<Input
									id='password'
									type={showPassword ? 'text' : 'password'}
									autoComplete={isLogin ? 'current-password' : 'new-password'}
									required
									aria-invalid={Boolean(errors.password)}
									aria-describedby={
										errors.password ? 'password-error' : undefined
									}
									placeholder='••••••••'
									className='border-input bg-background/70 pr-10'
									{...register('password')}
								/>
								<button
									type='button'
									className='absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
								onClick={() => setShowPassword(!showPassword)}
								aria-label={showPassword ? t.authDialog.hidePassword : t.authDialog.showPassword}
							>
								{showPassword ? (
									<EyeOff className='w-5 h-5' />
								) : (
									<Eye className='w-5 h-5' />
								)}
							</button>
							</div>
							{errors.password && (
								<p
									id='password-error'
									role='alert'
									className='text-xs text-destructive'
								>
									{errors.password.message}
								</p>
							)}
							{isLogin && (
								<div className='text-right'>
								<Link
									href='/forgot-password'
									className='text-xs text-muted-foreground transition-colors hover:text-primary'
								>
									{t.authDialog.forgotPassword}
								</Link>
							</div>
						)}
					</div>
					{!isLogin && (
						<div className='flex items-start space-x-3 pt-2'>
							<Checkbox
								id='privacy'
								checked={agreedToPrivacy}
								onCheckedChange={checked => setAgreedToPrivacy(!!checked)}
								aria-describedby='legal-consent-version'
								className='mt-0.5 border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary'
							/>
							<div className='text-sm leading-5 text-muted-foreground'>
								<p>
									<Label
										htmlFor='privacy'
										className='cursor-pointer font-normal text-muted-foreground'
									>
										{authCopy.consentPrefix}
									</Label>{' '}
									<Link
										href='/legal/terms'
										target='_blank'
										rel='noreferrer'
										className='font-medium text-foreground underline underline-offset-4'
									>
										{authCopy.termsLink}
									</Link>{' '}
									{authCopy.consentAnd}{' '}
									<Link
										href='/legal/privacy'
										target='_blank'
										rel='noreferrer'
										className='font-medium text-foreground underline underline-offset-4'
									>
										{authCopy.privacyLink}
									</Link>
								</p>
								<p
									id='legal-consent-version'
									className='mt-1 text-xs text-muted-foreground'
								>
									{authCopy.consentVersion.replace(
										'{version}',
										CURRENT_LEGAL_VERSION
									)}
								</p>
							</div>
						</div>
					)}
					{children}
					<DialogFooter className='flex flex-col gap-4 mt-2'>
						<Button
							type='submit'
							disabled={isLoading || (!isLogin && !agreedToPrivacy)}
							className={`w-full ${
								(!isLogin && !agreedToPrivacy) || isLoading
									? 'cursor-not-allowed bg-muted text-muted-foreground'
									: 'bg-primary text-primary-foreground hover:bg-primary/90'
							} py-5 shadow-sm`}
						>
							{isLoading ? (
								<span className='flex items-center justify-center'>
									<svg
										className='-ml-1 mr-3 h-5 w-5 animate-spin'
										xmlns='http://www.w3.org/2000/svg'
										fill='none'
										viewBox='0 0 24 24'
									>
										<circle
											className='opacity-25'
											cx='12'
											cy='12'
											r='10'
											stroke='currentColor'
											strokeWidth='4'
										></circle>
										<path
											className='opacity-75'
											fill='currentColor'
											d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
										></path>
									</svg>
									{isLogin ? t.authDialog.loggingIn : t.authDialog.signingUp}
								</span>
							) : isLogin ? (
								t.authDialog.logIn
							) : (
								t.authDialog.createAccount
							)}
						</Button>
						<div className='w-full text-center'>
							<button
								type='button'
								className='text-sm text-primary underline-offset-4 hover:underline'
								onClick={handleModeToggle}
							>
								{isLogin
									? t.authDialog.noAccount
									: t.authDialog.haveAccount}
							</button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
