import React, { useEffect, useState } from 'react';
import { FolderOpen, LayoutTemplate, RotateCcw } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { Button } from '../ui/Button';
import { BrandMark } from './BrandMark';
import { ProjectManager } from './ProjectManager';
import { TemplatePicker } from './TemplatePicker';

export const TopBar: React.FC = () => {
  const {
    projectName,
    templateName,
    setProjectName,
    saveActiveProject,
    resetProject,
  } = useProjectStore();

  const [localName, setLocalName] = useState(projectName);
  const [isProjOpen, setIsProjOpen] = useState(false);
  const [isTplOpen, setIsTplOpen] = useState(false);

  useEffect(() => {
    setLocalName(projectName);
  }, [projectName]);

  const handleNameBlur = () => {
    if (localName.trim()) {
      setProjectName(localName.trim());
      saveActiveProject();
    } else {
      setLocalName(projectName);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        `Reset current project "${projectName}" to its default template configuration? All modifications will be lost.`,
      )
    ) {
      resetProject();
    }
  };

  return (
    <header className="z-30 flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex min-w-[190px] items-center gap-2.5">
        <BrandMark className="h-7 w-7" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[11px] font-extrabold leading-none tracking-[-0.015em] text-slate-950">
            Hardware Studio
          </span>
          <span className="mt-1 text-[7px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Connected engineering workspace
          </span>
        </div>
      </div>

      <div className="mx-4 flex max-w-[360px] flex-1 items-center gap-2.5">
        <input
          type="text"
          value={localName}
          onChange={(event) => setLocalName(event.target.value)}
          onBlur={handleNameBlur}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-[10px] font-semibold text-slate-800 outline-none transition hover:border-slate-300 hover:bg-slate-100 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300"
          placeholder="Unnamed Project"
        />
        <div className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.12em] text-emerald-700 sm:flex">
          <span className="relative flex h-1 w-1">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1 w-1 rounded-full bg-emerald-500" />
          </span>
          Local
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="hidden max-w-[120px] items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.1em] text-slate-600 lg:flex">
          <span className="text-slate-400">TPL</span>
          <span className="truncate">{templateName || 'Custom'}</span>
        </div>

        <Button
          onClick={() => setIsProjOpen(true)}
          variant="secondary"
          size="sm"
          icon={<FolderOpen className="h-3.5 w-3.5 text-slate-500" />}
        >
          Workspaces
        </Button>

        <Button
          onClick={() => setIsTplOpen(true)}
          variant="secondary"
          size="sm"
          className="hidden md:inline-flex"
          icon={<LayoutTemplate className="h-3.5 w-3.5 text-slate-500" />}
        >
          Templates
        </Button>

        <Button
          onClick={handleReset}
          variant="ghost"
          size="sm"
          className="border border-rose-100 text-rose-700 hover:bg-rose-50"
          icon={<RotateCcw className="h-3.5 w-3.5 text-rose-500" />}
        >
          Reset
        </Button>
      </div>

      <ProjectManager isOpen={isProjOpen} onClose={() => setIsProjOpen(false)} />
      <TemplatePicker isOpen={isTplOpen} onClose={() => setIsTplOpen(false)} />
    </header>
  );
};
