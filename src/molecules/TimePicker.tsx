import { useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'

interface Props {
  date: string
  time: string
  onDateChange: (d: string) => void
  onTimeChange: (t: string) => void
}

export default function TimePicker({ date, time, onDateChange, onTimeChange }: Props) {
  const timeRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  const timeVal = useRef(time)
  const dateVal = useRef(date)
  timeVal.current = time
  dateVal.current = date

  useEffect(() => {
    const el = timeRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const [h, m] = timeVal.current.split(':').map(Number)
      const step = 5
      const total = ((h * 60 + m) + (e.deltaY < 0 ? step : -step) + 1440) % 1440
      const nh = Math.floor(total / 60)
      const nm = total % 60
      onTimeChange(`${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [onTimeChange])

  useEffect(() => {
    const el = dateRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const d = new Date(dateVal.current + 'T00:00:00')
      d.setDate(d.getDate() + (e.deltaY < 0 ? 1 : -1))
      onDateChange(d.toISOString().split('T')[0])
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [onDateChange])

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-black/10 border-b border-primary-content/10">
      <FontAwesomeIcon icon={faClock} className="text-primary-content/40" size="xs" />
      <span className="text-primary-content/50 text-xs">A partir de</span>
      <input
        ref={dateRef}
        type="date"
        value={date}
        onChange={e => onDateChange(e.target.value)}
        title="Molette pour changer le jour"
        className="bg-primary-content/10 text-primary-content text-xs border border-primary-content/20 rounded px-2 py-1 focus:outline-none focus:border-primary-content/50 hover:border-primary-content/40 cursor-ns-resize [color-scheme:dark] transition-colors"
      />
      <input
        ref={timeRef}
        type="time"
        value={time}
        onChange={e => onTimeChange(e.target.value)}
        title="Molette pour changer l'heure (pas de 5 min)"
        className="bg-primary-content/10 text-primary-content text-xs border border-primary-content/20 rounded px-2 py-1 focus:outline-none focus:border-primary-content/50 hover:border-primary-content/40 cursor-ns-resize [color-scheme:dark] transition-colors"
      />
    </div>
  )
}
