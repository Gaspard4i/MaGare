import TransportIcon from '../atoms/TransportIcon'
import FavoriteButton from '../atoms/FavoriteButton'
import { isFavorite, toggleFavorite } from '../services/storageService'
import type { Place } from '../types'
import { useState } from 'react'

interface Props {
  place: Place
  onSelect: (p: Place) => void
  showFav?: boolean
  variant?: 'dark' | 'light'
}

export default function StationResultItem({ place, onSelect, showFav = true, variant = 'light' }: Props) {
  const id = place.stop_area?.id ?? place.id
  const name = place.stop_area?.name ?? place.name ?? 'Gare'
  const city = place.administrative_regions?.[0]?.name ?? ''
  const [fav, setFav] = useState(() => isFavorite(id))

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFav(toggleFavorite(id, place))
  }

  const isDark = variant === 'dark'

  return (
    <button
      onClick={() => onSelect(place)}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left border-b last:border-0 ${
        isDark
          ? 'hover:bg-primary-content/10 active:bg-primary-content/15 border-primary-content/10'
          : 'hover:bg-base-200 active:bg-base-300 border-base-300'
      }`}
    >
      <TransportIcon mode="train" className={isDark ? 'text-accent shrink-0' : 'text-primary shrink-0'} size="sm" />
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm truncate ${isDark ? 'text-primary-content' : 'text-base-content'}`}>{name}</div>
        {city && <div className={`text-xs truncate ${isDark ? 'text-primary-content/45' : 'text-base-content/50'}`}>{city}</div>}
      </div>
      {showFav && <FavoriteButton isFav={fav} onClick={handleFav} size="sm" variant={variant} />}
    </button>
  )
}
