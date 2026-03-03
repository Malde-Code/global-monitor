/* ============================================================
   Global Monitor – Main Page
   Composes all components into the app shell
   ============================================================ */

'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/store';
import { useFlightWorker } from '@/hooks/useFlightWorker';
import {
    generateMockShips,
    generateMockNews,
    detectAnomalies,
    animateShips,
} from '@/lib/mockData';
import Sidebar from '@/components/panels/Sidebar';
import TickerPanel from '@/components/panels/TickerPanel';
import AnomalyPanel from '@/components/panels/AnomalyPanel';

// Dynamic import for MapEngine (requires browser APIs)
const MapEngine = dynamic(() => import('@/components/MapEngine'), {
    ssr: false,
    loading: () => (
        <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: 40, height: 40,
                    border: '3px solid var(--border-default)',
                    borderTopColor: 'var(--accent-cyan)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px',
                }} />
                Initializing Global Monitor...
            </div>
        </div>
    ),
});

export default function HomePage() {
    const flights = useStore((s) => s.flights);
    const ships = useStore((s) => s.ships);
    const setShips = useStore((s) => s.setShips);
    const setNewsEvents = useStore((s) => s.setNewsEvents);
    const setAnomalies = useStore((s) => s.setAnomalies);
    const updateLayerCount = useStore((s) => s.updateLayerCount);

    const [mounted, setMounted] = useState(false);

    // Start flight worker (WebWorker)
    useFlightWorker();

    // Initialize on mount
    useEffect(() => {
        setMounted(true);

        // Generate initial mock ships
        const initialShips = generateMockShips(400);
        setShips(initialShips);
        updateLayerCount('ships', initialShips.length);

        // Generate mock news events
        const news = generateMockNews();
        setNewsEvents(news);
        updateLayerCount('news', news.length);
    }, [setShips, setNewsEvents, updateLayerCount]);

    // Animate ship positions periodically
    useEffect(() => {
        if (!mounted) return;
        const interval = setInterval(() => {
            const currentShips = useStore.getState().ships;
            if (currentShips.length > 0) {
                const animated = animateShips(currentShips);
                setShips(animated);
            }
        }, 12000);
        return () => clearInterval(interval);
    }, [mounted, setShips]);

    // Detect anomalies when flight/ship data changes
    useEffect(() => {
        if (flights.length > 0 || ships.length > 0) {
            const anomalies = detectAnomalies(flights, ships);
            setAnomalies(anomalies);
        }
    }, [flights, ships, setAnomalies]);

    if (!mounted) return null;

    const totalTracked = flights.length + ships.length;
    const anomalyCount = useStore.getState().anomalies.length;

    return (
        <div className="app-shell">
            {/* Header */}
            <header className="app-header">
                <div className="app-logo">
                    <div className="dot" />
                    <span>GLOBAL MONITOR</span>
                </div>
                <div className="app-status">
                    <div className="status-item">
                        <div className="indicator" />
                        <span>LIVE</span>
                    </div>
                    <div className="status-item">
                        <span>TRACKING: <strong style={{ color: 'var(--text-primary)' }}>{totalTracked.toLocaleString()}</strong></span>
                    </div>
                    <div className="status-item">
                        <span>AIRCRAFT: <strong style={{ color: 'var(--accent-cyan)' }}>{flights.length.toLocaleString()}</strong></span>
                    </div>
                    <div className="status-item">
                        <span>VESSELS: <strong style={{ color: 'var(--accent-blue)' }}>{ships.length.toLocaleString()}</strong></span>
                    </div>
                    {anomalyCount > 0 && (
                        <div className="status-item">
                            <div className="indicator critical" />
                            <span>ALERTS: <strong style={{ color: 'var(--accent-red)' }}>{anomalyCount}</strong></span>
                        </div>
                    )}
                    <div className="status-item">
                        <span style={{ color: 'var(--text-muted)' }}>
                            {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="app-main">
                <MapEngine />
                <Sidebar />
                <AnomalyPanel />
                <TickerPanel />
            </main>

            {/* Spin animation for loading */}
            <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
