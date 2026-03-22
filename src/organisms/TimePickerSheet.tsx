import { useState, useCallback, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import WheelPicker from '../molecules/WheelPicker'

interface Props {
  isOpen: boolean
  date: string
  time: string
  onApply: (date: string, time: string) => void
  onClose: () => void
}

const CLOSE_THRESHOLD = 100

export default function TimePickerSheet({ isOpen, date, time, onApply, onClose }: Props) {
  const { t } = useTranslation()
  const [localDate, setLocalDate] = useState(date)
  const [localTime, setLocalTime] = useState(time)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)

  useEffect(() => {
    if (isOpen) {
      setLocalDate(date)
      setLocalTime(time)
    }
  }, [isOpen, date, time])

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

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY)
  }, [handleDragStart])
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY)
  }, [handleDragMove])
  const onTouchEnd = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])
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

  useEffect(() => {
    if (!isOpen) setDragY(0)
  }, [isOpen])

  const handleApply = () => {
    onApply(localDate, localTime)
    onClose()
  }

  const sheetTransform = isOpen ? `translateY(${dragY}px)` : 'translateY(100%)'
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
        className={`fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-base-100 rounded-t-3xl shadow-2xl flex flex-col ${!isDragging ? 'transition-all duration-300 ease-out' : ''}`}
        style={{ transform: sheetTransform }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing select-none touch-none"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        >
          <div className="w-10 h-1 bg-base-300 rounded-full" />
        </div>

        {/* Close button */}
        <div className="flex justify-end px-4">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-base-200 text-base-content/60 hover:bg-base-300 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Title */}
        <div className="text-center px-6 pb-4">
          <h2 className="text-xl font-bold text-base-content">{t('time.title')}</h2>
          <p className="text-sm text-base-content/50 mt-1">{t('time.subtitle')}</p>
        </div>

        {/* Wheel Picker */}
        <div className="px-6 pb-4">
          <WheelPicker
            date={localDate}
            time={localTime}
            onDateChange={setLocalDate}
            onTimeChange={setLocalTime}
          />
        </div>

        {/* Apply button */}
        <div className="px-6 pb-8">
          <button
            onClick={handleApply}
            className="w-full py-3.5 bg-info text-info-content font-bold text-sm rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
          >
            {t('time.apply')}
          </button>
        </div>
      </div>
    </>
  )
}
