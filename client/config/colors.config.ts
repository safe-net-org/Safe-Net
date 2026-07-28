/**
 * JavaScript-facing color roles.
 *
 * CSS components should use semantic Tailwind roles (bg-card, text-foreground,
 * border-border). Libraries that require a color prop consume these CSS
 * variables so light/dark changes remain centralized in styles/theme.css.
 */
export const UI_COLORS = {
	chart: {
		blue: 'var(--chart-blue)',
		green: 'var(--chart-green)',
		amber: 'var(--chart-amber)',
		red: 'var(--chart-red)',
		purple: 'var(--chart-purple)',
		pink: 'var(--chart-pink)',
		orange: 'var(--chart-orange)',
		cyan: 'var(--chart-cyan)',
		indigo: 'var(--chart-indigo)',
		grid: 'var(--chart-grid)',
		axis: 'var(--chart-axis)',
		tooltip: 'var(--chart-tooltip)',
		tooltipForeground: 'var(--chart-tooltip-foreground)',
	},
} as const

export const TOPIC_COLORS = [
	UI_COLORS.chart.blue,
	UI_COLORS.chart.pink,
	UI_COLORS.chart.purple,
	UI_COLORS.chart.amber,
	UI_COLORS.chart.green,
	UI_COLORS.chart.cyan,
	UI_COLORS.chart.orange,
	UI_COLORS.chart.indigo,
] as const

export const TOPIC_COLOR_BY_SLUG: Readonly<Record<string, string>> = {
	basics: UI_COLORS.chart.blue,
	phishing: UI_COLORS.chart.pink,
	'dangerous-links': UI_COLORS.chart.amber,
	passwords: UI_COLORS.chart.purple,
	malware: UI_COLORS.chart.red,
	'social-media': UI_COLORS.chart.cyan,
	privacy: UI_COLORS.chart.green,
	advanced: UI_COLORS.chart.orange,
}
