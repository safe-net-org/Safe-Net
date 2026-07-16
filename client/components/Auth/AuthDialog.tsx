'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Eye, EyeOff } from 'lucide-react'

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
import { useProfile } from '@/hooks/user/useProfile'
import authService from '@/services/auth/auth.service'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useEffect, useState, useTransition } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { IFormData } from '@/services/auth/auth.types'
import { toast } from 'sonner'
import { IAuthDialog } from './AuthDialog.interface'

export function AuthDialog({
	triggerButton = {
		text: 'Start Learning',
		className:
			'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-xl shadow-indigo-500/30 flex items-center gap-2 group',
		position: 'end',
	},
	dialogSize = 'md',
	title = 'SafeNet',
	description = 'Enter your details to log in or create an account',
	showNameField = true,
	children,
}: IAuthDialog) {
	const [open, setOpen] = useState(false)
	const [isLogin, setIsLogin] = useState(true)
	const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const { register, handleSubmit, reset } = useForm<IFormData>()
	const router = useRouter()
	const queryClient = useQueryClient()
	const [isPending, startTransition] = useTransition()
	const { user } = useProfile()
	const { mutate: mutateLogin, isPending: isLoginPending } = useMutation({
		mutationKey: ['login'],
		mutationFn: (data: IFormData) => authService.main('login', data),
		onSuccess() {
			toast.success('Successfully logged in!')
			startTransition(() => {
				reset()
				setOpen(false)
				queryClient.invalidateQueries({ queryKey: ['profile'] })
				router.push('/dashboard')
			})
		},
		onError(error) {
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data?.message || 'Login error')
			}
		},
	})
	const { mutate: mutateRegister, isPending: isRegisterPending } = useMutation({
		mutationKey: ['register'],
		mutationFn: (data: IFormData) => authService.main('register', data),
		onSuccess() {
			toast.success('Account successfully created!')
			startTransition(() => {
				reset()
				setOpen(false)
				queryClient.invalidateQueries({ queryKey: ['profile'] })
				router.push('/dashboard')
			})
		},
		onError(error) {
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data?.message || 'Registration error')
			}
		},
	})
	const isLoading = isPending || isLoginPending || isRegisterPending
	useEffect(() => {
		reset()
		setAgreedToPrivacy(false)
		setShowPassword(false)
	}, [isLogin, reset])
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
			toast.error('Please agree to the processing of personal data')
			return
		}
		isLogin ? mutateLogin(data) : mutateRegister(data)
	}
	const handleTriggerClick = () => {
		if (user?.isLoggedIn) {
			router.push('/dashboard')
		} else {
			setOpen(true)
		}
	}
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<button
				type='button'
				className={triggerButton.className}
				onClick={handleTriggerClick}
			>
				{triggerButton.position === 'start' && triggerButton.icon && (
					<span className='mr-2'>{triggerButton.icon}</span>
				)}
				{triggerButton.text}
				{triggerButton.position === 'end' && triggerButton.icon && (
					<span className='ml-2'>{triggerButton.icon}</span>
				)}
			</button>
			<DialogContent
				className={`${sizeClasses[dialogSize]} bg-linear-to-b from-slate-900 to-slate-800 border border-slate-700 text-slate-100`}
			>
				<DialogHeader className='text-center'>
					<DialogTitle className='text-2xl font-bold bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'>
						{isLogin ? `Log in to ${title}` : `Sign up for ${title}`}
					</DialogTitle>
					<DialogDescription className='text-slate-400 mt-2'>
						{isLogin
							? description
							: `Create an account to start learning with ${title}`}
					</DialogDescription>
				</DialogHeader>
				<form className='space-y-4 mt-4' onSubmit={handleSubmit(onSubmit)}>
					{!isLogin && showNameField && (
						<div className='space-y-2'>
							<Label htmlFor='name' className='text-slate-300'>
								Name
							</Label>
							<Input
								id='name'
								type='text'
								placeholder='Enter your name'
								className='bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
								{...register('name')}
							/>
						</div>
					)}
					<div className='space-y-2'>
						<Label htmlFor='email' className='text-slate-300'>
							Email
						</Label>
						<Input
							id='email'
							type='email'
							placeholder='your@email.com'
							className='bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
							{...register('email')}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='password' className='text-slate-300'>
							Password
						</Label>
						{/* The eye toggle is positioned against this wrapper, which holds
						    only the input — so the "Forgot password?" link below can no
						    longer push its vertical centre off. */}
						<div className='relative'>
							<Input
								id='password'
								type={showPassword ? 'text' : 'password'}
								placeholder='••••••••'
								className='bg-slate-800/50 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 pr-10'
								{...register('password')}
							/>
							<button
								type='button'
								className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors'
								onClick={() => setShowPassword(!showPassword)}
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? (
									<EyeOff className='w-5 h-5' />
								) : (
									<Eye className='w-5 h-5' />
								)}
							</button>
						</div>
						{isLogin && (
							<div className='text-right'>
								<Link
									href='/forgot-password'
									className='text-xs text-slate-400 hover:text-indigo-400 transition-colors'
								>
									Forgot password?
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
								className='mt-0.5 border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600'
							/>
							<div className='text-sm leading-5'>
								<Label
									htmlFor='privacy'
									className='text-slate-400 cursor-pointer'
								>
									I agree to the processing of personal data
								</Label>
								<p className='text-xs text-slate-500 mt-1'>
									I accept the terms of the user agreement and privacy
									policy
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
									? 'bg-slate-700 cursor-not-allowed'
									: 'bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
							} text-white shadow-md py-5`}
						>
							{isLoading ? (
								<span className='flex items-center justify-center'>
									<svg
										className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
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
									{isLogin ? 'Logging in...' : 'Signing up...'}
								</span>
							) : isLogin ? (
								'Log In'
							) : (
								'Create Account'
							)}
						</Button>
						<div className='w-full text-center'>
							<button
								type='button'
								className='text-sm text-indigo-400 hover:text-indigo-300 hover:underline'
								onClick={() => setIsLogin(!isLogin)}
							>
								{isLogin
									? "Don't have an account? Sign up"
									: 'Already have an account? Log in'}
							</button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
