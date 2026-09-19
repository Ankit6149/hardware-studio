import type { EntityId } from './identity';

export const COORDINATE_FRAME_KINDS = [
  'schematic',
  'pcb',
  'mechanical',
  'render',
  'source',
] as const;

export type CoordinateFrameKind = (typeof COORDINATE_FRAME_KINDS)[number];

export const COORDINATE_AUTHORITIES = [
  'engineering',
  'display-only',
  'source-native',
] as const;

export type CoordinateAuthority = (typeof COORDINATE_AUTHORITIES)[number];

export type CoordinateUnit = 'um' | 'mm' | 'mil' | 'in' | 'grid' | 'px' | 'unitless';

export interface CoordinateFrame {
  id: string;
  kind: CoordinateFrameKind;
  authority: CoordinateAuthority;
  unit: CoordinateUnit;
  ownerEntityId?: EntityId;
  sourceFrameId?: string;
  origin?: { x: number; y: number; z?: number };
  axes?: 'xy' | 'xyz';
  handedness?: 'right' | 'left';
  note?: string;
}

export function coordinateFrameCanDriveEngineeringGeometry(frame: CoordinateFrame): boolean {
  return frame.authority === 'engineering' || frame.authority === 'source-native';
}

export function assertEngineeringCoordinateFrame(frame: CoordinateFrame): void {
  if (!coordinateFrameCanDriveEngineeringGeometry(frame)) {
    throw new Error(`Coordinate frame ${frame.id} is display-only and cannot drive engineering geometry`);
  }
  if (frame.unit === 'px') {
    throw new Error(`Coordinate frame ${frame.id} uses pixels and cannot drive engineering geometry`);
  }
}
