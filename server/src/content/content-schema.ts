/**
 * content-schema.ts
 *
 * Zod schema for the file-based course-content pipeline (Phase 0 of the
 * content generation plan). This validates stage.yaml / course.yaml /
 * lesson *.md (frontmatter + body) / test.yaml files BEFORE they are
 * compiled into Prisma `createMany` input by parse-content.ts.
 *
 * This mirrors server/prisma/schema.prisma field-for-field. Two places
 * deliberately do NOT map 1:1 to a DB column, and both are documented
 * inline where they occur:
 *
 *   1. TaskOption has no per-option "why is this right/wrong" column.
 *      Per-option rationale is authored in content and stored in
 *      Task.meta.optionRationale (a parallel array, same order as
 *      `options`) instead of requiring a migration. See ChoiceMeta.
 *
 *   2. TestQuestion has no `meta` Json column and no `correctAnswer`
 *      string column -- only `correctAnswerIndex` (Int?) plus
 *      TestQuestionOption.isCorrect. That means course-final tests can
 *      only use SINGLE_CHOICE / MULTI_CHOICE questions: SHORT_ANSWER,
 *      TEXT_INPUT, PHISHING_EMAIL and PHISHING_SITE are valid for lesson
 *      Tasks but are rejected here for TestQuestion. If you need those in
 *      a final test, that's a migration, not a content-schema workaround.
 */

import { z } from 'zod'

/* ------------------------------------------------------------------ */
/*  Enums -- copied verbatim from schema.prisma                       */
/* ------------------------------------------------------------------ */

export const TaskTypeEnum = z.enum([
  'SINGLE_CHOICE',
  'MULTI_CHOICE',
  'SHORT_ANSWER',
  'PHISHING_EMAIL',
  'PHISHING_SITE',
  'TEXT_INPUT',
])
export type TaskType = z.infer<typeof TaskTypeEnum>

export const DifficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD'])
export type Difficulty = z.infer<typeof DifficultyEnum>

export const BlockTypeEnum = z.enum(['THEORY'])
export type BlockType = z.infer<typeof BlockTypeEnum>

const DIFFICULTY_RANK: Record<Difficulty, number> = { EASY: 1, MEDIUM: 2, HARD: 3 }

/* ------------------------------------------------------------------ */
/*  Shared primitives                                                 */
/* ------------------------------------------------------------------ */

const slugField = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'slug must be kebab-case: lowercase a-z, 0-9, single hyphens')

const nonEmpty = (label: string, min = 1) =>
  z.string().trim().min(min, `${label} must be at least ${min} character(s)`)

/* ------------------------------------------------------------------ */
/*  Red flags -- PHISHING_EMAIL / PHISHING_SITE simulator payload     */
/* ------------------------------------------------------------------ */

const RedFlagLocation = z.enum(['from', 'subject', 'body', 'url', 'page'])

const RedFlag = z.object({
  id: slugField, // stable id, e.g. "sender-domain" -- must be unique within the task
  location: RedFlagLocation, // which field of the simulated content the span lives in
  span: nonEmpty('redFlag.span').max(120, 'span should be a short exact substring, not a paragraph'),
  reason: nonEmpty('redFlag.reason', 15), // shown to the learner after they click it
})
export type RedFlagInput = z.infer<typeof RedFlag>

const redFlagsArray = z
  .array(RedFlag)
  .min(3, 'need at least 3 red flags for the simulator to be meaningful')
  .refine(
    flags => new Set(flags.map(f => f.id)).size === flags.length,
    { message: 'redFlag ids must be unique within a task' }
  )

/* ------------------------------------------------------------------ */
/*  meta payloads, keyed by TaskType                                  */
/* ------------------------------------------------------------------ */

const ChoiceMeta = z
  .object({
    optionRationale: z.array(nonEmpty('optionRationale entry', 10)).optional(),
  })
  .strict()
  .optional()

const PhishingEmailMeta = z.object({
  email: z.object({
    from: nonEmpty('meta.email.from'), // the actual (spoofed) address -- what the simulator matches red flags against
    displayName: z.string().optional(), // the friendly name shown in an inbox list, independent of `from`
    subject: nonEmpty('meta.email.subject'),
    body: nonEmpty('meta.email.body', 40), // markdown, rendered inside the simulator
  }),
  redFlags: redFlagsArray,
})

