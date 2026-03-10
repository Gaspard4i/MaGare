import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesRight, faAnglesLeft, faTrain } from '@fortawesome/free-solid-svg-icons'
import TrainBoard from '../organisms/TrainBoard'
import DefaultStationBanner from '../organisms/DefaultStationBanner'
import ModeToggle from '../molecules/ModeToggle'
import type { Place } from '../types'
import type { BoardMode } from '../utils/modeColors'
import { modeBoardBg } from '../utils/modeColors'

interface Props {
  station:  Place | null
  boardMode: BoardMode
  onSelect: (p: Place) => void
  onBoardModeChange: (m: BoardMode) => void
}

export default function BoardPage({ station, boardMode, onSelect, onBoardModeChange }: Props) {
  const mobileBoardBg = boardMode === 'departures' ? 'bg-primary' : 'bg-secondary'

  if (!station) {
    return (
      <div className={`flex-1 min-h-screen ${modeBoardBg(boardMode)}`}>
        <DefaultStationBanner onSelect={onSelect} />
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-screen bg-base-200">

      {/* -- Mobile / Tablet: single board with mode toggle --------------- */}
      <div className="xl:hidden flex flex-col h-full">
        <div className="px-4 pt-4 pb-2 max-w-3xl mx-auto w-full">
          <ModeToggle mode={boardMode} onChange={onBoardModeChange} />
        </div>
        <div className="flex-1 overflow-auto pb-20">
          <div className={`${mobileBoardBg} rounded-xl shadow-sm mx-auto mb-4 overflow-hidden max-w-3xl transition-colors duration-300`}>
            <TrainBoard station={station} mode={boardMode} />
          </div>
        </div>
      </div>

      {/* -- Desktop xl+: two boards side by side ------------------------ */}
      <div className="hidden xl:flex min-h-screen max-w-7xl mx-auto gap-6 p-6">

        {/* Departures */}
        <div className="flex-1 flex flex-col bg-primary rounded-xl shadow-sm overflow-hidden max-w-[800px]">
          <div className="flex items-center gap-2 px-6 py-3 bg-black/15 text-primary-content">
            <span className="font-bold text-sm tracking-wide uppercase">Departs</span>
            <FontAwesomeIcon icon={faTrain} size="sm" />
            <FontAwesomeIcon icon={faAnglesRight} size="sm" />
          </div>
          <div className="flex-1 overflow-auto">
            <TrainBoard station={station} mode="departures" />
          </div>
        </div>

        {/* Arrivals */}
        <div className="flex-1 flex flex-col bg-secondary rounded-xl shadow-sm overflow-hidden max-w-[800px]">
          <div className="flex items-center gap-2 px-6 py-3 bg-black/15 text-secondary-content">
            <FontAwesomeIcon icon={faAnglesLeft} size="sm" />
            <FontAwesomeIcon icon={faTrain} className="scale-x-[-1]" size="sm" />
            <span className="font-bold text-sm tracking-wide uppercase">Arrivees</span>
          </div>
          <div className="flex-1 overflow-auto">
            <TrainBoard station={station} mode="arrivals" />
          </div>
        </div>

      </div>
    </div>
  )
}
