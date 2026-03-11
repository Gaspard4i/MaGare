import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync, faTrain, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import TrainRow from './TrainRow'
import TrainDetailSheet from './TrainDetailSheet'
import DestinationSearch from '../molecules/DestinationSearch'
import { getDepartures, getArrivals, buildFromDatetime } from '../services/apiService'
import type { Train, Place } from '../types'

interface Props {
  station: Place | null
  mode: 'departures' | 'arrivals'
}

const todayStr = () => new Date().toISOString().split('T')[0]
const nowStr = () => new Date().toTimeString().substring(0, 5)

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export default function TrainBoard({ station, mode }: Props) {
  const { t } = useTranslation()
  const [trains, setTrains] = useState<Train[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [selected, setSelected] = useState<Train | null>(null)
  const [date, setDate] = useState(todayStr)
  const [time, setTime] = useState(nowStr)
  const [destination, setDestination] = useState<Place | null>(null)

  const stationId = station?.stop_area?.id ?? station?.id ?? ''
  const boardClass = mode === 'departures' ? 'board-departures' : 'board-arrivals'

  const timeRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const timeVal = useRef(time)
  const dateVal = useRef(date)
  timeVal.current = time
  dateVal.current = date

  // Wheel handler for time input
  useEffect(() => {
    const el = timeRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const [h, m] = timeVal.current.split(':').map(Number)
      const step = 5
      const total = ((h * 60 + m) + (e.deltaY < 0 ? step : -step) + 1440) % 1440
      const nh = Math.floor(total / 60)
      const nm = total % 60
      setTime(`${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // Wheel handler for date input
  useEffect(() => {
    const el = dateRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const d = new Date(dateVal.current + 'T00:00:00')
      d.setDate(d.getDate() + (e.deltaY < 0 ? 1 : -1))
      setDate(d.toISOString().split('T')[0])
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  useEffect(() => {
    setDestination(null)
  }, [stationId])

  const fetchTrains = useCallback(async () => {
    if (!station) return
    setLoading(true)
    setError(null)
    try {
      const id = station.stop_area?.id ?? station.id
      const from = buildFromDatetime(date, time)
      const data = mode === 'departures'
        ? await getDepartures(id, from)
        : await getArrivals(id, from)
      setTrains(data)
      setLastUpdate(new Date())
    } catch (e: any) {
      setError(e.message ?? t('board.loadError'))
      setTrains([])
    } finally {
      setLoading(false)
    }
  }, [station, mode, date, time, t])

  useEffect(() => {
    fetchTrains()
    const iv = setInterval(fetchTrains, 60_000)
    return () => clearInterval(iv)
  }, [fetchTrains])

  const filteredTrains = useMemo(() => {
    if (!destination) return trains
    const destName = normalize(destination.stop_area?.name ?? destination.name ?? '')
    if (!destName) return trains

    return trains.filter(train => {
      const info = train.display_informations
      const dir = normalize(info?.direction ?? '')
      return dir.includes(destName) || destName.includes(dir)
    })
  }, [trains, destination, mode])

  if (!station) {
    return (
      <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--board-text, var(--color-primary-content))' }}>
        <FontAwesomeIcon icon={faTrain} size="3x" className="mb-4 opacity-30" />
        <p className="text-lg font-medium opacity-50">{t('board.selectStation')}</p>
      </div>
    )
  }

  const textStyle = { color: 'var(--board-text)' }

  return (
    <div className={`w-full flex flex-col h-full min-h-0 ${boardClass}`}>
      {/* ── Toolbar (dark shade) ── */}
      <div className="shrink-0 board-toolbar">
        {/* Date/time + refresh */}
        <div className="flex items-center gap-2 px-3 py-1.5" style={textStyle}>
          <input
            ref={dateRef}
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            title={t('board.scrollDay')}
            className="bg-white/10 text-xs border border-white/15 rounded px-2 py-1 focus:outline-none focus:border-white/40 cursor-ns-resize [color-scheme:dark] transition-colors"
            style={textStyle}
          />
          <input
            ref={timeRef}
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            title={t('board.scrollTime')}
            className="bg-white/10 text-xs border border-white/15 rounded px-2 py-1 focus:outline-none focus:border-white/40 cursor-ns-resize [color-scheme:dark] transition-colors"
            style={textStyle}
          />
          <div className="flex items-center gap-1.5 ml-auto">
            {lastUpdate && (
              <span className="text-2xs opacity-40">
                {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={fetchTrains}
              disabled={loading}
              className="opacity-40 hover:opacity-100 transition-opacity p-1"
            >
              <FontAwesomeIcon icon={faSync} size="xs" className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Destination search */}
        <DestinationSearch
          stationId={stationId}
          destination={destination}
          onDestinationChange={setDestination}
          mode={mode}
        />
      </div>

      {/* ── Column headers (darkest shade) ── */}
      <div className="flex items-center gap-3 px-3 py-1.5 board-col-header text-xs font-semibold uppercase tracking-widest shrink-0" style={{ ...textStyle, opacity: 0.5 }}>
        <div className="min-w-16 text-center">{t('board.time')}</div>
        <div className="flex-1">{mode === 'departures' ? t('board.destination') : t('board.provenance')}</div>
        <div className="shrink-0 text-right pr-5">{t('detail.track')}</div>
      </div>

      {/* ── Scrollable train list (main bg) ── */}
      <div className="flex-1 overflow-y-auto min-h-0" style={textStyle}>
        {loading && trains.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14">
            <span className="loading loading-dots loading-md opacity-60" />
            <p className="opacity-40 text-sm mt-3">{t('board.loading')}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-14 px-6">
            <FontAwesomeIcon icon={faExclamationCircle} size="2x" className="mb-3" />
            <p className="opacity-70 text-sm text-center">{error}</p>
            <button
              onClick={fetchTrains}
              className="mt-4 px-5 py-2 bg-white/15 rounded-lg text-sm font-semibold hover:bg-white/25 transition-all"
            >
              {t('board.retry')}
            </button>
          </div>
        ) : filteredTrains.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 opacity-30">
            <FontAwesomeIcon icon={faTrain} size="2x" className="mb-3" />
            <p className="text-sm">{destination ? t('board.noTrainDest') : t('board.noTrain')}</p>
          </div>
        ) : (
          <div>
            {filteredTrains.map((train, idx) => (
              <TrainRow
                key={`${train.stop_date_time?.departure_date_time}-${idx}`}
                train={train}
                type={mode === 'departures' ? 'departure' : 'arrival'}
                onClick={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      <TrainDetailSheet
        train={selected}
        type={mode === 'departures' ? 'departure' : 'arrival'}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
