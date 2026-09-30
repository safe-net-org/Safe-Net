import type { Locale } from '@/i18n/messages'

export interface LegalSection {
	heading: string
	paragraphs?: string[]
	items?: string[]
}

export interface LegalDocument {
	title: string
	summary: string
	sections: LegalSection[]
}

interface LegalCopy {
	common: {
		backHome: string
		documentVersion: string
		effectiveDate: string
		previewTitle: string
		previewBody: string
		ownerMissing: string
		contactMissing: string
		jurisdictionMissing: string
	}
	cookieNotice: {
		title: string
		body: string
		action: string
		learnMore: string
		ariaLabel: string
	}
	auth: {
		consentPrefix: string
		termsLink: string
		consentAnd: string
		privacyLink: string
		consentVersion: string
		nameRequired: string
		emailRequired: string
		emailInvalid: string
		passwordRequired: string
		loginPasswordTooShort: string
		passwordTooShort: string
	}
	privacy: LegalDocument
	terms: LegalDocument
	cookies: LegalDocument
	security: LegalDocument
}

export const legalMessages: Record<Locale, LegalCopy> = {
	en: {
		common: {
			backHome: 'Back to Safe Net',
			documentVersion: 'Document version',
			effectiveDate: 'Effective',
			previewTitle: 'Production details are not configured',
			previewBody:
				'This notice accurately describes the current product preview. Owner details, contact information, and governing law must be configured and reviewed before a public production launch.',
			ownerMissing: 'Legal owner',
			contactMissing: 'Privacy contact',
			jurisdictionMissing: 'Governing jurisdiction',
		},
		cookieNotice: {
			title: 'Only necessary storage',
			body:
				'Safe Net uses required cookies and local storage to keep you signed in and remember language, theme, and learning state. There are no advertising or analytics cookies.',
			action: 'Got it',
			learnMore: 'Storage details',
			ariaLabel: 'Cookie and local storage notice',
		},
		auth: {
			consentPrefix: 'I agree to the',
			termsLink: 'Terms of Use',
			consentAnd: 'and',
			privacyLink: 'Privacy Notice',
			consentVersion: 'Required documents, version {version}',
			nameRequired: 'Enter your name.',
			emailRequired: 'Enter your email address.',
			emailInvalid: 'Enter a valid email address.',
			passwordRequired: 'Enter your password.',
			loginPasswordTooShort: 'Password must contain at least 6 characters.',
			passwordTooShort: 'Use at least 8 characters.',
		},
		privacy: {
			title: 'Privacy notice',
			summary:
				'What Safe Net stores, why it is needed, and which Guard features can send data outside your device.',
			sections: [
				{
					heading: 'Data used by the learning platform',
					items: [
						'Account data: name, email address, password hash, account role, and status.',
						'Learning data: course progress, answers, attempts, achievements, test results, and certificates.',
						'Essential preferences: language, theme, and local interface state.',
					],
				},
				{
					heading: 'Why this data is used',
					items: [
						'To authenticate an account and keep it secure.',
						'To provide courses, grade tasks, save progress, and issue achievements or certificates.',
						'To operate and diagnose the product without advertising profiles.',
					],
				},
				{
					heading: 'Safe Net Guard',
					paragraphs: [
						'Deterministic URL analysis runs on the device by default. Optional threat-intelligence and machine-learning checks are separate controls and may contact the providers named in the extension before they are enabled.',
						'The web scanner also performs local analysis first. An optional ML second opinion must be requested explicitly.',
					],
				},
				{
					heading: 'Retention and your choices',
					paragraphs: [
						'The preview stores account and learning records until the operator removes them or the preview database is reset. A production retention and deletion schedule has not yet been approved.',
						'Do not launch publicly until a working privacy contact and a process for access, correction, export, and deletion requests are configured.',
					],
				},
				{
					heading: 'Security',
					paragraphs: [
						'Passwords are hashed with Argon2. Answer keys stay on the server. No system can promise absolute security; report suspected issues through the configured security contact.',
					],
				},
			],
		},
		terms: {
			title: 'Terms of use',
			summary:
				'Rules for using the Safe Net educational preview and the limits of its security guidance.',
			sections: [
				{
					heading: 'Educational purpose',
					paragraphs: [
						'Safe Net teaches practical cybersecurity concepts. It does not replace professional incident response, antivirus software, legal advice, or a complete organizational security program.',
					],
				},
				{
					heading: 'Account responsibilities',
					items: [
						'Provide accurate account information and protect your credentials.',
						'Do not access another person’s account or attempt to bypass authorization.',
						'Report suspected account compromise promptly.',
					],
				},
				{
					heading: 'Acceptable use',
					items: [
						'Use simulations and scanners for defensive learning and authorized testing only.',
						'Do not use Safe Net content or tools to target, deceive, or harm other people.',
						'Do not interfere with the service or attempt to extract protected answer data.',
					],
				},
				{
					heading: 'Security results',
					paragraphs: [
						'Guard verdicts are risk indicators, not guarantees. A “safe” result cannot prove a site is harmless, and a suspicious result should be reviewed in context.',
					],
				},
				{
					heading: 'Preview availability',
					paragraphs: [
						'The preview may change, reset, or be unavailable. Production support, service levels, governing law, and dispute terms require owner configuration and legal review.',
					],
				},
			],
		},
		cookies: {
			title: 'Cookies and local storage',
			summary:
				'A plain-language inventory of browser storage used by the current Safe Net web application.',
			sections: [
				{
					heading: 'Necessary authentication',
					items: [
						'Access token: keeps authenticated API requests working for a short period.',
						'Refresh token: an HttpOnly cookie used to renew the session.',
					],
				},
				{
					heading: 'Preferences and learning state',
					items: [
						'Language preference: keeps English or Russian consistent between visits.',
						'Theme preference: remembers system, light, or dark appearance.',
						'Learning and welcome state: avoids repeating completed local UI steps.',
						'Storage-notice acknowledgement: prevents this notice from appearing on every visit.',
					],
				},
				{
					heading: 'What is not present',
					paragraphs: [
						'The current repository contains no advertising, cross-site tracking, or analytics cookies. If optional analytics are added later, this inventory and the consent controls must be updated before activation.',
					],
				},
				{
					heading: 'Your controls',
					paragraphs: [
						'You can clear site data in your browser. Removing authentication storage signs you out; removing preferences resets language, theme, and local UI state.',
					],
				},
			],
		},
		security: {
			title: 'Security and responsible disclosure',
			summary:
				'How Safe Net reduces risk today and what must be configured before accepting public reports.',
			sections: [
				{
					heading: 'Current safeguards',
					items: [
						'Argon2 password hashing and rate-limited credential endpoints.',
						'Server-side task answer keys and strict simulator grading.',
						'Role checks on administrator endpoints.',
						'Schema-validated learning content and tested Guard rule parity.',
						'Local-only URL analysis by default.',
					],
				},
				{
					heading: 'Reporting a vulnerability',
					paragraphs: [
						'Do not publish or exploit personal data, credentials, or destructive findings. A real monitored security contact and response policy must be configured before public launch.',
					],
				},
				{
					heading: 'Safe testing',
					items: [
						'Use test accounts and the smallest proof necessary.',
						'Do not run denial-of-service, spam, social-engineering, or persistence tests.',
						'Give the operator reasonable time to investigate before disclosure.',
					],
				},
			],
		},
	},
	ru: {
		common: {
			backHome: 'Вернуться в Safe Net',
			documentVersion: 'Версия документа',
			effectiveDate: 'Действует с',
			previewTitle: 'Реквизиты для production не настроены',
			previewBody:
				'Этот документ честно описывает текущее демо продукта. Перед публичным запуском необходимо указать владельца, контакты и применимое право, а затем провести юридическую проверку.',
			ownerMissing: 'Юридический владелец',
			contactMissing: 'Контакт по приватности',
			jurisdictionMissing: 'Применимая юрисдикция',
		},
		cookieNotice: {
			title: 'Только необходимое хранилище',
			body:
				'Safe Net использует обязательные cookie и локальное хранилище для входа, выбора языка и темы, а также состояния обучения. Рекламных и аналитических cookie нет.',
			action: 'Понятно',
			learnMore: 'Подробнее о хранении',
			ariaLabel: 'Уведомление о cookie и локальном хранилище',
		},
		auth: {
			consentPrefix: 'Я принимаю',
			termsLink: 'Условия использования',
			consentAnd: 'и',
			privacyLink: 'Уведомление о приватности',
			consentVersion: 'Обязательные документы, версия {version}',
			nameRequired: 'Введите имя.',
			emailRequired: 'Введите email.',
			emailInvalid: 'Введите корректный email.',
			passwordRequired: 'Введите пароль.',
			loginPasswordTooShort: 'Пароль должен содержать не менее 6 символов.',
			passwordTooShort: 'Используйте не менее 8 символов.',
		},
		privacy: {
			title: 'Уведомление о приватности',
			summary:
				'Какие данные хранит Safe Net, зачем они нужны и какие функции Guard могут отправлять данные за пределы устройства.',
			sections: [
				{
					heading: 'Данные учебной платформы',
					items: [
						'Аккаунт: имя, email, хеш пароля, роль и статус.',
						'Обучение: прогресс, ответы, попытки, достижения, результаты тестов и сертификаты.',
						'Обязательные настройки: язык, тема и локальное состояние интерфейса.',
					],
				},
				{
					heading: 'Зачем используются данные',
					items: [
						'Для входа в аккаунт и его защиты.',
						'Для курсов, проверки заданий, сохранения прогресса, достижений и сертификатов.',
						'Для работы и диагностики продукта без рекламного профилирования.',
					],
				},
				{
					heading: 'Safe Net Guard',
					paragraphs: [
						'По умолчанию детерминированная проверка URL выполняется на устройстве. Проверка по внешним источникам и ML — отдельные опции; до включения пользователь видит, к каким провайдерам они обращаются.',
						'Веб-сканер также сначала работает локально. Дополнительное мнение ML запрашивается только явно.',
					],
				},
				{
					heading: 'Хранение и ваши возможности',
					paragraphs: [
						'В демо аккаунт и прогресс хранятся до удаления оператором или сброса демонстрационной базы. Регламент хранения и удаления для production ещё не утверждён.',
						'Публичный запуск невозможен без рабочего контакта и процесса запросов на доступ, исправление, экспорт и удаление данных.',
					],
				},
				{
					heading: 'Безопасность',
					paragraphs: [
						'Пароли хешируются Argon2, а ответы на задания остаются на сервере. Абсолютную безопасность нельзя гарантировать; о проблемах следует сообщать через настроенный security-контакт.',
					],
				},
			],
		},
		terms: {
			title: 'Условия использования',
			summary:
				'Правила учебного демо Safe Net и ограничения его рекомендаций по безопасности.',
			sections: [
				{
					heading: 'Учебное назначение',
					paragraphs: [
						'Safe Net обучает практическим основам кибербезопасности, но не заменяет профессиональное реагирование на инциденты, антивирус, юридическую консультацию или комплексную защиту организации.',
					],
				},
				{
					heading: 'Ответственность за аккаунт',
					items: [
						'Указывайте корректные данные и защищайте учётные данные.',
						'Не используйте чужие аккаунты и не обходите авторизацию.',
						'Своевременно сообщайте о подозрении на компрометацию.',
					],
				},
				{
					heading: 'Допустимое использование',
					items: [
						'Используйте симуляции и сканеры только для защитного обучения и разрешённого тестирования.',
						'Не применяйте материалы или инструменты Safe Net для обмана, атак или вреда другим людям.',
						'Не мешайте работе сервиса и не пытайтесь извлекать защищённые ответы.',
					],
				},
				{
					heading: 'Результаты проверки',
					paragraphs: [
						'Вердикты Guard — индикаторы риска, а не гарантии. Статус «безопасно» не доказывает отсутствие угрозы, а подозрительный результат требует контекстной проверки.',
					],
				},
				{
					heading: 'Доступность демо',
					paragraphs: [
						'Демо может меняться, сбрасываться или быть недоступным. Поддержка, SLA, применимое право и порядок споров требуют настройки владельцем и юридической проверки.',
					],
				},
			],
		},
		cookies: {
			title: 'Cookie и локальное хранилище',
			summary:
				'Понятный перечень браузерного хранилища, которое использует текущая версия Safe Net.',
			sections: [
				{
					heading: 'Необходимая авторизация',
					items: [
						'Access token: на короткое время поддерживает авторизованные API-запросы.',
						'Refresh token: HttpOnly-cookie для обновления сессии.',
					],
				},
				{
					heading: 'Настройки и обучение',
					items: [
						'Язык: сохраняет русский или английский между посещениями.',
						'Тема: запоминает системную, светлую или тёмную тему.',
						'Прогресс интерфейса: не повторяет уже завершённые локальные шаги.',
						'Подтверждение уведомления: не показывает его при каждом открытии.',
					],
				},
				{
					heading: 'Чего сейчас нет',
					paragraphs: [
						'В текущем репозитории нет рекламных, межсайтовых или аналитических cookie. Если появится опциональная аналитика, перечень и механика согласия должны быть обновлены до её включения.',
					],
				},
				{
					heading: 'Ваши настройки',
					paragraphs: [
						'Данные сайта можно очистить в браузере. Удаление данных авторизации завершит сессию, а удаление настроек сбросит язык, тему и локальное состояние.',
					],
				},
			],
		},
		security: {
			title: 'Безопасность и ответственное раскрытие',
			summary:
				'Как Safe Net снижает риск сейчас и что нужно настроить до приёма публичных отчётов.',
			sections: [
				{
					heading: 'Текущие меры',
					items: [
						'Хеширование паролей Argon2 и rate limit на endpoints авторизации.',
						'Ответы на задания хранятся на сервере, симулятор строго учитывает ложные срабатывания.',
						'Проверка ролей на административных endpoints.',
						'Валидация учебного контента и тесты согласованности Guard.',
						'Локальная проверка URL по умолчанию.',
					],
				},
				{
					heading: 'Сообщение об уязвимости',
					paragraphs: [
						'Не публикуйте и не используйте персональные данные, учётные данные или разрушительные находки. До публичного запуска должен быть настроен реальный контролируемый security-контакт и порядок ответа.',
					],
				},
				{
					heading: 'Безопасное тестирование',
					items: [
						'Используйте тестовые аккаунты и минимально необходимое доказательство.',
						'Не проводите DoS, спам, социальную инженерию и тесты на закрепление.',
						'Дайте оператору разумное время на проверку до раскрытия.',
					],
				},
			],
		},
	},
}
