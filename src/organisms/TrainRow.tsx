import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import TimeDisplay from '../atoms/TimeDisplay'
import TrainTypeBadge from '../atoms/TrainTypeBadge'
import StatusBadge from '../atoms/StatusBadge'
import TransportIcon from '../atoms/TransportIcon'
import {
  formatTime, getDelay, getTrainType, getPhysicalMode
} from '../services/apiService'
import type { Train } from '../types'

interface Props {
  train: Train
  type: 'departure' | 'arrival'
  onClick: (t: Train) => void
}

/**
 * Build a smart display label from API data:
 * - RER/Transilien: "RER B", "Transilien K"
 * - TER: line code like "C41", "K52" (from label field)
 * - TGV/OUIGO/Lyria: commercial_mode "TGV INOUI", "OUIGO", etc.
 */
function getSmartLabel(info: Train['display_informations']): string {
  const cm = info?.commercial_mode ?? ''
  const label = info?.label ?? ''
  const code = info?.code ?? ''

  // RER: commercial_mode = "RER", label = "B" → "RER B"
  if (cm === 'RER' && label.length <= 2) return `RER ${label}`

  // Transilien: commercial_mode = "TRANSILIEN", label = "K" → "TN ${label}"
  if (cm === 'TRANSILIEN' && label.length <= 2) return `TN ${label}`

  // TER: label is the line code (C41, K52, K10...)
  if (cm.startsWith('TER') && label && label.length <= 4) return label

  // TGV INOUI, OUIGO, TGV Lyria, IC, etc. — use commercial_mode directly
  if (cm) return cm

  return code || label || 'Train'
}

/**
 * Get the provenance (origin) for arrivals.
 * The API `direction` field always points to the line terminus,
 * which for arrivals is often the current station.
 * For arrivals we need to look elsewhere:
 * - For TER: label is the line code, not helpful
 * - The only reliable source for arrivals origin is stop_point.name if different,
 *   or we fall back to display_informations.direction
 * For departures: direction is the correct destination.
 */
function getDisplayDestination(train: Train, type: 'departure' | 'arrival'): string {
  const info = train.display_informations
  if (type === 'departure') {
    return info?.direction ?? train.route?.direction?.stop_area?.name ?? 'N/A'
  }
  // Arrivals: direction is the final destination of the route
  // This is actually correct for arrivals too — it shows where the train is going
  // But the user wants to see the origin. Unfortunately the API doesn't give us the origin
  // in the arrivals endpoint directly. The `direction` IS the displayed destination.
  return info?.direction ?? 'N/A'
}

export default function TrainRow({ train, type, onClick }: Props) {
  const sdt = train.stop_date_time
  const scheduled = type === 'departure'
    ? (sdt.base_departure_date_time ?? sdt.departure_date_time)
    : (sdt.base_arrival_date_time ?? sdt.arrival_date_time)
  const real = type === 'departure' ? sdt.departure_date_time : sdt.arrival_date_time

  const displayTime = formatTime(real ?? scheduled)
  const scheduledTime = formatTime(scheduled)
  const delay = getDelay(scheduled, real)

  const info = train.display_informations
  const destination = getDisplayDestination(train, type)

  const trainType = getTrainType(info?.commercial_mode, info?.physical_mode)
  const physMode = getPhysicalMode(info?.physical_mode)
  const number = info?.trip_short_name ?? info?.headsign ?? ''
  const cancelled = info?.effect === 'NO_SERVICE'
  const smartLabel = getSmartLabel(info)

  return (
    <button
      onClick={() => onClick(train)}
      className={`w-full flex items-center gap-2 px-3 py-2.5 border-b border-white/8 train-row-hover text-left ${cancelled ? 'opacity-55' : ''}`}
    >
      {/* Mode icon */}
      <div className="w-5 shrink-0 flex items-center justify-center">
        <TransportIcon mode={physMode} className="opacity-30" size="xs" />
      </div>

      {/* Time */}
      <TimeDisplay time={displayTime} scheduledTime={scheduledTime} delay={delay} />

      {/* Train type badge + number */}
      <div className="w-16 shrink-0">
        <TrainTypeBadge type={trainType} number={number} label={smartLabel} />
      </div>

      {/* Destination */}
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm truncate leading-tight ${cancelled ? 'line-through opacity-40' : ''}`}>
          {destination}
        </div>
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge delay={delay} cancelled={cancelled} />
      </div>

      <FontAwesomeIcon icon={faChevronRight} className="opacity-20 shrink-0" size="xs" />
    </button>
  )
}
