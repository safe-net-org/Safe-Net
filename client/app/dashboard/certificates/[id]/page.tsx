'use client'

import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/config/pages-url.config'
import { useCertificateDetail } from '@/hooks/learning/useCertificateDetail'
import { DifficultyLabel } from '@/services/learning/learning.types'
import { formatDate } from '@/utils/date-time/dateFormatter'
import { m } from 'framer-motion'
import {
    Award,
    Calendar,
    CheckCircle2,
    Hash,
    Shield,
    Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CertificatePage() {
	const { certificate, isLoading, isError } = useCertificateDetail()

	if (isLoading) return <CertificateSkeleton />
	if (isError || !certificate) return <CertificateNotFound />

	return (
		<div className='space-y-6 sm:space-y-8'>
			<Breadcrumb
				showBackButton
				items={[
					{
						label: 'Certificates',
						href: ROUTES.CERTIFICATES,
					},
					{ label: certificate.course.title },
				]}
			/>

			{/* Certificate Card */}
			<m.section
				initial={{ opacity: 0, y: 30 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='certificate-container relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl'
				style={{
					minHeight: '842px',
					background:
						'linear-gradient(135deg, #0A0F1D 0%, #1a1f3a 50%, #0A0F1D 100%)',
				}}
				aria-label='Course completion certificate'
			>
				{/* Animated background gradient */}
				<div className='absolute inset-0 opacity-20 pointer-events-none'>
					<div className='absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl' />
					<div className='absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl' />
				</div>

				{/* Decorative corners */}
				<div className='absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-white/20 rounded-tl-3xl pointer-events-none' />
				<div className='absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-white/20 rounded-tr-3xl pointer-events-none' />
				<div className='absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-white/20 rounded-bl-3xl pointer-events-none' />
				<div className='absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-white/20 rounded-br-3xl pointer-events-none' />

				<div className='relative z-10 p-12 sm:p-16 md:p-20 space-y-10 sm:space-y-12'>
					{/* Header Icon */}
					<m.div
						initial={{ scale: 0, rotate: -180 }}
						animate={{ scale: 1, rotate: 0 }}
						transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
						className='flex justify-center'
					>
						<div className='relative'>
							<div className='absolute inset-0 bg-linear-to-br from-yellow-400 to-orange-500 rounded-3xl blur-xl opacity-50' />
							<div className='relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl'>
								<Award
									className='w-10 h-10 sm:w-12 sm:h-12 text-white'
									strokeWidth={2.5}
								/>
							</div>
						</div>
					</m.div>

					{/* Title Section */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className='text-center space-y-4 sm:space-y-5'
					>
						<div className='space-y-2'>
							<h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-white to-white/80 tracking-tight leading-tight'>
								CERTIFICATE
							</h1>
							<div className='flex justify-center'>
								<div className='h-1 w-32 bg-linear-to-r from-transparent via-white/50 to-transparent rounded-full' />
							</div>
						</div>

						<div className='inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg'>
							<Shield className='w-4 h-4 text-blue-400' />
							<p className='text-sm sm:text-base text-white/80 font-semibold'>
								of successful course completion
							</p>
						</div>
					</m.div>

					{/* User Name Section */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className='text-center space-y-5'
					>
						<p className='text-sm sm:text-base text-white/60 font-light uppercase tracking-wider'>
							This is to certify that
						</p>

						<div className='relative inline-block'>
							<div className='absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl' />
							<div className='relative px-8 sm:px-12 py-5 sm:py-6 bg-white/5 backdrop-blur-2xl rounded-3xl border-2 border-white/20 shadow-2xl'>
								<h2 className='text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-400 to-blue-400'>
									{certificate.user.name}
								</h2>
							</div>
						</div>
					</m.div>

					{/* Course Info Section */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
						className='text-center space-y-5 px-4'
					>
						<p className='text-sm sm:text-base text-white/60 font-light'>
							has successfully completed the educational course
						</p>

						<div className='max-w-4xl mx-auto'>
							<h3 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-4'>
								«{certificate.course.title}»
							</h3>

							<div className='flex justify-center'>
								<Badge className='bg-linear-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-300 px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-wide'>
									{DifficultyLabel[certificate.course.difficulty]}
								</Badge>
							</div>
						</div>
					</m.div>

					{/* Certificate Details Grid */}
					<m.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6 }}
						className='grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-10 border-t border-white/10'
					>
						<DetailCard
							icon={Hash}
							label='Certificate Number'
							value={certificate.certificateNumber}
						/>
						<DetailCard
							icon={Calendar}
							label='Issue Date'
							value={formatDate(certificate.issuedAt) ?? '—'}
						/>
						<DetailCard
							icon={CheckCircle2}
							label='Status'
							value='Verified'
						/>
					</m.div>

					{/* Footer Section */}
					<m.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.7 }}
						className='pt-10 border-t border-white/10 space-y-4'
					>
						<div className='flex items-center justify-center gap-3'>
							<Sparkles className='w-5 h-5 text-yellow-400' />
							<p className='text-base sm:text-lg text-white font-bold tracking-wide'>
								SafeNet Education Platform
							</p>
							<Sparkles className='w-5 h-5 text-yellow-400' />
						</div>

						<p className='text-xs sm:text-sm text-white/40 text-center font-light max-w-2xl mx-auto'>
							An official document confirming successful completion of the course.
							<br />
							This certificate is valid and can be verified by its number.
						</p>
					</m.div>
				</div>
			</m.section>
		</div>
	)
}

/**
 * Detail Card Component
 * Reusable component for displaying certificate metadata
 */
interface DetailCardProps {
	icon: React.ComponentType<{ className?: string }>
	label: string
	value: string
}

function DetailCard({ icon: Icon, label, value }: DetailCardProps) {
	return (
		<div
			className='text-center p-5 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300'
			role='group'
			aria-label={`${label}: ${value}`}
		>
			<div className='flex items-center justify-center gap-2 text-white/60 mb-3'>
				<Icon className='w-4 h-4' aria-hidden='true' />
				<span className='text-xs sm:text-sm font-medium uppercase tracking-wide'>
					{label}
				</span>
			</div>
			<p className='text-sm sm:text-base font-bold text-white'>{value}</p>
		</div>
	)
}

/**
 * Loading Skeleton
 * Displayed while certificate data is being fetched
 */
const CertificateSkeleton = () => (
	<div className='space-y-8' role='status' aria-label='Loading certificate'>
		<Skeleton className='h-10 w-64 rounded-xl bg-white/5' />
		<Skeleton className='h-[842px] rounded-3xl bg-white/5' />
	</div>
)

/**
 * Error State Component
 * Displayed when certificate cannot be found or loaded
 */
const CertificateNotFound = () => {
	const router = useRouter()

	return (
		<div className='min-h-screen flex items-center justify-center p-4'>
			<m.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
			>
				<Card className='w-full max-w-lg bg-white/3 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-12 text-center'>
					<div
						className='w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg'
						aria-hidden='true'
					>
						<Award className='w-10 h-10 text-white/20' />
					</div>
					<h2 className='text-3xl font-black text-white mb-3'>
						Certificate Not Found
					</h2>
					<p className='text-lg text-white/60 mb-8 leading-relaxed'>
						Check the link or contact your administrator
					</p>
					<button
						onClick={() => router.push(ROUTES.CERTIFICATES)}
						className='w-full h-14 rounded-2xl bg-white text-black hover:bg-white/80 shadow-2xl font-bold text-base transition-colors duration-200'
					>
						← Back to certificates
					</button>
				</Card>
			</m.div>
		</div>
	)
}
