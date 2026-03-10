import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import TimeDisplay from '../atoms/TimeDisplay'
import TrainTypeBadge from '../atoms/TrainTypeBadge'
import TrackBadge from '../atoms/TrackBadge'
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

  const network = info?.network ?? ''

  return (
    <button
      onClick={() => onClick(train)}
      className={`w-full flex items-center gap-2 px-3 py-3 border-b border-primary-content/10 train-row-hover text-left ${cancelled ? 'opacity-55' : ''}`}
    >
      {/* Mode icon */}
      <div className="w-5 shrink-0 flex items-center justify-center">
        <TransportIcon mode={physMode} className="text-primary-content/30" size="xs" />
      </div>

      {/* Time */}
      <TimeDisplay time={displayTime} scheduledTime={scheduledTime} delay={delay} />

      {/* Train type badge */}
      <div className="w-14 shrink-0">
        <TrainTypeBadge type={trainType} number={number} />
      </div>

      {/* Destination */}
      <div className="flex-1 min-w-0">
        <div className={`font-bold text-sm truncate leading-tight ${cancelled ? 'line-through text-primary-content/40' : 'text-primary-content'}`}>
          {destination}
        </div>
        {network && (
          <div className="text-primary-content/50 text-xs truncate">{network}</div>
        )}
      </div>

      {/* Right side: status + track */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusBadge delay={delay} cancelled={cancelled} />
        {track && <TrackBadge track={track} />}
      </div>

      <FontAwesomeIcon icon={faChevronRight} className="text-primary-content/20 shrink-0" size="xs" />
    </button>
  )
}
