/* ============================================================
   Global Monitor – Ticker Panel
   Scrolling bottom bar with live geocoded news headlines
   ============================================================ */

'use client';

import React from 'react';
import { useStore } from '@/store/store';
import type { NewsEvent } from '@/types';

function formatTime(timestamp: number): string {
    const diff = Math.floor((Date.now() - timestamp) / 60000);
    if (diff < 1) return 'NOW';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
}

export default function TickerPanel() {
    const newsEvents = useStore((s) => s.newsEvents);
    const setViewState = useStore((s) => s.setViewState);

    const handleClick = (event: NewsEvent) => {
        setViewState({
            longitude: event.longitude,
            latitude: event.latitude,
            zoom: 6,
            transitionDuration: 1500,
        });
    };

    if (newsEvents.length === 0) return null;

    // Double the items for seamless infinite scroll
    const doubled = [...newsEvents, ...newsEvents];

    return (
        <div className="ticker-panel">
            <div className="ticker-label">
                <span style={{ marginRight: 6 }}>●</span> INTEL FEED
            </div>
            <div className="ticker-track">
                <div className="ticker-scroll">
                    {doubled.map((event, i) => (
                        <div
                            key={`${event.id}-${i}`}
                            className="ticker-item"
                            onClick={() => handleClick(event)}
                        >
                            <span className={`ticker-category ${event.category}`}>
                                {event.category.toUpperCase()}
                            </span>
                            <span className="ticker-text">{event.title}</span>
                            <span className="ticker-time">{formatTime(event.timestamp)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
