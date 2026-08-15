import type { Project } from '../../types';

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
  blockers: string[];
  nextStage: ElectronicsWorkflowStageId;
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

  const blockers: string[] = [];
  if (!activeBoard) blockers.push('Define a real board before PCB placement or routing.');
  if (activeBoard && !hasBoardOutline) blockers.push('Record the selected board outline before physical layout.');
  if (boardComponents.length === 0) blockers.push('Add at least one canonical project component from the library.');
  const missingFootprints = boardComponents.filter((component) => !component.footprint || !component.packageName).length;
  if (missingFootprints > 0) blockers.push(`${missingFootprints} component${missingFootprints === 1 ? '' : 's'} still lack authoritative footprint/package data.`);

  let nextStage: ElectronicsWorkflowStageId = 'component-library';
  if (boardComponents.length > 0 && schematicPlacedCount < boardComponents.length) nextStage = 'schematic-editor';
  else if (boardComponents.length > 0 && !activeBoard) nextStage = 'board-settings';
  else if (activeBoard && !hasBoardOutline) nextStage = 'board-settings';
  else if (boardComponents.length > 0 && pcbPlacedCount < boardComponents.length) nextStage = 'board-designer';
  else if (boardComponents.length > 0 && pcbPlacedCount === boardComponents.length) nextStage = 'pcb-drc';
  if (boardComponents.length > 0 && linkedBomCount < boardComponents.length && pcbPlacedCount === boardComponents.length) nextStage = 'bom';

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
    blockers,
    nextStage,
  };
}
