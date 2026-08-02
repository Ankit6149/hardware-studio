import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function sourceFiles(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(?:ts|tsx|js|jsx)$/.test(entry) ? [path] : [];
  });
}

describe('browser decision guard', () => {
  it('contains no native alert, confirm, or prompt calls in production source', () => {
    const root = join(process.cwd(), 'src');
    const violations = sourceFiles(root)
      .filter((path) => !path.includes(`${join('src', '__tests__')}`))
      .flatMap((path) => {
        const content = readFileSync(path, 'utf8');
        const patterns = [
          /\b(?:window|globalThis)\.(?:alert|confirm|prompt)\s*\(/g,
          /(^|[^\w.])(?:alert|confirm|prompt)\s*\(/gm,
        ];
        return patterns.flatMap((pattern) =>
          Array.from(content.matchAll(pattern), (match) => `${relative(process.cwd(), path)}:${content.slice(0, match.index).split('\n').length}`),
        );
      });

    expect(violations).toEqual([]);
  });
});
