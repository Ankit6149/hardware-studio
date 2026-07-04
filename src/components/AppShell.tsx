import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BlueprintCanvas } from './BlueprintCanvas';
import { BOMTable } from './BOMTable';
import { TestingBoard } from './TestingBoard';
import { ExportCenter } from './ExportCenter';
import { PropertiesPanel } from './PropertiesPanel';
import { ReviewWarnings } from './ReviewWarnings';
import { ProductVisualizer } from './ProductVisualizer';
import { PowerBudgetTable } from './PowerBudgetTable';
import { PinMapTable } from './PinMapTable';
import { FirmwarePlan } from './FirmwarePlan';
import { ReadinessDashboard } from './ReadinessDashboard';

export const AppShell: React.FC = () => {
  const { activeView, loadProjectFromLocalStorage } = useProjectStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadProjectFromLocalStorage();
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProjectFromLocalStorage]);

  const renderContent = () => {
    switch (activeView) {
      case 'bom':
        return <BOMTable />;
      case 'testing':
        return <TestingBoard />;
      case 'power-budget':
        return <PowerBudgetTable />;
      case 'pin-map':
        return <PinMapTable />;
      case 'firmware-plan':
        return <FirmwarePlan />;
      case 'readiness':
        return <ReadinessDashboard />;
      case 'exports':
        return <ExportCenter />;
      default:
        return <BlueprintCanvas />;
    }
  };

  // Canvas views are drawing-board views
  const tabularViews = ['bom', 'testing', 'exports', 'power-budget', 'pin-map', 'firmware-plan', 'readiness'];
  const isCanvasView = !tabularViews.includes(activeView);
  const showVisualizer = !tabularViews.includes(activeView);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-450 font-mono text-[9px] uppercase tracking-widest select-none">
        Initializing workspace...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <TopBar />
      <div className="flex flex-1 min-h-0 relative">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
          <div className="flex-1 flex min-h-0 relative">
            {showVisualizer && <ProductVisualizer />}
            <div className="flex-1 h-full flex flex-col relative min-w-0">
              {renderContent()}
            </div>
            {isCanvasView && <PropertiesPanel />}
          </div>
          <ReviewWarnings />
        </main>
      </div>
    </div>
  );
};
