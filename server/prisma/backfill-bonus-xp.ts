import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'

/**
 * One-off backfill for `User.bonusXp`.
 *
 * Achievements earned before the column existed granted no XP, so every
 * existing user sits at 0. This recomputes each user's bonus from the
 * achievements they already hold.
 *
 * Idempotent: it sets an absolute total rather than incrementing, so running
 * it twice cannot double-award.
 *
 *   bunx tsx prisma/backfill-bonus-xp.ts
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
	const users = await prisma.user.findMany({
		select: {
			id: true,
			email: true,
			bonusXp: true,
			achievements: {
				select: { achievement: { select: { code: true, xpReward: true } } },
			},
		},
	})

	console.log(`🔄 Backfilling bonus XP for ${users.length} users...`)

	for (const user of users) {
		const earnedXp = user.achievements.reduce(
			(total, ua) => total + ua.achievement.xpReward,
			0
		)

		if (user.bonusXp === earnedXp) {
			console.log(`   ${user.email}: already ${earnedXp} XP, skipped`)
			continue
		}

		await prisma.user.update({
			where: { id: user.id },
			data: { bonusXp: earnedXp },
		})
		console.log(
			`   ${user.email}: ${user.bonusXp} → ${earnedXp} XP (${user.achievements.length} achievement(s))`
		)
	}

	console.log('✅ Backfill complete.')
}

main()
	.catch(error => {
		console.error('❌ Backfill failed:', error)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
		await pool.end()
	})
