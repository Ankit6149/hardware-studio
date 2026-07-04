import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { NetItem } from '../types';
import { Button } from '../ui/Button';
import { 
  Plus, 
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';

export const NetlistPlanner: React.FC = () => {
  const { 
    nets = [], 
    addNet, 
    updateNet, 
    deleteNet,
    generateNetsFromPinMap
  } = useProjectStore();

  const [editingNetId, setEditingNetId] = useState<string | null>(null);

  // Form State
  const [netName, setNetName] = useState('');
  const [netType, setNetType] = useState<NetItem['netType']>('Signal');
  const [voltage, setVoltage] = useState('');
  const [sourceComponent, setSourceComponent] = useState('');
  const [sourcePin, setSourcePin] = useState('');
  const [targetComponent, setTargetComponent] = useState('');
  const [targetPin, setTargetPin] = useState('');
  const [protocol, setProtocol] = useState('');
  const [currentEstimate, setCurrentEstimate] = useState('');
  const [impedanceRequirement, setImpedanceRequirement] = useState('');
  const [notes, setNotes] = useState('');

  const handleSaveNet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!netName) return;

    const data = {
      netName,
      netType,
      voltage,
      sourceComponent,
      sourcePin,
      targetComponent,
      targetPin,
      protocol,
      currentEstimate,
      impedanceRequirement,
      notes
    };

    if (editingNetId) {
      updateNet(editingNetId, data);
      setEditingNetId(null);
    } else {
      addNet(data);
    }

    // Reset Form
    setNetName('');
    setVoltage('');
    setSourceComponent('');
    setSourcePin('');
    setTargetComponent('');
    setTargetPin('');
    setProtocol('');
    setCurrentEstimate('');
    setImpedanceRequirement('');
    setNotes('');
  };

  const handleStartEdit = (n: NetItem) => {
    setEditingNetId(n.id);
    setNetName(n.netName);
    setNetType(n.netType);
    setVoltage(n.voltage || '');
    setSourceComponent(n.sourceComponent || '');
    setSourcePin(n.sourcePin || '');
    setTargetComponent(n.targetComponent || '');
    setTargetPin(n.targetPin || '');
    setProtocol(n.protocol || '');
    setCurrentEstimate(n.currentEstimate || '');
    setImpedanceRequirement(n.impedanceRequirement || '');
    setNotes(n.notes || '');
  };

  // Warnings checker
  const getNetWarnings = () => {
    const warnings: string[] = [];
    const names = nets.map(n => n.netName.toUpperCase());

    const hasGnd = names.some(n => n === 'GND' || n.includes('GROUND'));
    const has3v3 = names.some(n => n === '3V3' || n.includes('3.3V'));
    const hasVbat = names.some(n => n === 'VBAT' || n.includes('BATTERY') || n.includes('CELL'));

    if (nets.length > 0) {
      if (!hasGnd) warnings.push("GND (Ground Return Net) is missing in routing connections.");
      if (!has3v3 && !hasVbat) warnings.push("3V3 / VBAT logic power rails are missing in electrical configurations.");
    }

    nets.forEach(n => {
      // Floating signals
      if (!n.sourcePin || n.sourcePin.toLowerCase().includes("float") || !n.targetComponent) {
        warnings.push(`Net "${n.netName}" contains floating connection pins.`);
      }
      // RF trace check
      if (n.netType === 'RF' && (!n.impedanceRequirement || !n.impedanceRequirement.toLowerCase().includes("ohm"))) {
        warnings.push(`RF net "${n.netName}" requires a target characteristic impedance specification (e.g. 50-ohm).`);
      }
      // Power net estimate check
      if (n.netType === 'Power' && (!n.currentEstimate || n.currentEstimate === '0mA' || n.currentEstimate === '')) {
        warnings.push(`Power net "${n.netName}" lacks current draw estimation details.`);
      }
    });

    // Check duplicate signal mapping
    const pinsUsed = nets.map(n => `${n.sourceComponent}-${n.sourcePin}`).filter(p => !p.includes("FLOAT") && !p.includes("GND") && !p.includes("VBAT") && !p.includes("3V3"));
    const duplicates = pinsUsed.filter((p, i) => pinsUsed.indexOf(p) !== i);
    const uniqDups = Array.from(new Set(duplicates));
    if (uniqDups.length > 0) {
      warnings.push(`Pin short collision: multiple logical nets map to pin(s) "${uniqDups.join(', ')}".`);
    }

    return warnings;
  };

  const netWarnings = getNetWarnings();

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto font-mono text-xs">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <Activity className="w-4 h-4 mr-2 text-indigo-500" />
            <span>Netlist Planner</span>
          </h2>
          <p className="text-[11px] text-slate-500 max-w-xl">
            Logical schematic netlist coordinator. Maps source components to target destinations with electrical trace checks.
          </p>
        </div>
        <div className="shrink-0">
          <Button 
            onClick={generateNetsFromPinMap}
            variant="outline"
            size="xs"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Generate from Pin Map
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Nets Table & Warnings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Warnings Panel */}
          {netWarnings.length > 0 && (
            <div className="bg-rose-50 border border-rose-250 p-4 rounded-lg space-y-2">
              <span className="font-bold text-rose-800 uppercase text-[9px] tracking-widest block flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600 shrink-0" />
                <span>Netlist DRC Warnings ({netWarnings.length})</span>
              </span>
              <ul className="list-disc pl-4 space-y-1 text-rose-905 text-[10px] leading-relaxed">
                {netWarnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {netWarnings.length === 0 && nets.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-lg flex items-center space-x-2 text-emerald-850">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">Netlist Schematic Electrical rules verified clean.</span>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
            <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wide block border-b border-slate-100 pb-2">
              Trace Netlist Registry
            </span>

            {nets.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded">
                <p>No connections defined in netlist planner yet.</p>
                <p className="text-[10px] mt-1">Generate nets from the pin map layout or add one manually using the side form.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                      <th className="p-2">Net Name</th>
                      <th className="p-2 text-center">Type</th>
                      <th className="p-2">Trace Source</th>
                      <th className="p-2">Trace Target</th>
                      <th className="p-2">Voltage</th>
                      <th className="p-2 text-center font-bold">Impedance</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-705">
                    {nets.map(n => (
                      <tr key={n.id} className="hover:bg-slate-50/50 text-[11px] align-top">
                        <td className="p-2 font-bold text-slate-900">{n.netName}</td>
                        <td className="p-2 text-center">
                          <span className={`px-1 rounded text-[8px] font-bold uppercase tracking-wider ${
                            n.netType === 'Power' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : n.netType === 'Ground'
                                ? 'bg-slate-900 text-slate-200'
                                : n.netType === 'RF'
                                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                                  : 'bg-slate-100 text-slate-650'
                          }`}>
                            {n.netType}
                          </span>
                        </td>
                        <td className="p-2 font-mono text-[10px]">
                          <span className="font-bold text-indigo-750">{n.sourceComponent}</span>-{n.sourcePin || 'FLOAT'}
                        </td>
                        <td className="p-2 font-mono text-[10px]">
                          <span className="font-bold text-indigo-750">{n.targetComponent}</span>-{n.targetPin || 'FLOAT'}
                        </td>
                        <td className="p-2 font-mono">{n.voltage || '3.3V'}</td>
                        <td className="p-2 text-center font-mono text-[10px] text-slate-500">{n.impedanceRequirement || 'None'}</td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center space-x-1">
                            <Button onClick={() => handleStartEdit(n)} variant="outline" size="xs">
                              Edit
                            </Button>
                            <Button 
                              onClick={() => deleteNet(n.id)} 
                              variant="outline" 
                              size="xs"
                              className="text-rose-650 hover:bg-rose-50"
                            >
                              Del
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Net Editor Form */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase text-[10px] tracking-wide">
            {editingNetId ? "Configure Trace Net" : "Add Schematic Net"}
          </h3>
          
          <form onSubmit={handleSaveNet} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase text-[9px]">Net Name</label>
              <input 
                type="text" 
                value={netName} 
                onChange={e => setNetName(e.target.value)} 
                placeholder="e.g. TOUCH_INT, 3V3, GND" 
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Net Type</label>
                <select 
                  value={netType} 
                  onChange={e => setNetType(e.target.value as NetItem['netType'])}
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                >
                  <option value="Signal">Signal</option>
                  <option value="Power">Power</option>
                  <option value="Ground">Ground</option>
                  <option value="Clock">Clock</option>
                  <option value="RF">RF</option>
                  <option value="Differential">Differential</option>
                  <option value="Analog">Analog</option>
                  <option value="Digital">Digital</option>
                  <option value="Programming">Programming</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Voltage</label>
                <input 
                  type="text" 
                  value={voltage} 
                  onChange={e => setVoltage(e.target.value)} 
                  placeholder="e.g. 3.3V, 0V" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Source Ref Des</label>
                <input 
                  type="text" 
                  value={sourceComponent} 
                  onChange={e => setSourceComponent(e.target.value)} 
                  placeholder="e.g. U1" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Source Pin</label>
                <input 
                  type="text" 
                  value={sourcePin} 
                  onChange={e => setSourcePin(e.target.value)} 
                  placeholder="e.g. 15, GND" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Target Ref Des</label>
                <input 
                  type="text" 
                  value={targetComponent} 
                  onChange={e => setTargetComponent(e.target.value)} 
                  placeholder="e.g. R1, IMU" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Target Pin</label>
                <input 
                  type="text" 
                  value={targetPin} 
                  onChange={e => setTargetPin(e.target.value)} 
                  placeholder="e.g. 1, SDA" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Current Draw</label>
                <input 
                  type="text" 
                  value={currentEstimate} 
                  onChange={e => setCurrentEstimate(e.target.value)} 
                  placeholder="e.g. 50mA, 2uA" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Impedance (ohm)</label>
                <input 
                  type="text" 
                  value={impedanceRequirement} 
                  onChange={e => setImpedanceRequirement(e.target.value)} 
                  placeholder="e.g. 50-ohm" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase text-[9px]">Trace notes / guidelines</label>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Special spacing or return path routing details..." 
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded h-16 focus:outline-none focus:border-indigo-500 font-mono text-[11px] leading-relaxed resize-none"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingNetId ? "Update Net" : "Create Net"}
              </Button>
              {editingNetId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingNetId(null);
                    setNetName('');
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
