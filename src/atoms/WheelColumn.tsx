import { useRef, useEffect, useCallback } from 'react'

interface Props {
  items: string[]
  selectedIndex: number
  onChange: (index: number) => void
  itemHeight?: number
}

export default function WheelColumn({ items, selectedIndex, onChange, itemHeight = 44 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isScrolling = useRef(false)
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const visibleItems = 5
  const containerHeight = itemHeight * visibleItems
  const paddingItems = Math.floor(visibleItems / 2)

  const scrollToIndex = useCallback((index: number, smooth = false) => {
    const el = containerRef.current
    if (!el) return
    const targetScroll = index * itemHeight
    el.scrollTo({ top: targetScroll, behavior: smooth ? 'smooth' : 'instant' })
  }, [itemHeight])

  useEffect(() => {
    scrollToIndex(selectedIndex)
  }, [selectedIndex, scrollToIndex])

  const handleScroll = useCallback(() => {
    if (scrollTimer.current) clearTimeout(scrollTimer.current)
    isScrolling.current = true

    scrollTimer.current = setTimeout(() => {
      isScrolling.current = false
      const el = containerRef.current
      if (!el) return
      const rawIndex = Math.round(el.scrollTop / itemHeight)
      const newIndex = Math.max(0, Math.min(items.length - 1, rawIndex))
      if (newIndex !== selectedIndex) {
        onChange(newIndex)
      }
      scrollToIndex(newIndex, true)
    }, 80)
  }, [items.length, selectedIndex, onChange, scrollToIndex, itemHeight])

  return (
    <div className="relative" style={{ height: containerHeight }}>
      {/* Selection highlight */}
      <div
        className="absolute left-2 right-2 rounded-xl bg-base-200 pointer-events-none z-0"
        style={{ top: paddingItems * itemHeight, height: itemHeight }}
      />

      {/* Fade gradients */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-base-100 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-base-100 to-transparent pointer-events-none z-10" />

      <div
        ref={containerRef}
        className="h-full overflow-y-auto scrollbar-none snap-y snap-mandatory"
        onScroll={handleScroll}
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {/* Top padding */}
        {Array.from({ length: paddingItems }).map((_, i) => (
          <div key={`pad-top-${i}`} style={{ height: itemHeight }} />
        ))}

        {items.map((item, idx) => {
          const isSelected = idx === selectedIndex
          return (
            <div
              key={idx}
              className={`flex items-center justify-center snap-center cursor-pointer select-none transition-all duration-150 ${
                isSelected
                  ? 'text-base-content font-bold text-2xl'
                  : 'text-base-content/30 text-lg'
              }`}
              style={{ height: itemHeight }}
              onClick={() => {
                onChange(idx)
                scrollToIndex(idx, true)
              }}
            >
              {item}
            </div>
          )
        })}

        {/* Bottom padding */}
        {Array.from({ length: paddingItems }).map((_, i) => (
          <div key={`pad-bot-${i}`} style={{ height: itemHeight }} />
        ))}
      </div>
    </div>
  )
}
