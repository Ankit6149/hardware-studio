import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
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
  Tag
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
    generateBoardComponentsFromBOM
  } = useProjectStore();
  const { activeView } = useProjectStore();

  const [activeTab, setActiveTab] = useState<'boards' | 'components'>('boards');

  React.useEffect(() => {
    if (activeView === 'board-components') {
      const t = setTimeout(() => setActiveTab('components'), 0);
      return () => clearTimeout(t);
    } else if (activeView === 'board-studio') {
      const t = setTimeout(() => setActiveTab('boards'), 0);
      return () => clearTimeout(t);
    }
  }, [activeView]);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  
  // Board form state
  const [boardName, setBoardName] = useState('');
  const [boardType, setBoardType] = useState<BoardItem['boardType']>('Main PCB');
  const [substrate, setSubstrate] = useState<BoardItem['substrate']>('FR4');
  const [layerCount, setLayerCount] = useState(2);
  const [dimensionsMm, setDimensionsMm] = useState('20 x 20');
  const [placement, setPlacement] = useState<BoardItem['placement']>('Internal');
  const [purpose, setPurpose] = useState('');
  const [mountingNotes, setMountingNotes] = useState('');
  const [connectorNotes, setConnectorNotes] = useState('');
  const [thermalNotes, setThermalNotes] = useState('');
  const [rfNotes, setRfNotes] = useState('');
  const [status, setStatus] = useState<BoardItem['status']>('Concept');

  // Component form state
  const [editingComponentId, setEditingComponentId] = useState<string | null>(null);
  const [compRefDes, setCompRefDes] = useState('');
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState('');
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

    // Reset Form
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

    // Reset Form
    setCompRefDes('');
    setCompName('');
    setCompType('');
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
    setCompType(comp.componentType || '');
    setCompValue(comp.value || '');
    setCompPackage(comp.packageName || '');
    setCompFootprint(comp.footprint || '');
    setCompPartNum(comp.partNumber || '');
    setCompQty(comp.quantity || 1);
    setCompSide(comp.side || 'Top');
    setCompCriticality(comp.placementCriticality || 'Medium');
    setCompBoardId(comp.boardId || '');
    setCompNotes(comp.notes || '');
  };

  // Warnings lists for components
  const getComponentWarnings = (c: BoardComponent) => {
    const warnings: string[] = [];
    if (!c.referenceDesignator) warnings.push("Missing Reference Designator (e.g. U1, R1)");
    if (!c.footprint || !c.packageName) warnings.push("Missing packaging/footprint layout (e.g. 0402, QFN-32)");
    if (!c.boardId) warnings.push("Component is not assigned to a physical PCB board layout");
    const notes = c.notes?.toLowerCase() || '';
    if (c.placementCriticality === 'RF Critical' && !notes.includes("rf") && !notes.includes("antenna")) {
      warnings.push("RF Critical component lacks specific layout antenna notes or trace requirements");
    }
    return warnings;
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto font-mono text-xs">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <Cpu className="w-4 h-4 mr-2 text-indigo-500" />
            <span>Board Studio / ECAD Prep</span>
          </h2>
          <p className="text-[11px] text-slate-500 max-w-xl">
            Configure electronics board physical properties, substrate options, layer counts, and map BOM candidate items to footprints.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <Button 
            onClick={() => setActiveTab('boards')} 
            variant={activeTab === 'boards' ? 'primary' : 'outline'}
            size="xs"
          >
            Boards list ({boards.length})
          </Button>
          <Button 
            onClick={() => setActiveTab('components')} 
            variant={activeTab === 'components' ? 'primary' : 'outline'}
            size="xs"
          >
            Board Components ({boardComponents.length})
          </Button>
        </div>
      </div>

      {activeTab === 'boards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Boards List & Generators */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wide">Design Boards</span>
                {boards.length === 0 && (
                  <Button 
                    onClick={generateBoardPlanFromProduct}
                    variant="outline"
                    size="xs"
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Generate Ring Boards
                  </Button>
                )}
              </div>

              {boards.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded border border-dashed border-slate-200">
                  <p>No PCB boards configured for this project yet.</p>
                  <p className="text-[10px] mt-1">Click above to generate recommended boards or use the form to add one manually.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {boards.map(b => (
                    <div key={b.id} className="border border-slate-250 rounded-lg bg-slate-50/20 p-4 space-y-3 relative hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-[11px]">{b.name}</h4>
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">{b.boardType} &bull; {b.substrate}</span>
                        </div>
                        <Badge variant={b.status === 'Ready for ECAD' ? 'success' : 'info'} className="scale-90 origin-right">
                          {b.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-650 bg-white p-2 rounded border border-slate-100 font-mono">
                        <div>
                          <span className="text-slate-405 block text-[8px] uppercase font-bold">Layers</span>
                          <span className="font-bold text-slate-750">{b.layerCount} Layers</span>
                        </div>
                        <div>
                          <span className="text-slate-405 block text-[8px] uppercase font-bold">Size</span>
                          <span className="font-bold text-slate-750">{b.dimensionsMm} mm</span>
                        </div>
                        <div className="col-span-2 border-t border-slate-100 pt-1 mt-1">
                          <span className="text-slate-450 block text-[8px] uppercase font-bold">Purpose</span>
                          <span className="line-clamp-2 leading-relaxed">{b.purpose}</span>
                        </div>
                      </div>

                      {/* Notes / Warns badge */}
                      {b.rfNotes && (
                        <div className="text-[9px] text-cyan-800 bg-cyan-50 p-1.5 rounded flex items-start space-x-1 font-mono leading-normal">
                          <Tag className="w-3 h-3 text-cyan-600 shrink-0 mt-0.5" />
                          <span><strong>RF:</strong> {b.rfNotes}</span>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                        <Button 
                          onClick={() => handleStartEditBoard(b)} 
                          variant="outline" 
                          size="xs"
                          icon={<Settings className="w-3 h-3" />}
                        >
                          Configure
                        </Button>
                        <Button 
                          onClick={() => deleteBoard(b.id)} 
                          variant="outline" 
                          size="xs"
                          className="text-rose-600 hover:bg-rose-50"
                          icon={<Trash2 className="w-3 h-3" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Board Form */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase text-[10px] tracking-wide">
              {editingBoardId ? "Update Board Properties" : "Create Design Board"}
            </h3>
            
            <form onSubmit={handleSaveBoard} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Board Name</label>
                <input 
                  type="text" 
                  value={boardName} 
                  onChange={e => setBoardName(e.target.value)} 
                  placeholder="e.g. Main Curved Flex PCB" 
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Board Type</label>
                  <select 
                    value={boardType} 
                    onChange={e => setBoardType(e.target.value as BoardItem['boardType'])}
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                  >
                    <option value="Main PCB">Main PCB</option>
                    <option value="Flex PCB">Flex PCB</option>
                    <option value="Rigid PCB">Rigid PCB</option>
                    <option value="Rigid-Flex">Rigid-Flex</option>
                    <option value="Daughterboard">Daughterboard</option>
                    <option value="Charging Board">Charging Board</option>
                    <option value="Sensor Board">Sensor Board</option>
                    <option value="Debug Board">Debug Board</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Substrate</label>
                  <select 
                    value={substrate} 
                    onChange={e => setSubstrate(e.target.value as BoardItem['substrate'])}
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                  >
                    <option value="FR4">FR4</option>
                    <option value="Polyimide Flex">Polyimide Flex</option>
                    <option value="Rigid-Flex">Rigid-Flex</option>
                    <option value="Ceramic">Ceramic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Layer Count</label>
                  <input 
                    type="number" 
                    value={layerCount} 
                    onChange={e => setLayerCount(Number(e.target.value))} 
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                    min={1}
                    max={12}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Dimensions (mm)</label>
                  <input 
                    type="text" 
                    value={dimensionsMm} 
                    onChange={e => setDimensionsMm(e.target.value)} 
                    placeholder="e.g. 18.5 x 6.5" 
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Purpose / Overview</label>
                <textarea 
                  value={purpose} 
                  onChange={e => setPurpose(e.target.value)} 
                  placeholder="Describe board functional roles..." 
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded h-16 focus:outline-none focus:border-indigo-500 font-mono text-[11px] leading-relaxed resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">RF keepout or shielding notes</label>
                <input 
                  type="text" 
                  value={rfNotes} 
                  onChange={e => setRfNotes(e.target.value)} 
                  placeholder="e.g. 50-ohm trace target clearance" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value as BoardItem['status'])}
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                  >
                    <option value="Concept">Concept</option>
                    <option value="Planned">Planned</option>
                    <option value="In Layout">In Layout</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Ready for ECAD">Ready for ECAD</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Placement location</label>
                  <select 
                    value={placement} 
                    onChange={e => setPlacement(e.target.value as BoardItem['placement'])}
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                  >
                    <option value="Internal">Internal</option>
                    <option value="Outer">Outer</option>
                    <option value="Strap">Strap</option>
                    <option value="Ring Arc">Ring Arc</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingBoardId ? "Update Board" : "Create Board"}
                </Button>
                {editingBoardId && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setEditingBoardId(null);
                      setBoardName('');
                      setPurpose('');
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

        </div>
      )}

      {activeTab === 'components' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Component Planner Table */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wide">Board Placements</span>
                {boardComponents.length === 0 && (
                  <Button 
                    onClick={generateBoardComponentsFromBOM}
                    variant="outline"
                    size="xs"
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Generate from BOM
                  </Button>
                )}
              </div>

              {boardComponents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded border border-dashed border-slate-200">
                  <p>No components mapped to board layouts yet.</p>
                  <p className="text-[10px] mt-1">Click the button above to import your active BOM items as physical footprints.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                        <th className="p-2">Ref Des</th>
                        <th className="p-2">Component Name</th>
                        <th className="p-2 text-center font-bold">Footprint</th>
                        <th className="p-2 text-center">Board</th>
                        <th className="p-2">Criticality</th>
                        <th className="p-2">Warnings</th>
                        <th className="p-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-705">
                      {boardComponents.map(c => {
                        const targetBoard = boards.find(b => b.id === c.boardId)?.name || "Unassigned";
                        const warns = getComponentWarnings(c);
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/40 text-[11px] align-top">
                            <td className="p-2 font-bold text-indigo-700 font-mono">{c.referenceDesignator}</td>
                            <td className="p-2 font-semibold text-slate-800">
                              {c.componentName}
                              <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{c.partNumber || 'TBD'}</span>
                            </td>
                            <td className="p-2 text-center font-mono text-[10px]">{c.footprint || 'Missing'}</td>
                            <td className="p-2 text-center font-bold text-slate-500 text-[10px]">{targetBoard}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                c.placementCriticality === 'RF Critical' 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                  : c.placementCriticality === 'High' 
                                    ? 'bg-amber-50 text-amber-700 border border-amber-250' 
                                    : 'bg-slate-100 text-slate-650'
                              }`}>
                                {c.placementCriticality}
                              </span>
                            </td>
                            <td className="p-2 max-w-xs text-[10px] text-amber-800 leading-relaxed">
                              {warns.map((w, idx) => (
                                <div key={idx} className="flex items-start space-x-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                  <span>{w}</span>
                                </div>
                              ))}
                              {warns.length === 0 && (
                                <div className="text-emerald-700 flex items-center space-x-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>No Placement issues</span>
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              <div className="flex justify-center space-x-1">
                                <Button 
                                  onClick={() => handleStartEditComponent(c)} 
                                  variant="outline" 
                                  size="xs"
                                >
                                  Edit
                                </Button>
                                <Button 
                                  onClick={() => deleteBoardComponent(c.id)} 
                                  variant="outline" 
                                  size="xs"
                                  className="text-rose-600 hover:bg-rose-50"
                                >
                                  Del
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Component Editor Panel */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase text-[10px] tracking-wide">
              {editingComponentId ? "Modify Placement Details" : "Add Board Component"}
            </h3>
            
            <form onSubmit={handleSaveComponent} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Ref Des</label>
                  <input 
                    type="text" 
                    value={compRefDes} 
                    onChange={e => setCompRefDes(e.target.value)} 
                    placeholder="e.g. U1, R1" 
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Comp Name</label>
                  <input 
                    type="text" 
                    value={compName} 
                    onChange={e => setCompName(e.target.value)} 
                    placeholder="e.g. ESP32-C3" 
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Footprint</label>
                  <input 
                    type="text" 
                    value={compFootprint} 
                    onChange={e => setCompFootprint(e.target.value)} 
                    placeholder="e.g. QFN-32_5x5mm" 
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Package Size</label>
                  <input 
                    type="text" 
                    value={compPackage} 
                    onChange={e => setCompPackage(e.target.value)} 
                    placeholder="e.g. 0402, QFN" 
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Board Assignment</label>
                <select 
                  value={compBoardId} 
                  onChange={e => setCompBoardId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                >
                  <option value="">-- Choose Board --</option>
                  {boards.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Board Side</label>
                  <select 
                    value={compSide} 
                    onChange={e => setCompSide(e.target.value as BoardComponent['side'])}
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                  >
                    <option value="Top">Top Side</option>
                    <option value="Bottom">Bottom Side</option>
                    <option value="Both">Both Sides</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Placement Gating</label>
                  <select 
                    value={compCriticality} 
                    onChange={e => setCompCriticality(e.target.value as BoardComponent['placementCriticality'])}
                    className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="RF Critical">RF Critical</option>
                    <option value="Thermal Critical">Thermal Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Placement / RF Trace Notes</label>
                <textarea 
                  value={compNotes} 
                  onChange={e => setCompNotes(e.target.value)} 
                  placeholder="Layout constraints or decoupling capacitor guidelines..." 
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded h-16 focus:outline-none focus:border-indigo-500 font-mono text-[11px] leading-relaxed resize-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <Button type="submit" variant="primary" className="flex-1">
                  {editingComponentId ? "Update Component" : "Add Component"}
                </Button>
                {editingComponentId && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setEditingComponentId(null);
                      setCompRefDes('');
                      setCompName('');
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
