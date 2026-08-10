import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useStudioContextStore } from '../store/studioContextStore';
import { BoardItem, BoardComponent } from '../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Plus, 
  Cpu, 
  Settings, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Layers,
  Sparkles,
  Edit2,
  Box,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

export const BoardStudio: React.FC = () => {
  const { 
    boards = [], 
    boardComponents = [], 
    addBoard, 
    updateBoard, 
    deleteBoard,
    addBoardComponent,
    updateBoardComponent,
    deleteBoardComponent,
    generateBoardPlanFromProduct,
    generateBoardComponentsFromBOM,
    activeView
  } = useProjectStore();

  const { activeBoardId, setActiveBoard } = useStudioContextStore();
  const [activeTab, setActiveTab] = useState<'boards' | 'components'>('boards');

  useEffect(() => {
    if (activeView === 'board-components') {
      setActiveTab('components');
    } else if (activeView === 'board-studio') {
      setActiveTab('boards');
    }
  }, [activeView]);

  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  
  // Board form state
  const [boardName, setBoardName] = useState('');
  const [boardType, setBoardType] = useState<BoardItem['boardType']>('Main PCB');
  const [substrate, setSubstrate] = useState<BoardItem['substrate']>('FR4');
  const [layerCount, setLayerCount] = useState(2);
  const [dimensionsMm, setDimensionsMm] = useState('68.6 x 53.4');
  const [placement, setPlacement] = useState<BoardItem['placement']>('Internal');
  const [purpose, setPurpose] = useState('');
  const [mountingNotes, setMountingNotes] = useState('');
  const [connectorNotes, setConnectorNotes] = useState('');
  const [thermalNotes, setThermalNotes] = useState('');
  const [rfNotes, setRfNotes] = useState('');
  const [status, setStatus] = useState<BoardItem['status']>('Ready');

  // Component form state
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  const [compRefDes, setCompRefDes] = useState('');
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState('IC');
  const [compValue, setCompValue] = useState('');
  const [compPackage, setCompPackage] = useState('');
  const [compFootprint, setCompFootprint] = useState('');
  const [compPartNum, setCompPartNum] = useState('');
  const [compQty, setCompQty] = useState(1);
  const [compSide, setCompSide] = useState<BoardComponent['side']>('Top');
  const [compCriticality, setCompCriticality] = useState<BoardComponent['placementCriticality']>('Medium');
  const [compBoardId, setCompBoardId] = useState('');
  const [compNotes, setCompNotes] = useState('');

  const handleSaveBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName) return;

    const boardData = {
      name: boardName,
      boardType,
      substrate,
      layerCount,
      dimensionsMm,
      placement,
      purpose,
      mountingNotes,
      connectorNotes,
      thermalNotes,
      rfNotes,
      status
    };

    if (editingBoardId) {
      updateBoard(editingBoardId, boardData);
      setEditingBoardId(null);
    } else {
      addBoard(boardData);
    }

    setBoardName('');
    setPurpose('');
    setMountingNotes('');
    setConnectorNotes('');
    setThermalNotes('');
    setRfNotes('');
  };

  const handleStartEditBoard = (board: BoardItem) => {
    setEditingBoardId(board.id);
    setBoardName(board.name);
    setBoardType(board.boardType || 'Main PCB');
    setSubstrate(board.substrate || 'FR4');
    setLayerCount(board.layerCount || 2);
    setDimensionsMm(board.dimensionsMm || '');
    setPlacement(board.placement || 'Internal');
    setPurpose(board.purpose || '');
    setMountingNotes(board.mountingNotes || '');
    setConnectorNotes(board.connectorNotes || '');
    setThermalNotes(board.thermalNotes || '');
    setRfNotes(board.rfNotes || '');
    setStatus(board.status || 'Draft');
  };

  const handleSaveComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compRefDes || !compName) return;

    const compData = {
      boardId: compBoardId || (boards[0]?.id || ''),
      circuitBlockId: '',
      referenceDesignator: compRefDes,
      componentName: compName,
      componentType: compType,
      value: compValue,
      packageName: compPackage,
      footprint: compFootprint,
      partNumber: compPartNum,
      quantity: compQty,
      side: compSide,
      placementCriticality: compCriticality,
      notes: compNotes
    };

    if (editingComponentId) {
      updateBoardComponent(editingComponentId, compData);
      setEditingComponentId(null);
    } else {
      addBoardComponent(compData);
    }

    setCompRefDes('');
    setCompName('');
    setCompValue('');
    setCompPackage('');
    setCompFootprint('');
    setCompPartNum('');
    setCompNotes('');
  };

  const handleStartEditComponent = (comp: BoardComponent) => {
    setEditingComponentId(comp.id);
    setCompRefDes(comp.referenceDesignator);
    setCompName(comp.componentName);
    setCompType(comp.componentType || 'IC');
    setCompValue(comp.value || '');
    setCompPackage(comp.packageName || '');
    setCompFootprint(comp.footprint || '');
    setCompPartNum(comp.partNumber || '');
    setCompQty(comp.quantity || 1);
    setCompSide(comp.side || 'Top');
    setCompCriticality(comp.placementCriticality || 'Medium');
    setCompBoardId(comp.boardId);
    setCompNotes(comp.notes || '');
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-900 text-slate-100">
      {/* Top Header Toolbar */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              Board Stackup & CAD Configurations
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-500/30">PCB STUDIO</span>
            </h1>
            <p className="text-xs text-slate-400">Define physical boards, stackup layers, substrates, and SMT placement criticalities.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('boards')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${activeTab === 'boards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            Boards & Stackups ({boards.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('components')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${activeTab === 'components' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            SMT Placements ({boardComponents.length})
          </button>
        </div>
      </div>

      {/* Main Workbench Body */}
      <div className="flex min-h-0 flex-1 overflow-hidden p-6 gap-6">
        {activeTab === 'boards' ? (
          <>
            {/* Left: Boards List */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 shadow-lg backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/50">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Box className="h-4 w-4 text-indigo-400" /> Active PCB Substrates & Boards
                </span>
                <button
                  type="button"
                  onClick={generateBoardPlanFromProduct}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Auto-Plan from Architecture
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {boards.length === 0 ? (
                  <div className="grid h-48 place-items-center rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    No PCB boards defined. Fill out the form to add a main circuit board.
                  </div>
                ) : (
                  boards.map((b) => {
                    const isSelected = b.id === activeBoardId;
                    const compsCount = boardComponents.filter(c => c.boardId === b.id).length;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setActiveBoard(b.id)}
                        className={`group relative rounded-xl border p-4 transition cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-950/20 shadow-md shadow-indigo-950/50' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300">{b.name}</h3>
                              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">{b.boardType}</span>
                              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">{b.substrate || 'FR4'} • {b.layerCount || 2}L</span>
                            </div>
                            <p className="mt-1 text-xs text-slate-400">{b.purpose || 'Main PCB stackup layout'}</p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleStartEditBoard(b); }}
                              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                              title="Edit board"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); deleteBoard(b.id); }}
                              className="rounded p-1 text-rose-400 hover:bg-rose-950/50 hover:text-rose-300"
                              title="Delete board"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 border-t border-slate-800/60 pt-2">
                          <div><span className="text-slate-500">Size:</span> {b.dimensionsMm || 'Custom'} mm</div>
                          <div><span className="text-slate-500">Placement:</span> {b.placement || 'Internal'}</div>
                          <div><span className="text-slate-500">Components:</span> {compsCount} SMT parts</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Add/Edit Board Form */}
            <form onSubmit={handleSaveBoard} className="w-96 flex shrink-0 flex-col overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl backdrop-blur">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                <span>{editingBoardId ? 'Edit Board Configuration' : 'Add New PCB Board'}</span>
                {editingBoardId && (
                  <button type="button" onClick={() => setEditingBoardId(null)} className="text-xs text-indigo-400 hover:underline">Cancel</button>
                )}
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Board Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Controller PCB"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Board Type</label>
                    <select
                      value={boardType}
                      onChange={(e) => setBoardType(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Main PCB">Main PCB</option>
                      <option value="Flex FPC">Flex FPC</option>
                      <option value="Rigid-Flex">Rigid-Flex</option>
                      <option value="Daughter Board">Daughter Board</option>
                      <option value="Sensor Module">Sensor Module</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Substrate</label>
                    <select
                      value={substrate}
                      onChange={(e) => setSubstrate(e.target.value as any)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="FR4">FR4</option>
                      <option value="Polyimide Flex">Polyimide Flex</option>
                      <option value="Aluminum Core">Aluminum Core</option>
                      <option value="Rogers RF">Rogers RF</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Layers</label>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={layerCount}
                      onChange={(e) => setLayerCount(parseInt(e.target.value) || 2)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Dimensions (mm)</label>
                    <input
                      type="text"
                      placeholder="e.g. 68.6 x 53.4"
                      value={dimensionsMm}
                      onChange={(e) => setDimensionsMm(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Board Purpose</label>
                  <textarea
                    rows={2}
                    placeholder="Functionality and system responsibilities..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full justify-center mt-2">
                  {editingBoardId ? 'Save Changes' : 'Create PCB Board'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          /* SMT Components Tab */
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-400" /> SMT Component Placements
              </span>
              <button
                type="button"
                onClick={generateBoardComponentsFromBOM}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-500/20"
              >
                <Sparkles className="h-3.5 w-3.5" /> Sync Components from BOM
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {boardComponents.length === 0 ? (
                <div className="grid h-48 place-items-center rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  No SMT components assigned to board layout. Use "Sync Components from BOM" or create parts.
                </div>
              ) : (
                boardComponents.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-xs hover:border-slate-700">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-indigo-400 w-12">{c.referenceDesignator}</span>
                      <div>
                        <span className="font-semibold text-white">{c.componentName}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>Footprint: <code className="text-indigo-300">{c.footprint || 'Default'}</code></span>
                          <span>•</span>
                          <span>Side: {c.side || 'Top'}</span>
                          <span>•</span>
                          <span>Criticality: {c.placementCriticality || 'Medium'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-mono ${c.pcb?.placed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {c.pcb?.placed ? 'PLACED' : 'UNPLACED'}
                      </span>
                      <button type="button" onClick={() => deleteBoardComponent(c.id)} className="rounded p-1 text-rose-400 hover:bg-rose-950/50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
