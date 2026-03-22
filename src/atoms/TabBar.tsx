interface Tab {
  label: string
  id: string
}

interface Props {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
}

export default function TabBar({ tabs, activeId, onChange }: Props) {
  return (
    <div className="flex relative border-b border-base-300">
      {tabs.map(tab => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-3 text-sm font-semibold text-center transition-colors relative ${
              isActive ? 'text-base-content' : 'text-base-content/40'
            }`}
          >
            {tab.label}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-info rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}
