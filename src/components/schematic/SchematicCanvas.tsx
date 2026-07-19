// SchematicCanvas.tsx — Phase 6 Schematic canvas layout & Interactive Dragging
import React, { useRef, useCallback, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { SchematicUIState } from './schematicInteraction';
import { getSymbolPinLayouts, snapToGrid } from './schematicGeometry';
import { ReviewResult } from '../../types';
import { SchematicSymbolRenderer } from './SchematicSymbolRenderer';

interface SchematicCanvasProps {
  viewState: SchematicUIState;
  onViewStateChange: (patch: Partial<SchematicUIState>) => void;
  ercResults: ReviewResult[];
}

export const SchematicCanvas: React.FC<SchematicCanvasProps> = ({ viewState, onViewStateChange }) => {
  const project = useProjectStore();
  const {
    boardComponents,
    schematicWires,
    nets,
    padNetAssignments,
    updateBoardComponent,
    connectComponentPins
  } = project;

  const svgRef = useRef<SVGSVGElement>(null);
  const {
    zoom,
    panX,
    panY,
    activeTool,
    selectedComponentId,
    selectedWireId,
    isDrawingWire,
    wirePoints,
    sourcePin,
    hoveredPin
  } = viewState;

  // Local state to track dragging components
  const [draggedCompId, setDraggedCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Convert SVG coordinates to canvas coordinates
  const getCanvasCoords = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;
    return { x: snapToGrid(x, 10), y: snapToGrid(y, 10) };
  }, [panX, panY, zoom]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (draggedCompId) return; // Ignore clicks while dragging
    if (activeTool === 'pan' || activeTool === 'select') {
      onViewStateChange({
        selectedComponentId: null,
        selectedWireId: null
      });
      return;
    }

    if (activeTool === 'wire') {
      const coords = getCanvasCoords(e);
      if (!isDrawingWire) {
        // Start wire from empty space (Dangling Wire start is not encouraged, pin-click is standard)
      } else {
        // Add vertex point
        onViewStateChange({
          wirePoints: [...wirePoints, coords]
        });
      }
    }
  }, [activeTool, getCanvasCoords, isDrawingWire, onViewStateChange, wirePoints, draggedCompId]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // If drawing wire
    if (isDrawingWire && wirePoints.length > 0) {
      const coords = getCanvasCoords(e);
      const points = [...wirePoints];
      points[points.length - 1] = coords;
      onViewStateChange({ wirePoints: points });
    }
    // If dragging component
    else if (draggedCompId) {
      const coords = getCanvasCoords(e);
      const targetX = snapToGrid(coords.x - dragOffset.x, 10);
      const targetY = snapToGrid(coords.y - dragOffset.y, 10);
      
      const comp = (boardComponents || []).find(c => c.id === draggedCompId);
      if (comp) {
        updateBoardComponent(draggedCompId, {
          schematic: {
            ...comp.schematic,
            placed: true,
            x: targetX,
            y: targetY
          }
        });
      }
    }
  }, [isDrawingWire, wirePoints, draggedCompId, dragOffset, boardComponents, updateBoardComponent, getCanvasCoords, onViewStateChange]);

  const handleMouseUp = useCallback(() => {
    if (draggedCompId) {
      setDraggedCompId(null);
    }
  }, [draggedCompId]);

  const handleComponentMouseDown = useCallback((e: React.MouseEvent, compId: string) => {
    if (activeTool !== 'select') return;
    const comp = (boardComponents || []).find(c => c.id === compId);
    if (!comp || comp.schematic?.locked) return;

    e.stopPropagation();
    const coords = getCanvasCoords(e);
    
    setDraggedCompId(compId);
    setDragOffset({
      x: coords.x - (comp.schematic?.x || 150),
      y: coords.y - (comp.schematic?.y || 150)
    });
    
    onViewStateChange({
      selectedComponentId: compId,
      selectedWireId: null
    });
  }, [activeTool, boardComponents, getCanvasCoords, onViewStateChange]);

  const handlePinClick = useCallback((e: React.MouseEvent, compId: string, pinNum: string, defaultNet?: string) => {
    e.stopPropagation();
    
    const comp = (boardComponents || []).find(c => c.id === compId);
    if (!comp) return;

    if (activeTool === 'wire') {
      if (!isDrawingWire) {
        // Start wire from this pin
        const layouts = getSymbolPinLayouts(comp, comp.schematic?.x || 150, comp.schematic?.y || 150);
        const pinPos = layouts.find(l => l.number === pinNum) || { x: comp.schematic?.x || 150, y: comp.schematic?.y || 150 };
        onViewStateChange({
          isDrawingWire: true,
          sourcePin: { componentId: compId, pinNumber: pinNum },
          wirePoints: [{ x: pinPos.x, y: pinPos.y }, { x: pinPos.x, y: pinPos.y }]
        });
      } else {
        // Finish wire on this pin!
        if (sourcePin && (sourcePin.componentId !== compId || sourcePin.pinNumber !== pinNum)) {
          const layouts = getSymbolPinLayouts(comp, comp.schematic?.x || 150, comp.schematic?.y || 150);
          const pinPos = layouts.find(l => l.number === pinNum) || { x: comp.schematic?.x || 150, y: comp.schematic?.y || 150 };
          const finalPoints = [...wirePoints];
          finalPoints[finalPoints.length - 1] = { x: pinPos.x, y: pinPos.y };

          const srcComp = (boardComponents || []).find(c => c.id === sourcePin.componentId);
          const srcRefDes = srcComp ? srcComp.referenceDesignator : 'U';
          
          // Normalize Power net names or compose custom signals
          let netName = defaultNet || '';
          if (!netName) {
            const upName = (pName: string) => pName.toUpperCase();
            const sourcePinName = srcComp?.pins?.find(p => p.pinNumber === sourcePin.pinNumber)?.pinName || '';
            const targetPinName = comp.pins?.find(p => p.pinNumber === pinNum)?.pinName || '';
            
            if (upName(sourcePinName) === 'GND' || upName(targetPinName) === 'GND') netName = 'GND';
            else if (upName(sourcePinName) === '3V3' || upName(targetPinName) === '3V3') netName = '3V3';
            else if (upName(sourcePinName) === '5V' || upName(targetPinName) === '5V') netName = '5V';
            else netName = `NET_${srcRefDes}_${sourcePin.pinNumber}_to_${comp.referenceDesignator}_${pinNum}`;
          }

          // Use the canonical store action to guarantee identical Net IDs
          connectComponentPins(
            sourcePin.componentId,
            sourcePin.pinNumber,
            compId,
            pinNum,
            netName,
            finalPoints
          );

          // Reset routing state
          onViewStateChange({
            isDrawingWire: false,
            sourcePin: null,
            wirePoints: []
          });
        }
      }
    }
  }, [boardComponents, activeTool, isDrawingWire, onViewStateChange, sourcePin, wirePoints, connectComponentPins]);

  // Only render schematic-placed components
  const placedComponents = (boardComponents || []).filter(c => c.schematic?.placed === true);

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-slate-900 select-none">
      {/* Schematic SVG canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className="cursor-crosshair"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Snap Grid pattern */}
          <pattern id="schematicGrid" width={20} height={20} patternUnits="userSpaceOnUse">
            <circle cx={1} cy={1} r={1} fill="#334155" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#schematicGrid)" />

        {/* Outer view translation group */}
        <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
          
          {/* Placed symbols utilizing symbol renderer */}
          {placedComponents.map(c => {
            const sx = c.schematic?.x || 150;
            const sy = c.schematic?.y || 150;
            const isSelected = selectedComponentId === c.id;

            return (
              <g
                key={c.id}
                transform={`translate(${sx}, ${sy})`}
                onMouseDown={(e) => handleComponentMouseDown(e, c.id)}
                className="cursor-pointer"
              >
                <SchematicSymbolRenderer
                  componentType={c.componentType}
                  referenceDesignator={c.referenceDesignator}
                  value={c.value}
                  packageName={c.packageName}
                  pins={c.pins || []}
                  rotation={c.schematic?.rotation || 0}
                  isSelected={isSelected}
                  hoveredPinNumber={hoveredPin?.componentId === c.id ? hoveredPin.pinNumber : null}
                  onPinClick={(e, pinNum, pinLabel) => handlePinClick(e, c.id, pinNum, pinLabel)}
                  onPinMouseEnter={(pinNum) => onViewStateChange({ hoveredPin: { componentId: c.id, pinNumber: pinNum } })}
                  onPinMouseLeave={() => onViewStateChange({ hoveredPin: null })}
                />
              </g>
            );
          })}

          {/* Render wires */}
          {(schematicWires || []).map((w, idx) => {
            const isSelected = selectedWireId === w.id;
            if (!w.points || w.points.length < 2) return null;
            
            return (
              <g
                key={w.id || idx}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewStateChange({
                    selectedWireId: w.id,
                    selectedComponentId: null
                  });
                }}
              >
                {/* Background fat stroke for easy clicking selection */}
                <path
                  d={`M ${w.points.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={8}
                  className="cursor-pointer"
                />
                {/* Real wire segment */}
                <path
                  d={`M ${w.points.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                  fill="none"
                  stroke={isSelected ? '#10b981' : '#38bdf8'}
                  strokeWidth={1.5}
                  className="transition-all"
                />
                
                {/* Net text label near first segment */}
                {w.points.length > 0 && (
                  <text
                    x={w.points[0].x + 10}
                    y={w.points[0].y - 4}
                    fill="#38bdf8"
                    fontSize={7.5}
                    fontFamily="monospace"
                  >
                    {w.netName}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active wire routing preview */}
          {isDrawingWire && wirePoints.length > 0 && (
            <g>
              <path
                d={`M ${wirePoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                fill="none"
                stroke="#10b981"
                strokeWidth={1.2}
                strokeDasharray="2,2"
              />
              <circle
                cx={wirePoints[wirePoints.length - 1].x}
                cy={wirePoints[wirePoints.length - 1].y}
                r={3}
                fill="#10b981"
              />
            </g>
          )}

          {/* Origin grid crosshair */}
          <line x1={-10} y1={0} x2={10} y2={0} stroke="#475569" strokeWidth={1} />
          <line x1={0} y1={-10} x2={0} y2={10} stroke="#475569" strokeWidth={1} />
        </g>
      </svg>

      {/* Action Mode banner */}
      <div className="absolute top-2 left-2 bg-slate-950/90 border border-slate-800 text-[10px] px-2 py-1 rounded flex items-center gap-1.5 font-mono shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span className="text-slate-400">Tool:</span>
        <span className="text-emerald-450 uppercase font-bold">{activeTool}</span>
        {isDrawingWire && (
          <span className="text-amber-500 font-semibold">(Press ESC to cancel wire)</span>
        )}
      </div>
    </div>
  );
};
