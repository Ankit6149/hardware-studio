import React, { useState } from 'react';
import { AlertCircle, BookOpen, CloudOff, FolderOpen, HardDrive, LayoutTemplate, LoaderCircle, RotateCcw } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useStorageHealthStore } from '../store/storageHealthStore';
import { storageHealthLabel } from '../lib/reliability';
import { Button } from '../ui/Button';
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
      className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-[12px] font-semibold text-slate-900 outline-none transition-colors hover:bg-slate-100 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-300/70"
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

  const savedTime = storageHealth.lastSavedAt
    ? new Date(storageHealth.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <header className="z-40 flex h-12 shrink-0 items-center border-b border-slate-300 bg-[#f8f5ee] px-3 text-slate-900">
      <div className="flex w-[190px] shrink-0 items-center gap-2.5">
        <BrandMark className="h-7 w-7" />
        <div className="min-w-0">
          <div className="truncate text-[12px] font-bold leading-none tracking-[-0.02em] text-slate-950">Hardware Studio</div>
          <div className="mt-1 truncate text-[10px] leading-none text-slate-500">Connected engineering</div>
        </div>
      </div>

      <div className="mx-3 flex min-w-0 max-w-[560px] flex-1 items-center gap-2 border-l border-slate-300 pl-3">
        <ProjectNameEditor key={projectName} projectName={projectName} onCommit={handleNameCommit} />
        <button
          type="button"
          onClick={showStorageDetail}
          className="hidden min-h-8 shrink-0 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400/60 sm:inline-flex"
          title={[storageHealth.message, savedTime ? `Last saved ${savedTime}` : ''].filter(Boolean).join(' ')}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} aria-hidden="true" />
          <StatusIcon className={`h-3.5 w-3.5 ${storageHealth.status === 'saving' ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span>{storageHealthLabel(storageHealth)}{savedTime && storageHealth.status === 'saved' ? ` · ${savedTime}` : ''}</span>
        </button>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Button onClick={() => openKnowledge()} variant="ghost" size="sm" icon={<BookOpen className="h-3.5 w-3.5" />}>Learn</Button>
        <Button onClick={() => setIsProjOpen(true)} variant="ghost" size="sm" icon={<FolderOpen className="h-3.5 w-3.5" />}>Workspaces</Button>
        <Button
          onClick={() => setIsTplOpen(true)}
          variant="ghost"
          size="sm"
          className="hidden md:inline-flex"
          icon={<LayoutTemplate className="h-3.5 w-3.5" />}
          title={`Template: ${templateName || 'Custom'}`}
        >
          Templates
        </Button>
        <button
          type="button"
          onClick={() => void handleReset()}
          className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
          aria-label="Reset project"
          title="Reset project"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <ProjectManager isOpen={isProjOpen} onClose={() => setIsProjOpen(false)} />
      <TemplatePicker isOpen={isTplOpen} onClose={() => setIsTplOpen(false)} />
    </header>
  );
};
