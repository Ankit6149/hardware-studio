import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, EyeOff, Settings2 } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useStorageHealthStore } from '../store/storageHealthStore';
import { useWorkflowPreferencesStore } from '../store/workflowPreferencesStore';
import { getNavigationItem, isCanvasNavigationItem, NavigationSurface } from '../lib/navigationRegistry';
import { getDomainIdForView, type WorkflowDomainId } from '../lib/workflowProfiles';
import { useFeedback } from './feedback/FeedbackProvider';
import { RECOVER_TO_DASHBOARD_KEY } from '../lib/reliability';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BlueprintCanvas } from './BlueprintCanvas';
import { ExportCenter } from './ExportCenter';
import { PropertiesPanel } from './PropertiesPanel';
import { ReviewWarnings } from './ReviewWarnings';
import { ProductVisualizer } from './ProductVisualizer';
import { PowerBudgetTable } from './PowerBudgetTable';
import { PinMapTable } from './PinMapTable';
import { ReadinessDashboard } from './ReadinessDashboard';
import { PCBConstraints } from './PCBConstraints';
import { ProjectDashboard } from './ProjectDashboard';
import { BlueprintSheets } from './BlueprintSheets';
import { FactoryPackageBuilder } from './FactoryPackageBuilder';
import { RevisionsStudio } from './revisions/RevisionsStudio';
import { ProductStudio } from './product/ProductStudio';
import { FirmwareStudio } from './firmware/FirmwareStudio';
import { EngineeringContextBar } from './studio/EngineeringContextBar';
import { UnifiedValidationWorkbench } from './studio/UnifiedValidationWorkbench';
import { UnifiedMechanicalWorkbench } from './studio/UnifiedWorkbenchAdapters';
import { ElectronicsWorkspace, ELECTRONICS_WORKSPACE_VIEW_IDS } from './studio/ElectronicsWorkspace';
import { WorkspaceCoach } from './editor/WorkspaceCoach';

function renderSurface(surface: NavigationSurface, viewId: string): React.ReactNode {
  if (ELECTRONICS_WORKSPACE_VIEW_IDS.has(viewId)) return <ElectronicsWorkspace />;

  switch (surface) {
    case 'dashboard': return <ProjectDashboard />;
    case 'legacy-blueprint': return <BlueprintCanvas />;
    case 'product-studio': return <ProductStudio initialMode={viewId} />;
    case 'readiness': return <ReadinessDashboard />;
    case 'mechanical-canvas': return <UnifiedMechanicalWorkbench defaultMode="canvas" />;
    case 'mechanical-assembly': return <UnifiedMechanicalWorkbench defaultMode="assembly" />;
    case 'power-budget': return <PowerBudgetTable />;
    case 'pin-map': return <PinMapTable />;
    case 'pcb-constraints': return <PCBConstraints />;
    case 'firmware-modules': return <FirmwareStudio key={viewId} initialMode={viewId === 'firmware-evidence' ? 'evidence' : 'modules'} />;
    case 'firmware-state-machine': return <FirmwareStudio key={viewId} initialMode="state-machine" />;
    case 'firmware-hardware-map': return <FirmwareStudio key={viewId} initialMode="hardware-map" />;
    case 'firmware-source': return <FirmwareStudio key={viewId} initialMode="source" />;
    case 'validation-tests': return <UnifiedValidationWorkbench initialMode="tests" />;
    case 'validation-coverage': return <UnifiedValidationWorkbench initialMode="coverage" />;
    case 'validation-factory-qa': return <UnifiedValidationWorkbench initialMode="factory-qa" />;
    case 'blueprint-sheets': return <BlueprintSheets />;
    case 'exports': return <ExportCenter />;
    case 'revisions': return <RevisionsStudio />;
    case 'factory-builder': return <FactoryPackageBuilder />;
    case 'component-library':
    case 'schematic-editor':
    case 'bom':
    case 'board-designer':
    case 'board-studio':
      return <ElectronicsWorkspace />;
  }
}

const UnavailableWorkspace: React.FC<{ viewId: string; onReturn: () => void }> = ({ viewId, onReturn }) => (
  <section className="flex h-full min-h-0 flex-1 items-center justify-center bg-slate-50 px-6 py-10">
    <div className="w-full max-w-lg rounded-lg border border-amber-300 bg-white p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-amber-50 text-amber-700"><AlertTriangle className="h-4 w-4" aria-hidden="true" /></span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-amber-800">Workspace unavailable</p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">This view is not registered.</h1>
          <p className="mt-2 text-xs leading-5 text-slate-600">The saved view ID <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-800">{viewId}</code> does not match a current Hardware Studio workbench. No project data was changed.</p>
          <button type="button" onClick={onReturn} className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500/70 focus:ring-offset-1">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Return to dashboard
          </button>
        </div>
      </div>
    </div>
  </section>
);

