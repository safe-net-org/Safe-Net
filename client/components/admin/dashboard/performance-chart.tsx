'use client'

import { UI_COLORS } from '@/config/colors.config'
import { m } from 'framer-motion'
import { BarChart3 } from '@/components/ui/icons'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'

interface CourseData {
	id: string
	title: string
	enrolledUsers: number
	completionRate: number
	avgScore: number
}

interface PerformanceChartProps {
	data: CourseData[]
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
	const chartData = data.slice(0, 5).map(course => ({
		name:
			course.title.length > 15
				? course.title.slice(0, 15) + '...'
				: course.title,
		score: course.avgScore,
		completion: course.completionRate,
		enrolled: course.enrolledUsers,
		fullTitle: course.title,
	}))

	return (
		<m.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className='bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow'
		>
			{/* Header */}
			<div className='flex items-start justify-between mb-6'>
				<div>
					<div className='flex items-center gap-2 mb-2'>
						<div className='p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30'>
							<BarChart3 className='w-5 h-5 text-purple-600 dark:text-purple-400' />
						</div>
						<h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
							Top 5 courses
						</h3>
					</div>
					<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
						By average score and completion
					</p>
				</div>
			</div>

			{/* Chart */}
			<m.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
			>
				<ResponsiveContainer width='100%' height={350}>
					<BarChart
						data={chartData}
						margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
					>
						<CartesianGrid
							strokeDasharray='3 3'
							stroke={UI_COLORS.chart.grid}
							className='dark:stroke-gray-800'
							vertical={false}
						/>
						<XAxis
							dataKey='name'
							stroke={UI_COLORS.chart.axis}
							fontSize={12}
							angle={-45}
							textAnchor='end'
							height={100}
							style={{ fontFamily: 'inherit' }}
						/>
						<YAxis
							stroke={UI_COLORS.chart.axis}
							fontSize={12}
							style={{ fontFamily: 'inherit' }}
							label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
							domain={[0, 100]}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: UI_COLORS.chart.tooltip,
								border: 'none',
								borderRadius: '12px',
								color: UI_COLORS.chart.tooltipForeground,
							}}
							cursor={{ fill: 'color-mix(in oklab, var(--chart-blue) 10%, transparent)' }}
							labelStyle={{ color: UI_COLORS.chart.tooltipForeground }}
							formatter={(value: number, name: string) => {
								if (name === 'score') return [`${value}%`, 'Average score']
								if (name === 'completion') return [`${value}%`, 'Completion']
								return [value, name]
							}}
						/>
						<Legend wrapperStyle={{ paddingTop: '20px' }} iconType='circle' />
						<Bar
							dataKey='score'
							fill={UI_COLORS.chart.blue}
							radius={[8, 8, 0, 0]}
							name='Average score'
							animationDuration={800}
						/>
						<Bar
							dataKey='completion'
							fill={UI_COLORS.chart.green}
							radius={[8, 8, 0, 0]}
							name='% Completion'
							animationDuration={800}
						/>
					</BarChart>
				</ResponsiveContainer>
			</m.div>

			{/* Stats Grid */}
			<div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-800'>
				<div className='grid grid-cols-5 gap-3'>
					{chartData.map((course, i) => (
						<m.div
							key={course.name}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.05 * i }}
							className='p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition'
							title={course.fullTitle}
						>
							<p className='text-xs font-medium text-gray-600 dark:text-gray-400 truncate'>
								{course.name}
							</p>
							<div className='flex items-baseline gap-1 mt-1'>
								<p className='text-lg font-bold text-blue-600 dark:text-blue-400'>
									{course.score}%
								</p>
								<p className='text-xs text-gray-500 dark:text-gray-500'>point</p>
							</div>
							<div className='flex items-baseline gap-1 mt-0.5'>
								<p className='text-sm font-semibold text-green-600 dark:text-green-400'>
									{course.enrolled}
								</p>
								<p className='text-xs text-gray-500 dark:text-gray-500'>
									students
								</p>
							</div>
						</m.div>
					))}
				</div>
			</div>
		</m.div>
	)
}
