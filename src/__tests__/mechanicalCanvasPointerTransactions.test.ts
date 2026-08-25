import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('../components/mechanical/EngineeringMechanicalCanvas.tsx', import.meta.url),
  'utf8',
);

describe('live Mechanical canvas pointer transaction contract', () => {
  it('uses scoped store subscriptions instead of subscribing to the entire project store', () => {
    expect(source).not.toContain('const store = useProjectStore();');
    expect(source).toContain('useProjectStore((state) => state.mechanicalObjects');
    expect(source).toContain('useProjectStore((state) => state.mechanicalDimensions');
    expect(source).toContain('useProjectStore((state) => state.beginCommand)');
    expect(source).toContain('useProjectStore((state) => state.cancelCommand)');
  });

  it('builds drag previews from the latest canonical Mechanical object list', () => {
    expect(source).toContain('useProjectStore.getState().mechanicalObjects');
    expect(source).toContain('mechanicalObjects: currentObjects.map');
  });

  it('allows Escape to cancel an active Mechanical move transaction', () => {
    expect(source).toContain("event.key !== 'Escape'");
    expect(source).toContain('cancelCommand();');
    expect(source).toContain('setDragging(null);');
    expect(source).toContain("window.addEventListener('keydown', onKeyDown)");
  });
});
