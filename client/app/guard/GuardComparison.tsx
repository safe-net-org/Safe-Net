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
	return <X className='mx-auto h-4 w-4 text-white/25' />
}

export function GuardComparison() {
	return (
		<section className='mb-16'>
			<h2 className='mb-2 text-2xl font-bold'>What the others miss</h2>
			<p className='mb-6 max-w-2xl text-sm text-white/50'>
				Standard filters match known-bad URLs from a blocklist. Guard matches the
				technique, so it catches an attack the first time it is ever used.
			</p>

			<div className='overflow-x-auto rounded-2xl border border-white/10'>
				<table className='w-full min-w-[560px] border-collapse'>
					<thead>
						<tr className='border-b border-white/10'>
							<th className='p-4 text-left text-[11px] font-normal uppercase tracking-[0.15em] text-white/40'>
								Capability
							</th>
							{COLS.map(col => (
								<th
									key={col.key}
									className={
										'p-4 text-center text-[13px] font-semibold ' +
										(col.accent ? 'text-purple-300' : 'text-white/50')
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
								className='border-b border-white/5 last:border-0'
							>
								<td className='p-4 text-sm text-white/80'>{row.feature}</td>
								{COLS.map(col => (
									<td
										key={col.key}
										className={
											'p-4 text-center ' +
											(col.accent ? 'bg-purple-500/[0.05]' : '')
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
