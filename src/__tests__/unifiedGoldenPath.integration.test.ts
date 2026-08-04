import { beforeEach, describe, expect, it } from 'vitest';
import { defaultComponents } from '../lib/components/componentLibrary';
import { normalizeProjectComponent } from '../lib/projectMigrations';
import { useProjectStore } from '../store/projectStore';
import { useStudioContextStore } from '../store/studioContextStore';
import type { BOMItem } from '../types';

describe('unified Electronics → PCB → BOM → Validation golden path', () => {
  beforeEach(() => {
    const state = useProjectStore.getState();
    useProjectStore.setState({
      ...state,
      boards: [],
      activeBoardId: '',
      boardOutlines: [],
      boardComponents: [],
      schematicWires: [],
      nets: [],
      padNetAssignments: [],
      traces: [],
      bom: [],
      validationTests: [],
      reviewResults: [],
      pastCommands: [],
      futureCommands: [],
    });
    useStudioContextStore.getState().clearContext();
  });

  it('keeps one canonical identity through schematic, PCB, BOM, and validation', () => {
    const store = useProjectStore.getState();
    const definitions = defaultComponents.filter((definition) => definition.pins.length > 0).slice(0, 2);
    expect(definitions).toHaveLength(2);

    const board = store.addBoard({
      name: 'Golden Path Board',
      boardType: 'Main PCB',
      dimensionsMm: '60 x 40',
      layerCount: 2,
      substrate: 'FR4',
      status: 'In Layout',
    });
    store.updateProjectState({
      activeBoardId: board.id,
      boardOutlines: [{
        id: `outline_${board.id}`,
        boardId: board.id,
        points: [{ x: 0, y: 0 }, { x: 60, y: 0 }, { x: 60, y: 40 }, { x: 0, y: 40 }],
        width: 60,
        height: 40,
        units: 'mm',
        notes: 'Integration-test board outline.',
      }],
    });

    const source = store.addProjectComponentFromLibrary(definitions[0], board.id);
    const target = store.addProjectComponentFromLibrary(definitions[1], board.id);

    expect(source).toMatchObject({
      libraryId: definitions[0].libraryId,
      packageName: definitions[0].packageName,
      footprint: definitions[0].footprintName,
      manufacturer: definitions[0].manufacturer,
    });
    expect(target.libraryId).toBe(definitions[1].libraryId);

    store.placeComponentOnSchematic(source.id, 120, 160);
    store.placeComponentOnSchematic(target.id, 360, 160);

    const sourcePin = definitions[0].pins[0].number;
    const targetPin = definitions[1].pins[0].number;
    const connection = store.connectComponentPins(
      source.id,
      sourcePin,
      target.id,
      targetPin,
      'GOLDEN_SIGNAL',
      [{ x: 180, y: 160 }, { x: 300, y: 160 }],
    );

    store.placeComponentOnBoard(source.id, 12, 16, 'Top');
    store.placeComponentOnBoard(target.id, 36, 16, 'Top');

    const bomId = `bom_${source.id}`;
    const bomItem: BOMItem = {
      id: bomId,
      blockName: source.componentName,
      candidateComponent: source.value || source.componentName,
      partNumber: source.partNumber,
      stage: 'Prototype',
      quantity: 1,
      voltage: '',
      currentEstimate: '',
      interface: '',
      packageSize: source.footprint,
      dimensions: '',
      costEstimate: '0.00',
      supplier: source.supplier || '',
      supplierUrl: '',
      datasheetUrl: source.datasheetUrl || '',
      status: 'Not Started',
      risk: '',
      alternative: '',
      notes: `Linked to ${source.id}`,
    };
    store.updateProjectState({ bom: [bomItem] });
    store.updateProjectComponent(source.id, { bomItemId: bomId });

    store.addValidationTest({
      name: `${source.referenceDesignator} connectivity validation`,
      stage: 'EVT',
      category: 'Electrical',
      linkedRequirementIds: [],
      linkedArchitectureNodeIds: [],
      linkedComponentIds: [source.id],
      linkedNetIds: [connection.net.id],
      linkedFirmwareModuleIds: [],
      steps: [{
        stepNumber: 1,
        instruction: 'Verify the selected component and GOLDEN_SIGNAL connection.',
        expectedResult: 'The canonical component and net are present in schematic and PCB state.',
        completed: false,
      }],
      measurements: [],
      passCriteria: ['Canonical IDs and net continuity match the project graph.'],
      status: 'Not Started',
      evidence: [],
    });

    const finalState = useProjectStore.getState();
    const finalSource = finalState.boardComponents?.find((component) => component.id === source.id);
    const finalTarget = finalState.boardComponents?.find((component) => component.id === target.id);

    expect(finalSource).toMatchObject({
      id: source.id,
      boardId: board.id,
      libraryId: definitions[0].libraryId,
      packageName: definitions[0].packageName,
      footprint: definitions[0].footprintName,
      manufacturer: definitions[0].manufacturer,
      bomItemId: bomId,
      schematic: expect.objectContaining({ placed: true }),
      pcb: expect.objectContaining({ placed: true, xMm: 12, yMm: 16, side: 'Top' }),
    });
    expect(finalTarget).toMatchObject({
      id: target.id,
      boardId: board.id,
      libraryId: definitions[1].libraryId,
      schematic: expect.objectContaining({ placed: true }),
      pcb: expect.objectContaining({ placed: true, xMm: 36, yMm: 16, side: 'Top' }),
    });
    expect(finalSource?.pins?.find((pin) => pin.pinNumber === sourcePin)?.netName).toBe('GOLDEN_SIGNAL');
    expect(finalTarget?.pins?.find((pin) => pin.pinNumber === targetPin)?.netName).toBe('GOLDEN_SIGNAL');
    expect(finalState.schematicWires?.find((wire) => wire.id === connection.wire.id)).toMatchObject({
      netId: connection.net.id,
      netName: 'GOLDEN_SIGNAL',
      sourceAnchor: expect.objectContaining({ componentId: source.id, pinNumber: sourcePin }),
      targetAnchor: expect.objectContaining({ componentId: target.id, pinNumber: targetPin }),
    });
    expect(finalState.nets?.find((net) => net.id === connection.net.id)?.netName).toBe('GOLDEN_SIGNAL');
    expect(finalState.bom?.[0]).toMatchObject({ id: bomId, blockName: source.componentName });
    expect(finalState.validationTests?.[0]).toMatchObject({
      linkedComponentIds: [source.id],
      linkedNetIds: [connection.net.id],
      status: 'Not Started',
    });
  });

  it('preserves optional representation and CAD metadata while normalizing legacy pins', () => {
    const normalized = normalizeProjectComponent({
      id: 'comp_legacy_sensor',
      libraryId: 'sensor-reviewed-v3',
      referenceDesignator: 'U7',
      componentName: 'Qualified Sensor',
      componentType: 'Sensor',
      value: 'SENSOR-X',
      boardId: 'board_main',
      circuitBlockId: 'block_sensing',
      packageName: 'LGA-12',
      footprint: 'LGA-12_2.5x3.0mm',
      manufacturer: 'Example Devices',
      footprintSvg: '<svg viewBox="0 0 100 100"></svg>',
      packageDimensions: { widthMm: 3, heightMm: 2.5, heightZMm: 0.8 },
      symbolRevisionId: 'symbol-rev-3',
      footprintRevisionId: 'footprint-rev-5',
      cadModelRevisionId: 'cad-rev-2',
      model3dUrl: '/models/sensor-x.glb',
      sourceLicense: 'Reviewed vendor distribution terms',
      qualificationStatus: 'Reviewed',
      pins: [{
        number: '1',
        name: 'VDD',
        electricalType: 'PowerIn',
        required: true,
        voltage: 3.3,
        protocol: 'Power',
        notes: 'Qualified supply pin.',
      }],
    });

    expect(normalized).toMatchObject({
      id: 'comp_legacy_sensor',
      libraryId: 'sensor-reviewed-v3',
      manufacturer: 'Example Devices',
      footprintSvg: '<svg viewBox="0 0 100 100"></svg>',
      packageDimensions: { widthMm: 3, heightMm: 2.5, heightZMm: 0.8 },
      symbolRevisionId: 'symbol-rev-3',
      footprintRevisionId: 'footprint-rev-5',
      cadModelRevisionId: 'cad-rev-2',
      model3dUrl: '/models/sensor-x.glb',
      sourceLicense: 'Reviewed vendor distribution terms',
      qualificationStatus: 'Reviewed',
    });
    expect(normalized.pins).toEqual([
      expect.objectContaining({
        componentId: 'comp_legacy_sensor',
        pinNumber: '1',
        pinName: 'VDD',
        electricalType: 'PowerIn',
        required: true,
        voltage: 3.3,
        protocol: 'Power',
        notes: 'Qualified supply pin.',
      }),
    ]);
  });
});
