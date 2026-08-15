import crypto from 'crypto';
import { Project } from '../../types';
import { assertManufacturingContext } from '../manufacturing/manufacturingContext';
import {
  generateNativeGerberCopperTop,
  generateNativeGerberCopperBottom,
  generateNativeGerberBoardOutline,
  generateNativeExcellonDrills,
  generateNativeCplDraftCsv,
  exportBomCsv,
  generateNativeNetlistJson
} from '../nativeExports';

export interface ManufacturingFileManifest {
  fileName: string;
  fileType: 'Gerber' | 'NC Drill' | 'Pick and Place' | 'BOM' | 'IPC-2581' | 'Assembly Drawing';
  content: string;
  sizeBytes: number;
  sha256: string;
}

export interface ManufacturingManifestPackage {
  packageId: string;
  projectName: string;
  boardId: string;
  boardName: string;
  generatedAt: string;
  files: ManufacturingFileManifest[];
  packageSha256: string;
}

/** Compute true SHA-256 digest using NodeJS crypto */
export function computeSHA256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Generate a SHA-256 manufacturing manifest package only when the project has a
 * real, unambiguous manufacturing board context. This gate intentionally sits
 * before the legacy serializers so missing board identity/geometry/placements
 * cannot be converted into a file-shaped package and then labelled generated.
 */
export function generateManufacturingManifestPackage(project: Project): ManufacturingManifestPackage {
  const context = assertManufacturingContext(project);
  const normalizedProject: Project = {
    ...project,
    activeBoardId: context.boardId,
  };

  const gerberTop = generateNativeGerberCopperTop(normalizedProject);
  const gerberBottom = generateNativeGerberCopperBottom(normalizedProject);
  const gerberOutline = generateNativeGerberBoardOutline(normalizedProject);
  const excellonDrill = generateNativeExcellonDrills(normalizedProject);
  const cplCsv = generateNativeCplDraftCsv(normalizedProject);
  const bomCsv = exportBomCsv(normalizedProject);
  const netlistJson = generateNativeNetlistJson(normalizedProject);

  const files: ManufacturingFileManifest[] = [
    {
      fileName: `${project.projectName}_Top_Copper.gbr`,
      fileType: 'Gerber',
      content: gerberTop,
      sizeBytes: Buffer.byteLength(gerberTop, 'utf8'),
      sha256: computeSHA256(gerberTop)
    },
    {
      fileName: `${project.projectName}_Bottom_Copper.gbr`,
      fileType: 'Gerber',
      content: gerberBottom,
      sizeBytes: Buffer.byteLength(gerberBottom, 'utf8'),
      sha256: computeSHA256(gerberBottom)
    },
    {
      fileName: `${project.projectName}_Board_Outline.gbr`,
      fileType: 'Gerber',
      content: gerberOutline,
      sizeBytes: Buffer.byteLength(gerberOutline, 'utf8'),
      sha256: computeSHA256(gerberOutline)
    },
    {
      fileName: `${project.projectName}_Drill.drl`,
      fileType: 'NC Drill',
      content: excellonDrill,
      sizeBytes: Buffer.byteLength(excellonDrill, 'utf8'),
      sha256: computeSHA256(excellonDrill)
    },
    {
      fileName: `${project.projectName}_CPL.csv`,
      fileType: 'Pick and Place',
      content: cplCsv,
      sizeBytes: Buffer.byteLength(cplCsv, 'utf8'),
      sha256: computeSHA256(cplCsv)
    },
    {
      fileName: `${project.projectName}_BOM.csv`,
      fileType: 'BOM',
      content: bomCsv,
      sizeBytes: Buffer.byteLength(bomCsv, 'utf8'),
      sha256: computeSHA256(bomCsv)
    },
    {
      fileName: `${project.projectName}_Netlist.json`,
      fileType: 'IPC-2581',
      content: netlistJson,
      sizeBytes: Buffer.byteLength(netlistJson, 'utf8'),
      sha256: computeSHA256(netlistJson)
    }
  ];

  const combinedHashes = files.map(f => `${f.fileName}:${f.sha256}`).join('\n');
  const packageSha256 = computeSHA256(combinedHashes);

  return {
    packageId: `mfg_pkg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    projectName: project.projectName,
    boardId: context.boardId,
    boardName: context.board.name,
    generatedAt: new Date().toISOString(),
    files,
    packageSha256
  };
}
