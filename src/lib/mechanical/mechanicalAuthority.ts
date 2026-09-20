import type {
  AssemblyLayer,
  MechanicalBody,
  MechanicalDimension,
  MechanicalObject,
  Project,
} from '../../types';

export type MechanicalAuthoritySource = 'canonical' | 'empty';

export interface MechanicalAuthorityProjection {
  source: MechanicalAuthoritySource;
  objects: MechanicalObject[];
  bodies: MechanicalBody[];
  dimensions: MechanicalDimension[];
  assemblyLayers: AssemblyLayer[];
  engineeringObjects: MechanicalObject[];
  completeBodies: MechanicalBody[];
  hasMechanicalEvidence: boolean;
  hasAssemblyEvidence: boolean;
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function positive(value: unknown): value is number {
  return finite(value) && value > 0;
}

export function mechanicalObjectHasExplicitGeometry(object: MechanicalObject): boolean {
  if (!finite(object.xMm) || !finite(object.yMm) || !finite(object.rotationDeg)) return false;

  switch (object.shape) {
    case 'circle':
      return positive(object.radiusMm);
    case 'polygon':
      return Boolean(
        object.points
        && object.points.length >= 3
        && object.points.every((point) => finite(point.x) && finite(point.y)),
      );
    case 'ellipse':
    case 'rect':
      return positive(object.widthMm) && positive(object.heightMm);
    default:
      return false;
  }
}

export function mechanicalBodyHasExplicitGeometry(body: MechanicalBody): boolean {
  const x = finite(body.xMm) ? body.xMm : body.position?.x;
  const y = finite(body.yMm) ? body.yMm : body.position?.y;
  const z = finite(body.zMm) ? body.zMm : body.position?.z;
  const width = positive(body.widthMm) ? body.widthMm : body.dimensions?.x;
  const height = positive(body.heightMm) ? body.heightMm : body.dimensions?.y;
  const depth = positive(body.depthMm) ? body.depthMm : body.dimensions?.z;

  return finite(x)
    && finite(y)
    && finite(z)
    && positive(width)
    && positive(height)
    && positive(depth);
}

/**
 * Mechanical and assembly engineering authority.
 *
 * editorLayouts/editorConnections are deliberately excluded. They are UI
 * projections and cannot establish mechanical geometry, assembly evidence, or
 * engineering readiness.
 */
export function resolveMechanicalAuthority(project: Project): MechanicalAuthorityProjection {
  const objects = project.mechanicalObjects || [];
  const bodies = project.mechanicalBodies || [];
  const dimensions = project.mechanicalDimensions || [];
  const assemblyLayers = project.assemblyLayers || [];

  const engineeringObjects = objects.filter(
    (object) => object.type !== 'Annotation' && mechanicalObjectHasExplicitGeometry(object),
  );
  const completeBodies = bodies.filter(mechanicalBodyHasExplicitGeometry);

  const hasMechanicalEvidence = engineeringObjects.length > 0 || completeBodies.length > 0;
  const hasAssemblyEvidence = assemblyLayers.length > 0;

  return {
    source: hasMechanicalEvidence || dimensions.length > 0 || hasAssemblyEvidence ? 'canonical' : 'empty',
    objects,
    bodies,
    dimensions,
    assemblyLayers,
    engineeringObjects,
    completeBodies,
    hasMechanicalEvidence,
    hasAssemblyEvidence,
  };
}
