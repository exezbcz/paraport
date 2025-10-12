import en from './locales/en.json'

export type TParams = Record<string, unknown> | unknown[] | undefined
export type TFunction = (path: string, params?: TParams) => string

// Resolve a nested path like "a.b.c" inside a JSON object
function resolvePath(obj: any, path: string): unknown {
  return path.split('.').reduce((acc: any, key: string) => (acc && acc[key] != null ? acc[key] : undefined), obj)
}

function getCount(params?: TParams): number | undefined {
  if (!params || Array.isArray(params)) return undefined
  const val = (params as Record<string, unknown>).count
  return typeof val === 'number' ? val : undefined
}

function choosePlural(form: string, params?: TParams): string {
  // Support simple ICU-like "singular | plural" forms
  if (!form.includes(' | ')) return form
  const [singular, plural] = form.split(' | ')
  const count = getCount(params)
  if (count === 1) return singular
  // Default to plural if count is undefined or not 1
  return plural
}

function interpolate(str: string, params?: TParams): string {
  let out = str

  if (Array.isArray(params)) {
    // Positional replacement: {0}, {1}, ...
    out = out.replace(/\{(\d+)\}/g, (_m, idx) => {
      const i = Number(idx)
      return params[i] != null ? String(params[i]) : ''
    })
  }

  if (params && !Array.isArray(params)) {
    const map = params as Record<string, unknown>
    out = out.replace(/\{(\w+)\}/g, (_m, key) => {
      const v = map[key]
      return v != null ? String(v) : ''
    })
  }

  return out
}

export const t: TFunction = (path, params) => {
  const raw = resolvePath(en as any, path)
  if (typeof raw !== 'string') {
    // Fallback to the key if not found or not a string
    return path
  }
  const selected = choosePlural(raw, params)
  return interpolate(selected, params)
}

