/* ============================================================
   Global Monitor – Layer Manager Panel
   Toggle layers on/off + opacity control
   ============================================================ */

'use client';

import React from 'react';
import { useStore } from '@/store/store';

export default function LayerManager() {
    const layers = useStore((s) => s.layers);
    const toggleLayerVisibility = useStore((s) => s.toggleLayerVisibility);
    const setLayerOpacity = useStore((s) => s.setLayerOpacity);

    const layerOrder = ['flights', 'ships', 'news', 'conflicts', 'cables', 'pipelines', 'chokepoints'];

    return (
        <div className="panel-section glass-panel">
            <div className="panel-header">
                <span className="panel-title">Layers</span>
            </div>
            {layerOrder.map((id) => {
                const layer = layers[id];
                if (!layer) return null;
                return (
                    <div className="layer-item" key={id}>
                        <div className="layer-info">
                            <div
                                className="layer-icon"
                                style={{ background: `${layer.color}20`, color: layer.color }}
                            >
                                {layer.icon}
                            </div>
                            <div>
                                <div className="layer-name">{layer.name}</div>
                                {layer.count !== undefined && layer.count > 0 && (
                                    <div className="layer-count">{layer.count.toLocaleString()} active</div>
                                )}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <input
                                type="range"
                                className="opacity-slider"
                                min={0}
                                max={1}
                                step={0.05}
                                value={layer.opacity}
                                onChange={(e) => setLayerOpacity(id, parseFloat(e.target.value))}
                                style={{ opacity: layer.visible ? 1 : 0.3 }}
                            />
                            <div
                                className={`toggle-switch ${layer.visible ? 'active' : ''}`}
                                onClick={() => toggleLayerVisibility(id)}
                            >
                                <div className="toggle-knob" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
