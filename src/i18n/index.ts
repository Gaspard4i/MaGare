import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import locales from './locales.json'

// Auto-import all locale JSON files
const localeModules = import.meta.glob('./*.json', { eager: true }) as Record<string, { default: Record<string, unknown> }>

// Build resources from all locale files (skip locales.json)
const resources: Record<string, { translation: Record<string, unknown> }> = {}
for (const code of locales) {
  const mod = localeModules[`./${code}.json`]
  if (mod) resources[code] = { translation: mod.default }
}

// Migrate old 'fr' locale code to 'fr-FR'
let savedLang = localStorage.getItem('mg_lang') ?? 'fr-FR'
if (savedLang === 'fr' || !locales.includes(savedLang)) {
  savedLang = 'fr-FR'
  localStorage.setItem('mg_lang', 'fr-FR')
}

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'fr-FR',
  interpolation: { escapeValue: false },
})

/** Available locale codes (from Loco manifest) */
export const availableLocales: string[] = locales

/** Change the active language */
export function changeLocale(code: string) {
  if (!locales.includes(code)) return
  i18n.changeLanguage(code)
  localStorage.setItem('mg_lang', code)
}

export default i18n
