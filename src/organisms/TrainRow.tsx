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
  const destination = type === 'departure'
    ? (info?.direction ?? train.route?.direction?.stop_area?.name ?? 'N/A')
    : (info?.name ?? 'N/A')

  const trainType = getTrainType(info?.commercial_mode, info?.physical_mode)
  const physMode = getPhysicalMode(info?.physical_mode)
  const number = info?.trip_short_name ?? info?.headsign ?? ''
  const track = train.stop_point?.platform_code ?? null
  const cancelled = info?.effect === 'NO_SERVICE'
  // Use the actual commercial mode name from the API
  const commercialLabel = info?.commercial_mode || trainType

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
      <div className="w-14 shrink-0">
        <TrainTypeBadge type={trainType} number={number} label={commercialLabel} />
      </div>

      {/* Destination + track */}
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm truncate leading-tight ${cancelled ? 'line-through opacity-40' : ''}`}>
          {destination}
        </div>
        {track && (
          <div className="text-xs opacity-50 mt-0.5">
            Voie {track}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge delay={delay} cancelled={cancelled} />
      </div>

      <FontAwesomeIcon icon={faChevronRight} className="opacity-20 shrink-0" size="xs" />
    </button>
  )
}
