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
      className="min-w-0 flex-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-[10px] font-semibold text-slate-800 outline-none transition hover:border-slate-300 hover:bg-slate-100 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-300"
      placeholder="Unnamed Project"
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

  const statusClass = storageHealth.status === 'saved'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : storageHealth.status === 'saving'
      ? 'border-sky-200 bg-sky-50 text-sky-800'
      : ['failed', 'unavailable'].includes(storageHealth.status)
        ? 'border-rose-200 bg-rose-50 text-rose-800'
        : storageHealth.status === 'memory-fallback'
          ? 'border-amber-200 bg-amber-50 text-amber-800'
          : 'border-slate-200 bg-slate-100 text-slate-600';

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
    <header className="z-30 flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex min-w-[190px] items-center gap-2.5">
        <BrandMark className="h-7 w-7" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[11px] font-extrabold leading-none tracking-[-0.015em] text-slate-950">Hardware Studio</span>
          <span className="mt-1 text-[7px] font-bold uppercase tracking-[0.18em] text-slate-400">Connected engineering workspace</span>
        </div>
      </div>

      <div className="mx-4 flex max-w-[500px] flex-1 items-center gap-2.5">
        <ProjectNameEditor key={projectName} projectName={projectName} onCommit={handleNameCommit} />
        <button
          type="button"
          onClick={showStorageDetail}
          className={`hidden shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.1em] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 sm:flex ${statusClass}`}
          title={[storageHealth.message, savedTime ? `Last saved ${savedTime}` : ''].filter(Boolean).join(' ')}
        >
          <StatusIcon className={`h-3 w-3 ${storageHealth.status === 'saving' ? 'animate-spin' : ''}`} aria-hidden="true" />
          {storageHealthLabel(storageHealth)}{savedTime && storageHealth.status === 'saved' ? ` ${savedTime}` : ''}
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="hidden max-w-[120px] items-center gap-1 rounded border border-slate-200 bg-slate-100 px-2 py-1 font-mono text-[7px] font-bold uppercase tracking-[0.1em] text-slate-600 lg:flex">
          <span className="text-slate-400">TPL</span>
          <span className="truncate">{templateName || 'Custom'}</span>
        </div>

        <Button onClick={() => openKnowledge()} variant="secondary" size="sm" icon={<BookOpen className="h-3.5 w-3.5 text-indigo-600" />}>Learn</Button>
        <Button onClick={() => setIsProjOpen(true)} variant="secondary" size="sm" icon={<FolderOpen className="h-3.5 w-3.5 text-slate-500" />}>Workspaces</Button>
        <Button onClick={() => setIsTplOpen(true)} variant="secondary" size="sm" className="hidden md:inline-flex" icon={<LayoutTemplate className="h-3.5 w-3.5 text-slate-500" />}>Templates</Button>
        <Button onClick={() => void handleReset()} variant="ghost" size="sm" className="border border-rose-100 text-rose-700 hover:bg-rose-50" icon={<RotateCcw className="h-3.5 w-3.5 text-rose-500" />}>Reset</Button>
      </div>

      <ProjectManager isOpen={isProjOpen} onClose={() => setIsProjOpen(false)} />
      <TemplatePicker isOpen={isTplOpen} onClose={() => setIsTplOpen(false)} />
    </header>
  );
};
