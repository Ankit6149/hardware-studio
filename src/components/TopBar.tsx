import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  CloudOff,
  FolderOpen,
  HardDrive,
  LayoutTemplate,
  LoaderCircle,
  MoreHorizontal,
  RotateCcw,
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useStorageHealthStore } from '../store/storageHealthStore';
import { storageHealthLabel } from '../lib/reliability';
import { useFeedback } from './feedback/FeedbackProvider';
import { useKnowledge } from './knowledge/KnowledgeProvider';
import { BrandMark } from './BrandMark';
import { ProjectManager } from './ProjectManager';
import { TemplatePicker } from './TemplatePicker';

interface ProjectNameEditorProps {
  projectName: string;
  onCommit: (name: string) => void;
}

const ProjectNameEditor: React.FC<ProjectNameEditorProps> = ({ projectName, onCommit }) => {
  const [draftName, setDraftName] = useState(projectName);

  const commitDraft = () => {
    const nextName = draftName.trim();
    if (nextName) {
      onCommit(nextName);
      return;
    }
    setDraftName(projectName);
  };

  return (
    <input
      type="text"
      value={draftName}
      onChange={(event) => setDraftName(event.target.value)}
      onBlur={commitDraft}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur();
        if (event.key === 'Escape') {
          setDraftName(projectName);
          event.currentTarget.blur();
        }
      }}
      className="min-w-0 max-w-[360px] flex-1 border border-transparent bg-transparent px-1.5 py-1 text-[12px] font-semibold tracking-[-0.015em] text-slate-900 outline-none hover:bg-black/[0.035] focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-300/60"
      placeholder="Unnamed project"
      aria-label="Project name"
    />
  );
};

