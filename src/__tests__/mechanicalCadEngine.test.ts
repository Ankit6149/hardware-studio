import { describe, it, expect } from 'vitest';
import {
  computeScrewBossGeometry,
  computeSnapFitClipGeometry,
  computeEnclosureShell,
  checkMechanicalInterference,
  getMechanicalBoundingBox
} from '../lib/mechanical/mechanicalGeometry';
import { validateMechanicalLayout } from '../lib/mechanical/mechanicalValidation';
import { exportEnclosureSTL } from '../lib/nativeExports';
import { Project } from '../types';

describe('Mechanical 3D CAD & Enclosure Engine', () => {
  it('should compute parametric screw boss standoff dimensions for M2, M3, and M4', () => {
    const m3 = computeScrewBossGeometry('M3', 10.0);
    expect(m3.threadType).toBe('M3');
    expect(m3.outerRadiusMm).toBe(3.2);
    expect(m3.pilotHoleRadiusMm).toBe(1.35);
    expect(m3.heightMm).toBe(10.0);

    const m2 = computeScrewBossGeometry('M2', 6.0);
    expect(m2.outerRadiusMm).toBe(2.2);
    expect(m2.pilotHoleRadiusMm).toBe(0.9);
  });

  it('should compute cantilever snap-fit clip deflection parameters', () => {
    const clip = computeSnapFitClipGeometry(12.0, 6.0);
    expect(clip.beamLengthMm).toBe(12.0);
    expect(clip.beamWidthMm).toBe(6.0);
    expect(clip.undercutDepthMm).toBe(0.8);
    expect(clip.maxDeflectionMm).toBeGreaterThan(0.8);
  });

  it('should compute inner/outer enclosure shell contours with wall thickness', () => {
    const shell = computeEnclosureShell(100, 60, 25, 2.5, 4.0);
    expect(shell.outerWidthMm).toBe(100);
    expect(shell.wallThicknessMm).toBe(2.5);
    expect(shell.innerWidthMm).toBe(95); // 100 - 2.5*2
    expect(shell.innerHeightMm).toBe(55); // 60 - 2.5*2
  });

  it('should detect 3D spatial collision between PCB components and enclosure walls', () => {
    const project = {
      id: 'p1',
      projectName: 'Test Mechanical Project',
      description: 'Test',
      templateName: 'Test',
      activeBoardId: 'b1',
      createdAt: '2026-08-10T00:00:00.000Z',
      updatedAt: '2026-08-10T00:00:00.000Z',
      version: '1.0',
      activeView: 'mechanical',
      bom: [],
      mechanicalObjects: [
        { id: 'enc1', name: 'Enclosure Shell', type: 'Outer Profile', shape: 'rect', layer: 'Enclosure', xMm: 0, yMm: 0, widthMm: 50, heightMm: 50, depthMm: 10, rotationDeg: 0, locked: false, visible: true }
      ],
      boardComponents: [
        {
          id: 'c1',
          boardId: 'b1',
          referenceDesignator: 'U1',
          componentName: 'Tall Capacitor',
          componentType: 'Capacitor',
          value: '100uF',
          packageName: 'CAN_8MM',
          footprint: 'C_0805',
          partNumber: 'CAP-100U',
          placementX: 60, // Outside enclosure!
          placementY: 25,
          placementStatus: 'Placed',
          placementCriticality: 'High',
          notes: '',
          packageDimensions: { widthMm: 10, heightMm: 10, heightZMm: 15 },
          pcb: { placed: true, xMm: 60, yMm: 25, rotationDeg: 0, side: 'Top', locked: false, placementStatus: 'Placed' }
        }
      ]
    } as unknown as Project;

    const collision = checkMechanicalInterference(project);
    expect(collision.hasCollision).toBe(true);
    expect(collision.collisions.length).toBeGreaterThan(0);
    expect(collision.collisions[0].bodyA).toContain('Tall Capacitor');
  });

  it('should generate valid 3D ASCII STL mesh file for manufacturing export', () => {
    const project = {
      id: 'p2',
      projectName: 'CAD Enclosure',
      description: 'CAD',
      templateName: 'Test',
      activeBoardId: 'b1',
      createdAt: '2026-08-10T00:00:00.000Z',
      updatedAt: '2026-08-10T00:00:00.000Z',
      version: '1.0',
      activeView: 'mechanical',
      bom: [],
      mechanicalObjects: [
        { id: 'm1', name: 'Top_Casing', type: 'Outer Profile', shape: 'rect', xMm: 0, yMm: 0, widthMm: 80, heightMm: 50, depthMm: 20, rotationDeg: 0, locked: false, visible: true }
      ]
    } as unknown as Project;

    const stl = exportEnclosureSTL(project);
    expect(stl).toContain('solid CAD_Enclosure');
    expect(stl).toContain('facet normal');
    expect(stl).toContain('outer loop');
    expect(stl).toContain('vertex 80 50 20');
    expect(stl).toContain('endsolid CAD_Enclosure');
  });
});
