import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { Trash2, Link2, Info, ChevronDown, ChevronRight, Copy, Globe, Tag } from 'lucide-react';
import { Button } from '../ui/Button';

export const PropertiesPanel: React.FC = () => {
  const { 
    selectedNodeId, 
    nodes, 
    edges, 
    updateNode, 
    deleteNode,
    addNode,
    setSelectedNodeId
  } = useProjectStore();

  // Accordion toggle states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    engineering: true,
    risk: false,
    views: false,
    trace: false
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="w-80 border-l border-slate-200 bg-white flex flex-col items-center justify-center p-6 text-center text-slate-400 shrink-0 shadow-sm z-20 font-mono">
        <Info className="w-8 h-8 text-slate-350 mb-2" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Block Selected</p>
        <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
          Click a block on the blueprint canvas to configure parameters, electrical pins, sourcing details, and risk mitigations.
        </p>
      </aside>
    );
  }

  const d = selectedNode.data;
  const isBoundary = selectedNode.type === 'boundaryNode';

  // Connections
  const inbound = edges.filter(e => e.target === selectedNodeId);
  const outbound = edges.filter(e => e.source === selectedNodeId);

  const handleFieldChange = (key: string, value: any) => {
    updateNode(selectedNode.id, { [key]: value });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete the block "${d.name}"?`)) {
      deleteNode(selectedNode.id);
    }
  };

  const handleDuplicate = () => {
    const dupId = `node_dup_${Date.now()}`;
    addNode({
      id: dupId,
      type: selectedNode.type,
      position: { x: selectedNode.position.x + 30, y: selectedNode.position.y + 30 },
      width: selectedNode.width,
      height: selectedNode.height,
      data: {
        ...d,
        name: `${d.name} (Copy)`
      }
    });
  };

  const handleToggleView = (viewId: string) => {
    const currentViews = d.views || [];
    let updatedViews: string[];
    if (currentViews.includes(viewId)) {
      // Don't remove if it is the only view
      if (currentViews.length <= 1) return;
      updatedViews = currentViews.filter(v => v !== viewId);
    } else {
      updatedViews = [...currentViews, viewId];
    }
    handleFieldChange('views', updatedViews);
  };

  const viewDefinitions = [
    { id: 'master', label: 'Master View' },
    { id: 'outer', label: 'Outer Design' },
    { id: 'internal', label: 'Internal Layout' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'firmware', label: 'Firmware' },
    { id: 'power', label: 'Power System' },
    { id: 'system-alpha', label: 'System Alpha' }
  ];

  return (
    <aside className="w-80 border-l border-slate-200 bg-white flex flex-col h-full shrink-0 shadow-sm z-20 overflow-hidden font-mono">
      {/* Block Title Header */}
      <div className="p-3 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
        <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest truncate max-w-[150px]">
          {d.name}
        </span>
        <div className="flex items-center space-x-1 shrink-0">
          <Button 
            onClick={handleDuplicate}
            variant="secondary"
            size="xs"
            title="Duplicate Block"
            icon={<Copy className="w-3 h-3" />}
          />
          <Button 
            onClick={handleDelete}
            variant="danger"
            size="xs"
            title="Delete Block"
            icon={<Trash2 className="w-3 h-3" />}
          />
        </div>
      </div>

      {/* Accordions Scroll Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-150">
        
        {/* GROUP 1: GENERAL */}
        <div className="p-3.5 space-y-3">
          <button 
            onClick={() => toggleSection('general')}
            className="w-full flex items-center justify-between text-left mb-1.5 focus:outline-none"
          >
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
              General Attributes
            </span>
            {openSections.general ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {openSections.general && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div>
                <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Block Name</label>
                <input
                  type="text"
                  value={d.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={d.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                  >
                    {["Product", "Interaction", "Electronics", "Firmware", "Mechanical", "Power", "Software", "Testing", "Manufacturing", "Safety"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Status</label>
                  <select
                    value={d.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="MVP">MVP Now</option>
                    <option value="Later">Later Phase</option>
                    <option value="Future">Future Context</option>
                    <option value="External">External</option>
                    <option value="Risk">Critical Risk</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={d.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-900 rounded p-1.5 text-xs text-slate-700 font-sans resize-none"
                  placeholder="Functional summary of this component..."
                />
              </div>

              <div>
                <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Purpose & Goal</label>
                <textarea
                  rows={2}
                  value={d.purpose || ''}
                  onChange={(e) => handleFieldChange('purpose', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-900 rounded p-1.5 text-xs text-slate-700 font-sans resize-none"
                  placeholder="Why is this block required?"
                />
              </div>

              <div>
                <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Functional Specs</label>
                <textarea
                  rows={2}
                  value={d.requirements || ''}
                  onChange={(e) => handleFieldChange('requirements', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-900 rounded p-1.5 text-xs text-slate-700 font-sans resize-none"
                  placeholder="e.g. Dimensions, operating voltages..."
                />
              </div>
            </div>
          )}
        </div>

        {/* GROUP 2: ENGINEERING */}
        {!isBoundary && (
          <div className="p-3.5 space-y-3">
            <button 
              onClick={() => toggleSection('engineering')}
              className="w-full flex items-center justify-between text-left mb-1.5 focus:outline-none"
            >
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                Engineering Details
              </span>
              {openSections.engineering ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            {openSections.engineering && (
              <div className="space-y-3 animate-in fade-in duration-100">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Component candidate</label>
                    <input
                      type="text"
                      value={d.candidateComponents || ''}
                      onChange={(e) => handleFieldChange('candidateComponents', e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded px-2 py-1 text-xs text-slate-750 focus:outline-none"
                      placeholder="e.g. nRF52840"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Priority</label>
                    <select
                      value={d.priority || 'Medium'}
                      onChange={(e) => handleFieldChange('priority', e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded px-2 py-1 text-xs text-slate-750 focus:outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Electrical details</label>
                  <textarea
                    rows={2}
                    value={d.electricalNotes || ''}
                    onChange={(e) => handleFieldChange('electricalNotes', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 font-sans resize-none"
                    placeholder="Decoupling, pins configuration, test points..."
                  />
                </div>

                <div>
                  <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Mechanical chassis constraints</label>
                  <textarea
                    rows={2}
                    value={d.mechanicalNotes || ''}
                    onChange={(e) => handleFieldChange('mechanicalNotes', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 font-sans resize-none"
                    placeholder="Shielding zones, clearance buffers, heights..."
                  />
                </div>

                <div>
                  <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Firmware requirements</label>
                  <textarea
                    rows={2}
                    value={d.firmwareNotes || ''}
                    onChange={(e) => handleFieldChange('firmwareNotes', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-700 font-sans resize-none"
                    placeholder="Driver state enums, polling speeds..."
                  />
                </div>

                <div>
                  <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Datasheet link</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={d.datasheetUrl || ''}
                      onChange={(e) => handleFieldChange('datasheetUrl', e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded pl-7 pr-2 py-1 text-xs text-blue-700 truncate focus:outline-none"
                      placeholder="https://..."
                    />
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Supplier purchasing link</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={d.supplierUrl || ''}
                      onChange={(e) => handleFieldChange('supplierUrl', e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded pl-7 pr-2 py-1 text-xs text-slate-750 truncate focus:outline-none"
                      placeholder="https://..."
                    />
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1 flex items-center">
                    <Tag className="w-3 h-3 text-slate-450 mr-1" />
                    <span>Tags (comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={d.tags ? d.tags.join(', ') : ''}
                    onChange={(e) => handleFieldChange('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="w-full bg-white border border-slate-250 rounded px-2 py-1 text-xs text-slate-700 focus:outline-none"
                    placeholder="e.g. sensor, i2c, high-power"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* GROUP 3: RISK ASSESSMENT */}
        <div className="p-3.5 space-y-3">
          <button 
            onClick={() => toggleSection('risk')}
            className="w-full flex items-center justify-between text-left mb-1.5 focus:outline-none"
          >
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
              Risks & Mitigation
            </span>
            {openSections.risk ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {openSections.risk && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div>
                <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Potential failure modes</label>
                <textarea
                  rows={2}
                  value={d.risks || ''}
                  onChange={(e) => handleFieldChange('risks', e.target.value)}
                  className="w-full bg-rose-50/40 border border-rose-150 rounded p-1.5 text-xs text-rose-800 font-sans resize-none"
                  placeholder="e.g. Over-temperature during continuous haptic usage..."
                />
              </div>

              <div>
                <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Mitigation actions</label>
                <textarea
                  rows={2}
                  value={d.mitigation || ''}
                  onChange={(e) => handleFieldChange('mitigation', e.target.value)}
                  className="w-full bg-emerald-50/40 border border-emerald-150 rounded p-1.5 text-xs text-emerald-800 font-sans resize-none"
                  placeholder="e.g. Adding PTC resettable fuse inline..."
                />
              </div>

              <div>
                <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Open Design questions</label>
                <textarea
                  rows={2}
                  value={d.openQuestions || ''}
                  onChange={(e) => handleFieldChange('openQuestions', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-750 font-sans resize-none"
                  placeholder="e.g. Is LDO efficiency high enough, or do we need switching buck?"
                />
              </div>
            </div>
          )}
        </div>

        {/* GROUP 4: VIEW VISIBILITY */}
        <div className="p-3.5 space-y-3">
          <button 
            onClick={() => toggleSection('views')}
            className="w-full flex items-center justify-between text-left mb-1.5 focus:outline-none"
          >
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
              View Visibility
            </span>
            {openSections.views ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {openSections.views && (
            <div className="space-y-1.5 animate-in fade-in duration-100">
              <span className="text-[9px] font-bold text-slate-400 block mb-2 leading-tight">
                Select which blueprint flow sheets display this block card:
              </span>
              {viewDefinitions.map(view => {
                const isChecked = (d.views || []).includes(view.id);
                return (
                  <label 
                    key={view.id} 
                    className="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-2 py-1.5 rounded text-xs text-slate-705 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleView(view.id)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-[10px] uppercase tracking-wider">{view.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* GROUP 5: CONNECTIONS TRACE */}
        <div className="p-3.5 space-y-3">
          <button 
            onClick={() => toggleSection('trace')}
            className="w-full flex items-center justify-between text-left mb-1.5 focus:outline-none"
          >
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
              Connections Trace ({inbound.length + outbound.length})
            </span>
            {openSections.trace ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {openSections.trace && (
            <div className="space-y-3 animate-in fade-in duration-100">
              <div className="space-y-2">
                <div className="text-[9px] text-slate-450 font-extrabold uppercase tracking-widest flex items-center space-x-1">
                  <Link2 className="w-3 h-3 rotate-45" />
                  <span>Inbound Inputs ({inbound.length})</span>
                </div>
                {inbound.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pl-0.5">
                    {inbound.map(e => {
                      const srcNode = nodes.find(n => n.id === e.source);
                      return (
                        <button 
                          key={e.id} 
                          onClick={() => setSelectedNodeId(e.source)}
                          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded transition-all cursor-pointer font-bold shadow-sm inline-flex items-center space-x-1"
                          title={e.label ? `via ${e.label}` : 'Direct Link'}
                        >
                          <span className="h-1 w-1 rounded-full bg-indigo-500 mr-0.5" />
                          <span>{srcNode?.data?.name || e.source}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-400 italic block pl-4">No inputs mapped</span>
                )}

                <div className="text-[9px] text-slate-450 font-extrabold uppercase tracking-widest flex items-center space-x-1 pt-1.5 border-t border-slate-200/50">
                  <Link2 className="w-3 h-3 -rotate-45" />
                  <span>Outbound Outputs ({outbound.length})</span>
                </div>
                {outbound.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pl-0.5">
                    {outbound.map(e => {
                      const tgtNode = nodes.find(n => n.id === e.target);
                      return (
                        <button 
                          key={e.id} 
                          onClick={() => setSelectedNodeId(e.target)}
                          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded transition-all cursor-pointer font-bold shadow-sm inline-flex items-center space-x-1"
                          title={e.label ? `via ${e.label}` : 'Direct Link'}
                        >
                          <span className="h-1 w-1 rounded-full bg-emerald-500 mr-0.5" />
                          <span>{tgtNode?.data?.name || e.target}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[9px] text-slate-400 italic block pl-4">No outputs mapped</span>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </aside>
  );
};
