import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const firmwareWorkbenchSource = readFileSync(
  resolve(process.cwd(), 'src/components/firmware/EngineeringFirmwareWorkbench.tsx'),
  'utf8',
);
const sourceEditor = readFileSync(
  resolve(process.cwd(), 'src/components/firmware/FirmwareCodePreview.tsx'),
  'utf8',
);

describe('focused firmware workspace baseline', () => {
  it('keeps build and device evidence explicit instead of claiming automatic execution', () => {
    expect(firmwareWorkbenchSource).toContain('Record external build result');
    expect(firmwareWorkbenchSource).toContain('Record external device observation');
    expect(firmwareWorkbenchSource).toContain('Hardware Studio did not run the compiler');
    expect(firmwareWorkbenchSource).toContain('Hardware Studio did not flash, query or monitor the device');
    expect(firmwareWorkbenchSource).toContain('getModuleVerificationBlockers');
  });

  it('uses deterministic state placement rather than random layout coordinates', () => {
    expect(firmwareWorkbenchSource).not.toContain('Math.random');
    expect(firmwareWorkbenchSource).toContain('const column = index % 4');
    expect(firmwareWorkbenchSource).toContain('const row = Math.floor(index / 4)');
  });

  it('requires explicit module and file selection', () => {
    expect(firmwareWorkbenchSource).not.toContain('firmwareModules[0]');
    expect(sourceEditor).not.toContain('sourceFiles[0]');
    expect(firmwareWorkbenchSource).toContain('Opening Firmware does not silently choose the first module');
    expect(sourceEditor).toContain('Opening Source does not generate files or silently select the first record');
  });
});
