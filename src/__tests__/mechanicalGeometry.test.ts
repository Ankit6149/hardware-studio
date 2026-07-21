import { describe, it, expect } from 'vitest';
import { MechanicalObject } from '../types';
import {
  movePolygonVertex,
  insertPolygonVertex,
  deletePolygonVertex,
  applyLightweightConstraint,
  getMechanicalBoundingBox,
  mechanicalObjectsOverlap,
  minimumDistanceBetweenMechanicalObjects
} from '../lib/mechanical/mechanicalGeometry';

describe('Slice 3 Production Mechanical Geometry & Lightweight Constraints', () => {
  const basePolygon: MechanicalObject = {
    id: 'poly_1',
    name: 'Main Housing Polygon',
    type: 'Outer Profile',
    shape: 'polygon',
    xMm: 0,
    yMm: 0,
    widthMm: 100,
    heightMm: 60,
    rotationDeg: 0,
    locked: false,
    visible: true,
    points: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 60 },
      { x: 0, y: 60 }
    ]
  };

  it('should move a polygon vertex correctly', () => {
    const moved = movePolygonVertex(basePolygon, 1, { x: 120, y: -10 });
    expect(moved.points?.[1]).toEqual({ x: 120, y: -10 });
    expect(moved.points?.length).toBe(4);
  });

  it('should insert a polygon vertex after specified index', () => {
    const inserted = insertPolygonVertex(basePolygon, 1, { x: 110, y: 30 });
    expect(inserted.points?.length).toBe(5);
    expect(inserted.points?.[2]).toEqual({ x: 110, y: 30 });
  });

  it('should delete a polygon vertex if remaining count >= 3', () => {
    const poly5Point: MechanicalObject = {
      ...basePolygon,
      points: [
        { x: 0, y: 0 },
        { x: 50, y: -20 },
        { x: 100, y: 0 },
        { x: 100, y: 60 },
        { x: 0, y: 60 }
      ]
    };

    const deleted = deletePolygonVertex(poly5Point, 1);
    expect(deleted.points?.length).toBe(4);
    expect(deleted.points?.[1]).toEqual({ x: 100, y: 0 });

    // Attempting to delete from 3-point polygon must be prevented
    const poly3Point = deleted;
    const poly3PointSub = deletePolygonVertex(deletePolygonVertex(poly3Point, 0), 0);
    expect(poly3PointSub.points?.length).toBe(3); // Cannot drop below 3 vertices
  });

  it('should apply lightweight constraint: centre-align', () => {
    const reference: MechanicalObject = {
      id: 'ref_1',
      name: 'Main Enclosure',
      type: 'Outer Profile',
      shape: 'rect',
      xMm: 100,
      yMm: 100,
      widthMm: 100,
      heightMm: 80,
      rotationDeg: 0,
      locked: false,
      visible: true
    };

    const target: MechanicalObject = {
      id: 'tgt_1',
      name: 'Display Window',
      type: 'Sensor Window',
      shape: 'rect',
      xMm: 0,
      yMm: 0,
      widthMm: 40,
      heightMm: 30,
      rotationDeg: 0,
      locked: false,
      visible: true
    };

    const constrained = applyLightweightConstraint('centre-align', target, reference);
    // Ref center: X = 100 + 50 = 150, Y = 100 + 40 = 140
    // Target top-left for 40x30 centered: X = 150 - 20 = 130, Y = 140 - 15 = 125
    expect(constrained.xMm).toBe(130);
    expect(constrained.yMm).toBe(125);
  });

  it('should apply lightweight constraint: fixed-distance', () => {
    const reference: MechanicalObject = {
      id: 'ref_1',
      name: 'Battery',
      type: 'Battery Cavity',
      shape: 'rect',
      xMm: 10,
      yMm: 10,
      widthMm: 50,
      heightMm: 30,
      rotationDeg: 0,
      locked: false,
      visible: true
    };

    const target: MechanicalObject = {
      id: 'tgt_1',
      name: 'Connector',
      type: 'Connector Opening',
      shape: 'rect',
      xMm: 0,
      yMm: 10,
      widthMm: 15,
      heightMm: 10,
      rotationDeg: 0,
      locked: false,
      visible: true
    };

    const constrained = applyLightweightConstraint('fixed-distance', target, reference, 15);
    // Ref X max = 10 + 50 = 60. Target X = 60 + 15 = 75
    expect(constrained.xMm).toBe(75);
  });

  it('should calculate minimum distance between mechanical objects', () => {
    const objA: MechanicalObject = {
      id: 'a',
      name: 'Plate A',
      type: 'Board Zone',
      shape: 'rect',
      xMm: 0,
      yMm: 0,
      widthMm: 20,
      heightMm: 20,
      rotationDeg: 0,
      locked: false,
      visible: true
    };

    const objB: MechanicalObject = {
      id: 'b',
      name: 'Plate B',
      type: 'Board Zone',
      shape: 'rect',
      xMm: 30,
      yMm: 0,
      widthMm: 20,
      heightMm: 20,
      rotationDeg: 0,
      locked: false,
      visible: true
    };

    const dist = minimumDistanceBetweenMechanicalObjects(objA, objB);
    expect(dist).toBe(10);
  });
});
