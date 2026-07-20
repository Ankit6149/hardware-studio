import { describe, it, expect } from 'vitest';
import { ProductGraphEngine } from '../core/productGraph/graph';
import { Project } from '../types';

describe('Canonical Product Graph Query Layer Tests', () => {
  const sampleProject: Project = {
    id: 'p_graph_test',
    projectName: 'Graph Test Project',
    description: '',
    createdAt: '',
    updatedAt: '',
    version: '5',
    activeView: 'dashboard',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    requirements: [
      {
        id: 'r1', title: 'Main Battery Life', description: 'Run for 24 hours', type: 'Electrical',
        priority: 'Critical', status: 'Approved', acceptanceCriteria: [],
        linkedArchitectureNodeIds: ['n1'], linkedComponentIds: ['c1'], linkedFirmwareModuleIds: [], linkedTestIds: ['t1'], risks: []
      }
    ],
    architectureNodes: [
      {
        id: 'n1', name: 'Power Regulation Subsystem', category: 'Power', description: '',
        x: 0, y: 0, width: 100, height: 50,
        linkedRequirementIds: ['r1'], linkedCircuitIds: [], linkedComponentIds: ['c1'], linkedFirmwareModuleIds: ['m1'], linkedTestIds: ['t1'], status: 'MVP'
      }
    ],
    boardComponents: [
      {
        id: 'c1', boardId: 'b1', circuitBlockId: 'cb1', referenceDesignator: 'U1', componentName: 'LDO Regulator', componentType: 'Power', value: '3.3V', packageName: 'SOT-23', footprint: 'SOT-23-5', partNumber: 'TPS73633', quantity: 1, side: 'Top', placementCriticality: 'High', notes: '',
        pins: [
          { id: 'p1', componentId: 'c1', pinNumber: '1', pinName: 'VIN', electricalType: 'Power', netName: 'VBAT' },
          { id: 'p2', componentId: 'c1', pinNumber: '2', pinName: 'VOUT', electricalType: 'Power', netName: '3V3' }
        ]
      }
    ],
    nets: [
      { id: 'n_vbat', netName: 'VBAT', netType: 'Power', voltage: '3.7V', sourceComponent: 'BATT', sourcePin: '1', targetComponent: 'U1', targetPin: '1', protocol: 'Power', currentEstimate: '200mA', impedanceRequirement: '', notes: '' },
      { id: 'n_3v3', netName: '3V3', netType: 'Power', voltage: '3.3V', sourceComponent: 'U1', sourcePin: '2', targetComponent: 'MCU', targetPin: '1', protocol: 'Power', currentEstimate: '150mA', impedanceRequirement: '', notes: '' }
    ],
    firmwareModules: [
      {
        id: 'm1', name: 'PowerManager', type: 'Power', description: 'Manages sleep states',
        linkedArchitectureNodeIds: ['n1'], linkedComponentIds: ['c1'], linkedPinIds: [], linkedNetIds: ['n_3v3'], linkedTestIds: ['t1'], dependencies: [], sourceFiles: [], status: 'Implemented'
      }
    ],
    validationTests: [
      {
        id: 't1', name: 'Power Rail Test', stage: 'EVT', category: 'Power',
        linkedRequirementIds: ['r1'], linkedArchitectureNodeIds: ['n1'], linkedComponentIds: ['c1'], linkedNetIds: ['n_3v3'], linkedFirmwareModuleIds: ['m1'], steps: [], measurements: [], passCriteria: [], status: 'Passed', evidence: []
      }
    ]
  };

  it('should query requirement coverage and compute correct status', () => {
    const graph = new ProductGraphEngine(sampleProject);
    const coverage = graph.getRequirementCoverage();
    expect(coverage).toHaveLength(1);
    expect(coverage[0].title).toBe('Main Battery Life');
    expect(coverage[0].status).toBe('Covered');
  });

  it('should retrieve full domain links for a component', () => {
    const graph = new ProductGraphEngine(sampleProject);
    const links = graph.getComponentLinks('c1');
    expect(links).not.toBeNull();
    expect(links?.component.referenceDesignator).toBe('U1');
    expect(links?.architectureNode?.name).toBe('Power Regulation Subsystem');
    expect(links?.requirements[0].title).toBe('Main Battery Life');
    expect(links?.firmwareModules[0].name).toBe('PowerManager');
    expect(links?.validationTests[0].name).toBe('Power Rail Test');
  });

  it('should find net consumers for VBAT and 3V3', () => {
    const graph = new ProductGraphEngine(sampleProject);
    const consumers = graph.getConsumersOfNet('3V3');
    expect(consumers).toHaveLength(1);
    expect(consumers[0].component.referenceDesignator).toBe('U1');
    expect(consumers[0].pinName).toBe('VOUT');
  });

  it('should compute impact analysis when replacing a component', () => {
    const graph = new ProductGraphEngine(sampleProject);
    const impact = graph.getImpactOfComponentReplacement('c1');
    expect(impact.targetObjectId).toBe('c1');
    expect(impact.affectedRequirements).toContain('Main Battery Life');
    expect(impact.affectedNets).toContain('3V3');
    expect(impact.requiresSafetyReview).toBe(true);
  });
});
