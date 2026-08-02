'use client';

import React, { useEffect, useState } from 'react';
import { RECOVER_TO_DASHBOARD_KEY } from '../../lib/reliability';
import { prepareStorageReliability } from '../../store/storageHealthStore';
import { useWorkflowPreferencesStore } from '../../store/workflowPreferencesStore';
import { FeedbackProvider } from '../feedback/FeedbackProvider';
import { KnowledgeProvider } from '../knowledge/KnowledgeProvider';
import { WorkflowSetupDialog } from '../workflow/WorkflowSetupDialog';
import { AppErrorBoundary } from './AppErrorBoundary';

type ShellComponent = React.ComponentType;

const StudioApplicationLoader: React.FC = () => {
  const [Shell, setShell] = useState<ShellComponent | null>(null);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const hydrateWorkflowPreferences = useWorkflowPreferencesStore((state) => state.hydrate);

  useEffect(() => {
    prepareStorageReliability();
    hydrateWorkflowPreferences();
    import('../AppShell')
      .then((module) => setShell(() => module.AppShell))
      .catch((error: unknown) => setLoadError(error instanceof Error ? error : new Error(String(error))));
  }, [hydrateWorkflowPreferences]);

  if (loadError) throw loadError;
  if (!Shell) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-mono text-[10px] uppercase tracking-widest text-slate-500">
        Preparing reliable workspace…
      </div>
    );
  }

  return (
    <>
      <Shell />
      <WorkflowSetupDialog />
    </>
  );
};

export const StudioRoot: React.FC = () => (
  <AppErrorBoundary
    onReturnToDashboard={() => {
      try {
        window.sessionStorage.setItem(RECOVER_TO_DASHBOARD_KEY, '1');
      } catch {
        // Reload recovery remains available when session storage is blocked.
      }
    }}
  >
    <FeedbackProvider>
      <KnowledgeProvider>
        <StudioApplicationLoader />
      </KnowledgeProvider>
    </FeedbackProvider>
  </AppErrorBoundary>
);
