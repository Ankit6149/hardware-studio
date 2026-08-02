import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useStorageHealthStore } from '../store/storageHealthStore';
import { getNavigationItem, isCanvasNavigationItem, NavigationSurface } from '../lib/navigationRegistry';
import { useFeedback } from './feedback/FeedbackProvider';
import { RECOVER_TO_DASHBOARD_KEY } from '../lib/reliability';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BlueprintCanvas } from './BlueprintCanvas';
import { BOMTable } from './BOMTable';
import { ExportCenter } from './ExportCenter';
import { PropertiesPanel } from './PropertiesPanel';
import { ReviewWarnings } from './ReviewWarnings';
import { ProductVisualizer } from './ProductVisualizer';
import { PowerBudgetTable } from './PowerBudgetTable';
import { PinMapTable } from './PinMapTable';
import { ReadinessDashboard } from './ReadinessDashboard';
import { BoardStudio } from './BoardStudio';
import { PCBConstraints } from './PCBConstraints';
import { ProjectDashboard } from './ProjectDashboard';
import { BlueprintSheets } from './BlueprintSheets';
import { FactoryPackageBuilder } from './FactoryPackageBuilder';
import { RevisionsStudio } from './revisions/RevisionsStudio';
import { BoardDesigner } from './board/BoardDesigner';
import { ComponentLibraryWorkbench } from './component-library/ComponentLibraryWorkbench';
import { SchematicEditor } from './schematic/SchematicEditor';
import { ProductStudio } from './product/ProductStudio';
import { MechanicalStudio } from './mechanical/MechanicalStudio';
import { FirmwareStudio } from './firmware/FirmwareStudio';
import { ValidationStudio } from './validation/ValidationStudio';

function renderSurface(surface: NavigationSurface): React.ReactNode {
  switch (surface) {
    case 'dashboard': return <ProjectDashboard />;
    case 'legacy-blueprint': return <BlueprintCanvas />;
    case 'product-studio': return <ProductStudio />;
    case 'readiness': return <ReadinessDashboard />;
    case 'mechanical-canvas': return <MechanicalStudio initialMode="canvas" />;
    case 'mechanical-assembly': return <MechanicalStudio initialMode="assembly" />;
    case 'component-library': return <ComponentLibraryWorkbench />;
    case 'schematic-editor': return <SchematicEditor />;
    case 'power-budget': return <PowerBudgetTable />;
    case 'pin-map': return <PinMapTable />;
    case 'bom': return <BOMTable />;
    case 'board-designer': return <BoardDesigner />;
    case 'board-studio': return <BoardStudio />;
    case 'pcb-constraints': return <PCBConstraints />;
    case 'firmware-modules': return <FirmwareStudio initialMode="modules" />;
    case 'firmware-state-machine': return <FirmwareStudio initialMode="state-machine" />;
    case 'firmware-hardware-map': return <FirmwareStudio initialMode="hardware-map" />;
    case 'firmware-source': return <FirmwareStudio initialMode="source" />;
    case 'validation-tests': return <ValidationStudio initialMode="tests" />;
    case 'validation-coverage': return <ValidationStudio initialMode="coverage" />;
    case 'validation-factory-qa': return <ValidationStudio initialMode="factory-qa" />;
    case 'blueprint-sheets': return <BlueprintSheets />;
    case 'exports': return <ExportCenter />;
    case 'revisions': return <RevisionsStudio />;
    case 'factory-builder': return <FactoryPackageBuilder />;
  }
}

const UnavailableWorkspace: React.FC<{ viewId: string; onReturn: () => void }> = ({ viewId, onReturn }) => (
  <section className="flex h-full min-h-0 flex-1 items-center justify-center bg-slate-50 px-6 py-10">
    <div className="w-full max-w-xl rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Workspace unavailable</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">This view is not registered.</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The saved view ID <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-800">{viewId}</code>{' '}
            does not match a current Hardware Studio workbench. No project data was changed and no unrelated editor was opened.
          </p>
          <button
            type="button"
            onClick={onReturn}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Return to project dashboard
          </button>
        </div>
      </div>
    </div>
  </section>
);

export const AppShell: React.FC = () => {
  const { activeView, loadProjectFromLocalStorage, setActiveView } = useProjectStore();
  const storageHealth = useStorageHealthStore((state) => state.health);
  const retrySave = useCallback(() => {
    useProjectStore.getState().saveActiveProject();
  }, []);
  const { notify } = useFeedback();
  const [mounted, setMounted] = useState(false);
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

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen select-none items-center justify-center bg-slate-50 font-mono text-[10px] uppercase tracking-widest text-slate-500">
        Initializing workspace...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 font-sans text-slate-900">
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <Sidebar />
        <main className="relative flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative flex min-h-0 flex-1">
            {showVisualizer && <ProductVisualizer />}
            <div className="relative flex h-full min-w-0 flex-1 flex-col">
              {activeNavigationItem ? renderSurface(activeNavigationItem.surface) : (
                <UnavailableWorkspace viewId={activeView} onReturn={() => setActiveView('dashboard')} />
              )}
            </div>
            {isCanvasView && <PropertiesPanel />}
          </div>
          <ReviewWarnings />
        </main>
      </div>
    </div>
  );
};
