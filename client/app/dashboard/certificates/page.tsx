'use client'

import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/config/pages-url.config'
import { useCourses } from '@/hooks/learning/useCourses'
import { useI18n } from '@/i18n/LocaleProvider'
import { selectPlural } from '@/i18n/plural'
import { cn } from '@/lib/utils'
import {
	ICertificateListItem,
	learningService,
} from '@/services/learning/learning.service'
import { formatDate } from '@/utils/date-time/dateFormatter'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, m } from 'framer-motion'
import {
	ArrowRight,
	Award,
	BookOpen,
	Calendar,
	CheckCircle2,
	ExternalLink,
	Hash,
	Shield,
	Sparkles,
	Target,
	TrendingUp,
	Zap,
	type AppIcon,
} from '@/components/ui/icons'
import Link from 'next/link'
import { useMemo, useState } from 'react'

export default function CertificatesPage() {
	const { locale, t } = useI18n()
	const { data: certificates, isLoading } = useQuery({
		queryKey: ['user', 'certificates'],
		queryFn: () => learningService.getUserCertificates(),
	})

	const [hoveredCard, setHoveredCard] = useState<string | null>(null)
	const hasCertificates = certificates && certificates.length > 0

	const { courses: activeCourses } = useCourses('active')
	const { courses: completedCourses } = useCourses('completed')

	const stats = useMemo(() => {
		const allCourses = [...activeCourses, ...completedCourses]
		return { totalXP: allCourses.reduce((sum, c) => sum + (c.totalXp || 0), 0) }
	}, [activeCourses, completedCourses])

	if (isLoading) {
		return (
			<div className='space-y-6 sm:space-y-8'>
				<Skeleton className='h-8 sm:h-10 w-48 sm:w-64 rounded-xl bg-white/5' />
				<Skeleton className='h-80 rounded-3xl bg-white/5' />
				<div className='grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{[...Array(3)].map((_, i) => (
						<Skeleton key={i} className='h-80 rounded-3xl bg-white/5' />
					))}
				</div>
			</div>
		)
	}

	return (
		<div className='space-y-6 sm:space-y-8 lg:space-y-12'>
			<Breadcrumb
				showBackButton
				items={[
					{
						label: t.dashboardCertificates.breadcrumb,
						href: ROUTES.CERTIFICATES,
					},
				]}
			/>

			{/* Hero Section */}
			<m.section
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className='relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-br from-white/5 via-white/3 to-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12'
			>
				{/* Animated background */}
				<div className='absolute inset-0 bg-linear-to-r from-white/2 via-transparent to-white/2' />
				<div className='absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl' />
				<div className='absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl' />

				<div className='relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center'>
					{/* Left Content */}
					<div className='lg:col-span-3 space-y-5 sm:space-y-6'>
						<m.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className='flex items-center gap-4'
						>
							<h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-white leading-tight tracking-tight'>
								{t.dashboardCertificates.title}
							</h1>
						</m.div>

						<m.p
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className='text-base sm:text-lg lg:text-xl text-white/70 max-w-2xl leading-relaxed'
						>
							{hasCertificates
								? t.dashboardCertificates.subtitleTemplate
										.replace('{count}', String(certificates.length))
										.replace(
											'{certificateWord}',
											selectPlural(locale, certificates.length, {
												one: t.dashboardCertificates.certificateWordOne,
												few: t.dashboardCertificates.certificateWordFew,
												many: t.dashboardCertificates.certificateWordMany,
											})
										)
								: t.dashboardCertificates.subtitleEmpty}
						</m.p>

						{hasCertificates && (
							<m.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.3 }}
								className='flex flex-wrap items-center gap-3 pt-2'
							>
								<Badge className='bg-emerald-500/10 backdrop-blur-sm border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm font-semibold'>
									<CheckCircle2 className='w-4 h-4 mr-1.5' />
									{t.dashboardCertificates.allActive}
								</Badge>
								<div className='flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10'>
									<Zap className='w-4 h-4 text-yellow-400' />
									{t.dashboardCertificates.xpTemplate.replace(
										'{xp}',
										String(stats.totalXP)
									)}
								</div>
							</m.div>
						)}
					</div>

					{/* Right Content - Stats Grid */}
					<div className='lg:col-span-2'>
						{hasCertificates ? (
							<m.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								className='grid grid-cols-2 gap-3 sm:gap-4'
							>
								<StatCard
									icon={Award}
									value={certificates.length}
									label={t.dashboardCertificates.stats.certificates}
									color='yellow'
									delay={0.1}
								/>
								<StatCard
									icon={TrendingUp}
									value={certificates.length}
									label={t.dashboardCertificates.stats.coursesCompleted}
									color='blue'
									delay={0.15}
								/>
								<StatCard
									icon={Shield}
									value={certificates.length * 5}
									label={t.dashboardCertificates.stats.skills}
									color='green'
									delay={0.2}
								/>
								<StatCard
									icon={Target}
									value='100%'
									label={t.dashboardCertificates.stats.completed}
									color='purple'
									delay={0.25}
								/>
							</m.div>
						) : (
							<m.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5, delay: 0.2 }}
								className='text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10'
							>
								<Award className='w-16 h-16 mx-auto mb-4 text-white/20' />
								<p className='text-base text-white/60 mb-6'>
									{t.dashboardCertificates.emptyStats.title}
								</p>
								<Button
									asChild
									size='lg'
									className='h-12 rounded-2xl bg-white text-black hover:bg-white/80 font-bold shadow-2xl'
								>
									<Link href={ROUTES.COURSES}>
										<BookOpen className='w-5 h-5 mr-2' />
										{t.dashboardCertificates.emptyStats.cta}
									</Link>
								</Button>
							</m.div>
						)}
					</div>
				</div>

				{hasCertificates && (
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className='relative z-10 mt-8 pt-8 border-t border-white/10'
					>
						<Button
							asChild
							size='lg'
							// variant='outline'
							className='w-full sm:w-auto h-12 sm:h-14 rounded-xl sm:rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-sm font-semibold text-white group transition-all duration-300'
						>
							<Link href={ROUTES.COURSES}>
								<Sparkles className='w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300' />
								{t.dashboardCertificates.continueLearning}
								<ArrowRight className='w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300' />
							</Link>
						</Button>
					</m.div>
				)}
			</m.section>

			{/* Certificates Grid */}
			<AnimatePresence mode='wait'>
				{hasCertificates ? (
					<m.div
						key='certificates-grid'
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.4 }}
						className='grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3'
					>
						{certificates.map((certificate, index) => (
							<CertificateCard
								key={certificate.id}
								certificate={certificate}
								index={index}
								isHovered={hoveredCard === certificate.id}
								onHover={setHoveredCard}
							/>
						))}
					</m.div>
				) : (
					<m.div
						key='empty-state'
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.4 }}
					>
						<Card className='relative rounded-3xl overflow-hidden border border-white/10 bg-white/3 backdrop-blur-2xl shadow-2xl'>
							<CardContent className='relative z-10 flex flex-col items-center justify-center p-12 sm:p-16 text-center space-y-6'>
								<m.div
									initial={{ scale: 0, rotate: -180 }}
									animate={{ scale: 1, rotate: 0 }}
									transition={{ type: 'spring', duration: 0.8 }}
									className='w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg'
								>
									<Award className='w-10 h-10 text-white/30' strokeWidth={2} />
								</m.div>

								<div className='space-y-3'>
									<h3 className='text-2xl sm:text-3xl font-black text-white'>
										{t.dashboardCertificates.emptyState.title}
									</h3>
									<p className='text-lg text-white/60 max-w-md leading-relaxed'>
										{t.dashboardCertificates.emptyState.subtitle}
									</p>
								</div>

								<Button
									asChild
									size='lg'
									className='mt-4 h-14 rounded-2xl bg-white text-black hover:bg-white/80 shadow-2xl font-bold text-base px-8'
								>
									<Link href={ROUTES.COURSES}>
										<BookOpen className='w-5 h-5 mr-2' />
										{t.dashboardCertificates.emptyState.cta}
									</Link>
								</Button>
							</CardContent>
						</Card>
					</m.div>
				)}
			</AnimatePresence>
		</div>
	)
}

