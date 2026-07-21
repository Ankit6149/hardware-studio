import React, { useRef, useCallback, useMemo } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { BoardDesignerUIState } from './boardInteraction';
import {
  mmToSvg, svgToMm, snapToGrid as snapCoordinateToGrid,
  getOutlineBounds, getNetRatsnestLines,
  getComponentPads, getNearestPad
} from './boardGeometry';
import { getFootprint } from '../../lib/footprints';
import { ReviewResult, Project } from '../../types';

import { useState } from 'react';
import {
  resolvePCBAnchor,
  validateRouteStartAnchor,
  validateRouteFinishAnchor,
  PCBAnchor
} from '../../lib/pcb/pcbRoutingEngine';

interface BoardCanvasProps {
  viewState: BoardDesignerUIState;
  onViewStateChange: (patch: Partial<BoardDesignerUIState>) => void;
  drcResults: ReviewResult[];
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({ viewState, onViewStateChange, drcResults }) => {
  const store = useProjectStore();
  const {
    boardOutlines, boardComponents, traces, vias, drillHoles, keepoutZones,
    nets, padNetAssignments,
    updatePCBPlacement, addTrace, addVia, addDrillHole, addKeepoutZone,
  } = store;
  const [domainError, setDomainError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const { zoom, panX, panY, gridSizeMm, activeTool,
    selectedComponentId, selectedTraceId, selectedViaId, selectedDrillHoleId, selectedKeepoutId,
    selectedNetName, showRatsnest, showDRC,
    routePreviewPoints, isRouting, layerVisibility } = viewState;

  const selectedObjectId =
    selectedComponentId || selectedTraceId || selectedViaId || selectedDrillHoleId || selectedKeepoutId;
  const selectedObjectType =
    selectedComponentId ? 'component' :
    selectedTraceId ? 'trace' :
    selectedViaId ? 'via' :
    selectedDrillHoleId ? 'drill' :
    selectedKeepoutId ? 'keepout' : null;

  const activeBoardId = viewState.activeBoardId || 'board-main';

  const filteredOutlines = useMemo(() => {
    return (boardOutlines || []).filter(o => o.boardId === activeBoardId);
  }, [boardOutlines, activeBoardId]);

  const filteredComponents = useMemo(() => {
    return (boardComponents || []).filter(c => c.boardId === activeBoardId);
  }, [boardComponents, activeBoardId]);

  const filteredTraces = useMemo(() => {
    return (traces || []).filter(t => t.boardId === activeBoardId);
  }, [traces, activeBoardId]);

  const filteredVias = useMemo(() => {
    return (vias || []).filter(v => v.boardId === activeBoardId);
  }, [vias, activeBoardId]);

  const filteredDrills = useMemo(() => {
    return (drillHoles || []).filter(d => d.boardId === activeBoardId);
  }, [drillHoles, activeBoardId]);

  const filteredKeepouts = useMemo(() => {
    return (keepoutZones || []).filter(k => k.boardId === activeBoardId);
  }, [keepoutZones, activeBoardId]);

  const outline = filteredOutlines[0] || (boardOutlines || [])[0];
  
  const bounds = useMemo(() => {
    return outline ? getOutlineBounds(outline) : { minX: 0, minY: 0, maxX: 50, maxY: 30 };
  }, [outline]);

  // SVG viewBox dimensions (add padding)
  const pad = 10;

  // Coordinate converters
  const screenToBoard = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = clientX - rect.left;
    const svgY = clientY - rect.top;
    let mmX = svgToMm(svgX - panX, zoom) + bounds.minX - pad;
    let mmY = svgToMm(svgY - panY, zoom) + bounds.minY - pad;
    if (viewState.snapToGrid) {
      mmX = snapCoordinateToGrid(mmX, gridSizeMm);
      mmY = snapCoordinateToGrid(mmY, gridSizeMm);
    }
    return { x: mmX, y: mmY };
  }, [zoom, panX, panY, bounds.minX, bounds.minY, viewState.snapToGrid, gridSizeMm]);

  const bx = useCallback((mm: number) => mmToSvg(mm - bounds.minX + pad, zoom) + panX, [bounds.minX, zoom, panX]);
  const by = useCallback((mm: number) => mmToSvg(mm - bounds.minY + pad, zoom) + panY, [bounds.minY, zoom, panY]);
  const bs = useCallback((mm: number) => mmToSvg(mm, zoom), [zoom]);