const PhishingSiteMeta = z.object({
  site: z.object({
    url: nonEmpty('meta.site.url'), // what shows in the fake address bar
    title: z.string().optional(),
    page: nonEmpty('meta.site.page', 40), // markdown/plain description of the visible page elements
  }),
  redFlags: redFlagsArray,
})

const ShortAnswerMeta = z
  .object({
    acceptedAnswers: z.array(z.string().trim().min(1)).optional(),
    caseSensitive: z.boolean().optional(),
  })
  .strict()
  .optional()

/* ------------------------------------------------------------------ */
/*  TaskOption                                                        */
/* ------------------------------------------------------------------ */

const TaskOption = z.object({
  text: nonEmpty('option.text'),
  isCorrect: z.boolean(),
})
export type TaskOptionInput = z.infer<typeof TaskOption>

function countDistractors(options: TaskOptionInput[]) {
  return options.filter(o => !o.isCorrect).length
}

/* ------------------------------------------------------------------ */
/*  Task -- discriminated union on `type`                             */
/* ------------------------------------------------------------------ */

const TaskBase = z.object({
  title: nonEmpty('task.title'),
  question: z.string().optional(),
  explanation: nonEmpty('task.explanation', 30), // required for EVERY task type, no exceptions
  points: z.number().int().positive().default(10),
  difficulty: DifficultyEnum.default('MEDIUM'),
})

const SingleChoiceTask = TaskBase.extend({
  type: z.literal('SINGLE_CHOICE'),
  options: z.array(TaskOption).min(4, 'SINGLE_CHOICE needs 1 correct option + >=3 distractors (4 total)'),
  meta: ChoiceMeta,
})

const MultiChoiceTask = TaskBase.extend({
  type: z.literal('MULTI_CHOICE'),
  options: z.array(TaskOption).min(5, 'MULTI_CHOICE needs >=2 correct options + >=3 distractors (5 total)'),
  meta: ChoiceMeta,
})

const ShortAnswerTask = TaskBase.extend({
  type: z.literal('SHORT_ANSWER'),
  correctAnswer: nonEmpty('task.correctAnswer'),
  meta: ShortAnswerMeta,
})

const TextInputTask = TaskBase.extend({
  type: z.literal('TEXT_INPUT'),
  correctAnswer: nonEmpty('task.correctAnswer'),
  meta: ShortAnswerMeta,
})

const PhishingEmailTask = TaskBase.extend({
  type: z.literal('PHISHING_EMAIL'),
  meta: PhishingEmailMeta,
})

const PhishingSiteTask = TaskBase.extend({
  type: z.literal('PHISHING_SITE'),
  meta: PhishingSiteMeta,
})

export const Task = z
  .discriminatedUnion('type', [
    SingleChoiceTask,
    MultiChoiceTask,
    ShortAnswerTask,
    TextInputTask,
    PhishingEmailTask,
    PhishingSiteTask,
  ])
  .superRefine((t, ctx) => {
    if (t.type === 'SINGLE_CHOICE' || t.type === 'MULTI_CHOICE') {
      const correct = t.options.filter(o => o.isCorrect).length
      const distractors = countDistractors(t.options)

      if (t.type === 'SINGLE_CHOICE' && correct !== 1) {
        ctx.addIssue({
          code: 'custom',
          message: `SINGLE_CHOICE must have exactly one isCorrect option (found ${correct})`,
          path: ['options'],
        })
      }
      if (t.type === 'MULTI_CHOICE' && correct < 2) {
        ctx.addIssue({
          code: 'custom',
          message: `MULTI_CHOICE needs at least 2 correct options (found ${correct})`,
          path: ['options'],
        })
      }
      if (distractors < 3) {
        ctx.addIssue({
          code: 'custom',
          message: `need at least 3 distractors / wrong options (found ${distractors})`,
          path: ['options'],
        })
      }
      if (t.meta?.optionRationale && t.meta.optionRationale.length !== t.options.length) {
        ctx.addIssue({
          code: 'custom',
          message: `meta.optionRationale must have exactly one entry per option, same order (options: ${t.options.length}, rationale: ${t.meta.optionRationale.length})`,
          path: ['meta', 'optionRationale'],
        })
      }
    }

    if (t.type === 'PHISHING_EMAIL' || t.type === 'PHISHING_SITE') {
      const allowedLocations = t.type === 'PHISHING_EMAIL' ? ['from', 'subject', 'body'] : ['url', 'page']
      const haystacks: Record<string, string> =
        t.type === 'PHISHING_EMAIL'
          ? { from: t.meta.email.from, subject: t.meta.email.subject, body: t.meta.email.body }
          : { url: t.meta.site.url, page: t.meta.site.page }

      t.meta.redFlags.forEach((flag, i) => {
        if (!allowedLocations.includes(flag.location)) {
          ctx.addIssue({
            code: 'custom',
            message: `redFlags[${i}].location must be one of ${allowedLocations.join(', ')} for ${t.type} (got "${flag.location}")`,
            path: ['meta', 'redFlags', i, 'location'],
          })
          return
        }
        const haystack = haystacks[flag.location]
        if (!haystack.includes(flag.span)) {
          ctx.addIssue({
            code: 'custom',
            message: `redFlags[${i}].span ${JSON.stringify(flag.span)} does not appear verbatim in meta.${
              t.type === 'PHISHING_EMAIL' ? 'email' : 'site'
            }.${flag.location} -- the simulator can't highlight text that isn't there`,
            path: ['meta', 'redFlags', i, 'span'],
          })
        }
      })
    }
  })
