import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const firmwareStudioSource = readFileSync(
  resolve(process.cwd(), 'src/components/firmware/FirmwareStudio.tsx'),
  'utf8',
);

describe('focused firmware workspace baseline', () => {
  it('keeps build and device evidence explicit instead of claiming automatic execution', () => {
    expect(firmwareStudioSource).toContain('Record build result');
    expect(firmwareStudioSource).toContain('Record local-device observation');
    expect(firmwareStudioSource).toContain('does not claim to compile, flash, or query your device');
    expect(firmwareStudioSource).toContain('evidence-gated verification');
  });

  it('uses deterministic state placement rather than random layout coordinates', () => {
    expect(firmwareStudioSource).not.toContain('Math.random');
    expect(firmwareStudioSource).toContain('const column = index % 4');
    expect(firmwareStudioSource).toContain('const row = Math.floor(index / 4)');
  });
});
