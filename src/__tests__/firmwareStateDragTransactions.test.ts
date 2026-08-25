import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('../components/firmware/FirmwareStateMachineCanvas.tsx', import.meta.url),
  'utf8',
);

describe('Firmware state-machine drag transactions', () => {
  it('uses scoped project subscriptions and latest firmware state during drag preview', () => {
    expect(source).not.toContain('const store = useProjectStore();');
    expect(source).toContain('useProjectStore((state) => state.firmwareStates');
    expect(source).toContain('useProjectStore((state) => state.firmwareTransitions');
    expect(source).toContain('useProjectStore.getState().firmwareStates');
    expect(source).toContain('updateTransientPreview({ firmwareStates: updatedStates })');
  });

  it('previews throughout the drag and commits only once on drag stop', () => {
    expect(source).toContain('onNodeDragStart={onNodeDragStart}');
    expect(source).toContain('onNodeDragStop={onNodeDragStop}');
    expect(source).toContain("beginCommand('MOVE_STATE', 'Move firmware state')");
    expect(source).toContain('if (dragChangedRef.current) commitCommand();');
    expect(source).not.toContain('if (change.type === \'position\' && change.position && !change.dragging)');
  });

  it('cancels an active drag on Escape and ignores later preview/drag-stop work', () => {
    expect(source).toContain("event.key !== 'Escape' || !draggingRef.current");
    expect(source).toContain('cancelCommand();');
    expect(source).toContain('draggingRef.current = false;');
    expect(source).toContain('if (!draggingRef.current) return;');
  });
});
