import 'dotenv/config'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, Prisma, Role } from '@prisma/client'
import { hash } from 'argon2'
import { join } from 'node:path'
import { Pool } from 'pg'
import { ACHIEVEMENTS } from '../src/learning/achievements/achievement-catalog'
import {
	CompiledStage,
	describeStats,
	loadContent,
} from '../src/content/parse-content'

/**
 * Seeds the database from the `content/` tree.
 *
 * Every stage, course, lesson, task and test used to be hand-written here as
 * ~2500 lines of TypeScript. Content now lives in Markdown and YAML under
 * `content/`, validated by `src/content/content-schema.ts`, so this file is
 * only responsible for writing to the database — not for holding the
 * curriculum.
 *
 * WARNING: destructive. Wipes all learning content *and* all user progress
 * before inserting. Never run against a database with real users.
 *
 *   bun run prisma db seed
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DEMO_PASSWORD = 'password123'
const CONTENT_DIR = join(__dirname, '../content')
const CONTENT_RU_DIR = join(__dirname, '../content-ru')

async function main() {
	// Parsed before the wipe: if the content is invalid, the existing database
	// should survive untouched rather than be emptied for nothing.
	const { stages, stats } = loadContent(CONTENT_DIR, CONTENT_RU_DIR)
	console.log(`📚 Loaded content: ${describeStats(stats)}`)

	const hashedPassword = await hash(DEMO_PASSWORD)

	await prisma.$transaction(
		async tx => {
			await wipe(tx)
			await createUsers(tx, hashedPassword)
			await createAchievements(tx)

			for (const stage of stages) {
				await createStage(tx, stage)
			}
		},
		{ timeout: 120_000 }
	)

	console.log('✅ Seed complete.')
}

type TransactionClient = Prisma.TransactionClient

async function wipe(tx: TransactionClient) {
	console.log('🧹 Cleaning database...')
	// Order matters: children before parents, since not every relation
	// cascades.
	await tx.taskAttempt.deleteMany()
	await tx.testResult.deleteMany()
	await tx.completedLesson.deleteMany()
	await tx.courseProgress.deleteMany()
	await tx.userAchievement.deleteMany()
	await tx.certificate.deleteMany()
	await tx.taskOption.deleteMany()
	await tx.testQuestionOption.deleteMany()
	await tx.testQuestion.deleteMany()
	await tx.task.deleteMany()
	await tx.lessonBlock.deleteMany()
	await tx.lesson.deleteMany()
	await tx.test.deleteMany()
	await tx.course.deleteMany()
	await tx.stage.deleteMany()
	await tx.user.deleteMany()
	await tx.achievement.deleteMany()
}

async function createUsers(tx: TransactionClient, hashedPassword: string) {
	console.log('👥 Creating users...')
	await tx.user.create({
		data: {
			email: 'demo@safe.net',
			name: 'Demo User',
			password: hashedPassword,
			rights: [Role.USER],
		},
	})
	await tx.user.create({
		data: {
			email: 'admin@safe.net',
			name: 'Admin',
			password: hashedPassword,
			rights: [Role.ADMIN, Role.USER],
		},
	})
}

async function createAchievements(tx: TransactionClient) {
	console.log(`🏆 Creating ${ACHIEVEMENTS.length} achievements...`)
	// Seeded straight from the catalog so the database can never drift from the
	// awarding logic — that drift is what left two achievements permanently
	// unearnable.
	await tx.achievement.createMany({
		data: ACHIEVEMENTS.map(({ isEarned, ...achievement }) => achievement),
	})
}

async function createStage(tx: TransactionClient, stage: CompiledStage) {
	const createdStage = await tx.stage.create({
		data: {
			order: stage.order,
			slug: stage.slug,
			title: stage.title,
			subtitle: stage.subtitle,
			icon: stage.icon,
			titleRu: stage.titleRu,
			subtitleRu: stage.subtitleRu,
		},
	})
	console.log(`  📦 ${stage.title}`)

	for (const course of stage.courses) {
		await createCourse(tx, createdStage.id, course)
	}
}

async function createCourse(
	tx: TransactionClient,
	stageId: string,
	course: CompiledStage['courses'][number]
) {
	const createdCourse = await tx.course.create({
		data: {
			stageId,
			slug: course.slug,
			title: course.title,
			description: course.description,
			difficulty: course.difficulty,
			titleRu: course.titleRu,
			descriptionRu: course.descriptionRu,
		},
	})

	for (const lesson of course.lessons) {
		await createLesson(tx, createdCourse.id, lesson)
	}

	if (course.test) {
		await createTest(tx, createdCourse.id, course.test)
	}
}

async function createLesson(
	tx: TransactionClient,
	courseId: string,
	lesson: CompiledStage['courses'][number]['lessons'][number]
) {
	const createdLesson = await tx.lesson.create({
		data: {
			courseId,
			order: lesson.order,
			title: lesson.title,
			estimatedDuration: lesson.estimatedDuration,
			titleRu: lesson.titleRu,
		},
	})

	await tx.lessonBlock.createMany({
		data: lesson.blocks.map(block => ({
			lessonId: createdLesson.id,
			order: block.order,
			type: block.type,
			title: block.title,
			content: block.content,
			titleRu: block.titleRu,
			contentRu: block.contentRu,
		})),
	})

	for (const task of lesson.tasks) {
		await createTask(tx, createdLesson.id, task)
	}
}

async function createTask(
	tx: TransactionClient,
	lessonId: string,
	task: Record<string, any>
) {
	const createdTask = await tx.task.create({
		data: {
			lessonId,
			order: task.order,
			type: task.type,
			title: task.title,
			question: task.question,
			explanation: task.explanation,
			points: task.points,
			difficulty: task.difficulty,
			meta: task.meta ?? undefined,
			correctAnswer: task.correctAnswer,
			correctAnswerIndex: task.correctAnswerIndex,
			correctAnswerRu: task.correctAnswerRu,
			titleRu: task.titleRu,
			questionRu: task.questionRu,
			explanationRu: task.explanationRu,
			metaRu: task.metaRu ?? undefined,
		},
	})

	if (task.options?.length) {
		await tx.taskOption.createMany({
			data: task.options.map((option: Record<string, any>) => ({
				taskId: createdTask.id,
				order: option.order,
				text: option.text,
				isCorrect: option.isCorrect,
				textRu: option.textRu,
			})),
		})
	}
}

async function createTest(
	tx: TransactionClient,
	courseId: string,
	test: NonNullable<CompiledStage['courses'][number]['test']>
) {
	const createdTest = await tx.test.create({
		data: {
			courseId,
			title: test.title,
			description: test.description,
			passingScore: test.passingScore,
			titleRu: test.titleRu,
			descriptionRu: test.descriptionRu,
		},
	})

	for (const question of test.questions) {
		const createdQuestion = await tx.testQuestion.create({
			data: {
				testId: createdTest.id,
				order: question.order,
				text: question.text,
				type: question.type,
				correctAnswerIndex: question.correctAnswerIndex,
				textRu: question.textRu,
			},
		})

		await tx.testQuestionOption.createMany({
			data: question.options.map(option => ({
				testQuestionId: createdQuestion.id,
				order: option.order,
				text: option.text,
				isCorrect: option.isCorrect,
				textRu: option.textRu,
			})),
		})
	}
}

main()
	.catch(error => {
		console.error('❌ Seed failed:', error)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
		await pool.end()
	})
