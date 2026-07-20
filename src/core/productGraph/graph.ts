import { Project } from '../../types';
import {
  getRequirementImplementationCoverage,
  getComponentDomainLinks,
  getNetConsumers,
  getProductImpactOfComponentReplacement,
} from './queries';
import { ComponentDomainLinks, ImpactAnalysis } from './relations';

/** Canonical Product Graph query interface for Hardware Studio V1 */
export class ProductGraphEngine {
  constructor(private project: Project) {}

  public getRequirementCoverage() {
    return getRequirementImplementationCoverage(this.project);
  }

  public getComponentLinks(componentId: string): ComponentDomainLinks | null {
    return getComponentDomainLinks(this.project, componentId);
  }

  public getConsumersOfNet(netName: string) {
    return getNetConsumers(this.project, netName);
  }

  public getImpactOfComponentReplacement(componentId: string): ImpactAnalysis {
    return getProductImpactOfComponentReplacement(this.project, componentId);
  }
}
