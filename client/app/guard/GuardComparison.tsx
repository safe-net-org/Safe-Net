import { Check, Minus, X } from 'lucide-react'

type Cell = 'yes' | 'no' | 'partial'

interface Row {
	feature: string
	guard: Cell
	safeBrowsing: Cell
	antivirus: Cell
}

// Blocklists catch known-bad addresses. Guard catches the *technique*, so it
// flags a homograph or a leet domain the first time it is ever seen — before it
// could be on any list.
const ROWS: Row[] = [
	{ feature: 'IDN homographs (Cyrillic look-alikes)', guard: 'yes', safeBrowsing: 'no', antivirus: 'no' },
	{ feature: 'Typo- and leet-squatting', guard: 'yes', safeBrowsing: 'partial', antivirus: 'no' },
	{ feature: 'Brand buried in a subdomain', guard: 'yes', safeBrowsing: 'partial', antivirus: 'no' },
	{ feature: 'Verdict before the page loads', guard: 'yes', safeBrowsing: 'partial', antivirus: 'no' },
	{ feature: 'Explains why, signal by signal', guard: 'yes', safeBrowsing: 'no', antivirus: 'partial' },
	{ feature: 'Works with zero telemetry', guard: 'yes', safeBrowsing: 'no', antivirus: 'no' },
	{ feature: 'Open source', guard: 'yes', safeBrowsing: 'no', antivirus: 'no' },
]

const COLS = [
	{ key: 'guard' as const, name: 'SafeNet Guard', accent: true },
	{ key: 'safeBrowsing' as const, name: 'Safe Browsing', accent: false },
	{ key: 'antivirus' as const, name: 'Antivirus', accent: false },
]

function Mark({ value }: { value: Cell }) {
	if (value === 'yes') return <Check className='mx-auto h-4 w-4 text-emerald-400' />
	if (value === 'partial') return <Minus className='mx-auto h-4 w-4 text-amber-400' />
	return <X className='mx-auto h-4 w-4 text-slate-600' />
}

export function GuardComparison() {
	return (
		<section className='mb-20'>
			<h2 className='mb-2 text-3xl font-bold text-white sm:text-4xl'>
				What the others miss
			</h2>
			<p className='mb-6 max-w-2xl text-slate-400'>
				Standard filters match known-bad URLs from a blocklist. Guard matches the
				technique, so it catches an attack the first time it is ever used.
			</p>

			<div className='overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800'>
				<table className='w-full min-w-[560px] border-collapse'>
					<thead>
						<tr className='border-b border-slate-700'>
							<th className='p-4 text-left text-xs font-normal uppercase tracking-wide text-slate-500'>
								Capability
							</th>
							{COLS.map(col => (
								<th
									key={col.key}
									className={
										'p-4 text-center text-[13px] font-semibold ' +
										(col.accent ? 'text-indigo-300' : 'text-slate-400')
									}
								>
									{col.name}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{ROWS.map(row => (
							<tr
								key={row.feature}
								className='border-b border-slate-700/60 last:border-0'
							>
								<td className='p-4 text-sm text-slate-300'>{row.feature}</td>
								{COLS.map(col => (
									<td
										key={col.key}
										className={
											'p-4 text-center ' +
											(col.accent ? 'bg-indigo-500/[0.06]' : '')
										}
									>
										<Mark value={row[col.key]} />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	)
}
