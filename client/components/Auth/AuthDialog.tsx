'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { m } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { IAuthDialog } from '@/components/Auth/AuthDialog.interface'
import { Eye, EyeOff } from '@/components/ui/icons'
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
import { IFormData } from '@/services/auth/auth.types'

type AuthMode = 'login' | 'register' | 'forgot' | 'reset' | 'verify'

const URL_AUTH_MODES = new Set<AuthMode>(['forgot', 'reset', 'verify'])

export function AuthDialog({
	triggerButton: triggerButtonProp,
	dialogSize = 'md',
	title = 'SafeNet',
	description: descriptionProp,
	showNameField = true,
	urlDriven = false,
	children,
}: IAuthDialog) {
	const { t, locale } = useI18n()
	const router = useRouter()
	const searchParams = useSearchParams()
	const queryClient = useQueryClient()
	const { user } = useProfile()
	const authCopy = legalMessages[locale].auth
	const [open, setOpen] = useState(false)
	const [mode, setMode] = useState<AuthMode>('login')
	const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmation, setConfirmation] = useState('')
	const [message, setMessage] = useState<string | null>(null)
	const titleRef = useRef<HTMLHeadingElement>(null)
	const token = searchParams.get('token') ?? ''
	const isLogin = mode === 'login'
	const isRegister = mode === 'register'
	const isRussian = locale === 'ru'
	const triggerButton = triggerButtonProp ?? {
		text: t.authDialog.defaultTriggerText,
		className:
			'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-2 group',
		position: 'end' as const,
	}
	const description = descriptionProp ?? t.authDialog.defaultDescription

	useEffect(() => {
		if (!urlDriven) return
		const requestedMode = searchParams.get('auth')
		if (!requestedMode || !URL_AUTH_MODES.has(requestedMode as AuthMode)) return
		const frame = window.requestAnimationFrame(() => {
			setMode(requestedMode as AuthMode)
			setOpen(true)
		})
		return () => window.cancelAnimationFrame(frame)
	}, [searchParams, urlDriven])

	const schema = useMemo(
		() =>
			z
				.object({
					name: z.string().trim().optional(),
					email: z.string().trim().min(1, authCopy.emailRequired).email(authCopy.emailInvalid),
					password: z
						.string()
						.min(1, authCopy.passwordRequired)
						.min(isLogin ? 6 : 8, isLogin ? authCopy.loginPasswordTooShort : authCopy.passwordTooShort),
				})
				.superRefine((values, ctx) => {
					if (isRegister && showNameField && !values.name?.trim()) {
						ctx.addIssue({ code: 'custom', path: ['name'], message: authCopy.nameRequired })
					}
				}),
		[authCopy, isLogin, isRegister, showNameField]
	)
	const { register, handleSubmit, reset, formState: { errors } } = useForm<IFormData>({
		resolver: zodResolver(schema),
		mode: 'onBlur',
	})
	const resetUi = () => {
		reset()
		setEmail('')
		setPassword('')
		setConfirmation('')
		setMessage(null)
		setAgreedToPrivacy(false)
		setShowPassword(false)
	}
	const selectMode = (nextMode: AuthMode) => {
		resetUi()
		setMode(nextMode)
	}
	const close = () => {
		setOpen(false)
		resetUi()
		if (urlDriven) router.replace('/')
	}

	const login = useMutation({
		mutationFn: (data: IFormData) => authService.main('login', data),
		onSuccess: async () => {
			await queryClient.cancelQueries()
			queryClient.clear()
			toast.success(t.authDialog.toasts.loggedIn)
			setOpen(false)
			router.push('/dashboard')
		},
		onError: () => toast.error(t.authDialog.toasts.loginError),
	})
	const registerAccount = useMutation({
		mutationFn: (data: IFormData) => authService.main('register', data),
		onSuccess: () => {
			toast.success(isRussian ? 'Аккаунт создан. Проверьте email.' : 'Account created. Check your email.')
			selectMode('verify')
		},
		onError: () => toast.error(t.authDialog.toasts.registerError),
	})
	const forgotPassword = useMutation({
		mutationFn: () => authService.forgotPassword(email.trim()),
		onSuccess: response => setMessage(response.message),
		onError: () => toast.error(t.forgotPassword.requestFailed),
	})
	const resetPassword = useMutation({
		mutationFn: () => authService.resetPassword(token, password),
		onSuccess: async response => {
			await queryClient.cancelQueries()
			queryClient.clear()
			toast.success(response.message)
			router.replace('/')
			selectMode('login')
		},
		onError: () => toast.error(t.resetPassword.errors.invalidToken),
	})
	const verifyEmail = useMutation({
		mutationFn: () => authService.verifyEmail(token),
		onSuccess: async response => {
			await queryClient.cancelQueries()
			queryClient.clear()
			toast.success(response.message)
			setOpen(false)
			router.push('/dashboard')
		},
		onError: () => toast.error(isRussian ? 'Ссылка недействительна или истекла.' : 'This link is invalid or expired.'),
	})
	const resendVerification = useMutation({
		mutationFn: () => authService.resendVerification(email.trim()),
		onSuccess: response => setMessage(response.message),
		onError: () => toast.error(isRussian ? 'Не удалось отправить письмо.' : 'Could not send the email.'),
	})

	const onSubmit: SubmitHandler<IFormData> = data => {
		if (isRegister && !agreedToPrivacy) {
			toast.error(t.authDialog.toasts.agreeRequired)
			return
		}
		if (isLogin) login.mutate({ email: data.email, password: data.password })
		else registerAccount.mutate({
			name: data.name,
			email: data.email,
			password: data.password,
			termsAccepted: true,
			privacyAccepted: true,
			legalVersion: CURRENT_LEGAL_VERSION,
			legalLocale: locale,
		})
	}
	const specialTitle = {
		forgot: t.forgotPassword.title,
		reset: t.resetPassword.form.title,
		verify: isRussian ? 'Подтвердите email' : 'Verify your email',
	}[mode as 'forgot' | 'reset' | 'verify']

	return (
		<Dialog open={open} onOpenChange={nextOpen => nextOpen ? setOpen(true) : close()}>
			{!urlDriven && (
				<m.button type='button' className={triggerButton.className} onClick={() => user?.isLoggedIn ? router.push('/dashboard') : setOpen(true)} whileHover={triggerButton.smoothMotion ? { y: -3, scale: 1.015 } : undefined} whileTap={triggerButton.smoothMotion ? { y: 0, scale: 0.985 } : undefined} transition={{ duration: MOTION.hover, ease: MOTION.ease }}>
					{triggerButton.position === 'start' && triggerButton.icon && <span className='mr-2'>{triggerButton.icon}</span>}
					{triggerButton.text}
					{triggerButton.position === 'end' && triggerButton.icon && <span className='ml-2'>{triggerButton.icon}</span>}
				</m.button>
			)}
			<DialogContent className={`${dialogSize === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-md'} border border-border bg-popover text-popover-foreground shadow-2xl`} onOpenAutoFocus={event => { event.preventDefault(); titleRef.current?.focus({ preventScroll: true }) }}>
				<DialogHeader className='text-center'>
					<DialogTitle ref={titleRef} tabIndex={-1} className='text-2xl font-semibold tracking-tight text-foreground outline-none'>
						{mode === 'login' ? t.authDialog.logInToTemplate.replace('{title}', title) : mode === 'register' ? t.authDialog.signUpForTemplate.replace('{title}', title) : specialTitle}
					</DialogTitle>
					<DialogDescription className='mt-2 text-muted-foreground'>
						{mode === 'login' ? description : mode === 'register' ? t.authDialog.createAccountTemplate.replace('{title}', title) : mode === 'forgot' ? t.forgotPassword.subtitle : mode === 'reset' ? t.resetPassword.form.title : isRussian ? 'Откройте ссылку из письма, чтобы активировать аккаунт.' : 'Open the email link to activate your account.'}
					</DialogDescription>
				</DialogHeader>

				{(isLogin || isRegister) && <form className='mt-4 space-y-4' onSubmit={handleSubmit(onSubmit)}>
					{isRegister && showNameField && <Field label={t.authDialog.nameLabel} error={errors.name?.message}><Input autoComplete='name' {...register('name')} /></Field>}
					<Field label={t.authDialog.emailLabel} error={errors.email?.message}><Input type='email' autoComplete='email' {...register('email')} /></Field>
					<Field label={t.authDialog.passwordLabel} error={errors.password?.message}><div className='relative'><Input type={showPassword ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} className='pr-10' {...register('password')} /><button type='button' onClick={() => setShowPassword(value => !value)} className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground' aria-label={showPassword ? t.authDialog.hidePassword : t.authDialog.showPassword}>{showPassword ? <EyeOff className='size-5' /> : <Eye className='size-5' />}</button></div></Field>
					{isLogin && <button type='button' onClick={() => selectMode('forgot')} className='block w-full text-right text-xs text-muted-foreground hover:text-primary'>{t.authDialog.forgotPassword}</button>}
					{isRegister && <div className='flex items-start space-x-3 pt-2'><Checkbox id='privacy' checked={agreedToPrivacy} onCheckedChange={checked => setAgreedToPrivacy(Boolean(checked))} /><Label htmlFor='privacy' className='text-sm font-normal leading-5 text-muted-foreground'>{authCopy.consentPrefix} <Link href='/legal/terms' target='_blank' className={isRussian ? 'underline' : 'whitespace-nowrap underline'}>{authCopy.termsLink}</Link> {authCopy.consentAnd} <Link href='/legal/privacy' target='_blank' className={isRussian ? 'underline' : 'whitespace-nowrap underline'}>{authCopy.privacyLink}</Link></Label></div>}
					{children}
					<DialogFooter className='mt-2 flex flex-col gap-4'><Button type='submit' disabled={login.isPending || registerAccount.isPending || (isRegister && !agreedToPrivacy)} className='w-full py-5'>{login.isPending || registerAccount.isPending ? (isLogin ? t.authDialog.loggingIn : t.authDialog.signingUp) : isLogin ? t.authDialog.logIn : t.authDialog.createAccount}</Button><button type='button' className='text-sm text-primary hover:underline' onClick={() => selectMode(isLogin ? 'register' : 'login')}>{isLogin ? t.authDialog.noAccount : t.authDialog.haveAccount}</button></DialogFooter>
				</form>}

				{mode === 'forgot' && <ActionPanel email={email} setEmail={setEmail} message={message} loading={forgotPassword.isPending} button={t.forgotPassword.send} onSubmit={event => { event.preventDefault(); forgotPassword.mutate() }} back={() => selectMode('login')} backLabel={t.authDialog.logIn} />}
				{mode === 'verify' && <ActionPanel email={email} setEmail={setEmail} message={message} loading={resendVerification.isPending} button={isRussian ? 'Отправить письмо повторно' : 'Resend verification email'} onSubmit={event => { event.preventDefault(); resendVerification.mutate() }} back={() => selectMode('login')} backLabel={t.authDialog.logIn}>{token && <Button className='w-full' disabled={verifyEmail.isPending} onClick={() => verifyEmail.mutate()}>{verifyEmail.isPending ? (isRussian ? 'Подтверждение…' : 'Verifying…') : isRussian ? 'Подтвердить email' : 'Verify email'}</Button>}</ActionPanel>}
				{mode === 'reset' && <form className='mt-6 space-y-4' onSubmit={event => { event.preventDefault(); if (password.length < 8) return toast.error(t.resetPassword.errors.tooShort); if (password !== confirmation) return toast.error(t.resetPassword.errors.mismatch); resetPassword.mutate() }}><Input type='password' required value={password} onChange={event => setPassword(event.target.value)} placeholder={t.resetPassword.form.passwordPlaceholder} autoComplete='new-password' /><Input type='password' required value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder={t.resetPassword.form.confirmPlaceholder} autoComplete='new-password' /><Button type='submit' disabled={!token || resetPassword.isPending} className='w-full'>{resetPassword.isPending ? t.resetPassword.form.submitting : t.resetPassword.form.submit}</Button><button type='button' className='w-full text-sm text-primary hover:underline' onClick={() => selectMode('forgot')}>{t.forgotPassword.title}</button></form>}
			</DialogContent>
		</Dialog>
	)
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
	return <div className='space-y-2'><Label>{label}</Label>{children}{error && <p role='alert' className='text-xs text-destructive'>{error}</p>}</div>
}

function ActionPanel({ email, setEmail, message, loading, button, onSubmit, back, backLabel, children }: { email: string; setEmail: (value: string) => void; message: string | null; loading: boolean; button: string; onSubmit: (event: React.FormEvent) => void; back: () => void; backLabel: string; children?: React.ReactNode }) {
	return <form className='mt-6 space-y-4' onSubmit={onSubmit}>{children}{message && <p className='rounded-lg bg-muted p-3 text-sm text-muted-foreground'>{message}</p>}<Input type='email' required value={email} onChange={event => setEmail(event.target.value)} placeholder='you@example.com' autoComplete='email' /><Button type='submit' variant='outline' disabled={loading} className='w-full'>{button}</Button><button type='button' onClick={back} className='w-full text-sm text-primary hover:underline'>{backLabel}</button></form>
}
