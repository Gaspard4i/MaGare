import type { Place, Train, VehicleJourney } from '../types'

const BASE = 'https://api.sncf.com/v1/coverage/sncf'
const TOKEN = import.meta.env.VITE_SNCF_TOKEN ?? ''

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

/** Fallback colors when the API doesn't provide color/text_color */
export const getFallbackColors = (type: TrainTypeKey): { bg: string; text: string } => {
  switch (type) {
    case 'TGV':
    case 'INOUI':    return { bg: '#9B2743', text: '#FFFFFF' }  // lie-de-vin INOUI
    case 'THALYS':   return { bg: '#E2001A', text: '#FFFFFF' }  // rouge SNCF
    case 'OUIGO':    return { bg: '#0084D4', text: '#FFFFFF' }  // céruléen OUIGO
    case 'IC':       return { bg: '#DC582A', text: '#FFFFFF' }  // ocre intercités
    case 'TER':      return { bg: '#154734', text: '#FFFFFF' }  // forêt TER
    case 'EUROSTAR': return { bg: '#FFD700', text: '#1A1A1A' }  // doré Eurostar
    case 'LYRIA':    return { bg: '#C72B2D', text: '#FFFFFF' }  // rouge Lyria
    case 'TN':       return { bg: '#6558B1', text: '#FFFFFF' }  // lavande Transilien
    case 'RER':      return { bg: '#003865', text: '#FFFFFF' }  // cobalt RER
    case 'METRO':    return { bg: '#00205B', text: '#FFFFFF' }  // bleu-marine
    case 'BUS':      return { bg: '#00B388', text: '#FFFFFF' }  // menthe
    case 'TRAM':     return { bg: '#407F7F', text: '#FFFFFF' }  // oracle
    case 'BOAT':     return { bg: '#0084D4', text: '#FFFFFF' }  // bleu
    default:         return { bg: '#4A4A4A', text: '#FFFFFF' }  // gris neutre
  }
}
