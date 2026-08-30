'use client';

import React from 'react';
import {
  Box,
  Boxes,
  CircuitBoard,
  FileSpreadsheet,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { BOMItem, BoardComponent, BoardItem, BoardOutline } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';

export type ElectronicsRepresentation = 'schematic' | 'pcb' | 'bom' | '3d';
export type ElectronicsRepresentationState = 'ready' | 'incomplete' | 'blocked';

interface ElectronicsRepresentationStatus {
  id: ElectronicsRepresentation;
  label: string;
  state: ElectronicsRepresentationState;
  stateLabel: string;
  enabled: boolean;
}

interface ElectronicsRepresentationStripProps {
  componentId: string;
  current: ElectronicsRepresentation;
}

const EMPTY_COMPONENTS: BoardComponent[] = [];
const EMPTY_BOM: BOMItem[] = [];
const EMPTY_BOARDS: BoardItem[] = [];
const EMPTY_OUTLINES: BoardOutline[] = [];

const iconByRepresentation: Record<ElectronicsRepresentation, LucideIcon> = {
  schematic: Workflow,
  pcb: CircuitBoard,
  bom: FileSpreadsheet,
  '3d': Box,
};

function hasExplicitOutline(outline: BoardOutline | undefined): boolean {
  if (!outline) return false;
  if (outline.points && outline.points.length >= 3) return true;
  return Boolean(
    outline.width != null
    && outline.height != null
    && outline.width > 0
    && outline.height > 0,
  );
}

function hasPositivePackageDimensions(component: BoardComponent): boolean {
  const dimensions = component.packageDimensions;
  return Boolean(
    dimensions
    && dimensions.widthMm > 0
    && dimensions.heightMm > 0
    && dimensions.heightZMm > 0,
  );
}

function hasExplicitPcbPlacement(component: BoardComponent): boolean {
  const x = component.pcb?.xMm ?? component.placementX;
  const y = component.pcb?.yMm ?? component.placementY;
  return x != null && y != null;
}

export function deriveElectronicsRepresentationStatuses(
  component: BoardComponent,
  bom: readonly BOMItem[],
  boards: readonly BoardItem[],
  boardOutlines: readonly BoardOutline[],
): ElectronicsRepresentationStatus[] {
  const schematicPlaced = component.schematic?.placed === true;
  const hasFootprint = Boolean(component.footprint?.trim());
  const pcbPlaced = hasExplicitPcbPlacement(component);
  const bomLinked = bom.some((item) => item.componentId === component.id || item.id === component.bomItemId);
  const boardExists = boards.some((board) => board.id === component.boardId);
  const outlineExists = hasExplicitOutline(boardOutlines.find((outline) => outline.boardId === component.boardId));
  const packageReady = hasPositivePackageDimensions(component);
  const threeDReady = boardExists && outlineExists && pcbPlaced && packageReady;

  return [
    {
      id: 'schematic',
      label: 'Symbol',
      state: schematicPlaced ? 'ready' : 'incomplete',
      stateLabel: schematicPlaced ? 'Placed' : 'Unplaced',
      enabled: true,
    },
    {
      id: 'pcb',
      label: 'PCB',
      state: !hasFootprint ? 'blocked' : pcbPlaced ? 'ready' : 'incomplete',
      stateLabel: !hasFootprint ? 'No footprint' : pcbPlaced ? 'Placed' : 'Unplaced',
      enabled: true,
    },
    {
      id: 'bom',
      label: 'BOM',
      state: bomLinked ? 'ready' : 'incomplete',
      stateLabel: bomLinked ? 'Linked' : 'Unlinked',
      enabled: true,
    },
    {
      id: '3d',
      label: '3D',
      state: threeDReady ? 'ready' : 'blocked',
      stateLabel: threeDReady ? 'Ready' : 'Unresolved',
      enabled: threeDReady,
    },
  ];
}

const stateDotClass: Record<ElectronicsRepresentationState, string> = {
  ready: 'bg-emerald-500',
  incomplete: 'bg-amber-400',
  blocked: 'bg-slate-300',
};

export const ElectronicsRepresentationStrip: React.FC<ElectronicsRepresentationStripProps> = ({ componentId, current }) => {
  const boardComponents = useProjectStore((state) => state.boardComponents ?? EMPTY_COMPONENTS);
  const bom = useProjectStore((state) => state.bom ?? EMPTY_BOM);
  const boards = useProjectStore((state) => state.boards ?? EMPTY_BOARDS);
  const boardOutlines = useProjectStore((state) => state.boardOutlines ?? EMPTY_OUTLINES);
  const setActiveBoard = useProjectStore((state) => state.setActiveBoard);
  const setActiveView = useProjectStore((state) => state.setActiveView);
  const select = useStudioContextStore((state) => state.select);
  const beginHandoff = useStudioContextStore((state) => state.beginHandoff);
  const requestMechanicalMode = useStudioContextStore((state) => state.requestMechanicalMode);

  const component = boardComponents.find((candidate) => candidate.id === componentId);
  if (!component) return null;

  const statuses = deriveElectronicsRepresentationStatuses(component, bom, boards, boardOutlines);

  const openRepresentation = (representation: ElectronicsRepresentation) => {
    const status = statuses.find((candidate) => candidate.id === representation);
    if (!status?.enabled || representation === current) return;

    select({
      entity: 'component-instance',
      id: component.id,
      label: component.referenceDesignator,
      boardId: component.boardId,
      componentId: component.id,
    });
    setActiveBoard(component.boardId);
    beginHandoff(current === 'schematic' ? 'schematic-editor' : current === 'pcb' ? 'board-designer' : current === 'bom' ? 'bom' : 'mechanical-studio');

    if (representation === 'schematic') setActiveView('schematic-editor');
    if (representation === 'pcb') setActiveView('board-designer');
    if (representation === 'bom') setActiveView('bom');
    if (representation === '3d') {
      requestMechanicalMode('webgl-3d');
      setActiveView('mechanical-studio');
    }
  };

  return (
    <section className="border-y border-slate-200 bg-slate-50/70 px-2 py-2" aria-label={`${component.referenceDesignator} representations`}>
      <div className="mb-1.5 flex items-center gap-1.5 px-1">
        <Boxes className="h-3 w-3 text-slate-400" aria-hidden="true" />
        <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Same component</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {statuses.map((status) => {
          const Icon = iconByRepresentation[status.id];
          const active = status.id === current;
          return (
            <button
              key={status.id}
              type="button"
              disabled={!status.enabled || active}
              aria-current={active ? 'page' : undefined}
              onClick={() => openRepresentation(status.id)}
              title={active ? `${status.label} is open` : status.enabled ? `Open ${status.label} for ${component.referenceDesignator}` : `${status.label}: ${status.stateLabel}`}
              className={`min-w-0 border px-1.5 py-2 text-center transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400/70 ${
                active
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : status.enabled
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-100'
                    : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
              }`}
            >
              <Icon className="mx-auto h-3.5 w-3.5" aria-hidden="true" />
              <span className="mt-1 block truncate text-[9px] font-semibold">{status.label}</span>
              <span className={`mx-auto mt-1 block h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : stateDotClass[status.state]}`} aria-hidden="true" />
              <span className={`mt-0.5 block truncate text-[7px] ${active ? 'text-white/65' : 'text-slate-400'}`}>{active ? 'Open' : status.stateLabel}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};