// Stat Card Component
function StatCard({
	icon: Icon,
	label,
	value,
	color,
	delay,
}: {
		icon: AppIcon
	label: string
	value: number | string
	color: 'yellow' | 'blue' | 'green' | 'purple'
	delay: number
}) {
	const colorClasses = {
		yellow:
			'from-yellow-500/20 to-orange-500/20 border-yellow-500/20 text-yellow-400',
		blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20 text-blue-400',
		green:
			'from-green-500/20 to-emerald-500/20 border-green-500/20 text-green-400',
		purple:
			'from-purple-500/20 to-pink-500/20 border-purple-500/20 text-purple-400',
	}

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay }}
			className='group relative text-center p-4 sm:p-5 bg-white/2 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/5 hover:border-white/20 transition-all duration-300'
		>
			<div
				className={cn(
					'w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 rounded-xl bg-linear-to-br border flex items-center justify-center group-hover:scale-110 transition-transform duration-300',
					colorClasses[color]
				)}
			>
				<Icon className='w-5 h-5 sm:w-6 sm:h-6' strokeWidth={2.5} />
			</div>
			<div className='text-2xl sm:text-3xl font-black text-white mb-1'>
				{value}
			</div>
			<div className='text-xs sm:text-sm text-white/60 font-medium'>
				{label}
			</div>
		</m.div>
	)
}

