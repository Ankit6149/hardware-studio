import type { Project } from '../../types';
import { runBoardDRC } from '../boardDRC';

export type ElectronicsWorkflowStageId =
  | 'component-library'
  | 'schematic-editor'
  | 'board-settings'
  | 'board-designer'
  | 'pcb-drc'
  | 'bom';

export interface ElectronicsWorkflowSnapshot {
  activeBoardId: string | null;
  activeBoardName: string | null;
  hasBoardOutline: boolean;
  componentCount: number;
  schematicPlacedCount: number;
  pcbPlacedCount: number;
  netCount: number;
  routedNetCount: number;
  linkedBomCount: number;
  missingFootprintCount: number;
  drcFindingCount: number;
  blockingDrcCount: number;
  blockers: string[];
  nextStage: ElectronicsWorkflowStageId;
  readyForValidation: boolean;
}

function resolveActiveBoard(project: Project) {
  const boards = project.boards || [];
  if (project.activeBoardId) {
    const exact = boards.find((board) => board.id === project.activeBoardId);
    if (exact) return exact;
  }
  return boards[0] || null;
}

export function evaluateElectronicsWorkflow(project: Project): ElectronicsWorkflowSnapshot {
  const activeBoard = resolveActiveBoard(project);
  const activeBoardId = activeBoard?.id || null;
  const boardComponents = (project.boardComponents || []).filter(
    (component) => !activeBoardId || component.boardId === activeBoardId,
  );
  const schematicPlacedCount = boardComponents.filter((component) => component.schematic?.placed).length;
  const pcbPlacedCount = boardComponents.filter(
    (component) => component.pcb?.placed || component.placementStatus === 'Placed' || component.placementStatus === 'Locked' || component.placementStatus === 'Verified',
  ).length;
  const boardNets = project.nets || [];
  const routedNetNames = new Set(
    (project.traces || [])
      .filter((trace) => !activeBoardId || trace.boardId === activeBoardId)
      .map((trace) => trace.netName)
      .filter((name): name is string => Boolean(name)),
  );
  const bomIds = new Set((project.bom || []).map((item) => item.id));
  const linkedBomCount = boardComponents.filter(
    (component) => Boolean(component.bomItemId && bomIds.has(component.bomItemId)),
  ).length;
  const hasBoardOutline = Boolean(
    activeBoardId && (project.boardOutlines || []).some((outline) => outline.boardId === activeBoardId),
  );
  const missingFootprintCount = boardComponents.filter((component) => !component.footprint || !component.packageName).length;

  const canRunDrc = Boolean(activeBoardId && hasBoardOutline && boardComponents.length > 0 && pcbPlacedCount === boardComponents.length);
  const drcResults = canRunDrc ? runBoardDRC(project) : [];
  const openDrcResults = drcResults.filter((result) => result.status === 'Open');
  const blockingDrcCount = openDrcResults.filter((result) => result.severity === 'Error' || result.severity === 'Blocker').length;

  const blockers: string[] = [];
  if (boardComponents.length === 0) blockers.push('Add at least one canonical project component from the library.');
  if (missingFootprintCount > 0) blockers.push(`${missingFootprintCount} component${missingFootprintCount === 1 ? '' : 's'} still lack authoritative footprint/package data.`);
  if (boardComponents.length > 0 && schematicPlacedCount < boardComponents.length) blockers.push(`${boardComponents.length - schematicPlacedCount} component${boardComponents.length - schematicPlacedCount === 1 ? '' : 's'} still need schematic placement.`);
  if (!activeBoard) blockers.push('Define a real board before PCB placement or routing.');
  if (activeBoard && !hasBoardOutline) blockers.push('Record the selected board outline before physical layout.');
  if (activeBoard && hasBoardOutline && pcbPlacedCount < boardComponents.length) blockers.push(`${boardComponents.length - pcbPlacedCount} component${boardComponents.length - pcbPlacedCount === 1 ? '' : 's'} still need explicit PCB placement.`);
  if (blockingDrcCount > 0) blockers.push(`${blockingDrcCount} open PCB DRC blocker${blockingDrcCount === 1 ? '' : 's'} must be resolved before electronics handoff.`);
  if (boardComponents.length > 0 && linkedBomCount < boardComponents.length) blockers.push(`${boardComponents.length - linkedBomCount} component${boardComponents.length - linkedBomCount === 1 ? '' : 's'} still need canonical BOM linkage.`);

  let nextStage: ElectronicsWorkflowStageId = 'component-library';
  if (boardComponents.length === 0 || missingFootprintCount > 0) nextStage = 'component-library';
  else if (schematicPlacedCount < boardComponents.length) nextStage = 'schematic-editor';
  else if (!activeBoard || !hasBoardOutline) nextStage = 'board-settings';
  else if (pcbPlacedCount < boardComponents.length) nextStage = 'board-designer';
  else if (blockingDrcCount > 0) nextStage = 'pcb-drc';
  else if (linkedBomCount < boardComponents.length) nextStage = 'bom';
  else nextStage = 'pcb-drc';

  const readyForValidation = boardComponents.length > 0
    && missingFootprintCount === 0
    && schematicPlacedCount === boardComponents.length
    && Boolean(activeBoard)
    && hasBoardOutline
    && pcbPlacedCount === boardComponents.length
    && blockingDrcCount === 0
    && linkedBomCount === boardComponents.length;

  return {
    activeBoardId,
    activeBoardName: activeBoard?.name || null,
    hasBoardOutline,
    componentCount: boardComponents.length,
    schematicPlacedCount,
    pcbPlacedCount,
    netCount: boardNets.length,
    routedNetCount: routedNetNames.size,
    linkedBomCount,
    missingFootprintCount,
    drcFindingCount: openDrcResults.length,
    blockingDrcCount,
    blockers,
    nextStage,
    readyForValidation,
  };
}
