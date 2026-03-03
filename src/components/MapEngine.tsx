/* ============================================================
   Global Monitor – MapEngine Component
   GPU-accelerated Deck.gl + Mapbox GL JS rendering engine
   ============================================================ */

'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Map from 'react-map-gl/mapbox';
import DeckGL from '@deck.gl/react';
import { IconLayer, GeoJsonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { useStore } from '@/store/store';
import { createIconAtlas, ICON_MAPPING } from '@/lib/iconAtlas';
import type { FlightPosition, ShipPosition, NewsEvent, ViewState } from '@/types';
import { Layer, PickingInfo } from '@deck.gl/core';

// Mapbox style – dark satellite hybrid for intelligence look
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

// ── Tooltip Component ────────────────────────────────────────
interface TooltipData {
    x: number;
    y: number;
    object: Record<string, unknown>;
    layerType: string;
}

function MapTooltip({ data }: { data: TooltipData | null }) {
    if (!data) return null;
    const { x, y, object, layerType } = data;

    return (
        <div
            className="map-tooltip"
            style={{
                position: 'absolute',
                left: x + 12,
                top: y - 12,
                zIndex: 999,
                pointerEvents: 'none',
            }}
        >
            {layerType === 'flight' && (
                <>
                    <div className="tooltip-title">
                        ✈ {(object as unknown as FlightPosition).callsign || 'Unknown'}
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">ICAO</span>
                        <span className="tooltip-value">{(object as unknown as FlightPosition).icao24}</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Origin</span>
                        <span className="tooltip-value">{(object as unknown as FlightPosition).originCountry}</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Alt</span>
                        <span className="tooltip-value">FL{Math.round((object as unknown as FlightPosition).altitude / 30.48)}</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Speed</span>
                        <span className="tooltip-value">{Math.round((object as unknown as FlightPosition).velocity * 1.944)} kts</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Heading</span>
                        <span className="tooltip-value">{Math.round((object as unknown as FlightPosition).heading)}°</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Type</span>
                        <span className="tooltip-value">{(object as unknown as FlightPosition).category}</span>
                    </div>
                    {(object as unknown as FlightPosition).squawk === '7700' && (
                        <div className="tooltip-row" style={{ color: '#ef4444', fontWeight: 600 }}>
                            <span>⚠ EMERGENCY – SQUAWK 7700</span>
                        </div>
                    )}
                </>
            )}
            {layerType === 'ship' && (
                <>
                    <div className="tooltip-title">
                        🚢 {(object as unknown as ShipPosition).name}
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">MMSI</span>
                        <span className="tooltip-value">{(object as unknown as ShipPosition).mmsi}</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Type</span>
                        <span className="tooltip-value">{(object as unknown as ShipPosition).shipType}</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Speed</span>
                        <span className="tooltip-value">{(object as unknown as ShipPosition).speed.toFixed(1)} kts</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Dest</span>
                        <span className="tooltip-value">{(object as unknown as ShipPosition).destination}</span>
                    </div>
                    {!(object as unknown as ShipPosition).aisActive && (
                        <div className="tooltip-row" style={{ color: '#f59e0b', fontWeight: 600 }}>
                            <span>⚠ AIS OFFLINE – DARK TARGET</span>
                        </div>
                    )}
                </>
            )}
            {layerType === 'news' && (
                <>
                    <div className="tooltip-title">
                        📰 {(object as unknown as NewsEvent).title}
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Source</span>
                        <span className="tooltip-value">{(object as unknown as NewsEvent).source}</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Severity</span>
                        <span className="tooltip-value" style={{
                            color: (object as unknown as NewsEvent).severity === 'critical' ? '#ef4444' :
                                (object as unknown as NewsEvent).severity === 'high' ? '#f59e0b' : '#94a3b8'
                        }}>
                            {(object as unknown as NewsEvent).severity.toUpperCase()}
                        </span>
                    </div>
                </>
            )}
            {layerType === 'chokepoint' && (
                <>
                    <div className="tooltip-title">
                        🔒 {(object as Record<string, unknown>).name as string}
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Avg Wait</span>
                        <span className="tooltip-value">{(object as Record<string, unknown>).avgWaitHours as number}h</span>
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Daily Transits</span>
                        <span className="tooltip-value">{(object as Record<string, unknown>).dailyTransits as number}</span>
                    </div>
                </>
            )}
        </div>
    );
}

// ── MapEngine Component ──────────────────────────────────────
export default function MapEngine() {
    const viewState = useStore((s) => s.viewState);
    const setViewState = useStore((s) => s.setViewState);
    const flights = useStore((s) => s.flights);
    const ships = useStore((s) => s.ships);
    const newsEvents = useStore((s) => s.newsEvents);
    const layers = useStore((s) => s.layers);
    const activeAircraftFilters = useStore((s) => s.activeAircraftFilters);
    const activeShipFilters = useStore((s) => s.activeShipFilters);

    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const [iconAtlas, setIconAtlas] = useState<HTMLCanvasElement | null>(null);
    const [staticData, setStaticData] = useState<{
        conflictZones: unknown;
        cables: unknown;
        pipelines: unknown;
        chokepoints: unknown;
    }>({ conflictZones: null, cables: null, pipelines: null, chokepoints: null });

    // Generate icon atlas once
    useEffect(() => {
        setIconAtlas(createIconAtlas());
    }, []);

    // Load static GeoJSON data once (cached)
    useEffect(() => {
        Promise.all([
            fetch('/data/conflict_zones.geojson').then((r) => r.json()),
            fetch('/data/undersea_cables.geojson').then((r) => r.json()),
            fetch('/data/pipelines.geojson').then((r) => r.json()),
            fetch('/data/chokepoints.geojson').then((r) => r.json()),
        ]).then(([conflictZones, cables, pipelines, chokepoints]) => {
            setStaticData({ conflictZones, cables, pipelines, chokepoints });
        });
    }, []);

    // Filter data based on active filters
    const filteredFlights = useMemo(
        () => flights.filter((f) => activeAircraftFilters.has(f.category)),
        [flights, activeAircraftFilters]
    );

    const filteredShips = useMemo(
        () => ships.filter((s) => activeShipFilters.has(s.shipType)),
        [ships, activeShipFilters]
    );

    // Handle hover
    const onHover = useCallback((info: PickingInfo, layerType: string) => {
        if (info.object) {
            const obj = layerType === 'chokepoint' ? info.object.properties : info.object;
            setTooltip({
                x: info.x,
                y: info.y,
                object: obj as Record<string, unknown>,
                layerType,
            });
        } else {
            setTooltip(null);
        }
    }, []);

    // Handle view state change
    const onViewStateChange = useCallback(
        ({ viewState: vs }: { viewState: ViewState }) => {
            setViewState(vs);
        },
        [setViewState]
    );

    // ── Compose Deck.gl Layers ─────────────────────────────────
    const deckLayers = useMemo(() => {
        const result: Layer[] = [];

        // 1. Conflict Zones (GeoJSON polygons)
        if (layers.conflicts?.visible && staticData.conflictZones) {
            result.push(
                new GeoJsonLayer({
                    id: 'conflict-zones',
                    data: staticData.conflictZones as any,
                    pickable: false,
                    filled: true,
                    stroked: true,
                    getFillColor: [239, 68, 68, Math.round(50 * layers.conflicts.opacity)],
                    getLineColor: [239, 68, 68, Math.round(180 * layers.conflicts.opacity)],
                    getLineWidth: 2,
                    lineWidthMinPixels: 1,
                })
            );
        }

        // 2. Undersea Cables (GeoJSON lines)
        if (layers.cables?.visible && staticData.cables) {
            result.push(
                new GeoJsonLayer({
                    id: 'undersea-cables',
                    data: staticData.cables as any,
                    pickable: false,
                    stroked: true,
                    filled: false,
                    getLineColor: [139, 92, 246, Math.round(200 * layers.cables.opacity)],
                    getLineWidth: 2,
                    lineWidthMinPixels: 1,
                    lineWidthScale: 1,
                })
            );
        }

        // 3. Pipelines (GeoJSON lines)
        if (layers.pipelines?.visible && staticData.pipelines) {
            result.push(
                new GeoJsonLayer({
                    id: 'pipelines',
                    data: staticData.pipelines as any,
                    pickable: false,
                    stroked: true,
                    filled: false,
                    getLineColor: [16, 185, 129, Math.round(200 * layers.pipelines.opacity)],
                    getLineWidth: 2,
                    lineWidthMinPixels: 1,
                    getDashArray: [8, 4],
                })
            );
        }

        // 4. Chokepoints (ScatterplotLayer with text)
        if (layers.chokepoints?.visible && staticData.chokepoints) {
            const cpFeatures = (staticData.chokepoints as { features: Array<{ properties: Record<string, unknown>; geometry: { coordinates: number[] } }> }).features;

            result.push(
                new ScatterplotLayer({
                    id: 'chokepoints',
                    data: cpFeatures,
                    pickable: true,
                    opacity: layers.chokepoints.opacity,
                    getPosition: (d: { geometry: { coordinates: number[] } }) => d.geometry.coordinates as [number, number],
                    getFillColor: [249, 115, 22, 100],
                    getLineColor: [249, 115, 22, 255],
                    getRadius: 25000,
                    lineWidthMinPixels: 2,
                    stroked: true,
                    radiusMinPixels: 8,
                    radiusMaxPixels: 30,
                    onHover: (info: PickingInfo) => onHover(info, 'chokepoint'),
                })
            );

            result.push(
                new TextLayer({
                    id: 'chokepoint-labels',
                    data: cpFeatures,
                    getPosition: (d: { geometry: { coordinates: number[] } }) => d.geometry.coordinates as [number, number],
                    getText: (d: { properties: { name: string } }) => d.properties.name,
                    getSize: 11,
                    getColor: [249, 115, 22, Math.round(255 * layers.chokepoints.opacity)],
                    getAngle: 0,
                    getTextAnchor: 'start' as const,
                    getAlignmentBaseline: 'center' as const,
                    getPixelOffset: [14, 0],
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                })
            );
        }

        // 5. Aircraft (IconLayer – GPU accelerated)
        if (layers.flights?.visible && iconAtlas && filteredFlights.length > 0) {
            result.push(
                new IconLayer({
                    id: 'flights-layer',
                    data: filteredFlights,
                    pickable: true,
                    iconAtlas: iconAtlas as any,
                    iconMapping: ICON_MAPPING,
                    getIcon: (d: FlightPosition) => `aircraft-${d.category}`,
                    getPosition: (d: FlightPosition) =>
                        [d.longitude, d.latitude, d.altitude] as [number, number, number],
                    getSize: 24,
                    getAngle: (d: FlightPosition) => 360 - d.heading,
                    getColor: (d: FlightPosition) =>
                        d.squawk === '7700'
                            ? [255, 60, 60, 255]
                            : [255, 255, 255, Math.round(255 * layers.flights.opacity)],
                    sizeScale: 1,
                    sizeMinPixels: 6,
                    sizeMaxPixels: 36,
                    billboard: false,
                    onHover: (info: PickingInfo) => onHover(info, 'flight'),
                    updateTriggers: {
                        getColor: [layers.flights.opacity],
                    },
                })
            );
        }

        // 6. Ships (IconLayer)
        if (layers.ships?.visible && iconAtlas && filteredShips.length > 0) {
            result.push(
                new IconLayer({
                    id: 'ships-layer',
                    data: filteredShips,
                    pickable: true,
                    iconAtlas: iconAtlas as any,
                    iconMapping: ICON_MAPPING,
                    getIcon: (d: ShipPosition) => `ship-${d.shipType}`,
                    getPosition: (d: ShipPosition) => [d.longitude, d.latitude] as [number, number],
                    getSize: 20,
                    getAngle: (d: ShipPosition) => 360 - d.heading,
                    getColor: (d: ShipPosition) =>
                        !d.aisActive
                            ? [255, 180, 0, 255]
                            : [255, 255, 255, Math.round(255 * layers.ships.opacity)],
                    sizeScale: 1,
                    sizeMinPixels: 4,
                    sizeMaxPixels: 28,
                    billboard: false,
                    onHover: (info: PickingInfo) => onHover(info, 'ship'),
                    updateTriggers: {
                        getColor: [layers.ships.opacity],
                    },
                })
            );
        }

        // 7. News Events (ScatterplotLayer with pulsing)
        if (layers.news?.visible && newsEvents.length > 0) {
            result.push(
                new ScatterplotLayer({
                    id: 'news-layer',
                    data: newsEvents,
                    pickable: true,
                    opacity: layers.news.opacity,
                    getPosition: (d: NewsEvent) => [d.longitude, d.latitude] as [number, number],
                    getFillColor: (d: NewsEvent) => {
                        switch (d.category) {
                            case 'crisis': return [239, 68, 68, 180];
                            case 'military': return [245, 158, 11, 180];
                            case 'economic': return [59, 130, 246, 180];
                            case 'infrastructure': return [139, 92, 246, 180];
                            default: return [148, 163, 184, 180];
                        }
                    },
                    getLineColor: (d: NewsEvent) => {
                        switch (d.category) {
                            case 'crisis': return [239, 68, 68, 255];
                            case 'military': return [245, 158, 11, 255];
                            case 'economic': return [59, 130, 246, 255];
                            case 'infrastructure': return [139, 92, 246, 255];
                            default: return [148, 163, 184, 255];
                        }
                    },
                    getRadius: (d: NewsEvent) =>
                        d.severity === 'critical' ? 60000 :
                            d.severity === 'high' ? 45000 : 30000,
                    stroked: true,
                    lineWidthMinPixels: 2,
                    radiusMinPixels: 6,
                    radiusMaxPixels: 24,
                    onHover: (info: PickingInfo) => onHover(info, 'news'),
                })
            );
        }

        return result;
    }, [
        layers, iconAtlas, filteredFlights, filteredShips, newsEvents,
        staticData, onHover,
    ]);

    return (
        <div className="map-container">
            <DeckGL
                viewState={viewState}
                onViewStateChange={onViewStateChange as unknown as (params: { viewState: Record<string, unknown> }) => void}
                controller={true}
                layers={deckLayers}
                getCursor={({ isHovering }: { isHovering: boolean }) =>
                    isHovering ? 'pointer' : 'grab'
                }
                parameters={{
                    blend: true,
                } as any}
            >
                <Map
                    mapStyle={MAP_STYLE}
                    mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.startsWith('pk.') && !process.env.NEXT_PUBLIC_MAPBOX_TOKEN.includes('placeholder') ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN : undefined}
                    attributionControl={false}
                    reuseMaps
                />
            </DeckGL>
            <MapTooltip data={tooltip} />
        </div>
    );
}
