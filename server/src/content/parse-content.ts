/**
 * Walks a `content/` directory tree, validates every file against the zod
 * schema in content-schema.ts, runs cross-file checks (unique slugs, no order
 * gaps), and compiles the tree into the shape the seed inserts
 * (Stage -> Course -> Lesson -> LessonBlock/Task/TaskOption,
 * Test -> TestQuestion -> TestQuestionOption).
 *
 * Content lives in Markdown and YAML rather than inside seed.ts, where it used
 * to sit as ~2500 lines of hand-written TypeScript: unreviewable in a diff,
 * uneditable without touching the ORM layer, and unvalidated.
 *
 * Consumers:
 *   - `prisma/seed.ts`            — writes the compiled tree to the database
 *   - `bun run validate:content`  — validates without a database, used by CI
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { parse as parseYaml } from 'yaml'
import {
  StageFrontmatter,
  CourseFrontmatter,
  LessonFrontmatter,
  LessonContent,
  TestFrontmatter,
  TheoryBlock,
  validateContentTree,
  type ParsedStage,
  type ParsedCourse,
  type ParsedLesson,
} from './content-schema'

const BASE_TIME = 2
const TIME_PER_BLOCK = 2
const TIME_PER_TASK = 5
function calculateEstimatedDuration(blocksCount: number, tasksCount: number) {
  return BASE_TIME + blocksCount * TIME_PER_BLOCK + tasksCount * TIME_PER_TASK
}

function dirs(path: string) {
  return readdirSync(path).filter(name => statSync(join(path, name)).isDirectory()).sort()
}

function readYaml(path: string) {
  return parseYaml(readFileSync(path, 'utf8'))
}

/** Split a lesson's markdown body into THEORY blocks on `## ` headings. A
 *  heading suffixed with `{#case}` marks the block that must cite the
 *  lesson's real-world source. */
