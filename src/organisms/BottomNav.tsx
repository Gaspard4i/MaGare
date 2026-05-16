import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faFileAlt, faHeart, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import type { TabId } from '../types'
import type { BoardMode } from '../utils/modeColors'
import { modeHeaderBg } from '../utils/modeColors'

const TABS: { id: TabId; labelKey: string; icon: any }[] = [
  { id: 'timetables', labelKey: 'nav.timetables', icon: faClock },
  { id: 'bulletin',   labelKey: 'nav.bulletin',   icon: faFileAlt },
  { id: 'favorites',  labelKey: 'nav.favorites',  icon: faHeart },
  { id: 'settings',   labelKey: 'nav.settings',   icon: faCircleInfo },
]

interface Props {
  active: TabId
  onChange: (t: TabId) => void
  boardMode: BoardMode
}

export default function BottomNav({ active, onChange, boardMode }: Props) {
  const { t } = useTranslation()
  const navBg = active === 'timetables' ? modeHeaderBg(boardMode) : 'bg-primary'

  return (
    <nav
      aria-label={t('nav.primary')}
      className={`lg:hidden dock dock-sm z-40 ${navBg} border-t border-primary-content/10 transition-colors duration-300`}
    >
      {TABS.map(tab => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={t(tab.labelKey)}
            className={`gap-1 min-h-[3rem] transition-colors ${
              isActive
                ? 'dock-active text-primary-content bg-primary-content/20'
                : 'text-primary-content/55 hover:text-primary-content/85'
            }`}
          >
            <FontAwesomeIcon icon={tab.icon} size="sm" aria-hidden="true" />
            <span className="dock-label text-2xs font-semibold">{t(tab.labelKey)}</span>
          </button>
        )
      })}
    </nav>
  )
}
