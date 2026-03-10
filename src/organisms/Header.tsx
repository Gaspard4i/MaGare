/**
 * Header — Mobile-only compact header (lg:hidden).
 * On desktop, AppNav is used instead.
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLocationDot, faStar } from '@fortawesome/free-solid-svg-icons'
import SearchBar from './SearchBar'
import FavoriteButton from '../atoms/FavoriteButton'
import { isFavorite, toggleFavorite, setDefaultStation, getDefaultStation } from '../services/storageService'
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
  const id   = selected?.stop_area?.id ?? selected?.id ?? ''
  const name = selected?.stop_area?.name ?? selected?.name ?? ''

  const [fav, setFav] = useState(() => id ? isFavorite(id) : false)
  const [isDef, setIsDef] = useState(() =>
    id ? (getDefaultStation()?.stop_area?.id === id || getDefaultStation()?.id === id) : false
  )

  const headerBg = activeTab === 'timetables' ? modeHeaderBg(boardMode) : 'bg-primary'

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!id || !selected) return
    setFav(toggleFavorite(id, selected))
  }
  const handleDef = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!selected) return
    setDefaultStation(isDef ? null : selected)
    setIsDef(v => !v)
  }

  return (
    <header className={`lg:hidden ${headerBg} text-primary-content sticky top-0 z-40 shadow-xl transition-colors duration-300`}>
      {/* Logo + search row */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-black text-base tracking-tight">MaGare</span>
        </div>
        <div className="flex-1">
          <SearchBar onSelect={onSelect} selected={selected} />
        </div>
      </div>

      {/* Station strip */}
      {name && (
        <div className="flex items-center gap-2 px-4 py-2 bg-black/15 border-t border-primary-content/10">
          <FontAwesomeIcon icon={faLocationDot} size="xs" className="shrink-0" />
          <span className="font-semibold text-sm truncate flex-1">{name}</span>
          <button
            onClick={handleDef}
            title={isDef ? 'Retirer du defaut' : 'Definir comme gare par defaut'}
            className={`p-1 transition-colors ${isDef ? 'text-accent' : 'text-primary-content/30 hover:text-accent'}`}
          >
            <FontAwesomeIcon icon={faStar} size="xs" />
          </button>
          <FavoriteButton isFav={fav} onClick={handleFav} size="xs" />
        </div>
      )}
    </header>
  )
}
