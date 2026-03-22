import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

interface Props {
  onClick: () => void
}

export default function NowButton({ onClick }: Props) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-base-content/80 text-base-100 px-3 py-1.5 shrink-0 hover:bg-base-content transition-colors"
      title={t('time.now')}
    >
      <FontAwesomeIcon icon={faClock} size="sm" />
      <span className="text-2xs font-semibold">{t('time.now')}</span>
    </button>
  )
}
