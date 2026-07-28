import { readdirSync, readFileSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const CLIENT_ROOT = join(import.meta.dirname, '..')
const COLOR_SOURCE = join(CLIENT_ROOT, 'styles', 'theme.css')
const SOURCE_EXTENSIONS = new Set(['.css', '.ts', '.tsx'])
const COLOR_LITERAL = /#[\da-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch)\(/

function sourceFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		if (entry.name === 'node_modules' || entry.name === '.next') return []
		const path = join(directory, entry.name)
		if (entry.isDirectory()) return sourceFiles(path)
		return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [path] : []
	})
}

const violations = sourceFiles(CLIENT_ROOT).flatMap(file => {
	if (file === COLOR_SOURCE) return []
	return readFileSync(file, 'utf8')
		.split('\n')
		.flatMap((line, index) =>
			COLOR_LITERAL.test(line)
				? [`${relative(CLIENT_ROOT, file)}:${index + 1}`]
				: []
		)
})

if (violations.length > 0) {
	console.error('Color contract failed. Move color literals to styles/theme.css:')
	for (const violation of violations) console.error(`- ${violation}`)
	process.exit(1)
}

console.log('Color contract passed: component code uses centralized semantic tokens.')
