import type { Place, Train, VehicleJourney } from '../types'

const BASE = 'https://api.sncf.com/v1/coverage/sncf'
const TOKEN = '9a7f7f9d-9438-413d-a56e-1f0750fc25b9'

const auth = () => ({ Authorization: 'Basic ' + btoa(TOKEN + ':') })

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: auth() })
  if (!res.ok) throw new Error(`Erreur API (${res.status})`)
  return res.json()
}

export const searchStations = async (q: string): Promise<Place[]> => {
  if (q.length < 2) return []
  const data = await apiFetch<{ places?: Place[] }>(
    `${BASE}/places?q=${encodeURIComponent(q)}&type[]=stop_area&count=12`
  )
  return data.places ?? []
}

export const getDepartures = async (stopAreaId: string, fromDatetime?: string, count = 20): Promise<Train[]> => {
  let url = `${BASE}/stop_areas/${stopAreaId}/departures?count=${count}&duration=14400`
  if (fromDatetime) url += `&from_datetime=${fromDatetime}`
  const data = await apiFetch<{ departures?: Train[] }>(url)
  return data.departures ?? []
}

export const getArrivals = async (stopAreaId: string, fromDatetime?: string, count = 20): Promise<Train[]> => {
  let url = `${BASE}/stop_areas/${stopAreaId}/arrivals?count=${count}&duration=14400`
  if (fromDatetime) url += `&from_datetime=${fromDatetime}`
  const data = await apiFetch<{ arrivals?: Train[] }>(url)
  return data.arrivals ?? []
}

export const getVehicleJourney = async (vjId: string): Promise<VehicleJourney | null> => {
  const data = await apiFetch<{ vehicle_journeys?: VehicleJourney[] }>(
    `${BASE}/vehicle_journeys/${vjId}`
  )
  return data.vehicle_journeys?.[0] ?? null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse "YYYYMMDDTHHmmss" → Date */
export const parseNavitiaDate = (s: string): Date => {
  return new Date(
    `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}T${s.substring(9,11)}:${s.substring(11,13)}:${s.substring(13,15)}`
  )
}

/** "YYYYMMDDTHHmmss" → "HH:mm" */
export const formatTime = (s?: string): string => {
  if (!s) return '--:--'
  return `${s.substring(9,11)}:${s.substring(11,13)}`
}

/** "HHmmss" → "HH:mm" (vehicle journey stop times) */
export const formatStopTime = (s?: string): string => {
  if (!s) return '--:--'
  return `${s.substring(0,2)}:${s.substring(2,4)}`
}

/** Delay in minutes (positive = late) */
export const getDelay = (scheduled?: string, real?: string): number => {
  if (!scheduled || !real) return 0
  return Math.round((parseNavitiaDate(real).getTime() - parseNavitiaDate(scheduled).getTime()) / 60000)
}

/** Build a from_datetime string for today at HH:mm */
export const buildFromDatetime = (date: string, time: string): string => {
  // date: "YYYY-MM-DD", time: "HH:mm" → "YYYYMMDDTHHmm00"
  const d = date.replace(/-/g, '')
  const t = time.replace(':', '') + '00'
  return `${d}T${t}`
}

// ── Train type ────────────────────────────────────────────────────────────────

export type TrainTypeKey = 'TGV' | 'INOUI' | 'OUIGO' | 'IC' | 'TER' | 'TN' | 'RER' | 'BUS' | 'TRAM' | 'METRO' | 'BOAT' | 'EUROSTAR' | 'THALYS' | 'LYRIA' | string

export const getTrainType = (commercial?: string, physical?: string): TrainTypeKey => {
  const c = (commercial ?? '').toUpperCase()
  const p = (physical ?? '').toUpperCase()
  const mode = c || p
  if (mode.includes('INOUI') || mode.includes('INOUÏ')) return 'INOUI'
  if (mode.includes('TGV')) return 'TGV'
  if (mode.includes('OUIGO')) return 'OUIGO'
  if (mode.includes('EUROSTAR')) return 'EUROSTAR'
  if (mode.includes('THALYS')) return 'THALYS'
  if (mode.includes('LYRIA')) return 'LYRIA'
  if (mode.includes('INTERCITÉS') || mode.includes('INTERCITES') || (mode === 'IC')) return 'IC'
  if (mode.includes('TER')) return 'TER'
  if (mode.includes('TRANSILIEN')) return 'TN'
  if (mode.includes('RER')) return 'RER'
  if (mode.includes('BUS') || mode.includes('CAR')) return 'BUS'
  if (mode.includes('TRAM')) return 'TRAM'
  if (mode.includes('METRO') || mode.includes('MÉTRO')) return 'METRO'
  if (mode.includes('BATEAU') || mode.includes('NAVETTE')) return 'BOAT'
  return mode.substring(0, 8) || 'TRAIN'
}

export type PhysicalModeKey = 'train' | 'bus' | 'tram' | 'metro' | 'rer' | 'boat' | 'cable'

export const getPhysicalMode = (physical?: string): PhysicalModeKey => {
  const p = (physical ?? '').toUpperCase()
  if (p.includes('BUS') || p.includes('CAR')) return 'bus'
  if (p.includes('TRAM')) return 'tram'
  if (p.includes('METRO') || p.includes('MÉTRO')) return 'metro'
  if (p.includes('RER')) return 'rer'
  if (p.includes('BATEAU') || p.includes('NAVETTE')) return 'boat'
  if (p.includes('CABLE') || p.includes('FUNICULAIRE')) return 'cable'
  return 'train'
}

/** Returns a DaisyUI badge variant class for the given train type */
export const getTrainBadgeClass = (type: TrainTypeKey): string => {
  switch (type) {
    case 'TGV':
    case 'INOUI':
    case 'THALYS':   return 'badge-error'      // rouge SNCF
    case 'OUIGO':    return 'badge-info'        // céruléen
    case 'IC':       return 'badge-warning'     // ocre / orange
    case 'TER':      return 'badge-secondary'   // forêt
    case 'EUROSTAR': return 'badge-warning'     // safran / doré
    case 'LYRIA':
    case 'TN':
    case 'RER':
    case 'METRO':    return 'badge-neutral'     // sombre
    case 'BUS':      return 'badge-success'     // menthe
    case 'TRAM':     return 'badge-accent'      // rouge SNCF (closest)
    case 'BOAT':     return 'badge-info'        // bleu
    default:         return 'badge-neutral'
  }
}
