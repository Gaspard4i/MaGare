import type { Place } from '../types'

const K = {
  DEFAULT:    'mg_default_station',
  FAVORITES:  'mg_favorites',   // string[] of IDs
  FAV_PLACES: 'mg_fav_places',  // Record<id, Place>
  THEME:      'mg_theme',
} as const

// ── Default station ───────────────────────────────────────────────────────────

export const getDefaultStation = (): Place | null => {
  try {
    const raw = localStorage.getItem(K.DEFAULT)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export const setDefaultStation = (place: Place | null): void => {
  if (place === null) localStorage.removeItem(K.DEFAULT)
  else localStorage.setItem(K.DEFAULT, JSON.stringify(place))
}

// ── Favorites (IDs) ───────────────────────────────────────────────────────────

export const getFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(K.FAVORITES)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export const isFavorite = (id: string): boolean => getFavorites().includes(id)

// ── Favorite Places (full objects, sorted A→Z) ────────────────────────────────

export const getFavoritePlaces = (): Place[] => {
  try {
    const raw = localStorage.getItem(K.FAV_PLACES)
    const map: Record<string, Place> = raw ? JSON.parse(raw) : {}
    return Object.values(map).sort((a, b) => {
      const na = (a.stop_area?.name ?? a.name ?? '').toLowerCase()
      const nb = (b.stop_area?.name ?? b.name ?? '').toLowerCase()
      return na.localeCompare(nb, 'fr')
    })
  } catch { return [] }
}

const saveFavPlace = (id: string, place: Place) => {
  try {
    const raw = localStorage.getItem(K.FAV_PLACES)
    const map: Record<string, Place> = raw ? JSON.parse(raw) : {}
    map[id] = place
    localStorage.setItem(K.FAV_PLACES, JSON.stringify(map))
  } catch {}
}

const removeFavPlace = (id: string) => {
  try {
    const raw = localStorage.getItem(K.FAV_PLACES)
    const map: Record<string, Place> = raw ? JSON.parse(raw) : {}
    delete map[id]
    localStorage.setItem(K.FAV_PLACES, JSON.stringify(map))
  } catch {}
}

// ── Toggle (now accepts optional Place to persist) ────────────────────────────

export const toggleFavorite = (id: string, place?: Place): boolean => {
  const favs = getFavorites()
  const is = favs.includes(id)
  localStorage.setItem(
    K.FAVORITES,
    JSON.stringify(is ? favs.filter(f => f !== id) : [...favs, id])
  )
  if (is) removeFavPlace(id)
  else if (place) saveFavPlace(id, place)
  return !is
}

// ── Theme ─────────────────────────────────────────────────────────────────────

export const getTheme = (): 'sncf' | 'sncf-dark' => {
  try { return (localStorage.getItem(K.THEME) as any) || 'sncf' }
  catch { return 'sncf' }
}

export const setTheme = (t: 'sncf' | 'sncf-dark'): void => {
  localStorage.setItem(K.THEME, t)
  document.documentElement.setAttribute('data-theme', t)
}
