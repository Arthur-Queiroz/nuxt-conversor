import pt from '~/locales/pt.json'
import en from '~/locales/en.json'

type Locale = 'pt' | 'en'
type Translations = typeof pt

const translations: Record<Locale, Translations> = { pt, en }

function resolvePath(obj: unknown, path: string): string {
  let current: unknown = obj
  for (const key of path.split('.')) {
    if (current == null || typeof current !== 'object') return path
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : path
}

export function useLocale() {
  const locale = useState<Locale>('locale', () => {
    if (import.meta.client) {
      return (localStorage.getItem('locale') as Locale) || 'pt'
    }
    return 'pt'
  })

  if (import.meta.client) {
    watch(locale, (val) => localStorage.setItem('locale', val), { immediate: false })
  }

  function t(key: string, params?: Record<string, string | number>): string {
    let value = resolvePath(translations[locale.value], key)
    if (params) {
      value = value.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`))
    }
    return value
  }

  function toggle() {
    locale.value = locale.value === 'pt' ? 'en' : 'pt'
  }

  return { locale, t, toggle }
}
