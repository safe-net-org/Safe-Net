import { AchievementCategory, AchievementTier } from '@prisma/client'

/**
 * Single source of truth for every achievement in the platform.
 *
 * Both the seed and the awarding logic import this file. Previously the codes
 * were free-form strings duplicated in `seed.ts` and `achievements.service.ts`,
 * which silently broke two achievements (`PERFECT_SCORE` was seeded but
 * `PERFECT_STREAK` was awarded, so it could never be earned). Deriving
 * `AchievementCode` from this array turns that class of typo into a compile
 * error.
 *
 * Each rule is a pure predicate over an `AchievementStats` snapshot, so the
 * rules are unit-testable without a database, and evaluating all of them costs
 * one batch of queries instead of one query per achievement.
 */

/**
 * A snapshot of everything the rules need, collected once per evaluation.
 */
export interface AchievementStats {
	/** Sum of XP across every course. */
	totalXp: number
	certificateCount: number
	completedLessonCount: number
	/** `order` of every stage whose courses are all certified. */
	completedStageOrders: number[]
	/** Slugs of every certified course, lowercased. */
	completedCourseSlugs: string[]
	/** Phishing-simulator tasks answered correctly on the first attempt. */
	phishingFirstTryCorrect: number
	/** Every phishing task on the platform solved first try, and there is at least one. */
	allPhishingFirstTry: boolean
	/** Caught every red flag in a phishing email with no misses and no false picks. */
	foundAllRedFlagsInOneEmail: boolean
	/** Length of the current run of correct answers, newest first. */
	currentCorrectStreak: number
	/** Courses certified without a single incorrect attempt. */
	flawlessCourseCount: number
	perfectTestCount: number
	/** Stages where every test was passed at 100%. */
	stagesWithAllTestsPerfect: number
	/** Distinct calendar days with at least one task attempt. */
	longestDayStreak: number
	/** Returned after a gap of 14+ days and completed a lesson. */
	hasComeback: boolean
	/** Tasks first answered wrong and later answered correctly. */
	wrongThenRightCount: number
	/** Most tasks attempted within a single calendar day. */
	maxTasksInOneDay: number
	/** Every lesson, task and test on the platform is done. */
	isCompletionist: boolean
	solvedAtNight: boolean
	solvedEarlyMorning: boolean
	/** Passed a test at >=90% in under half its median completion time. */
	hasFastPerfectTest: boolean
}

export interface AchievementDefinition {
	code: string
	title: string
	description: string
	titleRu: string
	descriptionRu: string
	/** Phosphor-compatible icon slug — the client resolves it via `icons[PascalCase]`. */
	icon: string
	category: AchievementCategory
	tier: AchievementTier
	xpReward: number
	isSecret: boolean
	order: number
	/**
	 * Pure rule. `FIRST_LOGIN` has none — it is awarded directly on
	 * registration, since no stats snapshot can observe "an account exists".
	 */
	isEarned?: (stats: AchievementStats) => boolean
}

const PHISHING_EYE_BRONZE_TARGET = 10
const PHISHING_EYE_SILVER_TARGET = 30
const SNIPER_BRONZE_TARGET = 10
const SNIPER_SILVER_TARGET = 25
const SNIPER_GOLD_TARGET = 50
const RESILIENT_TARGET = 10
const MARATHON_TARGET = 20
const XP_RISING_TARGET = 1000
const XP_MACHINE_TARGET = 5000
const ADVANCED_STAGE_TARGET = 4
const TOTAL_STAGES = 8

/** Certified every course whose slug contains this fragment. */
const hasMasteredStage = (stats: AchievementStats, stageOrder: number) =>
	stats.completedStageOrders.includes(stageOrder)

