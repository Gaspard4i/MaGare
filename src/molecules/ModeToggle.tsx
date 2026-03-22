import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrain, faAnglesRight, faAnglesLeft } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import type { BoardMode } from '../utils/modeColors'

interface Props {
  mode: BoardMode;
  onChange: (m: BoardMode) => void
}

export default function ModeToggle({ mode, onChange }: Props) {
  const { t } = useTranslation()
  return (
    <div className="flex rounded-2xl overflow-hidden shadow-md">
      <button
        onClick={() => onChange('departures')}
        className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 font-bold text-sm transition-all duration-200 ${
          mode === 'departures'
            ? 'bg-primary text-primary-content'
            : 'bg-primary/70 text-primary-content/70 hover:bg-primary/80'
        }`}
      >
        <span>{t('board.departures')}</span>
        <FontAwesomeIcon icon={faAnglesRight} size="sm" />
        <FontAwesomeIcon icon={faTrain} size="sm" />
      </button>
      <button
        onClick={() => onChange('arrivals')}
        className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 font-bold text-sm transition-all duration-200 ${
          mode === 'arrivals'
            ? 'bg-secondary text-secondary-content'
            : 'bg-secondary/70 text-secondary-content/70 hover:bg-secondary/80'
        }`}
      >
        <FontAwesomeIcon icon={faTrain} className="scale-x-[-1]" size="sm" />
        <FontAwesomeIcon icon={faAnglesRight} size="sm" />
        <span>{t('board.arrivals')}</span>
      </button>
    </div>
  )
}
