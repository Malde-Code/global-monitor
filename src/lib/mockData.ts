/* ============================================================
   Global Monitor – Mock Data Generator
   Generates realistic flight, ship, and news data for demo
   ============================================================ */

import type {
    FlightPosition,
    ShipPosition,
    NewsEvent,
    Anomaly,
    AircraftCategory,
    ShipType,
} from '@/types';

// ── Helpers ──────────────────────────────────────────────────
function rand(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomCallsign(): string {
    const airlines = ['DLH', 'BAW', 'AFR', 'UAE', 'UAL', 'AAL', 'RYR', 'THY', 'SIA', 'QFA', 'ANA', 'CPA', 'KLM', 'SWR'];
    return pick(airlines) + String(Math.floor(rand(100, 9999)));
}

function randomICAO(): string {
    const hex = '0123456789abcdef'.split('');
    return Array.from({ length: 6 }, () => pick(hex)).join('');
}

function randomMMSI(): string {
    return String(Math.floor(rand(200000000, 799999999)));
}

// ── Major shipping routes (approximate waypoints) ────────────
const shippingRoutes: Array<{ name: string; points: [number, number][] }> = [
    { name: 'Suez-Med', points: [[32.3, 30.0], [28.0, 35.0], [15.0, 36.0], [5.0, 36.5], [-5.5, 36.0]] },
    { name: 'Malacca', points: [[104.0, 1.3], [100.0, 4.0], [96.0, 6.0], [80.0, 7.0]] },
    { name: 'Pacific', points: [[140.0, 35.0], [180.0, 40.0], [-150.0, 35.0], [-122.0, 37.0]] },
    { name: 'North Atlantic', points: [[-5.0, 50.0], [-30.0, 48.0], [-50.0, 42.0], [-74.0, 40.7]] },
    { name: 'South China Sea', points: [[114.0, 22.3], [112.0, 15.0], [110.0, 8.0], [106.0, 1.0]] },
];

// ── Generate Flights ─────────────────────────────────────────
export function generateMockFlights(count: number = 800): FlightPosition[] {
    const categories: AircraftCategory[] = ['commercial', 'commercial', 'commercial', 'cargo', 'cargo', 'military', 'private', 'helicopter'];

    // Cluster around major air corridors
    const corridors: Array<{ center: [number, number]; spread: number }> = [
        { center: [10, 50], spread: 20 },    // Europe
        { center: [-90, 35], spread: 25 },   // North America
        { center: [120, 35], spread: 20 },   // East Asia
        { center: [55, 25], spread: 15 },    // Middle East
        { center: [80, 20], spread: 15 },    // South Asia
        { center: [-50, -15], spread: 15 },  // South America
        { center: [25, -5], spread: 15 },    // Africa
        { center: [150, -30], spread: 10 },  // Australia
    ];

    const flights: FlightPosition[] = [];
    for (let i = 0; i < count; i++) {
        const corridor = pick(corridors);
        const category = pick(categories);
        const isEmergency = Math.random() < 0.003; // ~0.3% squawk 7700

        flights.push({
            icao24: randomICAO(),
            callsign: randomCallsign(),
            originCountry: pick(['Germany', 'UK', 'France', 'USA', 'China', 'Japan', 'UAE', 'Turkey', 'India', 'Brazil', 'Australia']),
            longitude: corridor.center[0] + rand(-corridor.spread, corridor.spread),
            latitude: corridor.center[1] + rand(-corridor.spread * 0.6, corridor.spread * 0.6),
            altitude: category === 'helicopter' ? rand(300, 3000) : rand(8000, 12500),
            velocity: category === 'helicopter' ? rand(50, 120) : rand(180, 280),
            heading: rand(0, 360),
            verticalRate: rand(-5, 5),
            onGround: false,
            squawk: isEmergency ? '7700' : null,
            category,
            lastContact: Date.now() / 1000,
        });
    }
    return flights;
}

// ── Generate Ships ───────────────────────────────────────────
export function generateMockShips(count: number = 400): ShipPosition[] {
    const types: ShipType[] = ['tanker', 'tanker', 'cargo', 'cargo', 'cargo', 'military', 'passenger', 'fishing'];

    const ships: ShipPosition[] = [];
    for (let i = 0; i < count; i++) {
        const route = pick(shippingRoutes);
        const waypoint = pick(route.points);
        const type = pick(types);
        const isDark = Math.random() < 0.02; // 2% AIS off

        ships.push({
            mmsi: randomMMSI(),
            name: `${pick(['MV', 'MT', 'SS', 'HMS', 'FPSO'])} ${pick(['AURORA', 'TITAN', 'GENESIS', 'PACIFIC STAR', 'NORD STREAM', 'DRAGON', 'LIBERTY', 'PIONEER', 'ATHENA', 'POSEIDON'])}`,
            longitude: waypoint[0] + rand(-5, 5),
            latitude: waypoint[1] + rand(-3, 3),
            speed: type === 'military' ? rand(15, 30) : rand(5, 18),
            heading: rand(0, 360),
            course: rand(0, 360),
            shipType: type,
            destination: pick(['Rotterdam', 'Singapore', 'Shanghai', 'Houston', 'Dubai', 'Hamburg', 'Yokohama', 'Piraeus']),
            aisActive: !isDark,
            lastUpdate: Date.now() / 1000,
        });
    }
    return ships;
}

// ── Generate News Events ─────────────────────────────────────
export function generateMockNews(): NewsEvent[] {
    const events: NewsEvent[] = [
        {
            id: 'n1', title: 'Military buildup observed near Strait of Hormuz',
            source: 'GDELT', category: 'military',
            latitude: 26.5, longitude: 56.3,
            timestamp: Date.now() - 3600000, url: '#', severity: 'high',
        },
        {
            id: 'n2', title: 'Suez Canal congestion reaches 48h average wait time',
            source: 'Reuters', category: 'economic',
            latitude: 30.0, longitude: 32.3,
            timestamp: Date.now() - 7200000, url: '#', severity: 'medium',
        },
        {
            id: 'n3', title: 'Undersea cable disruption reported in Red Sea',
            source: 'GDELT', category: 'infrastructure',
            latitude: 15.5, longitude: 41.8,
            timestamp: Date.now() - 1800000, url: '#', severity: 'critical',
        },
        {
            id: 'n4', title: 'Earthquake M6.2 strikes Indonesia — tsunami warning issued',
            source: 'USGS', category: 'crisis',
            latitude: -2.5, longitude: 118.0,
            timestamp: Date.now() - 900000, url: '#', severity: 'critical',
        },
        {
            id: 'n5', title: 'Panama Canal water levels critically low — vessels delayed',
            source: 'Bloomberg', category: 'economic',
            latitude: 9.1, longitude: -79.7,
            timestamp: Date.now() - 5400000, url: '#', severity: 'high',
        },
        {
            id: 'n6', title: 'NATO exercises underway in Baltic Sea region',
            source: 'GDELT', category: 'military',
            latitude: 56.0, longitude: 18.0,
            timestamp: Date.now() - 10800000, url: '#', severity: 'medium',
        },
        {
            id: 'n7', title: 'Major pipeline leak detected in North Sea',
            source: 'Reuters', category: 'infrastructure',
            latitude: 57.5, longitude: 1.5,
            timestamp: Date.now() - 4200000, url: '#', severity: 'high',
        },
        {
            id: 'n8', title: 'Volcanic eruption in Iceland disrupts North Atlantic routes',
            source: 'BBC', category: 'crisis',
            latitude: 63.4, longitude: -19.0,
            timestamp: Date.now() - 2400000, url: '#', severity: 'high',
        },
        {
            id: 'n9', title: 'Container ship grounding near Malacca Strait narrows passage',
            source: 'Maritime News', category: 'economic',
            latitude: 2.5, longitude: 101.5,
            timestamp: Date.now() - 6000000, url: '#', severity: 'medium',
        },
        {
            id: 'n10', title: 'Conflict escalation in eastern Mediterranean',
            source: 'GDELT', category: 'crisis',
            latitude: 34.0, longitude: 35.5,
            timestamp: Date.now() - 1200000, url: '#', severity: 'critical',
        },
    ];
    return events;
}

// ── Detect Anomalies ─────────────────────────────────────────
export function detectAnomalies(
    flights: FlightPosition[],
    ships: ShipPosition[]
): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Squawk 7700 (emergency)
    flights
        .filter((f) => f.squawk === '7700')
        .forEach((f) => {
            anomalies.push({
                id: `a-sq-${f.icao24}`,
                type: 'squawk_7700',
                entityId: f.icao24,
                entityName: f.callsign,
                latitude: f.latitude,
                longitude: f.longitude,
                description: `Emergency transponder (Squawk 7700) – ${f.callsign} over ${f.originCountry}`,
                detectedAt: Date.now(),
            });
        });

    // Dark targets (AIS off)
    ships
        .filter((s) => !s.aisActive)
        .forEach((s) => {
            anomalies.push({
                id: `a-dt-${s.mmsi}`,
                type: 'dark_target',
                entityId: s.mmsi,
                entityName: s.name,
                latitude: s.latitude,
                longitude: s.longitude,
                description: `AIS transponder offline – ${s.name} near ${s.destination}`,
                detectedAt: Date.now(),
            });
        });

    return anomalies;
}

// ── Animate positions (simulate movement) ────────────────────
export function animateFlights(flights: FlightPosition[]): FlightPosition[] {
    return flights.map((f) => ({
        ...f,
        longitude: f.longitude + Math.cos((f.heading * Math.PI) / 180) * 0.01 * (Math.random() * 0.5 + 0.75),
        latitude: f.latitude + Math.sin((f.heading * Math.PI) / 180) * 0.008 * (Math.random() * 0.5 + 0.75),
        heading: f.heading + rand(-2, 2),
        altitude: f.altitude + rand(-50, 50),
        lastContact: Date.now() / 1000,
    }));
}

export function animateShips(ships: ShipPosition[]): ShipPosition[] {
    return ships.map((s) => ({
        ...s,
        longitude: s.longitude + Math.cos((s.course * Math.PI) / 180) * 0.002 * (Math.random() * 0.5 + 0.75),
        latitude: s.latitude + Math.sin((s.course * Math.PI) / 180) * 0.0015 * (Math.random() * 0.5 + 0.75),
        course: s.course + rand(-1, 1),
        lastUpdate: Date.now() / 1000,
    }));
}
