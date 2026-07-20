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
      store.updateMechanicalObject(dragging.id, {
        xMm: Math.round(dragging.objStartX + dx),
        yMm: Math.round(dragging.objStartY + dy),
      });
      return;
    }

    if (resizing && resizing.objStart) {
      const dx = (pos.x - resizing.startX) / view.scale;
      const dy = (pos.y - resizing.startY) / view.scale;
      const obj = resizing.objStart;

      if (obj.shape === 'circle') {
        const newR = Math.max(2, Math.round((obj.radiusMm || 10) + Math.max(dx, dy)));
        store.updateMechanicalObject(resizing.id, { radiusMm: newR });
      } else {
        const newW = Math.max(5, Math.round((obj.widthMm || 10) + dx));
        const newH = Math.max(5, Math.round((obj.heightMm || 10) + dy));
        store.updateMechanicalObject(resizing.id, { widthMm: newW, heightMm: newH });
      }
      return;
    }
  }, [panning, dragging, resizing, getMousePos, view.scale, store]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const pos = getMousePos(e);
    const mm = screenToMm(pos.x, pos.y);

    if (dragging) {
      store.executeProjectCommand('MOVE_MECH_OBJ', 'Move mechanical object', () => {});
      setDragging(null);
      return;
    }
    if (resizing) {
      store.executeProjectCommand('RESIZE_MECH_OBJ', 'Resize mechanical object', () => {});
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
    setDragging({ id: obj.id, startX: pos.x, startY: pos.y, objStartX: obj.xMm, objStartY: obj.yMm });
  }, [tool, getMousePos, onSelectObject]);

  const handleResizeHandleMouseDown = useCallback((e: React.MouseEvent, obj: MechanicalObject, handle: string) => {
    e.stopPropagation();
    const pos = getMousePos(e);
    setResizing({ id: obj.id, handle, startX: pos.x, startY: pos.y, objStart: { ...obj } });
  }, [getMousePos]);

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
        const color = TYPE_COLORS[obj.type] || '#6b7280';
        const isSelected = obj.id === selectedObjectId;

        if (obj.shape === 'circle' && obj.radiusMm) {
          const c = mmToScreen(obj.xMm, obj.yMm);
          const r = obj.radiusMm * view.scale;
          return (
            <g key={obj.id}>
              <circle cx={c.x} cy={c.y} r={r} fill={`${color}15`} stroke={isSelected ? color : `${color}80`}
                strokeWidth={isSelected ? 2 : 1} strokeDasharray={obj.type === 'Antenna Keepout' ? '4 2' : undefined}
                style={{ cursor: 'pointer' }}
                onMouseDown={e => handleObjectMouseDown(e, obj)}
              />
              <text x={c.x} y={c.y} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill={color} pointerEvents="none">
                {obj.name}
              </text>
              {isSelected && !obj.locked && (
                <circle cx={c.x + r} cy={c.y} r={4} fill="white" stroke={color} strokeWidth={1.5}
                  style={{ cursor: 'e-resize' }}
                  onMouseDown={e => handleResizeHandleMouseDown(e, obj, 'r')}
                />
              )}
            </g>
          );
        }

        // Rectangle
        const tl = mmToScreen(obj.xMm, obj.yMm);
        const w = (obj.widthMm || 0) * view.scale;
        const h = (obj.heightMm || 0) * view.scale;

        return (
          <g key={obj.id}>
            <rect x={tl.x} y={tl.y} width={w} height={h}
              fill={`${color}12`} stroke={isSelected ? color : `${color}80`}
              strokeWidth={isSelected ? 2 : 1}
              strokeDasharray={obj.type.includes('Keepout') ? '4 2' : undefined}
              rx={2}
              style={{ cursor: 'pointer' }}
              onMouseDown={e => handleObjectMouseDown(e, obj)}
            />
            <text x={tl.x + w / 2} y={tl.y + h / 2} textAnchor="middle" dominantBaseline="middle"
              fontSize={Math.min(10, w / 6)} fill={color} pointerEvents="none">
              {obj.name}
            </text>
            {/* Dimension labels */}
            <text x={tl.x + w / 2} y={tl.y - 4} textAnchor="middle" fontSize={8} fill="#94a3b8" pointerEvents="none">
              {obj.widthMm}mm
            </text>
            <text x={tl.x + w + 4} y={tl.y + h / 2} textAnchor="start" fontSize={8} fill="#94a3b8" pointerEvents="none"
              transform={`rotate(90, ${tl.x + w + 4}, ${tl.y + h / 2})`}>
              {obj.heightMm}mm
            </text>
            {/* Resize handles */}
            {isSelected && !obj.locked && (
              <>
                <rect x={tl.x + w - 4} y={tl.y + h - 4} width={8} height={8} fill="white" stroke={color}
                  strokeWidth={1.5} rx={1} style={{ cursor: 'se-resize' }}
                  onMouseDown={e => handleResizeHandleMouseDown(e, obj, 'se')}
                />
              </>
            )}
          </g>
        );
      })}

      {/* Scale indicator */}
      <g transform={`translate(20, ${svgRef.current?.clientHeight ? svgRef.current.clientHeight - 30 : 570})`}>
        <line x1={0} y1={0} x2={10 * view.scale} y2={0} stroke="#64748b" strokeWidth={1} />
        <line x1={0} y1={-3} x2={0} y2={3} stroke="#64748b" strokeWidth={1} />
        <line x1={10 * view.scale} y1={-3} x2={10 * view.scale} y2={3} stroke="#64748b" strokeWidth={1} />
        <text x={5 * view.scale} y={-6} textAnchor="middle" fontSize={9} fill="#64748b">10mm</text>
      </g>
    </svg>
  );
};
