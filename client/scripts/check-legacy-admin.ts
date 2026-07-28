import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoots = ['app', 'components', 'hooks', 'services'].map(path =>
	join(root, path)
)

// These pre-i18n components have no runtime import path. Keep that boundary
// executable: importing one would silently reintroduce hard-coded English.
const legacyModules = new Set([
	'admin-sidebar',
	'admin-header',
	'breadcrumbs',
	'quick-links',
	'user-filters',
	'users-table',
	'performance-chart',
	'registrations-chart',
	'user-growth-chart',
	'users-status-chart',
])

const legacyFiles = new Set([
	'components/admin/layout/admin-sidebar.tsx',
	'components/admin/layout/admin-header.tsx',
	'components/admin/layout/breadcrumbs.tsx',
	'components/admin/layout/quick-links.tsx',
	'components/admin/users/user-filters.tsx',
	'components/admin/users/users-table.tsx',
	'components/admin/dashboard/performance-chart.tsx',
	'components/admin/dashboard/registrations-chart.tsx',
	'components/admin/dashboard/user-growth-chart.tsx',
	'components/admin/dashboard/users-status-chart.tsx',
])

function sourceFiles(directory: string): string[] {
	return readdirSync(directory).flatMap(entry => {
		const path = join(directory, entry)
		if (statSync(path).isDirectory()) return sourceFiles(path)
		return /\.(ts|tsx)$/.test(path) ? [path] : []
	})
}

const violations: string[] = []
for (const file of sourceRoots.flatMap(sourceFiles)) {
	const projectPath = relative(root, file)
	if (legacyFiles.has(projectPath)) continue

	const source = readFileSync(file, 'utf8')
	for (const moduleName of legacyModules) {
		const importPattern = new RegExp(
			`(?:from\\s+|import\\s*)['"][^'"]*${moduleName}['"]`
		)
		if (importPattern.test(source)) {
			violations.push(`${projectPath} imports isolated legacy module ${moduleName}`)
		}
	}
}

if (violations.length > 0) {
	console.error(violations.join('\n'))
	process.exit(1)
}

console.log(
	`Legacy admin boundary passed: ${legacyFiles.size} unreachable pre-i18n modules remain isolated.`
)
