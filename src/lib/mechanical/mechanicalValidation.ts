import { MechanicalObject } from '../../types';
import { getMechanicalBoundingBox, isMechanicalObjectContained, mechanicalObjectsOverlap } from './mechanicalGeometry';

export interface MechanicalValidationIssue {
  severity: 'Error' | 'Warning' | 'Info';
  objectId?: string;
  objectIds?: string[];
  message: string;
}

/** Validate a set of mechanical objects for design issues */
export function validateMechanicalLayout(
  objects: MechanicalObject[]
): MechanicalValidationIssue[] {
  const issues: MechanicalValidationIssue[] = [];

  const outerProfiles = objects.filter(o => o.type === 'Outer Profile');
  const boardZones = objects.filter(o => o.type === 'Board Zone');
  const batteryCavities = objects.filter(o => o.type === 'Battery Cavity');
  const connectorOpenings = objects.filter(o => o.type === 'Connector Opening');
  const mountingPoints = objects.filter(o => o.type === 'Mounting Point');
  const antennaKeepouts = objects.filter(o => o.type === 'Antenna Keepout');

  // Check containment within outer profile
  if (outerProfiles.length > 0) {
    const outer = outerProfiles[0];

    for (const bz of boardZones) {
      if (!isMechanicalObjectContained(bz, outer)) {
        issues.push({
          severity: 'Error',
          objectId: bz.id,
          message: `Board zone "${bz.name}" extends outside outer profile`
        });
      }
    }

    for (const bc of batteryCavities) {
      if (!isMechanicalObjectContained(bc, outer)) {
        issues.push({
          severity: 'Error',
          objectId: bc.id,
          message: `Battery cavity "${bc.name}" extends outside outer profile`
        });
      }
    }
  }

  // Battery cavity intersects board zone
  for (const bc of batteryCavities) {
    for (const bz of boardZones) {
      if (mechanicalObjectsOverlap(bc, bz)) {
        issues.push({
          severity: 'Error',
          objectIds: [bc.id, bz.id],
          message: `Battery cavity "${bc.name}" overlaps board zone "${bz.name}"`
        });
      }
    }
  }

  // Mounting point collision
  for (let i = 0; i < mountingPoints.length; i++) {
    for (let j = i + 1; j < mountingPoints.length; j++) {
      if (mechanicalObjectsOverlap(mountingPoints[i], mountingPoints[j])) {
        issues.push({
          severity: 'Error',
          objectIds: [mountingPoints[i].id, mountingPoints[j].id],
          message: `Mounting point "${mountingPoints[i].name}" collides with "${mountingPoints[j].name}"`
        });
      }
    }
  }

  // Antenna keepout intersects non-allowed zones
  for (const ak of antennaKeepouts) {
    for (const bz of boardZones) {
      if (mechanicalObjectsOverlap(ak, bz)) {
        issues.push({
          severity: 'Warning',
          objectIds: [ak.id, bz.id],
          message: `Antenna keepout "${ak.name}" overlaps board zone "${bz.name}"`
        });
      }
    }
  }

  // Board zone without linked board
  for (const bz of boardZones) {
    if (!bz.linkedBoardId) {
      issues.push({
        severity: 'Warning',
        objectId: bz.id,
        message: `Board zone "${bz.name}" has no linked board`
      });
    }
  }

  // Missing outer profile
  if (outerProfiles.length === 0 && objects.length > 0) {
    issues.push({
      severity: 'Warning',
      message: 'No outer profile defined for mechanical layout'
    });
  }

  return issues;
}
