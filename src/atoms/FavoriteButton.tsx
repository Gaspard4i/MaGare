import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'

interface Props {
  isFav: boolean
  onClick: (e: React.MouseEvent) => void
  size?: 'xs' | 'sm'
  variant?: 'dark' | 'light'
}

export default function FavoriteButton({ isFav, onClick, size = 'sm', variant = 'dark' }: Props) {
  const inactiveColor = variant === 'light'
    ? 'text-base-content/25 hover:text-fav'
    : 'text-primary-content/30 hover:text-fav'

  return (
    <button
      onClick={onClick}
      className={`transition-colors shrink-0 p-1 ${isFav ? 'text-fav' : inactiveColor}`}
      aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <FontAwesomeIcon icon={isFav ? faHeartSolid : faHeartRegular} size={size} />
    </button>
  )
}
