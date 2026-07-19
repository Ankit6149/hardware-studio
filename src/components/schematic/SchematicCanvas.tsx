// SchematicCanvas.tsx — Phase 6 Schematic canvas layout
import React, { useRef, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { SchematicUIState } from './schematicInteraction';
import { getSymbolPinLayouts, snapToGrid } from './schematicGeometry';
import { ReviewResult } from '../../types';

interface SchematicCanvasProps {
  viewState: SchematicUIState;
  onViewStateChange: (patch: Partial<SchematicUIState>) => void;
  ercResults: ReviewResult[];
}

export const SchematicCanvas: React.FC<SchematicCanvasProps> = ({ viewState, onViewStateChange }) => {
  const {
    boardComponents,
    schematicWires,
    addNet,
    nets,
    padNetAssignments,
    updateProjectState
  } = useProjectStore();

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
    sourcePin
  } = viewState;

  // Convert SVG coordinates to canvas coordinates
  const getCanvasCoords = useCallback((e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;
    return { x: snapToGrid(x, 10), y: snapToGrid(y, 10) };
  }, [panX, panY, zoom]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
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
        // Start wire
        onViewStateChange({
          isDrawingWire: true,
          wirePoints: [coords, coords]
        });
      } else {
        // Add vertex point
        onViewStateChange({
          wirePoints: [...wirePoints, coords]
        });
      }
    }
  }, [activeTool, getCanvasCoords, isDrawingWire, onViewStateChange, wirePoints]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDrawingWire && wirePoints.length > 0) {
      const coords = getCanvasCoords(e);
      const points = [...wirePoints];
      points[points.length - 1] = coords;
      onViewStateChange({ wirePoints: points });
    }
  }, [isDrawingWire, wirePoints, getCanvasCoords, onViewStateChange]);

  const handlePinClick = useCallback((e: React.MouseEvent, compId: string, pinNum: string, defaultNet?: string) => {
    e.stopPropagation();
    
    // Find pin definition
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
          // Join or create net!
          const netName = defaultNet || `NET_${srcRefDes}_${sourcePin.pinNumber}_to_${comp.referenceDesignator}_${pinNum}`;
          
          // Check if net already exists
          let net = (nets || []).find(n => n.netName === netName);
          if (!net) {
            net = {
              id: `net_${Date.now()}`,
              netName,
              netType: 'Signal',
              voltage: '',
              sourceComponent: sourcePin.componentId,
              sourcePin: sourcePin.pinNumber,
              targetComponent: compId,
              targetPin: pinNum,
              protocol: 'General',
              currentEstimate: '',
              impedanceRequirement: '',
              notes: 'Generated via Schematic Editor wire connection'
            };
            addNet(net);
          }

          // Create new pad net assignments in store
          const newAssignments = [
            ...(padNetAssignments || []),
            {
              id: `assignment_${Date.now()}_1`,
              componentId: sourcePin.componentId,
              referenceDesignator: (boardComponents || []).find(c => c.id === sourcePin.componentId)?.referenceDesignator || 'U1',
              padName: sourcePin.pinNumber,
              netName
            },
            {
              id: `assignment_${Date.now()}_2`,
              componentId: compId,
              referenceDesignator: comp.referenceDesignator,
              padName: pinNum,
              netName
            }
          ];

          // Create new wire object
          const newWire = {
            id: `wire_${Date.now()}`,
            netId: net.id,
            netName,
            points: finalPoints,
            sourcePinId: `${sourcePin.componentId}_${sourcePin.pinNumber}`,
            targetPinId: `${compId}_${pinNum}`
          };

          // Save back to store
          updateProjectState({
            padNetAssignments: newAssignments,
            schematicWires: [...(schematicWires || []), newWire]
          });

          // Reset routing state
          onViewStateChange({
            isDrawingWire: false,
            sourcePin: null,
            wirePoints: []
          });

          alert(`Connected ${sourcePin.componentId}.${sourcePin.pinNumber} to ${comp.referenceDesignator}.${pinNum} on net '${netName}'!`);
        }
      }
    }
  }, [boardComponents, activeTool, isDrawingWire, onViewStateChange, sourcePin, wirePoints, nets, addNet, padNetAssignments, schematicWires, updateProjectState]);

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
          
          {/* Placed symbols */}
          {(boardComponents || []).map(c => {
            const sx = c.schematic?.x || 150;
            const sy = c.schematic?.y || 150;
            const isSelected = selectedComponentId === c.id;
            const pinLayouts = getSymbolPinLayouts(c, sx, sy);

            return (
              <g
                key={c.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewStateChange({
                    selectedComponentId: c.id,
                    selectedWireId: null
                  });
                }}
                className="cursor-pointer"
              >
                {/* Visual bounding box for selection */}
                {isSelected && (
                  <rect
                    x={sx - 45}
                    y={sy - 35}
                    width={90}
                    height={pinLayouts.length * 10 + 40}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="3,3"
                  />
                )}

                {/* Symbol body box */}
                <rect
                  x={sx - 35}
                  y={sy - 25}
                  width={70}
                  height={pinLayouts.length * 10 + 20}
                  fill="#1e293b"
                  stroke={isSelected ? '#10b981' : '#64748b'}
                  strokeWidth={1.5}
                  rx={2}
                />

                {/* Designator & Value */}
                <text x={sx} y={sy - 30} fill="#10b981" fontSize={8} fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  {c.referenceDesignator}
                </text>
                <text x={sx} y={sy + pinLayouts.length * 10 + 5} fill="#94a3b8" fontSize={8.5} textAnchor="middle">
                  {c.value || c.componentName}
                </text>

                {/* Pins and connection terminals */}
                {pinLayouts.map(p => {
                  const isHovered = hoveredPin?.componentId === c.id && hoveredPin?.pinNumber === p.number;
                  
                  return (
                    <g key={p.number}>
                      {/* Wire terminal line */}
                      <line
                        x1={p.side === 'left' ? p.x : p.x - 10}
                        y1={p.y}
                        x2={p.side === 'left' ? p.x + 10 : p.x}
                        y2={p.y}
                        stroke="#64748b"
                        strokeWidth={1}
                      />
                      
                      {/* Terminal connection circle anchor */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 4.5 : 2.5}
                        fill={isHovered ? '#10b981' : '#ef4444'}
                        className="cursor-pointer transition-all"
                        onClick={(e) => handlePinClick(e, c.id, p.number, p.label)}
                        onMouseEnter={() => onViewStateChange({ hoveredPin: { componentId: c.id, pinNumber: p.number } })}
                        onMouseLeave={() => onViewStateChange({ hoveredPin: null })}
                      />

                      {/* Pin label inside symbol body */}
                      <text
                        x={p.side === 'left' ? p.x + 14 : p.x - 14}
                        y={p.y + 2.5}
                        fill="#cbd5e1"
                        fontSize={7.5}
                        fontFamily="monospace"
                        textAnchor={p.side === 'left' ? 'start' : 'end'}
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Render wires */}
          {(schematicWires || []).map((w, idx) => {
            const isSelected = selectedWireId === w.id;
            
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
