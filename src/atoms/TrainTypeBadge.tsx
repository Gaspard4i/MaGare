import { getTrainBadgeClass, type TrainTypeKey } from '../services/apiService'

interface Props {
  type: TrainTypeKey
  number?: string
}

export default function TrainTypeBadge({ type, number }: Props) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className={`badge badge-sm ${getTrainBadgeClass(type)} font-bold tracking-wide`}>
        {type}
      </span>
      {number && (
        <span className="text-primary-content/40 text-xs truncate max-w-14">{number}</span>
      )}
    </div>
  )
}
