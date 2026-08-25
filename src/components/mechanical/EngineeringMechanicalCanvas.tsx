'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import type { MechanicalDimension, MechanicalObject } from '../../types';

export interface MechanicalCanvasView {
  offsetX: number;
  offsetY: number;
  scale: number;
  mouseXmm: number;
  mouseYmm: number;
}

interface Props {
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  panMode: boolean;
  view: MechanicalCanvasView;
  onViewChange: (patch: Partial<MechanicalCanvasView>) => void;
}

const EMPTY_MECHANICAL_OBJECTS: MechanicalObject[] = [];
const EMPTY_MECHANICAL_DIMENSIONS: MechanicalDimension[] = [];

const FEATURE_STYLE: Record<string, { stroke: string; fill: string }> = {
  'Outer Profile': { stroke: '#11110f', fill: '#f3f0e8' },
  'Inner Profile': { stroke: '#57534e', fill: '#fafaf9' },
  'Board Zone': { stroke: '#355e4a', fill: '#e8efe9' },
  'Battery Cavity': { stroke: '#8a6428', fill: '#f5efe1' },
  'Connector Opening': { stroke: '#3f6b58', fill: '#edf4ef' },
  'Button Opening': { stroke: '#6d5b7b', fill: '#f1edf4' },
  'Sensor Window': { stroke: '#4e6f73', fill: '#edf3f3' },
  'Mounting Point': { stroke: '#7d3e37', fill: '#f6ecea' },
  'Antenna Keepout': { stroke: '#8a5b70', fill: '#f6eef2' },
  'Thermal Zone': { stroke: '#8a5930', fill: '#f6eee7' },
  'Seal Zone': { stroke: '#5f617d', fill: '#eeeeF4' },
  'Flex Bend Zone': { stroke: '#73613c', fill: '#f4f0e7' },
  'Mechanical Keepout': { stroke: '#8b3a32', fill: '#f7ecea' },
  'Annotation': { stroke: '#77736b', fill: '#f5f4f1' },
};

