import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	{
		// Existing admin/content forms still carry broad API payload types and
		// literal editorial quotes. Keep that migration visible without letting
		// legacy type debt hide new correctness, hooks, or accessibility errors.
		rules: {
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/ban-ts-comment': 'warn',
			'react/no-unescaped-entities': 'warn',
		},
	},
	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts'])
])
export default eslintConfig
