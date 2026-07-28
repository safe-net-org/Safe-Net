'use client'

import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { m } from 'framer-motion'
import {
	ChevronLeft,
	ChevronRight,
	AppIcon,
	MoreHorizontal,
} from '@/components/ui/icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo } from 'react'

export interface BreadcrumbItem {
	label: string
	href?: string
	icon?: AppIcon
}

interface BreadcrumbProps {
	items: BreadcrumbItem[]
	showBackButton?: boolean
	isLoading?: boolean
	className?: string
}

export const Breadcrumb = memo(
	({
		items,
		showBackButton = false,
		isLoading = false,
		className,
	}: BreadcrumbProps) => {
		const router = useRouter()

		if (isLoading) {
			return (
				<div className={cn('flex items-center gap-2 sm:gap-3', className)}>
					{showBackButton && (
						<Skeleton className='h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/5' />
					)}
					<div className='flex items-center gap-2'>
						<Skeleton className='h-4 w-20 sm:w-32 rounded-lg bg-white/5' />
						<ChevronRight className='h-3.5 w-3.5 text-white/20' />
						<Skeleton className='h-4 w-24 sm:w-40 rounded-lg bg-white/5' />
					</div>
				</div>
			)
		}

		const renderBreadcrumbItem = (
			item: BreadcrumbItem,
			index: number,
			isInDropdown = false
		) => {
			const isLast = index === items.length - 1
			const Icon = item.icon

			if (isInDropdown && item.href) {
				return (
					<DropdownMenuItem key={index} asChild>
						<Link
							href={item.href}
							className='flex items-center gap-2 cursor-pointer'
						>
							{Icon && <Icon className='h-4 w-4 opacity-70' />}
							<span>{item.label}</span>
						</Link>
					</DropdownMenuItem>
				)
			}

			return (
				<div key={index} className='flex items-center gap-2'>
					{item.href && !isLast ? (
						<Link
							href={item.href}
							className='group flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-foreground'
						>
							{Icon && (
								<Icon className='h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity' />
							)}
							<span className='truncate max-w-[120px] sm:max-w-none'>
								{item.label}
							</span>
						</Link>
					) : (
						<div className='flex items-center gap-1.5'>
							{Icon && (
								<Icon
									className={cn(
										'h-4 w-4',
										isLast ? 'opacity-100' : 'opacity-70'
									)}
								/>
							)}
							<span
								className={cn(
									'truncate max-w-[120px] sm:max-w-none',
								isLast && 'text-foreground font-semibold'
								)}
							>
								{item.label}
							</span>
						</div>
					)}

					{!isLast && (
						<ChevronRight className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
					)}
				</div>
			)
		}

		const lastItem = items[items.length - 1]
		const LastIcon = lastItem?.icon
		const middleItems = items.slice(1, -1)

		return (
			<m.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, ease: 'easeOut' }}
				className={cn('flex items-center gap-2 sm:gap-3', className)}
			>
				{showBackButton && (
					<Button
						variant='ghost'
						size='sm'
						onClick={() => router.back()}
						className='h-9 w-9 sm:h-10 sm:w-10 p-0 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 group shadow-sm shrink-0 transition-all duration-300'
					>
						<ChevronLeft className='w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground group-hover:-translate-x-1 transition-all duration-300' />
					</Button>
				)}

				<nav
					className='flex items-center gap-2 overflow-hidden text-xs font-medium text-muted-foreground sm:text-sm'
					aria-label='Breadcrumb'
				>
					{items.length <= 2 ? (
						items.map((item, index) => renderBreadcrumbItem(item, index))
					) : (
						<>
							{/* Desktop: show all items */}
							<div className='hidden md:flex md:items-center md:gap-2'>
								{items.map((item, index) => renderBreadcrumbItem(item, index))}
							</div>

							{/* Mobile: first + dropdown + last */}
							<div className='flex md:hidden items-center gap-2'>
								{/* First item */}
								{renderBreadcrumbItem(items[0], 0)}

								{/* Dropdown for hidden items */}
								{middleItems.length > 0 && (
									<>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant='ghost'
													size='sm'
													className='h-6 w-6 p-0 hover:bg-white/10 rounded-lg transition-colors'
												>
														<MoreHorizontal className='h-4 w-4 text-muted-foreground' />
													<span className='sr-only'>
														Show hidden items
													</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align='start'
												className='bg-black/95 backdrop-blur-xl border-white/10'
											>
												{middleItems.map((item, index) =>
													renderBreadcrumbItem(item, index + 1, true)
												)}
											</DropdownMenuContent>
										</DropdownMenu>

										<ChevronRight className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
									</>
								)}

								{/* Last item */}
								<div className='flex items-center gap-1.5 min-w-0'>
									{LastIcon && (
										<LastIcon className='h-4 w-4 opacity-100 shrink-0' />
									)}
									<span className='truncate font-semibold text-foreground'>
										{lastItem.label}
									</span>
								</div>
							</div>
						</>
					)}
				</nav>
			</m.div>
		)
	}
)

Breadcrumb.displayName = 'Breadcrumb'
