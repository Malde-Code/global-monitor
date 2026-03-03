/* ============================================================
   Global Monitor – Zustand Store
   Sliced state for partial re-renders
   ============================================================ */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
    FlightPosition,
    ShipPosition,
    NewsEvent,
    Anomaly,
    LayerConfig,
    ViewState,
    AircraftCategory,
    ShipType,
} from '@/types';

// ── Store Interface ──────────────────────────────────────────
interface GlobalMonitorStore {
    // View State
    viewState: ViewState;
    setViewState: (vs: Partial<ViewState>) => void;

    // Flights
    flights: FlightPosition[];
    setFlights: (flights: FlightPosition[]) => void;

    // Ships
    ships: ShipPosition[];
    setShips: (ships: ShipPosition[]) => void;

    // News
    newsEvents: NewsEvent[];
    setNewsEvents: (events: NewsEvent[]) => void;
    newsLastFetch: number;

    // Anomalies
    anomalies: Anomaly[];
    setAnomalies: (anomalies: Anomaly[]) => void;

    // Layers
    layers: Record<string, LayerConfig>;
    toggleLayerVisibility: (id: string) => void;
    setLayerOpacity: (id: string, opacity: number) => void;
    updateLayerCount: (id: string, count: number) => void;

    // Filters
    activeAircraftFilters: Set<AircraftCategory>;
    activeShipFilters: Set<ShipType>;
    toggleAircraftFilter: (cat: AircraftCategory) => void;
    toggleShipFilter: (type: ShipType) => void;

    // Sidebar
    sidebarOpen: boolean;
    toggleSidebar: () => void;

    // Polling
    pollingInterval: number;
    setPollingInterval: (ms: number) => void;
}

// ── Default Layers ───────────────────────────────────────────
const defaultLayers: Record<string, LayerConfig> = {
    flights: {
        id: 'flights',
        name: 'Aircraft',
        icon: '✈',
        visible: true,
        opacity: 1,
        color: '#06b6d4',
        count: 0,
    },
    ships: {
        id: 'ships',
        name: 'Vessels',
        icon: '🚢',
        visible: true,
        opacity: 1,
        color: '#3b82f6',
        count: 0,
    },
    news: {
        id: 'news',
        name: 'News Events',
        icon: '📰',
        visible: true,
        opacity: 0.9,
        color: '#f59e0b',
        count: 0,
    },
    conflicts: {
        id: 'conflicts',
        name: 'Conflict Zones',
        icon: '⚠',
        visible: true,
        opacity: 0.3,
        color: '#ef4444',
        count: 0,
    },
    cables: {
        id: 'cables',
        name: 'Undersea Cables',
        icon: '🔌',
        visible: false,
        opacity: 0.6,
        color: '#8b5cf6',
        count: 0,
    },
    pipelines: {
        id: 'pipelines',
        name: 'Pipelines',
        icon: '🛢',
        visible: false,
        opacity: 0.6,
        color: '#10b981',
        count: 0,
    },
    chokepoints: {
        id: 'chokepoints',
        name: 'Chokepoints',
        icon: '🔒',
        visible: true,
        opacity: 0.8,
        color: '#f97316',
        count: 0,
    },
};

// ── Store Creation ───────────────────────────────────────────
export const useStore = create<GlobalMonitorStore>()(
    subscribeWithSelector((set) => ({
        // View State
        viewState: {
            longitude: 20,
            latitude: 30,
            zoom: 2.5,
            pitch: 0,
            bearing: 0,
        },
        setViewState: (vs) =>
            set((state) => ({ viewState: { ...state.viewState, ...vs } })),

        // Flights
        flights: [],
        setFlights: (flights) => set({ flights }),

        // Ships
        ships: [],
        setShips: (ships) => set({ ships }),

        // News
        newsEvents: [],
        setNewsEvents: (events) => set({ newsEvents: events, newsLastFetch: Date.now() }),
        newsLastFetch: 0,

        // Anomalies
        anomalies: [],
        setAnomalies: (anomalies) => set({ anomalies }),

        // Layers
        layers: defaultLayers,
        toggleLayerVisibility: (id) =>
            set((state) => ({
                layers: {
                    ...state.layers,
                    [id]: { ...state.layers[id], visible: !state.layers[id].visible },
                },
            })),
        setLayerOpacity: (id, opacity) =>
            set((state) => ({
                layers: {
                    ...state.layers,
                    [id]: { ...state.layers[id], opacity },
                },
            })),
        updateLayerCount: (id, count) =>
            set((state) => ({
                layers: {
                    ...state.layers,
                    [id]: { ...state.layers[id], count },
                },
            })),

        // Filters
        activeAircraftFilters: new Set<AircraftCategory>([
            'commercial', 'military', 'cargo', 'private', 'helicopter',
        ]),
        activeShipFilters: new Set<ShipType>([
            'tanker', 'cargo', 'military', 'passenger', 'fishing',
        ]),
        toggleAircraftFilter: (cat) =>
            set((state) => {
                const next = new Set(state.activeAircraftFilters);
                if (next.has(cat)) next.delete(cat);
                else next.add(cat);
                return { activeAircraftFilters: next };
            }),
        toggleShipFilter: (type) =>
            set((state) => {
                const next = new Set(state.activeShipFilters);
                if (next.has(type)) next.delete(type);
                else next.add(type);
                return { activeShipFilters: next };
            }),

        // Sidebar
        sidebarOpen: true,
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        // Polling
        pollingInterval: 10000,
        setPollingInterval: (ms) => set({ pollingInterval: ms }),
    }))
);

// ── Zoom-aware polling interval ──────────────────────────────
export function getPollingIntervalForZoom(zoom: number): number {
    if (zoom >= 8) return 3000;   // High zoom: 3s
    if (zoom >= 5) return 7000;   // Medium zoom: 7s
    return 15000;                 // World view: 15s
}