export const AppShell: React.FC = () => {
  const { activeView, loadProjectFromLocalStorage, setActiveView } = useProjectStore();
  const storageHealth = useStorageHealthStore((state) => state.health);
  const { enabledDomains, showAllDomains, toggleDomain, openSetup } = useWorkflowPreferencesStore();
  const retrySave = useCallback(() => {
    useProjectStore.getState().saveActiveProject();
  }, []);
  const { notify } = useFeedback();
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const notifiedStorageState = useRef('');

  useEffect(() => {
    loadProjectFromLocalStorage();
    try {
      if (window.sessionStorage.getItem(RECOVER_TO_DASHBOARD_KEY) === '1') {
        window.sessionStorage.removeItem(RECOVER_TO_DASHBOARD_KEY);
        setActiveView('dashboard');
      }
    } catch {
      // The workspace can still load when session storage is blocked.
    }
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, [loadProjectFromLocalStorage, setActiveView]);

  useEffect(() => {
    if (!['failed', 'unavailable', 'memory-fallback'].includes(storageHealth.status)) return;
    const signature = `${storageHealth.status}:${storageHealth.errorCode || ''}:${storageHealth.message}`;
    if (notifiedStorageState.current === signature) return;
    notifiedStorageState.current = signature;

    notify({
      tone: storageHealth.status === 'memory-fallback' ? 'warning' : 'error',
      title: storageHealth.status === 'memory-fallback' ? 'Project is memory-only' : 'Project save needs attention',
      detail: [storageHealth.message, storageHealth.guidance].filter(Boolean).join(' '),
      durationMs: 0,
      actionLabel: 'Retry save',
      onAction: retrySave,
    });
  }, [notify, retrySave, storageHealth]);

  const activeNavigationItem = getNavigationItem(activeView);
  const isCanvasView = isCanvasNavigationItem(activeNavigationItem);
  const showVisualizer = Boolean(activeNavigationItem?.showVisualizer);
  const activeDomain = getDomainIdForView(activeView);
  const activeHiddenDomain = activeDomain && activeDomain !== 'overview'
    && !enabledDomains.includes(activeDomain as WorkflowDomainId)
    && !showAllDomains
    ? activeDomain as WorkflowDomainId
    : undefined;
  const activeViewLabel = activeNavigationItem?.label || 'Workspace';

  if (!mounted) {
    return <div className="flex h-screen w-screen select-none items-center justify-center bg-[#f3f0e8] text-[11px] font-medium text-slate-500">Initializing Hardware Studio…</div>;
  }

  return (
    <div className="hs-app flex h-screen w-screen flex-col overflow-hidden font-sans text-slate-900" data-ui="hardware-studio">
      <a href="#workspace-main" className="sr-only z-[100] rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to workspace</a>
      <TopBar />
      <div className="relative flex min-h-0 flex-1 bg-[#ebe7dc]">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((value) => !value)} />
        <main id="workspace-main" tabIndex={-1} className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[#f7f5ef] outline-none" aria-label={`${activeViewLabel} workspace`}>
          <p className="sr-only" aria-live="polite" aria-atomic="true">Opened {activeViewLabel} workspace</p>
          <EngineeringContextBar />
          {activeHiddenDomain && (
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-amber-300 bg-amber-50 px-3 py-1.5 text-amber-950" role="status">
              <div className="flex min-w-0 items-center gap-2"><EyeOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><p className="text-[11px] leading-4"><strong>Outside the focused workflow.</strong> Project data is unchanged.</p></div>
              <div className="flex shrink-0 gap-1.5"><button type="button" onClick={() => toggleDomain(activeHiddenDomain)} className="min-h-8 rounded-md border border-amber-300 bg-white px-2.5 text-[11px] font-semibold hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500">Add to focus</button><button type="button" onClick={openSetup} className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-amber-900 px-2.5 text-[11px] font-semibold text-white hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-600"><Settings2 className="h-3.5 w-3.5" aria-hidden="true" /> Configure</button></div>
            </div>
          )}
          <div className="relative flex min-h-0 flex-1">
            {showVisualizer && <ProductVisualizer />}
            <div className="relative flex h-full min-w-0 flex-1 flex-col">
              {activeNavigationItem ? renderSurface(activeNavigationItem.surface, activeView) : <UnavailableWorkspace viewId={activeView} onReturn={() => setActiveView('dashboard')} />}
              {activeNavigationItem && <WorkspaceCoach viewId={activeView} />}
            </div>
            {isCanvasView && <PropertiesPanel />}
          </div>
          <ReviewWarnings />
        </main>
      </div>
    </div>
  );
};
