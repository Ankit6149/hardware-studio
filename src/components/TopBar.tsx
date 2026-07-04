import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { exportProjectJson } from '../lib/exportJson';
import { exportProjectMarkdown } from '../lib/exportMarkdown';
import { Save, FileJson, FileText, RotateCcw, Monitor } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    projectName,
    setProjectName,
    resetProject,
    saveProjectToLocalStorage,
    nodes,
    edges,
    bom,
    testing
  } = useProjectStore();

  const [localName, setLocalName] = useState(projectName);
  const [prevProjectName, setPrevProjectName] = useState(projectName);

  if (projectName !== prevProjectName) {
    setLocalName(projectName);
    setPrevProjectName(projectName);
  }

  const handleNameBlur = () => {
    if (localName.trim()) {
      setProjectName(localName.trim());
    } else {
      setLocalName(projectName);
    }
  };

  const handleSave = () => {
    saveProjectToLocalStorage();
    alert("Project saved successfully to local browser storage!");
  };

  const handleExportJson = () => {
    exportProjectJson({ projectName, activeView: 'master', nodes, edges, bom, testing });
  };

  const handleExportMarkdown = () => {
    exportProjectMarkdown({ projectName, activeView: 'master', nodes, edges, bom, testing });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset and reload 'The Ring' template? Any unsaved custom modifications will be lost.")) {
      resetProject();
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-5 shrink-0 shadow-sm z-30">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center justify-center bg-slate-900 text-white w-8 h-8 rounded-lg font-mono font-bold text-sm shadow-sm select-none">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 text-xs font-extrabold tracking-tight leading-none uppercase">Hardware Studio</span>
            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">by System Alpha</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 flex-1 max-w-sm mx-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
            className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 transition-all"
            placeholder="Unnamed Project"
          />
        </div>
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100/80 rounded-full text-[9px] text-emerald-700 font-bold tracking-wide uppercase shrink-0 select-none">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>Saved</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
          <span className="text-slate-400 font-bold mr-1">Template:</span>
          <span className="text-slate-700">The Ring</span>
        </div>

        <button
          onClick={handleSave}
          title="Save Workspace"
          className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm cursor-pointer border border-slate-950"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>

        <button
          onClick={handleExportJson}
          title="Export as JSON"
          className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-95 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <FileJson className="w-3.5 h-3.5 text-slate-500" />
          <span>JSON</span>
        </button>

        <button
          onClick={handleExportMarkdown}
          title="Export as Markdown"
          className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-95 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          <span>Markdown</span>
        </button>

        <button
          onClick={handleReset}
          title="Reset to default template"
          className="flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 hover:border-red-200 border border-red-100 text-red-700 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
};
