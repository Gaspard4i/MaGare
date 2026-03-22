import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrain, faPersonWalking } from '@fortawesome/free-solid-svg-icons'
import FavoriteButton from '../atoms/FavoriteButton'
import type { Place } from '../types'

interface Props {
  place: Place
  isFavorite: boolean
  onToggleFavorite: (e: React.MouseEvent) => void
  onSelect: (p: Place) => void
  distance?: number | null
  variant?: 'favorite' | 'nearby'
}

export default function StationCard({ place, isFavorite, onToggleFavorite, onSelect, distance, variant = 'favorite' }: Props) {
  const name = place.stop_area?.name ?? place.name ?? ''

  return (
    <button
      onClick={() => onSelect(place)}
      className="w-full flex items-center gap-3 p-3 bg-base-100 rounded-2xl shadow-sm hover:shadow-md active:bg-base-200 transition-all text-left"
    >
      {/* Image placeholder */}
      <div className="w-20 h-16 rounded-xl bg-base-200 shrink-0 flex items-center justify-center overflow-hidden">
        <div className="flex flex-col items-center justify-center text-base-content/20">
          <FontAwesomeIcon icon={faTrain} size="lg" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-base-content truncate">{name}</div>
        {variant === 'nearby' && distance != null && (
          <div className="flex items-center gap-1 mt-1 text-xs text-base-content/50">
            <FontAwesomeIcon icon={faPersonWalking} size="xs" />
            <span>{distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`}</span>
          </div>
        )}
      </div>

      {/* Favorite button */}
      <FavoriteButton
        isFav={isFavorite}
        onClick={onToggleFavorite}
        size="sm"
        variant="light"
      />
    </button>
  )
}
