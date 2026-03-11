import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowRight, faExternalLinkAlt, faInfoCircle,
  faCalendarDay, faClock, faArrowLeft, faArrowRightArrowLeft
} from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import LZString from 'lz-string'
import SearchInput from '../molecules/SearchInput'
import StationResultItem from '../molecules/StationResultItem'
import { searchStations } from '../services/apiService'
import type { Place } from '../types'

const TER_REGIONS = [
  { id: 'hauts-de-france',      label: 'Hauts-de-France' },
  { id: 'grand-est',            label: 'Grand Est' },
  { id: 'normandie',            label: 'Normandie' },
  { id: 'pays-de-la-loire',     label: 'Pays de la Loire' },
  { id: 'bretagne',             label: 'Bretagne' },
  { id: 'centre-val-de-loire',  label: 'Centre-Val de Loire' },
  { id: 'bourgogne-franche-comte', label: 'Bourgogne-Franche-Comte' },
  { id: 'auvergne-rhone-alpes', label: 'Auvergne-Rhone-Alpes' },
  { id: 'paca',                 label: 'Provence-Alpes-Cote d\'Azur' },
  { id: 'occitanie',            label: 'Occitanie' },
  { id: 'nouvelle-aquitaine',   label: 'Nouvelle-Aquitaine' },
]

const extractUIC = (place: Place): string => {
  const id = place.stop_area?.id ?? place.id ?? ''
  const match = id.match(/(\d{8,})$/)
  return match ? match[1] : id
}

const todayStr = () => new Date().toISOString().split('T')[0]

const buildTerUrl = (dep: Place, arr: Place, date: string, hourSlot: string, region: string): string => {
  const depUIC = extractUIC(dep)
  const arrUIC = extractUIC(arr)
  const depName = dep.stop_area?.name ?? dep.name ?? ''
  const arrName = arr.stop_area?.name ?? arr.name ?? ''
  const payload = {
    departureStopPlace: { name: depName, isStopPlace: true, id: depUIC },
    arrivalStopPlace:   { name: arrName, isStopPlace: true, id: arrUIC },
    arrivalDate: new Date(date).toISOString(),
    arrivalTime: hourSlot,
  }
  const encoded = LZString.compressToBase64(JSON.stringify(payload))
  return `https://www.ter.sncf.com/${region}/services-contacts/bulletin-retard-resultats?search=${encodeURIComponent(encoded)}`
}

type Field = 'departure' | 'arrival' | null

