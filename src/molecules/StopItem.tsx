import { formatStopTime } from '../services/apiService'
import type { VehicleJourneyStopTime } from '../types'

interface Props {
  stop: VehicleJourneyStopTime
  isCurrent?: boolean
  isPast?: boolean
  isFirst?: boolean
  isLast?: boolean
  variant?: 'dark' | 'light'
}

export default function StopItem({ stop, isCurrent, isPast, isFirst, isLast, variant = 'light' }: Props) {
  const arr = formatStopTime(stop.arrival_time)
  const dep = formatStopTime(stop.departure_time)
  const skipped = stop.skipped_stop
  const dk = variant === 'dark'

  const currentBg = dk ? 'bg-primary-content/10 rounded-lg' : 'bg-primary/5 rounded-lg'
  const lineBg = dk ? 'bg-primary-content/20' : 'bg-base-300'
  const dotCurrent = dk ? 'border-primary-content bg-primary-content' : 'border-primary bg-primary'
  const dotSkipped = dk ? 'border-primary-content/20 bg-transparent' : 'border-base-300 bg-transparent'
  const dotNormal = dk ? 'border-primary-content/40 bg-transparent' : 'border-base-content/40 bg-base-100'

  const textCurrent = dk ? 'text-primary-content font-semibold' : 'text-base-content font-semibold'
  const textSkipped = dk ? 'line-through text-primary-content/30' : 'line-through text-base-content/30'
  const textNormal = dk ? 'text-primary-content/70' : 'text-base-content/70'

  const timeDim = dk ? 'text-primary-content/40' : 'text-base-content/40'
  const timeMid = dk ? 'text-primary-content/70' : 'text-base-content/70'
  const timeCurrent = dk ? 'text-primary-content' : 'text-base-content'
  const timeDefault = dk ? 'text-primary-content/60' : 'text-base-content/60'

  const voieColor = dk ? 'text-primary-content/50' : 'text-primary/70'

  return (
    <div className={`flex items-center gap-3 py-2 px-4 ${isPast ? 'opacity-40' : ''} ${isCurrent ? currentBg : ''}`}>
      {/* Timeline */}
      <div className="flex flex-col items-center shrink-0 w-4">
        {!isFirst && <div className={`w-px h-3 ${lineBg}`} />}
        <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
          isCurrent ? dotCurrent :
          skipped ? dotSkipped :
          dotNormal
        }`} />
        {!isLast && <div className={`w-px flex-1 min-h-3 ${lineBg}`} />}
      </div>

      {/* Stop name */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${
          isCurrent ? textCurrent : skipped ? textSkipped : textNormal
        }`}>
          {stop.stop_point.name}
        </div>
        {stop.stop_point.platform_code && (
          <div className={`text-xs ${voieColor}`}>Voie {stop.stop_point.platform_code}</div>
        )}
      </div>

      {/* Times */}
      <div className="text-right shrink-0">
        {arr !== dep ? (
          <>
            <div className={`${timeDim} text-xs font-mono`}>{arr}</div>
            <div className={`${timeMid} text-xs font-mono font-semibold`}>{dep}</div>
          </>
        ) : (
          <div className={`text-xs font-mono font-semibold ${isCurrent ? timeCurrent : timeDefault}`}>{dep}</div>
        )}
      </div>
    </div>
  )
}
