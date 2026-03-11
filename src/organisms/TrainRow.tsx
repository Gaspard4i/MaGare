import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faBus } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
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
 */
function getLineCode(info: Train['display_informations']): string {
  const cm = info?.commercial_mode ?? ''
  const label = info?.label ?? ''

  if (cm.startsWith('TER') && label && label.length <= 4) return label
  if (cm === 'RER' && label.length <= 2) return label
  if (cm === 'TRANSILIEN' && label.length <= 2) return label
  return ''
}

export default function TrainRow({ train, type, onClick }: Props) {
  const { t } = useTranslation()
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

  const track = train.stop_point?.platform_code ?? ''
  const isBusReplacement = physMode === 'bus'

  return (
    <button
      onClick={() => onClick(train)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 border-b border-white/8 train-row-hover text-left ${cancelled ? 'opacity-55' : ''}`}
    >
      {/* ── LEFT: Time + Status ── */}
      <div className="shrink-0 flex flex-col items-center gap-1 min-w-16">
        <TimeDisplay time={displayTime} scheduledTime={scheduledTime} delay={delay} />
        <StatusBadge delay={delay} cancelled={cancelled} />
      </div>

      {/* ── CENTER: Destination + Train type ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <TransportIcon mode={physMode} className="opacity-30" size="xs" />
          <span className={`font-bold text-sm truncate leading-tight ${cancelled ? 'line-through opacity-40' : ''}`}>
            {destination}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrainTypeBadge
            type={trainType}
            modeName={modeName}
            lineCode={lineCode}
            number={number}
            apiColor={info?.color || undefined}
            apiTextColor={info?.text_color || undefined}
          />
        </div>
      </div>

      {/* ── RIGHT: Track badge or Bus icon ── */}
      <div className="shrink-0 flex items-center gap-1">
        {track && !isBusReplacement ? (
          <div className="flex flex-col items-center rounded-lg px-2.5 py-1.5 min-w-10 shadow-sm" style={{ backgroundColor: '#FFFFFF' }}>
            <span className="text-2xs font-bold uppercase tracking-widest leading-none" style={{ color: 'rgba(0,0,0,0.4)' }}>
              {t('detail.track')}
            </span>
            <span className="text-lg font-black leading-tight" style={{ color: '#000000' }}>
              {track}
            </span>
          </div>
        ) : isBusReplacement ? (
          <FontAwesomeIcon icon={faBus} className="opacity-60" size="lg" />
        ) : null}
        <FontAwesomeIcon icon={faChevronRight} className="opacity-20 shrink-0" size="xs" />
      </div>
    </button>
  )
}
