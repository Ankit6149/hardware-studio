'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProductDesignStore } from '../../store/productDesignStore';
import { objectTypeFromTool, snapProductDesignValue } from '../../lib/product-design/model';
import type { ProductDesignObject } from '../../lib/product-design/types';

interface Point {
  x: number;
  y: number;
}

interface DragState {
  start: Point;
  objectOrigins: Record<string, Point>;
}

interface ResizeState {
  objectId: string;
  start: Point;
  width: number;
  height: number;
}

interface PanState {
  startClient: Point;
  panX: number;
  panY: number;
}

interface MarqueeState {
  start: Point;
  current: Point;
}

function isTextEntryTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || (target instanceof HTMLElement && target.isContentEditable);
}

function intersects(object: ProductDesignObject, marquee: MarqueeState): boolean {
  const left = Math.min(marquee.start.x, marquee.current.x);
  const top = Math.min(marquee.start.y, marquee.current.y);
  const right = Math.max(marquee.start.x, marquee.current.x);
  const bottom = Math.max(marquee.start.y, marquee.current.y);
  const objectLeft = Math.min(object.x, object.x + object.width);
  const objectTop = Math.min(object.y, object.y + object.height);
  const objectRight = Math.max(object.x, object.x + object.width);
  const objectBottom = Math.max(object.y, object.y + object.height);
  return objectLeft <= right && objectRight >= left && objectTop <= bottom && objectBottom >= top;
}

function renderObjectShape(
  object: ProductDesignObject,
  assetUrl: string | undefined,
  missing: boolean,
): React.ReactNode {
  const common = {
    opacity: object.opacity,
    stroke: object.stroke,
    strokeWidth: object.strokeWidth,
    fill: object.fill,
    vectorEffect: 'non-scaling-stroke' as const,
  };

  if (object.type === 'rectangle') {
    return <rect width={object.width} height={object.height} rx={object.cornerRadius} {...common} />;
  }
  if (object.type === 'ellipse') {
    return <ellipse cx={object.width / 2} cy={object.height / 2} rx={Math.abs(object.width / 2)} ry={Math.abs(object.height / 2)} {...common} />;
  }
  if (object.type === 'line' || object.type === 'arrow') {
    return (
      <line
        x1={0}
        y1={0}
        x2={object.width}
        y2={object.height}
        stroke={object.stroke}
        strokeWidth={object.strokeWidth}
        opacity={object.opacity}
        markerEnd={object.type === 'arrow' ? 'url(#product-design-arrow)' : undefined}
        vectorEffect="non-scaling-stroke"
      />
    );
  }
  if (object.type === 'text' || object.type === 'note') {
    return (
      <>
        {object.type === 'note' && <rect width={object.width} height={object.height} rx={10} {...common} />}
        <foreignObject width={Math.max(20, object.width)} height={Math.max(20, object.height)}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              boxSizing: 'border-box',
              width: '100%',
              height: '100%',
              padding: object.type === 'note' ? 12 : 2,
              color: object.type === 'note' ? '#78350f' : object.stroke,
              fontSize: object.fontSize,
              fontWeight: object.fontWeight,
              textAlign: object.textAlign,
              lineHeight: 1.25,
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              pointerEvents: 'none',
            }}
          >
            {object.text}
          </div>
        </foreignObject>
      </>
    );
  }
  if (object.type === 'dimension') {
    const y = object.height / 2;
    return (
      <g opacity={object.opacity} stroke={object.stroke} fill="none" vectorEffect="non-scaling-stroke">
        <line x1={0} y1={y} x2={object.width} y2={y} strokeWidth={object.strokeWidth} />
        <line x1={0} y1={y - 9} x2={0} y2={y + 9} strokeWidth={object.strokeWidth} />
        <line x1={object.width} y1={y - 9} x2={object.width} y2={y + 9} strokeWidth={object.strokeWidth} />
        <rect x={object.width / 2 - 52} y={y - 14} width={104} height={24} rx={6} fill="#ffffff" stroke="#ccfbf1" />
        <text x={object.width / 2} y={y + 3} textAnchor="middle" fill={object.stroke} stroke="none" fontSize={11} fontWeight={700}>
          {object.prefix}{object.value} {object.units}{object.suffix}
        </text>
      </g>
    );
  }
  if (object.type === 'reference-image') {
    if (assetUrl && !missing) {
      return (
        <>
          <rect width={object.width} height={object.height} fill="#f8fafc" stroke={object.stroke} strokeWidth={object.strokeWidth} />
          <image
            href={assetUrl}
            width={object.width}
            height={object.height}
            preserveAspectRatio={object.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
            opacity={object.opacity}
          />
        </>
      );
    }
    return (
      <g>
        <rect width={object.width} height={object.height} fill="#fff7ed" stroke="#f97316" strokeDasharray="7 5" />
        <text x={object.width / 2} y={object.height / 2 - 6} textAnchor="middle" fill="#9a3412" fontSize={13} fontWeight={700}>Reference unavailable</text>
        <text x={object.width / 2} y={object.height / 2 + 14} textAnchor="middle" fill="#c2410c" fontSize={10}>Relink the missing local asset</text>
      </g>
    );
  }
  if (object.type === 'concept-part') {
    return (
      <g opacity={object.opacity}>
        <rect width={object.width} height={object.height} rx={14} fill={object.appearance} stroke={object.stroke} strokeWidth={object.strokeWidth} />
        <path d={`M 0 22 H ${object.width} M 22 0 V ${object.height}`} stroke="rgba(255,255,255,0.35)" strokeWidth={1} />
        <text x={12} y={22} fill="#0f172a" fontSize={12} fontWeight={800}>{object.name}</text>
        <text x={12} y={40} fill="#334155" fontSize={9}>{object.width} × {object.height} × {object.depth}</text>
        <text x={12} y={object.height - 12} fill="#334155" fontSize={9}>CONCEPT · not exact CAD</text>
      </g>
    );
  }
  return null;
}

