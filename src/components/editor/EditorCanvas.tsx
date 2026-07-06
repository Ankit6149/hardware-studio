import React, { useState, useRef } from 'react';
import { EditorObject, EditorConnection, EditorMode, Project } from '../../types';
import { EditorUIState } from './editorTypes';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface EditorCanvasProps {
  uiState: EditorUIState;
  setUiState: React.Dispatch<React.SetStateAction<EditorUIState>>;
  objects: EditorObject[];
  connections: EditorConnection[];
  onUpdatePosition: (id: string, x: number, y: number) => void;
  project: Project;
  onGenerateLayouts?: () => void;
  onAutoAction?: (action: string) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  uiState,
  setUiState,
  objects,
  connections,
  onUpdatePosition,
  project,
  onGenerateLayouts,
  onAutoAction
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });

  const GRID_SIZE = 20;

  // Zoom actions
  const handleZoomIn = () => setUiState(p => ({ ...p, zoom: Math.min(2.0, p.zoom + 0.1) }));
  const handleZoomOut = () => setUiState(p => ({ ...p, zoom: Math.max(0.5, p.zoom - 0.1) }));
  const handleZoomReset = () => setUiState(p => ({ ...p, zoom: 1.0, panX: 0, panY: 0 }));

  // Pointer/Mouse events for Panning and Dragging
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // If middle click or space key pressed, start panning
    if (e.button === 1 || e.button === 0) {
      const target = e.target as SVGElement;
      if (target.tagName === 'svg' || target.getAttribute('data-canvas-background') === 'true') {
        setIsPanning(true);
        setPanStart({ x: e.clientX - uiState.panX, y: e.clientY - uiState.panY });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setUiState(prev => ({
        ...prev,
        panX: e.clientX - panStart.x,
        panY: e.clientY - panStart.y
      }));
    } else if (draggedObjectId) {
      const draggedObj = objects.find(o => o.id === draggedObjectId);
      if (draggedObj && !draggedObj.locked) {
        // Calculate coordinate in canvas scale space
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const clientX = e.clientX - rect.left - uiState.panX;
          const clientY = e.clientY - rect.top - uiState.panY;
          
          let rawX = clientX / uiState.zoom - dragStartOffset.x;
          let rawY = clientY / uiState.zoom - dragStartOffset.y;

          if (uiState.snapToGrid) {
            rawX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
            rawY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
          }

          const maxX = 800 - (draggedObj.width || 40);
          const maxY = 600 - (draggedObj.height || 40);
          onUpdatePosition(draggedObjectId, Math.max(0, Math.min(maxX, rawX)), Math.max(0, Math.min(maxY, rawY)));
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedObjectId(null);
  };

  const handleObjectMouseDown = (e: React.MouseEvent, obj: EditorObject) => {
    e.stopPropagation();
    if (obj.locked) return;

    setUiState(prev => ({ ...prev, selectedObjectId: obj.id }));
    setDraggedObjectId(obj.id);
    
    // Calculate click coordinates in canvas scaled coordinates space
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = (e.clientX - rect.left - uiState.panX) / uiState.zoom;
      const clickY = (e.clientY - rect.top - uiState.panY) / uiState.zoom;
      setDragStartOffset({
        x: clickX - obj.x,
        y: clickY - obj.y
      });
    }
  };

  // Render warning message based on editor mode
  const getEditorDisclaimer = (mode: EditorMode): string => {
    switch (mode) {
      case 'product': return "CONCEPTUAL PRODUCT SUBSYSTEMS ARCHITECTURE MAP - NOT FINAL HARDWARE LAYOUT";
      case 'mechanical': return "CONCEPTUAL ENCLOSURE VOLUME MODEL - FINAL MCAD STEP / ASSEMBLY FILES REQUIRED";
      case 'assembly': return "EXPLODED LAYER ASSEMBLY SEQUENCE SCHEMATIC - VERIFY TOLERANCES MANUALLY";
      case 'board': return "BOARD EDGE CONTOUR PREP - FINAL COPPER ROUTING AND ECAD DATABASE LAYOUT REQUIRED";
      case 'components': return "CONCEPTUAL FOOTPRINTS MOUNT COORDINATES MAP - NOT FINAL PICK-AND-PLACE CPL FILE";
      case 'circuits': return "CIRCUIT MODULE PRE-LAYOUT PLANNING SYMBOLS - CERTIFIED ELECTRONIC SCHEMATIC REQUIRED";
      case 'nets': return "LOGICAL SIGNAL NET ROUTING TRACKS MATRIX - PHYSICAL ROUTING IMPEDANCE CHECK REQUIRED IN CAD";
      case 'power': return "POWER TREE STAGES AND STANDBY LOAD REGULATORS CHAIN - NOT FOR DIRECT STABILITY APPROVAL";
      case 'pins': return "MICROCONTROLLER PHYSICAL IO PORT ROUTING MAP - VERIFY SIGNAL CONFLICTS MANUALLY";
      case 'firmware': return "FIRMWARE DRIVERS FLOW EVENT LOOP SKELETON - CODE SKELETON GENERATED MANUALLY";
      case 'testing': return "GATING VERIFICATION SUITE LANES - AUDIT SAFETY CONSTRAINTS IN DFM";
      case 'handoff': return "MANUFACTURING GATES AND MISSING FILES PACK STATUS - SUBMIT TO EXTERNAL PRODUCTION HOUSE FOR FAB";
      default: return "CONCEPTUAL HARDWARE PREPARATION BLUEPRINT";
    }
  };

  return (
    <div ref={canvasRef} className="flex-1 bg-slate-950 overflow-hidden relative select-none">
      
      {/* CAD Grid Canvas background SVG */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Define Grid Patterns */}
        <defs>
          <pattern id="canvas-grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
            <path d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`} fill="none" stroke="#1e293b" strokeWidth="0.8" />
          </pattern>
          <pattern id="canvas-major-grid" width={GRID_SIZE * 5} height={GRID_SIZE * 5} patternUnits="userSpaceOnUse">
            <rect width={GRID_SIZE * 5} height={GRID_SIZE * 5} fill="url(#canvas-grid)" />
            <path d={`M ${GRID_SIZE * 5} 0 L 0 0 0 ${GRID_SIZE * 5}`} fill="none" stroke="#334155" strokeWidth="1.2" />
          </pattern>
        </defs>

        {/* Main drafting grid layout */}
        {uiState.showGrid && (
          <rect
            width="100%"
            height="100%"
            fill="url(#canvas-major-grid)"
            data-canvas-background="true"
          />
        )}
        <rect
          width="100%"
          height="100%"
          fill="transparent"
          data-canvas-background="true"
          onClick={() => setUiState(prev => ({ ...prev, selectedObjectId: null }))}
        />

        {/* Dynamic Zoom & Pan translation group */}
        <g transform={`translate(${uiState.panX}, ${uiState.panY}) scale(${uiState.zoom})`}>
          
          {/* Connection Lines (lower z-index) */}
          {connections
            .filter(c => c.mode === uiState.activeMode)
            .map((conn, idx) => {
              const src = objects.find(o => o.id === conn.sourceObjectId);
              const dst = objects.find(o => o.id === conn.targetObjectId);
              if (!src || !dst) return null;

              // Find center of objects
              const x1 = src.x + src.width / 2;
              const y1 = src.y + src.height / 2;
              const x2 = dst.x + dst.width / 2;
              const y2 = dst.y + dst.height / 2;

              let lineStroke = "#475569";
              if (conn.kind === 'power') lineStroke = "#f43f5e";
              else if (conn.kind === 'ground') lineStroke = "#10b981";
              else if (conn.kind === 'assembly') lineStroke = "#eab308";

              return (
                <g key={conn.id || idx}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={lineStroke}
                    strokeWidth="1.5"
                    strokeDasharray={conn.kind === 'assembly' ? '4,4' : 'none'}
                    markerEnd={conn.kind === 'signal' || conn.kind === 'assembly' ? 'url(#arrow)' : ''}
                  />
                  {conn.label && uiState.showLabels && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 4}
                      fill="#94a3b8"
                      className="text-[8px] font-mono font-bold text-center"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}

          {/* SVG Elements / Outlines */}
          {objects
            .filter(obj => obj.mode === uiState.activeMode && uiState.visibleLayers[obj.layer || ''] !== false)
            .map(obj => {
              const isSelected = uiState.selectedObjectId === obj.id;
              
              // Determine fill / stroke based on object type
              let stroke = isSelected ? "#10b981" : "#475569";
              let fill = "rgba(15, 23, 42, 0.75)";
              const strokeWidth = isSelected ? "2" : "1.2";

              if (obj.sourceType === 'warning') {
                stroke = "#ef4444";
                fill = "rgba(220, 38, 38, 0.15)";
              }

              // Render shapes dynamically depending on type
              const isCircular = obj.kind === 'circular-zone' || obj.kind === 'hole';

              return (
                <g
                  key={obj.id}
                  transform={`translate(${obj.x}, ${obj.y}) rotate(${obj.rotation || 0}, ${obj.width / 2}, ${obj.height / 2})`}
                  onMouseDown={(e) => handleObjectMouseDown(e, obj)}
                  className="cursor-move"
                >
                  {isCircular ? (
                    <>
                      <circle
                        cx={obj.width / 2}
                        cy={obj.height / 2}
                        r={obj.width / 2}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                      />
                      {isSelected && (
                        <circle
                          cx={obj.width / 2}
                          cy={obj.height / 2}
                          r={obj.width / 2 + 2}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <rect
                        width={obj.width}
                        height={obj.height}
                        rx="3"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                      />
                      {isSelected && (
                        <rect
                          x="-2"
                          y="-2"
                          width={obj.width + 4}
                          height={obj.height + 4}
                          rx="4"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                        />
                      )}
                    </>
                  )}

                  {/* SMT Pins details for component/chip blocks */}
                  {obj.sourceType === 'component' && obj.width > 30 && (
                    <g>
                      {/* Left pins */}
                      <rect x="-3" y="4" width="3" height="4" fill="#94a3b8" />
                      <rect x="-3" y="12" width="3" height="4" fill="#94a3b8" />
                      <rect x="-3" y="20" width="3" height="4" fill="#94a3b8" />
                      {/* Right pins */}
                      <rect x={obj.width} y="4" width="3" height="4" fill="#94a3b8" />
                      <rect x={obj.width} y="12" width="3" height="4" fill="#94a3b8" />
                      <rect x={obj.width} y="20" width="3" height="4" fill="#94a3b8" />
                    </g>
                  )}

                  {/* Display Labels */}
                  {uiState.showLabels && (
                    <text
                      x={obj.width / 2}
                      y={obj.height / 2 + 3}
                      fill={isSelected ? "#fff" : "#cbd5e1"}
                      className="text-[9px] font-bold font-mono text-center select-none"
                      textAnchor="middle"
                    >
                      {obj.label}
                    </text>
                  )}

                  {/* Display Sub-value details */}
                  {uiState.showLabels && obj.metadata && (
                    <text
                      x={obj.width / 2}
                      y={obj.height / 2 + 12}
                      fill="#94a3b8"
                      className="text-[7.5px] font-mono text-center select-none"
                      textAnchor="middle"
                    >
                      {obj.metadata.footprint || obj.metadata.fileStatus || obj.metadata.activeCurrent || ""}
                    </text>
                  )}

                  {/* Lock Indicator */}
                  {obj.locked && (
                    <g transform={`translate(${obj.width - 12}, 2)`}>
                      <circle cx="5" cy="5" r="4.5" fill="#f43f5e" />
                      <path d="M3.5,4 L6.5,4" stroke="#fff" strokeWidth="1" />
                    </g>
                  )}
                </g>
              );
            })}

        </g>

        {/* Define Arrow Marker */}
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
          </marker>
        </defs>
      </svg>

      {/* Honesty Stamp Banner overlay */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded px-3 py-1.5 backdrop-blur shadow-md flex items-center space-x-2 select-none z-10 max-w-[95%] pointer-events-none">
        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
        <span className="text-[9px] font-black font-mono tracking-widest text-slate-350 uppercase">
          {getEditorDisclaimer(uiState.activeMode)}
        </span>
      </div>

      {/* Canvas Zoom Widget Panel */}
      <div className="absolute top-3 right-3 flex flex-col bg-slate-900 border border-slate-800 rounded shadow-lg overflow-hidden select-none z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomReset}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Fit Canvas Center"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Empty State Overlay */}
      {objects.length === 0 && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-20 pointer-events-auto">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">
              Drawing Layout Empty
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No canvas objects exist for **{uiState.activeMode.toUpperCase()}** mode yet. 
              {uiState.activeMode === 'components' && (project.boardComponents || []).length === 0 && (
                <span className="block mt-1 font-semibold text-amber-400">SMT components need to be added to the project first.</span>
              )}
              {uiState.activeMode === 'circuits' && (project.circuitBlocks || []).length === 0 && (
                <span className="block mt-1 font-semibold text-amber-400">Circuit blocks need to be configured in Circuit Planner.</span>
              )}
              {uiState.activeMode === 'nets' && (project.nets || []).length === 0 && (
                <span className="block mt-1 font-semibold text-amber-400">Signal nets need to be configured in Nets/Connections list.</span>
              )}
            </p>
            <div className="flex flex-col space-y-2 pt-2">
              <button
                onClick={() => {
                  if (onGenerateLayouts) onGenerateLayouts();
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono tracking-widest text-[9.5px] uppercase py-2 px-4 rounded transition-colors cursor-pointer"
              >
                Generate Drawing Layouts
              </button>
              {uiState.activeMode === 'components' && (project.boardComponents || []).length === 0 && (
                <button
                  onClick={() => {
                    if (onAutoAction) onAutoAction('auto-components');
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono tracking-widest text-[9.5px] uppercase py-2 px-4 rounded transition-colors cursor-pointer"
                >
                  Auto-Place Components
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
