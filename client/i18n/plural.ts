import type { Locale } from './messages'

interface PluralForms {
	one: string
	few: string
	many: string
}

const pluralRules = {
	en: new Intl.PluralRules('en'),
	ru: new Intl.PluralRules('ru'),
} satisfies Record<Locale, Intl.PluralRules>

export function selectPlural(
	locale: Locale,
	count: number,
	forms: PluralForms,
): string {
	const category = pluralRules[locale].select(Math.abs(count))

	if (category === 'one') return forms.one
	if (category === 'few') return forms.few
	return forms.many
}
