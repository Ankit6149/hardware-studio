import { create } from 'zustand';
import {
  StorageHealth,
  classifyStorageError,
  idleStorageHealth,
  memoryFallbackStorageHealth,
  savedStorageHealth,
  savingStorageHealth,
} from '../lib/reliability';

const PROJECTS_KEY = 'hardware_studio_projects_v1';
const ACTIVE_ID_KEY = 'hardware_studio_active_project_id_v1';
const OLD_KEY = 'hardware_studio_legacy_project';
const TRACKED_KEYS = new Set([PROJECTS_KEY, ACTIVE_ID_KEY, OLD_KEY]);

interface StorageHealthState {
  health: StorageHealth;
  setHealth: (health: StorageHealth) => void;
}

export const useStorageHealthStore = create<StorageHealthState>((set) => ({
  health: idleStorageHealth(),
  setHealth: (health) => set({ health }),
}));

let prepared = false;
let corruptionWriteBlock = false;

function setHealth(health: StorageHealth): void {
  useStorageHealthStore.getState().setHealth(health);
}

function isTrackedLocalStorage(storage: Storage, key: string): boolean {
  if (!TRACKED_KEYS.has(key) || typeof window === 'undefined') return false;
  try {
    return storage === window.localStorage;
  } catch {
    return false;
  }
}

function latestSavedAt(raw: string): string | undefined {
  const projects = JSON.parse(raw) as Record<string, { updatedAt?: string }>;
  return Object.values(projects)
    .map((project) => project.updatedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);
}

export function allowStorageRecoveryOverwrite(): void {
  corruptionWriteBlock = false;
}

export function prepareStorageReliability(): void {
  if (prepared || typeof window === 'undefined') return;
  prepared = true;

  let storage: Storage;
  try {
    storage = window.localStorage;
    const raw = storage.getItem(PROJECTS_KEY);
    if (raw) {
      try {
        setHealth(savedStorageHealth(latestSavedAt(raw)));
      } catch (error) {
        corruptionWriteBlock = true;
        setHealth(classifyStorageError(error));
      }
    }
  } catch (error) {
    const health = classifyStorageError(error);
    setHealth(health.status === 'failed' ? memoryFallbackStorageHealth(health.message) : health);
    return;
  }

  const originalGetItem = Storage.prototype.getItem;
  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.getItem = function patchedGetItem(key: string): string | null {
    try {
      return originalGetItem.call(this, key);
    } catch (error) {
      if (isTrackedLocalStorage(this, key)) setHealth(classifyStorageError(error));
      throw error;
    }
  };

  Storage.prototype.setItem = function patchedSetItem(key: string, value: string): void {
    const tracked = isTrackedLocalStorage(this, key);
    if (tracked) {
      setHealth(savingStorageHealth(useStorageHealthStore.getState().health));
      if (corruptionWriteBlock && key === PROJECTS_KEY) {
        const health = classifyStorageError(new SyntaxError('Stored project JSON is malformed.'));
        setHealth(health);
        throw new Error('Stored project data is malformed. Import a known-good backup before overwriting it.');
      }
    }

    try {
      originalSetItem.call(this, key, value);
      if (tracked) {
        const current = useStorageHealthStore.getState().health;
        const savedAt = key === PROJECTS_KEY ? latestSavedAt(value) : current.lastSavedAt;
        setHealth(savedStorageHealth(savedAt));
      }
    } catch (error) {
      if (tracked) setHealth(classifyStorageError(error));
      throw error;
    }
  };

  Storage.prototype.removeItem = function patchedRemoveItem(key: string): void {
    try {
      originalRemoveItem.call(this, key);
    } catch (error) {
      if (isTrackedLocalStorage(this, key)) setHealth(classifyStorageError(error));
      throw error;
    }
  };
}