function splitTheoryBlocks(markdown: string) {
  const lines = markdown.split('\n')
  const blocks: { title: string; content: string; isCase: boolean }[] = []
  let current: { title: string; content: string[]; isCase: boolean } | null = null

  const flush = () => {
    if (current) {
      blocks.push({ title: current.title, content: current.content.join('\n').trim(), isCase: current.isCase })
    }
  }

  for (const line of lines) {
    const heading = /^##\s+(.*)$/.exec(line)
    if (heading) {
      flush()
      const isCase = /\{#case\}\s*$/.test(heading[1])
      const title = heading[1].replace(/\s*\{#case\}\s*$/, '').trim()
      current = { title, content: [], isCase }
    } else if (current) {
      current.content.push(line)
    }
  }
  flush()
  return blocks
}

interface Problem {
  file: string
  message: string
}

// zod types `path` as PropertyKey[], which can include symbols; String() keeps
// the formatter honest instead of pretending they are always string | number.
function formatZodError(
  file: string,
  error: { issues: readonly { path: readonly PropertyKey[]; message: string }[] }
): Problem[] {
  return error.issues.map(issue => ({
    file,
    message: `${issue.path.map(String).join('.') || '(root)'}: ${issue.message}`,
  }))
}

function loadCourse(courseDir: string, problems: Problem[]): ParsedCourse | null {
  const courseYamlPath = join(courseDir, 'course.yaml')
  if (!existsSync(courseYamlPath)) {
    problems.push({ file: courseDir, message: 'missing course.yaml' })
    return null
  }

  const courseRaw = readYaml(courseYamlPath)
  const courseResult = CourseFrontmatter.safeParse(courseRaw)
  if (!courseResult.success) {
    problems.push(...formatZodError(courseYamlPath, courseResult.error))
    return null
  }

  const lessons: ParsedLesson[] = []
  const lessonsDir = join(courseDir, 'lessons')
  if (existsSync(lessonsDir)) {
    const lessonFiles = readdirSync(lessonsDir).filter(f => f.endsWith('.md')).sort()
    for (const file of lessonFiles) {
      const filePath = join(lessonsDir, file)
      const { data: frontmatter, content: body } = matter(readFileSync(filePath, 'utf8'))

      const frontmatterResult = LessonFrontmatter.safeParse(frontmatter)
      if (!frontmatterResult.success) {
        problems.push(...formatZodError(filePath, frontmatterResult.error))
        continue
      }

      const rawBlocks = splitTheoryBlocks(body)
      const blocksResult = (() => {
        // Validate each block individually first so a single bad block
        // doesn't hide behind a top-level array error.
        const blockProblems: Problem[] = []
        const parsedBlocks = rawBlocks.map((b, i) => {
          const r = TheoryBlock.safeParse(b)
          if (!r.success) blockProblems.push(...formatZodError(`${filePath} (block ${i + 1}: "${b.title}")`, r.error))
          return r.success ? r.data : null
        })
        return { blockProblems, parsedBlocks }
      })()
      if (blocksResult.blockProblems.length) {
        problems.push(...blocksResult.blockProblems)
        continue
      }

      const lessonResult = LessonContent.safeParse({
        ...frontmatterResult.data,
        theory: blocksResult.parsedBlocks,
      })
      if (!lessonResult.success) {
        problems.push(...formatZodError(filePath, lessonResult.error))
        continue
      }

      lessons.push({ file: filePath, data: lessonResult.data })
    }
  }

  let test: ParsedCourse['test']
  const testYamlPath = join(courseDir, 'test.yaml')
  if (existsSync(testYamlPath)) {
    const testRaw = readYaml(testYamlPath)
    const testResult = TestFrontmatter.safeParse(testRaw)
    if (!testResult.success) {
      problems.push(...formatZodError(testYamlPath, testResult.error))
    } else {
      test = testResult.data
    }
  }

  return { dir: courseDir, data: courseResult.data, lessons, test }
}

function loadStage(stageDir: string, problems: Problem[]): ParsedStage | null {
  const stageYamlPath = join(stageDir, 'stage.yaml')
  if (!existsSync(stageYamlPath)) {
    problems.push({ file: stageDir, message: 'missing stage.yaml' })
    return null
  }

  const stageRaw = readYaml(stageYamlPath)
  const stageResult = StageFrontmatter.safeParse(stageRaw)
  if (!stageResult.success) {
    problems.push(...formatZodError(stageYamlPath, stageResult.error))
    return null
  }

  const courses: ParsedCourse[] = []
  const coursesDir = join(stageDir, 'courses')
  if (existsSync(coursesDir)) {
    for (const name of dirs(coursesDir)) {
      const course = loadCourse(join(coursesDir, name), problems)
      if (course) courses.push(course)
    }
  }

  return { dir: stageDir, data: stageResult.data, courses }
}

/**
 * A Russian content tree, keyed for cheap lookup while compiling the English
 * tree. Stage/course are matched by slug (globally unique, per
 * validateContentTree); lesson/block/task/question/option are matched by
 * their 1-based `order` within the parent, since translated content is
 * expected to mirror the English tree's structure exactly (same counts, same
 * order) -- only the text changes.
 */
interface RuOverlay {
  stagesBySlug: Map<string, ParsedStage>
  coursesBySlug: Map<string, ParsedCourse>
}

function buildRuOverlay(ruStages: ParsedStage[]): RuOverlay {
  const stagesBySlug = new Map<string, ParsedStage>()
  const coursesBySlug = new Map<string, ParsedCourse>()
  for (const stage of ruStages) {
    stagesBySlug.set(stage.data.slug, stage)
    for (const course of stage.courses) {
      coursesBySlug.set(course.data.slug, course)
    }
  }
  return { stagesBySlug, coursesBySlug }
}

function compile(stages: ParsedStage[], ru?: RuOverlay) {
  return stages.map(stage => {
    const ruStage = ru?.stagesBySlug.get(stage.data.slug)
    return {
      ...stage.data,
      titleRu: ruStage?.data.title,
      subtitleRu: ruStage?.data.subtitle,
      courses: stage.courses.map(course => {
        const ruCourse = ru?.coursesBySlug.get(course.data.slug)
        return {
          ...course.data,
          titleRu: ruCourse?.data.title,
          descriptionRu: ruCourse?.data.description,
          lessons: course.lessons.map(lesson => {
            const l = lesson.data
            const ruLesson = ruCourse?.lessons.find(rl => rl.data.order === l.order)?.data
            return {
              order: l.order,
              title: l.title,
              titleRu: ruLesson?.title,
              estimatedDuration: calculateEstimatedDuration(l.theory.length, l.tasks.length),
              blocks: l.theory.map((block, i) => {
                const ruBlock = ruLesson?.theory[i]
                return {
                  order: i + 1,
                  type: 'THEORY' as const,
                  title: block.title,
                  content: block.content,
                  titleRu: ruBlock?.title,
                  contentRu: ruBlock?.content,
                }
              }),
              tasks: l.tasks.map((task, i) => {
                const ruTask = ruLesson?.tasks[i]
                const compiled: Record<string, unknown> = {
                  order: i + 1,
                  type: task.type,
                  title: task.title,
                  question: 'question' in task ? task.question : undefined,
                  explanation: task.explanation,
                  points: task.points,
                  difficulty: task.difficulty,
                  meta: 'meta' in task ? task.meta : undefined,
                  titleRu: ruTask?.title,
                  questionRu: ruTask && 'question' in ruTask ? ruTask.question : undefined,
                  explanationRu: ruTask?.explanation,
                  metaRu: ruTask && 'meta' in ruTask ? ruTask.meta : undefined,
                }
                if (task.type === 'SINGLE_CHOICE' || task.type === 'MULTI_CHOICE') {
                  const ruOptions =
                    ruTask && (ruTask.type === 'SINGLE_CHOICE' || ruTask.type === 'MULTI_CHOICE')
                      ? ruTask.options
                      : undefined
                  compiled.options = task.options.map((o, oi) => ({
                    order: oi + 1,
                    text: o.text,
                    isCorrect: o.isCorrect,
                    textRu: ruOptions?.[oi]?.text,
                  }))
                  if (task.type === 'SINGLE_CHOICE') {
                    compiled.correctAnswerIndex = task.options.findIndex(o => o.isCorrect)
                  }
                }
                if (task.type === 'SHORT_ANSWER' || task.type === 'TEXT_INPUT') {
                  compiled.correctAnswer = task.correctAnswer
                  compiled.correctAnswerRu =
                    ruTask && (ruTask.type === 'SHORT_ANSWER' || ruTask.type === 'TEXT_INPUT')
                      ? ruTask.correctAnswer
                      : undefined
                }
                return compiled
              }),
            }
          }),
          test: course.test
            ? {
                title: course.test.title,
                description: course.test.description,
                passingScore: course.test.passingScore,
                titleRu: ruCourse?.test?.title,
                descriptionRu: ruCourse?.test?.description,
                questions: course.test.questions.map((q, i) => {
                  const ruQuestion = ruCourse?.test?.questions[i]
                  return {
                    order: i + 1,
                    text: q.text,
                    type: q.type,
                    textRu: ruQuestion?.text,
                    options: q.options.map((o, oi) => ({
                      order: oi + 1,
                      text: o.text,
                      isCorrect: o.isCorrect,
                      textRu: ruQuestion?.options[oi]?.text,
                    })),
                    correctAnswerIndex:
                      q.type === 'SINGLE_CHOICE' ? q.options.findIndex(o => o.isCorrect) : undefined,
                  }
                }),
              }
            : undefined,
        }
      }),
    }
  })
}

export interface ContentStats {
	stages: number
	courses: number
	lessons: number
	tasks: number
	tests: number
}

export type CompiledStage = ReturnType<typeof compile>[number]

export interface LoadedContent {
	stages: CompiledStage[]
	stats: ContentStats
}

/**
 * Parses, validates and compiles a `content/` tree into the exact shape the
 * seed inserts.
 *
 * Throws on the first validation failure rather than returning partial data —
 * a seed must never write content that failed its own quality checks.
 */
function loadStagesTree(contentDir: string): { stages: ParsedStage[]; problems: Problem[] } {
	const stagesDir = join(contentDir, 'stages')
	if (!existsSync(stagesDir)) {
		throw new Error(`No "stages" directory found under ${contentDir}`)
	}

	const problems: Problem[] = []
	const stages: ParsedStage[] = []

	for (const name of dirs(stagesDir)) {
		const stage = loadStage(join(stagesDir, name), problems)
		if (stage) stages.push(stage)
	}

	if (problems.length === 0) {
		problems.push(
			...validateContentTree(stages).map(message => ({
				file: '(cross-file)',
				message,
			}))
		)
	}

	return { stages, problems }
}

/**
 * @param ruContentDir Optional Russian content tree (e.g. `content-ru/`),
 * mirroring `contentDir`'s stage/course slugs and lesson/task/question
 * ordering exactly. Validated against the same schema as the English tree —
 * a translated lesson must independently satisfy the same word-count,
 * distractor-count, and red-flag-substring rules. Items with no Russian
 * counterpart simply compile with undefined `*Ru` fields (English fallback).
 */
export function loadContent(contentDir: string, ruContentDir?: string): LoadedContent {
	const { stages, problems } = loadStagesTree(contentDir)

	let ruOverlay: RuOverlay | undefined
	if (ruContentDir && existsSync(ruContentDir)) {
		const ruTree = loadStagesTree(ruContentDir)
		if (ruTree.problems.length > 0) {
			const details = ruTree.problems.map(p => `  [${p.file}]\n    ${p.message}`).join('\n')
			throw new Error(`${ruTree.problems.length} content problem(s) found in ${ruContentDir}:\n\n${details}`)
		}
		ruOverlay = buildRuOverlay(ruTree.stages)
	}

	if (problems.length > 0) {
		const details = problems.map(p => `  [${p.file}]\n    ${p.message}`).join('\n')
		throw new Error(`${problems.length} content problem(s) found:\n\n${details}`)
	}

	return {
		stages: compile(stages, ruOverlay),
		stats: {
			stages: stages.length,
			courses: stages.reduce((n, s) => n + s.courses.length, 0),
			lessons: stages.reduce(
				(n, s) => n + s.courses.reduce((m, c) => m + c.lessons.length, 0),
				0
			),
			tasks: stages.reduce(
				(n, s) =>
					n +
					s.courses.reduce(
						(m, c) => m + c.lessons.reduce((k, l) => k + l.data.tasks.length, 0),
						0
					),
				0
			),
			tests: stages.reduce((n, s) => n + s.courses.filter(c => c.test).length, 0),
		},
	}
}

export function describeStats(stats: ContentStats): string {
	return `${stats.stages} stage(s), ${stats.courses} course(s), ${stats.lessons} lesson(s), ${stats.tasks} task(s), ${stats.tests} test(s)`
}
