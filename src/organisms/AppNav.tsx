/**
 * AppNav — Desktop top navigation bar (hidden on mobile).
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faBuilding, faFileAlt, faHeart, faGear, faLocationDot, faStar } from '@fortawesome/free-solid-svg-icons'
import SearchBar from './SearchBar'
import FavoriteButton from '../atoms/FavoriteButton'
import { isFavorite, toggleFavorite, setDefaultStation, getDefaultStation } from '../services/storageService'
import type { Place, TabId } from '../types'
import type { BoardMode } from '../utils/modeColors'
import { modeHeaderBg } from '../utils/modeColors'
import { useState } from 'react'

const NAV_TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'timetables', label: 'Horaires',  icon: faClock },
  { id: 'station',    label: 'En Gare',   icon: faBuilding },
  { id: 'bulletin',   label: 'Bulletin',  icon: faFileAlt },
  { id: 'favorites',  label: 'Favoris',   icon: faHeart },
  { id: 'settings',   label: 'Reglages',  icon: faGear },
]

interface Props {
  active: TabId
  onChange: (t: TabId) => void
  selected: Place | null
  onSelect: (p: Place | null) => void
  boardMode: BoardMode
}

export default function AppNav({ active, onChange, selected, onSelect, boardMode }: Props) {
  const id   = selected?.stop_area?.id ?? selected?.id ?? ''
  const name = selected?.stop_area?.name ?? selected?.name ?? ''

  const [fav, setFav] = useState(() => id ? isFavorite(id) : false)
  const [isDef, setIsDef] = useState(() =>
    id ? (getDefaultStation()?.stop_area?.id === id || getDefaultStation()?.id === id) : false
  )

  const headerBg = active === 'timetables' ? modeHeaderBg(boardMode) : 'bg-primary'

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
    <header className={`hidden lg:flex flex-col ${headerBg} text-primary-content sticky top-0 z-40 shadow-xl transition-colors duration-300`}>
      {/* Main bar */}
      <div className="px-6 xl:px-10 py-3 flex items-center gap-4 min-h-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0 mr-2">
          <span className="font-black text-xl tracking-tight">MaGare</span>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-sm xl:max-w-md 2xl:max-w-lg">
          <SearchBar onSelect={onSelect} selected={selected} />
        </div>

        {/* Nav tabs */}
        <nav className="flex items-center gap-1 ml-auto">
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                active === tab.id
                  ? 'bg-primary-content/20 text-primary-content'
                  : 'text-primary-content/60 hover:text-primary-content hover:bg-primary-content/10'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} size="sm" />
              <span className="hidden xl:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Station strip */}
      {name && (
        <div className="flex items-center gap-2 px-6 xl:px-10 py-2 bg-black/15 border-t border-primary-content/10">
          <FontAwesomeIcon icon={faLocationDot} size="xs" className="shrink-0" />
          <span className="font-semibold text-sm truncate flex-1">{name}</span>
          <button
            onClick={handleDef}
            title={isDef ? 'Retirer du defaut' : 'Definir comme gare par defaut'}
            className={`p-1.5 rounded-lg transition-colors ${isDef ? 'text-accent' : 'text-primary-content/30 hover:text-accent'}`}
          >
            <FontAwesomeIcon icon={faStar} size="xs" />
          </button>
          <FavoriteButton isFav={fav} onClick={handleFav} size="xs" />
        </div>
      )}
    </header>
  )
}
