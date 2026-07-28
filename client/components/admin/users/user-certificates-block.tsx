'use client'

import { ROUTES } from '@/config/pages-url.config'
import { useI18n } from '@/i18n/LocaleProvider'
import { formatDate } from '@/utils/date-time/dateFormatter'

import { m } from 'framer-motion'
import { Award, ExternalLink } from '@/components/ui/icons'
import Link from 'next/link'

interface Certificate {
	id: string
	courseId: string
	courseTitle: string
	issuedAt: string
	certificateNumber: string
}

interface UserCertificatesBlockProps {
	certificates: Certificate[]
}

export default function UserCertificatesBlock({
	certificates,
}: UserCertificatesBlockProps) {
	const { t } = useI18n()
	const c = t.adminUserComponents.userCertificatesBlock

	if (!certificates || certificates.length === 0) {
		return (
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='flex flex-col items-center justify-center py-16 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/5'
			>
				<Award className='w-12 h-12 text-white/20 mb-4' />
				<p className='text-white/50 text-center max-w-md'>{c.empty}</p>
			</m.div>
		)
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
			{certificates.map((cert, idx) => {
				const formattedDate =
					formatDate(cert.issuedAt, {
						format: 'date-medium',
						locale: 'en-US',
						gracefulFail: true,
					}) || c.dateUnknown

				return (
					<m.div
						key={cert.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: idx * 0.05 }}
					>
						<Link
							href={`${ROUTES.CERTIFICATES}/${cert.id}`}
							className='block group relative bg-linear-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 hover:border-amber-500/30 backdrop-blur-sm rounded-xl p-5 transition-all duration-300'
						>
							<div className='flex items-start gap-4'>
								<div className='shrink-0 w-12 h-12 rounded-lg bg-linear-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center'>
									<Award className='w-6 h-6 text-amber-400' />
								</div>

								<div className='flex-1 min-w-0'>
									<h3 className='font-semibold text-white text-base mb-1 line-clamp-1 group-hover:text-amber-200 transition-colors'>
										{cert.courseTitle}
									</h3>
									<p className='text-white/60 text-sm mb-2'>
										{c.certificateNumberTemplate.replace(
											'{number}',
											cert.certificateNumber
										)}
									</p>
									<p className='text-white/40 text-xs'>{formattedDate}</p>
								</div>

								<ExternalLink className='shrink-0 w-4 h-4 text-white/40 group-hover:text-amber-400 transition-colors' />
							</div>
						</Link>
					</m.div>
				)
			})}
		</div>
	)
}
