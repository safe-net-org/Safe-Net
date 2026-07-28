'use client'

import { useI18n } from '@/i18n/LocaleProvider'
import { Code2, Laptop, Network } from '@/components/ui/icons'

export function GuardComparison() {
	const { t } = useI18n()
	const c = t.guardComponents.comparison

	return (
		<section className='mb-20'>
			<h2 className='mb-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl'>
				{c.heading}
			</h2>
			<p className='mb-6 max-w-2xl text-muted-foreground'>{c.subtitle}</p>

			<div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
				<table className='w-full border-collapse'>
					<thead>
						<tr className='border-b border-border bg-secondary/50'>
							<th
								scope='col'
								className='p-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'
							>
								{c.capability}
							</th>
							<th
								scope='col'
								className='p-4 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'
							>
								{c.columns.scope}
							</th>
						</tr>
					</thead>
					<tbody>
						{c.rows.map((feature, index) => {
							const isNetwork = index === 5 || index === 6
							const isSource = index === 7
							const Icon = isNetwork ? Network : isSource ? Code2 : Laptop

							return (
							<tr
								key={feature}
								className='border-b border-border last:border-0'
							>
								<th
									scope='row'
									className='p-4 text-left text-sm font-medium text-card-foreground'
								>
									{feature}
								</th>
								<td className='p-4'>
									<span className='inline-flex items-center gap-2 text-xs text-muted-foreground'>
										<Icon
											className={isNetwork ? 'size-4 text-warning' : 'size-4 text-success'}
											aria-hidden='true'
										/>
										{c.notes[index]}
									</span>
								</td>
							</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</section>
	)
}
