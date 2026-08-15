import React, { useMemo } from 'react';
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
import { getNavigationItem, type NavigationIconKey } from '../lib/navigationRegistry';
import { getDomainIdForView, getVisibleNavigationDomains } from '../lib/workflowProfiles';
import { useProjectStore } from '../store/projectStore';
import { useWorkflowPreferencesStore } from '../store/workflowPreferencesStore';

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

const quickStartByView: Record<string, readonly string[]> = {
  dashboard: ['Choose the product area you need.', 'Open one workbench, not the whole system.', 'Use the Guide only when you need orientation.'],
  'product-design': ['Define what the product must do.', 'Capture constraints and decisions.', 'Move to Architecture when the system roles are clear.'],
  requirements: ['Write a measurable requirement.', 'Link the requirement to the responsible product area.', 'Add validation evidence before calling it verified.'],
  'product-architecture': ['Place recognizable system roles.', 'Drag typed ports to describe interfaces.', 'Inspect findings and linked requirements.'],
  'component-library': ['Choose a real component definition.', 'Inspect symbol, package and pin information.', 'Add it to the project before placing it in a design.'],
  'schematic-editor': ['Place project components on the sheet.', 'Wire real pins and name the electrical intent.', 'Run ERC before moving to PCB.'],
  'board-designer': ['Place footprints inside the real board outline.', 'Route selected nets on the correct copper layer.', 'Run DRC and resolve blockers before export.'],
  'board-settings': ['Select or create the real board identity.', 'Define the physical outline and stack intent.', 'Open PCB Layout only after geometry exists.'],
  'pcb-rules': ['Define widths, clearances and routing constraints.', 'Keep rules tied to the selected board.', 'Return to Layout and run DRC.'],
  'mechanical-studio': ['Create physical features only from known intent.', 'Dimension and tolerance the selected feature.', 'Link the real PCB envelope when available.'],
  'assembly-stack': ['Describe the physical assembly order.', 'Record material and fastening intent.', 'Keep unresolved dimensions explicitly unresolved.'],
  'firmware-studio': ['Map firmware responsibility to hardware.', 'Describe behavior and state transitions.', 'Open Source when implementation work begins.'],
  'hardware-mapping': ['Map modules to real pins and buses.', 'Resolve ambiguous hardware responsibilities.', 'Keep mappings linked to canonical components.'],
  'source-skeleton': ['Create or open a real source file.', 'Edit implementation without changing hardware truth.', 'Record build/device evidence separately.'],
  'validation-studio': ['Choose a requirement to verify.', 'Run the procedure and capture measurements.', 'Attach evidence to the exact product state.'],
  coverage: ['Inspect which requirements have evidence.', 'Open gaps rather than marking them complete.', 'Retest stale evidence after relevant changes.'],
  exports: ['Review readiness before generating outputs.', 'Export only supported authoritative artifacts.', 'Keep the output tied to the exact project revision.'],
  'factory-package': ['Resolve manufacturing blockers first.', 'Assemble only supported fabrication artifacts.', 'Review the final package before release.'],
  revisions: ['Capture a meaningful engineering revision.', 'Review what changed and its evidence impact.', 'Release only from a known revision state.'],
};

function resolveQuickStart(viewId: string, domainId: string): readonly string[] {
  if (quickStartByView[viewId]) return quickStartByView[viewId];
  if (domainId === 'electronics') return ['Choose the electrical workbench.', 'Work on one canonical component/net at a time.', 'Use Browser and Inspector only when needed.'];
  if (domainId === 'pcb') return ['Confirm board geometry and rules.', 'Place and route real board objects.', 'Use DRC as the release gate.'];
  if (domainId === 'mechanical') return ['Create physical intent.', 'Add dimensions and constraints.', 'Keep exact geometry separate from guesses.'];
  if (domainId === 'firmware') return ['Map hardware responsibility.', 'Implement source behavior.', 'Capture build/device evidence.'];
  return ['Choose the current workbench.', 'Work on the decision in front of you.', 'Open detail panels only when the task needs them.'];
}

export const ContextSubnav: React.FC<ContextSubnavProps> = ({ collapsed = false }) => {
  const { activeView, setActiveView } = useProjectStore();
  const { enabledDomains, showAllDomains } = useWorkflowPreferencesStore();

  const domains = useMemo(
    () => getVisibleNavigationDomains(enabledDomains, activeView, showAllDomains),
    [activeView, enabledDomains, showAllDomains],
  );
  const activeDomainId = getDomainIdForView(activeView) || 'overview';
  const activeDomain = domains.find((domain) => domain.id === activeDomainId) || domains[0];
  const activeItem = getNavigationItem(activeView);
  const quickStart = resolveQuickStart(activeView, activeDomainId);

  if (collapsed || !activeDomain) return null;

  return (
    <aside
      data-context-subnav
      className="z-20 flex h-full w-[184px] shrink-0 flex-col overflow-hidden border-r border-[#cfc9bd] bg-[#f6f2e9]"
      aria-label={`${activeDomain.label} contextual navigation`}
    >
      <div className="shrink-0 border-b border-[#d6d0c5] px-3 py-3">
        <div className="text-[8px] font-semibold uppercase tracking-[0.13em] text-slate-400">Product area</div>
        <h2 className="mt-1 text-[13px] font-semibold tracking-[-0.015em] text-slate-950">{activeDomain.label}</h2>
      </div>

      <nav className="shrink-0 p-1.5" aria-label={`${activeDomain.label} workbenches`}>
        <div className="px-2 pb-1.5 pt-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Workbenches</div>
        {activeDomain.items.map((item, index) => {
          const Icon = iconByKey[item.icon];
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              aria-current={active ? 'page' : undefined}
              title={item.purpose}
              className={`group relative flex min-h-10 w-full items-center gap-2 px-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400/70 ${active ? 'bg-[#e3dccd] text-slate-950' : 'text-slate-600 hover:bg-[#ece7dd] hover:text-slate-950'}`}
            >
              {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-slate-950" aria-hidden="true" />}
              <span className={`grid h-6 w-6 shrink-0 place-items-center border ${active ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-300 bg-[#fbfaf6] text-slate-500'}`}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-semibold">{item.label}</span>
                <span className="mt-0.5 block font-mono text-[7px] text-slate-400">{String(index + 1).padStart(2, '0')}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#d6d0c5] bg-[#f1ede4] px-3 py-3">
        <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Start here</div>
        <div className="mt-2 text-[10px] font-semibold text-slate-800">{activeItem?.label || activeDomain.label}</div>
        <ol className="mt-2 space-y-2">
          {quickStart.map((step, index) => (
            <li key={step} className="grid grid-cols-[18px_1fr] gap-2 text-[9px] leading-4 text-slate-500">
              <span className="font-mono font-semibold text-slate-400">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
};
