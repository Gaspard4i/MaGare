import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import SearchInput from '../molecules/SearchInput'
import StationResultItem from '../molecules/StationResultItem'
import { searchStations } from '../services/apiService'
import { getFavorites, getFavoritePlaces } from '../services/storageService'
import type { Place } from '../types'

interface Props {
  onSelect: (p: Place | null) => void
  selected: Place | null
}

export default function SearchBar({ onSelect}: Props) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState<Place[]>([])
  const [favs, setFavs]         = useState<Place[]>([])
  const [loading, setLoading]   = useState(false)
  const [open, setOpen]         = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (query.length < 2) {
      setResults([])
      if (query.length === 0 && favs.length > 0) setOpen(true)
      else if (query.length > 0) setOpen(false)
      return
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const places = await searchStations(query)
        const favIds = getFavorites()
        const sorted = [...places].sort((a, b) => {
          const af = favIds.includes(a.stop_area?.id ?? a.id) ? -1 : 0
          const bf = favIds.includes(b.stop_area?.id ?? b.id) ? -1 : 0
          return af - bf
        })
        setResults(sorted)
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 320)
    return () => clearTimeout(timerRef.current)
  }, [query])

  const loadFavs = () => {
    const places = getFavoritePlaces()
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
    onSelect(p)
    setQuery(p.stop_area?.name ?? p.name ?? '')
    setOpen(false)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
    onSelect(null)
    loadFavs()
  }

  const showFavs    = open && query.length < 2 && favs.length > 0
  const showResults = open && query.length >= 2 && results.length > 0
  const showEmpty   = open && query.length >= 2 && results.length === 0 && !loading

  return (
    <div ref={wrapRef} className="relative w-full">
      <SearchInput
        value={query}
        onChange={setQuery}
        onClear={handleClear}
        loading={loading}
        placeholder="Rechercher une gare..."
        onFocus={handleFocus}
      />

      {/* Favorites panel */}
      {showFavs && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-base-300 bg-base-200">
            <FontAwesomeIcon icon={faHeart} className="text-error" size="xs" />
            <span className="text-base-content/50 text-xs font-semibold uppercase tracking-wider">Mes gares favorites</span>
          </div>
          {favs.map((p, i) => (
            <StationResultItem
              key={p.stop_area?.id ?? p.id ?? i}
              place={p}
              onSelect={handleSelect}
              variant="light"
            />
          ))}
        </div>
      )}

      {/* Search results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-xl shadow-2xl z-50 overflow-hidden max-h-72 overflow-y-auto">
          {results.map((p, i) => (
            <StationResultItem
              key={p.stop_area?.id ?? p.id ?? i}
              place={p}
              onSelect={handleSelect}
              variant="light"
            />
          ))}
        </div>
      )}

      {/* No results */}
      {showEmpty && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-xl p-4 text-base-content/50 text-sm text-center z-50">
          Aucune gare trouvee
        </div>
      )}
    </div>
  )
}
