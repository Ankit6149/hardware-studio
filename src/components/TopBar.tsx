import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { 
  FolderOpen, 
  LayoutTemplate, 
  RotateCcw, 
  Download,
  FileJson,
  FileText
} from 'lucide-react';
import { ProjectManager } from './ProjectManager';
import { TemplatePicker } from './TemplatePicker';
import { Button } from '../ui/Button';

export const TopBar: React.FC = () => {
  const {
    projectName,
    templateName,
    setProjectName,
    saveActiveProject,
    resetProject
  } = useProjectStore();

  const [localName, setLocalName] = useState(projectName);
  const [prevProjectName, setPrevProjectName] = useState(projectName);
  const [isProjOpen, setIsProjOpen] = useState(false);
  const [isTplOpen, setIsTplOpen] = useState(false);

  if (projectName !== prevProjectName) {
    setLocalName(projectName);
    setPrevProjectName(projectName);
  }

  const handleNameBlur = () => {
    if (localName.trim()) {
      setProjectName(localName.trim());
      saveActiveProject();
    } else {
      setLocalName(projectName);
    }
  };

  const handleReset = () => {
    if (window.confirm(`Reset current project "${projectName}" to its default template configuration? All modifications will be lost.`)) {
      resetProject();
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-5 shrink-0 shadow-sm z-30 font-mono">
      {/* Brand area */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center justify-center bg-slate-900 text-white w-8 h-8 rounded-lg font-bold text-sm shadow-sm select-none">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-slate-950 text-xs font-extrabold tracking-tight leading-none uppercase">Hardware Studio</span>
            <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">by System Alpha</span>
          </div>
        </div>
      </div>

      {/* Center project renaming box */}
      <div className="flex items-center space-x-3 flex-1 max-w-sm mx-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
            className="w-full bg-slate-50 border border-slate-250 hover:bg-slate-100 hover:border-slate-300 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 transition-all font-mono"
            placeholder="Unnamed Project"
          />
        </div>
        <div className="flex items-center space-x-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full text-[8px] text-emerald-700 font-extrabold tracking-wide uppercase shrink-0 select-none">
          <span className="relative flex h-1 w-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
          </span>
          <span>Offline Active</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-[9px] text-slate-600 font-bold uppercase tracking-wider select-none max-w-[150px] truncate">
          <span className="text-slate-400">TPL:</span>
          <span>{templateName || 'Custom'}</span>
        </div>

        <Button
          onClick={() => setIsProjOpen(true)}
          variant="secondary"
          size="sm"
          icon={<FolderOpen className="w-3.5 h-3.5 text-slate-500" />}
        >
          Workspaces
        </Button>

        <Button
          onClick={() => setIsTplOpen(true)}
          variant="secondary"
          size="sm"
          icon={<LayoutTemplate className="w-3.5 h-3.5 text-slate-500" />}
        >
          Templates
        </Button>

        <Button
          onClick={handleReset}
          variant="ghost"
          size="sm"
          className="border border-rose-100 text-rose-700 hover:bg-rose-50"
          icon={<RotateCcw className="w-3.5 h-3.5 text-rose-500" />}
        >
          Reset
        </Button>
      </div>

      {/* Modals overlays */}
      <ProjectManager isOpen={isProjOpen} onClose={() => setIsProjOpen(false)} />
      <TemplatePicker isOpen={isTplOpen} onClose={() => setIsTplOpen(false)} />
    </header>
  );
};
