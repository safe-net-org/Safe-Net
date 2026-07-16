/**
 * Bilingual copy for the public-facing surfaces (English + Russian).
 *
 * The app was originally Russian, then translated to English; this restores
 * Russian as a first-class option behind a switcher. The structure is by
 * section so components read `t.hero.title` etc. `Messages` is the union of
 * both locales, so property access yields plain strings that render either way.
 * Keep `en` and `ru` structurally in sync by hand — a key present in only one
 * locale is not a type error, so mismatches surface at runtime, not compile time.
 */

export type Locale = 'en' | 'ru'

export const LOCALES: Locale[] = ['en', 'ru']

export const LOCALE_LABELS: Record<Locale, string> = {
	en: 'EN',
	ru: 'RU',
}

export const messages = {
	en: {
		nav: {
			features: 'Features',
			topics: 'Topics',
			statistics: 'Statistics',
			aiGuard: 'AI Guard',
			signIn: 'Sign in',
			logout: 'Log out',
		},
		hero: {
			badge: 'A modern cybersecurity training platform',
			title: 'Cybersecurity Simulator',
			subtitle:
				'Learn to spot phishing, malicious sites, and dangerous links in an interactive game. Complete levels, earn points, and become the guardian of your own data.',
			startLearning: 'Start Learning',
			tryGuard: 'Try AI Guard',
		},
		demo: {
			level: 'Level 1: Phishing',
			prompt: 'Determine whether the link is safe',
			sender: 'Sender:',
			message:
				'"Your account will be closed. Verify your identity immediately."',
			safe: 'Safe',
			dangerous: 'Dangerous',
			correct: 'Correct! This is phishing. Notice the suspicious domain.',
			incorrect: 'Incorrect. This is a phishing email.',
			hint: "Hint: Check the sender's address for domain misspellings.",
			guardLink: 'See how AI Guard scores this automatically',
		},
		guard: {
			badge: 'Browser extension · AI',
			title: 'SafeNet Guard',
			subtitle:
				'The dangerous links are not ugly. Guard reads every URL before the page loads — combining a neural network with deterministic rules — and tells you what is wrong.',
			looksIdentical: 'Looks identical:',
			cyrillicNote: 'The second а is Cyrillic. Guard scores it 100 / 100.',
			sameEngine:
				'Same engine the courses teach and the simulator tests — one implementation.',
			cta: 'Try the live scanner',
			layers: {
				local: 'Local rules',
				localNote: '< 5 ms · offline · zero data',
				intel: 'Threat intel',
				intelNote: 'blocklists · WHOIS · CT logs',
				ml: 'Neural network',
				mlNote: 'fine-tuned BERT',
				page: 'Page analysis',
				pageNote: 'forms · wallet drainers',
			},
			layersFootnote:
				'Only the first layer is required. Everything else degrades gracefully — and layer one sends nothing anywhere.',
		},
		cta: {
			title: 'Ready to test yourself?',
			subtitle:
				'Complete the first level and find out how safe you really are online.',
		},
		footer: {
			tagline: 'Learn. Play. Stay Safe.',
			description:
				'A modern platform for learning cybersecurity through game mechanics and real-world scenarios.',
			navigation: 'Navigation',
			contact: 'Contact',
			rights: 'All rights reserved.',
		},
	},
	ru: {
		nav: {
			features: 'Возможности',
			topics: 'Темы',
			statistics: 'Статистика',
			aiGuard: 'AI-защита',
			signIn: 'Войти',
			logout: 'Выйти',
		},
		hero: {
			badge: 'Современная платформа обучения кибербезопасности',
			title: 'Симулятор кибербезопасности',
			subtitle:
				'Учитесь распознавать фишинг, вредоносные сайты и опасные ссылки в интерактивной игре. Проходите уровни, зарабатывайте очки и станьте защитником своих данных.',
			startLearning: 'Начать обучение',
			tryGuard: 'Попробовать AI-защиту',
		},
		demo: {
			level: 'Уровень 1: Фишинг',
			prompt: 'Определите, безопасна ли ссылка',
			sender: 'Отправитель:',
			message:
				'«Ваш аккаунт будет заблокирован. Немедленно подтвердите личность.»',
			safe: 'Безопасно',
			dangerous: 'Опасно',
			correct: 'Верно! Это фишинг. Обратите внимание на подозрительный домен.',
			incorrect: 'Неверно. Это фишинговое письмо.',
			hint: 'Подсказка: проверьте адрес отправителя на опечатки в домене.',
			guardLink: 'Посмотреть, как AI-защита оценивает это автоматически',
		},
		guard: {
			badge: 'Расширение браузера · ИИ',
			title: 'SafeNet Guard',
			subtitle:
				'Опасные ссылки не выглядят подозрительно. Guard читает каждый URL до загрузки страницы — сочетая нейросеть с детерминированными правилами — и объясняет, что не так.',
			looksIdentical: 'Выглядит одинаково:',
			cyrillicNote: 'Вторая «а» — кириллическая. Guard оценивает это в 100 / 100.',
			sameEngine:
				'Тот же движок, которому учат курсы и который проверяет тренажёр — одна реализация.',
			cta: 'Попробовать сканер вживую',
			layers: {
				local: 'Локальные правила',
				localNote: '< 5 мс · офлайн · ноль данных',
				intel: 'Threat intel',
				intelNote: 'блоклисты · WHOIS · CT-логи',
				ml: 'Нейросеть',
				mlNote: 'дообученный BERT',
				page: 'Анализ страницы',
				pageNote: 'формы · дрейнеры кошельков',
			},
			layersFootnote:
				'Обязателен только первый слой. Остальное отключается плавно — а первый слой не отправляет никуда ничего.',
		},
		cta: {
			title: 'Готовы проверить себя?',
			subtitle:
				'Пройдите первый уровень и узнайте, насколько вы на самом деле защищены в сети.',
		},
		footer: {
			tagline: 'Учись. Играй. Будь в безопасности.',
			description:
				'Современная платформа для обучения кибербезопасности через игровые механики и реальные сценарии.',
			navigation: 'Навигация',
			contact: 'Контакты',
			rights: 'Все права защищены.',
		},
	},
} as const

export type Messages = (typeof messages)[Locale]
