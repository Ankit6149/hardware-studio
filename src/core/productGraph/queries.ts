import { Project, BoardComponent } from '../../types';
import { ComponentDomainLinks, ImpactAnalysis } from './relations';

/** Retrieve requirement implementation coverage across architecture, components, firmware, and tests */
export function getRequirementImplementationCoverage(project: Project) {
  const requirements = project.requirements || [];
  const archNodes = project.architectureNodes || [];
  const components = project.boardComponents || [];
  const tests = project.validationTests || [];

  return requirements.map((req) => {
    const linkedArch = archNodes.filter((n) => (n.linkedRequirementIds || []).includes(req.id));
    const linkedComps = components.filter((c) => (req.linkedComponentIds || []).includes(req.id));
    const linkedTests = tests.filter((t) => (t.linkedRequirementIds || []).includes(req.id));
    const passedTests = linkedTests.filter((t) => t.status === 'Passed');

    let status: 'Covered' | 'Partially Covered' | 'Not Covered' | 'Failed' = 'Not Covered';
    if (linkedTests.some((t) => t.status === 'Failed')) {
      status = 'Failed';
    } else if (linkedTests.length > 0 && passedTests.length === linkedTests.length && linkedArch.length > 0) {
      status = 'Covered';
    } else if (linkedArch.length > 0 || linkedComps.length > 0 || linkedTests.length > 0) {
      status = 'Partially Covered';
    }

    return {
      requirementId: req.id,
      title: req.title,
      priority: req.priority,
      status,
      architectureNodeCount: linkedArch.length,
      componentCount: linkedComps.length,
      testCount: linkedTests.length,
      passedTestCount: passedTests.length,
    };
  });
}

/** Retrieve high level summary of all project domain collections */
export function getProductSummary(project: Project) {
  return {
    id: project.id,
    projectName: project.projectName,
    schemaVersion: project.schemaVersion || 5,
    productVersion: project.productVersion || '1.0.0',
    requirementCount: (project.requirements || []).length,
    architectureNodeCount: (project.architectureNodes || []).length,
    mechanicalObjectCount: (project.mechanicalObjects || []).length,
    componentCount: (project.boardComponents || []).length,
    netCount: (project.nets || []).length,
    boardCount: (project.boards || []).length,
    firmwareModuleCount: (project.firmwareModules || []).length,
    validationTestCount: (project.validationTests || []).length,
  };
}

/** Retrieve impact for a requirement */
export function getRequirementImpact(project: Project, requirementId: string) {
  const req = (project.requirements || []).find(r => r.id === requirementId);
  const archNodes = (project.architectureNodes || []).filter(n => (n.linkedRequirementIds || []).includes(requirementId));
  const components = (project.boardComponents || []).filter(c => (req?.linkedComponentIds || []).includes(c.id));
  const tests = (project.validationTests || []).filter(t => (t.linkedRequirementIds || []).includes(requirementId));

  return {
    requirement: req || null,
    architectureNodes: archNodes,
    components,
    validationTests: tests,
  };
}

/** Retrieve relations for an architecture node */
export function getArchitectureNodeRelations(project: Project, nodeId: string) {
  const node = (project.architectureNodes || []).find(n => n.id === nodeId);
  const requirements = (project.requirements || []).filter(r => (node?.linkedRequirementIds || []).includes(r.id));
  const components = (project.boardComponents || []).filter(c => (node?.linkedComponentIds || []).includes(c.id) || c.architectureNodeId === nodeId);
  const firmwareModules = (project.firmwareModules || []).filter(m => (node?.linkedFirmwareModuleIds || []).includes(m.id));

  return {
    node: node || null,
    requirements,
    components,
    firmwareModules,
  };
}

/** Retrieve all domain links for a given component instance */
export function getComponentDomainLinks(project: Project, componentId: string): ComponentDomainLinks | null {
  const component = (project.boardComponents || []).find((c) => c.id === componentId);
  if (!component) return null;

  const archNode = (project.architectureNodes || []).find(
    (n) => (n.linkedComponentIds || []).includes(componentId) || n.id === component.architectureNodeId
  );
  const requirements = (project.requirements || []).filter((r) =>
    (r.linkedComponentIds || []).includes(componentId)
  );
  const firmwareModules = (project.firmwareModules || []).filter((m) =>
    (m.linkedComponentIds || []).includes(componentId)
  );
  const validationTests = (project.validationTests || []).filter((t) =>
    (t.linkedComponentIds || []).includes(componentId)
  );
  const nets = project.nets || [];
  const compNets = (component.pins || [])
    .map((p) => p.netName)
    .filter(Boolean);
  const powerNets = nets.filter((n) => compNets.includes(n.netName) && n.netType === 'Power');
  const signalNets = nets.filter((n) => compNets.includes(n.netName) && n.netType !== 'Power');

  return {
    component,
    architectureNode: archNode,
    requirements,
    firmwareModules,
    validationTests,
    powerNets,
    signalNets,
  };
}

