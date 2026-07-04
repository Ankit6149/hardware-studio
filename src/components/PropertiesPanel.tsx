import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { Trash2, Link2, Info } from 'lucide-react';

export const PropertiesPanel: React.FC = () => {
  const { 
    selectedNodeId, 
    nodes, 
    edges, 
    updateNode, 
    deleteNode,
    setSelectedNodeId
  } = useProjectStore();

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <aside className="w-80 border-l border-gray-200 bg-white flex flex-col items-center justify-center p-6 text-center text-gray-400 shrink-0 shadow-sm z-20">
        <Info className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">No Block Selected</p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Click a card on the canvas or add a block to configure its parameters.</p>
      </aside>
    );
  }

  const d = selectedNode.data;
  const isBoundary = selectedNode.type === 'boundaryNode';

  // Get connections summaries
  const inbound = edges.filter(e => e.target === selectedNodeId);
  const outbound = edges.filter(e => e.source === selectedNodeId);

  const handleFieldChange = (key: string, value: string) => {
    updateNode(selectedNode.id, { [key]: value });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the block "${d.name}"?`)) {
      deleteNode(selectedNode.id);
    }
  };

  return (
    <aside className="w-80 border-l border-gray-200 bg-white flex flex-col h-full shrink-0 shadow-sm z-20 overflow-hidden">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-slate-50">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Block Parameters</span>
        <button
          onClick={handleDelete}
          className="flex items-center space-x-1 text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 rounded px-2 py-1 transition-all cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Section 1: General Info */}
        <div className="space-y-3.5 bg-slate-50/50 border border-slate-100 p-3 rounded-lg shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">General Parameters</span>
          
          <div>
            <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Block Name</label>
            <input
              type="text"
              value={d.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
              <select
                value={d.category}
                onChange={(e) => handleFieldChange('category', e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded px-2 py-1.5 text-xs font-semibold text-slate-800"
              >
                <option value="Product">Product</option>
                <option value="Interaction">Interaction</option>
                <option value="Electronics">Electronics</option>
                <option value="Firmware">Firmware</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Power">Power</option>
                <option value="Software">Software</option>
                <option value="Testing">Testing</option>
                <option value="Boundaries">Boundaries</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
              <select
                value={d.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded px-2 py-1.5 text-xs font-semibold text-slate-800"
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
        </div>

        {/* Section 2: Purpose & Target */}
        <div className="space-y-3 bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">Functional Description</span>
          
          <div>
            <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
            <textarea
              rows={2}
              value={d.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-950 focus:ring-1 focus:ring-slate-950 rounded p-2 text-xs font-medium text-slate-700 transition-all resize-none"
              placeholder="What does this block do?"
            />
          </div>

          <div>
            <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Purpose & Target</label>
            <textarea
              rows={2}
              value={d.purpose}
              onChange={(e) => handleFieldChange('purpose', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-950 focus:ring-1 focus:ring-slate-950 rounded p-2 text-xs font-medium text-slate-700 transition-all resize-none"
              placeholder="Why is it needed?"
            />
          </div>
        </div>

        {/* Section 3: Engineering specs (non-boundary) */}
        {!isBoundary && (
          <div className="space-y-3 bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">Specification Details</span>
            
            <div>
              <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Requirements</label>
              <textarea
                rows={2}
                value={d.requirements}
                onChange={(e) => handleFieldChange('requirements', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-950 focus:ring-1 focus:ring-slate-950 rounded p-2 text-xs font-medium text-slate-700 transition-all resize-none"
                placeholder="e.g. 3.3V, GPIO count, latency, size limits"
              />
            </div>

            <div>
              <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Candidate Components</label>
              <input
                type="text"
                value={d.candidateComponents}
                onChange={(e) => handleFieldChange('candidateComponents', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-950 focus:ring-1 focus:ring-slate-950 rounded px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-all"
                placeholder="e.g. ESP32, TP4056"
              />
            </div>

            <div>
              <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Testing Method Notes</label>
              <textarea
                rows={2}
                value={d.testingNotes}
                onChange={(e) => handleFieldChange('testingNotes', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-950 focus:ring-1 focus:ring-slate-950 rounded p-2 text-xs font-medium text-slate-700 transition-all resize-none"
                placeholder="How to test this block in isolation?"
              />
            </div>
          </div>
        )}

        {/* Section 4: Risks and General Notes */}
        <div className="space-y-3 bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">Risks & Notes</span>
          
          {!isBoundary && (
            <div>
              <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Risks & Issues</label>
              <textarea
                rows={2}
                value={d.risks}
                onChange={(e) => handleFieldChange('risks', e.target.value)}
                className="w-full bg-rose-50/50 border border-rose-100/80 hover:border-rose-200 focus:bg-white focus:border-slate-950 focus:ring-1 focus:ring-slate-950 rounded p-2 text-xs font-medium text-slate-750 transition-all resize-none"
                placeholder="Power consumption, RF shields, etc."
              />
            </div>
          )}

          <div>
            <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">General Notes</label>
            <textarea
              rows={2}
              value={d.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-950 focus:ring-1 focus:ring-slate-950 rounded p-2 text-xs font-medium text-slate-700 transition-all resize-none"
              placeholder="Additional implementation detail..."
            />
          </div>
        </div>

        {/* Section 5: Connected Relational Nodes */}
        <div className="space-y-3 bg-slate-50/50 border border-slate-100 p-3 rounded-lg shadow-sm">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-2">Trace Connections</span>
          
          <div className="space-y-2">
            <div className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wide flex items-center space-x-1.5">
              <Link2 className="w-3 h-3 text-slate-400 rotate-45" />
              <span>Inbound ({inbound.length})</span>
            </div>
            {inbound.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pl-0.5">
                {inbound.map(e => {
                  const srcNode = nodes.find(n => n.id === e.source);
                  return (
                    <button 
                      key={e.id} 
                      onClick={() => setSelectedNodeId(e.source)}
                      className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded transition-all cursor-pointer font-bold shadow-sm inline-flex items-center space-x-1"
                      title={e.label ? `via ${e.label}` : 'Direct Link'}
                    >
                      <span className="h-1 w-1 rounded-full bg-indigo-500 mr-0.5" />
                      <span>{srcNode?.data?.name || e.source}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 italic block pl-4">No inputs mapped</span>
            )}

            <div className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wide flex items-center space-x-1.5 pt-1.5 border-t border-slate-200/50">
              <Link2 className="w-3 h-3 text-slate-400 -rotate-45" />
              <span>Outbound ({outbound.length})</span>
            </div>
            {outbound.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pl-0.5">
                {outbound.map(e => {
                  const tgtNode = nodes.find(n => n.id === e.target);
                  return (
                    <button 
                      key={e.id} 
                      onClick={() => setSelectedNodeId(e.target)}
                      className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] px-2 py-0.5 rounded transition-all cursor-pointer font-bold shadow-sm inline-flex items-center space-x-1"
                      title={e.label ? `via ${e.label}` : 'Direct Link'}
                    >
                      <span className="h-1 w-1 rounded-full bg-emerald-500 mr-0.5" />
                      <span>{tgtNode?.data?.name || e.target}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 italic block pl-4">No outputs mapped</span>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
