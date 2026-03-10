import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { getDefaultStation } from '../services/storageService'
import type { Place } from '../types'
import { useEffect, useState } from 'react'
import TransportIcon from '../atoms/TransportIcon'

interface Props {
  onSelect: (p: Place) => void
}

export default function DefaultStationBanner({ onSelect }: Props) {
  const [defaultStation, setDefault] = useState<Place | null>(null)

  useEffect(() => {
    const def = getDefaultStation()
    setDefault(def)
  }, [])

  return (
    <div className="px-4 py-5 max-w-3xl mx-auto">
      {/* Default station */}
      {defaultStation ? (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faLocationDot} className="text-primary" size="xs" />
            <span className="text-base-content/50 text-xs font-semibold uppercase tracking-wider">Gare par defaut</span>
          </div>
          <button
            onClick={() => onSelect(defaultStation)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-base-100 border border-base-300 rounded-xl hover:bg-base-200 hover:border-primary/30 transition-colors text-left shadow-sm"
          >
            <TransportIcon mode="train" className="text-primary" size="sm" />
            <span className="text-base-content font-semibold text-sm">
              {defaultStation.stop_area?.name ?? defaultStation.name}
            </span>
          </button>
        </div>
      ) : (
        <div className="mb-5 p-4 bg-base-100 border border-base-300 rounded-xl text-center shadow-sm">
          <FontAwesomeIcon icon={faLocationDot} className="text-base-content/20 mb-2" size="lg" />
          <p className="text-base-content/60 text-sm font-medium">Aucune gare par defaut</p>
          <p className="text-base-content/35 text-xs mt-1">Recherchez une gare et definissez-la comme defaut depuis l'en-tete</p>
        </div>
      )}

      {/* Quick tip */}
      <div className="flex items-start gap-2 p-3 bg-base-100 border border-base-300 rounded-lg shadow-sm">
        <FontAwesomeIcon icon={faStar} className="text-accent mt-0.5" size="xs" />
        <p className="text-base-content/50 text-xs leading-relaxed">
          Ajoutez des gares en favoris via le <span className="text-error">&#9829;</span> pour les retrouver rapidement dans la recherche.
        </p>
      </div>
    </div>
  )
}
