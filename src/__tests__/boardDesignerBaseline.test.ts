import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const boardDesignerSource = readFileSync(
  resolve(process.cwd(), 'src/components/board/BoardDesigner.tsx'),
  'utf8',
);

describe('Board Designer compatibility baseline', () => {
  it('does not keep a second PCB implementation alive behind the historical export', () => {
    expect(boardDesignerSource).toContain("import { EngineeringBoardWorkbench } from './EngineeringBoardWorkbench';");
    expect(boardDesignerSource).toContain('export const BoardDesigner: React.FC = () => <EngineeringBoardWorkbench />;');
    expect(boardDesignerSource).not.toContain('roughAutorouteNet');
    expect(boardDesignerSource).not.toContain('autoPlaceComponents');
    expect(boardDesignerSource).not.toContain('boards[0]');
    expect(boardDesignerSource).not.toContain('<BoardCanvas');
    expect(boardDesignerSource).not.toContain('<BoardInspector');
    expect(boardDesignerSource).not.toContain('<BoardDRCPanel');
  });
});
