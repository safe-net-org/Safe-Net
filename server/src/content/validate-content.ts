import { join } from 'node:path'
import { describeStats, loadContent } from './parse-content'

/**
 * Validates the content tree without touching the database.
 *
 * Exit code 0 = valid, 1 = problems found, so CI fails on unsourced claims,
 * malformed tasks, or a lesson that misses the quality floor — before any of
 * it reaches a learner.
 *
 *   bun run validate:content
 */
const contentDir = process.argv[2] ?? join(__dirname, '../../content')

try {
	const { stats } = loadContent(contentDir)
	console.log(`Parsed: ${describeStats(stats)}`)
	console.log('All content valid.')
} catch (error) {
	console.error(error instanceof Error ? error.message : error)
	process.exit(1)
}
