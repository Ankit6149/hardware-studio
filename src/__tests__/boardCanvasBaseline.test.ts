import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const boardCanvasSource = readFileSync(
  resolve(process.cwd(), 'src/components/board/BoardCanvas.tsx'),
  'utf8',
);

describe('PCB canvas baseline guards', () => {
  it('never falls back to a synthetic board identity', () => {
    expect(boardCanvasSource).not.toContain("'board-main'");
    expect(boardCanvasSource).not.toContain('"board-main"');
    expect(boardCanvasSource).toContain('requireActiveBoard');
    expect(boardCanvasSource).toContain('Select or create a real PCB board before editing layout data.');
  });

  it('uses the shared feedback system instead of browser alert dialogs', () => {
    expect(boardCanvasSource).not.toContain('alert(');
    expect(boardCanvasSource).toContain('useFeedback');
    expect(boardCanvasSource).toContain('PCB state persisted');
  });

  it('renders and selects board-scoped physical entities only', () => {
    expect(boardCanvasSource).toContain('filteredComponents');
    expect(boardCanvasSource).toContain('filteredTraces');
    expect(boardCanvasSource).toContain('filteredVias');
    expect(boardCanvasSource).toContain('filteredDrills');
    expect(boardCanvasSource).toContain('filteredKeepouts');
    expect(boardCanvasSource).not.toContain('filteredOutlines[0] ||');
  });
});
