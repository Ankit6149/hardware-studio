import type { Project } from '../../types';
import { migrateProjectSchema } from '../projectMigrations';

const DATABASE_NAME = 'hardware-studio-projects';
const DATABASE_VERSION = 1;
const PROJECTS_STORE = 'projects';
const META_STORE = 'meta';
const ACTIVE_PROJECT_KEY = 'active-project-id';

export const LEGACY_PROJECTS_KEY = 'hardware_studio_projects_v1';
export const LEGACY_ACTIVE_ID_KEY = 'hardware_studio_active_project_id_v1';
export const LEGACY_SINGLE_PROJECT_KEY = 'hardware_studio_legacy_project';

export interface ProjectRepository {
  listProjects(): Promise<Project[]>;
  getProject(projectId: string): Promise<Project | null>;
  saveProject(project: Project): Promise<void>;
  deleteProject(projectId: string): Promise<void>;
  getActiveProjectId(): Promise<string | null>;
  setActiveProjectId(projectId: string): Promise<void>;
}

function cloneProject(project: Project): Project {
  return structuredClone(project);
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed.'));
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction was aborted.'));
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed.'));
  });
}

async function openProjectDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB is unavailable in this environment.');
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PROJECTS_STORE)) {
        const store = database.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open Hardware Studio project database.'));
    request.onblocked = () => reject(new Error('Project database upgrade is blocked by another tab.'));
  });
}

export class IndexedDbProjectRepository implements ProjectRepository {
  private databasePromise: Promise<IDBDatabase> | null = null;

  private database(): Promise<IDBDatabase> {
    this.databasePromise ||= openProjectDatabase();
    return this.databasePromise;
  }

  async listProjects(): Promise<Project[]> {
    const database = await this.database();
    const transaction = database.transaction(PROJECTS_STORE, 'readonly');
    const records = await requestToPromise(transaction.objectStore(PROJECTS_STORE).getAll());
    await transactionToPromise(transaction);
    return (records as Project[])
      .map((project) => migrateProjectSchema(project))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getProject(projectId: string): Promise<Project | null> {
    const database = await this.database();
    const transaction = database.transaction(PROJECTS_STORE, 'readonly');
    const record = await requestToPromise(transaction.objectStore(PROJECTS_STORE).get(projectId));
    await transactionToPromise(transaction);
    return record ? migrateProjectSchema(record) : null;
  }

  async saveProject(project: Project): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(PROJECTS_STORE, 'readwrite');
    transaction.objectStore(PROJECTS_STORE).put(cloneProject(project));
    await transactionToPromise(transaction);
  }

  async deleteProject(projectId: string): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(PROJECTS_STORE, 'readwrite');
    transaction.objectStore(PROJECTS_STORE).delete(projectId);
    await transactionToPromise(transaction);
  }

  async getActiveProjectId(): Promise<string | null> {
    const database = await this.database();
    const transaction = database.transaction(META_STORE, 'readonly');
    const value = await requestToPromise(transaction.objectStore(META_STORE).get(ACTIVE_PROJECT_KEY));
    await transactionToPromise(transaction);
    return typeof value === 'string' ? value : null;
  }

  async setActiveProjectId(projectId: string): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(META_STORE, 'readwrite');
    transaction.objectStore(META_STORE).put(projectId, ACTIVE_PROJECT_KEY);
    await transactionToPromise(transaction);
  }
}

export class MemoryProjectRepository implements ProjectRepository {
  private readonly projects = new Map<string, Project>();
  private activeProjectId: string | null = null;

  async listProjects(): Promise<Project[]> {
    return Array.from(this.projects.values())
      .map(cloneProject)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getProject(projectId: string): Promise<Project | null> {
    const project = this.projects.get(projectId);
    return project ? cloneProject(project) : null;
  }

  async saveProject(project: Project): Promise<void> {
    this.projects.set(project.id, cloneProject(project));
  }

  async deleteProject(projectId: string): Promise<void> {
    this.projects.delete(projectId);
    if (this.activeProjectId === projectId) this.activeProjectId = null;
  }

  async getActiveProjectId(): Promise<string | null> {
    return this.activeProjectId;
  }

  async setActiveProjectId(projectId: string): Promise<void> {
    this.activeProjectId = projectId;
  }
}

let browserRepository: ProjectRepository | null = null;

export function createProjectRepository(): ProjectRepository {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return new MemoryProjectRepository();
  }
  browserRepository ||= new IndexedDbProjectRepository();
  return browserRepository;
}

export interface LegacyProjectMigrationResult {
  importedProjectIds: string[];
  activeProjectId: string | null;
  sourceFound: boolean;
}

function legacySingleProjectToProject(raw: unknown): Project {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Legacy single-project storage is not a valid object.');
  }

  const value = raw as Record<string, unknown>;
  const now = new Date().toISOString();
  return migrateProjectSchema({
    id: 'project_default',
    projectName: typeof value.projectName === 'string' && value.projectName.trim()
      ? value.projectName
      : 'Imported Hardware Project',
    description: 'Imported from the legacy Hardware Studio browser project format.',
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : now,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : now,
    version: typeof value.version === 'string' ? value.version : '1',
    activeView: typeof value.activeView === 'string' ? value.activeView : 'dashboard',
    nodes: Array.isArray(value.nodes) ? value.nodes : [],
    edges: Array.isArray(value.edges) ? value.edges : [],
    bom: Array.isArray(value.bom) ? value.bom : [],
    testing: Array.isArray(value.testing) ? value.testing : [],
    powerBudget: Array.isArray(value.powerBudget) ? value.powerBudget : [],
    pinMap: Array.isArray(value.pinMap) ? value.pinMap : [],
    firmwareTasks: Array.isArray(value.firmwareTasks) ? value.firmwareTasks : [],
    batteryCapacityMah: typeof value.batteryCapacityMah === 'number'
      ? value.batteryCapacityMah
      : undefined,
  });
}

export async function migrateLegacyLocalStorageProjects(
  repository: ProjectRepository,
  storage: Pick<Storage, 'getItem'>,
): Promise<LegacyProjectMigrationResult> {
  const existing = await repository.listProjects();
  if (existing.length > 0) {
    return {
      importedProjectIds: [],
      activeProjectId: await repository.getActiveProjectId(),
      sourceFound: false,
    };
  }

  const rawProjects = storage.getItem(LEGACY_PROJECTS_KEY);
  const rawSingleProject = storage.getItem(LEGACY_SINGLE_PROJECT_KEY);
  if (!rawProjects && !rawSingleProject) {
    return {
      importedProjectIds: [],
      activeProjectId: null,
      sourceFound: false,
    };
  }

  const imported: Project[] = [];
  if (rawProjects) {
    const parsed = JSON.parse(rawProjects) as Record<string, unknown>;
    for (const value of Object.values(parsed)) {
      imported.push(migrateProjectSchema(value));
    }
  } else if (rawSingleProject) {
    imported.push(legacySingleProjectToProject(JSON.parse(rawSingleProject)));
  }

  for (const project of imported) {
    await repository.saveProject(project);
  }

  const requestedActiveId = storage.getItem(LEGACY_ACTIVE_ID_KEY);
  const activeProjectId = requestedActiveId && imported.some((project) => project.id === requestedActiveId)
    ? requestedActiveId
    : imported[0]?.id || null;

  if (activeProjectId) {
    await repository.setActiveProjectId(activeProjectId);
  }

  return {
    importedProjectIds: imported.map((project) => project.id),
    activeProjectId,
    sourceFound: true,
  };
}
