import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { TestStage } from '../types';
import { Plus, Trash2, CheckCircle2, AlertOctagon, HelpCircle, Hourglass, HelpCircle as HelpIcon } from 'lucide-react';

export const TestingBoard: React.FC = () => {
  const { testing, addTestStage, updateTestStage, deleteTestStage } = useProjectStore();
  const [selectedStageId, setSelectedStageId] = useState<string | null>(
    testing.length > 0 ? testing[0].id : null
  );

  const activeStage = testing.find(t => t.id === selectedStageId) || (testing.length > 0 ? testing[0] : null);

  const handleAddField = (id: string, key: keyof TestStage, value: string) => {
    updateTestStage(id, { [key]: value });
  };

  const handleAddStage = () => {
    const nextIdx = testing.length;
    const newId = `stage_${Date.now()}`;
    addTestStage({
      name: `Stage ${nextIdx}: New Test Protocol`,
      goal: "",
      partsNeeded: "",
      steps: "",
      passCriteria: "",
      risks: "",
      status: "Not Started",
      notes: ""
    });
    // Set selected stage to the newly created one
    setSelectedStageId(newId);
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

  const getStatusBadge = (status: TestStage['status']) => {
    switch (status) {
      case 'Passed':
        return <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1"><CheckCircle2 className="w-3 h-3 text-green-600 mr-0.5" /><span>Passed</span></span>;
      case 'Failed':
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1"><AlertOctagon className="w-3 h-3 text-red-600 mr-0.5" /><span>Failed</span></span>;
      case 'In Progress':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1"><Hourglass className="w-3 h-3 text-blue-600 mr-0.5" /><span>In Progress</span></span>;
      case 'Blocked':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1"><AlertOctagon className="w-3 h-3 text-amber-600 mr-0.5" /><span>Blocked</span></span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1"><HelpCircle className="w-3 h-3 text-gray-500 mr-0.5" /><span>Not Started</span></span>;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Testing & Verification Board</h1>
          <p className="text-xs text-slate-500 mt-0.5">Define stage-by-stage testing criteria and keep track of pass status.</p>
        </div>
        <button
          onClick={handleAddStage}
          className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all cursor-pointer border border-slate-950"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Test Stage</span>
        </button>
      </div>

      {/* QA Stats Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5 select-none">
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Tests</span>
          <span className="text-lg font-extrabold text-slate-800 mt-1 block">{testing.length} stages</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block">Passed</span>
          <span className="text-lg font-extrabold text-emerald-700 mt-1 block">
            {testing.filter(t => t.status === 'Passed').length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block">In Progress</span>
          <span className="text-lg font-extrabold text-blue-700 mt-1 block">
            {testing.filter(t => t.status === 'In Progress').length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest block">Blocked</span>
          <span className="text-lg font-extrabold text-amber-700 mt-1 block">
            {testing.filter(t => t.status === 'Blocked').length}
          </span>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Not Started</span>
          <span className="text-lg font-extrabold text-slate-600 mt-1 block">
            {testing.filter(t => t.status === 'Not Started' || !t.status).length}
          </span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        {/* Left Column: Stages List */}
        <div className="w-80 bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-y-auto flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Test Stages ({testing.length})</span>
          </div>
          {testing.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <HelpIcon className="w-8 h-8 text-slate-350 mb-2" />
              <span className="text-xs font-bold text-slate-500">No stages configured</span>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Click &quot;Add Test Stage&quot; above to start defining hardware tests.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 flex-1">
              {testing.map((stage) => {
                const isActive = activeStage?.id === stage.id;
                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStageId(stage.id)}
                    className={`p-3.5 text-left transition-all duration-150 cursor-pointer flex items-start justify-between select-none relative ${
                      isActive 
                        ? 'bg-slate-50/80 font-bold border-l-[3.5px] border-slate-900 shadow-sm' 
                        : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-xs font-bold truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                        {stage.name || "Unnamed Stage"}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-1">
                        {stage.goal || "No goal specified"}
                      </p>
                      <div className="mt-2.5">
                        {getStatusBadge(stage.status)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteStage(stage.id, e)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                      title="Delete Stage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Form */}
        <div className="flex-1 bg-white border border-slate-200 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-y-auto flex flex-col p-6">
          {activeStage ? (
            <div className="space-y-5">
              {/* Form Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
                <input
                  type="text"
                  value={activeStage.name}
                  onChange={(e) => handleAddField(activeStage.id, 'name', e.target.value)}
                  className="text-base font-extrabold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-800 focus:outline-none px-1 py-0.5 w-2/3 transition-all"
                  placeholder="Stage Name"
                />
                
                <div className="flex items-center space-x-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status:</label>
                  <select
                    value={activeStage.status}
                    onChange={(e) => handleAddField(activeStage.id, 'status', e.target.value as TestStage['status'])}
                    className="bg-white border border-slate-200 hover:border-slate-350 focus:border-slate-900 rounded px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              {/* Group 1: Scope & Tools */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 space-y-4">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-1">Scope & Tools</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Goal of this test stage</label>
                    <textarea
                      rows={3}
                      value={activeStage.goal}
                      onChange={(e) => handleAddField(activeStage.id, 'goal', e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded p-2.5 text-xs font-medium text-slate-700 resize-none transition-all"
                      placeholder="e.g. Prove input and haptic feedback logic behavior"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Parts & Tools Needed</label>
                    <textarea
                      rows={3}
                      value={activeStage.partsNeeded}
                      onChange={(e) => handleAddField(activeStage.id, 'partsNeeded', e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded p-2.5 text-xs font-medium text-slate-700 resize-none transition-all"
                      placeholder="e.g. ESP32 devkit, breadboard, wire wraps, resistors"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Execution Protocol */}
              <div className="bg-white border border-slate-100 rounded-lg p-4 space-y-3 shadow-sm">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-1">Execution Protocol</span>
                
                <div>
                  <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Testing Steps</label>
                  <textarea
                    rows={4}
                    value={activeStage.steps}
                    onChange={(e) => handleAddField(activeStage.id, 'steps', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-950 focus:ring-1 focus:ring-slate-950 rounded p-2.5 text-xs font-medium text-slate-700 resize-none transition-all"
                    placeholder="1. Solder pin headers to board.&#10;2. Solder motor to NPN driver.&#10;3. Trigger pin check code."
                  />
                </div>
              </div>

              {/* Group 3: Validation & Risk */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 space-y-4">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-1">Validation & Risk</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Pass Criteria</label>
                    <textarea
                      rows={3}
                      value={activeStage.passCriteria}
                      onChange={(e) => handleAddField(activeStage.id, 'passCriteria', e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded p-2.5 text-xs font-medium text-slate-700 resize-none transition-all"
                      placeholder="Single click produces quick buzz, double click triggers double buzz"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Risks & Mitigation</label>
                    <textarea
                      rows={3}
                      value={activeStage.risks}
                      onChange={(e) => handleAddField(activeStage.id, 'risks', e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded p-2.5 text-xs font-medium text-slate-700 resize-none transition-all"
                      placeholder="Power spikes resetting MCU. flyback diode added."
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Log Notes */}
              <div className="bg-white border border-slate-100 rounded-lg p-4 space-y-3 shadow-sm">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-100 pb-1.5 mb-1">Developer Logs</span>
                
                <div>
                  <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Developer Notes</label>
                  <textarea
                    rows={3}
                    value={activeStage.notes}
                    onChange={(e) => handleAddField(activeStage.id, 'notes', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/30 hover:border-slate-350 focus:bg-white focus:border-slate-950 focus:ring-1 focus:ring-slate-950 rounded p-2.5 text-xs font-medium text-slate-700 resize-none transition-all"
                    placeholder="Enter details on setup debug outputs, firmware git branch references, or findings."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
              <CheckCircle2 className="w-12 h-12 text-slate-200 mb-3" />
              <p className="font-bold text-slate-500">No Stage Selected</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[260px] text-center leading-relaxed">Click a test stage on the left panel or click &quot;Add Test Stage&quot; to start documenting verification procedures.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
