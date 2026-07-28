'use client'

import { UI_COLORS } from '@/config/colors.config'
import { m } from 'framer-motion'
import { Users } from '@/components/ui/icons'
import {
	Cell,
	Legend,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts'

interface UsersStatusChartProps {
	data: {
		active: number
		blocked: number
		admins: number
	}
}

const COLORS = {
	active: UI_COLORS.chart.green,
	blocked: UI_COLORS.chart.red,
	admins: UI_COLORS.chart.purple,
}

export default function UsersStatusChart({ data }: UsersStatusChartProps) {
	const chartData = [
		{ name: 'Active', value: data.active, color: COLORS.active },
		{ name: 'Blocked', value: data.blocked, color: COLORS.blocked },
		{ name: 'Admins', value: data.admins, color: COLORS.admins },
	]

	const total = data.active + data.blocked + data.admins

	return (
		<m.div
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			className='bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow'
		>
			<div className='flex items-start justify-between mb-6'>
				<div>
					<div className='flex items-center gap-2 mb-2'>
						<div className='p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30'>
							<Users className='w-5 h-5 text-orange-600 dark:text-orange-400' />
						</div>
						<h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
							User distribution
						</h3>
					</div>
					<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
						By status and role
					</p>
				</div>
			</div>

			<m.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.2 }}
			>
				<ResponsiveContainer width='100%' height={300}>
					<PieChart>
						<Pie
							data={chartData}
							cx='50%'
							cy='50%'
							labelLine={false}
							label={entry =>
								`${(total > 0 ? (entry.value / total) * 100 : 0).toFixed(0)}%`
							}
							outerRadius={100}
							fill={UI_COLORS.chart.purple}
							dataKey='value'
						>
							{chartData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={entry.color} />
							))}
						</Pie>
						<Tooltip
							contentStyle={{
								backgroundColor: UI_COLORS.chart.tooltip,
								border: 'none',
								borderRadius: '12px',
								color: UI_COLORS.chart.tooltipForeground,
							}}
							formatter={(value: number) => `${value}`}
							labelStyle={{ color: UI_COLORS.chart.tooltipForeground }}
						/>
						<Legend
							verticalAlign='bottom'
							height={36}
							formatter={value => {
								const count =
									chartData.find(item => item.name === value)?.value ?? 0
								return (
									<span className='text-sm text-gray-700 dark:text-gray-300'>
										{value}: {count}
									</span>
								)
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			</m.div>

			<div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-800'>
				<div className='grid grid-cols-3 gap-3'>
					<m.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0 }}
						className='p-3 rounded-lg bg-green-50 dark:bg-green-900/20'
					>
						<p className='text-xs font-medium text-green-700 dark:text-green-300'>
							Active
						</p>
						<p className='text-2xl font-bold text-green-600 dark:text-green-400 mt-1'>
							{data.active}
						</p>
					</m.div>

					<m.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.05 }}
						className='p-3 rounded-lg bg-red-50 dark:bg-red-900/20'
					>
						<p className='text-xs font-medium text-red-700 dark:text-red-300'>
							Blocked
						</p>
						<p className='text-2xl font-bold text-red-600 dark:text-red-400 mt-1'>
							{data.blocked}
						</p>
					</m.div>

					<m.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ delay: 0.1 }}
						className='p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20'
					>
						<p className='text-xs font-medium text-purple-700 dark:text-purple-300'>
							Admins
						</p>
						<p className='text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1'>
							{data.admins}
						</p>
					</m.div>
				</div>
			</div>
		</m.div>
	)
}
