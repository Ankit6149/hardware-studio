import type { Project } from '../types';
import { evaluateElectronicsWorkflow } from './electronics/electronicsWorkflow';
import { evaluateFirmwareEvidence } from './firmware/firmwareEvidence';

export type ProjectHomeAreaState = 'Not started' | 'In progress' | 'Evidence present' | 'Ready for review';

export interface ProjectHomeAction {
  eyebrow: string;
  title: string;
  detail: string;
  viewId: string;
  label: string;
}

export interface ProjectHomeArea {
  id: 'define' | 'electronics' | 'mechanical' | 'firmware' | 'validation' | 'release';
  label: string;
  description: string;
  viewId: string;
  state: ProjectHomeAreaState;
  evidence: string;
}

export interface ProjectHomeAttention {
  id: string;
  label: string;
  detail: string;
  viewId: string;
}

export interface ProjectHomeModel {
  nextAction: ProjectHomeAction;
  areas: ProjectHomeArea[];
  attention: ProjectHomeAttention[];
  inventory: {
    requirements: number;
    architecture: number;
    components: number;
    nets: number;
    traces: number;
    mechanicalObjects: number;
    firmwareModules: number;
    validationTests: number;
    validationRuns: number;
    revisions: number;
  };
}

function count<T>(value: T[] | undefined): number {
  return value?.length || 0;
}

function electronicsAction(project: Project): ProjectHomeAction {
  const electronics = evaluateElectronicsWorkflow(project);
  const byStage: Record<typeof electronics.nextStage, Pick<ProjectHomeAction, 'eyebrow' | 'title' | 'label'>> = {
    'component-library': { eyebrow: 'Resolve component identity', title: 'Complete authoritative component data', label: 'Open components' },
    'schematic-editor': { eyebrow: 'Connect the electronics', title: 'Complete schematic placement and connectivity', label: 'Open schematic' },
    'board-settings': { eyebrow: 'Define the physical board', title: 'Create the real PCB boundary', label: 'Open board setup' },
    'board-designer': { eyebrow: 'Place the physical design', title: 'Complete explicit PCB placement', label: 'Open PCB' },
    'pcb-drc': { eyebrow: 'Review PCB evidence', title: 'Resolve blocking PCB findings', label: 'Open DRC' },
    bom: { eyebrow: 'Finish electronics identity', title: 'Link every project component to the BOM', label: 'Open BOM' },
  };
  const copy = byStage[electronics.nextStage];
  return {
    ...copy,
    detail: electronics.blockers[0] || 'Review the current Electronics evidence before planning downstream validation.',
    viewId: electronics.nextStage,
  };
}

