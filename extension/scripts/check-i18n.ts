import { EXTENSION_CATALOGS } from '../src/shared/i18n/messages'
import enManifest from '../public/_locales/en/messages.json'
import ruManifest from '../public/_locales/ru/messages.json'

function assertParity(
  label: string,
  catalogs: Record<string, Record<string, unknown>>,
): number {
  const [referenceLocale, ...locales] = Object.keys(catalogs)
  const referenceKeys = Object.keys(catalogs[referenceLocale]).sort()

  for (const locale of locales) {
    const keys = Object.keys(catalogs[locale]).sort()
    const missing = referenceKeys.filter((key) => !keys.includes(key))
    const extra = keys.filter((key) => !referenceKeys.includes(key))
    const blank = keys.filter((key) => {
      const value = catalogs[locale][key]
      return typeof value === 'string' && value.trim().length === 0
    })
    if (missing.length || extra.length || blank.length) {
      throw new Error(
        `${label} ${locale}: missing=${missing.join(',') || 'none'}; `
        + `extra=${extra.join(',') || 'none'}; blank=${blank.join(',') || 'none'}`,
      )
    }
  }

  return referenceKeys.length
}

const manifestCatalogs = {
  en: enManifest,
  ru: ruManifest,
}

const interfaceCount = assertParity('extension interface', EXTENSION_CATALOGS)
const manifestCount = assertParity('extension manifest', manifestCatalogs)

console.log(
  `Extension i18n parity passed: ${interfaceCount} interface messages and `
  + `${manifestCount} manifest messages per locale.`,
)
