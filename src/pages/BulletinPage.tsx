import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAlt } from '@fortawesome/free-solid-svg-icons'
import BulletinForm from '../organisms/BulletinForm'

export default function BulletinPage() {
  return (
    <div className="flex-1 overflow-y-auto pb-20 bg-base-200">
      {/* Page header */}
      <div className="bg-primary text-primary-content px-4 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-primary-content/15 p-2.5 rounded-xl">
            <FontAwesomeIcon icon={faFileAlt} />
          </div>
          <div>
            <h1 className="font-bold text-base lg:text-lg">Bulletin de retard</h1>
            <p className="text-primary-content/50 text-xs mt-0.5">Justificatif officiel SNCF</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto lg:px-8">
        <div className="lg:max-w-2xl">
          <BulletinForm />
        </div>
      </div>
    </div>
  )
}
