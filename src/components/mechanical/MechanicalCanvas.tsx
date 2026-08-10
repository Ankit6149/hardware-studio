'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { MechanicalObject } from '../../types';

interface ViewState {
  offsetX: number; offsetY: number; scale: number;
}

type ToolMode = 'select' | 'pan' | 'rect' | 'circle' | 'polygon';

interface MechanicalCanvasProps {
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  tool: ToolMode;
}

const TYPE_COLORS: Record<string, string> = {
  'Outer Profile': '#1e293b',
  'Inner Profile': '#64748b',
  'Board Zone': '#3b82f6',
  'Battery Cavity': '#f59e0b',
  'Connector Opening': '#10b981',
  'Button Opening': '#8b5cf6',
  'Sensor Window': '#06b6d4',
  'Mounting Point': '#ef4444',
  'Antenna Keepout': '#ec4899',
  'Thermal Zone': '#f97316',
  'Seal Zone': '#6366f1',
  'Mechanical Keepout': '#dc2626',
  'Annotation': '#94a3b8',
};

export const MechanicalCanvas: React.FC<MechanicalCanvasProps> = ({ selectedObjectId, onSelectObject, tool }) => {
  const store = useProjectStore();
  const mechanicalObjects = store.mechanicalObjects || [];
  const svgRef = useRef<SVGSVGElement>(null);

  const [view, setView] = useState<ViewState>({ offsetX: 50, offsetY: 50, scale: 4 });
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; objStartX: number; objStartY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: string; handle: string; startX: number; startY: number; objStart: MechanicalObject } | null>(null);
  const [panning, setPanning] = useState<{ startX: number; startY: number; viewStartX: number; viewStartY: number } | null>(null);
  const [creating, setCreating] = useState<{ startXMm: number; startYMm: number } | null>(null);

  const screenToMm = useCallback((sx: number, sy: number) => ({
    xMm: (sx - view.offsetX) / view.scale,
    yMm: (sy - view.offsetY) / view.scale,
  }), [view]);

  const mmToScreen = useCallback((xMm: number, yMm: number) => ({
    x: xMm * view.scale + view.offsetX,
    y: yMm * view.scale + view.offsetY,
  }), [view]);

  const getMousePos = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // Cancel active pointer transaction on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dragging) {
          store.cancelCommand();
          setDragging(null);
        }
        if (resizing) {
          store.cancelCommand();
          setResizing(null);
        }
        if (creating) {
          setCreating(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dragging, resizing, creating, store]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const mm = screenToMm(pos.x, pos.y);

    if (tool === 'pan') {
      setPanning({ startX: pos.x, startY: pos.y, viewStartX: view.offsetX, viewStartY: view.offsetY });
      return;
    }

    if (tool === 'rect' || tool === 'circle') {
      const snap = { xMm: Math.round(mm.xMm), yMm: Math.round(mm.yMm) };
      setCreating({ startXMm: snap.xMm, startYMm: snap.yMm });
      return;
    }

    if (tool === 'select') {
      onSelectObject(null);
    }
  }, [tool, getMousePos, screenToMm, view, onSelectObject]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getMousePos(e);

    if (panning) {
      setView(v => ({
        ...v,
        offsetX: panning.viewStartX + (pos.x - panning.startX),
        offsetY: panning.viewStartY + (pos.y - panning.startY),
      }));
      return;
    }

    if (dragging) {
      const dx = (pos.x - dragging.startX) / view.scale;
      const dy = (pos.y - dragging.startY) / view.scale;
      const newX = Math.round(dragging.objStartX + dx);
      const newY = Math.round(dragging.objStartY + dy);
      const updated = mechanicalObjects.map(o =>
        o.id === dragging.id ? { ...o, xMm: newX, yMm: newY } : o
      );
      store.updateTransientPreview({ mechanicalObjects: updated });
      return;
    }

    if (resizing && resizing.objStart) {
      const dx = (pos.x - resizing.startX) / view.scale;
      const dy = (pos.y - resizing.startY) / view.scale;
      const obj = resizing.objStart;

      let patch: Partial<MechanicalObject> = {};
      if (obj.shape === 'circle') {
        patch = { radiusMm: Math.max(2, Math.round((obj.radiusMm || 10) + Math.max(dx, dy))) };
      } else {
        patch = {
          widthMm: Math.max(5, Math.round((obj.widthMm || 10) + dx)),
          heightMm: Math.max(5, Math.round((obj.heightMm || 10) + dy)),
        };
      }
      const updated = mechanicalObjects.map(o =>
        o.id === resizing.id ? { ...o, ...patch } : o
      );
      store.updateTransientPreview({ mechanicalObjects: updated });
      return;
    }
  }, [panning, dragging, resizing, getMousePos, view.scale, store]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const mm = screenToMm(pos.x, pos.y);

    if (dragging) {
      store.commitCommand();
      setDragging(null);
      return;
    }
    if (resizing) {
      store.commitCommand();
      setResizing(null);
      return;
    }
    if (panning) {
      setPanning(null);
      return;
    }

    if (creating && (tool === 'rect' || tool === 'circle')) {
      const endMm = { xMm: Math.round(mm.xMm), yMm: Math.round(mm.yMm) };
      const w = Math.abs(endMm.xMm - creating.startXMm);
      const h = Math.abs(endMm.yMm - creating.startYMm);

      if (w < 3 && h < 3 && tool === 'rect') {
        // Click without drag — create default size
        store.executeProjectCommand('ADD_MECH_OBJ', 'Create mechanical object', () =>
          store.addMechanicalObject({
            name: `Zone ${(mechanicalObjects.length + 1)}`,
            type: 'Board Zone',
            shape: 'rect',
            xMm: creating.startXMm, yMm: creating.startYMm,
            widthMm: 30, heightMm: 20,
            rotationDeg: 0, locked: false, visible: true,
          })
        );
      } else if (tool === 'rect' && (w >= 3 || h >= 3)) {
        store.executeProjectCommand('ADD_MECH_OBJ', 'Create rectangle', () =>
          store.addMechanicalObject({
            name: `Zone ${(mechanicalObjects.length + 1)}`,
            type: 'Board Zone', shape: 'rect',
            xMm: Math.min(creating.startXMm, endMm.xMm),
            yMm: Math.min(creating.startYMm, endMm.yMm),
            widthMm: Math.max(5, w), heightMm: Math.max(5, h),
            rotationDeg: 0, locked: false, visible: true,
          })
        );
      } else if (tool === 'circle') {
        const r = Math.max(5, Math.round(Math.sqrt(w * w + h * h)));
        store.executeProjectCommand('ADD_MECH_OBJ', 'Create circle', () =>
          store.addMechanicalObject({
            name: `Zone ${(mechanicalObjects.length + 1)}`,
            type: 'Mounting Point', shape: 'circle',
            xMm: creating.startXMm, yMm: creating.startYMm,
            radiusMm: r > 3 ? r : 10,
            rotationDeg: 0, locked: false, visible: true,
          })
        );
      }
      setCreating(null);
    }
  }, [creating, dragging, resizing, panning, tool, getMousePos, screenToMm, store, mechanicalObjects.length]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const pos = getMousePos(e);
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setView(v => {
      const newScale = Math.max(0.5, Math.min(20, v.scale * factor));
      return {
        scale: newScale,
        offsetX: pos.x - (pos.x - v.offsetX) * (newScale / v.scale),
        offsetY: pos.y - (pos.y - v.offsetY) * (newScale / v.scale),
      };
    });
  }, [getMousePos]);

  const handleObjectMouseDown = useCallback((e: React.MouseEvent, obj: MechanicalObject) => {
    e.stopPropagation();
    if (tool !== 'select') return;
    if (obj.locked) { onSelectObject(obj.id); return; }

    const pos = getMousePos(e);
    onSelectObject(obj.id);
    store.beginCommand('MOVE_MECH_OBJ', `Move ${obj.name}`);
    setDragging({ id: obj.id, startX: pos.x, startY: pos.y, objStartX: obj.xMm, objStartY: obj.yMm });
  }, [tool, getMousePos, onSelectObject, store]);

  const handleResizeHandleMouseDown = useCallback((e: React.MouseEvent, obj: MechanicalObject, handle: string) => {
    e.stopPropagation();
    const pos = getMousePos(e);
    store.beginCommand('RESIZE_MECH_OBJ', `Resize ${obj.name}`);
    setResizing({ id: obj.id, handle, startX: pos.x, startY: pos.y, objStart: { ...obj } });
  }, [getMousePos, store]);

  // Render grid
  const gridSpacingMm = view.scale > 8 ? 1 : view.scale > 3 ? 5 : 10;
  const gridSpacingScreen = gridSpacingMm * view.scale;

  return (
    <svg
      ref={svgRef}
      style={{ width: '100%', height: '100%', cursor: tool === 'pan' ? 'grab' : tool === 'select' ? 'default' : 'crosshair' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid */}
      <defs>
        <pattern id="mechGrid" width={gridSpacingScreen} height={gridSpacingScreen} patternUnits="userSpaceOnUse"
          x={view.offsetX % gridSpacingScreen} y={view.offsetY % gridSpacingScreen}>
          <circle cx={gridSpacingScreen / 2} cy={gridSpacingScreen / 2} r={0.5} fill="#cbd5e1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#fafbfc" />
      <rect width="100%" height="100%" fill="url(#mechGrid)" />

      {/* Origin cross */}
      <line x1={view.offsetX} y1={view.offsetY - 15} x2={view.offsetX} y2={view.offsetY + 15} stroke="#94a3b8" strokeWidth={0.5} />
      <line x1={view.offsetX - 15} y1={view.offsetY} x2={view.offsetX + 15} y2={view.offsetY} stroke="#94a3b8" strokeWidth={0.5} />

      {/* Objects */}
      {mechanicalObjects.filter(o => o.visible).map(obj => {
        const color = TYPE_COLORS[obj.type] || '#334155';
        const isSelected = obj.id === selectedObjectId;

        // A. SCREW STANDOFF BOSS / MOUNTING POINT
        if (obj.type === 'Mounting Point' || obj.name.toLowerCase().includes('boss') || obj.name.toLowerCase().includes('standoff')) {
          const c = mmToScreen(obj.xMm, obj.yMm);
          const outerR = (obj.radiusMm || 3.2) * view.scale;
          const pilotR = Math.max(1, outerR * 0.45);
          return (
            <g key={obj.id} onMouseDown={e => handleObjectMouseDown(e, obj)} style={{ cursor: 'pointer' }}>
              {/* Outer standoff boss wall */}
              <circle cx={c.x} cy={c.y} r={outerR} fill="#e2e8f0" stroke={isSelected ? '#0284c7' : '#334155'} strokeWidth={isSelected ? 2 : 1.5} />
              {/* Inner pilot drill hole */}
              <circle cx={c.x} cy={c.y} r={pilotR} fill="#ffffff" stroke="#0f172a" strokeWidth={1} />
              {/* Center crosshairs */}
              <line x1={c.x - outerR - 2} y1={c.y} x2={c.x + outerR + 2} y2={c.y} stroke="#64748b" strokeWidth={0.75} strokeDasharray="2 1" />
              <line x1={c.x} y1={c.y - outerR - 2} x2={c.x} y2={c.y + outerR + 2} stroke="#64748b" strokeWidth={0.75} strokeDasharray="2 1" />
              {/* 4 Reinforcement Ribs */}
              <line x1={c.x - outerR} y1={c.y} x2={c.x - pilotR} y2={c.y} stroke="#475569" strokeWidth={1.2} />
              <line x1={c.x + pilotR} y1={c.y} x2={c.x + outerR} y2={c.y} stroke="#475569" strokeWidth={1.2} />
              <line x1={c.x} y1={c.y - outerR} x2={c.x} y2={c.y - pilotR} stroke="#475569" strokeWidth={1.2} />
              <line x1={c.x} y1={c.y + pilotR} x2={c.x} y2={c.y + outerR} stroke="#475569" strokeWidth={1.2} />
              {/* Label */}
              <text x={c.x} y={c.y + outerR + 10} textAnchor="middle" fontSize={8.5} fontFamily="monospace" fontWeight="bold" fill="#0f172a" pointerEvents="none">
                {obj.name} (Ø{(obj.radiusMm || 3.2) * 2}mm)
              </text>
              {isSelected && !obj.locked && (
                <circle cx={c.x + outerR} cy={c.y} r={4.5} fill="#ffffff" stroke="#0284c7" strokeWidth={1.8}
                  style={{ cursor: 'e-resize' }}
                  onMouseDown={e => handleResizeHandleMouseDown(e, obj, 'r')}
                />
              )}
            </g>
          );
        }

        // B. ENCLOSURE OUTER PROFILE / SHELL WALLS
        if (obj.type === 'Outer Profile' || obj.layer === 'Enclosure') {
          const tl = mmToScreen(obj.xMm, obj.yMm);
          const w = (obj.widthMm || 100) * view.scale;
          const h = (obj.heightMm || 60) * view.scale;
          const wallT = 2.0 * view.scale;

          return (
            <g key={obj.id} onMouseDown={e => handleObjectMouseDown(e, obj)} style={{ cursor: 'pointer' }}>
              {/* Outer Casing Boundary */}
              <rect x={tl.x} y={tl.y} width={w} height={h}
                fill="#f1f5f9" stroke={isSelected ? '#0284c7' : '#0f172a'}
                strokeWidth={isSelected ? 2.5 : 2} rx={6}
              />
              {/* Inner Shell Wall Contour */}
              {w > wallT * 2 && h > wallT * 2 && (
                <rect x={tl.x + wallT} y={tl.y + wallT} width={w - wallT * 2} height={h - wallT * 2}
                  fill="#ffffff" stroke="#475569" strokeWidth={1.2} strokeDasharray="4 2" rx={4}
                />
              )}
              <text x={tl.x + 12} y={tl.y + 16} fontSize={9.5} fontFamily="sans-serif" fontWeight="bold" fill="#0f172a" pointerEvents="none">
                {obj.name} ({obj.widthMm} × {obj.heightMm}mm)
              </text>
              {/* Resize handles */}
              {isSelected && !obj.locked && (
                <rect x={tl.x + w - 4} y={tl.y + h - 4} width={8} height={8} fill="white" stroke="#0284c7"
                  strokeWidth={1.8} rx={1} style={{ cursor: 'se-resize' }}
                  onMouseDown={e => handleResizeHandleMouseDown(e, obj, 'se')}
                />
              )}
            </g>
          );
        }

        // C. BATTERY CAVITY / COMPARTMENT
        if (obj.type === 'Battery Cavity') {
          const tl = mmToScreen(obj.xMm, obj.yMm);
          const w = (obj.widthMm || 40) * view.scale;
          const h = (obj.heightMm || 20) * view.scale;

          return (
            <g key={obj.id} onMouseDown={e => handleObjectMouseDown(e, obj)} style={{ cursor: 'pointer' }}>
              <rect x={tl.x} y={tl.y} width={w} height={h}
                fill="#fef3c7" stroke={isSelected ? '#0284c7' : '#d97706'}
                strokeWidth={isSelected ? 2 : 1.5} rx={3}
              />
              {/* Battery polarity terminals */}
              <text x={tl.x + 6} y={tl.y + h / 2 + 3} fontSize={10} fontWeight="bold" fill="#dc2626" pointerEvents="none">+</text>
              <text x={tl.x + w - 10} y={tl.y + h / 2 + 3} fontSize={10} fontWeight="bold" fill="#2563eb" pointerEvents="none">-</text>
              <text x={tl.x + w / 2} y={tl.y + h / 2 + 3} textAnchor="middle" fontSize={8.5} fontFamily="sans-serif" fontWeight="bold" fill="#78350f" pointerEvents="none">
                {obj.name}
              </text>
              {isSelected && !obj.locked && (
                <rect x={tl.x + w - 4} y={tl.y + h - 4} width={8} height={8} fill="white" stroke="#d97706"
                  strokeWidth={1.5} rx={1} style={{ cursor: 'se-resize' }}
                  onMouseDown={e => handleResizeHandleMouseDown(e, obj, 'se')}
                />
              )}
            </g>
          );
        }

        // D. CONNECTOR CUTOUT OPENING (USB / BARREL / HEADERS)
        if (obj.type === 'Connector Opening') {
          const tl = mmToScreen(obj.xMm, obj.yMm);
          const w = (obj.widthMm || 16) * view.scale;
          const h = (obj.heightMm || 12) * view.scale;

          return (
            <g key={obj.id} onMouseDown={e => handleObjectMouseDown(e, obj)} style={{ cursor: 'pointer' }}>
              <rect x={tl.x} y={tl.y} width={w} height={h}
                fill="#dcfce7" stroke={isSelected ? '#0284c7' : '#15803d'}
                strokeWidth={isSelected ? 2 : 1.5} rx={4}
              />
              {/* Chamfered port guide lines */}
              <line x1={tl.x + 3} y1={tl.y + 3} x2={tl.x + w - 3} y2={tl.y + 3} stroke="#166534" strokeWidth={1} />
              <line x1={tl.x + 3} y1={tl.y + h - 3} x2={tl.x + w - 3} y2={tl.y + h - 3} stroke="#166534" strokeWidth={1} />
              <text x={tl.x + w / 2} y={tl.y + h / 2 + 3} textAnchor="middle" fontSize={8} fontFamily="monospace" fontWeight="bold" fill="#14532d" pointerEvents="none">
                {obj.name}
              </text>
              {isSelected && !obj.locked && (
                <rect x={tl.x + w - 4} y={tl.y + h - 4} width={8} height={8} fill="white" stroke="#15803d"
                  strokeWidth={1.5} rx={1} style={{ cursor: 'se-resize' }}
                  onMouseDown={e => handleResizeHandleMouseDown(e, obj, 'se')}
                />
              )}
            </g>
          );
        }

        // E. GENERAL RECTANGULAR CAD ZONE
        const tl = mmToScreen(obj.xMm, obj.yMm);
        const w = (obj.widthMm || 10) * view.scale;
        const h = (obj.heightMm || 10) * view.scale;

        return (
          <g key={obj.id} onMouseDown={e => handleObjectMouseDown(e, obj)} style={{ cursor: 'pointer' }}>
            <rect x={tl.x} y={tl.y} width={w} height={h}
              fill={`${color}18`} stroke={isSelected ? '#0284c7' : color}
              strokeWidth={isSelected ? 2 : 1.2}
              strokeDasharray={obj.type.includes('Keepout') ? '4 2' : undefined}
              rx={2}
            />
            <text x={tl.x + w / 2} y={tl.y + h / 2 + 3} textAnchor="middle" fontSize={8.5} fontFamily="sans-serif" fontWeight="bold" fill={color} pointerEvents="none">
              {obj.name}
            </text>
            <text x={tl.x + w / 2} y={tl.y - 3} textAnchor="middle" fontSize={7.5} fontFamily="monospace" fill="#64748b" pointerEvents="none">
              {obj.widthMm} × {obj.heightMm}mm
            </text>
            {isSelected && !obj.locked && (
              <rect x={tl.x + w - 4} y={tl.y + h - 4} width={8} height={8} fill="white" stroke={color}
                strokeWidth={1.5} rx={1} style={{ cursor: 'se-resize' }}
                onMouseDown={e => handleResizeHandleMouseDown(e, obj, 'se')}
              />
            )}
          </g>
        );
      })}

      {/* Scale indicator */}
      <g transform="translate(20, 540)">
        <line x1={0} y1={0} x2={10 * view.scale} y2={0} stroke="#64748b" strokeWidth={1} />
        <line x1={0} y1={-3} x2={0} y2={3} stroke="#64748b" strokeWidth={1} />
        <line x1={10 * view.scale} y1={-3} x2={10 * view.scale} y2={3} stroke="#64748b" strokeWidth={1} />
        <text x={5 * view.scale} y={-6} textAnchor="middle" fontSize={9} fill="#64748b">10mm</text>
      </g>
    </svg>
  );
};