  // ── Mouse handlers ───────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const componentId = e.dataTransfer.getData('application/hardware-studio-component');
    if (!componentId) return;

    const pt = screenToBoard(e.clientX, e.clientY);
    const currentActiveBoardId = viewState.activeBoardId || 'board-main';

    updatePCBPlacement(componentId, {
      boardId: currentActiveBoardId,
      placementX: pt.x,
      placementY: pt.y,
      placementStatus: 'Needs Review',
      side: 'Top'
    });

    onViewStateChange({
      selectedComponentId: componentId,
      selectedTraceId: null,
      selectedViaId: null,
      selectedDrillHoleId: null,
      selectedKeepoutId: null,
    });
  }, [screenToBoard, viewState.activeBoardId, updatePCBPlacement, onViewStateChange]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newZoom = Math.max(2, Math.min(40, zoom + delta));
    onViewStateChange({ zoom: newZoom });
  }, [zoom, onViewStateChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDomainError(null);
    if (e.button === 1 || (e.button === 0 && (e.altKey || activeTool === 'pan'))) {
      isPanning.current = true;
      panStart.current = { x: e.clientX - panX, y: e.clientY - panY };
      return;
    }

    const currentActiveBoardId = viewState.activeBoardId || 'board-main';
    const pt = screenToBoard(e.clientX, e.clientY);

    // Resolve anchor at pointer position
    const anchor = resolvePCBAnchor(
      pt,
      boardComponents || [],
      padNetAssignments || [],
      vias || [],
      traces || [],
      currentActiveBoardId,
      viewState.activeLayerId || 'top-copper'
    );

    if (activeTool === 'route') {
      if (!isRouting) {
        // Validate route start anchor
        const validation = validateRouteStartAnchor(anchor, selectedNetName || undefined);
        if (!validation.valid) {
          setDomainError(validation.error || 'Cannot start route');
          return;
        }
        const netToUse = anchor?.netName || selectedNetName;
        onViewStateChange({
          isRouting: true,
          routePreviewPoints: [{ x: anchor!.xMm, y: anchor!.yMm }],
          selectedNetName: netToUse || null
        });
      } else {
        // Adding route vertex
        if (anchor && anchor.netName && anchor.netName !== selectedNetName) {
          setDomainError(`Wrong Net Connection Rejected! Target belongs to net '${anchor.netName}', but active route is '${selectedNetName}'.`);
          return;
        }
        const nextPt = anchor ? { x: anchor.xMm, y: anchor.yMm } : pt;
        onViewStateChange({
          routePreviewPoints: [...(routePreviewPoints || []), nextPt],
        });
      }
      return;
    }

    if (activeTool === 'via' && selectedNetName) {
      addVia({
        boardId: currentActiveBoardId,
        x: pt.x,
        y: pt.y,
        drillDiameter: 0.3,
        outerDiameter: 0.6,
        netId: (nets || []).find(n => n.netName === selectedNetName)?.id,
        fromLayer: 'top-copper',
        toLayer: 'bottom-copper',
      });
      return;
    }

    if (activeTool === 'drill') {
      addDrillHole({
        boardId: currentActiveBoardId,
        x: pt.x,
        y: pt.y,
        diameter: 1.0,
        plated: false,
        purpose: 'Mounting Hole',
      });
      return;
    }

    if (activeTool === 'keepout') {
      if (typeof addKeepoutZone === 'function') {
        addKeepoutZone({
          boardId: currentActiveBoardId,
          x: pt.x - 3,
          y: pt.y - 2,
          width: 6,
          height: 4,
          shape: 'rect',
          layerScope: 'All',
          reason: 'User Keepout',
        });
      }
      return;
    }

    // Select mode
    if (activeTool === 'select' || activeTool === 'place-component') {
      // Check if click is on a component
      const comps = boardComponents || [];
      for (const comp of comps) {
        if (comp.placementX == null || comp.placementY == null) continue;
        const fp = getFootprint(comp.footprint);
        const hw = fp.courtyardWidthMm / 2;
        const hh = fp.courtyardHeightMm / 2;
        if (Math.abs(pt.x - comp.placementX) <= hw && Math.abs(pt.y - comp.placementY) <= hh) {
          onViewStateChange({
            selectedComponentId: comp.id,
            selectedTraceId: null,
            selectedViaId: null,
            selectedDrillHoleId: null,
            selectedKeepoutId: null,
          });
          return;
        }
      }
      // Check vias
      for (const via of (vias || [])) {
        if (via.x != null && via.y != null) {
          if (Math.hypot(pt.x - via.x, pt.y - via.y) < (via.outerDiameter || 0.6) / 2 + 0.3) {
            onViewStateChange({
              selectedViaId: via.id,
              selectedComponentId: null,
              selectedTraceId: null,
              selectedDrillHoleId: null,
              selectedKeepoutId: null,
            });
            return;
          }
        }
      }
      // Check drills
      for (const drill of (drillHoles || [])) {
        if (drill.x != null && drill.y != null) {
          if (Math.hypot(pt.x - drill.x, pt.y - drill.y) < (drill.diameter || 1.0) / 2 + 0.3) {
            onViewStateChange({
              selectedDrillHoleId: drill.id,
              selectedComponentId: null,
              selectedTraceId: null,
              selectedViaId: null,
              selectedKeepoutId: null,
            });
            return;
          }
        }
      }
      // Deselect
      onViewStateChange({
        selectedComponentId: null,
        selectedTraceId: null,
        selectedViaId: null,
        selectedDrillHoleId: null,
        selectedKeepoutId: null,
      });
    }
  }, [activeTool, selectedNetName, isRouting, routePreviewPoints, screenToBoard,
    panX, panY, onViewStateChange, boardComponents, vias, drillHoles, nets, addVia, addDrillHole, addKeepoutZone]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning.current) {
      onViewStateChange({
        panX: e.clientX - panStart.current.x,
        panY: e.clientY - panStart.current.y,
      });
      return;
    }

    const pt = screenToBoard(e.clientX, e.clientY);
    onViewStateChange({ mouseXMm: pt.x, mouseYMm: pt.y });

    // Component dragging
    if ((activeTool === 'select' || activeTool === 'place-component') && selectedObjectId && selectedObjectType === 'component' && e.buttons === 1) {
      updatePCBPlacement(selectedObjectId, {
        placementX: pt.x,
        placementY: pt.y,
        placementStatus: 'Placed',
      });
    }
  }, [screenToBoard, activeTool, selectedObjectId, selectedObjectType, onViewStateChange, updatePCBPlacement]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleFinishDangling = useCallback(() => {
    if (isRouting && routePreviewPoints && routePreviewPoints.length >= 1 && selectedNetName) {
      const currentActiveBoardId = viewState.activeBoardId || 'board-main';
      const lastPt = routePreviewPoints[routePreviewPoints.length - 1];

      addTrace({
        boardId: currentActiveBoardId,
        layerId: viewState.activeLayerId || 'top-copper',
        netId: (nets || []).find(n => n.netName === selectedNetName)?.id,
        netName: selectedNetName,
        points: routePreviewPoints,
        width: selectedNetName.toLowerCase().includes('gnd') || selectedNetName.toLowerCase().includes('vbat') ? 0.3 : 0.15,
        status: 'Draft',
        targetAnchor: {
          type: 'dangling',
          xMm: lastPt.x,
          yMm: lastPt.y
        }
      });

      onViewStateChange({ isRouting: false, routePreviewPoints: [] });
    }
  }, [isRouting, routePreviewPoints, selectedNetName, viewState.activeBoardId, viewState.activeLayerId, addTrace, nets, onViewStateChange]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (isRouting && routePreviewPoints && routePreviewPoints.length >= 1 && selectedNetName) {
      const currentActiveBoardId = viewState.activeBoardId || 'board-main';
      const pt = screenToBoard(e.clientX, e.clientY);

      const targetAnchor = resolvePCBAnchor(
        pt,
        boardComponents || [],
        padNetAssignments || [],
        vias || [],
        traces || [],
        currentActiveBoardId,
        viewState.activeLayerId || 'top-copper'
      );

      const validation = validateRouteFinishAnchor(selectedNetName, targetAnchor);
      if (!validation.valid) {
        setDomainError(validation.error || 'Invalid route finish anchor.');
        return;
      }

      const finishAnchor = validation.targetAnchor!;
      const finishPt = { x: finishAnchor.xMm, y: finishAnchor.yMm };
      const allPoints = [...routePreviewPoints, finishPt];

      addTrace({
        boardId: currentActiveBoardId,
        layerId: viewState.activeLayerId || 'top-copper',
        netId: (nets || []).find(n => n.netName === selectedNetName)?.id,
        netName: selectedNetName,
        points: allPoints,
        width: selectedNetName.toLowerCase().includes('gnd') || selectedNetName.toLowerCase().includes('vbat') ? 0.3 : 0.15,
        status: 'Routed',
        targetAnchor: finishAnchor
      });

      onViewStateChange({ isRouting: false, routePreviewPoints: [] });
    }
  }, [isRouting, routePreviewPoints, selectedNetName, screenToBoard, boardComponents, padNetAssignments, vias, traces, viewState.activeBoardId, viewState.activeLayerId, addTrace, nets, onViewStateChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onViewStateChange({ isRouting: false, routePreviewPoints: [], activeTool: 'select' });
    }
    // Rotate 90 degrees
    if (e.key === 'r' && selectedObjectId && selectedObjectType === 'component') {
      const comp = (boardComponents || []).find(c => c.id === selectedObjectId);
      if (comp) {
        updatePCBPlacement(selectedObjectId, {
          rotationDeg: ((comp.rotationDeg || 0) + 90) % 360,
        });
      }
    }
    // Flip side
    if (e.key === 'f' && selectedObjectId && selectedObjectType === 'component') {
      const comp = (boardComponents || []).find(c => c.id === selectedObjectId);
      if (comp) {
        updatePCBPlacement(selectedObjectId, {
          side: comp.side === 'Bottom' ? 'Top' : 'Bottom',
        });
      }
    }
    // Ctrl/Cmd + S
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      alert('Board design saved! Layout state persisted.');
    }
    // Delete layout object
    if (e.key === 'Delete' && selectedObjectId) {
      if (selectedObjectType === 'component') {
        updatePCBPlacement(selectedObjectId, {
          placementX: undefined,
          placementY: undefined,
          placementStatus: 'Unplaced',
        });
      } else if (selectedObjectType === 'trace') {
        const { deleteTrace } = useProjectStore.getState();
        if (typeof deleteTrace === 'function') deleteTrace(selectedObjectId);
      } else if (selectedObjectType === 'via') {
        const { deleteVia } = useProjectStore.getState();
        if (typeof deleteVia === 'function') deleteVia(selectedObjectId);
      } else if (selectedObjectType === 'drill') {
        const { deleteDrillHole } = useProjectStore.getState();
        if (typeof deleteDrillHole === 'function') deleteDrillHole(selectedObjectId);
      } else if (selectedObjectType === 'keepout') {
        const { deleteKeepoutZone } = useProjectStore.getState();
        if (typeof deleteKeepoutZone === 'function') deleteKeepoutZone(selectedObjectId);
      }
      onViewStateChange({
        selectedComponentId: null,
        selectedTraceId: null,
        selectedViaId: null,
        selectedDrillHoleId: null,
        selectedKeepoutId: null,
      });
    }
    // Nudge with Arrow keys (Shift for 5x nudge)
    const nudge = e.shiftKey ? gridSizeMm * 5 : gridSizeMm;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedObjectId && selectedObjectType === 'component') {
      const comp = (boardComponents || []).find(c => c.id === selectedObjectId);
      if (comp && comp.placementX != null && comp.placementY != null) {
        const dx = e.key === 'ArrowRight' ? nudge : e.key === 'ArrowLeft' ? -nudge : 0;
        const dy = e.key === 'ArrowDown' ? nudge : e.key === 'ArrowUp' ? -nudge : 0;
        updatePCBPlacement(selectedObjectId, {
          placementX: comp.placementX + dx,
          placementY: comp.placementY + dy,
        });
        e.preventDefault();
      }
    }
  }, [selectedObjectId, selectedObjectType, boardComponents, updatePCBPlacement, gridSizeMm, onViewStateChange]);

  // ── Ratsnest lines (memoized) ────────────────────────────
  const ratsnestLines = useMemo(() => {
    if (!showRatsnest) return [];
    const project = { boardComponents: filteredComponents, traces: filteredTraces, nets, padNetAssignments };
    return getNetRatsnestLines(project as unknown as Project);
  }, [showRatsnest, filteredComponents, filteredTraces, nets, padNetAssignments]);

  // ── Grid dots ────────────────────────────────────────────
  const gridDots = useMemo(() => {
    const dots: { cx: number; cy: number }[] = [];
    const step = gridSizeMm;
    // Limit dots for perf
    const maxDots = 2000;
    let count = 0;
    for (let x = bounds.minX; x <= bounds.maxX && count < maxDots; x += step) {
      for (let y = bounds.minY; y <= bounds.maxY && count < maxDots; y += step) {
        dots.push({ cx: bx(x), cy: by(y) });
        count++;
      }
    }
    return dots;
  }, [bounds, gridSizeMm, bx, by]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {domainError && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#7f1d1d',
            color: '#fca5a5',
            padding: '8px 16px',
            borderRadius: 6,
            border: '1px solid #ef4444',
            fontSize: 12,
            fontWeight: 600,
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <span>⚠️ {domainError}</span>
          <button
            onClick={() => setDomainError(null)}
            style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {isRouting && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 90,
            display: 'flex',
            gap: 8
          }}
        >
          <button
            onClick={handleFinishDangling}
            style={{
              backgroundColor: '#0284c7',
              color: 'white',
              padding: '6px 12px',
              borderRadius: 4,
              border: 'none',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}
          >
            Finish as Dangling Draft
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        className="w-full h-full bg-slate-950 cursor-crosshair select-none outline-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        tabIndex={0}
        style={{ minHeight: '100%' }}
      >
        {/* Grid dots */}
        {gridDots.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={0.5} fill="#334155" opacity={0.5} />
        ))}

        {/* Board outline */}
        {outline && outline.points && outline.points.length >= 3 && (
          <polygon
            points={outline.points.map(p => `${bx(p.x)},${by(p.y)}`).join(' ')}
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth={1.5}
            opacity={0.9}
          />
        )}
        {outline && (!outline.points || outline.points.length < 3) && outline.width && outline.height && (
          <rect
            x={bx(0)} y={by(0)}
            width={bs(outline.width)} height={bs(outline.height)}
            fill="#0f172a"
            stroke="#38bdf8"
            strokeWidth={1.5}
          />
        )}

        {/* Origin marker */}
        <line x1={bx(0) - 8} y1={by(0)} x2={bx(0) + 8} y2={by(0)} stroke="#ef4444" strokeWidth={1} opacity={0.6} />
        <line x1={bx(0)} y1={by(0) - 8} x2={bx(0)} y2={by(0) + 8} stroke="#ef4444" strokeWidth={1} opacity={0.6} />

        {/* Keepouts */}
        {layerVisibility['keepouts'] && filteredKeepouts.map(zone => {
          const isSelected = selectedKeepoutId === zone.id;
          return (
            <g key={zone.id} onClick={(e) => {
              e.stopPropagation();
              onViewStateChange({
                selectedKeepoutId: zone.id,
                selectedComponentId: null,
                selectedTraceId: null,
                selectedViaId: null,
                selectedDrillHoleId: null,
              });
            }} className="cursor-pointer">
              <rect
                x={bx(zone.x)} y={by(zone.y)}
                width={bs(zone.width)} height={bs(zone.height)}
                fill="#ef4444" opacity={isSelected ? 0.25 : 0.12}
                stroke="#ef4444" strokeWidth={isSelected ? 1.5 : 1} strokeDasharray="4,2"
              />
              <text x={bx(zone.x) + 3} y={by(zone.y) + 10} fill="#ef4444" fontSize={8} opacity={0.7}>
                {zone.reason}
              </text>
            </g>
          );
        })}

        {/* Traces */}
        {filteredTraces.map(trace => {
          if (!trace.points || trace.points.length < 2) return null;
          const layerId = trace.layerId || 'top-copper';
          const isVisible = layerVisibility[layerId] !== false;
          if (!isVisible) return null;

          const isActive = viewState.activeLayerId === layerId;
          const isHighlighted = selectedNetName && trace.netName === selectedNetName;
          const isSelected = selectedObjectId === trace.id;

          let strokeColor = layerId === 'bottom-copper' ? '#3b82f6' : '#22c55e';
          if (isHighlighted) strokeColor = '#22d3ee';
          else if (isSelected) strokeColor = '#f59e0b';

          const opacity = isSelected || isHighlighted ? 1 : isActive ? 0.85 : 0.25;

          return (
            <polyline
              key={trace.id}
              points={trace.points.map(p => `${bx(p.x)},${by(p.y)}`).join(' ')}
              fill="none"
              stroke={strokeColor}
              strokeWidth={bs(trace.width || 0.15)}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
              onClick={(e) => {
                e.stopPropagation();
                onViewStateChange({
                  selectedTraceId: trace.id,
                  selectedComponentId: null,
                  selectedViaId: null,
                  selectedDrillHoleId: null,
                  selectedKeepoutId: null,
                });
              }}
              className="cursor-pointer"
            />
          );
        })}

        {/* Route Preview */}
        {isRouting && routePreviewPoints && routePreviewPoints.length > 0 && (
          <polyline
            points={[...routePreviewPoints, { x: viewState.mouseXMm, y: viewState.mouseYMm }]
              .map(p => `${bx(p.x)},${by(p.y)}`).join(' ')}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={bs(0.15)}
            strokeDasharray="3,2"
            strokeLinecap="round"
            opacity={0.8}
          />
        )}

        {/* Vias */}
        {layerVisibility['drill'] && filteredVias.map(via => {
          if (via.x == null || via.y == null) return null;
          const isSelected = selectedObjectId === via.id;
          return (
            <g key={via.id} onClick={(e) => {
              e.stopPropagation();
              onViewStateChange({
                selectedViaId: via.id,
                selectedComponentId: null,
                selectedTraceId: null,
                selectedDrillHoleId: null,
                selectedKeepoutId: null,
              });
            }} className="cursor-pointer">
              <circle cx={bx(via.x)} cy={by(via.y)} r={bs((via.outerDiameter || 0.6) / 2)} fill="#1e293b" stroke={isSelected ? '#f59e0b' : '#8b5cf6'} strokeWidth={1.2} />
              <circle cx={bx(via.x)} cy={by(via.y)} r={bs((via.drillDiameter || 0.3) / 2)} fill="#0f172a" />
            </g>
          );
        })}

        {/* Drill holes */}
        {layerVisibility['drill'] && filteredDrills.map(drill => {
          if (drill.x == null || drill.y == null) return null;
          const isSelected = selectedObjectId === drill.id;
          return (
            <g key={drill.id} onClick={(e) => {
              e.stopPropagation();
              onViewStateChange({
                selectedDrillHoleId: drill.id,
                selectedComponentId: null,
                selectedTraceId: null,
                selectedViaId: null,
                selectedKeepoutId: null,
              });
            }} className="cursor-pointer">
              <circle cx={bx(drill.x)} cy={by(drill.y)} r={bs((drill.diameter || 1.0) / 2)} fill="none" stroke={isSelected ? '#f59e0b' : '#94a3b8'} strokeWidth={1} />
              <line x1={bx(drill.x) - 3} y1={by(drill.y)} x2={bx(drill.x) + 3} y2={by(drill.y)} stroke="#94a3b8" strokeWidth={0.5} />
              <line x1={bx(drill.x)} y1={by(drill.y) - 3} x2={bx(drill.x)} y2={by(drill.y) + 3} stroke="#94a3b8" strokeWidth={0.5} />
            </g>
          );
        })}

        {/* Components */}
        {filteredComponents.map(comp => {
          if (comp.placementX == null || comp.placementY == null) return null;
          const fp = getFootprint(comp.footprint);
          const isSelected = selectedObjectId === comp.id;
          const isNetHighlighted = selectedNetName && (padNetAssignments || []).some(
            a => a.componentId === comp.id && a.netName === selectedNetName
          );
          const rot = comp.rotationDeg || 0;

          return (
            <g
              key={comp.id}
              transform={`translate(${bx(comp.placementX)}, ${by(comp.placementY)}) rotate(${rot})`}
              onClick={(e) => {
                e.stopPropagation();
                onViewStateChange({
                  selectedComponentId: comp.id,
                  selectedTraceId: null,
                  selectedViaId: null,
                  selectedDrillHoleId: null,
                  selectedKeepoutId: null,
                });
              }}
              className="cursor-pointer"
            >
              <rect
                x={-bs(fp.courtyardWidthMm / 2)} y={-bs(fp.courtyardHeightMm / 2)}
                width={bs(fp.courtyardWidthMm)} height={bs(fp.courtyardHeightMm)}
                fill="none" stroke={isSelected ? '#f59e0b' : '#475569'}
                strokeWidth={0.5} strokeDasharray={comp.side === 'Bottom' ? '2,2' : isSelected ? 'none' : '2,1'} opacity={comp.side === 'Bottom' ? 0.35 : 0.5}
              />
              <rect
                x={-bs(fp.bodyWidthMm / 2)} y={-bs(fp.bodyHeightMm / 2)}
                width={bs(fp.bodyWidthMm)} height={bs(fp.bodyHeightMm)}
                fill={isSelected ? '#1e3a5f' : isNetHighlighted ? '#1a2e4a' : '#1e293b'}
                stroke={isSelected ? '#f59e0b' : isNetHighlighted ? '#22d3ee' : '#64748b'}
                strokeWidth={isSelected ? 1.5 : 1}
                strokeDasharray={comp.side === 'Bottom' ? '3,3' : 'none'}
                rx={bs(0.2)}
              />
              {fp.pads.map((pad, pi) => {
                const padXMm = comp.side === 'Bottom' ? -pad.xMm : pad.xMm;
                return (
                  <rect
                    key={pi}
                    x={bs(padXMm) - bs(pad.widthMm / 2)}
                    y={bs(pad.yMm) - bs(pad.heightMm / 2)}
                    width={bs(pad.widthMm)}
                    height={bs(pad.heightMm)}
                    fill={isNetHighlighted ? '#22d3ee' : comp.side === 'Bottom' ? '#3b82f6' : '#c084fc'}
                    opacity={comp.side === 'Bottom' ? 0.6 : 0.8}
                    rx={bs(0.05)}
                  />
                );
              })}
              <circle
                cx={bs((comp.side === 'Bottom' ? -1 : 1) * (fp.pads[0]?.xMm || -fp.bodyWidthMm / 2 + 0.3))}
                cy={bs(fp.pads[0]?.yMm || -fp.bodyHeightMm / 2 + 0.3)}
                r={bs(0.15)}
                fill="#ef4444"
              />
              {zoom >= 5 && (
                <text
                  x={0} y={bs(fp.courtyardHeightMm / 2) + 8}
                  fill={isSelected ? '#fbbf24' : '#94a3b8'}
                  fontSize={Math.max(7, Math.min(10, zoom))}
                  textAnchor="middle"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {comp.referenceDesignator}
                </text>
              )}
            </g>
          );
        })}

        {/* Ratsnest */}
        {showRatsnest && ratsnestLines.map((line, i) => {
          const isHighlighted = selectedNetName && line.netName === selectedNetName;
          return (
            <line
              key={`rat_${i}`}
              x1={bx(line.x1)} y1={by(line.y1)}
              x2={bx(line.x2)} y2={by(line.y2)}
              stroke={isHighlighted ? '#22d3ee' : '#475569'}
              strokeWidth={isHighlighted ? 1.2 : 0.6}
              strokeDasharray="3,3"
              opacity={isHighlighted ? 0.9 : 0.4}
            />
          );
        })}

        {/* Coordinate readout */}
        <text x={10} y={20} fill="#94a3b8" fontSize={10} fontFamily="monospace">
          {viewState.mouseXMm.toFixed(2)}, {viewState.mouseYMm.toFixed(2)} mm | Grid: {gridSizeMm}mm | Zoom: {zoom}x | Board: {viewState.activeBoardId || 'board-main'}
        </text>
        {selectedNetName && (
          <text x={10} y={34} fill="#22d3ee" fontSize={10} fontFamily="monospace">
            Net: {selectedNetName}
          </text>
        )}
        {isRouting && (
          <text x={10} y={48} fill="#fbbf24" fontSize={10} fontFamily="monospace">
            ROUTING — Click target pad/via to route, use Finish as Dangling Draft, Esc to cancel
          </text>
        )}
      </svg>
    </div>
  );
};