/** Retrieve all component consumers connected to a specific net */
export function getNetConsumers(project: Project, netName: string): { component: BoardComponent; pinNumber: string; pinName: string }[] {
  const results: { component: BoardComponent; pinNumber: string; pinName: string }[] = [];
  const normalizedSearch = netName.trim().toUpperCase();

  for (const comp of project.boardComponents || []) {
    for (const pin of comp.pins || []) {
      if ((pin.netName || '').trim().toUpperCase() === normalizedSearch) {
        results.push({
          component: comp,
          pinNumber: pin.pinNumber,
          pinName: pin.pinName,
        });
      }
    }
  }

  return results;
}

/** Retrieve net relations */
export function getNetRelations(project: Project, netIdOrName: string) {
  const net = (project.nets || []).find(n => n.id === netIdOrName || n.netName === netIdOrName);
  const consumers = net ? getNetConsumers(project, net.netName) : [];

  return {
    net: net || null,
    consumers,
  };
}

/** Retrieve board relations */
export function getBoardRelations(project: Project, boardId: string) {
  const board = (project.boards || []).find(b => b.id === boardId);
  const components = (project.boardComponents || []).filter(c => c.boardId === boardId);
  const outlines = (project.boardOutlines || []).filter(o => o.boardId === boardId);
  const traces = (project.traces || []).filter(t => t.boardId === boardId);

  return {
    board: board || null,
    components,
    outlines,
    traces,
  };
}

/** Retrieve firmware module relations */
export function getFirmwareModuleRelations(project: Project, moduleId: string) {
  const module = (project.firmwareModules || []).find(m => m.id === moduleId);
  const states = (project.firmwareStates || []).filter(s => (s.linkedModuleIds || []).includes(moduleId));
  const tests = (project.validationTests || []).filter(t => (t.linkedFirmwareModuleIds || []).includes(moduleId));

  return {
    module: module || null,
    states,
    validationTests: tests,
  };
}

/** Retrieve validation relations */
export function getValidationRelations(project: Project, testId: string) {
  const test = (project.validationTests || []).find(t => t.id === testId);
  const requirements = (project.requirements || []).filter(r => (test?.linkedRequirementIds || []).includes(r.id));
  const components = (project.boardComponents || []).filter(c => (test?.linkedComponentIds || []).includes(c.id));

  return {
    test: test || null,
    requirements,
    components,
  };
}

/** Retrieve release impact for an object */
export function getReleaseImpact(project: Project, objectId: string) {
  return getProductImpactOfComponentReplacement(project, objectId);
}

/** Calculate cross-domain impact if a component or node is modified/replaced */
export function getProductImpactOfComponentReplacement(project: Project, componentId: string): ImpactAnalysis {
  const compLinks = getComponentDomainLinks(project, componentId);

  const affectedRequirements = (compLinks?.requirements || []).map((r) => r.title);
  const affectedArchNode = compLinks?.architectureNode ? [compLinks.architectureNode.name] : [];
  const affectedNets = [
    ...(compLinks?.powerNets || []).map((n) => n.netName),
    ...(compLinks?.signalNets || []).map((n) => n.netName),
  ];
  const affectedFirmware = (compLinks?.firmwareModules || []).map((m) => m.name);
  const affectedTests = (compLinks?.validationTests || []).map((t) => t.name);

  const isSafetyCritical =
    compLinks?.component.placementCriticality === 'High' ||
    compLinks?.requirements.some((r) => r.type === 'Safety' || r.priority === 'Critical');

  const affectedBlueprintSheets = [
    'Component Library Summary',
    'Schematic',
    'Electrical Nets',
    'PCB Placement',
    'BOM',
    ...(affectedFirmware.length > 0 ? ['Firmware Hardware Mapping'] : []),
    ...(affectedTests.length > 0 ? ['Validation Plan'] : []),
  ];

  return {
    targetObjectId: componentId,
    targetObjectType: 'Component',
    affectedRequirements,
    affectedArchitectureNodes: affectedArchNode,
    affectedComponents: [componentId],
    affectedNets,
    affectedFirmwareModules: affectedFirmware,
    affectedValidationTests: affectedTests,
    affectedBlueprintSheets,
    requiresSafetyReview: !!isSafetyCritical,
  };
}
