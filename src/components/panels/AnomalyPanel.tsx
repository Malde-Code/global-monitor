/* ============================================================
   Global Monitor – Anomaly Badge Panel
   Pulsing indicators for detected anomalies
   ============================================================ */

'use client';

import React from 'react';
import { useStore } from '@/store/store';

export default function AnomalyPanel() {
    const anomalies = useStore((s) => s.anomalies);
    const setViewState = useStore((s) => s.setViewState);

    const squawkCount = anomalies.filter((a) => a.type === 'squawk_7700').length;
    const darkTargetCount = anomalies.filter((a) => a.type === 'dark_target').length;

    const flyToAnomaly = (type: string) => {
        const anomaly = anomalies.find((a) => a.type === type);
        if (anomaly) {
            setViewState({
                longitude: anomaly.longitude,
                latitude: anomaly.latitude,
                zoom: 7,
                transitionDuration: 1200,
            });
        }
    };

    if (squawkCount === 0 && darkTargetCount === 0) return null;

    return (
        <div className="anomaly-panel">
            {squawkCount > 0 && (
                <div
                    className="anomaly-badge squawk glass-panel"
                    onClick={() => flyToAnomaly('squawk_7700')}
                    title="Click to fly to nearest emergency"
                >
                    <span>🚨</span>
                    <span>SQUAWK 7700</span>
                    <span className="badge-count">{squawkCount}</span>
                </div>
            )}
            {darkTargetCount > 0 && (
                <div
                    className="anomaly-badge dark-target glass-panel"
                    onClick={() => flyToAnomaly('dark_target')}
                    title="Click to fly to nearest dark target"
                >
                    <span>👁</span>
                    <span>DARK TARGETS</span>
                    <span className="badge-count">{darkTargetCount}</span>
                </div>
            )}
        </div>
    );
}
