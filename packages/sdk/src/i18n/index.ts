import { createI18n } from 'vue-i18n'

interface TranslationMessages {
	[key: string]: string | TranslationMessages
}

type LocaleMessages = Record<string, TranslationMessages>

const locales = import.meta.glob('./locales/*.json', { eager: true })

export function getMessages(): LocaleMessages {
	const messages: LocaleMessages = {}

	for (const [path, module] of Object.entries(locales)) {
		const locale = path.match(/\.\/locales\/(.+)\.json$/)?.[1]

		if (locale) {
			// @ts-ignore
			const translations = module.default || module
			messages[locale] = translations as TranslationMessages
		}
	}

	return messages
}

export const i18n = createI18n({
	locale: 'en',
	fallbackLocale: 'en',
	legacy: false,
	messages: getMessages(),
})
