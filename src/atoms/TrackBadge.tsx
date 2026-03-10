interface Props { track: string }

export default function TrackBadge({ track }: Props) {
  return (
    <div className="flex flex-col items-center rounded-lg px-2 py-1 shadow-sm min-w-9" style={{ backgroundColor: 'var(--voie-bg)' }}>
      <span className="text-[9px] font-bold text-base-content/40 uppercase tracking-widest leading-none">Voie</span>
      <span className="text-base font-black text-base-content leading-tight">{track}</span>
    </div>
  )
}
