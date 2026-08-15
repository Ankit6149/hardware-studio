import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { BoardDesignerUIState } from './boardInteraction';
import {
  mmToSvg,
  svgToMm,
  snapToGrid as snapCoordinateToGrid,
  getOutlineBounds,
  getNetRatsnestLines,
  generateGroundPourPolygon,
} from './boardGeometry';
import { getFootprint } from '../../lib/footprints';
import { ReviewResult, Project } from '../../types';
import {
  resolvePCBAnchor,
  validateRouteStartAnchor,
  validateRouteFinishAnchor,
} from '../../lib/pcb/pcbRoutingEngine';
import { useFeedback } from '../feedback/FeedbackProvider';

interface BoardCanvasProps {
  viewState: BoardDesignerUIState;
  onViewStateChange: (patch: Partial<BoardDesignerUIState>) => void;
  drcResults: ReviewResult[];
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({ viewState, onViewStateChange, drcResults }) => {
  const store = useProjectStore();
  const { notify } = useFeedback();
  const {
    boards,
    boardOutlines,
    boardComponents,
    traces,
    vias,
    drillHoles,
    keepoutZones,
    nets,
    padNetAssignments,
    updatePCBPlacement,
    addTrace,
    addVia,
    addDrillHole,
    addKeepoutZone,
  } = store;
  const [domainError, setDomainError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const {
    zoom,
    panX,
    panY,
    gridSizeMm,
    activeTool,
    selectedComponentId,
    selectedTraceId,
    selectedViaId,
    selectedDrillHoleId,
    selectedKeepoutId,
    selectedNetName,
    showRatsnest,
    showDRC,
    routePreviewPoints,
    isRouting,
    layerVisibility,
  } = viewState;

  const selectedObjectId = selectedComponentId
    || selectedTraceId
    || selectedViaId
    || selectedDrillHoleId
    || selectedKeepoutId;
  const selectedObjectType = selectedComponentId
    ? 'component'
    : selectedTraceId
      ? 'trace'
      : selectedViaId
        ? 'via'
        : selectedDrillHoleId
          ? 'drill'
          : selectedKeepoutId
            ? 'keepout'
            : null;

  const activeBoardId = viewState.activeBoardId;
  const activeBoardName = useMemo(
    () => (boards || []).find((board) => board.id === activeBoardId)?.name,
    [boards, activeBoardId],
  );

  const filteredOutlines = useMemo(
    () => (boardOutlines || []).filter((outline) => outline.boardId === activeBoardId),
    [boardOutlines, activeBoardId],
  );
  const filteredComponents = useMemo(
    () => (boardComponents || []).filter((component) => component.boardId === activeBoardId),
    [boardComponents, activeBoardId],
  );
  const filteredTraces = useMemo(
    () => (traces || []).filter((trace) => trace.boardId === activeBoardId),
    [traces, activeBoardId],
  );
  const filteredVias = useMemo(
    () => (vias || []).filter((via) => via.boardId === activeBoardId),
    [vias, activeBoardId],
  );
  const filteredDrills = useMemo(
    () => (drillHoles || []).filter((drill) => drill.boardId === activeBoardId),
    [drillHoles, activeBoardId],
  );
  const filteredKeepouts = useMemo(
    () => (keepoutZones || []).filter((zone) => zone.boardId === activeBoardId),
    [keepoutZones, activeBoardId],
  );

  const outline = filteredOutlines[0];
  const bounds = useMemo(
    () => outline ? getOutlineBounds(outline) : { minX: 0, minY: 0, maxX: 50, maxY: 30 },
    [outline],
  );
  const pad = 10;

  const requireActiveBoard = useCallback((): string | null => {
    if (!activeBoardId || !(boards || []).some((board) => board.id === activeBoardId)) {
      setDomainError('Select or create a real PCB board before editing layout data.');
      return null;
    }
    return activeBoardId;
  }, [activeBoardId, boards]);

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

  const bx = useCallback(
    (mm: number) => mmToSvg(mm - bounds.minX + pad, zoom) + panX,
    [bounds.minX, zoom, panX],
  );
  const by = useCallback(
    (mm: number) => mmToSvg(mm - bounds.minY + pad, zoom) + panY,
    [bounds.minY, zoom, panY],
  );
  const bs = useCallback((mm: number) => mmToSvg(mm, zoom), [zoom]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const componentId = event.dataTransfer.getData('application/hardware-studio-component');
    if (!componentId) return;
    const boardId = requireActiveBoard();
    if (!boardId) return;

    const point = screenToBoard(event.clientX, event.clientY);
    updatePCBPlacement(componentId, {
      boardId,
      placementX: point.x,
      placementY: point.y,
      placementStatus: 'Needs Review',
      side: 'Top',
    });

    onViewStateChange({
      selectedComponentId: componentId,
      selectedTraceId: null,
      selectedViaId: null,
      selectedDrillHoleId: null,
      selectedKeepoutId: null,
    });
  }, [onViewStateChange, requireActiveBoard, screenToBoard, updatePCBPlacement]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -1 : 1;
    onViewStateChange({ zoom: Math.max(2, Math.min(40, zoom + delta)) });
  }, [zoom, onViewStateChange]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    setDomainError(null);
    if (event.button === 1 || (event.button === 0 && (event.altKey || activeTool === 'pan'))) {
      isPanning.current = true;
      panStart.current = { x: event.clientX - panX, y: event.clientY - panY };
      return;
    }

    const boardId = requireActiveBoard();
    if (!boardId) return;
    const point = screenToBoard(event.clientX, event.clientY);
    const anchor = resolvePCBAnchor(
      point,
      boardComponents || [],
      padNetAssignments || [],
      vias || [],
      traces || [],
      boardId,
      viewState.activeLayerId || 'top-copper',
    );

    if (activeTool === 'route') {
      if (!isRouting) {
        const validation = validateRouteStartAnchor(anchor, selectedNetName || undefined);
        if (!validation.valid) {
          setDomainError(validation.error || 'Cannot start route');
          return;
        }
        const netToUse = anchor?.netName || selectedNetName;
        onViewStateChange({
          isRouting: true,
          routePreviewPoints: [{ x: anchor!.xMm, y: anchor!.yMm }],
          selectedNetName: netToUse || null,
        });
      } else {
        if (anchor && anchor.netName && anchor.netName !== selectedNetName) {
          setDomainError(`Wrong Net Connection Rejected! Target belongs to net '${anchor.netName}', but active route is '${selectedNetName}'.`);
          return;
        }
        const nextPoint = anchor ? { x: anchor.xMm, y: anchor.yMm } : point;
        onViewStateChange({ routePreviewPoints: [...(routePreviewPoints || []), nextPoint] });
      }
      return;
    }

    if (activeTool === 'via' && selectedNetName) {
      addVia({
        boardId,
        x: point.x,
        y: point.y,
        drillDiameter: 0.3,
        outerDiameter: 0.6,
        netId: (nets || []).find((net) => net.netName === selectedNetName)?.id,
        fromLayer: 'top-copper',
        toLayer: 'bottom-copper',
      });
      return;
    }

    if (activeTool === 'drill') {
      addDrillHole({
        boardId,
        x: point.x,
        y: point.y,
        diameter: 1.0,
        plated: false,
        purpose: 'Mounting Hole',
      });
      return;
    }

    if (activeTool === 'keepout') {
      addKeepoutZone({
        boardId,
        x: point.x - 3,
        y: point.y - 2,
        width: 6,
        height: 4,
        shape: 'rect',
        layerScope: 'All',
        reason: 'User Keepout',
      });
      return;
    }

    if (activeTool === 'select' || activeTool === 'place-component') {
      for (const component of filteredComponents) {
        if (component.placementX == null || component.placementY == null) continue;
        const footprint = getFootprint(component.footprint);
        const halfWidth = footprint.courtyardWidthMm / 2;
        const halfHeight = footprint.courtyardHeightMm / 2;
        if (Math.abs(point.x - component.placementX) <= halfWidth
          && Math.abs(point.y - component.placementY) <= halfHeight) {
          onViewStateChange({
            selectedComponentId: component.id,
            selectedTraceId: null,
            selectedViaId: null,
            selectedDrillHoleId: null,
            selectedKeepoutId: null,
          });
          return;
        }
      }

      for (const via of filteredVias) {
        if (via.x != null && via.y != null
          && Math.hypot(point.x - via.x, point.y - via.y) < (via.outerDiameter || 0.6) / 2 + 0.3) {
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

      for (const drill of filteredDrills) {
        if (drill.x != null && drill.y != null
          && Math.hypot(point.x - drill.x, point.y - drill.y) < (drill.diameter || 1.0) / 2 + 0.3) {
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

      onViewStateChange({
        selectedComponentId: null,
        selectedTraceId: null,
        selectedViaId: null,
        selectedDrillHoleId: null,
        selectedKeepoutId: null,
      });
    }
  }, [
    activeTool,
    selectedNetName,
    isRouting,
    routePreviewPoints,
    screenToBoard,
    panX,
    panY,
    onViewStateChange,
    boardComponents,
    padNetAssignments,
    vias,
    traces,
    nets,
    addVia,
    addDrillHole,
    addKeepoutZone,
    filteredComponents,
    filteredVias,
    filteredDrills,
    requireActiveBoard,
    viewState.activeLayerId,
  ]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (isPanning.current) {
      onViewStateChange({
        panX: event.clientX - panStart.current.x,
        panY: event.clientY - panStart.current.y,
      });
      return;
    }

    const point = screenToBoard(event.clientX, event.clientY);
    onViewStateChange({ mouseXMm: point.x, mouseYMm: point.y });

    if ((activeTool === 'select' || activeTool === 'place-component')
      && selectedObjectId
      && selectedObjectType === 'component'
      && event.buttons === 1) {
      updatePCBPlacement(selectedObjectId, {
        placementX: point.x,
        placementY: point.y,
        placementStatus: 'Placed',
      });
    }
  }, [screenToBoard, activeTool, selectedObjectId, selectedObjectType, onViewStateChange, updatePCBPlacement]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const handleFinishDangling = useCallback(() => {
    if (!isRouting || !routePreviewPoints?.length || !selectedNetName) return;
    const boardId = requireActiveBoard();
    if (!boardId) return;
    const lastPoint = routePreviewPoints[routePreviewPoints.length - 1];

    addTrace({
      boardId,
      layerId: viewState.activeLayerId || 'top-copper',
      netId: (nets || []).find((net) => net.netName === selectedNetName)?.id,
      netName: selectedNetName,
      points: routePreviewPoints,
      width: selectedNetName.toLowerCase().includes('gnd') || selectedNetName.toLowerCase().includes('vbat') ? 0.3 : 0.15,
      status: 'Draft',
      targetAnchor: {
        type: 'dangling',
        xMm: lastPoint.x,
        yMm: lastPoint.y,
      },
    });

    onViewStateChange({ isRouting: false, routePreviewPoints: [] });
  }, [
    isRouting,
    routePreviewPoints,
    selectedNetName,
    viewState.activeLayerId,
    addTrace,
    nets,
    onViewStateChange,
    requireActiveBoard,
  ]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    if (!isRouting || !routePreviewPoints?.length || !selectedNetName) return;
    const boardId = requireActiveBoard();
    if (!boardId) return;
    const point = screenToBoard(event.clientX, event.clientY);

    const targetAnchor = resolvePCBAnchor(
      point,
      boardComponents || [],
      padNetAssignments || [],
      vias || [],
      traces || [],
      boardId,
      viewState.activeLayerId || 'top-copper',
    );

    const validation = validateRouteFinishAnchor(selectedNetName, targetAnchor);
    if (!validation.valid) {
      setDomainError(validation.error || 'Invalid route finish anchor.');
      return;
    }

    const finishAnchor = validation.targetAnchor!;
    const allPoints = [...routePreviewPoints, { x: finishAnchor.xMm, y: finishAnchor.yMm }];
    addTrace({
      boardId,
      layerId: viewState.activeLayerId || 'top-copper',
      netId: (nets || []).find((net) => net.netName === selectedNetName)?.id,
      netName: selectedNetName,
      points: allPoints,
      width: selectedNetName.toLowerCase().includes('gnd') || selectedNetName.toLowerCase().includes('vbat') ? 0.3 : 0.15,
      status: 'Routed',
      targetAnchor: finishAnchor,
    });

    onViewStateChange({ isRouting: false, routePreviewPoints: [] });
  }, [
    isRouting,
    routePreviewPoints,
    selectedNetName,
    screenToBoard,
    boardComponents,
    padNetAssignments,
    vias,
    traces,
    viewState.activeLayerId,
    addTrace,
    nets,
    onViewStateChange,
    requireActiveBoard,
  ]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onViewStateChange({ isRouting: false, routePreviewPoints: [], activeTool: 'select' });
    }

    if (event.key === 'r' && selectedObjectId && selectedObjectType === 'component') {
      const component = filteredComponents.find((candidate) => candidate.id === selectedObjectId);
      if (component) {
        updatePCBPlacement(selectedObjectId, {
          rotationDeg: ((component.rotationDeg || 0) + 90) % 360,
        });
      }
    }

    if (event.key === 'f' && selectedObjectId && selectedObjectType === 'component') {
      const component = filteredComponents.find((candidate) => candidate.id === selectedObjectId);
      if (component) {
        updatePCBPlacement(selectedObjectId, {
          side: component.side === 'Bottom' ? 'Top' : 'Bottom',
        });
      }
    }

    if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      notify({
        tone: 'info',
        title: 'PCB state persisted',
        detail: 'Layout changes are stored with the project state as you edit; no separate browser save dialog is required.',
      });
    }

    if (event.key === 'Delete' && selectedObjectId) {
      if (selectedObjectType === 'component') {
        updatePCBPlacement(selectedObjectId, {
          placementX: undefined,
          placementY: undefined,
          placementStatus: 'Unplaced',
        });
      } else if (selectedObjectType === 'trace') {
        useProjectStore.getState().deleteTrace?.(selectedObjectId);
      } else if (selectedObjectType === 'via') {
        useProjectStore.getState().deleteVia?.(selectedObjectId);
      } else if (selectedObjectType === 'drill') {
        useProjectStore.getState().deleteDrillHole?.(selectedObjectId);
      } else if (selectedObjectType === 'keepout') {
        useProjectStore.getState().deleteKeepoutZone?.(selectedObjectId);
      }
      onViewStateChange({
        selectedComponentId: null,
        selectedTraceId: null,
        selectedViaId: null,
        selectedDrillHoleId: null,
        selectedKeepoutId: null,
      });
    }

    const nudge = event.shiftKey ? gridSizeMm * 5 : gridSizeMm;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
      && selectedObjectId
      && selectedObjectType === 'component') {
      const component = filteredComponents.find((candidate) => candidate.id === selectedObjectId);
      if (component && component.placementX != null && component.placementY != null) {
        const dx = event.key === 'ArrowRight' ? nudge : event.key === 'ArrowLeft' ? -nudge : 0;
        const dy = event.key === 'ArrowDown' ? nudge : event.key === 'ArrowUp' ? -nudge : 0;
        updatePCBPlacement(selectedObjectId, {
          placementX: component.placementX + dx,
          placementY: component.placementY + dy,
        });
        event.preventDefault();
      }
    }
  }, [
    selectedObjectId,
    selectedObjectType,
    filteredComponents,
    updatePCBPlacement,
    gridSizeMm,
    onViewStateChange,
    notify,
  ]);

  const ratsnestLines = useMemo(() => {
    if (!showRatsnest || !activeBoardId) return [];
    const project = {
      boardComponents: filteredComponents,
      traces: filteredTraces,
      nets,
      padNetAssignments,
      activeBoardId,
    };
    return getNetRatsnestLines(project as unknown as Project);
  }, [showRatsnest, filteredComponents, filteredTraces, nets, padNetAssignments, activeBoardId]);

  const gridDots = useMemo(() => {
    const dots: { cx: number; cy: number }[] = [];
    const maxDots = 2000;
    let count = 0;
    for (let x = bounds.minX; x <= bounds.maxX && count < maxDots; x += gridSizeMm) {
      for (let y = bounds.minY; y <= bounds.maxY && count < maxDots; y += gridSizeMm) {
        dots.push({ cx: bx(x), cy: by(y) });
        count += 1;
      }
    }
    return dots;
  }, [bounds, gridSizeMm, bx, by]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {domainError && (
        <div
          role="alert"
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
            gap: 12,
          }}
        >
          <span>⚠️ {domainError}</span>
          <button
            type="button"
            onClick={() => setDomainError(null)}
            aria-label="Dismiss PCB editor error"
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
            gap: 8,
          }}
        >
          <button
            type="button"
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
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            Finish as Dangling Draft
          </button>
        </div>
      )}

      <svg
        ref={svgRef}
        className="h-full w-full cursor-crosshair select-none bg-slate-50 outline-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        tabIndex={0}
        aria-label={activeBoardName ? `PCB layout canvas for ${activeBoardName}` : 'PCB layout canvas with no board selected'}
        style={{ minHeight: '100%' }}
      >
        {gridDots.map((dot, index) => (
          <circle key={index} cx={dot.cx} cy={dot.cy} r={0.6} fill="#cbd5e1" opacity={0.8} />
        ))}

        {outline?.points && outline.points.length >= 3 && (
          <polygon
            points={outline.points.map((point) => `${bx(point.x)},${by(point.y)}`).join(' ')}
            fill="#ecfdf5"
            stroke="#059669"
            strokeWidth={2}
            opacity={0.95}
          />
        )}
        {outline && (!outline.points || outline.points.length < 3) && outline.width && outline.height && (
          <rect
            x={bx(0)}
            y={by(0)}
            width={bs(outline.width)}
            height={bs(outline.height)}
            fill="#ecfdf5"
            stroke="#059669"
            strokeWidth={2}
          />
        )}

        {outline && (
          <polygon
            points={generateGroundPourPolygon(outline, 0.6).map((point) => `${bx(point.x)},${by(point.y)}`).join(' ')}
            fill="#d1fae5"
            stroke="#10b981"
            strokeWidth={1}
            strokeDasharray="2,2"
            opacity={0.6}
          />
        )}

        <line x1={bx(0) - 8} y1={by(0)} x2={bx(0) + 8} y2={by(0)} stroke="#ef4444" strokeWidth={1} opacity={0.6} />
        <line x1={bx(0)} y1={by(0) - 8} x2={bx(0)} y2={by(0) + 8} stroke="#ef4444" strokeWidth={1} opacity={0.6} />

        {layerVisibility.keepouts && filteredKeepouts.map((zone) => {
          const isSelected = selectedKeepoutId === zone.id;
          return (
            <g
              key={zone.id}
              onClick={(event) => {
                event.stopPropagation();
                onViewStateChange({
                  selectedKeepoutId: zone.id,
                  selectedComponentId: null,
                  selectedTraceId: null,
                  selectedViaId: null,
                  selectedDrillHoleId: null,
                });
              }}
              className="cursor-pointer"
            >
              <rect
                x={bx(zone.x)}
                y={by(zone.y)}
                width={bs(zone.width)}
                height={bs(zone.height)}
                fill="#ef4444"
                opacity={isSelected ? 0.25 : 0.12}
                stroke="#ef4444"
                strokeWidth={isSelected ? 1.5 : 1}
                strokeDasharray="4,2"
              />
              <text x={bx(zone.x) + 3} y={by(zone.y) + 10} fill="#ef4444" fontSize={8} opacity={0.7}>
                {zone.reason}
              </text>
            </g>
          );
        })}

        {filteredTraces.map((trace) => {
          if (!trace.points || trace.points.length < 2) return null;
          const layerId = trace.layerId || 'top-copper';
          if (layerVisibility[layerId] === false) return null;
          const isActive = viewState.activeLayerId === layerId;
          const isHighlighted = selectedNetName && trace.netName === selectedNetName;
          const isSelected = selectedObjectId === trace.id;
          let strokeColor = layerId === 'bottom-copper' ? '#3b82f6' : '#ef4444';
          if (isHighlighted) strokeColor = '#22d3ee';
          else if (isSelected) strokeColor = '#f59e0b';
          const opacity = isSelected || isHighlighted ? 1 : isActive ? 0.9 : 0.4;

          return (
            <polyline
              key={trace.id}
              points={trace.points.map((point) => `${bx(point.x)},${by(point.y)}`).join(' ')}
              fill="none"
              stroke={strokeColor}
              strokeWidth={bs(trace.width || 0.25)}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={opacity}
              onClick={(event) => {
                event.stopPropagation();
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

        {isRouting && routePreviewPoints?.length > 0 && (
          <polyline
            points={[...routePreviewPoints, { x: viewState.mouseXMm, y: viewState.mouseYMm }]
              .map((point) => `${bx(point.x)},${by(point.y)}`).join(' ')}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={bs(0.25)}
            strokeDasharray="3,2"
            strokeLinecap="round"
            opacity={0.9}
          />
        )}

        {layerVisibility.drill && filteredVias.map((via) => {
          if (via.x == null || via.y == null) return null;
          const isSelected = selectedObjectId === via.id;
          return (
            <g
              key={via.id}
              onClick={(event) => {
                event.stopPropagation();
                onViewStateChange({
                  selectedViaId: via.id,
                  selectedComponentId: null,
                  selectedTraceId: null,
                  selectedDrillHoleId: null,
                  selectedKeepoutId: null,
                });
              }}
              className="cursor-pointer"
            >
              <circle cx={bx(via.x)} cy={by(via.y)} r={bs((via.outerDiameter || 0.6) / 2)} fill="#f59e0b" stroke={isSelected ? '#10b981' : '#d97706'} strokeWidth={1} />
              <circle cx={bx(via.x)} cy={by(via.y)} r={bs((via.drillDiameter || 0.3) / 2)} fill="#0f172a" />
            </g>
          );
        })}

        {layerVisibility.drill && filteredDrills.map((drill) => {
          if (drill.x == null || drill.y == null) return null;
          const isSelected = selectedObjectId === drill.id;
          return (
            <g
              key={drill.id}
              onClick={(event) => {
                event.stopPropagation();
                onViewStateChange({
                  selectedDrillHoleId: drill.id,
                  selectedComponentId: null,
                  selectedTraceId: null,
                  selectedViaId: null,
                  selectedKeepoutId: null,
                });
              }}
              className="cursor-pointer"
            >
              <circle cx={bx(drill.x)} cy={by(drill.y)} r={bs((drill.diameter || 1.0) / 2)} fill="none" stroke={isSelected ? '#f59e0b' : '#cbd5e1'} strokeWidth={1.5} strokeDasharray="3,2" />
              <line x1={bx(drill.x) - 4} y1={by(drill.y)} x2={bx(drill.x) + 4} y2={by(drill.y)} stroke="#cbd5e1" strokeWidth={0.5} />
              <line x1={bx(drill.x)} y1={by(drill.y) - 4} x2={bx(drill.x)} y2={by(drill.y) + 4} stroke="#cbd5e1" strokeWidth={0.5} />
            </g>
          );
        })}

        {filteredComponents.map((component) => {
          if (component.placementX == null || component.placementY == null) return null;
          const footprint = getFootprint(component.footprint);
          const isSelected = selectedObjectId === component.id;
          const isNetHighlighted = selectedNetName && (padNetAssignments || []).some(
            (assignment) => assignment.componentId === component.id && assignment.netName === selectedNetName,
          );
          const rotation = component.rotationDeg || 0;

          return (
            <g
              key={component.id}
              transform={`translate(${bx(component.placementX)}, ${by(component.placementY)}) rotate(${rotation})`}
              onClick={(event) => {
                event.stopPropagation();
                onViewStateChange({
                  selectedComponentId: component.id,
                  selectedTraceId: null,
                  selectedViaId: null,
                  selectedDrillHoleId: null,
                  selectedKeepoutId: null,
                });
              }}
              className="cursor-pointer"
            >
              <rect
                x={-bs(footprint.courtyardWidthMm / 2)}
                y={-bs(footprint.courtyardHeightMm / 2)}
                width={bs(footprint.courtyardWidthMm)}
                height={bs(footprint.courtyardHeightMm)}
                fill="none"
                stroke={isSelected ? '#10b981' : '#64748b'}
                strokeWidth={0.75}
                strokeDasharray={component.side === 'Bottom' ? '2,2' : isSelected ? 'none' : '2,1'}
                opacity={component.side === 'Bottom' ? 0.35 : 0.6}
              />
              <rect
                x={-bs(footprint.bodyWidthMm / 2)}
                y={-bs(footprint.bodyHeightMm / 2)}
                width={bs(footprint.bodyWidthMm)}
                height={bs(footprint.bodyHeightMm)}
                fill={isSelected ? '#dcfce7' : isNetHighlighted ? '#e0f2fe' : '#f1f5f9'}
                stroke={isSelected ? '#059669' : isNetHighlighted ? '#0284c7' : '#334155'}
                strokeWidth={isSelected ? 2 : 1.2}
                strokeDasharray={component.side === 'Bottom' ? '3,3' : 'none'}
                rx={bs(0.2)}
              />
              {footprint.pads.map((footprintPad, index) => {
                const padXMm = component.side === 'Bottom' ? -footprintPad.xMm : footprintPad.xMm;
                return (
                  <g key={index}>
                    <rect
                      x={bs(padXMm) - bs(footprintPad.widthMm / 2)}
                      y={bs(footprintPad.yMm) - bs(footprintPad.heightMm / 2)}
                      width={bs(footprintPad.widthMm)}
                      height={bs(footprintPad.heightMm)}
                      fill={isNetHighlighted ? '#38bdf8' : component.side === 'Bottom' ? '#60a5fa' : '#f59e0b'}
                      stroke="#d97706"
                      strokeWidth={0.5}
                      opacity={component.side === 'Bottom' ? 0.8 : 1}
                      rx={bs(0.05)}
                    />
                    {(component.footprint.includes('DIP') || component.footprint.includes('HEADER') || component.footprint.includes('USB')) && (
                      <circle
                        cx={bs(padXMm)}
                        cy={bs(footprintPad.yMm)}
                        r={bs(Math.min(footprintPad.widthMm, footprintPad.heightMm) * 0.25)}
                        fill="#0f172a"
                      />
                    )}
                  </g>
                );
              })}
              <circle
                cx={bs((component.side === 'Bottom' ? -1 : 1) * (footprint.pads[0]?.xMm || -footprint.bodyWidthMm / 2 + 0.3))}
                cy={bs(footprint.pads[0]?.yMm || -footprint.bodyHeightMm / 2 + 0.3)}
                r={bs(0.2)}
                fill="#dc2626"
              />
              <text
                x={0}
                y={bs(footprint.courtyardHeightMm / 2) + 8}
                fill={isSelected ? '#059669' : '#0f172a'}
                fontSize={Math.max(8, Math.min(11, zoom))}
                textAnchor="middle"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {component.referenceDesignator}
              </text>
            </g>
          );
        })}

        {showRatsnest && ratsnestLines.map((line, index) => {
          const isHighlighted = selectedNetName && line.netName === selectedNetName;
          return (
            <line
              key={`rat_${index}`}
              x1={bx(line.x1)}
              y1={by(line.y1)}
              x2={bx(line.x2)}
              y2={by(line.y2)}
              stroke={isHighlighted ? '#0284c7' : '#94a3b8'}
              strokeWidth={isHighlighted ? 1.5 : 0.8}
              strokeDasharray="3,3"
              opacity={isHighlighted ? 0.95 : 0.6}
            />
          );
        })}

        {showDRC && drcResults
          .filter((result) => result.linkedObjectType === 'component')
          .map((result, index) => {
            const component = filteredComponents.find((candidate) => candidate.id === result.linkedObjectId);
            if (!component || component.placementX == null || component.placementY == null) return null;
            return (
              <g key={`${result.id}-${index}`} pointerEvents="none">
                <circle cx={bx(component.placementX)} cy={by(component.placementY)} r={8} fill="none" stroke="#dc2626" strokeWidth={1.5} />
                <text x={bx(component.placementX) + 10} y={by(component.placementY) - 8} fill="#b91c1c" fontSize={8} fontWeight="700">
                  DRC
                </text>
              </g>
            );
          })}

        <text x={10} y={20} fill="#475569" fontSize={10} fontFamily="monospace" fontWeight="600">
          {viewState.mouseXMm.toFixed(2)}, {viewState.mouseYMm.toFixed(2)} mm | Grid: {gridSizeMm}mm | Zoom: {zoom}x | Board: {activeBoardName || 'No board selected'}
        </text>
        {selectedNetName && (
          <text x={10} y={34} fill="#0284c7" fontSize={10} fontFamily="monospace" fontWeight="700">
            Net: {selectedNetName}
          </text>
        )}
        {isRouting && (
          <text x={10} y={48} fill="#d97706" fontSize={10} fontFamily="monospace" fontWeight="700">
            ROUTING — Click target pad/via to route, use Finish as Dangling Draft, Esc to cancel
          </text>
        )}
      </svg>
    </div>
  );
};