// Certificate Card Component
function CertificateCard({
	certificate,
	index,
	isHovered,
	onHover,
}: {
		certificate: ICertificateListItem
	index: number
	isHovered: boolean
	onHover: (id: string | null) => void
}) {
	const { t } = useI18n()
	return (
		<m.div
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.5,
				delay: index * 0.1,
				ease: [0.22, 1, 0.36, 1],
			}}
			onHoverStart={() => onHover(certificate.id)}
			onHoverEnd={() => onHover(null)}
		>
			<Link
				href={`${ROUTES.CERTIFICATES}/${certificate.id}`}
				className='block group'
			>
				<Card className='relative h-full overflow-hidden bg-white/3 backdrop-blur-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-500 hover:shadow-2xl hover:shadow-white/10 hover:scale-[1.02] rounded-3xl'>
					{/* Glow effect on hover */}
					<div className='absolute inset-0 bg-linear-to-br from-yellow-500/0 to-orange-500/0 group-hover:from-yellow-500/5 group-hover:to-orange-500/5 transition-all duration-500' />

					<CardContent className='p-6 sm:p-8 relative z-10'>
						{/* Header with Icon */}
						<div className='flex items-start justify-between mb-6'>
							<m.div
								animate={
									isHovered
										? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1.1, 1] }
										: {}
								}
								transition={{ duration: 0.6 }}
								className='relative'
							>
								<div className='absolute inset-0 bg-yellow-400/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300' />
								<div className='relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center shadow-xl'>
									<Award
										className='w-7 h-7 sm:w-8 sm:h-8 text-yellow-400'
										strokeWidth={2.5}
									/>
								</div>
							</m.div>

							{/* Status badge */}
							<Badge className='bg-emerald-500/10 border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-xs font-semibold'>
								<CheckCircle2 className='w-3 h-3 mr-1' />
								{t.dashboardCertificates.card.active}
							</Badge>
						</div>

						{/* Title */}
						<h3 className='text-lg sm:text-xl font-black text-white group-hover:text-white/95 transition-colors mb-5 leading-tight line-clamp-2 min-h-[3.5rem]'>
							{certificate.courseTitle}
						</h3>

						{/* Meta Information */}
						<div className='space-y-3 mb-6'>
							<div className='flex items-center gap-2.5 text-white/60 group-hover:text-white/80 transition-colors duration-200'>
								<div className='w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0'>
									<Hash className='w-4 h-4' />
								</div>
								<span className='font-mono text-sm truncate'>
									{certificate.certificateNumber}
								</span>
							</div>

							<div className='flex items-center gap-2.5 text-white/60 group-hover:text-white/80 transition-colors duration-200'>
								<div className='w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0'>
									<Calendar className='w-4 h-4' />
								</div>
								<span className='text-sm'>
									{formatDate(certificate.issuedAt)}
								</span>
							</div>
						</div>

						{/* Action Button */}
						<div className='flex items-center justify-between pt-5 border-t border-white/10 group-hover:border-white/20 transition-colors duration-300'>
							<span className='text-sm font-bold text-white/80 group-hover:text-white transition-colors duration-300'>
								{t.dashboardCertificates.card.openCertificate}
							</span>
							<div className='w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-lg border border-white/10 shrink-0 bg-white/5 text-white group-hover:bg-white/10 group-hover:border-white/20 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500'>
								<ExternalLink className='w-5 h-5 sm:w-6 sm:h-6' />
							</div>
						</div>
					</CardContent>
				</Card>
			</Link>
		</m.div>
	)
}
