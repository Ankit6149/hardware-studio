import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { ManufacturingChecklistItem } from '../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Plus, 
  FileCheck2, 
  AlertTriangle
} from 'lucide-react';

export const ManufacturingPack: React.FC = () => {
  const { 
    manufacturingChecklist = [], 
    addChecklistItem, 
    updateChecklistItem, 
    deleteChecklistItem,
    generateManufacturingChecklist
  } = useProjectStore();

  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState<ManufacturingChecklistItem['category']>('Schematic');
  const [itemText, setItemText] = useState('');
  const [status, setStatus] = useState<ManufacturingChecklistItem['status']>('Not Started');
  const [ownerNotes, setOwnerNotes] = useState('');
  const [blockingReason, setBlockingReason] = useState('');

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemText) return;

    const data = {
      category,
      item: itemText,
      status,
      ownerNotes,
      blockingReason: status === 'Blocked' ? blockingReason : ''
    };

    if (editingItemId) {
      updateChecklistItem(editingItemId, data);
      setEditingItemId(null);
    } else {
      addChecklistItem(data);
    }

    // Reset Form
    setItemText('');
    setOwnerNotes('');
    setBlockingReason('');
  };

  const handleStartEdit = (mc: ManufacturingChecklistItem) => {
    setEditingItemId(mc.id);
    setCategory(mc.category);
    setItemText(mc.item);
    setStatus(mc.status);
    setOwnerNotes(mc.ownerNotes || '');
    setBlockingReason(mc.blockingReason || '');
  };

  // Readiness calculation
  const totalCount = manufacturingChecklist.length;
  const doneCount = manufacturingChecklist.filter(mc => mc.status === 'Done').length;
  const blockedCount = manufacturingChecklist.filter(mc => mc.status === 'Blocked').length;
  const readinessPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto font-mono text-xs">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <FileCheck2 className="w-4 h-4 mr-2 text-indigo-500" />
            <span>Manufacturing Prep & Release Pack</span>
          </h2>
          <p className="text-[11px] text-slate-500 max-w-xl">
            Verifies schematic netlists, pick-and-place files, footprint mappings, and mechanical clearances before shipping to the fabricator.
          </p>
        </div>
        <div className="shrink-0">
          <Button 
            onClick={generateManufacturingChecklist}
            variant="outline"
            size="xs"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Generate Manufacturing Checklist
          </Button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ECAD Release Readiness</span>
          <span className="text-3xl font-extrabold text-slate-850 mt-2 block">{readinessPercent}%</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Completed Actions</span>
          <span className="text-3xl font-extrabold text-slate-850 mt-2 block">{doneCount} / {totalCount} Done</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Release Blockers</span>
          <span className={`text-xs font-bold px-2 py-1 rounded mt-2 border text-center uppercase tracking-wide ${
            blockedCount > 0 ? 'bg-rose-105 text-rose-800 border-rose-200' : 'bg-slate-100 text-slate-600'
          }`}>
            {blockedCount > 0 ? `${blockedCount} ACTIVE BLOCKERS` : '0 BLOCKED CHECKS'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Checklist Groups */}
        <div className="lg:col-span-2 space-y-6">
          {totalCount === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white border border-slate-200 rounded-lg shadow-sm">
              <p>No manufacturing checklists loaded for this workspace yet.</p>
              <p className="text-[10px] mt-1">Generate the default checklists above or compile manually using the form.</p>
            </div>
          ) : (
            ["Schematic", "PCB Layout", "BOM", "Assembly", "Testing", "Compliance", "Mechanical", "Export"].map(cat => {
              const items = manufacturingChecklist.filter(mc => mc.category === cat);
              if (items.length === 0) return null;

              return (
                <div key={cat} className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
                  <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                    <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wide">
                      {cat} Checklist
                    </span>
                    <Badge variant="info" className="scale-90 font-mono">
                      {items.filter(i => i.status === 'Done').length} / {items.length} Done
                    </Badge>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {items.map(mc => (
                      <div key={mc.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="space-y-1.5 flex-1">
                          <span className="font-semibold text-slate-800 text-[11px] leading-relaxed block">{mc.item}</span>
                          {mc.ownerNotes && (
                            <span className="text-[10px] text-slate-500 font-mono leading-relaxed block">
                              <strong>Notes:</strong> {mc.ownerNotes}
                            </span>
                          )}
                          {mc.status === 'Blocked' && mc.blockingReason && (
                            <div className="bg-rose-50 border border-rose-100 text-rose-800 text-[9px] p-1.5 rounded leading-normal flex items-start space-x-1 mt-1 font-mono">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <span><strong>Blocker:</strong> {mc.blockingReason}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 shrink-0 self-end sm:self-start">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            mc.status === 'Done' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' 
                              : mc.status === 'Blocked' 
                                ? 'bg-rose-50 text-rose-700 border border-rose-250'
                                : mc.status === 'In Progress'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-250'
                                  : 'bg-slate-100 text-slate-600'
                          }`}>
                            {mc.status}
                          </span>
                          <div className="flex space-x-1">
                            <Button onClick={() => handleStartEdit(mc)} variant="outline" size="xs">
                              Configure
                            </Button>
                            <Button 
                              onClick={() => deleteChecklistItem(mc.id)} 
                              variant="outline" 
                              size="xs"
                              className="text-rose-650 hover:bg-rose-50"
                            >
                              Del
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Checklist Item Form */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 space-y-4">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase text-[10px] tracking-wide">
            {editingItemId ? "Configure Checklist Check" : "Add Checklist Item"}
          </h3>
          
          <form onSubmit={handleSaveItem} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase text-[9px]">Checklist Action</label>
              <textarea 
                value={itemText} 
                onChange={e => setItemText(e.target.value)} 
                placeholder="e.g. Confirm PCB layout DRC limits..." 
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded h-16 focus:outline-none focus:border-indigo-500 font-mono text-[11px] leading-relaxed resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value as ManufacturingChecklistItem['category'])}
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                >
                  <option value="Schematic">Schematic</option>
                  <option value="PCB Layout">PCB Layout</option>
                  <option value="BOM">BOM</option>
                  <option value="Assembly">Assembly</option>
                  <option value="Testing">Testing</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Export">Export Pack</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-slate-500 font-bold uppercase text-[9px]">Status</label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value as ManufacturingChecklistItem['status'])}
                  className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded font-mono text-[11px]"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
            </div>

            {status === 'Blocked' && (
              <div className="space-y-1">
                <label className="block text-rose-600 font-bold uppercase text-[9px]">Blocking Reason</label>
                <input 
                  type="text" 
                  value={blockingReason} 
                  onChange={e => setBlockingReason(e.target.value)} 
                  placeholder="e.g. Awaiting antenna simulation feedback" 
                  className="w-full bg-slate-50 border border-rose-200 p-1.5 rounded font-mono text-[11px]"
                  required={status === 'Blocked'}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-slate-500 font-bold uppercase text-[9px]">Release Owner Notes</label>
              <textarea 
                value={ownerNotes} 
                onChange={e => setOwnerNotes(e.target.value)} 
                placeholder="Engineering status or action notes..." 
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded h-16 focus:outline-none focus:border-indigo-500 font-mono text-[11px] leading-relaxed resize-none"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editingItemId ? "Update Action" : "Create Action"}
              </Button>
              {editingItemId && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setEditingItemId(null);
                    setItemText('');
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
