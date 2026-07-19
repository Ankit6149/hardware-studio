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

interface BoardCanvasProps {
  viewState: BoardDesignerUIState;
  onViewStateChange: (patch: Partial<BoardDesignerUIState>) => void;
  drcResults: ReviewResult[];
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({ viewState, onViewStateChange, drcResults }) => {
  const {
    boardOutlines, boardComponents, traces, vias, drillHoles, keepoutZones,
    nets, padNetAssignments,
    updateBoardComponent, addTrace, addVia, addDrillHole, addKeepoutZone,
  } = useProjectStore();
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
    const primaryBoardId = viewState.activeBoardId || 'board-main';

    updateBoardComponent(componentId, {
      boardId: primaryBoardId,
      placementX: pt.x,
      placementY: pt.y,
      placementStatus: 'Needs Review',
      pcb: {
        placed: true,
        xMm: pt.x,
        yMm: pt.y,
        side: 'Top',
        locked: false,
        placementStatus: 'Needs Review',
      }
    });

    onViewStateChange({
      selectedComponentId: componentId,
      selectedTraceId: null,
      selectedViaId: null,
      selectedDrillHoleId: null,
      selectedKeepoutId: null,
    });
  }, [screenToBoard, viewState.activeBoardId, updateBoardComponent, onViewStateChange]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newZoom = Math.max(2, Math.min(40, zoom + delta));
    onViewStateChange({ zoom: newZoom });
  }, [zoom, onViewStateChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && (e.altKey || activeTool === 'pan'))) {
      isPanning.current = true;
      panStart.current = { x: e.clientX - panX, y: e.clientY - panY };
      return;
    }

    // Find all pads for snap routing
    const allPads = (boardComponents || []).flatMap(comp => {
      if (comp.placementX == null || comp.placementY == null) return [];
      return getComponentPads(comp).map(p => ({
        ...p,
        netName: (padNetAssignments || []).find(a => a.componentId === comp.id && a.padName === p.padName)?.netName || ''
      }));
    });

    let pt = screenToBoard(e.clientX, e.clientY);
    const nearestPad = getNearestPad(pt, allPads, 1.2);
    if (nearestPad) {
      pt = { x: nearestPad.x, y: nearestPad.y };
    }

    if (activeTool === 'route') {
      let netToUse = selectedNetName;
      if (!isRouting) {
        if (nearestPad && nearestPad.netName) {
          netToUse = nearestPad.netName;
        }
        if (!netToUse) {
          alert("Click on a pad assigned to a net or select a net in the Nets panel first.");
          return;
        }
        onViewStateChange({
          isRouting: true,
          routePreviewPoints: [pt],
          selectedNetName: netToUse
        });
      } else {
        if (nearestPad && nearestPad.netName && nearestPad.netName !== selectedNetName) {
          alert(`Wrong Net Connection Rejected!\nThis pad belongs to net '${nearestPad.netName}', but active route is '${selectedNetName}'.`);
          return;
        }
        onViewStateChange({
          routePreviewPoints: [...(routePreviewPoints || []), pt],
        });
      }
      return;
    }

    if (activeTool === 'via' && selectedNetName) {
      const primaryBoard = (useProjectStore.getState().boards || [])[0];
      addVia({
        boardId: primaryBoard?.id || 'board-main',
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
      const primaryBoard = (useProjectStore.getState().boards || [])[0];
      addDrillHole({
        boardId: primaryBoard?.id || 'board-main',
        x: pt.x,
        y: pt.y,
        diameter: 1.0,
        plated: false,
        purpose: 'Mounting Hole',
      });
      return;
    }

    if (activeTool === 'keepout') {
      const primaryBoard = (useProjectStore.getState().boards || [])[0];
      if (typeof addKeepoutZone === 'function') {
        addKeepoutZone({
          boardId: primaryBoard?.id || 'board-main',
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
      updateBoardComponent(selectedObjectId, {
        placementX: pt.x,
        placementY: pt.y,
        placementStatus: 'Placed',
      });
    }
  }, [screenToBoard, activeTool, selectedObjectId, selectedObjectType, onViewStateChange, updateBoardComponent]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (isRouting && routePreviewPoints && routePreviewPoints.length >= 1 && selectedNetName) {
      // Find all pads for snap routing
      const allPads = (boardComponents || []).flatMap(comp => {
        if (comp.placementX == null || comp.placementY == null) return [];
        return getComponentPads(comp).map(p => ({
          ...p,
          netName: (padNetAssignments || []).find(a => a.componentId === comp.id && a.padName === p.padName)?.netName || ''
        }));
      });

      let pt = screenToBoard(e.clientX, e.clientY);
      const nearestPad = getNearestPad(pt, allPads, 1.2);
      if (nearestPad) {
        if (nearestPad.netName && nearestPad.netName !== selectedNetName) {
          alert(`Wrong Net Connection Rejected!\nThis pad belongs to net '${nearestPad.netName}', but active route is '${selectedNetName}'.`);
          return;
        }
        pt = { x: nearestPad.x, y: nearestPad.y };
      }

      const allPoints = [...routePreviewPoints, pt];
      const activeBoard = activeBoardId;

      addTrace({
        boardId: activeBoard,
        layerId: viewState.activeLayerId || 'top-copper',
        netId: (nets || []).find(n => n.netName === selectedNetName)?.id,
        netName: selectedNetName,
        points: allPoints,
        width: selectedNetName.toLowerCase().includes('gnd') || selectedNetName.toLowerCase().includes('vbat') ? 0.3 : 0.15,
        status: 'Draft',
      });

      onViewStateChange({ isRouting: false, routePreviewPoints: [] });
    }
  }, [isRouting, routePreviewPoints, selectedNetName, screenToBoard, addTrace, nets, viewState.activeLayerId, onViewStateChange, boardComponents, padNetAssignments]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onViewStateChange({ isRouting: false, routePreviewPoints: [], activeTool: 'select' });
    }
    // Rotate 90 degrees
    if (e.key === 'r' && selectedObjectId && selectedObjectType === 'component') {
      const comp = (boardComponents || []).find(c => c.id === selectedObjectId);
      if (comp) {
        updateBoardComponent(selectedObjectId, {
          rotationDeg: ((comp.rotationDeg || 0) + 90) % 360,
        });
      }
    }
    // Flip side
    if (e.key === 'f' && selectedObjectId && selectedObjectType === 'component') {
      const comp = (boardComponents || []).find(c => c.id === selectedObjectId);
      if (comp) {
        updateBoardComponent(selectedObjectId, {
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
        updateBoardComponent(selectedObjectId, {
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
        updateBoardComponent(selectedObjectId, {
          placementX: comp.placementX + dx,
          placementY: comp.placementY + dy,
        });
        e.preventDefault();
      }
    }
  }, [selectedObjectId, selectedObjectType, boardComponents, updateBoardComponent, gridSizeMm, onViewStateChange]);

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
      {/* Grid */}
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

      {/* Keepout zones */}
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

        // Color based on layer: Top is green, Bottom is blue
        let strokeColor = layerId === 'bottom-copper' ? '#3b82f6' : '#22c55e';
        if (isHighlighted) strokeColor = '#22d3ee';
        else if (isSelected) strokeColor = '#f59e0b';

        // Opacity: lower if not the active layer
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

      {/* Route preview */}
      {isRouting && routePreviewPoints.length > 0 && (
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
            {/* Courtyard */}
            <rect
              x={-bs(fp.courtyardWidthMm / 2)} y={-bs(fp.courtyardHeightMm / 2)}
              width={bs(fp.courtyardWidthMm)} height={bs(fp.courtyardHeightMm)}
              fill="none" stroke={isSelected ? '#f59e0b' : '#475569'}
              strokeWidth={0.5} strokeDasharray={comp.side === 'Bottom' ? '2,2' : isSelected ? 'none' : '2,1'} opacity={comp.side === 'Bottom' ? 0.35 : 0.5}
            />
            {/* Body */}
            <rect
              x={-bs(fp.bodyWidthMm / 2)} y={-bs(fp.bodyHeightMm / 2)}
              width={bs(fp.bodyWidthMm)} height={bs(fp.bodyHeightMm)}
              fill={isSelected ? '#1e3a5f' : isNetHighlighted ? '#1a2e4a' : '#1e293b'}
              stroke={isSelected ? '#f59e0b' : isNetHighlighted ? '#22d3ee' : '#64748b'}
              strokeWidth={isSelected ? 1.5 : 1}
              strokeDasharray={comp.side === 'Bottom' ? '3,3' : 'none'}
              rx={bs(0.2)}
            />
            {/* Pads - mirrored X if side is Bottom */}
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
            {/* Pin 1 marker */}
            <circle
              cx={bs((comp.side === 'Bottom' ? -1 : 1) * (fp.pads[0]?.xMm || -fp.bodyWidthMm / 2 + 0.3))}
              cy={bs(fp.pads[0]?.yMm || -fp.bodyHeightMm / 2 + 0.3)}
              r={bs(0.15)}
              fill="#ef4444"
            />
            {/* RefDes label */}
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
            {/* Side indicator */}
            {comp.side === 'Bottom' && zoom >= 6 && (
              <text x={0} y={-bs(fp.courtyardHeightMm / 2) - 3} fill="#f97316" fontSize={6} textAnchor="middle" fontFamily="monospace">BOT</text>
            )}
            {/* Lock indicator */}
            {comp.lockedPlacement && (
              <text x={bs(fp.courtyardWidthMm / 2) + 2} y={-bs(fp.courtyardHeightMm / 2) + 6} fill="#f59e0b" fontSize={8}>🔒</text>
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

      {/* DRC markers */}
      {showDRC && drcResults.filter(r => r.severity === 'Error' || r.severity === 'Blocker').slice(0, 30).map((r, i) => {
        // Try to get a location from linked object
        let mx: number | null = null, my: number | null = null;
        if (r.linkedObjectType === 'component') {
          const comp = (boardComponents || []).find(c => c.id === r.linkedObjectId);
          if (comp?.placementX != null) { mx = comp.placementX; my = comp.placementY!; }
        } else if (r.linkedObjectType === 'via') {
          const via = (vias || []).find(v => v.id === r.linkedObjectId);
          if (via?.x != null) { mx = via.x; my = via.y!; }
        } else if (r.linkedObjectType === 'drill') {
          const drill = (drillHoles || []).find(d => d.id === r.linkedObjectId);
          if (drill?.x != null) { mx = drill.x; my = drill.y!; }
        }
        if (mx == null || my == null) return null;
        return (
          <g key={`drc_${i}`}>
            <circle cx={bx(mx)} cy={by(my)} r={6} fill="none" stroke="#ef4444" strokeWidth={1.5} opacity={0.8} />
            <text x={bx(mx) + 8} y={by(my) - 2} fill="#fca5a5" fontSize={7} fontFamily="monospace">{r.title.slice(0, 25)}</text>
          </g>
        );
      })}

      {/* Coordinate readout */}
      <text x={10} y={20} fill="#94a3b8" fontSize={10} fontFamily="monospace">
        {viewState.mouseXMm.toFixed(2)}, {viewState.mouseYMm.toFixed(2)} mm | Grid: {gridSizeMm}mm | Zoom: {zoom}x
      </text>
      {selectedNetName && (
        <text x={10} y={34} fill="#22d3ee" fontSize={10} fontFamily="monospace">
          Net: {selectedNetName}
        </text>
      )}
      {isRouting && (
        <text x={10} y={48} fill="#fbbf24" fontSize={10} fontFamily="monospace">
          ROUTING — Click to add points, double-click to finish, Esc to cancel
        </text>
      )}
    </svg>
  );
};
