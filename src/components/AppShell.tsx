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
import { BlueprintDossier } from './BlueprintDossier';
import { BoardStudio } from './BoardStudio';
import { CircuitPlanner } from './CircuitPlanner';
import { NetlistPlanner } from './NetlistPlanner';
import { PCBConstraints } from './PCBConstraints';
import { ManufacturingPack } from './ManufacturingPack';
import { ProjectDashboard } from './ProjectDashboard';
import { BlueprintSheets } from './BlueprintSheets';
import { BlueprintEditor } from './BlueprintEditor';
import { FactoryPackageBuilder } from './FactoryPackageBuilder';
import { BoardDesigner } from './board/BoardDesigner';
import { ComponentLibrary } from './component-library/ComponentLibrary';
import { SchematicEditor } from './schematic/SchematicEditor';
import { ProductStudio } from './product/ProductStudio';
import { MechanicalStudio } from './mechanical/MechanicalStudio';
import { FirmwareStudio } from './firmware/FirmwareStudio';
import { ValidationStudio } from './validation/ValidationStudio';

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
      case 'dashboard':
        return <ProjectDashboard />;
      case 'product-studio':
      case 'requirements':
      case 'risks-interfaces':
        return <ProductStudio />;
      case 'mechanical-studio':
      case 'assembly-stack':
        return <MechanicalStudio />;
      case 'component-library':
        return <ComponentLibrary />;
      case 'schematic-editor':
        return <SchematicEditor />;
      case 'power-tree':
      case 'power-budget':
        return <PowerBudgetTable />;
      case 'pin-map':
      case 'hardware-mapping':
        return <PinMapTable />;
      case 'bom':
        return <BOMTable />;
      case 'board-designer':
        return <BoardDesigner />;
      case 'board-settings':
      case 'board-studio':
      case 'board-components':
        return <BoardStudio />;
      case 'pcb-constraints':
        return <PCBConstraints />;
      case 'pcb-drc':
        return <TestingBoard />;
      case 'firmware-studio':
      case 'state-machines':
      case 'source-skeleton':
        return <FirmwareStudio />;
      case 'validation-studio':
      case 'requirement-coverage':
      case 'factory-qa':
        return <ValidationStudio />;
      case 'blueprint-sheets':
        return <BlueprintSheets />;
      case 'exports':
        return <ExportCenter />;
      case 'factory-builder':
        return <FactoryPackageBuilder />;
      default:
        return <BlueprintCanvas />;
    }
  };

  // Canvas views are drawing-board views
  const tabularViews = [
    'dashboard', 'product-studio', 'readiness', 'requirements', 'risks-interfaces',
    'mechanical-studio', 'assembly-stack', 'component-library', 'schematic-editor',
    'power-tree', 'power-budget', 'pin-map', 'hardware-mapping', 'bom', 'board-designer',
    'board-settings', 'board-studio', 'board-components', 'pcb-constraints', 'pcb-drc',
    'firmware-studio', 'state-machines', 'source-skeleton', 'validation-studio',
    'requirement-coverage', 'factory-qa', 'blueprint-sheets', 'exports', 'factory-builder'
  ];
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
