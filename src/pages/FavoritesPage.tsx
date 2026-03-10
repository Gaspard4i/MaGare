import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faTrain } from '@fortawesome/free-solid-svg-icons'
import { getFavoritePlaces, toggleFavorite } from '../services/storageService'
import type { Place, TabId } from '../types'
import { useState } from 'react'

interface Props { onSelect: (p: Place) => void; onTabChange: (t: TabId) => void }

export default function FavoritesPage({ onSelect, onTabChange }: Props) {
  const [favs, setFavs] = useState(() => getFavoritePlaces())

  const removeFav = (p: Place) => {
    const id = p.stop_area?.id ?? p.id
    toggleFavorite(id)
    setFavs(getFavoritePlaces())
  }

  const handleSelect = (p: Place) => {
    onSelect(p)
    onTabChange('timetables')
  }

  return (
    <div className="flex-1 overflow-auto pb-20 bg-base-200 min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-content px-4 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-primary-content/15 p-2.5 rounded-xl">
            <FontAwesomeIcon icon={faHeart} />
          </div>
          <div>
            <h1 className="font-bold text-base lg:text-lg">Mes Favoris</h1>
            <p className="text-primary-content/50 text-xs">{favs.length} gare{favs.length !== 1 ? 's' : ''} sauvegardee{favs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {favs.length === 0 ? (
          <div className="text-center py-20">
            <FontAwesomeIcon icon={faHeart} size="3x" className="text-base-300 mb-4" />
            <p className="text-base-content/50 font-medium text-lg">Aucune gare favorite</p>
            <p className="text-base-content/35 text-sm mt-1">Appuyez sur &#9829; pour ajouter une gare</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {favs.map((p, i) => {
              const name = p.stop_area?.name ?? p.name ?? 'Gare'
              const city = p.administrative_regions?.[0]?.name ?? ''
              return (
                <div key={p.stop_area?.id ?? p.id ?? i} className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md hover:border-primary/30 transition-all">
                  <div className="card-body p-4 flex-row items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                      <FontAwesomeIcon icon={faTrain} className="text-primary" />
                    </div>
                    <button onClick={() => handleSelect(p)} className="flex-1 text-left min-w-0">
                      <div className="font-bold text-base-content text-sm truncate">{name}</div>
                      {city && <div className="text-base-content/50 text-xs truncate">{city}</div>}
                    </button>
                    <button onClick={() => removeFav(p)} className="btn btn-ghost btn-sm text-fav hover:bg-error/10">
                      <FontAwesomeIcon icon={faHeart} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
