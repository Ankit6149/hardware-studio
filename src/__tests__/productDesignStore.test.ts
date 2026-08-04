import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryProductDesignRepository } from '../lib/product-design/repository';
import { useProductDesignStore } from '../store/productDesignStore';

async function flushPersistence(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('Product Design command store', () => {
  beforeEach(() => {
    useProductDesignStore.getState().resetForTests();
    useProductDesignStore.getState().setRepository(new MemoryProductDesignRepository());
  });

  afterEach(() => {
    useProductDesignStore.getState().resetForTests();
  });

  it('creates a local document, layers, objects, and one undoable movement command', async () => {
    const store = useProductDesignStore.getState();
    await store.initialize('project-a');
    store.addLayer('Annotations');

    const rectangleId = store.addObject('rectangle', 103, 117);
    expect(rectangleId).toBeTruthy();
    expect(useProductDesignStore.getState().document?.objects[0]).toMatchObject({ x: 103, y: 117 });

    store.selectObject(rectangleId);
    store.moveSelected(7, 3);
    expect(useProductDesignStore.getState().document?.objects[0]).toMatchObject({ x: 110, y: 120 });

    useProductDesignStore.getState().undo();
    expect(useProductDesignStore.getState().document?.objects[0]).toMatchObject({ x: 103, y: 117 });

    useProductDesignStore.getState().redo();
    expect(useProductDesignStore.getState().document?.objects[0]).toMatchObject({ x: 110, y: 120 });
    await flushPersistence();
    expect(useProductDesignStore.getState().persistenceStatus).toBe('saved');
  });

  it('groups selected objects and promotes the same source identities into a concept part', async () => {
    const store = useProductDesignStore.getState();
    await store.initialize('project-a');
    const rectangleId = store.addObject('rectangle', 100, 100);
    const ellipseId = store.addObject('ellipse', 260, 120);
    expect(rectangleId && ellipseId).toBeTruthy();

    store.selectObjects([rectangleId as string, ellipseId as string]);
    store.groupSelected();
    const grouped = useProductDesignStore.getState().document?.objects.filter((object) => [rectangleId, ellipseId].includes(object.id));
    expect(grouped?.[0].groupId).toBeTruthy();
    expect(grouped?.[0].groupId).toBe(grouped?.[1].groupId);

    const conceptId = useProductDesignStore.getState().createConceptPartFromSelection();
    const concept = useProductDesignStore.getState().document?.objects.find((object) => object.id === conceptId);
    expect(concept).toMatchObject({
      type: 'concept-part',
      sourceObjectIds: [rectangleId, ellipseId],
    });
    expect(useProductDesignStore.getState().selectedObjectIds).toEqual([conceptId]);
    expect(useProductDesignStore.getState().is3DOpen).toBe(true);
  });

  it('creates and restores a named checkpoint as a new revision', async () => {
    const store = useProductDesignStore.getState();
    await store.initialize('project-a');
    const objectId = store.addObject('note', 80, 90);
    const checkpoint = await useProductDesignStore.getState().createCheckpoint('First direction');
    expect(checkpoint?.name).toBe('First direction');

    useProductDesignStore.getState().updateObjectById(objectId as string, { name: 'Changed note' }, 'Rename note');
    expect(useProductDesignStore.getState().document?.objects[0].name).toBe('Changed note');

    useProductDesignStore.getState().restoreCheckpoint(checkpoint!.id);
    expect(useProductDesignStore.getState().document?.objects[0].name).not.toBe('Changed note');
    expect(useProductDesignStore.getState().undoStack.at(-1)?.type).toBe('RESTORE_CHECKPOINT');
  });

  it('exports and imports the document without replacing object identities', async () => {
    const store = useProductDesignStore.getState();
    await store.initialize('project-a');
    const rectangleId = store.addObject('rectangle', 100, 100);
    const dimensionId = store.addObject('dimension', 100, 260);
    await flushPersistence();

    const exported = await useProductDesignStore.getState().exportDocument();
    expect(exported).toContain('hardware-studio-product-design');

    const repository = new MemoryProductDesignRepository();
    useProductDesignStore.getState().resetForTests();
    useProductDesignStore.getState().setRepository(repository);
    const imported = await useProductDesignStore.getState().importDocument(exported as string);

    expect(imported.objects.map((object) => object.id)).toEqual([rectangleId, dimensionId]);
    expect((await repository.getDocument(imported.id))?.objects.map((object) => object.id)).toEqual([rectangleId, dimensionId]);
  });
});