export function buildProjectHomeModel(project: Project): ProjectHomeModel {
  const requirements = count(project.requirements);
  const architecture = Math.max(count(project.architectureNodes), count(project.nodes));
  const components = count(project.boardComponents);
  const nets = count(project.nets);
  const traces = count(project.traces);
  const mechanicalObjects = count(project.mechanicalObjects);
  const firmwareModules = count(project.firmwareModules);
  const validationTests = count(project.validationTests);
  const validationRuns = count(project.validationRuns);
  const revisions = count(project.revisions);
  const electronics = evaluateElectronicsWorkflow(project);
  const firmwareEvidence = evaluateFirmwareEvidence(project);

  let nextAction: ProjectHomeAction;
  if (requirements === 0) {
    nextAction = {
      eyebrow: 'Start with intent',
      title: 'Write the first measurable requirement',
      detail: 'Define what the product must achieve before choosing parts or drawing geometry.',
      viewId: 'requirements',
      label: 'Define requirements',
    };
  } else if (architecture === 0) {
    nextAction = {
      eyebrow: 'Define the system',
      title: 'Turn requirements into a simple product architecture',
      detail: 'Describe the major functions, devices, and interfaces that will satisfy the requirements.',
      viewId: 'product-architecture',
      label: 'Build architecture',
    };
  } else if (!electronics.readyForValidation) {
    nextAction = electronicsAction(project);
  } else if (mechanicalObjects === 0) {
    nextAction = {
      eyebrow: 'Package the product',
      title: 'Create the first explicit mechanical design object',
      detail: 'Define physical envelope and assembly intent around the real board. Missing geometry should remain unresolved rather than inferred.',
      viewId: 'mechanical-studio',
      label: 'Open mechanical',
    };
  } else if (firmwareModules === 0) {
    nextAction = {
      eyebrow: 'Bring behavior to hardware',
      title: 'Define the first firmware responsibility',
      detail: 'Create firmware modules against the same canonical component, pin, and net context used by the hardware design.',
      viewId: 'firmware-studio',
      label: 'Open firmware',
    };
  } else if (firmwareEvidence.verificationReadyModuleIds.length < firmwareModules) {
    const firstBlockedModule = (project.firmwareModules || []).find(
      (firmwareModule) => !firmwareEvidence.verificationReadyModuleIds.includes(firmwareModule.id),
    );
    const blocker = firstBlockedModule ? firmwareEvidence.blockersByModuleId[firstBlockedModule.id]?.[0] : undefined;
    nextAction = {
      eyebrow: 'Complete firmware evidence',
      title: 'Connect firmware source, hardware mapping, build, and device evidence',
      detail: blocker || 'At least one firmware module still lacks the evidence required for review.',
      viewId: 'firmware-evidence',
      label: 'Review firmware evidence',
    };
  } else if (validationTests === 0) {
    nextAction = {
      eyebrow: 'Prove the product',
      title: 'Create validation work linked to real requirements',
      detail: 'Author explicit procedures and evidence requirements instead of marking readiness manually.',
      viewId: 'validation-studio',
      label: 'Plan validation',
    };
  } else if (validationRuns === 0) {
    nextAction = {
      eyebrow: 'Capture validation evidence',
      title: 'Record the first validation run',
      detail: 'Test definitions alone are not evidence. Execute a supported check or record an explicit evidence-backed engineering verdict.',
      viewId: 'validation-studio',
      label: 'Open validation',
    };
  } else if (revisions === 0) {
    nextAction = {
      eyebrow: 'Preserve the engineering state',
      title: 'Capture a controlled revision before handoff',
      detail: 'Record a meaningful project state before preparing outputs or release evidence.',
      viewId: 'revisions',
      label: 'Open revisions',
    };
  } else {
    nextAction = {
      eyebrow: 'Review before handoff',
      title: 'Inspect release readiness and unresolved evidence',
      detail: 'Existing evidence—not a progress percentage—decides what can move forward.',
      viewId: 'readiness',
      label: 'Review readiness',
    };
  }

  const areas: ProjectHomeArea[] = [
    {
      id: 'define',
      label: 'Define',
      description: 'Requirements and architecture',
      viewId: requirements === 0 ? 'requirements' : 'product-architecture',
      state: requirements === 0 ? 'Not started' : architecture === 0 ? 'In progress' : 'Evidence present',
      evidence: `${requirements} requirements · ${architecture} architecture items`,
    },
    {
      id: 'electronics',
      label: 'Electronics',
      description: 'Components, schematic, PCB, BOM',
      viewId: electronics.readyForValidation ? 'board-designer' : electronics.nextStage,
      state: components === 0 ? 'Not started' : electronics.readyForValidation ? 'Ready for review' : 'In progress',
      evidence: `${components} components · ${electronics.schematicPlacedCount}/${components} schematic placed · ${electronics.pcbPlacedCount}/${components} PCB placed`,
    },
    {
      id: 'mechanical',
      label: 'Mechanical',
      description: 'Physical design and assembly intent',
      viewId: 'mechanical-studio',
      state: mechanicalObjects === 0 ? 'Not started' : 'In progress',
      evidence: `${mechanicalObjects} explicit mechanical objects`,
    },
    {
      id: 'firmware',
      label: 'Firmware',
      description: 'Behavior, mapping, source, build, device evidence',
      viewId: 'firmware-studio',
      state: firmwareModules === 0
        ? 'Not started'
        : firmwareEvidence.verificationReadyModuleIds.length === firmwareModules
          ? 'Ready for review'
          : 'In progress',
      evidence: `${firmwareModules} modules · ${firmwareEvidence.verificationReadyModuleIds.length} reviewable`,
    },
    {
      id: 'validation',
      label: 'Validate',
      description: 'Test definitions, runs, and evidence',
      viewId: 'validation-studio',
      state: validationTests === 0 ? 'Not started' : validationRuns === 0 ? 'In progress' : 'Evidence present',
      evidence: `${validationTests} tests · ${validationRuns} recorded runs`,
    },
    {
      id: 'release',
      label: 'Release',
      description: 'Revisions, readiness, exact outputs, controlled handoff',
      viewId: 'readiness',
      state: revisions === 0 ? 'Not started' : 'In progress',
      evidence: `${revisions} revisions · release status requires explicit readiness review`,
    },
  ];

  const attention: ProjectHomeAttention[] = [];
  const addAttention = (item: ProjectHomeAttention) => {
    if (!attention.some((candidate) => candidate.id === item.id)) attention.push(item);
  };

  if (requirements === 0) {
    addAttention({ id: 'requirements-missing', label: 'Product intent is not measurable yet', detail: 'Create at least one measurable requirement.', viewId: 'requirements' });
  } else if (architecture === 0) {
    addAttention({ id: 'architecture-missing', label: 'Requirements have no architecture yet', detail: 'Describe the functions, devices, and interfaces that satisfy the current requirements.', viewId: 'product-architecture' });
  }

  electronics.blockers.slice(0, 3).forEach((blocker, index) => {
    addAttention({ id: `electronics-${index}`, label: 'Electronics needs attention', detail: blocker, viewId: electronics.nextStage });
  });

  if (electronics.readyForValidation && mechanicalObjects === 0) {
    addAttention({ id: 'mechanical-missing', label: 'Physical design has not started', detail: 'Create explicit enclosure or assembly geometry around the real board.', viewId: 'mechanical-studio' });
  }

  if (firmwareModules > 0 && firmwareEvidence.verificationReadyModuleIds.length < firmwareModules) {
    const firstBlockedModule = (project.firmwareModules || []).find(
      (firmwareModule) => !firmwareEvidence.verificationReadyModuleIds.includes(firmwareModule.id),
    );
    const blocker = firstBlockedModule ? firmwareEvidence.blockersByModuleId[firstBlockedModule.id]?.[0] : undefined;
    addAttention({
      id: 'firmware-evidence',
      label: 'Firmware evidence is incomplete',
      detail: blocker || `${firmwareModules - firmwareEvidence.verificationReadyModuleIds.length} module(s) still need review evidence.`,
      viewId: 'firmware-evidence',
    });
  }

  if (firmwareModules > 0 && validationTests === 0) {
    addAttention({ id: 'validation-missing', label: 'No validation plan exists', detail: 'Create validation work linked to the current engineering requirements and evidence.', viewId: 'validation-studio' });
  }

  if (validationTests > 0 && validationRuns === 0) {
    addAttention({ id: 'validation-runs-missing', label: 'Validation definitions have no run evidence', detail: 'Execute a supported check or record an explicit evidence-backed engineering verdict.', viewId: 'validation-studio' });
  }

  return {
    nextAction,
    areas,
    attention: attention.slice(0, 5),
    inventory: {
      requirements,
      architecture,
      components,
      nets,
      traces,
      mechanicalObjects,
      firmwareModules,
      validationTests,
      validationRuns,
      revisions,
    },
  };
}
