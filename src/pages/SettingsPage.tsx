import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../molecules/LanguageSwitcher'

export default function SettingsPage() {
  const { t } = useTranslation()

  const clearFavorites = () => {
    if (!window.confirm(t('settings.clearDataConfirm'))) return
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
            <FontAwesomeIcon icon={faCircleInfo} />
          </div>
          <div>
            <h1 className="font-bold text-base lg:text-lg">{t('settings.title')}</h1>
            <p className="text-primary-content/50 text-xs">{t('settings.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-6 max-w-3xl">

        {/* À propos */}
        <section aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-base-content/70 font-semibold text-xs uppercase tracking-wider mb-2 px-1">
            {t('settings.about')}
          </h2>
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-4 lg:p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">{t('settings.version')}</span>
                <span className="font-semibold text-base-content">1.0.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">{t('settings.data')}</span>
                <span className="font-semibold text-base-content">API SNCF Navitia</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-base-content/60">{t('settings.license')}</span>
                <span className="font-semibold text-base-content">MIT</span>
              </div>
              <div className="flex justify-between text-sm items-center pt-2 border-t border-base-300">
                <span className="text-base-content/60">{t('settings.author')}</span>
                <a
                  href="https://gaspard4i.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:underline"
                >
                  gaspard4i.github.io
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Préférences */}
        <section aria-labelledby="prefs-heading">
          <h2 id="prefs-heading" className="text-base-content/70 font-semibold text-xs uppercase tracking-wider mb-2 px-1">
            {t('settings.preferences')}
          </h2>
          <LanguageSwitcher variant="card" />
        </section>

        {/* Données locales */}
        <section aria-labelledby="data-heading">
          <h2 id="data-heading" className="text-base-content/70 font-semibold text-xs uppercase tracking-wider mb-2 px-1">
            {t('settings.localData')}
          </h2>
          <button
            onClick={clearFavorites}
            className="btn btn-error btn-outline gap-2 hover:brightness-110"
          >
            <FontAwesomeIcon icon={faTrash} />
            {t('settings.clearData')}
          </button>
        </section>

      </div>
    </div>
  )
}
