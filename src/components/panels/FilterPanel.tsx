/* ============================================================
   Global Monitor – Filter Panel
   Multi-select chips for aircraft and ship type filtering
   ============================================================ */

'use client';

import React from 'react';
import { useStore } from '@/store/store';
import type { AircraftCategory, ShipType } from '@/types';

const aircraftTypes: Array<{ key: AircraftCategory; label: string; icon: string }> = [
    { key: 'commercial', label: 'Commercial', icon: '🛫' },
    { key: 'military', label: 'Military', icon: '🔴' },
    { key: 'cargo', label: 'Cargo', icon: '📦' },
    { key: 'private', label: 'Private', icon: '✨' },
    { key: 'helicopter', label: 'Helicopter', icon: '🚁' },
];

const shipTypes: Array<{ key: ShipType; label: string; icon: string }> = [
    { key: 'tanker', label: 'Tanker', icon: '🛢' },
    { key: 'cargo', label: 'Cargo', icon: '📦' },
    { key: 'military', label: 'Military', icon: '⚓' },
    { key: 'passenger', label: 'Passenger', icon: '🚢' },
    { key: 'fishing', label: 'Fishing', icon: '🎣' },
];

export default function FilterPanel() {
    const activeAircraftFilters = useStore((s) => s.activeAircraftFilters);
    const activeShipFilters = useStore((s) => s.activeShipFilters);
    const toggleAircraftFilter = useStore((s) => s.toggleAircraftFilter);
    const toggleShipFilter = useStore((s) => s.toggleShipFilter);

    return (
        <div className="panel-section glass-panel">
            <div className="panel-header">
                <span className="panel-title">Aircraft Filter</span>
            </div>
            <div className="filter-chips">
                {aircraftTypes.map((t) => (
                    <button
                        key={t.key}
                        className={`filter-chip ${activeAircraftFilters.has(t.key) ? 'active' : ''}`}
                        onClick={() => toggleAircraftFilter(t.key)}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            <div className="panel-header" style={{ marginTop: 16 }}>
                <span className="panel-title">Vessel Filter</span>
            </div>
            <div className="filter-chips">
                {shipTypes.map((t) => (
                    <button
                        key={t.key}
                        className={`filter-chip ${activeShipFilters.has(t.key) ? 'active' : ''}`}
                        onClick={() => toggleShipFilter(t.key)}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
