import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

interface Props { delay: number; cancelled?: boolean }

export default function StatusBadge({ delay, cancelled }: Props) {
  if (cancelled) return (
    <span className="badge badge-error gap-1 text-xs font-semibold py-3 px-2 rounded-full">
      <FontAwesomeIcon icon={faXmark} size="xs" />
      Supprimé
    </span>
  )
  if (delay > 0) return (
    <span className="badge badge-warning gap-1 text-xs font-semibold py-3 px-2 rounded-full">
      <FontAwesomeIcon icon={faCircleExclamation} size="lg" />
      +{delay} min

    </span>
  )
  return (
    <span className="badge badge-success gap-1 text-xs font-semibold py-3 px-2 rounded-full">
      <FontAwesomeIcon icon={faCheck} size="xs" />
      À l'heure
    </span>
  )
}
