import React, { useState, useRef, useEffect } from 'react';
import { EditorObject, EditorConnection, EditorMode, Project } from '../../types';
import { EditorUIState } from './editorTypes';
import { ZoomIn, ZoomOut, Maximize, Save } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';

interface EditorCanvasProps {
  uiState: EditorUIState;
  setUiState: React.Dispatch<React.SetStateAction<EditorUIState>>;
  objects: EditorObject[];
  connections: EditorConnection[];
  onUpdatePosition: (id: string, x: number, y: number) => void;
  project: Project;
  onGenerateLayouts?: () => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  uiState,
  setUiState,
  objects,
  connections,
  onUpdatePosition,
  project,
  onGenerateLayouts
}) => {
  const store = useProjectStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedObjectId, setDraggedObjectId] = useState<string | null>(null);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  const GRID_SIZE = uiState.snapToGrid ? 10 : 1;

  // Zoom actions
  const handleZoomIn = () => setUiState(p => ({ ...p, zoom: Math.min(3.0, p.zoom + 0.1) }));
  const handleZoomOut = () => setUiState(p => ({ ...p, zoom: Math.max(0.3, p.zoom - 0.1) }));
  const handleZoomReset = () => setUiState(p => ({ ...p, zoom: 1.0, panX: 0, panY: 0 }));

  // Keyboards shortcuts (Nudge, Duplicate, Delete, Deselect, Save indicators)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const activeMode = uiState.activeMode;
      const selectedId = uiState.selectedObjectId;
      const step = e.shiftKey ? 20 : GRID_SIZE;

      if (e.key === 'Escape') {
        setUiState(prev => ({ ...prev, selectedObjectId: null }));
      }

      if (selectedId) {
        const currentObj = objects.find(o => o.id === selectedId);
        if (currentObj && !currentObj.locked) {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            onUpdatePosition(selectedId, currentObj.x, currentObj.y - step);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            onUpdatePosition(selectedId, currentObj.x, currentObj.y + step);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onUpdatePosition(selectedId, currentObj.x - step, currentObj.y);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            onUpdatePosition(selectedId, currentObj.x + step, currentObj.y);
          } else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            store.deleteEditorObject(activeMode, selectedId);
            setUiState(prev => ({ ...prev, selectedObjectId: null }));
          } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
            e.preventDefault();
            store.duplicateEditorObject(activeMode, selectedId);
          }
        }
      }

      // Save local backup indicator
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowSaveIndicator(true);
        setTimeout(() => setShowSaveIndicator(false), 2000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [uiState.selectedObjectId, uiState.activeMode, objects, GRID_SIZE, onUpdatePosition, project, setUiState, store]);

  // Pointer events for Canvas Panning and Dragging
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
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
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const clientX = e.clientX - rect.left - uiState.panX;
          const clientY = e.clientY - rect.top - uiState.panY;
          
          let rawX = clientX / uiState.zoom - dragStartOffset.x;
          let rawY = clientY / uiState.zoom - dragStartOffset.y;

          if (uiState.snapToGrid) {
            rawX = Math.round(rawX / 10) * 10;
            rawY = Math.round(rawY / 10) * 10;
          }

          const maxX = 1200 - (draggedObj.width || 40);
          const maxY = 1000 - (draggedObj.height || 40);
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
    setUiState(prev => ({ ...prev, selectedObjectId: obj.id }));
    if (obj.locked) return;
    setDraggedObjectId(obj.id);
    
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

  const getEditorDisclaimer = (mode: EditorMode): string => {
    switch (mode) {
      case 'product': return "Subsystem Blocks Architecture - Generated In App";
      case 'mechanical': return "Conceptual Enclosure Zones Casing - Requires Fabrication Review";
      case 'assembly': return "Exploded Stack Order - Requires Human Engineer Approval";
      case 'board': return "Substrate Outline Draft - Requires DFM Review";
      case 'components': return "SMT Footprints Courtyards - Generated In App";
      case 'circuits': return "Schematic-Prep Symbols Graph - Requires Human Engineer Approval";
      case 'nets': return "Logical Signal Netlist - Requires Human Engineer Approval";
      case 'power': return "Power Regulator Tree - Generated In App";
      case 'pins': return "Controller Port Pinout Map - Generated In App";
      case 'firmware': return "Firmware Event Loop Blocks - Draft Skeleton Flow";
      case 'testing': return "EVT/DVT Verification Timeline swimlanes";
      case 'handoff': return "Release Package Files Status - Requires DFM Review";
      default: return "Conceptual Engineering Blueprint Draft";
    }
  };

  // Render schematic SVG symbols based on type (IC, Resistor, Capacitor, Diode, Ground, Connector)
  const drawSchematicSymbol = (kind: string, width: number, height: number, stroke: string) => {
    const k = kind.toLowerCase();
    if (k === 'resistor' || k.includes('res')) {
      return (
        <path d={`M 0 ${height/2} L 10 ${height/2} L 13 ${height/2 - 8} L 17 ${height/2 + 8} L 21 ${height/2 - 8} L 25 ${height/2 + 8} L 29 ${height/2 - 8} L 33 ${height/2 + 8} L 37 ${height/2 - 8} L 40 ${height/2} H ${width}`} stroke={stroke} strokeWidth="1.5" fill="none" />
      );
    }
    if (k === 'capacitor' || k.includes('cap')) {
      return (
        <g stroke={stroke} strokeWidth="1.5" fill="none">
          <line x1="0" y1={height/2} x2={width/2 - 3} y2={height/2} />
          <line x1={width/2 - 3} y1={height/2 - 10} x2={width/2 - 3} y2={height/2 + 10} />
          <line x1={width/2 + 3} y1={height/2 - 10} x2={width/2 + 3} y2={height/2 + 10} />
          <line x1={width/2 + 3} y1={height/2} x2={width} y2={height/2} />
        </g>
      );
    }
    if (k === 'diode' || k === 'led') {
      return (
        <g stroke={stroke} strokeWidth="1.5" fill="none">
          <line x1="0" y1={height/2} x2={width/2 - 6} y2={height/2} />
          <path d={`M ${width/2 - 6} ${height/2 - 8} L ${width/2 + 6} ${height/2} L ${width/2 - 6} ${height/2 + 8} Z`} fill="rgba(99, 102, 241, 0.2)" />
          <line x1={width/2 + 6} y1={height/2 - 8} x2={width/2 + 6} y2={height/2 + 8} />
          <line x1={width/2 + 6} y1={height/2} x2={width} y2={height/2} />
          {k === 'led' && (
            <g strokeWidth="1">
              <line x1={width/2} y1={height/2 - 10} x2={width/2 + 8} y2={height/2 - 16} markerEnd="url(#tiny-arrow)" />
              <line x1={width/2 + 5} y1={height/2 - 7} x2={width/2 + 13} y2={height/2 - 13} markerEnd="url(#tiny-arrow)" />
            </g>
          )}
        </g>
      );
    }
    if (k === 'ground' || k === 'gnd') {
      return (
        <g stroke={stroke} strokeWidth="1.5" fill="none">
          <line x1={width/2} y1="0" x2={width/2} y2={height/2} />
          <line x1={width/2 - 12} y1={height/2} x2={width/2 + 12} y2={height/2} />
          <line x1={width/2 - 7} y1={height/2 + 4} x2={width/2 + 7} y2={height/2 + 4} />
          <line x1={width/2 - 3} y1={height/2 + 8} x2={width/2 + 3} y2={height/2 + 8} />
        </g>
      );
    }
    if (k.includes('power') || k.includes('vcc') || k.includes('rail')) {
      return (
        <g stroke={stroke} strokeWidth="1.5" fill="none">
          <line x1={width/2} y1={height} x2={width/2} y2={height/2} />
          <path d={`M ${width/2 - 6} ${height/2} L ${width/2} ${height/2 - 6} L ${width/2 + 6} ${height/2} Z`} fill="rgba(244, 63, 94, 0.4)" />
        </g>
      );
    }
    // Default IC/Connector Box with left/right terminals
    return (
      <g>
        <rect width={width} height={height} rx="3" fill="rgba(15, 23, 42, 0.85)" stroke={stroke} strokeWidth="1.5" />
        {/* Terminals left */}
        <line x1="-4" y1={height*0.25} x2="0" y2={height*0.25} stroke={stroke} strokeWidth="1.5" />
        <line x1="-4" y1={height*0.5} x2="0" y2={height*0.5} stroke={stroke} strokeWidth="1.5" />
        <line x1="-4" y1={height*0.75} x2="0" y2={height*0.75} stroke={stroke} strokeWidth="1.5" />
        {/* Terminals right */}
        <line x1={width} y1={height*0.25} x2={width + 4} y2={height*0.25} stroke={stroke} strokeWidth="1.5" />
        <line x1={width} y1={height*0.5} x2={width + 4} y2={height*0.5} stroke={stroke} strokeWidth="1.5" />
        <line x1={width} y1={height*0.75} x2={width + 4} y2={height*0.75} stroke={stroke} strokeWidth="1.5" />
      </g>
    );
  };

  // Render ratsnest guidelines for Net list Mode
  const renderRatsnest = () => {
    if (uiState.activeMode !== 'nets') return null;
    const items = objects.filter(o => o.mode === 'nets' && o.sourceType === 'net');
    
    return items.map((net, idx) => {
      // Draw light dashed routing pathways for unrouted networks
      const matchedTrace = (project.traces || []).some(t => t.netId === net.sourceId);
      if (matchedTrace) return null; // Already routed

      return (
        <line
          key={`rats_${net.id}_${idx}`}
          x1={net.x + net.width/2}
          y1={net.y + net.height/2}
          x2={net.x + net.width/2 + 60} // Conceptual routing lane target
          y2={net.y + net.height/2 + 60}
          stroke="#475569"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.6"
        />
      );
    });
  };

  // Render Product Architecture Column Dividers
  const renderArchitectureColumns = () => {
    if (uiState.activeMode !== 'product') return null;
    const columns = ["Input", "Processing", "Power", "Feedback", "Wireless", "Mechanical", "Firmware", "Integration"];
    
    return (
      <g opacity="0.4" pointerEvents="none">
        {columns.map((col, idx) => {
          const x = 50 + idx * 150;
          return (
            <g key={col}>
              <line x1={x} y1="30" x2={x} y2="580" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
              <text x={x + 75} y="45" fill="#94a3b8" className="text-[9px] font-mono font-black uppercase tracking-wider" textAnchor="middle">
                {col}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  // Render Exploed Assembly guides
  const renderAssemblyGuides = () => {
    if (uiState.activeMode !== 'assembly') return null;
    return (
      <g opacity="0.25" pointerEvents="none">
        {objects
          .filter(o => o.mode === 'assembly' && o.sourceType === 'assembly-layer')
          .map((layer, idx, arr) => {
            if (idx === arr.length - 1) return null;
            const next = arr[idx + 1];
            return (
              <path
                key={`guide_${layer.id}`}
                d={`M ${layer.x + 30} ${layer.y + layer.height} L ${next.x + 30} ${next.y}`}
                stroke="#eab308"
                strokeWidth="1.5"
                strokeDasharray="4,2"
                fill="none"
              />
            );
          })}
      </g>
    );
  };

  // Render Ring Mechanical concentric profiles
  const renderRingMechanicalProfiles = () => {
    const isRing = project.projectName?.toLowerCase().includes("ring") || project.templateName?.toLowerCase().includes("ring");
    if (uiState.activeMode !== 'mechanical' || !isRing) return null;

    return (
      <g opacity="0.15" fill="none" stroke="#6366f1" strokeWidth="1.5" pointerEvents="none">
        {/* Ring Center */}
        <circle cx="400" cy="300" r="100" />
        <circle cx="400" cy="300" r="140" stroke="#f43f5e" strokeDasharray="4,4" />
        <circle cx="400" cy="300" r="160" />
        <line x1="400" y1="120" x2="400" y2="480" stroke="#334155" strokeWidth="0.8" />
        <line x1="220" y1="300" x2="580" y2="300" stroke="#334155" strokeWidth="0.8" />
      </g>
    );
  };

  const activeLayoutObjects = objects.filter(obj => obj.mode === uiState.activeMode && uiState.visibleLayers[obj.layer || ''] !== false);

  return (
    <div ref={canvasRef} className="flex-1 bg-slate-950 overflow-hidden relative select-none">
      
      {/* Toast Save indicator */}
      {showSaveIndicator && (
        <div className="absolute top-4 left-4 z-40 bg-slate-900 border border-indigo-500/30 text-white text-[10px] uppercase font-mono px-3 py-1.5 rounded shadow-2xl flex items-center space-x-2 animate-bounce">
          <Save className="w-3.5 h-3.5 text-indigo-400" />
          <span>Local backup file state saved to local storage</span>
        </div>
      )}

      {/* CAD Grid Canvas background SVG */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <pattern id="canvas-grid-v3" width={20} height={20} patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.8" fill="#334155" opacity="0.6" />
          </pattern>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
          </marker>
          <marker id="tiny-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto">
            <path d="M 0 2 L 6 5 L 0 8 z" fill="#6366f1" />
          </marker>
        </defs>

        {/* Main drafting grid layout dots */}
        {uiState.showGrid && (
          <rect
            width="100%"
            height="100%"
            fill="url(#canvas-grid-v3)"
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
          
          {/* Architecture columns header grids */}
          {renderArchitectureColumns()}

          {/* Exploded assembly center guides */}
          {renderAssemblyGuides()}

          {/* Ring Concentric Circles Profile guides */}
          {renderRingMechanicalProfiles()}

          {/* Connection Lines */}
          {connections
            .filter(c => c.mode === uiState.activeMode)
            .map((conn, idx) => {
              const src = objects.find(o => o.id === conn.sourceObjectId);
              const dst = objects.find(o => o.id === conn.targetObjectId);
              if (!src || !dst) return null;

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
                    strokeDasharray={conn.kind === 'assembly' ? '3,3' : 'none'}
                    markerEnd={conn.kind === 'signal' || conn.kind === 'assembly' ? 'url(#arrow)' : ''}
                  />
                  {conn.label && uiState.showLabels && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 4}
                      fill="#64748b"
                      className="text-[8px] font-mono font-bold text-center select-none pointer-events-none"
                      textAnchor="middle"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}

          {/* Dashed unrouted ratsnest guides */}
          {renderRatsnest()}

          {/* Active Canvas Objects */}
          {activeLayoutObjects.map(obj => {
            const isSelected = uiState.selectedObjectId === obj.id;
            
            let stroke = isSelected ? "#10b981" : "#334155";
            let fill = "rgba(15, 23, 42, 0.85)";
            const strokeWidth = isSelected ? "2.2" : "1.2";

            if (obj.sourceType === 'warning') {
              stroke = "#ef4444";
              fill = "rgba(220, 38, 38, 0.12)";
            }

            const isCircular = obj.kind === 'circular-zone' || obj.kind === 'hole';
            const isSchematic = uiState.activeMode === 'circuits';

            return (
              <g
                key={obj.id}
                transform={`translate(${obj.x}, ${obj.y}) rotate(${obj.rotation || 0}, ${obj.width / 2}, ${obj.height / 2})`}
                onMouseDown={(e) => handleObjectMouseDown(e, obj)}
                className="cursor-move group"
              >
                {isSchematic ? (
                  // Draw schematic symbols instead of standard rectangles (Phase 9)
                  <g>
                    {drawSchematicSymbol(obj.kind, obj.width, obj.height, stroke)}
                    {isSelected && (
                      <rect
                        x="-4"
                        y="-4"
                        width={obj.width + 8}
                        height={obj.height + 8}
                        rx="4"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    )}
                  </g>
                ) : isCircular ? (
                  // Circular shapes (Drills / Mechanical concentric items)
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
                        r={obj.width / 2 + 3}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    )}
                  </>
                ) : (
                  // Rectangular outline blocks
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
                        x="-3"
                        y="-3"
                        width={obj.width + 6}
                        height={obj.height + 6}
                        rx="4"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1"
                        strokeDasharray="2,2"
                      />
                    )}
                  </>
                )}

                {/* Plated pins courtyard visualization for Component Placement Mode (Phase 11) */}
                {uiState.activeMode === 'components' && obj.sourceType === 'component' && (
                  <g opacity="0.6">
                    {/* Tiny metal lead pads */}
                    <rect x="-2" y="3" width="2.5" height="3" fill="#e2e8f0" rx="0.5" />
                    <rect x="-2" y={obj.height - 6} width="2.5" height="3" fill="#e2e8f0" rx="0.5" />
                    <rect x={obj.width - 0.5} y="3" width="2.5" height="3" fill="#e2e8f0" rx="0.5" />
                    <rect x={obj.width - 0.5} y={obj.height - 6} width="2.5" height="3" fill="#e2e8f0" rx="0.5" />
                  </g>
                )}

                {/* Trace Segment visual routing line (Phase 12) */}
                {uiState.activeMode === 'nets' && obj.sourceType === 'net' && (
                  <path
                    d={`M ${obj.width/2} ${obj.height} Q ${obj.width/2 + 20} ${obj.height + 30} ${obj.width/2} ${obj.height + 50}`}
                    stroke="#f43f5e"
                    strokeWidth="1.8"
                    fill="none"
                    opacity="0.75"
                  />
                )}

                {/* Display Labels */}
                {uiState.showLabels && (
                  <text
                    x={obj.width / 2}
                    y={obj.height / 2 + 2}
                    fill={isSelected ? "#fff" : "#e2e8f0"}
                    className="text-[9px] font-black font-mono text-center select-none pointer-events-none"
                    textAnchor="middle"
                  >
                    {obj.label}
                  </text>
                )}

                {/* Display Sub-value details */}
                {uiState.showLabels && obj.metadata && (
                  <text
                    x={obj.width / 2}
                    y={obj.height / 2 + 11}
                    fill="#64748b"
                    className="text-[7px] font-mono text-center select-none pointer-events-none"
                    textAnchor="middle"
                  >
                    {obj.metadata.footprint || obj.metadata.fileStatus || obj.metadata.activeCurrent || ""}
                  </text>
                )}

                {/* Lock indicator tag */}
                {obj.locked && (
                  <g transform={`translate(${obj.width - 10}, 2)`}>
                    <circle cx="4" cy="4" r="3.5" fill="#f43f5e" />
                  </g>
                )}
              </g>
            );
          })}

        </g>
      </svg>

      {/* Honesty Stamp disclaimer banner */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded px-3 py-1.5 backdrop-blur shadow-md flex items-center space-x-2 select-none z-10 max-w-[95%] pointer-events-none">
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping"></span>
        <span className="text-[9px] font-bold font-mono tracking-wider text-slate-400 uppercase">
          {getEditorDisclaimer(uiState.activeMode)}
        </span>
      </div>

      {/* Canvas Zoom Widget Panel */}
      <div className="absolute top-3 right-3 flex flex-col bg-slate-900 border border-slate-800 rounded shadow-lg overflow-hidden select-none z-10">
        <button
          onClick={handleZoomIn}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800 cursor-pointer"
          title="Zoom In (Ctrl+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-b border-slate-800 cursor-pointer"
          title="Zoom Out (Ctrl-)"
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
      {activeLayoutObjects.length === 0 && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 z-20 pointer-events-auto">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono">
              Drawing Layout Empty
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No canvas objects exist for **{uiState.activeMode.toUpperCase()}** mode yet. 
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
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
