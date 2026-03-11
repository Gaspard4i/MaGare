import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faFileAlt, faHeart, faGear } from '@fortawesome/free-solid-svg-icons'
import type { TabId } from '../types'
import type { BoardMode } from '../utils/modeColors'
import { modeHeaderBg } from '../utils/modeColors'

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'timetables', label: 'Horaires',  icon: faClock },
  { id: 'bulletin',   label: 'Bulletin',  icon: faFileAlt },
  { id: 'favorites',  label: 'Favoris',   icon: faHeart },
  { id: 'settings',   label: 'Reglages',  icon: faGear },
]

interface Props {
  active: TabId
  onChange: (t: TabId) => void
  boardMode: BoardMode
}

export default function BottomNav({ active, onChange, boardMode }: Props) {
  const navBg = active === 'timetables' ? modeHeaderBg(boardMode) : 'bg-primary'

  return (
    <div className={`lg:hidden dock dock-sm z-40 ${navBg} border-t border-primary-content/10 transition-colors duration-300`}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`gap-1 transition-colors ${active === tab.id ? 'dock-active text-primary-content bg-primary-content/20' : 'text-primary-content/45 hover:text-primary-content/70'}`}
        >
          <FontAwesomeIcon icon={tab.icon} size="sm" />
          <span className="dock-label text-2xs font-semibold">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
