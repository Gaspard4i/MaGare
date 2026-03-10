import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrain, faBus, faTram, faFerry,
  faSubway, faPersonWalking
} from '@fortawesome/free-solid-svg-icons'
import type { PhysicalModeKey } from '../services/apiService'

interface Props {
  mode: PhysicalModeKey
  className?: string
  size?: 'xs' | 'sm' | 'lg' | '2x'
}

const iconMap = {
  train:  faTrain,
  bus:    faBus,
  tram:   faTram,
  metro:  faSubway,
  rer:    faTrain,
  boat:   faFerry,
  cable:  faPersonWalking,
}

export default function TransportIcon({ mode, className, size = 'sm' }: Props) {
  return <FontAwesomeIcon icon={iconMap[mode] ?? faTrain} className={className} size={size} />
}
