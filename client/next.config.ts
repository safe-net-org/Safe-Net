import type { NextConfig } from 'next'
import { join } from 'node:path'

/**
 * `@safe-net/guard-core` lives outside this app, at `packages/guard-core`, and
 * is resolved through the `paths` entry in tsconfig.json rather than installed
 * as a `file:` dependency — that installs a symlink, and Turbopack refuses to
 * parse a symlinked package.json ("a redirect can't be parsed as json").
 *
 * `turbopack.root` has to point at the repository root, or the compiler treats
 * the package as outside its world and the import fails to resolve.
 *
 * Aliasing the source (rather than a build output) means the web app compiles
 * the engine's TypeScript directly: fix a rule, and the scanner on /guard and
 * the extension both change together.
 */
const repoRoot = join(__dirname, '..')

const nextConfig: NextConfig = {
	turbopack: {
		root: repoRoot,
	},
	webpack: config => {
		config.resolve.alias = {
			...config.resolve.alias,
			'@safe-net/guard-core': join(
				__dirname,
				'../packages/guard-core/src/index.ts'
			),
		}
		return config
	},
}

export default nextConfig
