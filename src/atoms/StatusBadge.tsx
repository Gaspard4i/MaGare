import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

interface Props { delay: number; cancelled?: boolean }

export default function StatusBadge({ delay, cancelled }: Props) {
  const { t } = useTranslation()
  if (cancelled) return (
    <span className="badge badge-error gap-1 text-xs font-semibold py-3 px-2 rounded-full">
      <FontAwesomeIcon icon={faXmark} size="xs" />
      {t('status.cancelled')}
    </span>
  )
  if (delay > 0) return (
    <span className="badge badge-warning gap-1 text-xs font-semibold py-3 px-2 rounded-full">
      <FontAwesomeIcon icon={faCircleExclamation} size="xs" />
      +{delay} min
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-2xs opacity-40">
      <FontAwesomeIcon icon={faCheck} size="xs" />
      {t('status.onTime')}
    </span>
  )
}