export type TaskInput = z.infer<typeof Task>

/* ------------------------------------------------------------------ */
/*  Theory blocks (parsed from the lesson .md body, see parse-content) */
/* ------------------------------------------------------------------ */

export const TheoryBlock = z
  .object({
    title: nonEmpty('block.title'),
    content: nonEmpty('block.content', 20),
    isCase: z.boolean().optional(), // true for the block marked `{#case}` in its heading
  })
  .superRefine((b, ctx) => {
    if (b.isCase && !/]\(https?:\/\/[^)]+\)/.test(b.content)) {
      ctx.addIssue({
        code: 'custom',
        message: 'the real-case block must cite a primary source as a markdown link, e.g. [NPR](https://...)',
        path: ['content'],
      })
    }
  })
export type TheoryBlockInput = z.infer<typeof TheoryBlock>

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length
}

export const LessonTheory = z
  .array(TheoryBlock)
  .min(2, 'need 2-4 THEORY blocks')
  .max(4, 'need 2-4 THEORY blocks')
  .superRefine((blocks, ctx) => {
    // NOTE: plain `.refine()` chained after `.min()/.max()` produced an
    // unhelpful generic "Invalid input" message under the installed zod
    // version -- superRefine + ctx.addIssue is the pattern proven to work
    // elsewhere in this file (see Task's superRefine below), so every
    // custom check in this file uses it consistently.
    if (!blocks.some(b => b.isCase)) {
      ctx.addIssue({
        code: 'custom',
        message: 'lesson must include at least one real-case THEORY block (mark its heading with {#case})',
      })
    }
    const words = blocks.reduce((sum, b) => sum + wordCount(b.content), 0)
    if (words < 400 || words > 700) {
      ctx.addIssue({
        code: 'custom',
        message: `total theory word count should be 400-700 (got ${words})`,
      })
    }
  })

/* ------------------------------------------------------------------ */
/*  Lesson (frontmatter fields + parsed theory)                       */
/* ------------------------------------------------------------------ */

const Objectives = z
  .array(nonEmpty('objective', 15))
  .min(2, 'need 2-3 learning objectives')
  .max(3, 'need 2-3 learning objectives')

const Tasks = z
  .array(Task)
  .min(5, 'need 5-7 tasks per lesson')
  .max(7, 'need 5-7 tasks per lesson')
  .refine(
    tasks => {
      const ranks = tasks.map(t => DIFFICULTY_RANK[t.difficulty])
      return ranks.every((r, i) => i === 0 || r >= ranks[i - 1])
    },
    { message: 'task difficulty must trend non-decreasing across the lesson (EASY -> HARD), no HARD-then-EASY ordering' }
  )

export const LessonContent = z.object({
  order: z.number().int().positive(),
  title: nonEmpty('lesson.title'),
  objectives: Objectives,
  theory: LessonTheory,
  tasks: Tasks,
})
export type LessonContentInput = z.infer<typeof LessonContent>

// What actually lives in the .md frontmatter (theory comes from the body instead)
export const LessonFrontmatter = LessonContent.omit({ theory: true })
export type LessonFrontmatterInput = z.infer<typeof LessonFrontmatter>

/* ------------------------------------------------------------------ */
/*  Stage / Course                                                    */
/* ------------------------------------------------------------------ */

export const StageFrontmatter = z.object({
  order: z.number().int().positive(),
  slug: slugField,
  title: nonEmpty('stage.title'),
  subtitle: z.string().optional(),
  icon: z.string().optional(), // Phosphor-compatible icon slug
})
export type StageFrontmatterInput = z.infer<typeof StageFrontmatter>

