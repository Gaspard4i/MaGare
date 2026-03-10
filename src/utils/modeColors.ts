export type BoardMode = 'departures' | 'arrivals'

/** Header background — primary (cobalt blue) for departures, secondary (foret) for arrivals */
export const modeHeaderBg = (mode: BoardMode) =>
  mode === 'departures' ? 'bg-primary' : 'bg-secondary'

/** Board panel background — white for both modes (light redesign) */
export const modeBoardBg = (_mode: BoardMode) => 'bg-base-200'
