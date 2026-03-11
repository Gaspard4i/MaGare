import { getTrainBadgeClass, type TrainTypeKey } from '../services/apiService'

interface Props {
  type: TrainTypeKey
  number?: string
  label?: string
}

export default function TrainTypeBadge({ type, number, label }: Props) {
  const displayName = label || type

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className={`badge badge-sm ${getTrainBadgeClass(type)} font-bold tracking-wide`}>
        {displayName}
      </span>
      {number && (
        <span className="opacity-40 text-xs truncate max-w-16">{number}</span>
      )}
    </div>
  )
}
