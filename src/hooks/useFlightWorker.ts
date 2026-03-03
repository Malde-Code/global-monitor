/* ============================================================
   Global Monitor – Flight Worker Hook
   Spawns WebWorker and manages data flow to Zustand store
   ============================================================ */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore, getPollingIntervalForZoom } from '@/store/store';
import type { FlightPosition, Anomaly } from '@/types';

export function useFlightWorker() {
    const workerRef = useRef<Worker | null>(null);
    const setFlights = useStore((s) => s.setFlights);
    const setAnomalies = useStore((s) => s.setAnomalies);
    const updateLayerCount = useStore((s) => s.updateLayerCount);
    const zoom = useStore((s) => s.viewState.zoom);
    const prevIntervalRef = useRef<number>(10000);

    // Spawn worker on mount
    useEffect(() => {
        const worker = new Worker(
            new URL('@/workers/flightWorker.ts', import.meta.url)
        );

        worker.onmessage = (e: MessageEvent) => {
            const { type, payload } = e.data;

            switch (type) {
                case 'flight_update': {
                    const flights = payload as FlightPosition[];
                    setFlights(flights);
                    updateLayerCount('flights', flights.length);
                    break;
                }
                case 'anomaly_detected': {
                    const anomalies = payload as Anomaly[];
                    setAnomalies(anomalies);
                    break;
                }
                case 'status':
                    console.log(`[FlightWorker] Status: ${payload}`);
                    break;
            }
        };

        worker.onerror = (err) => {
            console.error('[FlightWorker] Error:', err);
        };

        workerRef.current = worker;
        worker.postMessage({ type: 'start' });

        return () => {
            worker.postMessage({ type: 'stop' });
            worker.terminate();
        };
    }, [setFlights, setAnomalies, updateLayerCount]);

    // Adjust polling interval based on zoom level
    useEffect(() => {
        const interval = getPollingIntervalForZoom(zoom);
        if (interval !== prevIntervalRef.current && workerRef.current) {
            prevIntervalRef.current = interval;
            workerRef.current.postMessage({ type: 'set_interval', interval });
        }
    }, [zoom]);

    const stop = useCallback(() => {
        workerRef.current?.postMessage({ type: 'stop' });
    }, []);

    const start = useCallback(() => {
        workerRef.current?.postMessage({ type: 'start' });
    }, []);

    return { stop, start };
}
