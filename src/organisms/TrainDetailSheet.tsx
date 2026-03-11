import { useEffect, useState, useRef, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faExternalLinkAlt, faFileAlt, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import StopItem from '../molecules/StopItem'
import TrainTypeBadge from '../atoms/TrainTypeBadge'
import StatusBadge from '../atoms/StatusBadge'
import TransportIcon from '../atoms/TransportIcon'
import {
  formatTime, getDelay, getTrainType, getPhysicalMode,
  getVehicleJourney
} from '../services/apiService'
import type { Train, VehicleJourney } from '../types'

interface Props {
  train: Train | null
  type: 'departure' | 'arrival'
  onClose: () => void
}

const TER_BULLETIN_URL = 'https://www.ter.sncf.com/hauts-de-france/services-contacts/bulletin-retard'

const parseApiDt = (s?: string): Date | null => {
  if (!s || s.length < 15) return null
  const y = +s.substring(0, 4), mo = +s.substring(4, 6) - 1, d = +s.substring(6, 8)
  const h = +s.substring(9, 11), mi = +s.substring(11, 13), se = +s.substring(13, 15)
  return new Date(y, mo, d, h, mi, se)
}

const CLOSE_THRESHOLD = 100

export default function TrainDetailSheet({ train, type, onClose }: Props) {
  const [journey, setJourney] = useState<VehicleJourney | null>(null)
  const [loadingJourney, setLoadingJourney] = useState(false)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!train) { setJourney(null); return }
    const vjLink = train.links?.find(l => l.type === 'vehicle_journey')
    if (!vjLink) return
    setLoadingJourney(true)
    getVehicleJourney(vjLink.id)
      .then(setJourney)
      .catch(() => setJourney(null))
      .finally(() => setLoadingJourney(false))
  }, [train])

  // ── Drag/swipe to close ──
  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true)
    dragStartY.current = clientY
    setDragY(0)
  }, [])

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return
    const dy = Math.max(0, clientY - dragStartY.current)
    setDragY(dy)
  }, [isDragging])

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragY > CLOSE_THRESHOLD) {
      onClose()
    }
    setDragY(0)
  }, [isDragging, dragY, onClose])

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY)
  }, [handleDragStart])
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY)
  }, [handleDragMove])
  const onTouchEnd = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientY)
  }, [handleDragStart])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => handleDragMove(e.clientY)
    const onUp = () => handleDragEnd()
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  // Reset drag on close
  useEffect(() => {
    if (!train) setDragY(0)
  }, [train])

  const isOpen = !!train

  if (!train) return null

  const sdt = train.stop_date_time
  const scheduled = type === 'departure'
    ? (sdt.base_departure_date_time ?? sdt.departure_date_time)
    : (sdt.base_arrival_date_time ?? sdt.arrival_date_time)
  const real = type === 'departure' ? sdt.departure_date_time : sdt.arrival_date_time
  const delay = getDelay(scheduled, real)
  const displayTime = formatTime(real ?? scheduled)
  const info = train.display_informations
  const trainType = getTrainType(info?.commercial_mode, info?.physical_mode)
  const physMode = getPhysicalMode(info?.physical_mode)
  const destination = type === 'departure'
    ? (info?.direction ?? train.route?.direction?.stop_area?.name ?? 'N/A')
    : (info?.name ?? 'N/A')
  const cancelled = info?.effect === 'NO_SERVICE'
  const currentStopName = train.stop_point?.name ?? ''
  const track = train.stop_point?.platform_code

  const currentIdx = journey?.stop_times.findIndex(
    s => s.stop_point.name === currentStopName || s.stop_point.id === train.stop_point?.id
  ) ?? -1

  const trainDate = parseApiDt(real ?? scheduled)
  const isFuture = trainDate ? trainDate.getTime() > Date.now() : false

  const sheetBg = isFuture ? 'bg-primary' : 'bg-base-100'
  const handleBg = isFuture ? 'bg-primary-content/20' : 'bg-base-300'
  const borderColor = isFuture ? 'border-primary-content/10' : 'border-base-300'
  const textMain = isFuture ? 'text-primary-content' : 'text-base-content'
  const textMuted = isFuture ? 'text-primary-content/50' : 'text-base-content/50'
  const textDimmed = isFuture ? 'text-primary-content/40' : 'text-base-content/40'
  const textFaint = isFuture ? 'text-primary-content/30' : 'text-base-content/30'
  const timeColor = isFuture ? 'text-train-time' : 'text-train-time'
  const closeBtn = isFuture ? 'text-primary-content/50 hover:text-primary-content' : 'text-base-content/40 hover:text-base-content'

  const sheetTransform = isOpen
    ? `translateY(${dragY}px)`
    : 'translateY(100%)'
  const sheetOpacity = dragY > 0 ? Math.max(0.2, 1 - dragY / 300) : 1

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={dragY > 0 ? { opacity: sheetOpacity * 0.5 } : undefined}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto ${sheetBg} rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col ${!isDragging ? 'transition-all duration-300 ease-out' : ''}`}
        style={{ transform: sheetTransform }}
      >
        {/* Handle — drag zone */}
        <div
          className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing select-none touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        >
          <div className={`w-10 h-1 ${handleBg} rounded-full`} />
        </div>

        {/* Header */}
        <div className={`flex items-start gap-3 px-4 pb-3 border-b ${borderColor} shrink-0`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-2xl font-bold font-mono ${timeColor}`}>{displayTime}</span>
              <TrainTypeBadge type={trainType} number={info?.trip_short_name ?? info?.headsign} />
              <TransportIcon mode={physMode} className={textDimmed} size="sm" />
            </div>
            <div className={`text-lg font-semibold mt-1 ${cancelled ? `line-through ${textDimmed}` : textMain}`}>
              {destination}
            </div>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <StatusBadge delay={delay} cancelled={cancelled} />
              {track && (
                <span className="bg-primary-content text-primary font-bold text-xs px-2 py-0.5 rounded" style={!isFuture ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-content)' } : undefined}>
                  Voie {track}
                </span>
              )}
              {info?.network && (
                <span className={`${textDimmed} text-xs`}>{info.network}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className={`${closeBtn} p-1 transition-colors`}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Disruption message */}
        {info?.message && (
          <div className={`mx-4 mt-3 p-3 ${isFuture ? 'bg-error/20 border-error/40' : 'bg-error/10 border-error/30'} border rounded-lg flex gap-2 shrink-0`}>
            <FontAwesomeIcon icon={faCircleInfo} className="text-error mt-0.5 shrink-0" size="sm" />
            <p className={`${isFuture ? 'text-primary-content/80' : 'text-base-content/80'} text-xs leading-relaxed`}>{info.message}</p>
          </div>
        )}

        {/* Bulletin link */}
        {(delay > 2 || cancelled) && (
          <div className="mx-4 mt-3 shrink-0">
            <a
              href={TER_BULLETIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 p-3 ${isFuture ? 'bg-primary-content/10 border-primary-content/20 hover:bg-primary-content/15' : 'bg-base-200 border-base-300 hover:bg-base-300'} border rounded-lg transition-colors`}
            >
              <FontAwesomeIcon icon={faFileAlt} className={isFuture ? 'text-primary-content/60 shrink-0' : 'text-info shrink-0'} size="sm" />
              <div className="flex-1">
                <div className={`${isFuture ? 'text-primary-content' : 'text-base-content'} text-xs font-semibold`}>Obtenir un justificatif de retard</div>
                <div className={`${isFuture ? 'text-primary-content/45' : 'text-base-content/45'} text-xs`}>Via le site TER SNCF</div>
              </div>
              <FontAwesomeIcon icon={faExternalLinkAlt} className={`${textFaint}`} size="xs" />
            </a>
          </div>
        )}

        {/* Stops list */}
        <div className="flex-1 overflow-y-auto mt-3 pb-6">
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className={`${textMuted} text-xs font-semibold uppercase tracking-wider`}>Arrets desservis</span>
            {loadingJourney && <span className={`loading loading-spinner loading-xs ${textDimmed}`} />}
          </div>

          {!loadingJourney && journey && journey.stop_times.length > 0 ? (
            <div>
              {journey.stop_times.map((stop, idx) => (
                <StopItem
                  key={stop.stop_point.id ?? idx}
                  stop={stop}
                  isCurrent={idx === currentIdx}
                  isPast={idx < currentIdx}
                  isFirst={idx === 0}
                  isLast={idx === journey.stop_times.length - 1}
                  variant={isFuture ? 'dark' : 'light'}
                />
              ))}
            </div>
          ) : !loadingJourney && (
            <div className={`px-4 py-6 ${textFaint} text-sm text-center`}>
              Detail des arrets non disponible
            </div>
          )}
        </div>
      </div>
    </>
  )
}
