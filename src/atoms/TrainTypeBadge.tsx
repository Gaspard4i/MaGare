import { getFallbackColors, type TrainTypeKey } from '../services/apiService'

interface Props {
  type: TrainTypeKey
  /** Line code from API label field: C41, K52, B, D, etc. */
  lineCode?: string
  /** Commercial mode name: TER HDF, RER, OUIGO, TGV INOUI, etc. */
  modeName?: string
  /** Train number: 843281, ECCO15, 7829 */
  number?: string
  /** API-provided color (hex without #) */
  apiColor?: string
  /** API-provided text_color (hex without #) */
  apiTextColor?: string
}

export default function TrainTypeBadge({ type, lineCode, modeName, number, apiColor, apiTextColor }: Props) {
  const hasLineCode = lineCode && lineCode.length <= 5

  // Use API colors when available, fallback to hardcoded per-type colors
  const hasBadge = hasLineCode || modeName
  let badgeStyle: React.CSSProperties | undefined
  if (hasBadge) {
    if (apiColor) {
      badgeStyle = {
        backgroundColor: `#${apiColor}`,
        color: apiTextColor ? `#${apiTextColor}` : '#FFFFFF',
      }
    } else {
      const fb = getFallbackColors(type)
      badgeStyle = { backgroundColor: fb.bg, color: fb.text }
    }
  }

  return (
    <div className="flex flex-col items-start gap-0.5">
      {/* Mode name: TER HDF, RER, etc. — small text */}
      {modeName && (
        <span className="opacity-50 text-2xs font-semibold uppercase leading-none truncate max-w-20">{modeName}</span>
      )}
      {/* Line code badge with API or fallback colors */}
      {hasLineCode && badgeStyle && (
        <span
          className="badge badge-sm font-bold tracking-wide"
          style={badgeStyle}
        >
          {lineCode}
        </span>
      )}
      {/* For modes without line code but with a type, show type as badge */}
      {!hasLineCode && modeName && badgeStyle && (
        <span
          className="badge badge-sm font-bold tracking-wide text-2xs"
          style={badgeStyle}
        >
          {type}
        </span>
      )}
      {/* Train number */}
      {number && (
        <span className="opacity-30 text-2xs truncate max-w-16 leading-none">{number}</span>
      )}
    </div>
  )
}
