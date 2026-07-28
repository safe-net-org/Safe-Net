'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import { formatDate } from '@/utils/date-time/dateFormatter'
import { m } from 'framer-motion'
import { Award, CheckCircle2, Clock, FileText, XCircle } from '@/components/ui/icons'

interface TestResult {
	id: string
	testId: string
	testTitle: string
	courseTitle: string
	score: number
	totalQuestions: number
	correctAnswers: number
	passed: boolean
	time: number // ← time in seconds
	completedAt: string
}

interface UserTestsBlockProps {
	testResults: TestResult[]
}

export default function UserTestsBlock({ testResults }: UserTestsBlockProps) {
	const { t } = useI18n()
	const c = t.adminUserComponents.userTestsBlock

	// Function to format time
	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60)
		const remainingSeconds = seconds % 60

		if (minutes === 0) {
			return c.timeSecondsTemplate.replace('{seconds}', String(remainingSeconds))
		}

		return c.timeMinutesTemplate
			.replace('{minutes}', String(minutes))
			.replace('{seconds}', String(remainingSeconds))
	}

	if (testResults.length === 0) {
		return (
			<m.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className='flex flex-col items-center justify-center py-16 bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/5'
			>
				<FileText className='w-12 h-12 text-white/20 mb-4' />
				<p className='text-white/50'>{c.empty}</p>
			</m.div>
		)
	}

	const passedTests = testResults.filter(t => t.passed).length
	const averageScore =
		testResults.reduce((sum, t) => sum + t.score, 0) / testResults.length

	// Average completion time
	const averageTime =
		testResults.length > 0
			? Math.round(
					testResults.reduce((sum, t) => sum + t.time, 0) / testResults.length
				)
			: 0

	const tableHeaders = [
		c.table.test,
		c.table.course,
		c.table.score,
		c.table.answers,
		c.table.time,
		c.table.status,
		c.table.date,
	]

	return (
		<div className='space-y-6'>
			{/* Stats */}
			<div className='grid grid-cols-4 gap-4'>
				<div className='bg-linear-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4'>
					<FileText className='w-5 h-5 text-blue-400 mb-2' />
					<div className='text-2xl font-bold text-white mb-1'>
						{testResults.length}
					</div>
					<div className='text-white/60 text-xs'>{c.stats.totalTests}</div>
				</div>

				<div className='bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4'>
					<CheckCircle2 className='w-5 h-5 text-emerald-400 mb-2' />
					<div className='text-2xl font-bold text-white mb-1'>
						{passedTests}
					</div>
					<div className='text-white/60 text-xs'>{c.stats.passed}</div>
				</div>

				<div className='bg-linear-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4'>
					<Award className='w-5 h-5 text-purple-400 mb-2' />
					<div className='text-2xl font-bold text-white mb-1'>
						{Math.round(averageScore)}%
					</div>
					<div className='text-white/60 text-xs'>{c.stats.averageScore}</div>
				</div>

				<div className='bg-linear-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-xl p-4'>
					<Clock className='w-5 h-5 text-cyan-400 mb-2' />
					<div className='text-2xl font-bold text-white mb-1'>
						{formatTime(averageTime)}
					</div>
					<div className='text-white/60 text-xs'>{c.stats.averageTime}</div>
				</div>
			</div>

			{/* Tests Table */}
			<div className='overflow-x-auto'>
				<table className='w-full'>
					<thead>
						<tr className='border-b border-white/10'>
							{tableHeaders.map(h => (
								<th
									key={h}
									className='text-left text-xs font-semibold text-white/60 pb-3 px-4 first:pl-0 last:pr-0'
								>
									{h}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{testResults.map((result, idx) => {
							const formattedDate =
								formatDate(result.completedAt, {
									locale: 'en-US',
									gracefulFail: true,
								}) || c.dateUnknown

							return (
								<m.tr
									key={result.id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: idx * 0.05 }}
									className='border-b border-white/5 hover:bg-white/5 transition-colors'
								>
									<td className='py-4 px-4 pl-0'>
										<div className='font-medium text-white text-sm'>
											{result.testTitle}
										</div>
									</td>
									<td className='py-4 px-4'>
										<div className='text-white/60 text-sm'>
											{result.courseTitle}
										</div>
									</td>
									<td className='py-4 px-4'>
										<span
											className={`font-semibold text-sm ${
												result.score >= 80
													? 'text-emerald-400'
													: result.score >= 60
														? 'text-amber-400'
														: 'text-red-400'
											}`}
										>
											{result.score}%
										</span>
									</td>
									<td className='py-4 px-4'>
										<div className='text-white/60 text-sm'>
											{result.correctAnswers}/{result.totalQuestions}
										</div>
									</td>
									<td className='py-4 px-4'>
										<div className='flex items-center gap-1.5 text-white/60 text-sm'>
											{formatTime(result.time)}
										</div>
									</td>
									<td className='py-4 px-4'>
										{result.passed ? (
											<CheckCircle2 className='w-5 h-5 text-emerald-400' />
										) : (
											<XCircle className='w-5 h-5 text-red-400' />
										)}
									</td>
									<td className='py-4 px-4 pr-0'>
										<div className='text-white/40 text-xs'>{formattedDate}</div>
									</td>
								</m.tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}
