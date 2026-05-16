/**
 * AppNav — Desktop top navigation bar (hidden on mobile).
 */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faFileAlt, faHeart, faCircleInfo, faLocationDot, faStar } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import SearchBar from './SearchBar'
import LanguageSwitcher from '../molecules/LanguageSwitcher'
import FavoriteButton from '../atoms/FavoriteButton'
import { isFavorite, toggleFavorite, setDefaultStation, getDefaultStation } from '../services/storageService'
import type { Place, TabId } from '../types'
import type { BoardMode } from '../utils/modeColors'
import { modeHeaderBg } from '../utils/modeColors'
import { useState } from 'react'

const NAV_TABS: { id: TabId; labelKey: string; icon: any }[] = [
  { id: 'timetables', labelKey: 'nav.timetables', icon: faClock },
  { id: 'bulletin',   labelKey: 'nav.bulletin',   icon: faFileAlt },
  { id: 'favorites',  labelKey: 'nav.favorites',  icon: faHeart },
  { id: 'settings',   labelKey: 'nav.settings',   icon: faCircleInfo },
]

interface Props {
  active: TabId
  onChange: (t: TabId) => void
  selected: Place | null
  onSelect: (p: Place | null) => void
  boardMode: BoardMode
}

export default function AppNav({ active, onChange, selected, onSelect, boardMode }: Props) {
  const { t } = useTranslation()
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
        {/* Logo (acts as home link) */}
        <button
          type="button"
          onClick={() => onChange('timetables')}
          aria-label={t('nav.home')}
          className="flex items-center gap-2.5 shrink-0 mr-2 rounded-lg px-1 -mx-1 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-content/40"
        >
          <span className="font-black text-xl tracking-tight">MaGare</span>
        </button>

        {/* Search bar */}
        <div className="flex-1 max-w-sm xl:max-w-md 2xl:max-w-lg">
          <SearchBar onSelect={onSelect} selected={selected} />
        </div>

        {/* Nav tabs */}
        <nav aria-label={t('nav.primary')} className="flex items-center gap-1 ml-auto">
          <LanguageSwitcher variant="compact" />
          {NAV_TABS.map(tab => {
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={t(tab.labelKey)}
                className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-xl font-semibold text-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-content/40 ${
                  isActive
                    ? 'bg-primary-content/20 text-primary-content'
                    : 'text-primary-content/65 hover:text-primary-content hover:bg-primary-content/10'
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} size="sm" aria-hidden="true" />
                <span className="hidden lg:inline">{t(tab.labelKey)}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Station strip */}
      {name && (
        <div className="flex items-center gap-2 px-6 xl:px-10 py-2 bg-black/15 border-t border-primary-content/10">
          <FontAwesomeIcon icon={faLocationDot} size="xs" className="shrink-0" />
          <span className="font-semibold text-sm truncate flex-1">{name}</span>
          <button
            onClick={handleDef}
            title={isDef ? t('default.unset') : t('default.set')}
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
