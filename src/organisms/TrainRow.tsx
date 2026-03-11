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
 * Build display label for the line code badge.
 * - TER: label field is the line code (C41, K52, K10)
 * - RER: label = line letter (B, D) → we prefix "RER"
 * - Transilien: label = line letter (K, H, R)
 * - TGV/OUIGO/Lyria: no meaningful line code, use headsign as train number
 */
function getLineCode(info: Train['display_informations']): string {
  const cm = info?.commercial_mode ?? ''
  const label = info?.label ?? ''

  // TER: label is the line code (C41, K52...)
  if (cm.startsWith('TER') && label && label.length <= 4) return label

  // RER: label is the line letter
  if (cm === 'RER' && label.length <= 2) return label

  // Transilien: label is the line letter
  if (cm === 'TRANSILIEN' && label.length <= 2) return label

  // For long-distance (TGV, OUIGO): no line code
  return ''
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
  const destination = info?.direction ?? train.route?.direction?.stop_area?.name ?? 'N/A'

  const trainType = getTrainType(info?.commercial_mode, info?.physical_mode)
  const physMode = getPhysicalMode(info?.physical_mode)
  const number = info?.trip_short_name ?? ''
  const cancelled = info?.effect === 'NO_SERVICE'

  const modeName = info?.commercial_mode ?? ''
  const lineCode = getLineCode(info)

  return (
    <button
      onClick={() => onClick(train)}
      className={`w-full flex items-center gap-2 px-3 py-2.5 border-b border-white/8 train-row-hover text-left ${cancelled ? 'opacity-55' : ''}`}
    >
      {/* Mode icon */}
      <div className="w-5 shrink-0 flex items-center justify-center">
        <TransportIcon mode={physMode} className="opacity-30" size="xs" />
      </div>

      {/* Time — most important */}
      <TimeDisplay time={displayTime} scheduledTime={scheduledTime} delay={delay} />

      {/* Destination/Provenance */}
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm truncate leading-tight ${cancelled ? 'line-through opacity-40' : ''}`}>
          {destination}
        </div>
      </div>

      {/* Train type + line code */}
      <div className="w-16 shrink-0">
        <TrainTypeBadge
          type={trainType}
          modeName={modeName}
          lineCode={lineCode}
          number={number}
          apiColor={info?.color || undefined}
          apiTextColor={info?.text_color || undefined}
        />
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge delay={delay} cancelled={cancelled} />
      </div>

      <FontAwesomeIcon icon={faChevronRight} className="opacity-20 shrink-0" size="xs" />
    </button>
  )
}
