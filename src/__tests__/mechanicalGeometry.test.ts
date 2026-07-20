import { describe, it, expect } from 'vitest';
import { MechanicalObject } from '../types';
import {
  getMechanicalBoundingBox,
  mechanicalObjectsOverlap,
  isMechanicalObjectContained,
  minimumDistanceBetweenMechanicalObjects
} from '../lib/mechanical/mechanicalGeometry';

describe('2D Mechanical Geometry & Lightweight Constraints Tests', () => {
  const encBox: MechanicalObject = {
    id: 'enc_1',
    name: 'Main Enclosure Shell',
    type: 'Outer Profile',
    shape: 'rect',
    xMm: 0,
    yMm: 0,
    widthMm: 120,
    heightMm: 80,
    rotationDeg: 0,
    layer: 'Enclosure',
    locked: false,
    visible: true
  };

  const pcbBox: MechanicalObject = {
    id: 'pcb_1',
    name: 'Main PCB Fit Zone',
    type: 'Board Zone',
    shape: 'rect',
    xMm: 10,
    yMm: 10,
    widthMm: 100,
    heightMm: 60,
    rotationDeg: 0,
    layer: 'PCB Boundary',
    locked: false,
    visible: true
  };

  const battBox: MechanicalObject = {
    id: 'batt_1',
    name: 'LiPo Cavity',
    type: 'Battery Cavity',
    shape: 'rect',
    xMm: 15,
    yMm: 15,
    widthMm: 40,
    heightMm: 30,
    rotationDeg: 0,
    layer: 'Battery Cavity',
    locked: false,
    visible: true
  };

  it('should compute exact bounding box coordinates for rectangular objects', () => {
    const bbox = getMechanicalBoundingBox(encBox);
    expect(bbox.xMin).toBe(0);
    expect(bbox.yMin).toBe(0);
    expect(bbox.xMax).toBe(120);
    expect(bbox.yMax).toBe(80);
    expect(bbox.width).toBe(120);
    expect(bbox.height).toBe(80);
  });

  it('should detect geometric containment of PCB inside enclosure shell', () => {
    const isContained = isMechanicalObjectContained(pcbBox, encBox);
    expect(isContained).toBe(true);
  });

  it('should detect overlap between battery cavity and PCB zone', () => {
    const isOverlapping = mechanicalObjectsOverlap(battBox, pcbBox);
    expect(isOverlapping).toBe(true);
  });

  it('should calculate minimum clearance distance between objects', () => {
    const objA: MechanicalObject = { id: 'a', name: 'A', type: 'Outer Profile', shape: 'rect', xMm: 0, yMm: 0, widthMm: 20, heightMm: 20, rotationDeg: 0, layer: 'Def', locked: false, visible: true };
    const objB: MechanicalObject = { id: 'b', name: 'B', type: 'Outer Profile', shape: 'rect', xMm: 30, yMm: 0, widthMm: 20, heightMm: 20, rotationDeg: 0, layer: 'Def', locked: false, visible: true };
    const dist = minimumDistanceBetweenMechanicalObjects(objA, objB);
    expect(dist).toBe(10);
  });
});
