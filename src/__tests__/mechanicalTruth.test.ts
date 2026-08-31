import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Mechanical truthfulness', () => {
  it('requires explicit physical input for new geometry and tolerances', () => {
    const workbench = source('../components/mechanical/EngineeringMechanicalWorkbench.tsx');

    expect(workbench).toContain("const [featureName, setFeatureName] = useState('')");
    expect(workbench).toContain("const [featureWidth, setFeatureWidth] = useState('')");
    expect(workbench).toContain("const [featureHeight, setFeatureHeight] = useState('')");
    expect(workbench).toContain("const [featureDepth, setFeatureDepth] = useState('')");
    expect(workbench).toContain("const [tolPlus, setTolPlus] = useState('')");
    expect(workbench).toContain("const [tolMinus, setTolMinus] = useState('')");
    expect(workbench).toContain('Create explicit feature');
    expect(workbench).toContain('tolerance unresolved');
  });

  it('does not invent assembly material or fastening evidence', () => {
    const workbench = source('../components/mechanical/EngineeringMechanicalWorkbench.tsx');

    expect(workbench).toContain("material: ''");
    expect(workbench).toContain("fasteningMethod: ''");
    expect(workbench).not.toContain("fasteningMethod: 'Screw Thread'");
  });
});