export const CourseFrontmatter = z.object({
  slug: slugField,
  title: nonEmpty('course.title'),
  description: nonEmpty('course.description', 10),
  difficulty: DifficultyEnum.default('MEDIUM'),
})
export type CourseFrontmatterInput = z.infer<typeof CourseFrontmatter>

/* ------------------------------------------------------------------ */
/*  Test (course-final test) -- SINGLE_CHOICE / MULTI_CHOICE only,    */
/*  see file header note #2                                           */
/* ------------------------------------------------------------------ */

const TestQuestionType = z.enum(['SINGLE_CHOICE', 'MULTI_CHOICE'])

const TestQuestionOption = z.object({
  text: nonEmpty('testOption.text'),
  isCorrect: z.boolean(),
})

const TestQuestionInput = z
  .object({
    text: nonEmpty('question.text'),
    type: TestQuestionType,
    options: z.array(TestQuestionOption).min(4),
  })
  .superRefine((q, ctx) => {
    const correct = q.options.filter(o => o.isCorrect).length
    const distractors = q.options.length - correct
    if (q.type === 'SINGLE_CHOICE' && correct !== 1) {
      ctx.addIssue({
        code: 'custom',
        message: `SINGLE_CHOICE test question needs exactly one correct option (found ${correct})`,
        path: ['options'],
      })
    }
    if (q.type === 'MULTI_CHOICE' && correct < 2) {
      ctx.addIssue({
        code: 'custom',
        message: `MULTI_CHOICE test question needs at least 2 correct options (found ${correct})`,
        path: ['options'],
      })
    }
    if (distractors < 3) {
      ctx.addIssue({
        code: 'custom',
        message: `need at least 3 distractors (found ${distractors})`,
        path: ['options'],
      })
    }
  })

export const TestFrontmatter = z.object({
  title: nonEmpty('test.title'),
  description: z.string().optional(),
  passingScore: z.number().int().min(0).max(100).default(80),
  questions: z.array(TestQuestionInput).min(8, 'need 8-10 questions').max(10, 'need 8-10 questions'),
})
export type TestFrontmatterInput = z.infer<typeof TestFrontmatter>

/* ------------------------------------------------------------------ */
/*  Cross-file tree validation (uniqueness / ordering across files)   */
/* ------------------------------------------------------------------ */

export interface ParsedLesson {
  file: string
  data: LessonContentInput
}

export interface ParsedCourse {
  dir: string
  data: CourseFrontmatterInput
  lessons: ParsedLesson[]
  test?: TestFrontmatterInput
}

export interface ParsedStage {
  dir: string
  data: StageFrontmatterInput
  courses: ParsedCourse[]
}

export function validateContentTree(stages: ParsedStage[]): string[] {
  const problems: string[] = []

  const stageSlugs = new Map<string, string>()
  const stageOrders = new Map<number, string>()
  const courseSlugs = new Map<string, string>() // Course.slug is globally @unique in the DB, not just per-stage

  for (const stage of stages) {
    const { slug, order } = stage.data

    if (stageSlugs.has(slug)) {
      problems.push(`duplicate stage slug "${slug}": ${stage.dir} and ${stageSlugs.get(slug)}`)
    }
    stageSlugs.set(slug, stage.dir)

    if (stageOrders.has(order)) {
      problems.push(`duplicate stage order ${order}: ${stage.dir} and ${stageOrders.get(order)}`)
    }
    stageOrders.set(order, stage.dir)

    for (const course of stage.courses) {
      if (courseSlugs.has(course.data.slug)) {
        problems.push(`duplicate course slug "${course.data.slug}": ${course.dir} and ${courseSlugs.get(course.data.slug)}`)
      }
      courseSlugs.set(course.data.slug, course.dir)

      const orders = course.lessons.map(l => l.data.order).sort((a, b) => a - b)
      orders.forEach((o, i) => {
        if (o !== i + 1) {
          problems.push(
            `course "${course.data.slug}": lesson order should be 1..${orders.length} with no gaps/duplicates, but position ${i + 1} is ${o}`
          )
        }
      })
    }
  }

  const stageOrderValues = [...stageOrders.keys()].sort((a, b) => a - b)
  stageOrderValues.forEach((o, i) => {
    if (o !== i + 1) {
      problems.push(`stage order should be 1..${stageOrderValues.length} with no gaps/duplicates, but position ${i + 1} is ${o}`)
    }
  })

  return problems
}
