import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { CourseDetailsDto } from '../dto/course-details.dto'
import { CourseSummaryDto } from '../dto/course-summary.dto'
import { Locale, pickLocalized } from '../../i18n/locale'

@Injectable()
export class CoursesService {
	constructor(private readonly prisma: PrismaService) {}

	async getCoursesByStage(slug: string, locale: Locale): Promise<CourseSummaryDto[]> {
		const stage = await this.prisma.stage.findUnique({
			where: { slug },
			include: {
				courses: {
					include: {
						lessons: {
							select: { id: true },
						},
					},
					orderBy: { createdAt: 'asc' },
				},
			},
		})
		if (!stage) {
			throw new NotFoundException('Stage not found')
		}
		return stage.courses.map(course => ({
			id: course.id,
			slug: course.slug,
			title: pickLocalized(locale, course.title, course.titleRu),
			description: pickLocalized(locale, course.description, course.descriptionRu),
			difficulty: course.difficulty,
			lessonsCount: course.lessons.length,
		}))
	}

	async getCourseBySlug(
		slug: string,
		userId: string,
		locale: Locale
	): Promise<CourseDetailsDto> {
		const course = await this.prisma.course.findUnique({
			where: { slug },
			include: {
				stage: {
					select: {
						id: true,
						slug: true,
						title: true,
						subtitle: true,
						titleRu: true,
						subtitleRu: true,
						icon: true,
					},
				},
				lessons: {
					orderBy: { order: 'asc' },
					select: {
						id: true,
						order: true,
						title: true,
						titleRu: true,
						estimatedDuration: true,
						_count: {
							select: { tasks: true },
						},
					},
				},
				tests: {
					select: {
						id: true,
						title: true,
						description: true,
						titleRu: true,
						descriptionRu: true,
						passingScore: true,
					},
				},
			},
		})

		if (!course) {
			throw new NotFoundException('Course not found')
		}

		const testResults = await this.prisma.testResult.findMany({
			where: {
				userId,
				test: {
					courseId: course.id,
				},
			},
			orderBy: {
				createdAt: 'desc',
			},
		})

		const [userCourseProgress, completedLessons, taskAttempts] =
			await Promise.all([
				this.prisma.courseProgress.findUnique({
					where: {
						userId_courseId: {
							userId: userId,
							courseId: course.id,
						},
					},
					select: {
						progress: true,
						totalXp: true,
					},
				}),
				this.prisma.completedLesson.findMany({
					where: {
						userId: userId,
						lessonId: { in: course.lessons.map(l => l.id) },
					},
					select: { lessonId: true },
				}),
				this.prisma.taskAttempt.findMany({
					where: {
						userId: userId,
						task: {
							lesson: {
								courseId: course.id,
							},
						},
						isCorrect: true,
					},
					select: {
						awardedXp: true,
						taskId: true,
						task: {
							select: {
								lessonId: true,
							},
						},
					},
				}),
			])

		const completedLessonIds = new Set(completedLessons.map(cl => cl.lessonId))

		const lessonTaskStats = new Map<
			string,
			{ completedTasks: number; totalTasks: number }
		>()

		for (const lesson of course.lessons) {
			lessonTaskStats.set(lesson.id, {
				completedTasks: 0,
				totalTasks: lesson._count.tasks,
			})
		}

		const lessonTaskProgress = new Map<string, number>()
		taskAttempts.forEach(attempt => {
			const lessonId = attempt.task.lessonId
			lessonTaskProgress.set(
				lessonId,
				(lessonTaskProgress.get(lessonId) || 0) + 1
			)
		})

		for (const lesson of course.lessons) {
			const completedTasks = lessonTaskProgress.get(lesson.id) || 0
			lessonTaskStats.set(lesson.id, {
				completedTasks,
				totalTasks: lesson._count.tasks,
			})
		}

		const calculatedTotalXp = taskAttempts.reduce(
			(sum, attempt) => sum + (attempt.awardedXp || 0),
			0
		)

		// ✅ FIXED: Simple progress calculation
		// (completed lessons + passed tests) / (total lessons + total tests) * 100
		const totalLessons = course.lessons.length
		const totalTests = course.tests.length
		const totalItems = totalLessons + totalTests

		// ✅ FIXED: Get unique passed tests (latest attempts only)
		const passedTestIds = new Set<string>()
		const testResultsByTestId = new Map<string, (typeof testResults)[0]>()

		// Group results by testId, keeping only the latest one
		testResults.forEach(result => {
			if (!testResultsByTestId.has(result.testId)) {
				testResultsByTestId.set(result.testId, result)
				if (result.passed) {
					passedTestIds.add(result.testId)
				}
			}
		})

		const completedItems = completedLessons.length + passedTestIds.size

		const calculatedProgress =
			totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

		return {
			id: course.id,
			slug: course.slug,
			title: pickLocalized(locale, course.title, course.titleRu),
			description: pickLocalized(locale, course.description, course.descriptionRu),
			difficulty: course.difficulty,
			progress: calculatedProgress, // ✅ Use the fixed progress value
			totalXp: userCourseProgress?.totalXp ?? calculatedTotalXp,
			stage: course.stage
				? {
						id: course.stage.id,
						slug: course.stage.slug,
						title: pickLocalized(locale, course.stage.title, course.stage.titleRu),
						subtitle: pickLocalized(locale, course.stage.subtitle, course.stage.subtitleRu),
						icon: course.stage.icon,
					}
				: null,
			lessons: course.lessons.map(lesson => {
				const taskStats = lessonTaskStats.get(lesson.id)!
				return {
					id: lesson.id,
					order: lesson.order,
					title: pickLocalized(locale, lesson.title, lesson.titleRu),
					estimatedDuration: lesson.estimatedDuration,
					tasksCount: lesson._count.tasks,
					completed: completedLessonIds.has(lesson.id),
					taskProgress:
						lesson._count.tasks > 0
							? Math.round(
									(taskStats.completedTasks / taskStats.totalTasks) * 100
								)
							: 0,
				}
			}),
			tests: course.tests.map(test => {
				// ✅ FIXED: Take the latest result for each test
				const result = testResultsByTestId.get(test.id)
				const allAttemptsForTest = testResults.filter(r => r.testId === test.id)

				return {
					id: test.id,
					title: pickLocalized(locale, test.title, test.titleRu),
					description: pickLocalized(locale, test.description, test.descriptionRu) ?? '',
					passingScore: test.passingScore,
					passed: result?.passed ?? false,
					score: result?.score ?? null,
					time: result?.time ?? null,
					attempts: allAttemptsForTest.length,
					lastAttemptDate: result?.createdAt ?? null, // Latest attempt
				}
			}),
		}
	}
}
