import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const factorySource = readFileSync(
  resolve(process.cwd(), 'src/components/FactoryPackageBuilder.tsx'),
  'utf8',
);

const exportSource = readFileSync(
  resolve(process.cwd(), 'src/components/ExportCenter.tsx'),
  'utf8',
);

describe('focused output workspace baseline', () => {
  it('keeps Factory Package centered on real preflight and external evidence', () => {
    expect(factorySource).toContain('evaluateManufacturingContext');
    expect(factorySource).toContain('Manufacturing preflight');
    expect(factorySource).toContain('External review');
    expect(factorySource).toContain('Checklist state records review work only. It does not automatically mark the package Verified.');
    expect(factorySource).not.toContain('Mark Package Verified');
    expect(factorySource).not.toContain('handleVerifyPackage');
  });

  it('does not present unsupported fabrication layers as normal Factory Package actions', () => {
    expect(factorySource).toContain('Not native fabrication outputs yet');
    expect(factorySource).not.toContain("key: 'top_mask'");
    expect(factorySource).not.toContain("key: 'top_paste'");
    expect(factorySource).not.toContain("key: 'top_silkscreen'");
  });

  it('keeps Export Center focused and collapses secondary engineering data', () => {
    expect(exportSource).toContain('Backups & working documents');
    expect(exportSource).toContain('Board-bound draft outputs');
    expect(exportSource).toContain('<details');
    expect(exportSource).toContain('Secondary exports');
    expect(exportSource).toContain('Output boundaries');
    expect(exportSource).not.toContain('Generated In App — Needs Review');
    expect(exportSource).not.toContain('Stats Grid');
  });
});
