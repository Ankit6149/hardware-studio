import { Project, BoardComponent, ProductRequirement, ProductArchitectureNode, FirmwareModule, ValidationTest, NetItem } from '../../types';
import { ComponentDomainLinks, ImpactAnalysis } from './relations';

/** Retrieve requirement implementation coverage across architecture, components, firmware, and tests */
export function getRequirementImplementationCoverage(project: Project) {
  const requirements = project.requirements || [];
  const archNodes = project.architectureNodes || [];
  const components = project.boardComponents || [];
  const tests = project.validationTests || [];

  return requirements.map((req) => {
    const linkedArch = archNodes.filter((n) => (n.linkedRequirementIds || []).includes(req.id));
    const linkedComps = components.filter((c) => (req.linkedComponentIds || []).includes(c.id));
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