export default function BulletinForm() {
  const { t } = useTranslation()

  const hourSlots: string[] = []
  for (let h = 0; h < 24; h++) {
    const h1 = String(h).padStart(2, '0') + ':00'
    const h2 = String((h + 1) % 24).padStart(2, '0') + ':00'
    hourSlots.push(`${h1} ${t('bulletin.and')} ${h2}`)
  }

  const [depStation, setDepStation] = useState<Place | null>(null)
  const [arrStation, setArrStation] = useState<Place | null>(null)
  const [depQuery, setDepQuery]     = useState('')
  const [arrQuery, setArrQuery]     = useState('')
  const [depResults, setDepResults] = useState<Place[]>([])
  const [arrResults, setArrResults] = useState<Place[]>([])
  const [loadingField, setLoading]  = useState<Field>(null)
  const [activeField, setActive]    = useState<Field>(null)
  const [date, setDate]             = useState(todayStr)
  const [hourSlot, setHourSlot]     = useState(`08:00 ${t('bulletin.and')} 09:00`)
  const [region, setRegion]         = useState('hauts-de-france')

  const timers: Record<string, ReturnType<typeof setTimeout>> = {}

  const search = (q: string, field: Field) => {
    clearTimeout(timers[field ?? ''])
    if (q.length < 2) {
      if (field === 'departure') setDepResults([])
      else setArrResults([])
      return
    }
    timers[field ?? ''] = setTimeout(async () => {
      setLoading(field)
      try {
        const res = await searchStations(q)
        if (field === 'departure') setDepResults(res)
        else setArrResults(res)
      } finally {
        setLoading(null)
      }
    }, 320)
  }

  const selectDep = (p: Place) => {
    setDepStation(p); setDepQuery(p.stop_area?.name ?? p.name ?? '')
    setDepResults([]); setActive(null)
  }
  const selectArr = (p: Place) => {
    setArrStation(p); setArrQuery(p.stop_area?.name ?? p.name ?? '')
    setArrResults([]); setActive(null)
  }
  const swapStations = () => {
    const tmpP = depStation; const tmpQ = depQuery
    setDepStation(arrStation); setDepQuery(arrQuery)
    setArrStation(tmpP); setArrQuery(tmpQ)
  }

  const canSubmit = !!(depStation && arrStation && date && hourSlot)

  const handleSubmit = () => {
    if (!canSubmit) return
    const url = buildTerUrl(depStation!, arrStation!, date, hourSlot, region)
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div className="px-4 py-5 space-y-4">

      {/* Info */}
      <div className="flex items-start gap-3 p-4 bg-info/10 border border-info/30 rounded-xl">
        <FontAwesomeIcon icon={faInfoCircle} className="text-info mt-0.5 shrink-0" />
        <p className="text-base-content/70 text-xs leading-relaxed">
          Obtenez un <strong className="text-base-content">bulletin de retard officiel SNCF</strong> pour votre employeur
          ou assurance. Renseignez votre trajet exact du jour du retard.
        </p>
      </div>

      {/* Region */}
      <div>
        <label className="block text-base-content/50 text-xs font-semibold uppercase tracking-wider mb-1.5">
          {t('bulletin.region')}
        </label>
        <select
          value={region}
          onChange={e => setRegion(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl bg-base-100 border border-base-300 text-base-content text-sm focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30 transition-all"
        >
          {TER_REGIONS.map(r => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Departure / Arrival */}
      <div className="relative space-y-3">
        <div className="relative">
          <label className="flex items-center gap-1.5 text-base-content/50 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <FontAwesomeIcon icon={faArrowRight} size="xs" className="text-success" />
            {t('bulletin.departure')}
          </label>
          <SearchInput
            value={depQuery}
            onChange={q => { setDepQuery(q); setActive('departure'); search(q, 'departure') }}
            onClear={() => { setDepQuery(''); setDepStation(null); setDepResults([]) }}
            loading={loadingField === 'departure'}
            placeholder={t('bulletin.departurePlaceholder')}
            variant="light"
          />
          {activeField === 'departure' && depResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-xl z-30 shadow-xl overflow-hidden max-h-52 overflow-y-auto">
              {depResults.map((p, i) => <StationResultItem key={p.id ?? i} place={p} onSelect={selectDep} variant="light" />)}
            </div>
          )}
        </div>

        {/* Swap button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={swapStations}
            className="p-2 rounded-full bg-base-300 hover:bg-base-content/15 transition-colors text-base-content/50 hover:text-base-content"
            title={t('bulletin.swap')}
          >
            <FontAwesomeIcon icon={faArrowRightArrowLeft} size="xs" className="rotate-90" />
          </button>
        </div>

        <div className="relative">
          <label className="flex items-center gap-1.5 text-base-content/50 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <FontAwesomeIcon icon={faArrowLeft} size="xs" className="text-error" />
            {t('bulletin.arrival')}
          </label>
          <SearchInput
            value={arrQuery}
            onChange={q => { setArrQuery(q); setActive('arrival'); search(q, 'arrival') }}
            onClear={() => { setArrQuery(''); setArrStation(null); setArrResults([]) }}
            loading={loadingField === 'arrival'}
            placeholder={t('bulletin.arrivalPlaceholder')}
            variant="light"
          />
          {activeField === 'arrival' && arrResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-xl z-30 shadow-xl overflow-hidden max-h-52 overflow-y-auto">
              {arrResults.map((p, i) => <StationResultItem key={p.id ?? i} place={p} onSelect={selectArr} variant="light" />)}
            </div>
          )}
        </div>
      </div>

      {/* Date & Time slot */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="flex items-center gap-1.5 text-base-content/50 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <FontAwesomeIcon icon={faCalendarDay} size="xs" />
            {t('bulletin.date')}
          </label>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-base-100 border border-base-300 text-base-content text-sm focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30 transition-all"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-base-content/50 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <FontAwesomeIcon icon={faClock} size="xs" />
            {t('bulletin.slot')}
          </label>
          <select
            value={hourSlot}
            onChange={e => setHourSlot(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-base-100 border border-base-300 text-base-content text-sm focus:outline-none focus:border-info focus:ring-1 focus:ring-info/30 transition-all"
          >
            {hourSlots.map(s => (
              <option key={s} value={s}>{s.replace(` ${t('bulletin.and')} `, ' \u2192 ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preview */}
      {canSubmit && (
        <div className="p-3 bg-base-100 border border-base-300 rounded-lg">
          <p className="text-base-content/40 text-xs mb-1 font-semibold">{t('bulletin.urlGenerated')}</p>
          <p className="text-base-content/60 text-xs break-all font-mono leading-relaxed">
            ter.sncf.com/{region}/.../bulletin-retard-resultats?search=
            <span className="text-success">[{depStation?.stop_area?.name ?? depStation?.name} &rarr; {arrStation?.stop_area?.name ?? arrStation?.name}]</span>
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
          canSubmit
            ? 'bg-primary text-primary-content hover:brightness-110 active:scale-95'
            : 'bg-base-300 text-base-content/30 cursor-not-allowed'
        }`}
      >
        <FontAwesomeIcon icon={faExternalLinkAlt} size="sm" />
        {t('bulletin.open')}
      </button>

      <p className="text-base-content/30 text-xs text-center">
        {t('bulletin.openHint')}
      </p>
    </div>
  )
}