export const EngineeringMechanicalCanvas: React.FC<Props> = ({
  selectedObjectId,
  onSelectObject,
  panMode,
  view,
  onViewChange,
}) => {
  const objects = useProjectStore((state) => state.mechanicalObjects ?? EMPTY_MECHANICAL_OBJECTS);
  const dimensions = useProjectStore((state) => state.mechanicalDimensions ?? EMPTY_MECHANICAL_DIMENSIONS);
  const beginCommand = useProjectStore((state) => state.beginCommand);
  const updateTransientPreview = useProjectStore((state) => state.updateTransientPreview);
  const commitCommand = useProjectStore((state) => state.commitCommand);
  const cancelCommand = useProjectStore((state) => state.cancelCommand);
  const svgRef = useRef<SVGSVGElement>(null);
  const [panning, setPanning] = useState<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number; objectX: number; objectY: number } | null>(null);

  const pointer = useCallback((event: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { sx: 0, sy: 0, xMm: 0, yMm: 0 };
    const sx = event.clientX - rect.left;
    const sy = event.clientY - rect.top;
    return {
      sx,
      sy,
      xMm: (sx - view.offsetX) / view.scale,
      yMm: (sy - view.offsetY) / view.scale,
    };
  }, [view.offsetX, view.offsetY, view.scale]);

  const x = useCallback((mm: number) => mm * view.scale + view.offsetX, [view.offsetX, view.scale]);
  const y = useCallback((mm: number) => mm * view.scale + view.offsetY, [view.offsetY, view.scale]);
  const s = useCallback((mm: number) => mm * view.scale, [view.scale]);

  const visibleObjects = useMemo(() => objects.filter((object) => object.visible), [objects]);
  const gridMm = view.scale >= 12 ? 1 : view.scale >= 5 ? 5 : 10;
  const gridPx = gridMm * view.scale;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;

      if (dragging) {
        cancelCommand();
        setDragging(null);
      }
      if (panning) setPanning(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [cancelCommand, dragging, panning]);

  const onMouseDown = (event: React.MouseEvent) => {
    const point = pointer(event);
    if (panMode || event.button === 1 || event.altKey) {
      setPanning({ x: event.clientX, y: event.clientY, offsetX: view.offsetX, offsetY: view.offsetY });
      return;
    }
    onSelectObject(null);
    onViewChange({ mouseXmm: point.xMm, mouseYmm: point.yMm });
  };

  const onMouseMove = (event: React.MouseEvent) => {
    const point = pointer(event);
    onViewChange({ mouseXmm: point.xMm, mouseYmm: point.yMm });
    if (panning) {
      onViewChange({
        offsetX: panning.offsetX + event.clientX - panning.x,
        offsetY: panning.offsetY + event.clientY - panning.y,
      });
      return;
    }
    if (dragging) {
      const dx = (event.clientX - dragging.x) / view.scale;
      const dy = (event.clientY - dragging.y) / view.scale;
      const nextX = Math.round((dragging.objectX + dx) * 10) / 10;
      const nextY = Math.round((dragging.objectY + dy) * 10) / 10;
      const currentObjects = useProjectStore.getState().mechanicalObjects ?? EMPTY_MECHANICAL_OBJECTS;
      updateTransientPreview({
        mechanicalObjects: currentObjects.map((object) => object.id === dragging.id ? { ...object, xMm: nextX, yMm: nextY } : object),
      });
    }
  };

  const endPointerTransaction = () => {
    if (dragging) commitCommand();
    setDragging(null);
    setPanning(null);
  };

  const beginObjectDrag = (event: React.MouseEvent, object: MechanicalObject) => {
    event.stopPropagation();
    onSelectObject(object.id);
    if (panMode || object.locked) return;
    beginCommand('MOVE_MECHANICAL_FEATURE', `Move ${object.name}`);
    setDragging({ id: object.id, x: event.clientX, y: event.clientY, objectX: object.xMm, objectY: object.yMm });
  };

  return (
    <svg
      ref={svgRef}
      className={`h-full w-full select-none bg-[#fbfaf6] ${panMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={endPointerTransaction}
      onMouseLeave={endPointerTransaction}
      onWheel={(event) => {
        event.preventDefault();
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const sx = event.clientX - rect.left;
        const sy = event.clientY - rect.top;
        const nextScale = Math.max(1.5, Math.min(30, view.scale * (event.deltaY > 0 ? 0.9 : 1.1)));
        const ratio = nextScale / view.scale;
        onViewChange({
          scale: nextScale,
          offsetX: sx - (sx - view.offsetX) * ratio,
          offsetY: sy - (sy - view.offsetY) * ratio,
        });
      }}
      aria-label="Mechanical feature canvas"
    >
      <defs>
        <pattern id="engineeringMechGrid" width={gridPx} height={gridPx} patternUnits="userSpaceOnUse" x={view.offsetX % gridPx} y={view.offsetY % gridPx}>
          <circle cx={0.75} cy={0.75} r={0.65} fill="#c9c5ba" />
        </pattern>
        <marker id="dimensionArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M 6 0 L 0 3 L 6 6" fill="none" stroke="#57534e" strokeWidth="1" /></marker>
      </defs>
      <rect width="100%" height="100%" fill="#fbfaf6" />
      <rect width="100%" height="100%" fill="url(#engineeringMechGrid)" />
      <line x1={view.offsetX - 14} y1={view.offsetY} x2={view.offsetX + 14} y2={view.offsetY} stroke="#918d83" strokeWidth="1" />
      <line x1={view.offsetX} y1={view.offsetY - 14} x2={view.offsetX} y2={view.offsetY + 14} stroke="#918d83" strokeWidth="1" />

      {visibleObjects.map((object) => {
        const style = FEATURE_STYLE[object.type] || FEATURE_STYLE.Annotation;
        const selected = selectedObjectId === object.id;
        const stroke = selected ? '#11110f' : style.stroke;
        const strokeWidth = selected ? 2.2 : object.locked ? 1.4 : 1.2;
        const common = { onMouseDown: (event: React.MouseEvent) => beginObjectDrag(event, object), style: { cursor: object.locked ? 'not-allowed' : 'move' } };

        if (object.shape === 'circle') {
          return <g key={object.id} {...common}><circle cx={x(object.xMm)} cy={y(object.yMm)} r={s(object.radiusMm || 1)} fill={style.fill} stroke={stroke} strokeWidth={strokeWidth} /><line x1={x(object.xMm) - 5} y1={y(object.yMm)} x2={x(object.xMm) + 5} y2={y(object.yMm)} stroke={stroke} strokeWidth="0.8" /><line x1={x(object.xMm)} y1={y(object.yMm) - 5} x2={x(object.xMm)} y2={y(object.yMm) + 5} stroke={stroke} strokeWidth="0.8" /><text x={x(object.xMm)} y={y(object.yMm) + s(object.radiusMm || 1) + 12} textAnchor="middle" fontSize="9" fill="#44403c">{object.name}</text></g>;
        }

        if (object.shape === 'polygon' && object.points?.length) {
          return <g key={object.id} {...common}><polygon points={object.points.map((point) => `${x(point.x)},${y(point.y)}`).join(' ')} fill={style.fill} stroke={stroke} strokeWidth={strokeWidth} /><text x={x(object.xMm)} y={y(object.yMm) - 6} fontSize="9" fill="#44403c">{object.name}</text></g>;
        }

        const width = object.widthMm || 1;
        const height = object.heightMm || 1;
        return <g key={object.id} transform={`rotate(${object.rotationDeg || 0} ${x(object.xMm + width / 2)} ${y(object.yMm + height / 2)})`} {...common}><rect x={x(object.xMm)} y={y(object.yMm)} width={s(width)} height={s(height)} rx={object.type.includes('Opening') ? 2 : 0} fill={style.fill} stroke={stroke} strokeWidth={strokeWidth} strokeDasharray={object.type.includes('Keepout') || object.type.includes('Zone') ? '5 3' : undefined} /><text x={x(object.xMm) + 5} y={y(object.yMm) - 6} fontSize="9" fill="#44403c">{object.name}</text></g>;
      })}

      {dimensions.map((dimension) => {
        const midX = (dimension.from.xMm + dimension.to.xMm) / 2;
        const midY = (dimension.from.yMm + dimension.to.yMm) / 2;
        const tolerance = dimension.tolerancePlusMm != null || dimension.toleranceMinusMm != null
          ? ` +${dimension.tolerancePlusMm ?? 0}/-${dimension.toleranceMinusMm ?? 0}`
          : '';
        return <g key={dimension.id} pointerEvents="none"><line x1={x(dimension.from.xMm)} y1={y(dimension.from.yMm)} x2={x(dimension.to.xMm)} y2={y(dimension.to.yMm)} stroke="#57534e" strokeWidth="1" markerStart="url(#dimensionArrow)" markerEnd="url(#dimensionArrow)" /><rect x={x(midX) - 34} y={y(midY) - 9} width="68" height="16" fill="#fbfaf6" opacity="0.92" /><text x={x(midX)} y={y(midY) + 3} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="8.5" fill="#292524">{dimension.valueMm.toFixed(2)} mm{tolerance}</text></g>;
      })}
    </svg>
  );
};
