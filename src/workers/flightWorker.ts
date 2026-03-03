/* ============================================================
   Global Monitor – Flight Data WebWorker
   Parses API data off the main thread
   ============================================================ */

// This worker runs in its own thread, keeping the main UI at 60 FPS.
// In production, it fetches from OpenSky Network API.
// For demo, it generates and animates mock data.

interface FlightRaw {
    icao24: string;
    callsign: string;
    originCountry: string;
    longitude: number;
    latitude: number;
    altitude: number;
    velocity: number;
    heading: number;
    verticalRate: number;
    onGround: boolean;
    squawk: string | null;
    category: string;
    lastContact: number;
}

interface WorkerOutbound {
    type: 'flight_update' | 'anomaly_detected' | 'status';
    payload: unknown;
    timestamp: number;
}

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
    const hex = '0123456789abcdef';
    return Array.from({ length: 6 }, () => pick(hex.split(''))).join('');
}

// ── Generate initial fleet ───────────────────────────────────
function generateFleet(count: number): FlightRaw[] {
    const categories = ['commercial', 'commercial', 'commercial', 'cargo', 'cargo', 'military', 'private', 'helicopter'];
    const corridors = [
        { center: [10, 50], spread: 20 },
        { center: [-90, 35], spread: 25 },
        { center: [120, 35], spread: 20 },
        { center: [55, 25], spread: 15 },
        { center: [80, 20], spread: 15 },
        { center: [-50, -15], spread: 15 },
        { center: [25, -5], spread: 15 },
        { center: [150, -30], spread: 10 },
    ];

    const flights: FlightRaw[] = [];
    for (let i = 0; i < count; i++) {
        const corridor = pick(corridors);
        const cat = pick(categories);
        flights.push({
            icao24: randomICAO(),
            callsign: randomCallsign(),
            originCountry: pick(['Germany', 'UK', 'France', 'USA', 'China', 'Japan', 'UAE', 'Turkey', 'India', 'Brazil']),
            longitude: corridor.center[0] + rand(-corridor.spread, corridor.spread),
            latitude: corridor.center[1] + rand(-corridor.spread * 0.6, corridor.spread * 0.6),
            altitude: cat === 'helicopter' ? rand(300, 3000) : rand(8000, 12500),
            velocity: cat === 'helicopter' ? rand(50, 120) : rand(180, 280),
            heading: rand(0, 360),
            verticalRate: rand(-5, 5),
            onGround: false,
            squawk: Math.random() < 0.003 ? '7700' : null,
            category: cat,
            lastContact: Date.now() / 1000,
        });
    }
    return flights;
}

// ── Animate positions ────────────────────────────────────────
function animateFleet(flights: FlightRaw[]): FlightRaw[] {
    return flights.map((f) => ({
        ...f,
        longitude: f.longitude + Math.cos((f.heading * Math.PI) / 180) * 0.01 * (Math.random() * 0.5 + 0.75),
        latitude: f.latitude + Math.sin((f.heading * Math.PI) / 180) * 0.008 * (Math.random() * 0.5 + 0.75),
        heading: f.heading + rand(-2, 2),
        altitude: Math.max(0, f.altitude + rand(-50, 50)),
        lastContact: Date.now() / 1000,
    }));
}

// ── Worker State ─────────────────────────────────────────────
let fleet: FlightRaw[] = [];
let intervalId: ReturnType<typeof setInterval> | null = null;
let currentInterval = 10000;

function tick() {
    if (fleet.length === 0) {
        fleet = generateFleet(800);
    } else {
        fleet = animateFleet(fleet);
    }

    // Detect anomalies
    const anomalies = fleet
        .filter((f) => f.squawk === '7700')
        .map((f) => ({
            id: `sq-${f.icao24}`,
            type: 'squawk_7700',
            entityId: f.icao24,
            entityName: f.callsign,
            latitude: f.latitude,
            longitude: f.longitude,
            description: `Emergency transponder (Squawk 7700) – ${f.callsign}`,
            detectedAt: Date.now(),
        }));

    const msg: WorkerOutbound = {
        type: 'flight_update',
        payload: fleet,
        timestamp: Date.now(),
    };
    self.postMessage(msg);

    if (anomalies.length > 0) {
        const anomalyMsg: WorkerOutbound = {
            type: 'anomaly_detected',
            payload: anomalies,
            timestamp: Date.now(),
        };
        self.postMessage(anomalyMsg);
    }
}

// ── Message Handler ──────────────────────────────────────────
self.onmessage = (e: MessageEvent) => {
    const { type, interval } = e.data;

    switch (type) {
        case 'start':
            if (intervalId) clearInterval(intervalId);
            tick(); // immediate first tick
            intervalId = setInterval(tick, currentInterval);
            self.postMessage({ type: 'status', payload: 'running', timestamp: Date.now() });
            break;

        case 'stop':
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
            self.postMessage({ type: 'status', payload: 'stopped', timestamp: Date.now() });
            break;

        case 'set_interval':
            currentInterval = interval || 10000;
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = setInterval(tick, currentInterval);
            }
            break;
    }
};
