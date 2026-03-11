import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun, faGear, faTrash } from '@fortawesome/free-solid-svg-icons'
import { getTheme, setTheme } from '../services/storageService'
import { useState } from 'react'

const CREDITS = [
  { name: 'Gaspard Catry', role: 'Developpeur', url: 'https://github.com/Gaspard4i' },
  { name: 'Claude (Anthropic)', role: 'Assistant IA', url: 'https://anthropic.com' },
  { name: 'SNCF — API Navitia', role: 'Donnees temps reel', url: 'https://www.digital.sncf.com/startup/api' },
  { name: 'React', role: 'Librairie UI', url: 'https://react.dev' },
  { name: 'Vite', role: 'Bundler / serveur dev', url: 'https://vite.dev' },
  { name: 'Tailwind CSS', role: 'Framework CSS', url: 'https://tailwindcss.com' },
  { name: 'DaisyUI', role: 'Composants UI / themes', url: 'https://daisyui.com' },
  { name: 'Font Awesome', role: 'Icones', url: 'https://fontawesome.com' },
  { name: 'React Router', role: 'Routing SPA', url: 'https://reactrouter.com' },
  { name: 'TypeScript', role: 'Typage statique', url: 'https://www.typescriptlang.org' },
  { name: 'LZ-String', role: 'Compression URL', url: 'https://github.com/pieroxy/lz-string' },
  { name: 'GitHub Pages', role: 'Hebergement', url: 'https://pages.github.com' },
]

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(() => getTheme() === 'sncf-dark')

  const toggleTheme = () => {
    const next = isDark ? 'sncf' : 'sncf-dark'
    setTheme(next)
    setIsDark(!isDark)
  }

  const clearFavorites = () => {
    localStorage.removeItem('mg_favorites')
    localStorage.removeItem('mg_fav_places')
    localStorage.removeItem('mg_default_station')
    window.location.reload()
  }

  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-base-200">
      {/* Header */}
      <div className="bg-primary text-primary-content px-4 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-primary-content/15 p-2.5 rounded-xl">
            <FontAwesomeIcon icon={faGear} />
          </div>
          <div>
            <h1 className="font-bold text-base lg:text-lg">Reglages</h1>
            <p className="text-primary-content/50 text-xs">Personnalisez l'application</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-3xl">

          {/* Theme toggle */}
          <div className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
            <div className="card-body p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    <FontAwesomeIcon icon={isDark ? faMoon : faSun} className={isDark ? 'text-info' : 'text-warning'} />
                  </div>
                  <div>
                    <div className="font-semibold text-base-content text-sm">Theme sombre</div>
                    <div className="text-base-content/50 text-xs">Fond noir, ideal en faible luminosite</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={isDark}
                  onChange={toggleTheme}
                />
              </div>
            </div>
          </div>

          {/* App info */}
          <div className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
            <div className="card-body p-4 lg:p-6 space-y-3">
              <h2 className="text-base-content font-semibold text-sm">A propos</h2>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Version</span>
                <span className="font-semibold text-base-content">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Donnees</span>
                <span className="font-semibold text-base-content">API SNCF Navitia</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">Licence</span>
                <span className="font-semibold text-base-content">MIT</span>
              </div>
            </div>
          </div>

        </div>

        {/* Reset */}
        <div className="mt-4 max-w-sm">
          <button
            onClick={clearFavorites}
            className="btn btn-error btn-outline w-full gap-2 hover:brightness-110"
          >
            <FontAwesomeIcon icon={faTrash} />
            Effacer favoris et donnees locales
          </button>
        </div>

        {/* Credits */}
        <div className="mt-8 max-w-3xl">
          <h2 className="text-base-content font-bold text-sm mb-3">Credits & licences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {CREDITS.map(c => (
              <a
                key={c.name}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card bg-base-100 border border-base-300 hover:shadow-md transition-shadow"
              >
                <div className="card-body p-3">
                  <div className="font-semibold text-sm text-base-content leading-tight">{c.name}</div>
                  <div className="text-2xs text-base-content/50">{c.role}</div>
                </div>
              </a>
            ))}
          </div>
          <p className="text-2xs text-base-content/30 mt-4">
            Ce projet est distribue sous licence MIT. Les donnees ferroviaires sont fournies par l'API SNCF (Navitia).
            Les marques citees appartiennent a leurs proprietaires respectifs.
          </p>
        </div>
      </div>
    </div>
  )
}
