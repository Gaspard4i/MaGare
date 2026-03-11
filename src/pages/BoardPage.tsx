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
      <div className={`flex-1 ${modeBoardBg(boardMode)}`}>
        <DefaultStationBanner onSelect={onSelect} />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-base-200 overflow-hidden">

      {/* -- Mobile / Tablet: single board with mode toggle --------------- */}
      <div className="xl:hidden flex flex-col flex-1 min-h-0">
        <div className="px-4 pt-4 pb-2 max-w-3xl mx-auto w-full shrink-0">
          <ModeToggle mode={boardMode} onChange={onBoardModeChange} />
        </div>
        <div className="flex-1 min-h-0">
          <div className={`${mobileBoardBg} mx-auto overflow-hidden max-w-3xl h-full flex flex-col transition-colors duration-300`}>
            <TrainBoard station={station} mode={boardMode} />
          </div>
        </div>
      </div>

      {/* -- Desktop xl+: two boards edge-to-edge ------------------------ */}
      <div className="hidden xl:flex flex-1 min-h-0 w-full pt-4">

        {/* Departures */}
        <div className="flex-1 flex flex-col bg-primary overflow-hidden rounded-tl-2xl board-departures">
          <div className="flex items-center gap-2 px-6 py-3 board-title-bar text-primary-content shrink-0">
            <span className="font-bold text-sm tracking-wide uppercase">Departs</span>
            <FontAwesomeIcon icon={faTrain} size="sm" />
            <FontAwesomeIcon icon={faAnglesRight} size="sm" />
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <TrainBoard station={station} mode="departures" />
          </div>
        </div>

        {/* Arrivals */}
        <div className="flex-1 flex flex-col bg-secondary overflow-hidden rounded-tr-2xl board-arrivals">
          <div className="flex items-center gap-2 px-6 py-3 board-title-bar text-secondary-content shrink-0">
            <FontAwesomeIcon icon={faAnglesLeft} size="sm" />
            <FontAwesomeIcon icon={faTrain} className="scale-x-[-1]" size="sm" />
            <span className="font-bold text-sm tracking-wide uppercase">Arrivees</span>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <TrainBoard station={station} mode="arrivals" />
          </div>
        </div>

      </div>
    </div>
  )
}