export const ProductDesignCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const document = useProductDesignStore((state) => state.document);
  const activeTool = useProductDesignStore((state) => state.activeTool);
  const selectedObjectIds = useProductDesignStore((state) => state.selectedObjectIds);
  const previewPatches = useProductDesignStore((state) => state.previewPatches);
  const assetUrls = useProductDesignStore((state) => state.assetUrls);
  const missingAssetIds = useProductDesignStore((state) => state.missingAssetIds);
  const zoom = useProductDesignStore((state) => state.zoom);
  const panX = useProductDesignStore((state) => state.panX);
  const panY = useProductDesignStore((state) => state.panY);
  const addObject = useProductDesignStore((state) => state.addObject);
  const selectObject = useProductDesignStore((state) => state.selectObject);
  const selectObjects = useProductDesignStore((state) => state.selectObjects);
  const setPreviewPatch = useProductDesignStore((state) => state.setPreviewPatch);
  const clearPreviewPatches = useProductDesignStore((state) => state.clearPreviewPatches);
  const commitPreviewPatches = useProductDesignStore((state) => state.commitPreviewPatches);
  const setViewport = useProductDesignStore((state) => state.setViewport);
  const deleteSelected = useProductDesignStore((state) => state.deleteSelected);
  const duplicateSelected = useProductDesignStore((state) => state.duplicateSelected);
  const groupSelected = useProductDesignStore((state) => state.groupSelected);
  const ungroupSelected = useProductDesignStore((state) => state.ungroupSelected);
  const moveSelected = useProductDesignStore((state) => state.moveSelected);
  const undo = useProductDesignStore((state) => state.undo);
  const redo = useProductDesignStore((state) => state.redo);
  const setActiveTool = useProductDesignStore((state) => state.setActiveTool);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [panState, setPanState] = useState<PanState | null>(null);
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);

  const visibleObjects = useMemo(() => {
    if (!document) return [];
    const layerById = new Map(document.layers.map((layer) => [layer.id, layer]));
    return document.objects
      .filter((object) => object.visible && layerById.get(object.layerId)?.visible !== false)
      .map((object) => ({ ...object, ...previewPatches[object.id] } as ProductDesignObject))
      .sort((a, b) => a.order - b.order);
  }, [document, previewPatches]);

  const pointFromClient = useCallback((clientX: number, clientY: number): Point => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - panX) / zoom,
      y: (clientY - rect.top - panY) / zoom,
    };
  }, [panX, panY, zoom]);

  const handleCanvasPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!document) return;
    const point = pointFromClient(event.clientX, event.clientY);
    if (activeTool === 'pan' || event.button === 1 || event.altKey) {
      event.currentTarget.setPointerCapture(event.pointerId);
      setPanState({ startClient: { x: event.clientX, y: event.clientY }, panX, panY });
      return;
    }

    const objectType = objectTypeFromTool(activeTool);
    if (objectType && objectType !== 'reference-image') {
      const x = snapProductDesignValue(point.x, document.canvas.gridSize, document.canvas.snapToGrid);
      const y = snapProductDesignValue(point.y, document.canvas.gridSize, document.canvas.snapToGrid);
      addObject(objectType, x, y);
      return;
    }

    if (activeTool === 'select') {
      event.currentTarget.setPointerCapture(event.pointerId);
      if (!event.shiftKey) selectObject(null);
      setMarquee({ start: point, current: point });
    }
  };

  const handleObjectPointerDown = (event: React.PointerEvent<SVGGElement>, object: ProductDesignObject) => {
    event.stopPropagation();
    if (activeTool !== 'select' || object.locked) {
      selectObject(object.id, event.shiftKey);
      return;
    }
    const groupIds = object.groupId
      ? visibleObjects.filter((candidate) => candidate.groupId === object.groupId).map((candidate) => candidate.id)
      : [object.id];
    const nextSelection = event.shiftKey
      ? Array.from(new Set([...selectedObjectIds, ...groupIds]))
      : selectedObjectIds.includes(object.id) ? selectedObjectIds : groupIds;
    selectObjects(nextSelection);

    const start = pointFromClient(event.clientX, event.clientY);
    const objectOrigins = Object.fromEntries(
      visibleObjects.filter((candidate) => nextSelection.includes(candidate.id)).map((candidate) => [candidate.id, { x: candidate.x, y: candidate.y }]),
    );
    svgRef.current?.setPointerCapture(event.pointerId);
    setDragState({ start, objectOrigins });
  };

  const handleResizePointerDown = (event: React.PointerEvent<SVGRectElement>, object: ProductDesignObject) => {
    event.stopPropagation();
    svgRef.current?.setPointerCapture(event.pointerId);
    setResizeState({
      objectId: object.id,
      start: pointFromClient(event.clientX, event.clientY),
      width: object.width,
      height: object.height,
    });
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!document) return;
    if (panState) {
      setViewport({
        panX: panState.panX + event.clientX - panState.startClient.x,
        panY: panState.panY + event.clientY - panState.startClient.y,
      });
      return;
    }
    const point = pointFromClient(event.clientX, event.clientY);
    if (dragState) {
      const dx = point.x - dragState.start.x;
      const dy = point.y - dragState.start.y;
      Object.entries(dragState.objectOrigins).forEach(([objectId, origin]) => {
        setPreviewPatch(objectId, {
          x: snapProductDesignValue(origin.x + dx, document.canvas.gridSize, document.canvas.snapToGrid),
          y: snapProductDesignValue(origin.y + dy, document.canvas.gridSize, document.canvas.snapToGrid),
        });
      });
      return;
    }
    if (resizeState) {
      setPreviewPatch(resizeState.objectId, {
        width: Math.max(10, snapProductDesignValue(resizeState.width + point.x - resizeState.start.x, document.canvas.gridSize, document.canvas.snapToGrid)),
        height: Math.max(10, snapProductDesignValue(resizeState.height + point.y - resizeState.start.y, document.canvas.gridSize, document.canvas.snapToGrid)),
      });
      return;
    }
    if (marquee) setMarquee({ ...marquee, current: point });
  };

  const finishPointerInteraction = () => {
    if (dragState) commitPreviewPatches('Move design objects');
    if (resizeState) commitPreviewPatches('Resize design object');
    if (marquee) {
      const ids = visibleObjects.filter((object) => !object.locked && intersects(object, marquee)).map((object) => object.id);
      selectObjects(ids);
    }
    setDragState(null);
    setResizeState(null);
    setPanState(null);
    setMarquee(null);
    if (!dragState && !resizeState) clearPreviewPatches();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextEntryTarget(event.target)) return;
      const modifier = event.ctrlKey || event.metaKey;
      if (modifier && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo(); else undo();
        return;
      }
      if (modifier && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      if (modifier && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        duplicateSelected();
        return;
      }
      if (modifier && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        if (event.shiftKey) ungroupSelected(); else groupSelected();
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelected();
        return;
      }
      if (event.key === 'Escape') {
        clearPreviewPatches();
        setDragState(null);
        setResizeState(null);
        setMarquee(null);
        setActiveTool('select');
        return;
      }
      const amount = event.shiftKey ? 10 : 1;
      if (event.key === 'ArrowLeft') moveSelected(-amount, 0);
      if (event.key === 'ArrowRight') moveSelected(amount, 0);
      if (event.key === 'ArrowUp') moveSelected(0, -amount);
      if (event.key === 'ArrowDown') moveSelected(0, amount);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearPreviewPatches, deleteSelected, duplicateSelected, groupSelected, moveSelected, redo, setActiveTool, undo, ungroupSelected]);

  if (!document) {
    return <div className="grid h-full place-items-center bg-slate-100 text-sm text-slate-500">Opening Product Design…</div>;
  }

  const selectedObjects = visibleObjects.filter((object) => selectedObjectIds.includes(object.id));
  const singleSelected = selectedObjects.length === 1 ? selectedObjects[0] : null;
  const marqueeLeft = marquee ? Math.min(marquee.start.x, marquee.current.x) : 0;
  const marqueeTop = marquee ? Math.min(marquee.start.y, marquee.current.y) : 0;
  const marqueeWidth = marquee ? Math.abs(marquee.current.x - marquee.start.x) : 0;
  const marqueeHeight = marquee ? Math.abs(marquee.current.y - marquee.start.y) : 0;

  return (
    <div className="relative h-full min-h-0 overflow-hidden bg-slate-200">
      <svg
        ref={svgRef}
        className={`h-full w-full touch-none ${activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : activeTool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerInteraction}
        onPointerCancel={finishPointerInteraction}
        onWheel={(event) => {
          event.preventDefault();
          const nextZoom = Math.min(3, Math.max(0.2, zoom * (event.deltaY > 0 ? 0.9 : 1.1)));
          setViewport({ zoom: nextZoom });
        }}
        aria-label="Product Design canvas"
      >
        <defs>
          <pattern id="product-design-grid-small" width={document.canvas.gridSize} height={document.canvas.gridSize} patternUnits="userSpaceOnUse">
            <path d={`M ${document.canvas.gridSize} 0 L 0 0 0 ${document.canvas.gridSize}`} fill="none" stroke="#e2e8f0" strokeWidth={0.7} />
          </pattern>
          <pattern id="product-design-grid-major" width={document.canvas.gridSize * 5} height={document.canvas.gridSize * 5} patternUnits="userSpaceOnUse">
            <rect width={document.canvas.gridSize * 5} height={document.canvas.gridSize * 5} fill="url(#product-design-grid-small)" />
            <path d={`M ${document.canvas.gridSize * 5} 0 L 0 0 0 ${document.canvas.gridSize * 5}`} fill="none" stroke="#cbd5e1" strokeWidth={1} />
          </pattern>
          <marker id="product-design-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
          </marker>
          <filter id="product-design-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity="0.16" />
          </filter>
        </defs>

        <g transform={`translate(${panX} ${panY}) scale(${zoom})`}>
          <rect x={0} y={0} width={document.canvas.width} height={document.canvas.height} fill={document.canvas.background} filter="url(#product-design-shadow)" />
          {document.canvas.gridVisible && (
            <rect x={0} y={0} width={document.canvas.width} height={document.canvas.height} fill="url(#product-design-grid-major)" pointerEvents="none" />
          )}
          {visibleObjects.map((object) => {
            const selected = selectedObjectIds.includes(object.id);
            const centerX = object.width / 2;
            const centerY = object.height / 2;
            const missing = object.type === 'reference-image' && missingAssetIds.includes(object.assetId);
            return (
              <g
                key={object.id}
                transform={`translate(${object.x} ${object.y}) rotate(${object.rotation} ${centerX} ${centerY})`}
                onPointerDown={(event) => handleObjectPointerDown(event, object)}
                className={object.locked ? 'cursor-not-allowed' : 'cursor-move'}
                aria-label={object.name}
              >
                {renderObjectShape(object, object.type === 'reference-image' ? assetUrls[object.assetId] : undefined, missing)}
                {selected && (
                  <rect
                    x={-4}
                    y={-4}
                    width={Math.max(8, object.width + 8)}
                    height={Math.max(8, object.height + 8)}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth={1.5 / zoom}
                    strokeDasharray={`${5 / zoom} ${3 / zoom}`}
                    pointerEvents="none"
                    vectorEffect="non-scaling-stroke"
                  />
                )}
              </g>
            );
          })}

          {singleSelected && !singleSelected.locked && (
            <rect
              x={singleSelected.x + singleSelected.width - 6 / zoom}
              y={singleSelected.y + singleSelected.height - 6 / zoom}
              width={12 / zoom}
              height={12 / zoom}
              rx={2 / zoom}
              fill="#ffffff"
              stroke="#4f46e5"
              strokeWidth={1.5 / zoom}
              className="cursor-nwse-resize"
              onPointerDown={(event) => handleResizePointerDown(event, singleSelected)}
            />
          )}

          {marquee && (
            <rect
              x={marqueeLeft}
              y={marqueeTop}
              width={marqueeWidth}
              height={marqueeHeight}
              fill="rgba(79,70,229,0.1)"
              stroke="#4f46e5"
              strokeWidth={1 / zoom}
              strokeDasharray={`${5 / zoom} ${3 / zoom}`}
              pointerEvents="none"
            />
          )}
        </g>
      </svg>

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-slate-300 bg-white/90 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 shadow-sm backdrop-blur">
        {Math.round(zoom * 100)}% · {document.units} · {document.canvas.snapToGrid ? `snap ${document.canvas.gridSize}` : 'snap off'}
      </div>
    </div>
  );
};
