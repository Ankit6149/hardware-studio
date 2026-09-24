import { describe, expect, it } from 'vitest';
import type { Project } from '../types';
import {
  LEGACY_ACTIVE_ID_KEY,
  LEGACY_PROJECTS_KEY,
  LEGACY_SINGLE_PROJECT_KEY,
  MemoryProjectRepository,
  migrateLegacyLocalStorageProjects,
} from '../lib/repository/projectRepository';

function project(id: string, updatedAt = '2026-09-25T00:00:00.000Z'): Project {
  return {
    id,
    projectName: id,
    description: '',
    createdAt: updatedAt,
    updatedAt,
    version: '6',
    schemaVersion: 6,
    activeView: 'dashboard',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
  } as Project;
}

function storage(values: Record<string, string | null>): Pick<Storage, 'getItem'> {
  return {
    getItem(key: string) {
      return values[key] ?? null;
    },
  };
}

describe('project repository contract', () => {
  it('stores defensive project copies and active project identity', async () => {
    const repository = new MemoryProjectRepository();
    const source = project('alpha');

    await repository.saveProject(source);
    await repository.setActiveProjectId(source.id);
    source.projectName = 'mutated outside repository';

    expect((await repository.getProject('alpha'))?.projectName).toBe('alpha');
    expect(await repository.getActiveProjectId()).toBe('alpha');

    const loaded = await repository.getProject('alpha');
    loaded!.projectName = 'mutated loaded copy';
    expect((await repository.getProject('alpha'))?.projectName).toBe('alpha');
  });

  it('lists projects by most recent update and clears deleted active identity', async () => {
    const repository = new MemoryProjectRepository();
    await repository.saveProject(project('older', '2026-09-24T00:00:00.000Z'));
    await repository.saveProject(project('newer', '2026-09-25T00:00:00.000Z'));
    await repository.setActiveProjectId('older');

    expect((await repository.listProjects()).map((item) => item.id)).toEqual(['newer', 'older']);

    await repository.deleteProject('older');
    expect(await repository.getActiveProjectId()).toBeNull();
  });

  it('imports the legacy project map once and preserves the requested active project', async () => {
    const repository = new MemoryProjectRepository();
    const alpha = project('alpha');
    const beta = project('beta');

    const result = await migrateLegacyLocalStorageProjects(repository, storage({
      [LEGACY_PROJECTS_KEY]: JSON.stringify({ alpha, beta }),
      [LEGACY_ACTIVE_ID_KEY]: 'beta',
    }));

    expect(result).toEqual({
      importedProjectIds: ['alpha', 'beta'],
      activeProjectId: 'beta',
      sourceFound: true,
    });
    expect((await repository.listProjects()).map((item) => item.id).sort()).toEqual(['alpha', 'beta']);
    expect(await repository.getActiveProjectId()).toBe('beta');

    const second = await migrateLegacyLocalStorageProjects(repository, storage({
      [LEGACY_PROJECTS_KEY]: JSON.stringify({ replacement: project('replacement') }),
    }));
    expect(second.importedProjectIds).toEqual([]);
    expect((await repository.listProjects()).map((item) => item.id).sort()).toEqual(['alpha', 'beta']);
  });

  it('migrates the oldest single-project format conservatively without template facts', async () => {
    const repository = new MemoryProjectRepository();
    const result = await migrateLegacyLocalStorageProjects(repository, storage({
      [LEGACY_SINGLE_PROJECT_KEY]: JSON.stringify({
        projectName: 'Old Device',
        activeView: 'master',
        nodes: [],
        edges: [],
        bom: [],
        testing: [],
        batteryCapacityMah: 240,
      }),
    }));

    expect(result.importedProjectIds).toEqual(['project_default']);
    const imported = await repository.getProject('project_default');
    expect(imported).toMatchObject({
      projectName: 'Old Device',
      batteryCapacityMah: 240,
    });
    expect(imported?.powerBudget).toEqual([]);
    expect(imported?.pinMap).toEqual([]);
    expect(imported?.firmwareTasks).toEqual([]);
  });

  it('fails explicitly on malformed legacy project JSON instead of overwriting it', async () => {
    const repository = new MemoryProjectRepository();

    await expect(migrateLegacyLocalStorageProjects(repository, storage({
      [LEGACY_PROJECTS_KEY]: '{not-json',
    }))).rejects.toBeInstanceOf(SyntaxError);

    expect(await repository.listProjects()).toEqual([]);
  });
});