// `as const satisfies` (not a plain `: AchievementDefinition[]` annotation) is
// what keeps `code` a literal union below instead of widening it to `string` —
// that widening is exactly what let the PERFECT_SCORE/PERFECT_STREAK typo ship.
export const ACHIEVEMENTS = [
	// ---------------------------------------------------------------- SKILL
	// The platform's whole purpose is phishing detection, so the skill tree
	// rewards detection accuracy rather than mere exposure.
	{
		code: 'PHISH_EYE_I',
		title: 'Sharp Eye',
		description: `Spotted ${PHISHING_EYE_BRONZE_TARGET} phishing attempts on the first try`,
		titleRu: 'Зоркий глаз',
		descriptionRu: `Распознали ${PHISHING_EYE_BRONZE_TARGET} фишинговых попыток с первой попытки`,
		icon: 'eye',
		category: AchievementCategory.SKILL,
		tier: AchievementTier.BRONZE,
		xpReward: 50,
		isSecret: false,
		order: 1,
		isEarned: s => s.phishingFirstTryCorrect >= PHISHING_EYE_BRONZE_TARGET,
	},
	{
		code: 'PHISH_EYE_II',
		title: 'Phish Hunter',
		description: `Spotted ${PHISHING_EYE_SILVER_TARGET} phishing attempts on the first try`,
		titleRu: 'Охотник за фишингом',
		descriptionRu: `Распознали ${PHISHING_EYE_SILVER_TARGET} фишинговых попыток с первой попытки`,
		icon: 'fish',
		category: AchievementCategory.SKILL,
		tier: AchievementTier.SILVER,
		xpReward: 150,
		isSecret: false,
		order: 2,
		isEarned: s => s.phishingFirstTryCorrect >= PHISHING_EYE_SILVER_TARGET,
	},
	{
		code: 'PHISH_EYE_III',
		title: 'Unphishable',
		description: 'Solved every phishing task on the platform on the first try',
		titleRu: 'Неуловимый',
		descriptionRu: 'Решили каждое фишинговое задание на платформе с первой попытки',
		icon: 'shield-check',
		category: AchievementCategory.SKILL,
		tier: AchievementTier.GOLD,
		xpReward: 400,
		isSecret: false,
		order: 3,
		isEarned: s => s.allPhishingFirstTry,
	},
	{
		code: 'RED_FLAG_HUNTER',
		title: 'Red Flag Hunter',
		description: 'Found every red flag in a phishing email — no misses',
		titleRu: 'Охотник за красными флагами',
		descriptionRu: 'Нашли каждый тревожный признак в фишинговом письме — без единого промаха',
		icon: 'flag',
		category: AchievementCategory.SKILL,
		tier: AchievementTier.SILVER,
		xpReward: 120,
		isSecret: false,
		order: 4,
		isEarned: s => s.foundAllRedFlagsInOneEmail,
	},
	// A "Not Today, Scammer" achievement for recognising a *legitimate* message
	// as safe was designed and then cut: the content schema requires at least
	// three red flags per simulator task, so no legitimate messages exist to
	// recognise. Shipping it would have added a sixth permanently unearnable
	// achievement — the exact bug this catalog was written to kill. It comes
	// back when the content gains genuinely safe messages to judge.

	// ------------------------------------------------------------ PRECISION
	{
		code: 'SNIPER_I',
		title: 'Steady Hand',
		description: `${SNIPER_BRONZE_TARGET} correct answers in a row`,
		titleRu: 'Твёрдая рука',
		descriptionRu: `${SNIPER_BRONZE_TARGET} правильных ответов подряд`,
		icon: 'target',
		category: AchievementCategory.PRECISION,
		tier: AchievementTier.BRONZE,
		xpReward: 40,
		isSecret: false,
		order: 1,
		isEarned: s => s.currentCorrectStreak >= SNIPER_BRONZE_TARGET,
	},
	{
		code: 'SNIPER_II',
		title: 'Sniper',
		description: `${SNIPER_SILVER_TARGET} correct answers in a row`,
		titleRu: 'Снайпер',
		descriptionRu: `${SNIPER_SILVER_TARGET} правильных ответов подряд`,
		icon: 'crosshair',
		category: AchievementCategory.PRECISION,
		tier: AchievementTier.SILVER,
		xpReward: 120,
		isSecret: false,
		order: 2,
		isEarned: s => s.currentCorrectStreak >= SNIPER_SILVER_TARGET,
	},
	{
		code: 'SNIPER_III',
		title: 'Perfect Score',
		description: `${SNIPER_GOLD_TARGET} correct answers in a row`,
		titleRu: 'Идеальный результат',
		descriptionRu: `${SNIPER_GOLD_TARGET} правильных ответов подряд`,
		icon: 'star',
		category: AchievementCategory.PRECISION,
		tier: AchievementTier.GOLD,
		xpReward: 300,
		isSecret: false,
		order: 3,
		isEarned: s => s.currentCorrectStreak >= SNIPER_GOLD_TARGET,
	},
	{
		code: 'FLAWLESS',
		title: 'Flawless',
		description: 'Completed a whole course without a single wrong answer',
		titleRu: 'Безупречно',
		descriptionRu: 'Прошли целый курс без единого неправильного ответа',
		icon: 'gem',
		category: AchievementCategory.PRECISION,
		tier: AchievementTier.GOLD,
		xpReward: 250,
		isSecret: false,
		order: 4,
		isEarned: s => s.flawlessCourseCount >= 1,
	},
	{
		code: 'PERFECT_TEST',
		title: 'Full Marks',
		description: 'Scored 100% on a final test',
		titleRu: 'Высший балл',
		descriptionRu: 'Набрали 100% на итоговом тесте',
		icon: 'badge-check',
		category: AchievementCategory.PRECISION,
		tier: AchievementTier.SILVER,
		xpReward: 100,
		isSecret: false,
		order: 5,
		isEarned: s => s.perfectTestCount >= 1,
	},
	{
		code: 'CLEAN_SWEEP',
		title: 'Clean Sweep',
		description: 'Scored 100% on every test in a stage',
		titleRu: 'Чистая победа',
		descriptionRu: 'Набрали 100% на каждом тесте этапа',
		icon: 'sparkles',
		category: AchievementCategory.PRECISION,
		tier: AchievementTier.PLATINUM,
		xpReward: 500,
		isSecret: false,
		order: 6,
		isEarned: s => s.stagesWithAllTestsPerfect >= 1,
	},

	// -------------------------------------------------------------- MASTERY
	{
		code: 'SECURITY_NOVICE',
		title: 'Security Novice',
		description: 'Completed the Security Basics stage',
		titleRu: 'Новичок в безопасности',
		descriptionRu: 'Завершили этап «Основы безопасности»',
		icon: 'shield',
		category: AchievementCategory.MASTERY,
		tier: AchievementTier.BRONZE,
		xpReward: 100,
		isSecret: false,
		order: 1,
		isEarned: s => hasMasteredStage(s, 1),
	},
	{
		code: 'PHISHING_MASTER',
		title: 'Phishing Master',
		description: 'Completed the Phishing & Fraud stage',
		titleRu: 'Мастер по фишингу',
		descriptionRu: 'Завершили этап «Фишинг и мошенничество»',
		icon: 'fish',
		category: AchievementCategory.MASTERY,
		tier: AchievementTier.SILVER,
		xpReward: 150,
		isSecret: false,
		order: 2,
		isEarned: s => hasMasteredStage(s, 2),
	},
	{
		code: 'LINK_INSPECTOR',
		title: 'Link Inspector',
		description: 'Completed the Dangerous Links stage',
		titleRu: 'Инспектор ссылок',
		descriptionRu: 'Завершили этап «Опасные ссылки»',
		icon: 'link-2-off',
		category: AchievementCategory.MASTERY,
		tier: AchievementTier.SILVER,
		xpReward: 150,
		isSecret: false,
		order: 3,
		isEarned: s => hasMasteredStage(s, 3),
	},
	{
		code: 'PASSWORD_EXPERT',
		title: 'Password Expert',
		description: 'Completed the Passwords stage',
		titleRu: 'Эксперт по паролям',
		descriptionRu: 'Завершили этап «Пароли»',
		icon: 'key',
		category: AchievementCategory.MASTERY,
		tier: AchievementTier.SILVER,
		xpReward: 150,
		isSecret: false,
		order: 4,
		isEarned: s => hasMasteredStage(s, 4),
	},
	{
		code: 'MALWARE_HUNTER',
		title: 'Malware Hunter',
		description: 'Completed the Malware stage',
		titleRu: 'Охотник за вредоносным ПО',
		descriptionRu: 'Завершили этап «Вредоносное ПО»',
		icon: 'bug-off',
		category: AchievementCategory.MASTERY,
		tier: AchievementTier.SILVER,
		xpReward: 150,
		isSecret: false,
		order: 5,
		isEarned: s => hasMasteredStage(s, 5),
	},
	{
		code: 'SOCIAL_SHIELD',
		title: 'Social Shield',
		description: 'Completed the Social Media stage',
		titleRu: 'Щит соцсетей',
		descriptionRu: 'Завершили этап «Социальные сети»',
		icon: 'users',
		category: AchievementCategory.MASTERY,
		tier: AchievementTier.SILVER,
		xpReward: 150,
		isSecret: false,
		order: 6,
		isEarned: s => hasMasteredStage(s, 6),
	},
	{
		code: 'PRIVACY_GUARDIAN',
		title: 'Privacy Guardian',
		description: 'Completed the Personal Data stage',
		titleRu: 'Страж приватности',
		descriptionRu: 'Завершили этап «Персональные данные»',
		icon: 'eye-off',
		category: AchievementCategory.MASTERY,
		tier: AchievementTier.SILVER,
		xpReward: 150,
		isSecret: false,
		order: 7,
		isEarned: s => hasMasteredStage(s, 7),
	},
	{
		code: 'INCIDENT_RESPONDER',
		title: 'Incident Responder',
		description: 'Completed the Advanced Level stage',
		titleRu: 'Специалист по реагированию',
		descriptionRu: 'Завершили этап «Продвинутый уровень»',
		icon: 'siren',
		category: AchievementCategory.MASTERY,
		tier: AchievementTier.GOLD,
		xpReward: 200,
		isSecret: false,
		order: 8,
		isEarned: s => hasMasteredStage(s, 8),
	},
	{
		code: 'SECURITY_ADVANCED',
		title: 'Advanced User',
		description: `Completed ${ADVANCED_STAGE_TARGET} learning stages`,
		titleRu: 'Продвинутый пользователь',
		descriptionRu: `Завершили ${ADVANCED_STAGE_TARGET} этапов обучения`,
		icon: 'award',
		category: AchievementCategory.MASTERY,
		tier: AchievementTier.GOLD,
		xpReward: 300,
		isSecret: false,
		order: 9,
		isEarned: s => s.completedStageOrders.length >= ADVANCED_STAGE_TARGET,
	},
	{
		code: 'SECURITY_EXPERT',
		title: 'Security Expert',
		description: `Completed all ${TOTAL_STAGES} stages`,
		titleRu: 'Эксперт по безопасности',
		descriptionRu: `Завершили все ${TOTAL_STAGES} этапов`,
		icon: 'trophy',
		category: AchievementCategory.MASTERY,
		tier: AchievementTier.PLATINUM,
		xpReward: 800,
		isSecret: false,
		order: 10,
		isEarned: s => s.completedStageOrders.length >= TOTAL_STAGES,
	},
	{
		code: 'COMPLETIONIST',
		title: 'Completionist',
		description: 'Finished every lesson, task and test on the platform',
		titleRu: 'Перфекционист',
		descriptionRu: 'Завершили каждый урок, задание и тест на платформе',
		icon: 'crown',
		category: AchievementCategory.MASTERY,
		tier: AchievementTier.PLATINUM,
		xpReward: 1000,
		isSecret: false,
		order: 11,
		isEarned: s => s.isCompletionist,
	},

	// ---------------------------------------------------------- PERSISTENCE
	{
		code: 'STREAK_3',
		title: 'Warming Up',
		description: 'Practised 3 days in a row',
		titleRu: 'Разминка',
		descriptionRu: 'Занимались 3 дня подряд',
		icon: 'flame',
		category: AchievementCategory.PERSISTENCE,
		tier: AchievementTier.BRONZE,
		xpReward: 30,
		isSecret: false,
		order: 1,
		isEarned: s => s.longestDayStreak >= 3,
	},
	{
		code: 'STREAK_7',
		title: 'On a Roll',
		description: 'Practised 7 days in a row',
		titleRu: 'В ударе',
		descriptionRu: 'Занимались 7 дней подряд',
		icon: 'flame',
		category: AchievementCategory.PERSISTENCE,
		tier: AchievementTier.SILVER,
		xpReward: 100,
		isSecret: false,
		order: 2,
		isEarned: s => s.longestDayStreak >= 7,
	},
	{
		code: 'STREAK_30',
		title: 'Unbreakable',
		description: 'Practised 30 days in a row',
		titleRu: 'Несокрушимый',
		descriptionRu: 'Занимались 30 дней подряд',
		icon: 'calendar-check',
		category: AchievementCategory.PERSISTENCE,
		tier: AchievementTier.PLATINUM,
		xpReward: 600,
		isSecret: false,
		order: 3,
		isEarned: s => s.longestDayStreak >= 30,
	},
	{
		// Most gamified platforms only reward never being wrong, which teaches
		// learners to fear mistakes. Getting it wrong and then getting it right
		// is what learning actually looks like, so it gets its own reward.
		code: 'RESILIENT',
		title: 'Learn From Mistakes',
		description: `Got ${RESILIENT_TARGET} tasks wrong, then came back and solved them`,
		titleRu: 'Учимся на ошибках',
		descriptionRu: `Ошиблись в ${RESILIENT_TARGET} заданиях, но вернулись и решили их`,
		icon: 'refresh-cw',
		category: AchievementCategory.PERSISTENCE,
		tier: AchievementTier.GOLD,
		xpReward: 200,
		isSecret: false,
		order: 4,
		isEarned: s => s.wrongThenRightCount >= RESILIENT_TARGET,
	},
	{
		code: 'COMEBACK',
		title: 'Comeback',
		description: 'Returned after two weeks away and picked up where you left off',
		titleRu: 'Возвращение',
		descriptionRu: 'Вернулись после двух недель отсутствия и продолжили с того же места',
		icon: 'rotate-ccw',
		category: AchievementCategory.PERSISTENCE,
		tier: AchievementTier.BRONZE,
		xpReward: 50,
		isSecret: false,
		order: 5,
		isEarned: s => s.hasComeback,
	},

	// ------------------------------------------------------------ MILESTONE
	{
		code: 'FIRST_LOGIN',
		title: 'Welcome Aboard',
		description: 'Created your account',
		titleRu: 'Добро пожаловать',
		descriptionRu: 'Создали аккаунт',
		icon: 'log-in',
		category: AchievementCategory.MILESTONE,
		tier: AchievementTier.BRONZE,
		xpReward: 10,
		isSecret: false,
		order: 1,
		// Explicitly undefined rather than absent: every entry must carry the key
		// so `achievement.isEarned` stays accessible across the union `as const`
		// produces. Awarded directly at registration instead.
		isEarned: undefined,
	},
	{
		code: 'FIRST_LESSON',
		title: 'First Steps',
		description: 'Completed your first lesson',
		titleRu: 'Первые шаги',
		descriptionRu: 'Завершили свой первый урок',
		icon: 'book-open',
		category: AchievementCategory.MILESTONE,
		tier: AchievementTier.BRONZE,
		xpReward: 20,
		isSecret: false,
		order: 2,
		isEarned: s => s.completedLessonCount >= 1,
	},
	{
		code: 'CERTIFIED',
		title: 'Certified',
		description: 'Earned your first certificate',
		titleRu: 'Сертифицирован',
		descriptionRu: 'Получили свой первый сертификат',
		icon: 'file-badge',
		category: AchievementCategory.MILESTONE,
		tier: AchievementTier.SILVER,
		xpReward: 100,
		isSecret: false,
		order: 3,
		isEarned: s => s.certificateCount >= 1,
	},
	{
		code: 'XP_RISING',
		title: 'Rising Star',
		description: `Earned ${XP_RISING_TARGET} XP`,
		titleRu: 'Восходящая звезда',
		descriptionRu: `Заработали ${XP_RISING_TARGET} XP`,
		icon: 'trending-up',
		category: AchievementCategory.MILESTONE,
		tier: AchievementTier.SILVER,
		xpReward: 100,
		isSecret: false,
		order: 4,
		isEarned: s => s.totalXp >= XP_RISING_TARGET,
	},
	{
		code: 'XP_MACHINE',
		title: 'XP Machine',
		description: `Earned ${XP_MACHINE_TARGET} XP`,
		titleRu: 'Машина опыта',
		descriptionRu: `Заработали ${XP_MACHINE_TARGET} XP`,
		icon: 'rocket',
		category: AchievementCategory.MILESTONE,
		tier: AchievementTier.GOLD,
		xpReward: 300,
		isSecret: false,
		order: 5,
		isEarned: s => s.totalXp >= XP_MACHINE_TARGET,
	},

	// --------------------------------------------------------------- SECRET
	{
		code: 'NIGHT_OWL',
		title: 'Night Owl',
		description: 'Solved a task between midnight and 4 a.m.',
		titleRu: 'Ночная сова',
		descriptionRu: 'Решили задание между полуночью и 4 утра',
		icon: 'moon',
		category: AchievementCategory.SECRET,
		tier: AchievementTier.BRONZE,
		xpReward: 40,
		isSecret: true,
		order: 1,
		isEarned: s => s.solvedAtNight,
	},
	{
		code: 'EARLY_BIRD',
		title: 'Early Bird',
		description: 'Solved a task between 5 and 7 a.m.',
		titleRu: 'Ранняя пташка',
		descriptionRu: 'Решили задание между 5 и 7 утра',
		icon: 'sunrise',
		category: AchievementCategory.SECRET,
		tier: AchievementTier.BRONZE,
		xpReward: 40,
		isSecret: true,
		order: 2,
		isEarned: s => s.solvedEarlyMorning,
	},
	{
		code: 'MARATHON',
		title: 'Marathon',
		description: `Solved ${MARATHON_TARGET} tasks in a single day`,
		titleRu: 'Марафон',
		descriptionRu: `Решили ${MARATHON_TARGET} заданий за один день`,
		icon: 'activity',
		category: AchievementCategory.SECRET,
		tier: AchievementTier.SILVER,
		xpReward: 120,
		isSecret: true,
		order: 3,
		isEarned: s => s.maxTasksInOneDay >= MARATHON_TARGET,
	},
	{
		code: 'SPEED_DEMON',
		title: 'Speed Demon',
		description: 'Passed a test at 90%+ in under half the usual time',
		titleRu: 'Скоростной демон',
		descriptionRu: 'Прошли тест на 90%+ менее чем за половину обычного времени',
		icon: 'timer',
		category: AchievementCategory.SECRET,
		tier: AchievementTier.GOLD,
		xpReward: 200,
		isSecret: true,
		order: 4,
		isEarned: s => s.hasFastPerfectTest,
	},
] as const satisfies readonly AchievementDefinition[]

/**
 * Every valid achievement code. Passing anything else to `awardAchievement`
 * is a compile error rather than a silent no-op.
 */
export type AchievementCode = (typeof ACHIEVEMENTS)[number]['code']

export const ACHIEVEMENT_BY_CODE = new Map<AchievementCode, AchievementDefinition>(
	ACHIEVEMENTS.map(achievement => [achievement.code, achievement])
)
