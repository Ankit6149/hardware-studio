import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { CircuitBlock } from '../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Plus, 
  Layers, 
  AlertTriangle
} from 'lucide-react';

export const CircuitPlanner: React.FC = () => {
  const { 
    boards = [], 
    circuitBlocks = [], 
    addCircuitBlock, 
    updateCircuitBlock, 
    deleteCircuitBlock,
    generateCircuitsFromBlueprint
  } = useProjectStore();

  const [editingCircuitId, setEditingCircuitId] = useState<string | null>(null);

  // Form State
  const [cName, setCName] = useState('');
  const [cType, setCType] = useState<CircuitBlock['circuitType']>('MCU');
  const [cBoardId, setCBoardId] = useState('');
  const [cDescription, setCDescription] = useState('');
  const [cReqComps, setCReqComps] = useState('');
  const [cRefDes, setCRefDes] = useState('');
  const [cPowerNets, setCPowerNets] = useState('');
  const [cSignalNets, setCSignalNets] = useState('');
  const [cInterface, setCInterface] = useState('');
  const [cDatasheetNotes, setCDatasheetNotes] = useState('');
  const [cDesignNotes, setCDesignNotes] = useState('');
  const [cRisks, setCRisks] = useState('');
  const [cStatus, setCStatus] = useState<CircuitBlock['status']>('Concept');

  const handleSaveCircuit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cName) return;

    const data = {
      name: cName,
      circuitType: cType,
      boardId: cBoardId || (boards[0]?.id || ''),
      description: cDescription,
      requiredComponents: cReqComps,
      referenceDesignators: cRefDes,
      powerNets: cPowerNets,
      signalNets: cSignalNets,
      interfaceType: cInterface,
      datasheetNotes: cDatasheetNotes,
      designNotes: cDesignNotes,
      risks: cRisks,
      status: cStatus
    };

    if (editingCircuitId) {
      updateCircuitBlock(editingCircuitId, data);
      setEditingCircuitId(null);
    } else {
      addCircuitBlock(data);
    }

    // Reset Form
    setCName('');
    setCDescription('');
    setCReqComps('');
    setCRefDes('');
    setCPowerNets('');
    setCSignalNets('');
    setCInterface('');
    setCDatasheetNotes('');
    setCDesignNotes('');
    setCRisks('');
  };

  const handleStartEdit = (cb: CircuitBlock) => {
    setEditingCircuitId(cb.id);
    setCName(cb.name);
    setCType(cb.circuitType);
    setCBoardId(cb.boardId);
    setCDescription(cb.description);
    setCReqComps(cb.requiredComponents);
    setCRefDes(cb.referenceDesignators);
    setCPowerNets(cb.powerNets);
    setCSignalNets(cb.signalNets);
    setCInterface(cb.interfaceType);
    setCDatasheetNotes(cb.datasheetNotes);
    setCDesignNotes(cb.designNotes);
    setCRisks(cb.risks);
    setCStatus(cb.status);
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto font-mono text-xs">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <Layers className="w-4 h-4 mr-2 text-indigo-500" />
            <span>Circuit Planner</span>
          </h2>
          <p className="text-[11px] text-slate-500 max-w-xl">
            Configure sub-circuits, grouping components and defining connection interfaces, reference designators, and local routing warnings.
          </p>
        </div>
        <div className="shrink-0">
          <Button 
            onClick={generateCircuitsFromBlueprint}
            variant="outline"
            size="xs"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Generate Circuits
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Circuit Blocks Grid */}
        <div className="lg:col-span-2 space-y-6">
          {boards.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white border border-slate-200 rounded-lg">
              <p className="font-bold">No PCBs configured in Board Studio.</p>
              <p className="text-[10px] mt-1">Please create a board layout under Board Studio first.</p>
            </div>
          ) : (
            boards.map(b => {
              const blocksOnBoard = circuitBlocks.filter(cb => cb.boardId === b.id);
              return (
                <div key={b.id} className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                    <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wide">
                      {b.name} Circuits
                    </span>
                    <Badge variant="info" className="scale-90 font-mono">
                      {blocksOnBoard.length} Blocks
                    </Badge>
                  </div>

                  {blocksOnBoard.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded border border-dashed border-slate-200">
                      No sub-circuits configured on this board.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {blocksOnBoard.map(cb => (
                        <div key={cb.id} className="border border-slate-200 rounded-lg bg-slate-50/20 p-4 space-y-3 hover:shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-800 text-[11px] flex items-center">
                                <span className="bg-indigo-50 text-indigo-750 font-bold px-1 py-0.5 rounded text-[8px] mr-1.5 uppercase font-mono tracking-wider">
                                  {cb.circuitType}
                                </span>
                                {cb.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-1 leading-normal">{cb.description}</p>
                            </div>
                            <Badge variant={cb.status === 'Complete' ? 'success' : 'info'} className="scale-90 origin-right">
                              {cb.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-650 bg-white p-2.5 rounded border border-slate-100 font-mono">
                            <div>
                              <span className="text-slate-450 block text-[8px] uppercase font-bold">Required Parts</span>
                              <span className="font-semibold text-slate-800">{cb.requiredComponents}</span>
                            </div>
                            <div>
                              <span className="text-slate-450 block text-[8px] uppercase font-bold">Ref Des List</span>
                              <span className="font-semibold text-indigo-700">{cb.referenceDesignators}</span>
                            </div>
                            <div className="col-span-2 border-t border-slate-100 pt-1.5 mt-1 grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-slate-450 block text-[8px] uppercase font-bold">Power Nets</span>
                                <span className="text-rose-700 font-bold">{cb.powerNets || 'None'}</span>
                              </div>
                              <div>
                                <span className="text-slate-450 block text-[8px] uppercase font-bold">Signal Nets</span>
                                <span className="text-cyan-800 font-bold">{cb.signalNets || 'None'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Risks warnings */}
                          {cb.risks && (
                            <div className="text-[9px] text-rose-800 bg-rose-50 p-2 rounded flex items-start space-x-1 font-mono leading-normal border border-rose-100">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <span><strong>Risk:</strong> {cb.risks}</span>
                            </div>
                          )}

                          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                            <Button 
                              onClick={() => handleStartEdit(cb)} 
                              variant="outline" 
                              size="xs"
                            >
                              Edit Block
                            </Button>
                            <Button 
                              onClick={() => deleteCircuitBlock(cb.id)} 
                              variant="outline" 
                              size="xs"
                              className="text-rose-600 hover:bg-rose-55"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Circuit Form */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase text-[10px] tracking-wide">
            {editingCircuitId ? "Configure Circuit Block" : "Add Circuit Block"}
          </h3>
          
          <form onSubmit={handleSaveCircuit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase text-[9px]">Circuit Name</label>
              <input 
                type="text" 
                value={cName} 
                onChange={e => setCName(e.target.value)} 
                placeholder="e.g. MCU Core Circuit" 
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Circuit Type</label>
                <select 
                  value={cType} 
                  onChange={e => setCType(e.target.value as CircuitBlock['circuitType'])}
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                >
                  <option value="MCU">MCU / SoC</option>
                  <option value="Power">Power Regulation</option>
                  <option value="Charger">Battery Charger</option>
                  <option value="Sensor">Sensor</option>
                  <option value="Haptic">Haptic Driver</option>
                  <option value="LED">LED Indication</option>
                  <option value="RF">BLE / RF</option>
                  <option value="Debug">Debug Header</option>
                  <option value="Protection">ESD Protection</option>
                  <option value="Connector">Connector Ports</option>
                  <option value="Passive Network">Passives Array</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Target Board</label>
                <select 
                  value={cBoardId} 
                  onChange={e => setCBoardId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                >
                  <option value="">-- Select Board --</option>
                  {boards.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase text-[9px]">Required Components</label>
              <input 
                type="text" 
                value={cReqComps} 
                onChange={e => setCReqComps(e.target.value)} 
                placeholder="e.g. ESP32-C3 SoC, LDO Regulator" 
                className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase text-[9px]">Reference Designators</label>
              <input 
                type="text" 
                value={cRefDes} 
                onChange={e => setCRefDes(e.target.value)} 
                placeholder="e.g. U1, C1, C2" 
                className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Power Nets</label>
                <input 
                  type="text" 
                  value={cPowerNets} 
                  onChange={e => setCPowerNets(e.target.value)} 
                  placeholder="3V3, GND" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Signal Nets</label>
                <input 
                  type="text" 
                  value={cSignalNets} 
                  onChange={e => setCSignalNets(e.target.value)} 
                  placeholder="SWD_IO, SWD_CLK" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase text-[9px]">Functional Description</label>
              <textarea 
                value={cDescription} 
                onChange={e => setCDescription(e.target.value)} 
                placeholder="Define circuit purpose and load paths..." 
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded h-16 focus:outline-none focus:border-indigo-500 font-mono text-[11px] leading-relaxed resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase text-[9px]">Design Risks / layout warnings</label>
              <input 
                type="text" 
                value={cRisks} 
                onChange={e => setCRisks(e.target.value)} 
                placeholder="e.g. Keep traces under 2mm length" 
                className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Interface Type</label>
                <input 
                  type="text" 
                  value={cInterface} 
                  onChange={e => setCInterface(e.target.value)} 
                  placeholder="e.g. I2C, SPI" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Status</label>
                <select 
                  value={cStatus} 
                  onChange={e => setCStatus(e.target.value as CircuitBlock['status'])}
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                >
                  <option value="Concept">Concept</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Complete">Complete</option>
                  <option value="Needs Review">Needs Review</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingCircuitId ? "Update Block" : "Create Block"}
              </Button>
              {editingCircuitId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingCircuitId(null);
                    setCName('');
                    setCDescription('');
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
