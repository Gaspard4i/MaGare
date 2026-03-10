import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTrain, faAnglesRight, faAnglesLeft} from '@fortawesome/free-solid-svg-icons'
import type {BoardMode} from '../utils/modeColors'

interface Props {
    mode: BoardMode;
    onChange: (m: BoardMode) => void
}

export default function ModeToggle({mode, onChange}: Props) {
    return (
        <div className="flex rounded-2xl overflow-hidden border border-base-300 bg-base-100 shadow-sm">
            <button
                onClick={() => onChange('departures')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 font-bold text-sm transition-all duration-200 ${
                    mode === 'departures'
                        ? 'bg-primary text-primary-content shadow-inner'
                        : 'bg-primary text-primary-content hover:text-primary-content hover:bg-primary/80'
                }`}
            >
                <FontAwesomeIcon icon={faTrain} size="sm"/>
                <span>Departs</span>
                <FontAwesomeIcon icon={faAnglesRight} size="sm"/>
            </button>
            <div className="w-px bg-base-300 my-2"/>
            <button
                onClick={() => onChange('arrivals')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-3 font-bold text-sm transition-all duration-200 ${
                    mode === 'arrivals'
                        ? 'bg-secondary text-secondary-content shadow-inner'
                        : 'bg-secondary text-secondary-content hover:text-secondary-content hover:bg-secondary/80'
                }`}
            >
                <FontAwesomeIcon icon={faAnglesLeft} size="sm"/>
                <span>Arrivees</span>
                <FontAwesomeIcon icon={faTrain} className="scale-x-[-1]" size="sm"/>
            </button>
        </div>
    )
}
