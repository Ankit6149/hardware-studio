import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { PCBConstraint } from '../types';
import { Button } from '../ui/Button';
import { 
  Plus, 
  AlertTriangle,
  CheckCircle,
  FileCheck2
} from 'lucide-react';

export const PCBConstraints: React.FC = () => {
  const { 
    boards = [],
    pcbConstraints = [], 
    addPCBConstraint, 
    updatePCBConstraint, 
    deletePCBConstraint,
    generatePCBConstraintsFromBoard
  } = useProjectStore();

  const [editingConstraintId, setEditingConstraintId] = useState<string | null>(null);

  // Form State
  const [cType, setCType] = useState<PCBConstraint['constraintType']>('Trace Width');
  const [cValue, setCValue] = useState('');
  const [cUnit, setCUnit] = useState('mil');
  const [cDescription, setCDescription] = useState('');
  const [cSeverity, setCSeverity] = useState<PCBConstraint['severity']>('Info');
  const [cBoardId, setCBoardId] = useState('');

  const handleSaveConstraint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cValue) return;

    const data = {
      boardId: cBoardId || (boards[0]?.id || ''),
      constraintType: cType,
      value: cValue,
      unit: cUnit,
      description: cDescription,
      severity: cSeverity
    };

    if (editingConstraintId) {
      updatePCBConstraint(editingConstraintId, data);
      setEditingConstraintId(null);
    } else {
      addPCBConstraint(data);
    }

    // Reset Form
    setCValue('');
    setCDescription('');
  };

  const handleStartEdit = (c: PCBConstraint) => {
    setEditingConstraintId(c.id);
    setCType(c.constraintType);
    setCValue(c.value);
    setCUnit(c.unit);
    setCDescription(c.description);
    setCSeverity(c.severity);
    setCBoardId(c.boardId);
  };

  // Critical constraints checker
  const getMissingCriticalConstraints = () => {
    const missing: string[] = [];
    if (boards.length === 0) return missing;

    boards.forEach(b => {
      const boardConsts = pcbConstraints.filter(c => c.boardId === b.id);
      const types = boardConsts.map(c => c.constraintType);

      if (!types.includes("Board Outline")) {
        missing.push(`Board outline geometry boundaries not set for "${b.name}".`);
      }
      if (!types.includes("Trace Width") || !types.includes("Clearance")) {
        missing.push(`Copper trace manufacturing width/clearance limits missing for "${b.name}".`);
      }
      if (b.substrate === 'Polyimide Flex' && !types.includes("Flex Bend")) {
        missing.push(`Flex dynamic bending radius clearance rules missing for polyimide board "${b.name}".`);
      }
      if (b.rfNotes && !types.includes("Antenna")) {
        missing.push(`RF transceiver keepout shielding boundaries missing for "${b.name}".`);
      }
    });

    return missing;
  };

  const missingConstraints = getMissingCriticalConstraints();

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto font-mono text-xs">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <FileCheck2 className="w-4 h-4 mr-2 text-indigo-500" />
            <span>PCB Design Constraints</span>
          </h2>
          <p className="text-[11px] text-slate-500 max-w-xl">
            Register board manufacturing limitations including trace widths, safety clearance rules, dynamic flex bending limits, and RF keepouts.
          </p>
        </div>
        <div className="shrink-0">
          <Button 
            onClick={generatePCBConstraintsFromBoard}
            variant="outline"
            size="xs"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Generate Starter Constraints
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Constraints list & Warnings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Missing constraints warnings */}
          {missingConstraints.length > 0 && (
            <div className="bg-amber-50 border border-amber-250 p-4 rounded-lg space-y-2">
              <span className="font-bold text-amber-850 uppercase text-[9px] tracking-widest block flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600 shrink-0" />
                <span>Missing Critical Constraints ({missingConstraints.length})</span>
              </span>
              <ul className="list-disc pl-4 space-y-1 text-amber-900 text-[10px] leading-relaxed">
                {missingConstraints.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {missingConstraints.length === 0 && boards.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-lg flex items-center space-x-2 text-emerald-850">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">All critical manufacturing design rules configured.</span>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
            <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wide block border-b border-slate-100 pb-2">
              Design Constraints Catalog
            </span>

            {pcbConstraints.length === 0 ? (
              <div className="text-center py-10 text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded">
                <p>No manufacturing constraints configured yet.</p>
                <p className="text-[10px] mt-1">Generate starter limits matching your boards or configure one manually using the form.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                      <th className="p-2">Target Board</th>
                      <th className="p-2">Constraint Type</th>
                      <th className="p-2 font-bold text-center">Value</th>
                      <th className="p-2">Severity</th>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-705">
                    {pcbConstraints.map(c => {
                      const targetBoard = boards.find(b => b.id === c.boardId)?.name || "Unassigned";
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50 text-[11px] align-top">
                          <td className="p-2 font-bold text-slate-500">{targetBoard}</td>
                          <td className="p-2 font-bold text-slate-800">{c.constraintType}</td>
                          <td className="p-2 text-center font-mono font-bold text-indigo-750">{c.value} {c.unit}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              c.severity === 'Critical' 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                : c.severity === 'Warning'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-250'
                                  : 'bg-slate-100 text-slate-600'
                            }`}>
                              {c.severity}
                            </span>
                          </td>
                          <td className="p-2 leading-relaxed max-w-xs">{c.description}</td>
                          <td className="p-2 text-center">
                            <div className="flex justify-center space-x-1">
                              <Button onClick={() => handleStartEdit(c)} variant="outline" size="xs">
                                Edit
                              </Button>
                              <Button 
                                onClick={() => deletePCBConstraint(c.id)} 
                                variant="outline" 
                                size="xs"
                                className="text-rose-650 hover:bg-rose-50"
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

        {/* Constraint Editor Form */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase text-[10px] tracking-wide">
            {editingConstraintId ? "Modify Constraint" : "Add Layout Constraint"}
          </h3>
          
          <form onSubmit={handleSaveConstraint} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase text-[9px]">Target Board</label>
              <select 
                value={cBoardId} 
                onChange={e => setCBoardId(e.target.value)}
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
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Constraint Type</label>
                <select 
                  value={cType} 
                  onChange={e => setCType(e.target.value as PCBConstraint['constraintType'])}
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                >
                  <option value="Board Outline">Board Outline</option>
                  <option value="Layer Stack">Layer Stack</option>
                  <option value="Trace Width">Trace Width</option>
                  <option value="Clearance">Clearance</option>
                  <option value="Via">Via size limits</option>
                  <option value="RF Keepout">RF Keepout</option>
                  <option value="Antenna">Antenna Window</option>
                  <option value="Battery">Battery slot gap</option>
                  <option value="Thermal">Thermal plane vias</option>
                  <option value="Flex Bend">Flex Bend radius</option>
                  <option value="Mounting">Mounting pads</option>
                  <option value="Test Point">Test Point probe</option>
                  <option value="Connector">Connector edge clearance</option>
                  <option value="Silkscreen">Silkscreen margins</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Severity</label>
                <select 
                  value={cSeverity} 
                  onChange={e => setCSeverity(e.target.value as PCBConstraint['severity'])}
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                >
                  <option value="Info">Info only</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical blocker</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Limit Value</label>
                <input 
                  type="text" 
                  value={cValue} 
                  onChange={e => setCValue(e.target.value)} 
                  placeholder="e.g. 6, 1.5" 
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Unit</label>
                <select 
                  value={cUnit} 
                  onChange={e => setCUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                >
                  <option value="mil">mil (inch/1000)</option>
                  <option value="mm">mm (metric)</option>
                  <option value="oz">oz (copper weight)</option>
                  <option value="Layers">Layers (count)</option>
                  <option value="N/A">None / Text</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase text-[9px]">Constraint Description</label>
              <textarea 
                value={cDescription} 
                onChange={e => setCDescription(e.target.value)} 
                placeholder="Details of safety margins or manufacturing trace widths..." 
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded h-16 focus:outline-none focus:border-indigo-500 font-mono text-[11px] leading-relaxed resize-none"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingConstraintId ? "Update Rule" : "Create Rule"}
              </Button>
              {editingConstraintId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingConstraintId(null);
                    setCValue('');
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
