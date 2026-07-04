import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { TestStage } from '../types';
import { Button } from '../ui/Button';
import { StatCard } from '../ui/StatCard';
import { Badge } from '../ui/Badge';
import { 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  AlertOctagon, 
  HelpCircle, 
  Hourglass, 
  RefreshCw, 
  Link2,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

export const TestingBoard: React.FC = () => {
  const { 
    testing, 
    nodes,
    addTestStage, 
    updateTestStage, 
    deleteTestStage,
    duplicateTestStage,
    generateTestsFromMVP
  } = useProjectStore();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [selectedStageId, setSelectedStageId] = useState<string | null>(
    testing.length > 0 ? testing[0].id : null
  );

  const activeStage = testing.find(t => t.id === selectedStageId) || (testing.length > 0 ? testing[0] : null);

  const handleAddField = (id: string, key: keyof TestStage, value: string | string[]) => {
    updateTestStage(id, { [key]: value });
  };

  const handleAddStage = () => {
    const nextIdx = testing.length;
    const newId = `stage_${Date.now()}`;
    
    addTestStage({
      id: newId,
      name: `Stage ${nextIdx}: New Test Protocol`,
      goal: "",
      partsNeeded: "",
      steps: "",
      passCriteria: "",
      risks: "",
      status: "Not Started",
      notes: "",
      category: "General",
      linkedBlocks: [],
      resultNotes: "",
      evidenceLink: ""
    });
    
    setSelectedStageId(newId);
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateTestStage(id);
    const updated = useProjectStore.getState().testing;
    const last = updated[updated.length - 1];
    if (last) {
      setSelectedStageId(last.id);
    }
  };

  const handleDeleteStage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this test stage?")) {
      deleteTestStage(id);
      if (selectedStageId === id) {
        const remaining = testing.filter(t => t.id !== id);
        setSelectedStageId(remaining.length > 0 ? remaining[0].id : null);
      }
    }
  };

  const handleLinkBlockToggle = (blockId: string) => {
    if (!activeStage) return;
    const current = activeStage.linkedBlocks || [];
    let updated: string[];
    if (current.includes(blockId)) {
      updated = current.filter(id => id !== blockId);
    } else {
      updated = [...current, blockId];
    }
    handleAddField(activeStage.id, 'linkedBlocks', updated);
  };

  const getStatusBadge = (status: TestStage['status']) => {
    switch (status) {
      case 'Passed':
        return <Badge variant="success">Passed</Badge>;
      case 'Failed':
        return <Badge variant="error">Failed</Badge>;
      case 'In Progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'Blocked':
        return <Badge variant="warning">Blocked</Badge>;
      default:
        return <Badge variant="neutral">Not Started</Badge>;
    }
  };

  const getStatusBorder = (status: TestStage['status']) => {
    switch (status) {
      case 'Passed': return 'border-l-[3.5px] border-l-emerald-500';
      case 'Failed': return 'border-l-[3.5px] border-l-rose-500';
      case 'In Progress': return 'border-l-[3.5px] border-l-blue-500';
      case 'Blocked': return 'border-l-[3.5px] border-l-amber-500';
      default: return 'border-l-[3.5px] border-l-slate-300';
    }
  };

  // Metrics
  const totalCount = testing.length;
  const passedCount = testing.filter(t => t.status === 'Passed').length;
  const progressCount = testing.filter(t => t.status === 'In Progress').length;
  const blockedCount = testing.filter(t => t.status === 'Blocked').length;
  const failedCount = testing.filter(t => t.status === 'Failed').length;

  const categories = ["ALL", "Electrical", "Mechanical", "Firmware", "Interaction", "General"];

  const filteredTesting = testing.filter(t => {
    if (filterCategory === 'ALL') return true;
    return t.category === filterCategory;
  });

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto font-mono text-xs">
      
      {/* Header controls banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Testing & Verification Board
          </h2>
          <p className="text-[11px] text-slate-500 leading-normal max-w-xl">
            Design stage-by-stage testing instructions, link blocks to verification scopes, and log results to prove prototype readiness.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <Button 
            onClick={generateTestsFromMVP} 
            variant="outline" 
            size="xs"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Generate MVP Tests
          </Button>
          <Button 
            onClick={handleAddStage} 
            variant="primary" 
            size="xs"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Test Stage
          </Button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total QA Tests" value={totalCount} status="info" icon={<FileCheck2 className="w-4 h-4 text-cyan-500" />} />
        <StatCard title="Passed" value={passedCount} status="success" icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />} />
        <StatCard title="In Progress" value={progressCount} status="info" icon={<Hourglass className="w-4 h-4 text-blue-500" />} />
        <StatCard title="Blocked" value={blockedCount} status="warning" icon={<AlertOctagon className="w-4 h-4 text-amber-500" />} />
        <StatCard title="Failed" value={failedCount} status={failedCount > 0 ? 'error' : 'success'} icon={<AlertOctagon className="w-4 h-4 text-rose-500" />} />
      </div>

      {/* Filters Categories */}
      <div className="flex border-b border-slate-200 shrink-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 text-xs font-mono font-bold border-b-2 uppercase transition-all duration-150 ${
              filterCategory === cat
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/20'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {cat === 'ALL' ? 'All categories' : cat}
          </button>
        ))}
      </div>

      {/* Two Column Board */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0 shrink-0">
        
        {/* Left Side: Stages Directory */}
        <div className="w-80 bg-white border border-slate-200 rounded-lg shadow-sm overflow-y-auto flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-150 bg-slate-50/50 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-650 uppercase tracking-wider">
              Test Stages Directories ({filteredTesting.length})
            </span>
          </div>

          {filteredTesting.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <HelpCircle className="w-8 h-8 text-slate-350 mb-2" />
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">No tests listed</p>
              <p className="text-[9px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                Click &apos;Add Test Stage&apos; or sync MVP blocks to generate initial tests.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {filteredTesting.map((stage) => {
                const isActive = activeStage?.id === stage.id;
                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStageId(stage.id)}
                    className={`p-3 text-left transition-all duration-150 cursor-pointer flex items-start justify-between select-none relative ${
                      isActive 
                        ? 'bg-slate-50/80 font-bold shadow-sm' 
                        : 'hover:bg-slate-50/50'
                    } ${getStatusBorder(stage.status)}`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-xs font-bold truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                        {stage.name || "Unnamed Stage"}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate mt-1">
                        {stage.goal || "No goal specified"}
                      </p>
                      <div className="mt-2 flex items-center space-x-1.5">
                        {getStatusBadge(stage.status)}
                        <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold uppercase">
                          {stage.category || 'General'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={(e) => handleDuplicate(stage.id, e)}
                        className="text-slate-400 hover:text-slate-650 p-1 hover:bg-slate-100 rounded"
                        title="Duplicate Stage"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteStage(stage.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded"
                        title="Delete Stage"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Execution Detail Form */}
        <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-y-auto flex flex-col p-6">
          {activeStage ? (
            <div className="space-y-6">
              
              {/* Form Title & Status header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-150">
                <input
                  type="text"
                  value={activeStage.name}
                  onChange={(e) => handleAddField(activeStage.id, 'name', e.target.value)}
                  className="text-sm font-extrabold text-slate-850 bg-transparent border-b border-transparent hover:border-slate-250 focus:border-slate-800 focus:outline-none px-1.5 py-0.5 w-2/3 transition-all"
                  placeholder="Stage Name"
                />

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5">
                    <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest leading-none">Category:</label>
                    <select
                      value={activeStage.category || 'General'}
                      onChange={(e) => handleAddField(activeStage.id, 'category', e.target.value)}
                      className="bg-white border border-slate-250 rounded px-2 py-0.5 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      {["General", "Electrical", "Mechanical", "Firmware", "Interaction"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-[9px] font-bold text-slate-450 uppercase tracking-widest leading-none">Status:</label>
                    <select
                      value={activeStage.status}
                      onChange={(e) => handleAddField(activeStage.id, 'status', e.target.value)}
                      className="bg-white border border-slate-250 rounded px-2.5 py-0.5 text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Passed">Passed</option>
                      <option value="Failed">Failed</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Box 1: Goal & Tools */}
              <div className="bg-slate-50/50 border border-slate-150 rounded-lg p-4 space-y-4">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5">Scope definitions</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Scope / Goal</label>
                    <textarea
                      rows={3}
                      value={activeStage.goal}
                      onChange={(e) => handleAddField(activeStage.id, 'goal', e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded p-2 text-xs font-medium text-slate-700 font-sans resize-none"
                      placeholder="e.g. Validate battery charger thermal cut-off threshold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Equipment / Parts Needed</label>
                    <textarea
                      rows={3}
                      value={activeStage.partsNeeded}
                      onChange={(e) => handleAddField(activeStage.id, 'partsNeeded', e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded p-2 text-xs font-medium text-slate-700 font-sans resize-none"
                      placeholder="e.g. Rigol Oscilloscope, 10-ohm power load, thermometer"
                    />
                  </div>
                </div>
              </div>

              {/* Box 2: Test Script */}
              <div className="bg-white border border-slate-150 rounded-lg p-4 space-y-3 shadow-sm">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5">Testing execution instructions</span>
                <div>
                  <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Execution Steps</label>
                  <textarea
                    rows={4}
                    value={activeStage.steps}
                    onChange={(e) => handleAddField(activeStage.id, 'steps', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs font-medium text-slate-700 font-sans resize-none"
                    placeholder="1. Power up target PCB...&#10;2. Apply thermal probe to charger IC...&#10;3. Trigger active charge curve."
                  />
                </div>
              </div>

              {/* Box 3: Verification Standards */}
              <div className="bg-slate-50/50 border border-slate-150 rounded-lg p-4 space-y-4">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5">Pass parameters</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Pass criteria</label>
                    <textarea
                      rows={3}
                      value={activeStage.passCriteria}
                      onChange={(e) => handleAddField(activeStage.id, 'passCriteria', e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded p-2 text-xs font-medium text-slate-700 font-sans resize-none"
                      placeholder="Charging cuts off cleanly when temperature exceeds 45 degrees C."
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-extrabold text-slate-550 uppercase tracking-wider block mb-1">Test Risks & Safety hazards</label>
                    <textarea
                      rows={3}
                      value={activeStage.risks}
                      onChange={(e) => handleAddField(activeStage.id, 'risks', e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded p-2 text-xs font-medium text-slate-700 font-sans resize-none"
                      placeholder="Battery overheating spike. Keep fireproof pouch on hand."
                    />
                  </div>
                </div>
              </div>

              {/* Box 4: Links to canvas blocks */}
              <div className="bg-white border border-slate-150 rounded-lg p-4 space-y-3.5 shadow-sm">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 flex items-center">
                  <Link2 className="w-3 h-3 text-slate-450 mr-1 rotate-45" />
                  <span>Linked Architecture Component Blocks</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {nodes.filter(n => n.type === 'blockNode').map(n => {
                    const isLinked = (activeStage.linkedBlocks || []).includes(n.id);
                    return (
                      <label 
                        key={n.id} 
                        className={`flex items-center space-x-2 border rounded p-2 cursor-pointer transition-all duration-150 select-none ${
                          isLinked 
                            ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={() => handleLinkBlockToggle(n.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-[9px] font-bold truncate uppercase">{n.data.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Box 5: Evidence & Result Logs */}
              <div className="bg-white border border-slate-150 rounded-lg p-4 space-y-4 shadow-sm">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5">Developer results log & evidence links</span>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Result Notes / Findings</label>
                    <textarea
                      rows={3}
                      value={activeStage.resultNotes || ''}
                      onChange={(e) => handleAddField(activeStage.id, 'resultNotes', e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-900 rounded p-2 text-xs font-medium text-slate-700 font-sans resize-none"
                      placeholder="e.g. Cutoff triggered successfully at 45.4C. Charging resumes below 38C."
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Evidence URL / Git branch</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={activeStage.evidenceLink || ''}
                        onChange={(e) => handleAddField(activeStage.id, 'evidenceLink', e.target.value)}
                        className="w-full bg-white border border-slate-250 rounded pl-8 pr-8 py-1.5 text-xs text-blue-700 truncate focus:outline-none"
                        placeholder="e.g. https://github.com/Ankit6149/hardware-studio/pull/12"
                      />
                      <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      {activeStage.evidenceLink && activeStage.evidenceLink.startsWith('http') && (
                        <a 
                          href={activeStage.evidenceLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-650"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
              <CheckCircle2 className="w-12 h-12 text-slate-200 mb-3 animate-pulse" />
              <p className="font-bold text-slate-500 uppercase tracking-wider text-xs">No Stage Selected</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[260px] text-center leading-relaxed">
                Click a test stage on the directory sidebar or click &apos;Add Test Stage&apos; to document verification.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
