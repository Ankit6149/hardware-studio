// SchematicEditor.tsx — Phase 6 Real Schematic Editor UI shell
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { SchematicCanvas } from './SchematicCanvas';
import { initialSchematicUIState, SchematicUIState } from './schematicInteraction';
import { runSchematicERC } from '../../lib/schematicERC';
import { defaultComponents, ElectronicComponentDefinition, ComponentPinDefinition } from '../../lib/components/componentLibrary';
import { searchComponents } from '../../lib/components/componentSearch';
import { 
  MousePointer, 
  Route, 
  Trash2, 
  RotateCw, 
  Info, 
  AlertTriangle, 
  Search,
  CheckCircle,
  Plus
} from 'lucide-react';

export const SchematicEditor: React.FC = () => {
  const project = useProjectStore();
  const { 
    boardComponents, 
    schematicWires, 
    updateBoardComponent, 
    updateProjectState,
    setActiveView 
  } = project;

  const [viewState, setViewState] = useState<SchematicUIState>(initialSchematicUIState);
  const [searchQuery, setSearchQuery] = useState('');

  // Run ERC when components or wires change
  const ercResults = useMemo(() => {
    return runSchematicERC(project);
  }, [project]);

  const handleViewStateChange = useCallback((patch: Partial<SchematicUIState>) => {
    setViewState(prev => ({ ...prev, ...patch }));
  }, []);

  const handleRotateSelected = useCallback(() => {
    if (!viewState.selectedComponentId) return;
    const comp = (boardComponents || []).find(c => c.id === viewState.selectedComponentId);
    if (!comp) return;
    const currentRot = comp.schematic?.rotation || 0;
    updateBoardComponent(comp.id, {
      schematic: {
        ...comp.schematic,
        placed: true,
        rotation: (currentRot + 90) % 360
      }
    });
  }, [viewState.selectedComponentId, boardComponents, updateBoardComponent]);

  const handleDeleteSelected = useCallback(() => {
    if (viewState.selectedComponentId) {
      const confirmDelete = window.confirm(
        `Are you sure you want to remove component ${
          (boardComponents || []).find(c => c.id === viewState.selectedComponentId)?.referenceDesignator
        }? This will remove it from Schematic, PCB, and BOM.`
      );
      if (confirmDelete) {
        const remainingComps = (boardComponents || []).filter(c => c.id !== viewState.selectedComponentId);
        const remainingWires = (schematicWires || []).filter(w => !w.sourcePinId?.startsWith(viewState.selectedComponentId!) && !w.targetPinId?.startsWith(viewState.selectedComponentId!));
        
        updateProjectState({
          boardComponents: remainingComps,
          schematicWires: remainingWires
        });
        
        handleViewStateChange({ selectedComponentId: null });
      }
    } else if (viewState.selectedWireId) {
      const remainingWires = (schematicWires || []).filter(w => w.id !== viewState.selectedWireId);
      updateProjectState({ schematicWires: remainingWires });
      handleViewStateChange({ selectedWireId: null });
    }
  }, [viewState.selectedComponentId, viewState.selectedWireId, boardComponents, schematicWires, updateProjectState, handleViewStateChange]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        handleRotateSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      } else if (e.key === 'Escape') {
        handleViewStateChange({
          isDrawingWire: false,
          wirePoints: [],
          sourcePin: null
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRotateSelected, handleDeleteSelected, handleViewStateChange]);

  // Place component from Library into Schematic
  const handlePlaceLibraryComponent = useCallback((libComp: ElectronicComponentDefinition) => {
    const existingRefDes = (boardComponents || []).map(bc => bc.referenceDesignator);
    let prefix = 'U';
    const cat = libComp.category.toUpperCase();
    if (cat === 'RESISTOR') prefix = 'R';
    else if (cat === 'CAPACITOR') prefix = 'C';
    else if (cat === 'INDUCTOR') prefix = 'L';
    else if (cat === 'DIODE') prefix = 'D';
    else if (cat === 'LED') prefix = 'LED';
    else if (cat === 'CONNECTOR') prefix = 'J';
    else if (cat === 'TRANSISTOR' || cat === 'MOSFET') prefix = 'Q';
    else if (cat === 'BUTTON' || cat === 'SWITCH') prefix = 'SW';
    else if (cat === 'TEST POINT') prefix = 'TP';
    else if (cat === 'ANTENNA' || cat === 'RF') prefix = 'ANT';
    else if (cat === 'BATTERY') prefix = 'BT';

    let num = 1;
    while (existingRefDes.includes(`${prefix}${num}`)) {
      num++;
    }
    const finalRefDes = `${prefix}${num}`;
    const compId = `comp_${Date.now()}`;

    // Create schematic symbol coordinates
    const sx = Math.round((50 - viewState.panX) / viewState.zoom / 10) * 10;
    const sy = Math.round((150 - viewState.panY) / viewState.zoom / 10) * 10;

    // Add component instance
    const newComp = {
      id: compId,
      boardId: 'board_0',
      circuitBlockId: 'block_0',
      referenceDesignator: finalRefDes,
      componentName: libComp.name,
      componentType: libComp.category,
      value: libComp.value || '',
      packageName: libComp.packageName,
      footprint: libComp.footprintName,
      partNumber: libComp.partNumber || '',
      quantity: 1,
      side: 'Top' as const,
      placementCriticality: 'Medium' as const,
      notes: libComp.description,
      placementStatus: 'Unplaced' as const,
      libraryId: libComp.libraryId,
      pins: libComp.pins.map((p: ComponentPinDefinition) => ({
        id: `pin_${compId}_${p.number}`,
        componentId: compId,
        pinNumber: p.number,
        pinName: p.name,
        electricalType: p.electricalType,
        netName: p.defaultNetName || ''
      })),
      schematic: {
        placed: true,
        x: sx,
        y: sy,
        rotation: 0
      },
      pcb: {
        placed: false,
        side: 'Top' as const,
        locked: false,
        placementStatus: 'Unplaced' as const
      }
    };

    updateProjectState({
      boardComponents: [...(boardComponents || []), newComp]
    });

    handleViewStateChange({ selectedComponentId: compId });
  }, [boardComponents, viewState.panX, viewState.panY, viewState.zoom, updateProjectState, handleViewStateChange]);

  const searchedLib = searchQuery ? searchComponents(searchQuery) : defaultComponents.slice(0, 6);

  const selectedComponentObject = (boardComponents || []).find(c => c.id === viewState.selectedComponentId);
  const selectedWireObject = (schematicWires || []).find(w => w.id === viewState.selectedWireId);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 font-sans overflow-hidden">
      {/* Schematic Toolbar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewStateChange({ activeTool: 'select' })}
            className={`p-1.5 rounded transition-all ${
              viewState.activeTool === 'select' ? 'bg-emerald-500 text-slate-950' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Select tool"
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => handleViewStateChange({ activeTool: 'wire' })}
            className={`p-1.5 rounded transition-all ${
              viewState.activeTool === 'wire' ? 'bg-emerald-500 text-slate-950' : 'hover:bg-slate-800 text-slate-400'
            }`}
            title="Route Wire tool (Click pin to pin)"
          >
            <Route className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRotateSelected}
            disabled={!viewState.selectedComponentId}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30"
            title="Rotate Component (R)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDeleteSelected}
            disabled={!viewState.selectedComponentId && !viewState.selectedWireId}
            className="p-1.5 rounded hover:bg-slate-800 text-red-500 disabled:opacity-30"
            title="Delete Selected (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-450 font-semibold font-mono">
            ERC Warnings: <span className={ercResults.length > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>{ercResults.length}</span>
          </span>
          <button
            onClick={() => setActiveView('board-designer')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded text-[10px] transition-all"
          >
            Open PCB Designer
          </button>
        </div>
      </div>

      {/* Editor Inner Layout */}
      <div className="flex-1 flex min-h-0">
        
        {/* Schematic Component Bin Panel (Left) */}
        <div className="w-56 border-r border-slate-800 bg-slate-900/40 flex flex-col h-full overflow-hidden shrink-0">
          <div className="p-2 border-b border-slate-800">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Add Symbol</span>
            <div className="relative">
              <Search className="w-3 h-3 absolute left-1.5 top-1.5 text-slate-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol..."
                className="w-full bg-slate-950 border border-slate-800 rounded pl-5 pr-1 py-0.5 text-[9px] font-mono focus:outline-none focus:border-emerald-500 text-slate-350"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {searchedLib.map(c => (
              <div
                key={c.libraryId}
                onClick={() => handlePlaceLibraryComponent(c)}
                className="p-1.5 bg-slate-950 border border-slate-850 hover:border-emerald-500 rounded cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="min-w-0 pr-1">
                  <span className="text-[9px] font-bold text-slate-300 leading-none truncate block">{c.name}</span>
                  <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">{c.packageName}</span>
                </div>
                <button className="p-0.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Central Graphic Canvas */}
        <SchematicCanvas
          viewState={viewState}
          onViewStateChange={handleViewStateChange}
          ercResults={ercResults}
        />

        {/* Inspector Panel & ERC List (Right) */}
        <div className="w-64 border-l border-slate-800 bg-slate-900/40 flex flex-col h-full overflow-hidden shrink-0">
          
          {/* Properties Inspector */}
          <div className="p-3 border-b border-slate-800 flex-1 overflow-y-auto">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Properties</span>
            </div>

            {selectedComponentObject ? (
              <div className="space-y-3 text-[10px]">
                <div>
                  <span className="text-slate-500 block">Designator</span>
                  <input
                    value={selectedComponentObject.referenceDesignator}
                    onChange={(e) => updateBoardComponent(selectedComponentObject.id, { referenceDesignator: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-mono w-full text-[10px]"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block">Value</span>
                  <input
                    value={selectedComponentObject.value || ''}
                    onChange={(e) => updateBoardComponent(selectedComponentObject.id, { value: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-200 font-mono w-full text-[10px]"
                  />
                </div>
                <div>
                  <span className="text-slate-500 block">Component Type</span>
                  <span className="text-slate-350">{selectedComponentObject.componentType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PCB Footprint</span>
                  <span className="text-slate-350 font-mono">{selectedComponentObject.footprint}</span>
                </div>
                
                {/* Pins list */}
                <div className="pt-2 space-y-1.5">
                  <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider block">Symbol Terminals</span>
                  <div className="border border-slate-800 rounded p-1 space-y-1 bg-slate-950/40 max-h-[140px] overflow-y-auto">
                    {(selectedComponentObject.pins || []).map(p => (
                      <div key={p.pinNumber} className="flex justify-between font-mono text-[9px]">
                        <span className="text-slate-450">{p.pinNumber}. {p.pinName}</span>
                        <span className="text-emerald-450">{p.netName || 'Unrouted'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : selectedWireObject ? (
              <div className="space-y-2 text-[10px]">
                <div>
                  <span className="text-slate-500 block">Signal Net</span>
                  <span className="text-sky-400 font-bold font-mono">{selectedWireObject.netName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Points</span>
                  <span className="text-slate-350">{selectedWireObject.points.length} nodes</span>
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-slate-500 text-center py-8">Select component symbol or wire on canvas.</div>
            )}
          </div>

          {/* Live ERC Panel */}
          <div className="h-48 border-t border-slate-800 flex flex-col overflow-hidden bg-slate-950/60 shrink-0">
            <div className="p-2 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Live ERC Checks</span>
              </div>
              <span className={`text-[8px] px-1.5 py-0.2 rounded font-bold ${
                ercResults.length > 0 ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'
              }`}>
                {ercResults.length > 0 ? `${ercResults.length} issues` : 'All Pass'}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
              {ercResults.length > 0 ? (
                ercResults.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (r.linkedObjectType === 'component') {
                        handleViewStateChange({ selectedComponentId: r.linkedObjectId });
                      }
                    }}
                    className="p-1.5 bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded cursor-pointer text-[9.5px]"
                  >
                    <div className="flex gap-1 items-start">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                        r.severity === 'Error' || r.severity === 'Blocker' ? 'bg-red-500' : 'bg-amber-500'
                      }`}></span>
                      <div>
                        <span className="font-bold text-slate-300 block">{r.title}</span>
                        <p className="text-slate-450 text-[9px] mt-0.5 leading-relaxed">{r.description}</p>
                        <span className="text-emerald-550 block text-[8px] mt-1 font-mono">Fix: {r.suggestedFix}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-650 text-[10px] py-12 flex flex-col justify-center items-center gap-1">
                  <CheckCircle className="w-6 h-6 text-emerald-500/30" />
                  <span>No electrical violations detected!</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
