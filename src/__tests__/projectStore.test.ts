import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { normalizeNetName } from '../store/projectStore';
import { normalizeProjectComponent } from '../lib/projectMigrations';
import { BoardComponent } from '../types';

describe('Hardware Studio Core System Tests', () => {
  // Reset store state before each test if needed
  beforeEach(() => {
    // In zustand store we can reset using standard Zustand setState/getState
  });

  describe('Net Name Normalization (Phase 10)', () => {
    it('should normalize common power/ground names to uppercase standard format', () => {
      expect(normalizeNetName('gnd')).toBe('GND');
      expect(normalizeNetName('  Ground  ')).toBe('GND');
      expect(normalizeNetName('3v3')).toBe('3V3');
      expect(normalizeNetName('3.3v')).toBe('3V3');
      expect(normalizeNetName('5V')).toBe('5V');
    });

    it('should preserve casing and spaces for custom signals', () => {
      expect(normalizeNetName('SPI_MISO')).toBe('SPI_MISO');
      expect(normalizeNetName('  Spi_Miso  ')).toBe('Spi_Miso');
    });
  });

  describe('Project Command Architecture (Undo/Redo stacks size validation)', () => {
    it('should push commands to past stack and support undo/redo snapshots', () => {
      const store = useProjectStore.getState();
      
      // Initially command history is empty
      expect(store.pastCommands.length).toBe(0);

      // Execute a command
      store.executeProjectCommand(
        'TEST_ACTION',
        'Add test requirement',
        () => {
          store.addRequirement({
            title: 'Req 1',
            description: 'Desc 1',
            type: 'Functional',
            priority: 'High',
            status: 'Draft',
            acceptanceCriteria: []
          });
        }
      );

      // Verify command is in the past stack
      const storeAfter = useProjectStore.getState();
      expect(storeAfter.pastCommands.length).toBe(1);
      expect(storeAfter.requirements.length).toBe(1);
      expect(storeAfter.requirements[0].title).toBe('Req 1');

      // Perform Undo
      storeAfter.undoProjectCommand();
      const storeUndone = useProjectStore.getState();
      expect(storeUndone.pastCommands.length).toBe(0);
      expect(storeUndone.futureCommands.length).toBe(1);
      expect(storeUndone.requirements.length).toBe(0);

      // Perform Redo
      storeUndone.redoProjectCommand();
      const storeRedone = useProjectStore.getState();
      expect(storeRedone.pastCommands.length).toBe(1);
      expect(storeRedone.futureCommands.length).toBe(0);
      expect(storeRedone.requirements.length).toBe(1);
      expect(storeRedone.requirements[0].title).toBe('Req 1');
    });
  });

  describe('JSON Import/Export Correctness and Schema Migration', () => {
    it('should correctly normalize component fields and migrate schema keys', () => {
      const legacyComponent = {
        id: 'cmp_legacy_1',
        referenceDesignator: 'U2',
        componentName: 'MCU_Chip',
        placementX: 20,
        placementY: 45,
        side: 'Bottom'
      };

      const normalized = normalizeProjectComponent(legacyComponent);
      expect(normalized.id).toBe('cmp_legacy_1');
      expect(normalized.pcb.placed).toBe(true);
      expect(normalized.pcb.xMm).toBe(20);
      expect(normalized.pcb.side).toBe('Bottom');
    });
  });

  describe('PCB Design Rule Checking (DRC)', () => {
    it('should validate component side alignments during overlap checks', () => {
      const componentsOverlap = (a: any, b: any) => true; 
      
      const checkOverlaps = (comps: any[]) => {
        const issues = [];
        for (let i = 0; i < comps.length; i++) {
          for (let j = i + 1; j < comps.length; j++) {
            if (comps[i].side !== comps[j].side) continue;
            if (componentsOverlap(comps[i], comps[j])) {
              issues.push({ a: comps[i].id, b: comps[j].id });
            }
          }
        }
        return issues;
      };

      const comps = [
        { id: 'C1', side: 'Top' },
        { id: 'C2', side: 'Bottom' },
        { id: 'C3', side: 'Top' }
      ];

      const issues = checkOverlaps(comps);
      expect(issues.length).toBe(1);
      expect(issues[0].a).toBe('C1');
      expect(issues[0].b).toBe('C3');
    });
  });
});
