import { useState, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSync, faTrain, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import TrainRow from './TrainRow'
import TrainDetailSheet from './TrainDetailSheet'
import TimePicker from '../molecules/TimePicker'
import { getDepartures, getArrivals, buildFromDatetime } from '../services/apiService'
import type { Train, Place } from '../types'

interface Props {
  station: Place | null
  mode: 'departures' | 'arrivals'
}

const todayStr = () => new Date().toISOString().split('T')[0]
const nowStr = () => new Date().toTimeString().substring(0, 5)

export default function TrainBoard({ station, mode }: Props) {
  const [trains, setTrains] = useState<Train[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [selected, setSelected] = useState<Train | null>(null)
  const [date, setDate] = useState(todayStr)
  const [time, setTime] = useState(nowStr)

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
      setError(e.message ?? 'Erreur de chargement')
      setTrains([])
    } finally {
      setLoading(false)
    }
  }, [station, mode, date, time])

  useEffect(() => {
    fetchTrains()
    const iv = setInterval(fetchTrains, 60_000)
    return () => clearInterval(iv)
  }, [fetchTrains])

  if (!station) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-primary-content/30">
        <FontAwesomeIcon icon={faTrain} size="3x" className="mb-4" />
        <p className="text-lg font-medium text-primary-content/50">Selectionnez une gare</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Status bar + refresh */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-primary-content/10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-primary-content/40 text-xs">
            {lastUpdate
              ? `Mis a jour ${lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
              : 'Chargement...'}
          </span>
        </div>
        <button
          onClick={fetchTrains}
          disabled={loading}
          className="text-primary-content/30 hover:text-primary-content transition-colors p-1 rounded-lg hover:bg-primary-content/10"
        >
          <FontAwesomeIcon icon={faSync} size="xs" className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Time picker */}
      <TimePicker date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />

      {/* Column headers */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-black/10 border-b border-primary-content/10 text-primary-content/40 text-xs font-semibold uppercase tracking-widest">
        <div className="w-5" />
        <div className="w-13 text-center">Heure</div>
        <div className="w-14">Train</div>
        <div className="flex-1">{mode === 'departures' ? 'Destination' : 'Provenance'}</div>
        <div className="shrink-0 text-right pr-5">Etat</div>
      </div>

      {/* Content */}
      {loading && trains.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14">
          <span className="loading loading-dots loading-md text-primary-content/60" />
          <p className="text-primary-content/40 text-sm mt-3">Chargement...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-14 px-6">
          <FontAwesomeIcon icon={faExclamationCircle} size="2x" className="text-primary-content mb-3" />
          <p className="text-primary-content/70 text-sm text-center">{error}</p>
          <button
            onClick={fetchTrains}
            className="mt-4 px-5 py-2 bg-primary-content/20 text-primary-content rounded-lg text-sm font-semibold hover:bg-primary-content/30 transition-all"
          >
            Reessayer
          </button>
        </div>
      ) : trains.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-primary-content/30">
          <FontAwesomeIcon icon={faTrain} size="2x" className="mb-3" />
          <p className="text-sm">Aucun train trouvé</p>
        </div>
      ) : (
        <div>
          {trains.map((train, idx) => (
            <TrainRow
              key={`${train.stop_date_time?.departure_date_time}-${idx}`}
              train={train}
              type={mode === 'departures' ? 'departure' : 'arrival'}
              onClick={setSelected}
            />
          ))}
        </div>
      )}

      <TrainDetailSheet
        train={selected}
        type={mode === 'departures' ? 'departure' : 'arrival'}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
