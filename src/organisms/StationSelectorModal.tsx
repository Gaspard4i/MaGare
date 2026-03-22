import { useState, useEffect, useRef, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faHeart as faHeartSolid, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import SearchInput from '../molecules/SearchInput'
import StationCard from '../molecules/StationCard'
import TabBar from '../atoms/TabBar'
import { searchStations } from '../services/apiService'
import { getFavoritePlaces, getFavorites, isFavorite, toggleFavorite } from '../services/storageService'
import type { Place } from '../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSelect: (p: Place) => void
  currentStation: Place | null
}

interface NearbyStation {
  place: Place
  distance: number
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function StationSelectorModal({ isOpen, onClose, onSelect, currentStation }: Props) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('favourites')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [favs, setFavs] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [nearby, setNearby] = useState<NearbyStation[]>([])
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const currentName = currentStation?.stop_area?.name ?? currentStation?.name ?? ''
  const currentId = currentStation?.stop_area?.id ?? currentStation?.id ?? ''
  const currentIsFav = currentId ? isFavorite(currentId) : false

  const loadFavs = useCallback(() => {
    setFavs(getFavoritePlaces())
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadFavs()
      setQuery('')
      setResults([])
    }
  }, [isOpen, loadFavs])

  // Search
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
        const favIds = getFavorites()
        const sorted = [...places].sort((a, b) => {
          const af = favIds.includes(a.stop_area?.id ?? a.id) ? -1 : 0
          const bf = favIds.includes(b.stop_area?.id ?? b.id) ? -1 : 0
          return af - bf
        })
        setResults(sorted)
      } finally {
        setLoading(false)
      }
    }, 320)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  // Geolocation for nearby tab
  useEffect(() => {
    if (activeTab !== 'nearby' || nearby.length > 0) return
    if (!navigator.geolocation) {
      setGeoError(t('station_selector.geoUnavailable'))
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // Search for nearby stations using a generic query with coordinates
          const places = await searchStations('')
          const withDist = places
            .filter(p => p.stop_area?.coord?.lat && p.stop_area?.coord?.lon)
            .map(p => ({
              place: p,
              distance: haversine(
                pos.coords.latitude, pos.coords.longitude,
                parseFloat(p.stop_area!.coord!.lat!),
                parseFloat(p.stop_area!.coord!.lon!)
              )
            }))
            .sort((a, b) => a.distance - b.distance)
          setNearby(withDist)
        } finally {
          setGeoLoading(false)
        }
      },
      () => {
        setGeoError(t('station_selector.geoError'))
        setGeoLoading(false)
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }, [activeTab, nearby.length, t])

  const handleSelect = (p: Place) => {
    onSelect(p)
    onClose()
  }

  const handleToggleFav = (e: React.MouseEvent, place: Place) => {
    e.stopPropagation()
    const id = place.stop_area?.id ?? place.id
    if (!id) return
    toggleFavorite(id, place)
    loadFavs()
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
  }

  const tabs = [
    { id: 'favourites', label: t('station_selector.favourites') },
    { id: 'nearby', label: t('station_selector.nearby') },
  ]

  const showSearch = query.length >= 2
  const displayItems = showSearch ? results : (activeTab === 'favourites' ? favs : [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-base-100 flex flex-col">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        {/* Close button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-base-300 text-base-content/60 hover:bg-base-200 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Current station */}
        {currentName && (
          <div className="flex items-center gap-2 mb-4">
            <FontAwesomeIcon
              icon={faHeartSolid}
              className={currentIsFav ? 'text-fav' : 'text-base-content/20'}
            />
            <span className="text-xl font-bold text-base-content">{currentName}</span>
          </div>
        )}

        {/* Search */}
        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={handleClear}
          loading={loading}
          placeholder={t('station_selector.searchPlaceholder')}
          variant="light"
        />
      </div>

      {/* Tabs */}
      {!showSearch && (
        <div className="shrink-0 px-4">
          <TabBar tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {showSearch ? (
          // Search results
          results.length === 0 && !loading ? (
            <div className="text-center text-base-content/40 py-10 text-sm">
              {t('search.noResult')}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((p, i) => {
                const id = p.stop_area?.id ?? p.id
                return (
                  <StationCard
                    key={id ?? i}
                    place={p}
                    isFavorite={id ? isFavorite(id) : false}
                    onToggleFavorite={e => handleToggleFav(e, p)}
                    onSelect={handleSelect}
                    variant="favorite"
                  />
                )
              })}
            </div>
          )
        ) : activeTab === 'favourites' ? (
          // Favorites
          favs.length === 0 ? (
            <div className="text-center text-base-content/40 py-10 text-sm">
              {t('favorites.empty')}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {favs.map((p, i) => {
                const id = p.stop_area?.id ?? p.id
                return (
                  <StationCard
                    key={id ?? i}
                    place={p}
                    isFavorite={true}
                    onToggleFavorite={e => handleToggleFav(e, p)}
                    onSelect={handleSelect}
                    variant="favorite"
                  />
                )
              })}
            </div>
          )
        ) : (
          // Nearby
          geoLoading ? (
            <div className="flex flex-col items-center justify-center py-14">
              <FontAwesomeIcon icon={faLocationCrosshairs} className="text-base-content/20 mb-3" size="2x" />
              <span className="loading loading-dots loading-md opacity-60" />
              <p className="text-base-content/40 text-sm mt-3">{t('station_selector.locating')}</p>
            </div>
          ) : geoError ? (
            <div className="text-center text-base-content/40 py-10 text-sm">
              {geoError}
            </div>
          ) : nearby.length === 0 ? (
            <div className="text-center text-base-content/40 py-10 text-sm">
              {t('station_selector.noNearby')}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {nearby.map(({ place: p, distance }, i) => {
                const id = p.stop_area?.id ?? p.id
                return (
                  <StationCard
                    key={id ?? i}
                    place={p}
                    isFavorite={id ? isFavorite(id) : false}
                    onToggleFavorite={e => handleToggleFav(e, p)}
                    onSelect={handleSelect}
                    distance={distance}
                    variant="nearby"
                  />
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}
