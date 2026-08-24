import React from 'react';
import {
  Binary,
  Blocks,
  Box,
  Boxes,
  CheckSquare,
  CircuitBoard,
  Cpu,
  Download,
  FileCheck2,
  FileText,
  GitBranch,
  Layers,
  LayoutDashboard,
  Network,
  Package,
  Ruler,
  ShieldAlert,
  Table,
  Tags,
  TestTube2,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  getNavigationDomainForView,
  getNavigationItem,
  type NavigationIconKey,
} from '../lib/navigationRegistry';
import { useProjectStore } from '../store/projectStore';

interface ContextSubnavProps {
  collapsed?: boolean;
}

const iconByKey: Record<NavigationIconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  product: Cpu,
  readiness: FileCheck2,
  requirements: CheckSquare,
  architecture: Network,
  risk: ShieldAlert,
  blueprint: Blocks,
  mechanical: Box,
  assembly: Layers,
  components: Boxes,
  schematic: Workflow,
  power: Zap,
  'pin-map': Tags,
  bom: Table,
  board: CircuitBoard,
  layers: Layers,
  rules: Ruler,
  drc: ShieldAlert,
  firmware: Binary,
  'state-machine': Workflow,
  mapping: Cpu,
  source: FileText,
  validation: TestTube2,
  coverage: FileCheck2,
  'factory-qa': CheckSquare,
  exports: Download,
  'factory-package': Package,
  revisions: FileText,
  branches: GitBranch,
  releases: Box,
};

export const ContextSubnav: React.FC<ContextSubnavProps> = ({ collapsed = false }) => {
  const { activeView, setActiveView } = useProjectStore();
  const activeDomain = getNavigationDomainForView(activeView);
  const activeItem = getNavigationItem(activeView);

  if (collapsed || !activeDomain) return null;

  return (
    <aside
      data-context-subnav
      className="z-20 flex h-full w-[176px] shrink-0 flex-col overflow-hidden border-r border-[#cfc9bd] bg-[#f6f2e9]"
      aria-label={`${activeDomain.label} workbench navigation`}
    >
      <div className="shrink-0 border-b border-[#d6d0c5] px-3 py-3">
        <div className="text-[8px] font-semibold uppercase tracking-[0.13em] text-slate-400">Area</div>
        <h2 className="mt-1 text-[13px] font-semibold tracking-[-0.015em] text-slate-950">{activeDomain.label}</h2>
        <p className="mt-1 text-[9px] leading-4 text-slate-500">{activeDomain.purpose}</p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto p-1.5" aria-label={`${activeDomain.label} workbenches`}>
        {activeDomain.items.map((item) => {
          const Icon = iconByKey[item.icon];
          const active = activeView === item.id || activeItem?.surface === item.surface;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              aria-current={active ? 'page' : undefined}
              title={item.purpose}
              className={`group relative flex min-h-11 w-full items-center gap-2 px-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400/70 ${active ? 'bg-[#e3dccd] text-slate-950' : 'text-slate-600 hover:bg-[#ece7dd] hover:text-slate-950'}`}
            >
              {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-slate-950" aria-hidden="true" />}
              <span className={`grid h-6 w-6 shrink-0 place-items-center border ${active ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-[#fbfaf6] text-slate-500'}`}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-semibold">{item.label}</span>
                <span className="mt-0.5 block truncate text-[8px] text-slate-400">{item.badge}</span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
