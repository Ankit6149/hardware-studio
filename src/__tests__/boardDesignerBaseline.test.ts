import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const boardDesignerSource = readFileSync(
  resolve(process.cwd(), 'src/components/board/BoardDesigner.tsx'),
  'utf8',
);

describe('Board Designer baseline', () => {
  it('does not synthesize board identity or starter dimensions', () => {
    expect(boardDesignerSource).not.toContain('board-main');
    expect(boardDesignerSource).not.toContain('createStarterBoard');
    expect(boardDesignerSource).not.toContain("dimensionsMm: '50 x 30'");
    expect(boardDesignerSource).toContain("setActiveView('board-settings')");
  });

  it('requires the selected board outline before auto placement', () => {
    expect(boardDesignerSource).toContain("boardOutlines.find((candidate) => candidate.boardId === boardId)");
    expect(boardDesignerSource).toContain('Board outline required');
    expect(boardDesignerSource).toContain('will not place components inside a hidden 50 × 30 mm fallback');
  });

  it('scopes DRC and rough autoroute to the explicit active board', () => {
    expect(boardDesignerSource).toContain("activeBoardId: viewState.activeBoardId || ''");
    expect(boardDesignerSource).toContain('roughAutorouteNet(scopedProject, net.netName, layerId, boardId)');
    expect(boardDesignerSource).toContain('component.boardId === boardId');
  });
});
