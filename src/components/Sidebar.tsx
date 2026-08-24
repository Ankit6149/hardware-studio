import React from 'react';
import {
  Binary,
  Box,
  Boxes,
  Cpu,
  Home,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  TestTube2,
  type LucideIcon,
} from 'lucide-react';
import {
  getNavigationDomainForView,
  navigationDomains,
  type NavigationDomainId,
} from '../lib/navigationRegistry';
import { useProjectStore } from '../store/projectStore';
import { ContextSubnav } from './ContextSubnav';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const domainIcons: Record<NavigationDomainId, LucideIcon> = {
  overview: Home,
  product: Boxes,
  electronics: Cpu,
  mechanical: Box,
  firmware: Binary,
  validation: TestTube2,
  outputs: Package,
};

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggleCollapsed }) => {
  const { activeView, setActiveView } = useProjectStore();
  const activeDomainId = getNavigationDomainForView(activeView)?.id || 'overview';

  const openDomain = (domainId: NavigationDomainId) => {
    const domain = navigationDomains.find((candidate) => candidate.id === domainId);
    if (!domain || activeDomainId === domainId) return;
    const firstView = domain.items[0]?.id;
    if (firstView) setActiveView(firstView);
  };

  return (
    <>
      <aside className="z-30 flex h-full w-[78px] shrink-0 flex-col border-r border-[#2c2b27] bg-[#11110f] text-white" aria-label="Primary product navigation">
        <div className="grid h-11 shrink-0 place-items-center border-b border-white/10">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="grid h-9 w-10 place-items-center text-[#c9c3b8] transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#cbbda6]"
            aria-label={collapsed ? 'Show workbench navigation' : 'Hide workbench navigation'}
            aria-expanded={!collapsed}
            title={collapsed ? 'Show workbench navigation' : 'Hide workbench navigation'}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" aria-hidden="true" /> : <PanelLeftClose className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-px overflow-y-auto px-1 py-1.5" aria-label="Product areas">
          {navigationDomains.map((domain) => {
            const Icon = domainIcons[domain.id];
            const active = domain.id === activeDomainId;
            return (
              <button
                key={domain.id}
                type="button"
                onClick={() => openDomain(domain.id)}
                aria-current={active ? 'page' : undefined}
                aria-label={domain.label}
                title={`${domain.label} — ${domain.purpose}`}
                className={`relative flex min-h-[56px] w-full flex-col items-center justify-center gap-1.5 px-1 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#cbbda6] ${active ? 'bg-[#f3f0e8] text-[#11110f]' : 'text-[#aaa398] hover:bg-white/10 hover:text-[#f3f0e8]'}`}
              >
                <Icon className="h-[17px] w-[17px]" strokeWidth={1.7} aria-hidden="true" />
                <span className={`max-w-full truncate text-[8px] font-semibold tracking-[-0.01em] ${active ? 'text-[#11110f]' : 'text-[#b5aea3]'}`}>{domain.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <ContextSubnav collapsed={collapsed} />
    </>
  );
};
