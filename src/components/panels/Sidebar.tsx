/* ============================================================
   Global Monitor – Sidebar
   Collapsible sidebar with LayerManager and FilterPanel
   ============================================================ */

'use client';

import React from 'react';
import { useStore } from '@/store/store';
import LayerManager from './LayerManager';
import FilterPanel from './FilterPanel';

export default function Sidebar() {
    const sidebarOpen = useStore((s) => s.sidebarOpen);
    const toggleSidebar = useStore((s) => s.toggleSidebar);

    return (
        <>
            {!sidebarOpen && (
                <button
                    className="sidebar-toggle"
                    onClick={toggleSidebar}
                    title="Open sidebar"
                >
                    ☰
                </button>
            )}
            <div className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
                <div className="glass-panel" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Control Panel
                    </span>
                    <button
                        onClick={toggleSidebar}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: 16,
                            padding: 4,
                        }}
                        title="Collapse sidebar"
                    >
                        ✕
                    </button>
                </div>
                <div className="sidebar-content">
                    <LayerManager />
                    <FilterPanel />
                </div>
            </div>
        </>
    );
}
