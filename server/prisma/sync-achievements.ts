// Loaded explicitly: this script runs standalone via tsx, not through
// `prisma db seed`, so nothing else populates DATABASE_URL.
import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { ACHIEVEMENTS } from '../src/learning/achievements/achievement-catalog'

/**
 * Syncs the achievement catalog into an existing database.
 *
 * `seed.ts` cannot be used for this: it wipes every table first, which would
 * destroy real user progress. This script only touches the `achievements`
 * table, and refuses to delete any achievement a user has already earned.
 *
 *   bunx tsx prisma/sync-achievements.ts
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
	console.log(`🏆 Syncing ${ACHIEVEMENTS.length} achievements from the catalog...`)

	for (const { isEarned, ...achievement } of ACHIEVEMENTS) {
		await prisma.achievement.upsert({
			where: { code: achievement.code },
			update: achievement,
			create: achievement,
		})
	}

	const catalogCodes = ACHIEVEMENTS.map(a => a.code as string)
	const obsolete = await prisma.achievement.findMany({
		where: { code: { notIn: catalogCodes } },
		select: { id: true, code: true, _count: { select: { users: true } } },
	})

	for (const achievement of obsolete) {
		if (achievement._count.users > 0) {
			// Deleting would cascade to user_achievements and silently strip an
			// achievement a real user earned. Never do that automatically.
			console.warn(
				`⚠️  "${achievement.code}" is no longer in the catalog but ${achievement._count.users} user(s) earned it. Left in place — migrate or retire it deliberately.`
			)
			continue
		}

		await prisma.achievement.delete({ where: { id: achievement.id } })
		console.log(`🗑️  Removed obsolete achievement "${achievement.code}" (unearned)`)
	}

	const total = await prisma.achievement.count()
	console.log(`✅ Done. ${total} achievements in the database.`)
}

main()
	.catch(error => {
		console.error('❌ Achievement sync failed:', error)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
		await pool.end()
	})
