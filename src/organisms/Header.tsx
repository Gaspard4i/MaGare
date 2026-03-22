/**
 * Header — Mobile-only compact header (lg:hidden).
 * On desktop, AppNav is used instead.
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import StationSelectorModal from './StationSelectorModal'
import type { Place, TabId } from '../types'
import type { BoardMode } from '../utils/modeColors'
import { modeHeaderBg } from '../utils/modeColors'
import { useState } from 'react'

interface Props {
  selected: Place | null
  onSelect: (p: Place | null) => void
  activeTab: TabId
  boardMode: BoardMode
}

export default function Header({ selected, onSelect, activeTab, boardMode }: Props) {
  const { t } = useTranslation()
  const name = selected?.stop_area?.name ?? selected?.name ?? ''
  const [selectorOpen, setSelectorOpen] = useState(false)

  const headerBg = activeTab === 'timetables' ? modeHeaderBg(boardMode) : 'bg-primary'

  const handleStationSelect = (p: Place) => {
    onSelect(p)
    setSelectorOpen(false)
  }

  return (
    <>
      <header className={`lg:hidden ${headerBg} text-primary-content sticky top-0 z-40 shadow-xl transition-colors duration-300`}>
        {/* Station selector strip */}
        <button
          onClick={() => setSelectorOpen(true)}
          className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors"
        >
          <FontAwesomeIcon icon={faChevronDown} size="xs" className="opacity-60" />
          <span className="font-bold text-base truncate flex-1 text-left">
            {name || t('board.selectStation')}
          </span>
        </button>
      </header>

      <StationSelectorModal
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleStationSelect}
        currentStation={selected}
      />
    </>
  )
}
