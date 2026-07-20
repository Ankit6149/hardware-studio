import { Project, BoardComponent, ProductRequirement, ProductArchitectureNode, FirmwareModule, ValidationTest, NetItem } from '../../types';

export interface ComponentDomainLinks {
  component: BoardComponent;
  architectureNode?: ProductArchitectureNode;
  requirements: ProductRequirement[];
  firmwareModules: FirmwareModule[];
  validationTests: ValidationTest[];
  powerNets: NetItem[];
  signalNets: NetItem[];
}

export interface ImpactAnalysis {
  targetObjectId: string;
  targetObjectType: string;
  affectedRequirements: string[];
  affectedArchitectureNodes: string[];
  affectedComponents: string[];
  affectedNets: string[];
  affectedFirmwareModules: string[];
  affectedValidationTests: string[];
  affectedBlueprintSheets: string[];
  requiresSafetyReview: boolean;
}