export const TopBar: React.FC = () => {
  const {
    projectName,
    templateName,
    setProjectName,
    saveActiveProject,
    resetProject,
  } = useProjectStore();
  const storageHealth = useStorageHealthStore((state) => state.health);
  const retrySave = () => useProjectStore.getState().saveActiveProject();
  const { confirm: requestConfirmation, notify } = useFeedback();
  const { openKnowledge } = useKnowledge();
  const [isProjOpen, setIsProjOpen] = useState(false);
  const [isTplOpen, setIsTplOpen] = useState(false);

  const handleNameCommit = (name: string) => {
    setProjectName(name);
    saveActiveProject();
  };

  const handleReset = async () => {
    const approved = await requestConfirmation({
      title: `Reset “${projectName}”?`,
      description: 'The current workspace will be replaced with its default template configuration. This action is not currently recoverable through project trash.',
      confirmLabel: 'Reset project',
      variant: 'destructive',
    });
    if (approved) {
      resetProject();
      notify({ tone: 'success', title: 'Project reset', detail: 'The workspace was restored to its template defaults.' });
    }
  };

  const showStorageDetail = () => {
    notify({
      tone: storageHealth.status === 'saved' ? 'success' : storageHealth.status === 'saving' ? 'info' : 'warning',
      title: storageHealthLabel(storageHealth),
      detail: [storageHealth.message, storageHealth.guidance].filter(Boolean).join(' '),
      durationMs: storageHealth.status === 'saved' ? 4000 : 0,
      actionLabel: ['failed', 'unavailable', 'memory-fallback'].includes(storageHealth.status) ? 'Retry save' : undefined,
      onAction: ['failed', 'unavailable', 'memory-fallback'].includes(storageHealth.status) ? retrySave : undefined,
    });
  };

  const statusDot = storageHealth.status === 'saved'
    ? 'bg-emerald-600'
    : storageHealth.status === 'saving'
      ? 'bg-slate-500'
      : ['failed', 'unavailable'].includes(storageHealth.status)
        ? 'bg-rose-600'
        : storageHealth.status === 'memory-fallback'
          ? 'bg-amber-600'
          : 'bg-slate-400';

  const StatusIcon = storageHealth.status === 'saving'
    ? LoaderCircle
    : storageHealth.status === 'unavailable' || storageHealth.status === 'memory-fallback'
      ? CloudOff
      : storageHealth.status === 'failed'
        ? AlertCircle
        : HardDrive;

  return (
    <header className="z-40 flex h-11 shrink-0 items-center border-b border-[#cfc9bd] bg-[#f8f5ee] px-2.5 text-slate-900">
      <div className="flex shrink-0 items-center gap-2 border-r border-[#d8d2c6] pr-3">
        <BrandMark className="h-6 w-6" />
        <span className="hidden text-[11px] font-bold tracking-[-0.02em] text-slate-950 lg:inline">Hardware Studio</span>
      </div>

      <div className="ml-2.5 flex min-w-0 flex-1 items-center gap-1.5">
        <span className="hidden shrink-0 text-[9px] font-medium uppercase tracking-[0.1em] text-slate-400 sm:inline">Project</span>
        <span className="hidden text-slate-300 sm:inline">/</span>
        <ProjectNameEditor key={projectName} projectName={projectName} onCommit={handleNameCommit} />
      </div>

      <button
        type="button"
        onClick={showStorageDetail}
        className="mr-1.5 hidden h-8 shrink-0 items-center gap-1.5 px-2 text-[10px] font-medium text-slate-500 hover:bg-black/[0.035] hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/60 sm:inline-flex"
        title={storageHealth.message}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} aria-hidden="true" />
        <StatusIcon className={`h-3 w-3 ${storageHealth.status === 'saving' ? 'animate-spin' : ''}`} aria-hidden="true" />
        <span>{storageHealthLabel(storageHealth)}</span>
      </button>

      <div className="flex shrink-0 items-center gap-0.5 border-l border-[#d8d2c6] pl-1.5">
        <button
          type="button"
          onClick={() => openKnowledge()}
          className="inline-flex h-8 items-center gap-1.5 px-2 text-[10px] font-semibold text-slate-600 hover:bg-black/[0.04] hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400/60"
          title="Learn how this workspace works"
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden md:inline">Learn</span>
        </button>

        <button
          type="button"
          onClick={() => setIsProjOpen(true)}
          className="inline-flex h-8 items-center gap-1.5 px-2 text-[10px] font-semibold text-slate-600 hover:bg-black/[0.04] hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400/60"
          title="Open or manage projects"
        >
          <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden md:inline">Projects</span>
        </button>

        <details className="relative">
          <summary className="grid h-8 w-8 cursor-pointer list-none place-items-center text-slate-500 hover:bg-black/[0.04] hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400/60 [&::-webkit-details-marker]:hidden" aria-label="Project actions" title="Project actions">
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </summary>
          <div className="absolute right-0 top-9 z-50 w-52 border border-slate-300 bg-[#fbfaf6] p-1 shadow-[0_12px_30px_rgba(15,23,42,0.14)]">
            <button type="button" onClick={() => setIsTplOpen(true)} className="flex min-h-9 w-full items-center gap-2 px-2.5 text-left text-[10px] font-medium text-slate-700 hover:bg-[#eee9df] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400">
              <LayoutTemplate className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <span className="min-w-0 flex-1"><span className="block">Change template</span><span className="block truncate text-[8px] font-normal text-slate-400">{templateName || 'Custom project'}</span></span>
              <ChevronDown className="h-3 w-3 -rotate-90 text-slate-300" aria-hidden="true" />
            </button>
            <div className="my-1 border-t border-slate-200" />
            <button type="button" onClick={() => void handleReset()} className="flex min-h-9 w-full items-center gap-2 px-2.5 text-left text-[10px] font-medium text-rose-700 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-300">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset project
            </button>
          </div>
        </details>
      </div>

      <ProjectManager isOpen={isProjOpen} onClose={() => setIsProjOpen(false)} />
      <TemplatePicker isOpen={isTplOpen} onClose={() => setIsTplOpen(false)} />
    </header>
  );
};
