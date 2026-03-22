import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import WheelColumn from '../atoms/WheelColumn'

interface Props {
  date: string
  time: string
  onDateChange: (d: string) => void
  onTimeChange: (t: string) => void
}

const todayStr = () => new Date().toISOString().split('T')[0]
const tomorrowStr = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function WheelPicker({ date, time, onDateChange, onTimeChange }: Props) {
  const { t } = useTranslation()
  const today = todayStr()
  const tomorrow = tomorrowStr()
  const isToday = date === today
  const isTomorrow = date === tomorrow

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')), [])
  const minutes = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')), [])

  const [h, m] = time.split(':').map(Number)
  const hourIndex = h
  const minuteIndex = Math.round(m / 5) % 12

  const handleHourChange = (idx: number) => {
    onTimeChange(`${String(idx).padStart(2, '0')}:${String(minuteIndex * 5).padStart(2, '0')}`)
  }

  const handleMinuteChange = (idx: number) => {
    onTimeChange(`${String(hourIndex).padStart(2, '0')}:${String(idx * 5).padStart(2, '0')}`)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Today / Tomorrow toggle */}
      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={() => onDateChange(today)}
          className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all ${
            isToday
              ? 'bg-base-content text-base-100 shadow-md'
              : 'bg-base-200 text-base-content/60 hover:bg-base-300'
          }`}
        >
          {t('time.today')}
        </button>
        <button
          onClick={() => onDateChange(tomorrow)}
          className={`flex-1 py-3 rounded-2xl font-semibold text-sm transition-all ${
            isTomorrow
              ? 'bg-base-content text-base-100 shadow-md'
              : 'bg-base-200 text-base-content/60 hover:bg-base-300'
          }`}
        >
          {t('time.tomorrow')}
        </button>
      </div>

      {/* Wheel columns */}
      <div className="flex items-center justify-center gap-2 w-full max-w-xs">
        <div className="flex-1">
          <WheelColumn
            items={hours}
            selectedIndex={hourIndex}
            onChange={handleHourChange}
          />
        </div>
        <div className="flex-1">
          <WheelColumn
            items={minutes}
            selectedIndex={minuteIndex}
            onChange={handleMinuteChange}
          />
        </div>
      </div>
    </div>
  )
}
