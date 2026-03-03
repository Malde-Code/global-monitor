/* ============================================================
   Global Monitor – Icon Atlas Configuration
   Sprite-sheet mapping for GPU-accelerated IconLayer
   ============================================================ */

// The icon atlas is a single image containing all icons.
// For the demo we use SVG data URIs rendered to a canvas at init.

export interface IconMapping {
    [key: string]: {
        x: number;
        y: number;
        width: number;
        height: number;
        anchorY: number;
        mask: boolean;
    };
}

const ICON_SIZE = 64;

export const ICON_MAPPING: IconMapping = {
    // Aircraft icons
    'aircraft-commercial': { x: 0, y: 0, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'aircraft-military': { x: ICON_SIZE, y: 0, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'aircraft-cargo': { x: ICON_SIZE * 2, y: 0, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'aircraft-private': { x: ICON_SIZE * 3, y: 0, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'aircraft-helicopter': { x: ICON_SIZE * 4, y: 0, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'aircraft-unknown': { x: ICON_SIZE * 5, y: 0, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    // Ship icons
    'ship-tanker': { x: 0, y: ICON_SIZE, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'ship-cargo': { x: ICON_SIZE, y: ICON_SIZE, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'ship-military': { x: ICON_SIZE * 2, y: ICON_SIZE, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'ship-passenger': { x: ICON_SIZE * 3, y: ICON_SIZE, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'ship-fishing': { x: ICON_SIZE * 4, y: ICON_SIZE, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'ship-unknown': { x: ICON_SIZE * 5, y: ICON_SIZE, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    // Special markers
    'news-crisis': { x: 0, y: ICON_SIZE * 2, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'news-military': { x: ICON_SIZE, y: ICON_SIZE * 2, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'news-economic': { x: ICON_SIZE * 2, y: ICON_SIZE * 2, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'news-infrastructure': { x: ICON_SIZE * 3, y: ICON_SIZE * 2, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'anomaly': { x: ICON_SIZE * 4, y: ICON_SIZE * 2, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
    'chokepoint': { x: ICON_SIZE * 5, y: ICON_SIZE * 2, width: ICON_SIZE, height: ICON_SIZE, anchorY: ICON_SIZE / 2, mask: true },
};

// ── Generate Icon Atlas (Canvas-based) ───────────────────────
export function createIconAtlas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = ICON_SIZE * 6;
    canvas.height = ICON_SIZE * 3;
    const ctx = canvas.getContext('2d')!;

    // Helper to draw an aircraft shape
    function drawAircraft(cx: number, cy: number, color: string) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = color;
        ctx.beginPath();
        // Fuselage
        ctx.moveTo(0, -24);
        ctx.lineTo(6, -8);
        ctx.lineTo(22, 4);
        ctx.lineTo(22, 8);
        ctx.lineTo(6, 2);
        ctx.lineTo(4, 16);
        ctx.lineTo(10, 22);
        ctx.lineTo(10, 24);
        ctx.lineTo(0, 20);
        ctx.lineTo(-10, 24);
        ctx.lineTo(-10, 22);
        ctx.lineTo(-4, 16);
        ctx.lineTo(-6, 2);
        ctx.lineTo(-22, 8);
        ctx.lineTo(-22, 4);
        ctx.lineTo(-6, -8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Helper to draw a ship shape
    function drawShip(cx: number, cy: number, color: string) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(10, -4);
        ctx.lineTo(10, 12);
        ctx.lineTo(6, 20);
        ctx.lineTo(-6, 20);
        ctx.lineTo(-10, 12);
        ctx.lineTo(-10, -4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Helper to draw a marker dot
    function drawMarker(cx: number, cy: number, color: string) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        // Inner dot
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    const half = ICON_SIZE / 2;

    // Row 0: Aircraft types
    drawAircraft(half, half, '#06b6d4');            // commercial
    drawAircraft(ICON_SIZE + half, half, '#ef4444'); // military
    drawAircraft(ICON_SIZE * 2 + half, half, '#10b981'); // cargo
    drawAircraft(ICON_SIZE * 3 + half, half, '#8b5cf6'); // private
    drawAircraft(ICON_SIZE * 4 + half, half, '#f59e0b'); // helicopter
    drawAircraft(ICON_SIZE * 5 + half, half, '#6b7280'); // unknown

    // Row 1: Ship types
    drawShip(half, ICON_SIZE + half, '#f59e0b');                   // tanker
    drawShip(ICON_SIZE + half, ICON_SIZE + half, '#10b981');       // cargo
    drawShip(ICON_SIZE * 2 + half, ICON_SIZE + half, '#ef4444');   // military
    drawShip(ICON_SIZE * 3 + half, ICON_SIZE + half, '#3b82f6');   // passenger
    drawShip(ICON_SIZE * 4 + half, ICON_SIZE + half, '#6b7280');   // fishing
    drawShip(ICON_SIZE * 5 + half, ICON_SIZE + half, '#475569');   // unknown

    // Row 2: Markers
    drawMarker(half, ICON_SIZE * 2 + half, '#ef4444');                  // crisis
    drawMarker(ICON_SIZE + half, ICON_SIZE * 2 + half, '#f59e0b');       // military news
    drawMarker(ICON_SIZE * 2 + half, ICON_SIZE * 2 + half, '#3b82f6');   // economic
    drawMarker(ICON_SIZE * 3 + half, ICON_SIZE * 2 + half, '#8b5cf6');   // infrastructure
    drawMarker(ICON_SIZE * 4 + half, ICON_SIZE * 2 + half, '#ff0000');   // anomaly
    drawMarker(ICON_SIZE * 5 + half, ICON_SIZE * 2 + half, '#f97316');   // chokepoint

    return canvas;
}
