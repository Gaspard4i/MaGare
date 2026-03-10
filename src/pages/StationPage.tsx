import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faWifi, faUtensils, faSuitcase, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import type { Place } from '../types'

interface Props { station: Place | null }

const SERVICES = [
  { icon: faWifi,       label: 'Wi-Fi gratuit',   available: true },
  { icon: faUtensils,   label: 'Restauration',     available: true },
  { icon: faSuitcase,   label: 'Consignes',        available: false },
  { icon: faInfoCircle, label: 'Info voyageurs',   available: true },
]

export default function StationPage({ station }: Props) {
  const name = station?.stop_area?.name ?? station?.name ?? ''

  return (
    <div className="flex-1 overflow-auto pb-20 bg-base-200 min-h-screen">
      <div className="bg-primary text-primary-content px-4 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-primary-content/15 p-2.5 rounded-xl">
            <FontAwesomeIcon icon={faBuilding} />
          </div>
          <div>
            <h1 className="font-bold text-base lg:text-lg">{name || 'En Gare'}</h1>
            <p className="text-primary-content/50 text-xs">Services & informations</p>
          </div>
        </div>
      </div>

      {!station ? (
        <div className="text-center py-20">
          <FontAwesomeIcon icon={faBuilding} size="3x" className="text-base-300 mb-4" />
          <p className="text-base-content/50 text-lg">Selectionnez une gare</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card bg-base-100 shadow-sm border border-base-300 hover:shadow-md transition-shadow">
              <div className="card-body p-4 lg:p-6">
                <h2 className="font-semibold text-base-content text-sm mb-3">Services disponibles</h2>
                <div className="grid grid-cols-2 gap-3">
                  {SERVICES.map(s => (
                    <div key={s.label} className={`flex items-center gap-2 p-3 rounded-xl ${s.available ? 'bg-success/10 border border-success/20' : 'bg-base-200'}`}>
                      <FontAwesomeIcon icon={s.icon} className={s.available ? 'text-success' : 'text-base-content/30'} size="sm" />
                      <span className={`text-xs font-medium ${s.available ? 'text-base-content' : 'text-base-content/40'}`}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
