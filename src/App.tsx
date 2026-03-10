import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import AppNav    from './organisms/AppNav'
import Header    from './organisms/Header'
import BottomNav from './organisms/BottomNav'
import BoardPage    from './pages/BoardPage'
import BulletinPage from './pages/BulletinPage'
import FavoritesPage from './pages/FavoritesPage'
import SettingsPage  from './pages/SettingsPage'
import { getDefaultStation, getTheme } from './services/storageService'
import type { Place, TabId } from './types'
import type { BoardMode } from './utils/modeColors'

const TAB_PATHS: Record<TabId, string> = {
  timetables: '/horaires',
  bulletin:   '/bulletin',
  favorites:  '/favoris',
  settings:   '/reglages',
}

const PATH_TABS: Record<string, TabId> = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([k, v]) => [v, k as TabId])
)

function AppShell() {
  const [station, setStation]     = useState<Place | null>(null)
  const [boardMode, setBoardMode] = useState<BoardMode>('departures')

  const navigate      = useNavigate()
  const { pathname }  = useLocation()
  const tab           = PATH_TABS[pathname] ?? 'timetables'
  const setTab        = (t: TabId) => navigate(TAB_PATHS[t])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', getTheme())
    const def = getDefaultStation()
    if (def) setStation(def)
  }, [])

  return (
    <div className="min-h-screen bg-base-200 flex flex-col">

      {/* ── Desktop top navbar ─────────────────────────────── */}
      <AppNav
        active={tab}
        onChange={setTab}
        selected={station}
        onSelect={setStation}
        boardMode={boardMode}
      />

      {/* ── Mobile compact header ──────────────────────────── */}
      <Header
        selected={station}
        onSelect={setStation}
        activeTab={tab}
        boardMode={boardMode}
      />

      {/* ── Main content (full width, pages manage their own layout) */}
      <main className="flex-1 flex flex-col min-h-0">
        <Routes>
          <Route path="/" element={<Navigate to="/horaires" replace />} />
          <Route path="/horaires" element={
            <BoardPage
              station={station}
              boardMode={boardMode}
              onSelect={setStation}
              onBoardModeChange={setBoardMode}
            />
          } />
          <Route path="/bulletin" element={<BulletinPage />} />
          <Route path="/favoris"  element={<FavoritesPage onSelect={setStation} onTabChange={setTab} />} />
          <Route path="/reglages" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/horaires" replace />} />
        </Routes>
      </main>

      {/* ── Mobile bottom nav ─────────────────────────────── */}
      <BottomNav active={tab} onChange={setTab} boardMode={boardMode} />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  )
}
