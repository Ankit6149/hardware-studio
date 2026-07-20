import { Project } from '../../types';
import {
  getRequirementImplementationCoverage,
  getProductSummary,
  getRequirementImpact,
  getArchitectureNodeRelations,
  getComponentDomainLinks,
  getNetConsumers,
  getNetRelations,
  getBoardRelations,
  getFirmwareModuleRelations,
  getValidationRelations,
  getReleaseImpact,
  getProductImpactOfComponentReplacement,
} from './queries';
import { ComponentDomainLinks, ImpactAnalysis } from './relations';

/** Canonical Product Graph query interface for Hardware Studio V1 */
export class ProductGraphEngine {
  constructor(private project: Project) {}

  public getProductSummary() {
    return getProductSummary(this.project);
  }

  public getRequirementCoverage() {
    return getRequirementImplementationCoverage(this.project);
  }

  public getRequirementImpact(requirementId: string) {
    return getRequirementImpact(this.project, requirementId);
  }

  public getArchitectureNodeRelations(nodeId: string) {
    return getArchitectureNodeRelations(this.project, nodeId);
  }

  public getComponentLinks(componentId: string): ComponentDomainLinks | null {
    return getComponentDomainLinks(this.project, componentId);
  }

  public getConsumersOfNet(netName: string) {
    return getNetConsumers(this.project, netName);
  }

  public getNetRelations(netIdOrName: string) {
    return getNetRelations(this.project, netIdOrName);
  }

  public getBoardRelations(boardId: string) {
    return getBoardRelations(this.project, boardId);
  }

  public getFirmwareModuleRelations(moduleId: string) {
    return getFirmwareModuleRelations(this.project, moduleId);
  }

  public getValidationRelations(testId: string) {
    return getValidationRelations(this.project, testId);
  }

  public getReleaseImpact(objectId: string) {
    return getReleaseImpact(this.project, objectId);
  }

  public getImpactOfComponentReplacement(componentId: string): ImpactAnalysis {
    return getProductImpactOfComponentReplacement(this.project, componentId);
  }
}
