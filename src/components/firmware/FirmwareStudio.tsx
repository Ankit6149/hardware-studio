'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { FirmwareModule } from '../../types';
import { Plus, Download, Code, Play, ShieldAlert, Trash2 } from 'lucide-react';

export const FirmwareStudio: React.FC = () => {
  const store = useProjectStore();
  const {
    firmwareModules = [],
    addFirmwareModule,
    updateFirmwareModule,
    deleteFirmwareModule,
    boardComponents = []
  } = store;

  // Selected module state
  const [selectedModId, setSelectedModId] = useState<string | null>(null);

  // States list (mock state machine editor)
  const [states, setStates] = useState<{ name: string; type: string }[]>([
    { name: 'INIT', type: 'Initial' },
    { name: 'IDLE', type: 'Normal' },
    { name: 'ACTIVE', type: 'Normal' },
    { name: 'SLEEP', type: 'Power' }
  ]);

  const [newStateName, setNewStateName] = useState('');
  const [newStateType, setNewStateType] = useState('Normal');

  // Firmware Module form state
  const [modName, setModName] = useState('');
  const [modType, setModType] = useState<FirmwareModule['type']>('Driver');
  const [modDesc, setModDesc] = useState('');

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modName.trim()) return;

    store.executeProjectCommand(
      'ADD_FIRMWARE_MODULE',
      `Add firmware module: ${modName}`,
      () => addFirmwareModule({
        name: modName,
        type: modType,
        description: modDesc,
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [],
        linkedPinIds: [],
        linkedNetIds: [],
        linkedTestIds: [],
        dependencies: [],
        sourceFiles: [],
        status: 'Draft'
      })
    );

    setModName('');
    setModDesc('');
  };

  const handleAddState = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName.trim()) return;

    setStates([...states, { name: newStateName.toUpperCase(), type: newStateType }]);
    setNewStateName('');
  };

  const handleDeleteModule = (id: string) => {
    const mod = firmwareModules.find(m => m.id === id);
    if (!mod) return;
    store.executeProjectCommand(
      'DELETE_FIRMWARE_MODULE',
      `Delete firmware module: ${mod.name}`,
      () => deleteFirmwareModule(id)
    );
    if (selectedModId === id) setSelectedModId(null);
  };

  const handleDownloadSkeleton = () => {
    let sourceCode = `/*\n * Generated In App — Needs Engineering Review\n * Target: C/C++ Header/Source Skeleton\n */\n\n#ifndef HARDWARE_STUDIO_FIRMWARE_H\n#define HARDWARE_STUDIO_FIRMWARE_H\n\n`;

    // Add state enums
    sourceCode += `// State Machine Enums\ntypedef enum {\n`;
    states.forEach(s => {
      sourceCode += `    STATE_${s.name},\n`;
    });
    sourceCode += `} SystemState;\n\n`;

    // Add module declarations
    sourceCode += `// Active Subsystem Modules Skeletons\n`;
    firmwareModules.forEach(mod => {
      sourceCode += `// Module: ${mod.name} (${mod.type})\n`;
      sourceCode += `void init_${mod.name.toLowerCase()}();\n`;
      sourceCode += `void process_${mod.name.toLowerCase()}();\n\n`;
    });

    sourceCode += `#endif // HARDWARE_STUDIO_FIRMWARE_H\n`;

    const blob = new Blob([sourceCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'firmware_skeleton.h';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStateMachineWarnings = () => {
    const warnings: string[] = [];
    const hasSleep = states.some(s => s.type === 'Power' || s.name.includes('SLEEP'));
    if (!hasSleep) {
      warnings.push("Warning: No sleep or low-power state path configured in the state machine.");
    }
    const hasFault = states.some(s => s.type === 'Fault' || s.name.includes('FAULT') || s.name.includes('ERROR'));
    if (!hasFault) {
      warnings.push("Warning: No fault recovery state mapping defined in the state machine.");
    }
    return warnings;
  };

  const stateWarnings = getStateMachineWarnings();

  return (
    <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col min-h-0 overflow-hidden font-mono text-[11px] p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-sm font-extrabold text-indigo-400 uppercase tracking-widest">Firmware Studio</h1>
          <p className="text-[10px] text-slate-400 mt-1">Develop custom drivers, create state-machine pathways, and export code skeletons.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadSkeleton}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-white font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Skeleton (.H)
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Firmware Modules */}
        <div className="w-1/2 bg-slate-800/50 border border-slate-700/80 rounded-xl flex flex-col min-h-0 overflow-hidden p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h2 className="font-extrabold uppercase text-slate-350 tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-indigo-450" />
              Subsystem Firmware Modules
            </h2>
            <span className="text-[9px] bg-slate-750 text-slate-450 px-2 py-0.5 rounded font-mono font-bold">
              {firmwareModules.length} Modules
            </span>
          </div>

          <form onSubmit={handleAddModule} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Module Name (e.g. AccelDriver)..."
                value={modName}
                onChange={e => setModName(e.target.value)}
                className="bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={modType}
                onChange={e => setModType(e.target.value as any)}
                className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="Driver">Driver</option>
                <option value="Service">Service</option>
                <option value="Communication">Communication</option>
                <option value="Power">Power</option>
                <option value="Safety">Safety</option>
              </select>
            </div>
            <textarea
              placeholder="Module Description..."
              value={modDesc}
              onChange={e => setModDesc(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500 h-10 resize-none"
            />
            <button
              type="submit"
              className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 font-bold rounded text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Module
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
            {firmwareModules.map(mod => (
              <div
                key={mod.id}
                onClick={() => setSelectedModId(mod.id)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedModId === mod.id
                    ? 'bg-slate-700/60 border-indigo-500'
                    : 'bg-slate-800/40 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-extrabold text-slate-200">{mod.name}</span>
                  <button onClick={() => handleDeleteModule(mod.id)} className="text-slate-500 hover:text-red-400 p-0.5">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{mod.description}</p>
                <div className="flex gap-1.5 mt-2">
                  <span className="text-[8px] bg-slate-900 text-indigo-400 px-1 py-0.2 rounded font-extrabold uppercase tracking-wide">{mod.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: State-Machine Canvas/List */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          {/* Warnings */}
          {stateWarnings.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-900 rounded-xl p-4">
              <h3 className="font-bold text-rose-400 flex items-center gap-1.5 uppercase mb-2">
                <ShieldAlert className="w-4 h-4" />
                State Machine Warnings
              </h3>
              <div className="space-y-1 text-rose-350 text-[10px]">
                {stateWarnings.map((w, idx) => <div key={idx}>• {w}</div>)}
              </div>
            </div>
          )}

          {/* State Diagram Map */}
          <div className="flex-1 bg-slate-800/50 border border-slate-700/80 rounded-xl flex flex-col min-h-0 overflow-hidden p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h2 className="font-extrabold uppercase text-slate-350 tracking-wider flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-450" />
                State Machine Editor
              </h2>
            </div>

            <form onSubmit={handleAddState} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 flex items-center gap-2">
              <input
                type="text"
                placeholder="NEW_STATE..."
                value={newStateName}
                onChange={e => setNewStateName(e.target.value)}
                className="bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500 flex-1"
              />
              <select
                value={newStateType}
                onChange={e => setNewStateType(e.target.value)}
                className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="Normal">Normal</option>
                <option value="Power">Low Power</option>
                <option value="Fault">Fault</option>
              </select>
              <button
                type="submit"
                className="py-1 px-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded text-white cursor-pointer"
              >
                + Add
              </button>
            </form>

            <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto min-h-0 pr-1">
              {states.map(s => (
                <div key={s.name} className="p-3 bg-slate-800/60 border border-slate-700 rounded-lg text-center relative flex flex-col items-center justify-center">
                  <div className="text-slate-200 font-bold">{s.name}</div>
                  <div className={`text-[8px] mt-1 px-1.5 py-0.2 rounded font-extrabold uppercase ${
                    s.type === 'Power' ? 'bg-amber-950 text-amber-400' : s.type === 'Fault' ? 'bg-red-950 text-red-400' : 'bg-slate-900 text-slate-450'
                  }`}>
                    {s.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
