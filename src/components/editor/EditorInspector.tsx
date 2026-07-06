import React from 'react';
import { EditorObject, Project, FactoryFileStatus } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { Trash2, Copy, Lock, Unlock, HelpCircle } from 'lucide-react';

interface EditorInspectorProps {
  selectedObjectId: string | null;
  objects: EditorObject[];
  project: Project;
  onDeleteObject: (id: string) => void;
  onDuplicateObject: (id: string) => void;
}

export const EditorInspector: React.FC<EditorInspectorProps> = ({
  selectedObjectId,
  objects,
  project,
  onDeleteObject,
  onDuplicateObject
}) => {
  const store = useProjectStore();
  const obj = objects.find(o => o.id === selectedObjectId);

  if (!obj) {
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-800 text-slate-350 p-4 select-none text-[11px] font-sans flex flex-col justify-between h-full">
        <div className="space-y-4">
          <div className="text-slate-100 font-bold uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-450" />
            <span>Inspector Panel</span>
          </div>
          <div className="bg-slate-950/40 p-4 border border-slate-800 rounded leading-relaxed space-y-2">
            <p className="text-slate-200 font-bold">Workspace Guidelines:</p>
            <p>1. Double-click or click any outline element inside the editor grid canvas to select and inspect its properties.</p>
            <p>2. Drag blocks around the screen to arrange and lay out components, board outlines, or firmware flows visually.</p>
            <p>3. Changing parameters inside this Inspector panel instantly updates the underlying project database (e.g. BOM, Pin Map, Nets, Power).</p>
            <p>4. Layout positions are saved locally in `localStorage` and will persist across browser reloads.</p>
          </div>
        </div>
        <div className="bg-slate-950 p-3 border border-slate-855 rounded text-[10px] text-slate-450 leading-relaxed font-mono">
          STATUS: Workspace Idle<br />
          CAD STAMP: Conceptual Layout Prep<br />
          COMPILER: Active (Ready)
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // HANDLERS TO SYNC SOURCE DATA BACK TO STORE
  // ----------------------------------------------------
  const handleUpdateLayoutValue = (field: keyof EditorObject, value: unknown) => {
    if (field === 'x') store.updateEditorObjectPosition(obj.mode, obj.id, Number(value), obj.y);
    else if (field === 'y') store.updateEditorObjectPosition(obj.mode, obj.id, obj.x, Number(value));
    else if (field === 'width') store.updateEditorObjectSize(obj.mode, obj.id, Number(value), obj.height);
    else if (field === 'height') store.updateEditorObjectSize(obj.mode, obj.id, obj.width, Number(value));
    else if (field === 'rotation') store.updateEditorObjectRotation(obj.mode, obj.id, Number(value));
    else if (field === 'locked') store.updateEditorObjectMetadata(obj.mode, obj.id, { locked: !!value });
  };

  const handleUpdateSourceField = (type: EditorObject['sourceType'], sourceId: string, fieldKey: string, value: unknown) => {
    if (!sourceId) return;

    if (type === 'board') {
      store.updateBoard(sourceId, { [fieldKey]: value });
    } else if (type === 'component') {
      store.updateBoardComponent(sourceId, { [fieldKey]: value });
    } else if (type === 'circuit') {
      store.updateCircuitBlock(sourceId, { [fieldKey]: value });
    } else if (type === 'net') {
      store.updateNet(sourceId, { [fieldKey]: value });
    } else if (type === 'power') {
      store.updatePowerItem(sourceId, { [fieldKey]: value });
    } else if (type === 'pin') {
      store.updatePinItem(sourceId, { [fieldKey]: value });
    } else if (type === 'firmware') {
      store.updateFirmwareTask(sourceId, { [fieldKey]: value });
    } else if (type === 'test') {
      store.updateTestStage(sourceId, { [fieldKey]: value });
    } else if (type === 'checklist') {
      store.updateChecklistItem(sourceId, { [fieldKey]: value });
    } else if (type === 'factory-file') {
      const notes = fieldKey === 'notes' ? (value as string) : undefined;
      const status = fieldKey === 'status' ? (value as "Not Generated" | "Conceptual" | "Generated In App" | "Needs Final Review" | "Verified") : undefined;
      const source = fieldKey === 'source' ? (value as "External" | "Hardware Studio" | "KiCad" | "Altium" | "EasyEDA" | "Fusion" | "Onshape" | "SolidWorks") : undefined;
      const fileName = fieldKey === 'fileName' ? (value as string) : undefined;
      store.updateFactoryFileStatus(sourceId, status, notes, source, fileName);
    }
  };

  // Find linked model details
  const sourceId = obj.sourceId || '';
  const isLocked = obj.locked || false;

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 text-slate-350 p-4 select-none text-[11px] font-sans flex flex-col h-full scrollbar-thin overflow-y-auto">
      
      {/* Selection Header */}
      <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
        <div className="min-w-0 pr-2">
          <span className="font-mono text-[9px] bg-slate-800 text-slate-350 px-1 py-0.2 rounded uppercase block w-max mb-1">
            {obj.sourceType} Node
          </span>
          <h2 className="text-slate-100 font-bold text-xs truncate w-[160px]">{obj.label}</h2>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <button
            onClick={() => handleUpdateLayoutValue('locked', !isLocked)}
            className={`p-1.5 rounded bg-slate-850 hover:bg-slate-800 cursor-pointer ${isLocked ? 'text-rose-400' : 'text-slate-450'}`}
            title={isLocked ? "Unlock Object positions" : "Lock Object position"}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDuplicateObject(obj.id)}
            className="p-1.5 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 cursor-pointer"
            title="Duplicate Object"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteObject(obj.id)}
            className="p-1.5 rounded bg-slate-850 hover:bg-rose-900 hover:text-white text-slate-400 cursor-pointer"
            title="Delete Object"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {/* 1. COORDINATES BLOCK */}
        <div className="space-y-2 bg-slate-950/40 p-2.5 border border-slate-850 rounded">
          <div className="text-slate-200 font-bold uppercase tracking-wider text-[9px] mb-1">Layout Position & Size</div>
          <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-1">
              <span className="text-slate-500 font-bold">X</span>
              <input
                type="number"
                disabled={isLocked}
                value={obj.x}
                onChange={(e) => handleUpdateLayoutValue('x', e.target.value)}
                className="bg-transparent text-slate-200 w-full focus:outline-none text-right font-bold"
              />
            </div>
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-1">
              <span className="text-slate-500 font-bold">Y</span>
              <input
                type="number"
                disabled={isLocked}
                value={obj.y}
                onChange={(e) => handleUpdateLayoutValue('y', e.target.value)}
                className="bg-transparent text-slate-200 w-full focus:outline-none text-right font-bold"
              />
            </div>
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-1">
              <span className="text-slate-500 font-bold">W</span>
              <input
                type="number"
                disabled={isLocked}
                value={obj.width}
                onChange={(e) => handleUpdateLayoutValue('width', e.target.value)}
                className="bg-transparent text-slate-200 w-full focus:outline-none text-right font-bold"
              />
            </div>
            <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-1">
              <span className="text-slate-500 font-bold">H</span>
              <input
                type="number"
                disabled={isLocked}
                value={obj.height}
                onChange={(e) => handleUpdateLayoutValue('height', e.target.value)}
                className="bg-transparent text-slate-200 w-full focus:outline-none text-right font-bold"
              />
            </div>
          </div>
          {obj.sourceType === 'component' && (
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded px-2 py-1 font-mono text-[10px]">
              <span className="text-slate-500 font-bold">ROTATION </span>
              <select
                disabled={isLocked}
                value={obj.rotation || 0}
                onChange={(e) => handleUpdateLayoutValue('rotation', e.target.value)}
                className="bg-transparent border-none text-slate-200 focus:outline-none text-right font-bold w-16 cursor-pointer"
              >
                <option value="0">0°</option>
                <option value="90">90°</option>
                <option value="180">180°</option>
                <option value="270">270°</option>
              </select>
            </div>
          )}
        </div>

        {/* 2. DYNAMIC LINKED SOURCE ATTRIBUTES FIELDS */}
        {obj.sourceId && (
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <div className="text-emerald-400 font-extrabold uppercase tracking-widest text-[9px] flex items-center space-x-1.5 mb-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Project Database Fields</span>
            </div>

            {/* BOARD ITEM INSPECTOR */}
            {obj.sourceType === 'board' && (() => {
              const b = (project.boards || []).find(item => item.id === sourceId);
              if (!b) return null;
              return (
                <div className="space-y-2.5">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Substrate Contour</label>
                    <select
                      value={b.substrate}
                      onChange={(e) => handleUpdateSourceField('board', sourceId, 'substrate', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none"
                    >
                      <option value="FR4">FR4 Rigid</option>
                      <option value="Polyimide Flex">Polyimide Flex</option>
                      <option value="Rigid-Flex">Rigid-Flex Composite</option>
                      <option value="Ceramic">Ceramic HF</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Layer Stack Count</label>
                    <input
                      type="number"
                      value={b.layerCount}
                      onChange={(e) => handleUpdateSourceField('board', sourceId, 'layerCount', Number(e.target.value))}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Physical Dimensions (X x Y x Z mm)</label>
                    <input
                      type="text"
                      value={b.dimensionsMm}
                      onChange={(e) => handleUpdateSourceField('board', sourceId, 'dimensionsMm', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Mounting Notes</label>
                    <textarea
                      rows={2}
                      value={b.mountingNotes}
                      onChange={(e) => handleUpdateSourceField('board', sourceId, 'mountingNotes', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none text-[10px]"
                    />
                  </div>
                </div>
              );
            })()}

            {/* BOARD COMPONENT INSPECTOR */}
            {obj.sourceType === 'component' && (() => {
              const c = (project.boardComponents || []).find(item => item.id === sourceId);
              if (!c) return null;
              return (
                <div className="space-y-2.5">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Component Name/Value</label>
                    <input
                      type="text"
                      value={c.componentName}
                      onChange={(e) => handleUpdateSourceField('component', sourceId, 'componentName', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold">RefDes</label>
                      <input
                        type="text"
                        value={c.referenceDesignator}
                        onChange={(e) => handleUpdateSourceField('component', sourceId, 'referenceDesignator', e.target.value)}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold">Board Side</label>
                      <select
                        value={c.side}
                        onChange={(e) => handleUpdateSourceField('component', sourceId, 'side', e.target.value)}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none"
                      >
                        <option value="Top">Top Side</option>
                        <option value="Bottom">Bottom Side</option>
                        <option value="Both">Both</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">SMT Footprint Package</label>
                    <input
                      type="text"
                      value={c.footprint}
                      onChange={(e) => handleUpdateSourceField('component', sourceId, 'footprint', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Placement Criticality</label>
                    <select
                      value={c.placementCriticality}
                      onChange={(e) => handleUpdateSourceField('component', sourceId, 'placementCriticality', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High Priority</option>
                      <option value="RF Critical">RF Critical</option>
                      <option value="Thermal Critical">Thermal Critical</option>
                    </select>
                  </div>
                </div>
              );
            })()}

            {/* CIRCUIT BLOCK INSPECTOR */}
            {obj.sourceType === 'circuit' && (() => {
              const cb = (project.circuitBlocks || []).find(item => item.id === sourceId);
              if (!cb) return null;
              return (
                <div className="space-y-2.5">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Circuit Category</label>
                    <select
                      value={cb.circuitType}
                      onChange={(e) => handleUpdateSourceField('circuit', sourceId, 'circuitType', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none"
                    >
                      <option value="MCU">MCU Controller</option>
                      <option value="Power">Power Regulation</option>
                      <option value="Charger">Battery Charger BMS</option>
                      <option value="Sensor">Sensor interface</option>
                      <option value="Haptic">Feedback Haptic</option>
                      <option value="RF">Transceiver / RF Antenna</option>
                      <option value="Debug">SWD / Debug interface</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Required Components list</label>
                    <input
                      type="text"
                      value={cb.requiredComponents}
                      onChange={(e) => handleUpdateSourceField('circuit', sourceId, 'requiredComponents', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Power Net Rails</label>
                    <input
                      type="text"
                      value={cb.powerNets}
                      onChange={(e) => handleUpdateSourceField('circuit', sourceId, 'powerNets', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Signal Net Routing</label>
                    <input
                      type="text"
                      value={cb.signalNets}
                      onChange={(e) => handleUpdateSourceField('circuit', sourceId, 'signalNets', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono"
                    />
                  </div>
                </div>
              );
            })()}

            {/* NET ROUTING INSPECTOR */}
            {obj.sourceType === 'net' && (() => {
              const n = (project.nets || []).find(item => item.id === sourceId);
              if (!n) return null;
              return (
                <div className="space-y-2.5">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Net Class</label>
                    <select
                      value={n.netType}
                      onChange={(e) => handleUpdateSourceField('net', sourceId, 'netType', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none font-bold"
                    >
                      <option value="Power">Power Rail</option>
                      <option value="Ground">Ground Return</option>
                      <option value="Signal">General Signal</option>
                      <option value="RF">RF Microstrip</option>
                      <option value="Differential">Differential Pair</option>
                      <option value="Analog">Analog track</option>
                      <option value="Programming">SWD Debug Line</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold">Voltage</label>
                      <input
                        type="text"
                        value={n.voltage}
                        onChange={(e) => handleUpdateSourceField('net', sourceId, 'voltage', e.target.value)}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold">Impedance</label>
                      <input
                        type="text"
                        value={n.impedanceRequirement}
                        onChange={(e) => handleUpdateSourceField('net', sourceId, 'impedanceRequirement', e.target.value)}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Source Node & pin</label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={n.sourceComponent}
                        placeholder="RefDes"
                        onChange={(e) => handleUpdateSourceField('net', sourceId, 'sourceComponent', e.target.value)}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-1/2 focus:outline-none font-mono"
                      />
                      <input
                        type="text"
                        value={n.sourcePin}
                        placeholder="Pin #"
                        onChange={(e) => handleUpdateSourceField('net', sourceId, 'sourcePin', e.target.value)}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-1/2 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Target Node & pin</label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={n.targetComponent}
                        placeholder="RefDes"
                        onChange={(e) => handleUpdateSourceField('net', sourceId, 'targetComponent', e.target.value)}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-1/2 focus:outline-none font-mono"
                      />
                      <input
                        type="text"
                        value={n.targetPin}
                        placeholder="Pin #"
                        onChange={(e) => handleUpdateSourceField('net', sourceId, 'targetPin', e.target.value)}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-1/2 focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* POWER LOAD INSPECTOR */}
            {obj.sourceType === 'power' && (() => {
              const p = (project.powerBudget || []).find(item => item.id === sourceId);
              if (!p) return null;
              return (
                <div className="space-y-2.5">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Load Block Name</label>
                    <input
                      type="text"
                      value={p.blockName}
                      onChange={(e) => handleUpdateSourceField('power', sourceId, 'blockName', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold">Active current (mA)</label>
                      <input
                        type="number"
                        value={p.activeCurrentMa}
                        onChange={(e) => handleUpdateSourceField('power', sourceId, 'activeCurrentMa', Number(e.target.value))}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold">Duty Cycle %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={p.dutyCyclePercent}
                        onChange={(e) => handleUpdateSourceField('power', sourceId, 'dutyCyclePercent', Number(e.target.value))}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* MCU PIN MAP INSPECTOR */}
            {obj.sourceType === 'pin' && (() => {
              const pinObj = (project.pinMap || []).find(item => item.id === sourceId);
              if (!pinObj) return null;
              return (
                <div className="space-y-2.5">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Microcontroller Pin Name</label>
                    <input
                      type="text"
                      value={pinObj.mcuPin}
                      onChange={(e) => handleUpdateSourceField('pin', sourceId, 'mcuPin', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono font-bold"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Connected block</label>
                    <input
                      type="text"
                      value={pinObj.connectedBlock}
                      onChange={(e) => handleUpdateSourceField('pin', sourceId, 'connectedBlock', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Protocol Type</label>
                    <select
                      value={pinObj.protocol}
                      onChange={(e) => handleUpdateSourceField('pin', sourceId, 'protocol', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none"
                    >
                      <option value="GPIO">General GPIO</option>
                      <option value="I2C">I2C (SDA/SCL)</option>
                      <option value="SPI">SPI Interface</option>
                      <option value="UART">UART Debug RxTx</option>
                      <option value="PWM">PWM controller</option>
                      <option value="ADC">ADC analog input</option>
                      <option value="Power">Power Rail VCC</option>
                      <option value="Ground">GND reference</option>
                    </select>
                  </div>
                </div>
              );
            })()}

            {/* FIRMWARE STATE/TASK INSPECTOR */}
            {obj.sourceType === 'firmware' && (() => {
              const f = (project.firmwareTasks || []).find(item => item.id === sourceId);
              if (!f) return null;
              return (
                <div className="space-y-2.5">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Task Name</label>
                    <input
                      type="text"
                      value={f.name}
                      onChange={(e) => handleUpdateSourceField('firmware', sourceId, 'name', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold">Priority</label>
                      <select
                        value={f.priority}
                        onChange={(e) => handleUpdateSourceField('firmware', sourceId, 'priority', e.target.value)}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none"
                      >
                        <option value="MVP">MVP (Core)</option>
                        <option value="Later">Later release</option>
                        <option value="Future">Future</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-bold">Status</label>
                      <select
                        value={f.status}
                        onChange={(e) => handleUpdateSourceField('firmware', sourceId, 'status', e.target.value)}
                        className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none font-bold"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Complete (Done)</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Acceptance Criteria</label>
                    <textarea
                      rows={2}
                      value={f.acceptanceCriteria}
                      onChange={(e) => handleUpdateSourceField('firmware', sourceId, 'acceptanceCriteria', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none text-[10px]"
                    />
                  </div>
                </div>
              );
            })()}

            {/* TEST STAGE CARD INSPECTOR */}
            {obj.sourceType === 'test' && (() => {
              const t = (project.testing || []).find(item => item.id === sourceId);
              if (!t) return null;
              return (
                <div className="space-y-2.5">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Verification Stage Name</label>
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => handleUpdateSourceField('test', sourceId, 'name', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-bold"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Validation Category</label>
                    <select
                      value={t.category || "EVT"}
                      onChange={(e) => handleUpdateSourceField('test', sourceId, 'category', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none"
                    >
                      <option value="EVT">EVT (Engineering Verification)</option>
                      <option value="DVT">DVT (Design Verification)</option>
                      <option value="PVT">PVT (Production Verification)</option>
                      <option value="QA">QA (Post-assembly Checks)</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Status</label>
                    <select
                      value={t.status}
                      onChange={(e) => handleUpdateSourceField('test', sourceId, 'status', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none font-bold"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Passed">PASSED</option>
                      <option value="Failed">FAILED</option>
                      <option value="Blocked">BLOCKED</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Pass Criteria</label>
                    <input
                      type="text"
                      value={t.passCriteria}
                      onChange={(e) => handleUpdateSourceField('test', sourceId, 'passCriteria', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none"
                    />
                  </div>
                </div>
              );
            })()}

            {/* MANUFACTURING CHECKLIST ITEM INSPECTOR */}
            {obj.sourceType === 'checklist' && (() => {
              const ch = (project.manufacturingChecklist || []).find(item => item.id === sourceId);
              if (!ch) return null;
              return (
                <div className="space-y-2.5">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Task item text</label>
                    <textarea
                      rows={2}
                      value={ch.item}
                      onChange={(e) => handleUpdateSourceField('checklist', sourceId, 'item', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none text-[10px]"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Check Status</label>
                    <select
                      value={ch.status}
                      onChange={(e) => handleUpdateSourceField('checklist', sourceId, 'status', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none font-bold"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done (Verified)</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Owner notes</label>
                    <input
                      type="text"
                      value={ch.ownerNotes}
                      onChange={(e) => handleUpdateSourceField('checklist', sourceId, 'ownerNotes', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none"
                    />
                  </div>
                </div>
              );
            })()}

            {/* FACTORY FILE CARD INSPECTOR */}
            {obj.sourceType === 'factory-file' && (() => {
              const fFiles = project.factoryFiles || {};
              const ff = (fFiles as Record<string, FactoryFileStatus | undefined>)[sourceId];
              if (!ff) return null;
              return (
                <div className="space-y-2.5">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Handoff status</label>
                    <select
                      value={ff.status}
                      onChange={(e) => handleUpdateSourceField('factory-file', sourceId, 'status', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none font-bold text-amber-400"
                    >
                      <option value="Not Generated">Not Generated Yet</option>
                      <option value="Conceptual">Conceptual Planning Only</option>
                      <option value="Generated In App">Generated In App</option>
                      <option value="Needs Final Review">Needs Final Review</option>
                      <option value="Verified">Verified by Engineer</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Source Tool</label>
                    <select
                      value={ff.source}
                      onChange={(e) => handleUpdateSourceField('factory-file', sourceId, 'source', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full cursor-pointer focus:outline-none"
                    >
                      <option value="Hardware Studio">Hardware Studio</option>
                      <option value="KiCad">KiCad EDA</option>
                      <option value="Altium">Altium Designer</option>
                      <option value="EasyEDA">EasyEDA</option>
                      <option value="Fusion">Fusion 360 MCAD</option>
                      <option value="Onshape">Onshape Cloud</option>
                      <option value="SolidWorks">SolidWorks CAD</option>
                      <option value="External">External QA</option>
                    </select>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Vault File Name</label>
                    <input
                      type="text"
                      value={ff.fileName || ""}
                      placeholder="e.g. gerber_artwork_v1.zip"
                      onChange={(e) => handleUpdateSourceField('factory-file', sourceId, 'fileName', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none font-mono"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold">Review Notes</label>
                    <textarea
                      rows={3}
                      value={ff.notes || ""}
                      onChange={(e) => handleUpdateSourceField('factory-file', sourceId, 'notes', e.target.value)}
                      className="bg-slate-850 border border-slate-750 text-slate-200 rounded p-1.5 w-full focus:outline-none text-[10px]"
                    />
                  </div>
                </div>
              );
            })()}

          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 bg-slate-950/20 p-2 rounded text-[9.5px] leading-relaxed text-slate-500 font-mono">
        OBJECT ID: {obj.id}<br />
        SOURCE LINK: {obj.sourceId || 'Unlinked Custom annotation'}
      </div>

    </div>
  );
};
