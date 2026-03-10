interface Props { time: string; scheduledTime?: string; delay: number }

export default function TimeDisplay({ time, scheduledTime, delay }: Props) {
  return (
    <div className="text-center min-w-13 shrink-0">
      <div className="text-2xl font-black font-mono tabular-nums leading-none text-train-time">
        {time}
      </div>
      {delay > 0 && scheduledTime && (
        <div className="text-accent text-xs line-through font-mono tabular-nums mt-0.5">{scheduledTime}</div>
      )}
    </div>
  )
}
