'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { MechanicalObject, AssemblyLayer } from '../../types';
import { Plus, LayoutGrid, Layers, Trash2, ShieldAlert } from 'lucide-react';

export const MechanicalStudio: React.FC = () => {
  const store = useProjectStore();
  const {
    mechanicalObjects = [],
    assemblyLayers = [],
    addMechanicalObject,
    updateMechanicalObject,
    deleteMechanicalObject,
    addAssemblyLayer,
    updateAssemblyLayer,
    deleteAssemblyLayer
  } = store;

  // Selected state
  const [selectedObjId, setSelectedObjId] = useState<string | null>(null);

  // Object Form State
  const [objName, setObjName] = useState('');
  const [objType, setObjType] = useState<MechanicalObject['type']>('Board Zone');
  const [objShape, setObjShape] = useState<MechanicalObject['shape']>('rect');
  const [objX, setObjX] = useState(0);
  const [objY, setObjY] = useState(0);
  const [objW, setObjW] = useState(50);
  const [objH, setObjH] = useState(50);
  const [objRadius, setObjRadius] = useState(0);

  // Assembly Layer Form State
  const [layerName, setLayerName] = useState('');
  const [layerMaterial, setLayerMaterial] = useState('');
  const [layerThickness, setLayerThickness] = useState(1);

  const handleAddObject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objName.trim()) return;

    store.executeProjectCommand(
      'ADD_MECHANICAL_OBJECT',
      `Add mechanical zone: ${objName}`,
      () => addMechanicalObject({
        name: objName,
        type: objType,
        shape: objShape,
        xMm: objX,
        yMm: objY,
        widthMm: objShape === 'circle' ? undefined : objW,
        heightMm: objShape === 'circle' ? undefined : objH,
        radiusMm: objShape === 'circle' ? objRadius || 25 : undefined,
        rotationDeg: 0,
        locked: false,
        visible: true
      })
    );

    setObjName('');
  };

  const handleAddLayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!layerName.trim()) return;

    store.executeProjectCommand(
      'ADD_ASSEMBLY_LAYER',
      `Add assembly layer: ${layerName}`,
      () => addAssemblyLayer({
        name: layerName,
        order: assemblyLayers.length + 1,
        layerType: 'Casing',
        material: layerMaterial || 'Aluminum',
        fasteningMethod: 'Screw Thread',
        inspectionNote: '',
        notes: `Thickness ${layerThickness}mm`
      })
    );

    setLayerName('');
    setLayerMaterial('');
  };

  const handleDeleteObject = (id: string) => {
    const obj = mechanicalObjects.find(o => o.id === id);
    if (!obj) return;
    store.executeProjectCommand(
      'DELETE_MECHANICAL_OBJECT',
      `Delete mechanical object: ${obj.name}`,
      () => deleteMechanicalObject(id)
    );
    if (selectedObjId === id) setSelectedObjId(null);
  };

  const handleDeleteLayer = (id: string) => {
    const layer = assemblyLayers.find(l => l.id === id);
    if (!layer) return;
    store.executeProjectCommand(
      'DELETE_ASSEMBLY_LAYER',
      `Delete assembly layer: ${layer.name}`,
      () => deleteAssemblyLayer(id)
    );
  };

  // Run mechanical overlaps / collision verification
  const getValidationWarnings = () => {
    const warnings: string[] = [];
    const outer = mechanicalObjects.find(o => o.type === 'Outer Profile');
    const board = mechanicalObjects.find(o => o.type === 'Board Zone');

    if (!outer) {
      warnings.push("Outer Profile casing boundary is not defined.");
    }
    if (!board) {
      warnings.push("No PCB Board Zone footprint defined.");
    }
    
    // Simple mock overlap warning if board size is larger than casing
    if (outer && board) {
      const outerSize = outer.radiusMm ? outer.radiusMm * 2 : (outer.widthMm || 0);
      const boardSize = board.radiusMm ? board.radiusMm * 2 : (board.widthMm || 0);
      if (boardSize > outerSize) {
        warnings.push("Warning: PCB Board Zone size exceeds enclosure casing size!");
      }
    }

    const hasBattery = mechanicalObjects.some(o => o.type === 'Battery Cavity');
    if (!hasBattery) {
      warnings.push("Warning: Battery Cavity zone is missing.");
    }

    return warnings;
  };

  const warningsList = getValidationWarnings();

  return (
    <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col min-h-0 overflow-hidden font-mono text-[11px] p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-sm font-extrabold text-indigo-400 uppercase tracking-widest">2D Mechanical Studio</h1>
          <p className="text-[10px] text-slate-400 mt-1">Design physical board zones, connector openings, keepouts and vertical assembly order.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => store.undoProjectCommand()} className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 border border-slate-650 transition-all cursor-pointer">⟲ Undo</button>
          <button onClick={() => store.redoProjectCommand()} className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 border border-slate-650 transition-all cursor-pointer">⟳ Redo</button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: 2D Geometry Objects */}
        <div className="w-1/2 bg-slate-800/50 border border-slate-700/80 rounded-xl flex flex-col min-h-0 overflow-hidden p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h2 className="font-extrabold uppercase text-slate-350 tracking-wider flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-450" />
              Mechanical Zones & Casing Profiles
            </h2>
            <span className="text-[9px] bg-slate-750 text-slate-450 px-2 py-0.5 rounded font-mono font-bold">
              {mechanicalObjects.length} Objects
            </span>
          </div>

          <form onSubmit={handleAddObject} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Zone Object Name..."
                value={objName}
                onChange={e => setObjName(e.target.value)}
                className="col-span-2 bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={objType}
                onChange={e => setObjType(e.target.value as any)}
                className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="Outer Profile">Outer Profile</option>
                <option value="Inner Profile">Inner Profile</option>
                <option value="Board Zone">Board Zone</option>
                <option value="Battery Cavity">Battery Cavity</option>
                <option value="Connector Opening">Connector Opening</option>
                <option value="Button Opening">Button Opening</option>
                <option value="Sensor Window">Sensor Window</option>
                <option value="Mechanical Keepout">Mechanical Keepout</option>
              </select>
              <select
                value={objShape}
                onChange={e => setObjShape(e.target.value as any)}
                className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="rect">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="ellipse">Ellipse</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">X (mm)</span>
                <input type="number" value={objX} onChange={e => setObjX(Number(e.target.value))} className="bg-slate-900 text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none" />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Y (mm)</span>
                <input type="number" value={objY} onChange={e => setObjY(Number(e.target.value))} className="bg-slate-900 text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none" />
              </div>
              {objShape === 'circle' ? (
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Radius (mm)</span>
                  <input type="number" value={objRadius} onChange={e => setObjRadius(Number(e.target.value))} className="bg-slate-900 text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Width (mm)</span>
                    <input type="number" value={objW} onChange={e => setObjW(Number(e.target.value))} className="bg-slate-900 text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-slate-500 font-bold uppercase mb-0.5">Height (mm)</span>
                    <input type="number" value={objH} onChange={e => setObjH(Number(e.target.value))} className="bg-slate-900 text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none" />
                  </div>
                </>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 font-bold rounded text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Mechanical Object
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
            {mechanicalObjects.map(obj => (
              <div
                key={obj.id}
                onClick={() => setSelectedObjId(obj.id)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedObjId === obj.id
                    ? 'bg-slate-700/60 border-indigo-500'
                    : 'bg-slate-800/40 border-slate-700 hover:bg-slate-750'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-extrabold text-slate-200">{obj.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteObject(obj.id); }}
                    className="text-slate-500 hover:text-red-400 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex gap-2 text-[9px] text-slate-400 mt-1">
                  <span>Shape: {obj.shape}</span>
                  <span>Pos: X:{obj.xMm} Y:{obj.yMm}</span>
                  {obj.shape === 'circle' ? <span>Radius: {obj.radiusMm}mm</span> : <span>Size: {obj.widthMm}x{obj.heightMm}mm</span>}
                </div>
                <div className="flex gap-1.5 mt-2">
                  <span className="text-[8px] bg-slate-900 text-indigo-400 px-1 py-0.2 rounded font-extrabold uppercase tracking-wide">{obj.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Assembly Stack & Warnings */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          {/* Validation Warnings */}
          {warningsList.length > 0 && (
            <div className="bg-rose-950/40 border border-rose-900 rounded-xl p-4">
              <h3 className="font-bold text-rose-400 flex items-center gap-1.5 uppercase mb-2">
                <ShieldAlert className="w-4 h-4" />
                Mechanical DRC Violations
              </h3>
              <div className="space-y-1 text-rose-350 text-[10px]">
                {warningsList.map((w, idx) => <div key={idx}>• {w}</div>)}
              </div>
            </div>
          )}

          {/* Assembly Stack */}
          <div className="flex-1 bg-slate-800/50 border border-slate-700/80 rounded-xl flex flex-col min-h-0 overflow-hidden p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h2 className="font-extrabold uppercase text-slate-350 tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-450" />
                Assembly Stack Editor
              </h2>
              <span className="text-[9px] bg-slate-750 text-slate-450 px-2 py-0.5 rounded font-mono font-bold">
                {assemblyLayers.length} Layers
              </span>
            </div>

            <form onSubmit={handleAddLayer} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Layer Name..."
                  value={layerName}
                  onChange={e => setLayerName(e.target.value)}
                  className="bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Material..."
                  value={layerMaterial}
                  onChange={e => setLayerMaterial(e.target.value)}
                  className="bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none"
                />
                <div className="col-span-2 flex items-center gap-2">
                  <span className="text-[9px] text-slate-400">Thickness (mm):</span>
                  <input
                    type="number"
                    value={layerThickness}
                    onChange={e => setLayerThickness(Number(e.target.value))}
                    className="w-16 bg-slate-900 text-slate-100 rounded px-1.5 py-0.5 border border-slate-700 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 font-bold rounded text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Layer
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
              {assemblyLayers.map(l => (
                <div key={l.id} className="p-2.5 bg-slate-800/40 border border-slate-700 rounded-lg flex items-center justify-between">
                  <div className="text-left">
                    <span className="font-extrabold text-slate-200">Layer {l.order}: {l.name}</span>
                    <div className="text-[9px] text-slate-400 mt-1">Material: {l.material} | {l.notes}</div>
                  </div>
                  <button onClick={() => handleDeleteLayer(l.id)} className="text-slate-500 hover:text-red-400 p-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
