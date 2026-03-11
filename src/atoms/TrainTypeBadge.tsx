import { getTrainBadgeClass, type TrainTypeKey } from '../services/apiService'

interface Props {
  type: TrainTypeKey
  /** Line code from API label field: C41, K52, B, D, etc. */
  lineCode?: string
  /** Commercial mode name: TER HDF, RER, OUIGO, TGV INOUI, etc. */
  modeName?: string
  /** Train number: 843281, ECCO15, 7829 */
  number?: string
}

export default function TrainTypeBadge({ type, lineCode, modeName, number }: Props) {
  // For short line codes (C41, K52, B, D, K, H, R...) show a badge
  const hasLineCode = lineCode && lineCode.length <= 5

  return (
    <div className="flex flex-col items-start gap-0.5">
      {/* Mode name: TER HDF, RER, etc. — small text */}
      {modeName && (
        <span className="opacity-50 text-2xs font-semibold uppercase leading-none truncate max-w-20">{modeName}</span>
      )}
      {/* Line code badge: C41, RER B, etc. */}
      {hasLineCode && (
        <span className={`badge badge-sm ${getTrainBadgeClass(type)} font-bold tracking-wide`}>
          {lineCode}
        </span>
      )}
      {/* Train number */}
      {number && (
        <span className="opacity-30 text-2xs truncate max-w-16 leading-none">{number}</span>
      )}
    </div>
  )
}
