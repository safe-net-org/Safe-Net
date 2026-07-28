import type { Locale } from './messages'

/**
 * Stage/course titles and descriptions come from the backend (seeded from
 * Markdown/YAML in server/content), always in English — there's no
 * locale-aware content pipeline there yet. Rather than touch the backend,
 * this maps the exact English strings the API returns to Russian, keyed by
 * the canonical English text. If the backend copy changes, entries here
 * silently stop matching and the English fallback is shown — not ideal, but
 * safe.
 */

interface StageCopy {
	title: string
	subtitleLabel: string
}

interface CourseCopy {
	title: string
	description: string
}

const stageTranslationsRu: Record<string, StageCopy> = {
	'Security Basics': { title: 'Основы безопасности', subtitleLabel: 'Базовые знания' },
	'Phishing & Fraud': { title: 'Фишинг и мошенничество', subtitleLabel: 'Распознавание угроз' },
	'Dangerous Links': { title: 'Опасные ссылки', subtitleLabel: 'Проверка ссылок' },
	Passwords: { title: 'Пароли', subtitleLabel: 'Надёжная аутентификация' },
	Malware: { title: 'Вредоносное ПО', subtitleLabel: 'Защита от угроз' },
	'Social Media': { title: 'Социальные сети', subtitleLabel: 'Безопасность в сети' },
	'Personal Data': { title: 'Личные данные', subtitleLabel: 'Приватность' },
	'Advanced Level': { title: 'Продвинутый уровень', subtitleLabel: 'Для экспертов' },
}

const courseTranslationsRu: Record<string, CourseCopy> = {
	'Digital Safety Basics': {
		title: 'Основы цифровой безопасности',
		description: 'Базовые принципы защиты в интернете',
	},
	'Safe Web Browsing': {
		title: 'Безопасный веб-сёрфинг',
		description: 'Как безопасно пользоваться браузером',
	},
	'Device Protection': {
		title: 'Защита устройств',
		description: 'Безопасность смартфона и компьютера',
	},
	'Email Phishing: Anatomy & Simulator': {
		title: 'Фишинг по email: анатомия и симулятор',
		description:
			'Разбор устройства фишинговых писем, реальный случай компрометации деловой почты и интерактивный симулятор почтового ящика',
	},
	'Introduction to Phishing': {
		title: 'Введение в фишинг',
		description: 'Учимся распознавать фишинговые атаки',
	},
	'Social Engineering': {
		title: 'Социальная инженерия',
		description: 'Приёмы психологического манипулирования',
	},
	'Practice: Recognizing Phishing': {
		title: 'Практика: распознавание фишинга',
		description: 'Реальные примеры и упражнения',
	},
	'URL Analysis': {
		title: 'Анализ ссылок',
		description: 'Учимся проверять безопасность ссылок',
	},
	'Link Checking Tools': {
		title: 'Инструменты проверки ссылок',
		description: 'Сервисы для анализа безопасности ссылок',
	},
	'Creating Strong Passwords': {
		title: 'Создание надёжных паролей',
		description: 'Как придумать безопасный пароль',
	},
	'Password Managers': {
		title: 'Менеджеры паролей',
		description: 'Безопасное хранение паролей',
	},
	'Two-Factor Authentication': {
		title: 'Двухфакторная аутентификация',
		description: 'Дополнительный уровень защиты',
	},
	'Types of Malware': {
		title: 'Виды вредоносного ПО',
		description: 'Вирусы, трояны, программы-вымогатели',
	},
	'Protection Against Malware': {
		title: 'Защита от вредоносного ПО',
		description: 'Профилактика и удаление',
	},
	'Social Media Privacy': {
		title: 'Приватность в соцсетях',
		description:
			'Настройка безопасности аккаунта и понимание того, что на самом деле раскрывают ваши публикации',
	},
	'Social Media Scams': {
		title: 'Мошенничество в соцсетях',
		description:
			'Распознавание обмана на платформах, где мошенничество обходится людям дороже всего',
	},
	'Protecting Personal Data': {
		title: 'Защита личных данных',
		description: 'Какие данные опасно раскрывать и что происходит при их утечке',
	},
	'Data Breaches': {
		title: 'Утечки данных',
		description: 'Как проверить, не утекли ли ваши данные, и что делать дальше',
	},
	'VPN and Encryption': {
		title: 'VPN и шифрование',
		description:
			'Анонимность и защита трафика, и почему важно, какому провайдеру вы доверяете',
	},
	'Advanced Threats': {
		title: 'Продвинутые угрозы',
		description: 'APT-группировки, уязвимости нулевого дня и атаки при поддержке государств',
	},
	'Incident Response': {
		title: 'Реагирование на инциденты',
		description: 'Что делать после взлома и почему реакция определяет исход',
	},
}

function courseWordRu(count: number): string {
	const mod10 = count % 10
	const mod100 = count % 100
	if (mod10 === 1 && mod100 !== 11) return 'курс'
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'курса'
	return 'курсов'
}

export function translateStageTitle(locale: Locale, title: string): string {
	if (locale !== 'ru') return title
	return stageTranslationsRu[title]?.title ?? title
}

export function translateStageCopy(
	locale: Locale,
	title: string,
	subtitle: string
): { title: string; subtitle: string } {
	if (locale !== 'ru') return { title, subtitle }
	const found = stageTranslationsRu[title]
	if (!found) return { title, subtitle }
	const match = subtitle.match(/(\d+)/)
	const count = match ? parseInt(match[1], 10) : 0
	return {
		title: found.title,
		subtitle: `${found.subtitleLabel} • ${count} ${courseWordRu(count)}`,
	}
}

export function translateCourseCopy(
	locale: Locale,
	title: string,
	description?: string
): { title: string; description: string } {
	const fallback = { title, description: description ?? '' }
	if (locale !== 'ru') return fallback
	return courseTranslationsRu[title] ?? fallback
}
