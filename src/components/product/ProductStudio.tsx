'use client';

import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { ProductRequirement, ProductArchitectureNode } from '../../types';
import { Plus, ShieldAlert, Cpu, CheckSquare, Award, Trash2 } from 'lucide-react';

export const ProductStudio: React.FC = () => {
  const store = useProjectStore();
  const {
    requirements = [],
    architectureNodes = [],
    addRequirement,
    updateRequirement,
    deleteRequirement,
    addArchitectureNode,
    updateArchitectureNode,
    deleteArchitectureNode
  } = store;

  // Selected item states
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Requirement Form state
  const [reqTitle, setReqTitle] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqType, setReqType] = useState<ProductRequirement['type']>('Functional');
  const [reqPriority, setReqPriority] = useState<ProductRequirement['priority']>('Medium');
  const [reqStatus, setReqStatus] = useState<ProductRequirement['status']>('Draft');

  // Node Form state
  const [nodeName, setNodeName] = useState('');
  const [nodeCategory, setNodeCategory] = useState<ProductArchitectureNode['category']>('Processing');
  const [nodeDesc, setNodeDesc] = useState('');
  const [nodeStatus, setNodeStatus] = useState<ProductArchitectureNode['status']>('MVP');

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;
    store.executeProjectCommand(
      'ADD_REQUIREMENT',
      `Add requirement: ${reqTitle}`,
      () => addRequirement({
        title: reqTitle,
        description: reqDesc,
        type: reqType,
        priority: reqPriority,
        status: reqStatus,
        acceptanceCriteria: [],
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [],
        linkedFirmwareModuleIds: [],
        linkedTestIds: [],
        risks: []
      })
    );
    setReqTitle('');
    setReqDesc('');
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName.trim()) return;
    store.executeProjectCommand(
      'ADD_ARCHITECTURE_NODE',
      `Add architecture block: ${nodeName}`,
      () => addArchitectureNode({
        name: nodeName,
        category: nodeCategory,
        description: nodeDesc,
        status: nodeStatus,
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * 200,
        width: 120,
        height: 60,
        linkedRequirementIds: [],
        linkedCircuitIds: [],
        linkedComponentIds: [],
        linkedFirmwareModuleIds: [],
        linkedTestIds: []
      })
    );
    setNodeName('');
    setNodeDesc('');
  };

  const handleDeleteReq = (id: string) => {
    const req = requirements.find(r => r.id === id);
    if (!req) return;
    store.executeProjectCommand(
      'DELETE_REQUIREMENT',
      `Delete requirement: ${req.title}`,
      () => deleteRequirement(id)
    );
    if (selectedReqId === id) setSelectedReqId(null);
  };

  const handleDeleteNode = (id: string) => {
    const node = architectureNodes.find(n => n.id === id);
    if (!node) return;
    store.executeProjectCommand(
      'DELETE_ARCHITECTURE_NODE',
      `Delete architecture block: ${node.name}`,
      () => deleteArchitectureNode(id)
    );
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  return (
    <div className="flex-1 bg-slate-900 text-slate-100 flex flex-col min-h-0 overflow-hidden font-mono text-[11px] p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-sm font-extrabold text-indigo-400 uppercase tracking-widest">Product Studio</h1>
          <p className="text-[10px] text-slate-400 mt-1">Define requirements, map subsystems, and control risk paths.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => store.undoProjectCommand()}
            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 border border-slate-650 transition-all cursor-pointer"
            title="Undo last change"
          >
            ⟲ Undo
          </button>
          <button
            onClick={() => store.redoProjectCommand()}
            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 border border-slate-650 transition-all cursor-pointer"
            title="Redo last change"
          >
            ⟳ Redo
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Requirements Manager */}
        <div className="flex-1 bg-slate-800/50 border border-slate-700/80 rounded-xl flex flex-col min-h-0 overflow-hidden p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h2 className="font-extrabold uppercase text-slate-350 tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-450" />
              Requirements Specification
            </h2>
            <span className="text-[9px] bg-slate-750 text-slate-450 px-2 py-0.5 rounded font-mono font-bold">
              {requirements.length} Items
            </span>
          </div>

          <form onSubmit={handleAddRequirement} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Requirement Title..."
                value={reqTitle}
                onChange={e => setReqTitle(e.target.value)}
                className="col-span-2 bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={reqType}
                onChange={e => setReqType(e.target.value as any)}
                className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="Functional">Functional</option>
                <option value="Electrical">Electrical</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Firmware">Firmware</option>
                <option value="Safety">Safety</option>
              </select>
              <select
                value={reqPriority}
                onChange={e => setReqPriority(e.target.value as any)}
                className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <textarea
              placeholder="Requirement Description..."
              value={reqDesc}
              onChange={e => setReqDesc(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500 h-10 resize-none"
            />
            <button
              type="submit"
              className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 font-bold rounded text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Requirement
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
            {requirements.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No requirements mapped. Add one above.</div>
            ) : (
              requirements.map(req => (
                <div
                  key={req.id}
                  onClick={() => setSelectedReqId(req.id)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedReqId === req.id
                      ? 'bg-slate-700/60 border-indigo-500'
                      : 'bg-slate-800/40 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-extrabold text-slate-200">{req.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteReq(req.id); }}
                      className="text-slate-500 hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{req.description}</p>
                  <div className="flex gap-1.5 mt-2">
                    <span className="text-[8px] bg-slate-900 text-indigo-400 px-1 py-0.2 rounded font-extrabold uppercase tracking-wide">{req.type}</span>
                    <span className={`text-[8px] px-1 py-0.2 rounded font-extrabold uppercase tracking-wide ${
                      req.priority === 'Critical' ? 'bg-red-950 text-red-400' : 'bg-slate-900 text-slate-450'
                    }`}>{req.priority}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center/Right: Architecture Subsystems */}
        <div className="flex-1 bg-slate-800/50 border border-slate-700/80 rounded-xl flex flex-col min-h-0 overflow-hidden p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h2 className="font-extrabold uppercase text-slate-350 tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-455" />
              Architecture Blocks
            </h2>
            <span className="text-[9px] bg-slate-750 text-slate-450 px-2 py-0.5 rounded font-mono font-bold">
              {architectureNodes.length} Blocks
            </span>
          </div>

          <form onSubmit={handleAddNode} className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Block Subsystem Name..."
                value={nodeName}
                onChange={e => setNodeName(e.target.value)}
                className="col-span-2 bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
              <select
                value={nodeCategory}
                onChange={e => setNodeCategory(e.target.value as any)}
                className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="Input">Input</option>
                <option value="Processing">Processing</option>
                <option value="Power">Power</option>
                <option value="Communication">Communication</option>
                <option value="Feedback">Feedback</option>
              </select>
              <select
                value={nodeStatus}
                onChange={e => setNodeStatus(e.target.value as any)}
                className="bg-slate-900 text-slate-100 rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="MVP">MVP</option>
                <option value="Later">Later</option>
                <option value="Future">Future</option>
              </select>
            </div>
            <textarea
              placeholder="Block Subsystem Description..."
              value={nodeDesc}
              onChange={e => setNodeDesc(e.target.value)}
              className="w-full bg-slate-900 text-slate-100 placeholder-slate-500 rounded px-2 py-1 border border-slate-700 focus:outline-none focus:border-indigo-500 h-10 resize-none"
            />
            <button
              type="submit"
              className="w-full py-1 bg-indigo-600 hover:bg-indigo-500 font-bold rounded text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Block Node
            </button>
          </form>

          <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
            {architectureNodes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No architecture blocks defined. Add one above.</div>
            ) : (
              architectureNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedNodeId === node.id
                      ? 'bg-slate-700/60 border-indigo-500'
                      : 'bg-slate-800/40 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-extrabold text-slate-200">{node.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id); }}
                      className="text-slate-500 hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{node.description}</p>
                  <div className="flex gap-1.5 mt-2">
                    <span className="text-[8px] bg-slate-900 text-indigo-400 px-1 py-0.2 rounded font-extrabold uppercase tracking-wide">{node.category}</span>
                    <span className={`text-[8px] px-1 py-0.2 rounded font-extrabold uppercase tracking-wide ${
                      node.status === 'MVP' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-900 text-slate-450'
                    }`}>{node.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
