// ── Navitia API ──────────────────────────────────────────────────────────────

export interface Coord {
    lat: string;
    lon: string
}

export interface StopArea {
    id: string
    name: string
    coord?: Coord
}

export interface AdministrativeRegion {
    id: string
    name: string
    level: number
}

export interface Place {
    id: string
    name: string
    embedded_type: string
    stop_area?: StopArea
    administrative_regions?: AdministrativeRegion[]
    quality?: number
}

export interface StopPoint {
    id: string
    name: string
    platform_code?: string
    coord?: Coord
}

export interface StopDateTime {
    departure_date_time: string
    base_departure_date_time?: string
    arrival_date_time: string
    base_arrival_date_time?: string
    data_freshness?: string
}

export interface DisplayInformations {
    direction: string
    name?: string
    commercial_mode: string
    physical_mode: string
    headsign: string
    trip_short_name?: string
    network?: string
    color?: string
    text_color?: string
    effect?: string
    label?: string
    description?: string
    message?: string
}

export interface Link {
    type: string
    id: string
    rel?: string
    href?: string
}

export interface Train {
    stop_date_time: StopDateTime
    display_informations: DisplayInformations
    route?: {
        direction?: { stop_area?: StopArea }
    }
    stop_point: StopPoint
    links: Link[]
}

export interface VehicleJourneyStopTime {
    arrival_time: string
    departure_time: string
    stop_point: StopPoint
    drop_off_allowed?: boolean
    pickup_allowed?: boolean
    skipped_stop?: boolean
}

export interface VehicleJourney {
    id: string
    name: string
    headsign?: string
    stop_times: VehicleJourneyStopTime[]
}

// ── App state ─────────────────────────────────────────────────────────────────

export type TabId = 'timetables' | 'station' | 'bulletin' | 'favorites' | 'settings'
export type BoardMode = 'departures' | 'arrivals'

export type TransportMode =
    | 'Train'
    | 'TGV'
    | 'TER'
    | 'OUIGO'
    | 'IC'
    | 'Transilien'
    | 'RER'
    | 'Bus'
    | 'Tram'
    | 'Metro'
    | 'Bateau'
    | 'Other'
