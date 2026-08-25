import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('../components/mechanical/MechanicalDecisionBar.tsx', import.meta.url),
  'utf8',
);

describe('Mechanical decision context subscriptions', () => {
  it('does not subscribe the decision bar to the entire project store', () => {
    expect(source).not.toContain('const project = useProjectStore();');
    expect(source).toContain('useProjectStore((state) => state.mechanicalObjects');
    expect(source).toContain('useProjectStore((state) => state.assemblyLayers');
    expect(source).toContain('useProjectStore((state) => state.boards');
    expect(source).toContain('useProjectStore((state) => state.boardOutlines');
    expect(source).toContain('useProjectStore((state) => state.activeBoardId)');
  });

  it('recomputes board/mechanical decision context only from relevant state changes', () => {
    expect(source).toContain('evaluateMechanicalBoardContext(useProjectStore.getState(), preferredBoardId)');
    expect(source).toContain('[boardOutlines, boards, objects, preferredBoardId]');
    expect(source).toContain('const issues = useMemo(() => validateMechanicalLayout(objects), [objects]);');
  });
});
