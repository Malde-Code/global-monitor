/* ============================================================
   Global Monitor – Core Type Definitions
   ============================================================ */

// ── Flight Position (OpenSky schema) ─────────────────────────
export interface FlightPosition {
    icao24: string;
    callsign: string;
    originCountry: string;
    longitude: number;
    latitude: number;
    altitude: number; // meters
    velocity: number; // m/s
    heading: number;  // degrees clockwise from north
    verticalRate: number;
    onGround: boolean;
    squawk: string | null;
    category: AircraftCategory;
    lastContact: number; // unix timestamp
}

export type AircraftCategory =
    | 'commercial'
    | 'military'
    | 'cargo'
    | 'private'
    | 'helicopter'
    | 'unknown';

// ── Ship Position (AIS schema) ────────────────────────────────
export interface ShipPosition {
    mmsi: string;
    name: string;
    longitude: number;
    latitude: number;
    speed: number;  // knots
    heading: number;
    course: number;
    shipType: ShipType;
    destination: string;
    aisActive: boolean;
    lastUpdate: number;
}

export type ShipType =
    | 'tanker'
    | 'cargo'
    | 'military'
    | 'passenger'
    | 'fishing'
    | 'unknown';

// ── News Event ────────────────────────────────────────────────
export interface NewsEvent {
    id: string;
    title: string;
    source: string;
    category: NewsCategory;
    latitude: number;
    longitude: number;
    timestamp: number;
    url: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export type NewsCategory =
    | 'crisis'
    | 'military'
    | 'economic'
    | 'infrastructure'
    | 'environmental';

// ── Anomalies ─────────────────────────────────────────────────
export interface Anomaly {
    id: string;
    type: AnomalyType;
    entityId: string;    // icao24 or mmsi
    entityName: string;
    latitude: number;
    longitude: number;
    description: string;
    detectedAt: number;
}

export type AnomalyType =
    | 'squawk_7700'     // Emergency transponder
    | 'squawk_7600'     // Radio failure
    | 'squawk_7500'     // Hijack
    | 'dark_target'     // AIS/transponder off
    | 'course_deviation';

// ── Layer Configuration ───────────────────────────────────────
export interface LayerConfig {
    id: string;
    name: string;
    icon: string;
    visible: boolean;
    opacity: number;
    color: string;
    count?: number;
}

// ── View State ────────────────────────────────────────────────
export interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
    transitionDuration?: number;
}

// ── Worker Messages ───────────────────────────────────────────
export interface WorkerMessage {
    type: 'flight_update' | 'ship_update' | 'anomaly_detected';
    payload: FlightPosition[] | ShipPosition[] | Anomaly[];
    timestamp: number;
}

export interface WorkerCommand {
    type: 'start' | 'stop' | 'set_interval';
    interval?: number;
}
