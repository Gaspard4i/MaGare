import { useState, useEffect, useCallback, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync, faTrain, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import TrainRow from './TrainRow'
import TrainDetailSheet from './TrainDetailSheet'
import TimePickerSheet from './TimePickerSheet'
import DestinationSearch from '../molecules/DestinationSearch'
import NowButton from '../atoms/NowButton'
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
  const [timePickerOpen, setTimePickerOpen] = useState(false)

  const stationId = station?.stop_area?.id ?? station?.id ?? ''
  const boardClass = mode === 'departures' ? 'board-departures' : 'board-arrivals'

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

  const handleNow = () => {
    setDate(todayStr())
    setTime(nowStr())
  }

  const handleTimeApply = (newDate: string, newTime: string) => {
    setDate(newDate)
    setTime(newTime)
  }

  // Format display time for the button
  const isNow = date === todayStr() && time === nowStr()
  const displayDateLabel = date === todayStr() ? t('time.today') : date === (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] })() ? t('time.tomorrow') : date

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
        {/* Destination search + Now button */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex-1">
            <DestinationSearch
              stationId={stationId}
              destination={destination}
              onDestinationChange={setDestination}
              mode={mode}
            />
          </div>
          <NowButton onClick={handleNow} />
        </div>

        {/* Transport mode pill + time display */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-t border-white/10" style={textStyle}>
          <button
            onClick={() => setTimePickerOpen(true)}
            className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 hover:bg-white/15 transition-colors"
          >
            <FontAwesomeIcon icon={faTrain} size="xs" className="opacity-60" />
            <span className="text-xs font-semibold">{t('board.trains')}</span>
          </button>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => setTimePickerOpen(true)}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity"
            >
              {time}
            </button>
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

      <TimePickerSheet
        isOpen={timePickerOpen}
        date={date}
        time={time}
        onApply={handleTimeApply}
        onClose={() => setTimePickerOpen(false)}
      />
    </div>
  )
}
