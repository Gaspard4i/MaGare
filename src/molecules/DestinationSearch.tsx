import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes, faHeart, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import { searchStations } from '../services/apiService'
import { getDestFavPlaces, isDestFavorite, toggleDestFavorite } from '../services/storageService'
import type { Place } from '../types'

interface Props {
  stationId: string
  destination: Place | null
  onDestinationChange: (p: Place | null) => void
  mode: 'departures' | 'arrivals'
}

export default function DestinationSearch({ stationId, destination, onDestinationChange, mode }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [favs, setFavs] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (query.length < 2) {
      setResults([])
      return
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const places = await searchStations(query)
        setResults(places.filter(p => {
          const pid = p.stop_area?.id ?? p.id
          return pid !== stationId
        }))
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 320)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, stationId])

  const loadFavs = () => {
    const places = getDestFavPlaces(stationId)
    setFavs(places)
    return places
  }

  const handleFocus = () => {
    if (query.length < 2) {
      const places = loadFavs()
      if (places.length > 0) setOpen(true)
    }
  }

  const handleSelect = (p: Place) => {
    onDestinationChange(p)
    setQuery(p.stop_area?.name ?? p.name ?? '')
    setOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
    onDestinationChange(null)
  }

  const handleToggleFav = (e: React.MouseEvent, place: Place) => {
    e.stopPropagation()
    const destId = place.stop_area?.id ?? place.id
    toggleDestFavorite(stationId, destId, place)
    loadFavs()
  }

  const label = mode === 'departures' ? 'Vers' : 'Depuis'

  // Compact pill when destination is set
  if (destination) {
    const destName = destination.stop_area?.name ?? destination.name ?? ''
    const destId = destination.stop_area?.id ?? destination.id
    const destIsFav = isDestFavorite(stationId, destId)
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 border-t border-white/10" style={{ color: 'var(--board-text)' }}>
        <FontAwesomeIcon icon={faMapMarkerAlt} size="xs" className="opacity-40 shrink-0" />
        <span className="opacity-50 text-[10px] font-semibold uppercase tracking-wider shrink-0">{label}</span>
        <span className="text-xs font-semibold truncate flex-1">{destName}</span>
        <button
          onClick={e => handleToggleFav(e, destination)}
          className={`p-1 transition-colors shrink-0 ${destIsFav ? 'text-fav' : 'opacity-30 hover:text-fav'}`}
        >
          <FontAwesomeIcon icon={faHeart} size="xs" />
        </button>
        <button onClick={handleClear} className="opacity-40 hover:opacity-100 transition-opacity shrink-0">
          <FontAwesomeIcon icon={faTimes} size="xs" />
        </button>
      </div>
    )
  }

  const showFavs = open && query.length < 2 && favs.length > 0
  const showResults = open && query.length >= 2 && results.length > 0
  const showEmpty = open && query.length >= 2 && results.length === 0 && !loading

  return (
    <div ref={wrapRef} className="relative" style={{ color: 'var(--board-text)' }}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-t border-white/10">
        <FontAwesomeIcon icon={faMapMarkerAlt} size="xs" className="opacity-40 shrink-0" />
        <span className="opacity-50 text-[10px] font-semibold uppercase tracking-wider shrink-0">{label}</span>
        <div className="relative flex-1 flex items-center">
          <FontAwesomeIcon icon={faSearch} className="absolute left-2 z-10 pointer-events-none opacity-30" size="xs" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={handleFocus}
            placeholder={mode === 'departures' ? 'Filtrer par destination...' : 'Filtrer par provenance...'}
            className="w-full pl-6 pr-6 py-1 rounded-md bg-white/10 border border-white/15 placeholder-white/30 focus:outline-none focus:border-white/40 transition-all text-xs"
            style={{ color: 'inherit' }}
          />
          {loading && (
            <span className="absolute right-2 loading loading-spinner loading-xs opacity-50" />
          )}
          {!loading && query && (
            <button onClick={handleClear} className="absolute right-2 opacity-30 hover:opacity-100 transition-opacity">
              <FontAwesomeIcon icon={faTimes} size="xs" />
            </button>
          )}
        </div>
      </div>

      {/* Favorites dropdown */}
      {showFavs && (
        <div className="absolute top-full left-0 right-0 mt-0 bg-base-100 border border-base-300 rounded-b-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-base-300 bg-base-200">
            <FontAwesomeIcon icon={faHeart} className="text-error" size="xs" />
            <span className="text-base-content/50 text-xs font-semibold uppercase tracking-wider">
              {mode === 'departures' ? 'Destinations favorites' : 'Provenances favorites'}
            </span>
          </div>
          {favs.map((p, i) => {
            const pid = p.stop_area?.id ?? p.id
            return (
              <DestResult
                key={pid ?? i}
                place={p}
                isFav={true}
                onSelect={handleSelect}
                onToggleFav={e => handleToggleFav(e, p)}
              />
            )
          })}
        </div>
      )}

      {/* Search results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-0 bg-base-100 border border-base-300 rounded-b-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          {results.map((p, i) => {
            const pid = p.stop_area?.id ?? p.id
            return (
              <DestResult
                key={pid ?? i}
                place={p}
                isFav={isDestFavorite(stationId, pid)}
                onSelect={handleSelect}
                onToggleFav={e => handleToggleFav(e, p)}
              />
            )
          })}
        </div>
      )}

      {showEmpty && (
        <div className="absolute top-full left-0 right-0 mt-0 bg-base-100 border border-base-300 rounded-b-xl p-3 text-base-content/50 text-xs text-center z-50">
          Aucune gare trouvee
        </div>
      )}
    </div>
  )
}

function DestResult({ place, isFav, onSelect, onToggleFav }: {
  place: Place
  isFav: boolean
  onSelect: (p: Place) => void
  onToggleFav: (e: React.MouseEvent) => void
}) {
  const name = place.stop_area?.name ?? place.name ?? 'Gare'
  const city = place.administrative_regions?.[0]?.name ?? ''

  return (
    <button
      onClick={() => onSelect(place)}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-base-200 active:bg-base-300 transition-colors text-left border-b last:border-0 border-base-300"
    >
      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary shrink-0" size="sm" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-base-content truncate">{name}</div>
        {city && <div className="text-xs text-base-content/50 truncate">{city}</div>}
      </div>
      <button
        onClick={onToggleFav}
        className={`p-1 transition-colors ${isFav ? 'text-fav' : 'text-base-content/25 hover:text-fav'}`}
      >
        <FontAwesomeIcon icon={faHeart} size="sm" />
      </button>
    </button>
  )
}
