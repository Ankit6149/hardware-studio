import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { useStudioContextStore } from '../store/studioContextStore';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Electronics representation cross-probing', () => {
  beforeEach(() => useStudioContextStore.getState().clearContext());

  it('attaches representation selection to existing board, component and net context', () => {
    const store = useStudioContextStore.getState();
    store.select({
      entity: 'component-pin',
      id: 'pin-u1-3',
      label: 'U1.3 SDA',
      boardId: 'board-main',
      componentId: 'component-u1',
      netName: 'I2C_SDA',
    });

    expect(useStudioContextStore.getState()).toMatchObject({
      activeBoardId: 'board-main',
      activeComponentId: 'component-u1',
      activeNetName: 'I2C_SDA',
      selected: {
        entity: 'component-pin',
        id: 'pin-u1-3',
        boardId: 'board-main',
        componentId: 'component-u1',
        netName: 'I2C_SDA',
      },
    });
  });

  it('can change immediate representation without dropping canonical parent component context', () => {
    const store = useStudioContextStore.getState();
    store.setActiveComponent('component-u1');
    store.select({ entity: 'wire', id: 'wire-7', boardId: 'board-main', netName: 'I2C_SDA' });

    expect(useStudioContextStore.getState().activeComponentId).toBe('component-u1');
    expect(useStudioContextStore.getState().selected?.entity).toBe('wire');
    expect(useStudioContextStore.getState().activeNetName).toBe('I2C_SDA');
  });

  it('keeps Schematic cross-probing explicit and visually inspectable', () => {
    const schematic = source('../components/schematic/EngineeringSchematicWorkbench.tsx');

    expect(schematic).not.toContain("boards[0]?.id");
    expect(schematic).toContain("entity: 'wire'");
    expect(schematic).toContain("entity: 'component-pin'");
    expect(schematic).toContain('Pins · select to cross-probe');
    expect(schematic).toContain('selectPin(selectedComponent.id, pin.id)');
    expect(schematic).toContain("netName: pin.netName || null");
  });

  it('keeps PCB pad, trace and via cross-probing inside the existing shared selection model', () => {
    const pcb = source('../components/board/EngineeringBoardWorkbench.tsx');

    expect(pcb).not.toContain('boards[0]?.id');
    expect(pcb).toContain("entity: 'pcb-pad'");
    expect(pcb).toContain("entity: 'trace'");
    expect(pcb).toContain("entity: 'via'");
    expect(pcb).toContain('Pads · select to cross-probe');
    expect(pcb).toContain('selectPad(selectedComponent.id, pad.name)');
    expect(pcb).toContain('assignment?.netName || null');
  });

  it('does not persist representation selection into canonical project storage', () => {
    const projectStore = source('../store/projectStore.ts');
    const contextStore = source('../store/studioContextStore.ts');

    expect(contextStore).toContain("entity: 'component-pin'");
    expect(contextStore).toContain("entity: 'pcb-pad'");
    expect(contextStore).toContain("entity: 'via'");
    expect(projectStore).not.toContain('StudioSelection');
    expect(projectStore).not.toContain('activeComponentDefinitionId');
  });
});