import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { generateFirmwareWorkspace } from '../lib/exportFirmware';
import { FirmwareSourceFile } from '../types';

describe('Slice 7 Persistent Firmware Source Workspace Tests', () => {
  it('should support multi-file source workspace operations: add, edit, dirty tracking, rename, delete, regenerate, and persistence', () => {
    const store = useProjectStore.getState();

    // 1. Create firmware module
    store.addFirmwareModule({
      name: 'BLE Telemetry Driver',
      type: 'Driver',
      description: 'Handles GATT connections and sensor streaming',
      linkedArchitectureNodeIds: ['arch_store_1'],
      linkedComponentIds: ['cmp_store_1'],
      linkedPinIds: [],
      linkedNetIds: [],
      linkedTestIds: [],
      dependencies: [],
      sourceFiles: ['src/main.cpp', 'include/sensors.h'],
      status: 'Draft'
    });

    // 2. Generate workspace files
    const initialFiles = generateFirmwareWorkspace(store);
    store.updateProjectState({ firmwareSourceFiles: initialFiles });
    expect(useProjectStore.getState().firmwareSourceFiles?.length).toBe(3);

    // 3. Create custom header (include/sensors.h)
    const customHeader: FirmwareSourceFile = {
      id: 'fw_file_sensors_h',
      path: 'include/sensors.h',
      name: 'sensors.h',
      content: '#ifndef SENSORS_H\n#define SENSORS_H\nvoid readSensors();\n#endif\n',
      isGenerated: false,
      dirty: false,
      language: 'cpp'
    };
    useProjectStore.setState({
      firmwareSourceFiles: [...(useProjectStore.getState().firmwareSourceFiles || []), customHeader]
    });
    expect(useProjectStore.getState().firmwareSourceFiles?.length).toBe(4);

    // 4. Edit file content & verify dirty flag tracking
    const currentFiles = useProjectStore.getState().firmwareSourceFiles || [];
    const editedFiles = currentFiles.map(f => 
      f.id === 'fw_file_sensors_h' 
        ? { ...f, content: f.content + '// Updated with BMI270 driver\n', dirty: true } 
        : f
    );
    store.updateProjectState({ firmwareSourceFiles: editedFiles });

    const editedHeader = useProjectStore.getState().firmwareSourceFiles?.find(f => f.id === 'fw_file_sensors_h');
    expect(editedHeader?.dirty).toBe(true);
    expect(editedHeader?.content).toContain('BMI270 driver');

    // Save changes (clear dirty flag)
    const savedFiles = (useProjectStore.getState().firmwareSourceFiles || []).map(f =>
      f.id === 'fw_file_sensors_h' ? { ...f, dirty: false } : f
    );
    store.updateProjectState({ firmwareSourceFiles: savedFiles });
    expect(useProjectStore.getState().firmwareSourceFiles?.find(f => f.id === 'fw_file_sensors_h')?.dirty).toBe(false);

    // 5. Rename file
    const renamedFiles = (useProjectStore.getState().firmwareSourceFiles || []).map(f =>
      f.id === 'fw_file_sensors_h' ? { ...f, path: 'include/imu_sensors.h', name: 'imu_sensors.h' } : f
    );
    store.updateProjectState({ firmwareSourceFiles: renamedFiles });
    expect(useProjectStore.getState().firmwareSourceFiles?.find(f => f.id === 'fw_file_sensors_h')?.path).toBe('include/imu_sensors.h');

    // 6. Delete file
    const remainingFiles = (useProjectStore.getState().firmwareSourceFiles || []).filter(f => f.id !== 'fw_file_sensors_h');
    store.updateProjectState({ firmwareSourceFiles: remainingFiles });
    expect(useProjectStore.getState().firmwareSourceFiles?.length).toBe(3);

    // 7. Export / Import JSON round-trip
    const jsonStr = store.exportProjectJSON();
    expect(jsonStr).toContain('platformio.ini');
    expect(jsonStr).toContain('BLE Telemetry Driver');

    store.importProjectJSON(jsonStr);
    const restoredWorkspace = useProjectStore.getState().firmwareSourceFiles || [];
    expect(restoredWorkspace.length).toBe(3);
    expect(restoredWorkspace.some(f => f.path === 'platformio.ini')).toBe(true);
  });
});
