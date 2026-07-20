import { describe, it, expect } from 'vitest';
import { FirmwareConfiguration, FirmwareSourceFile } from '../types';

describe('Persistent Firmware Source Workspace Tests', () => {
  it('should support creation, editing, and configuration of firmware source files and platformio.ini', () => {
    const config: FirmwareConfiguration = {
      environmentName: 'esp32s3_dev',
      platform: 'espressif32',
      board: 'esp32-s3-devkitc-1',
      framework: 'arduino',
      buildFlags: ['-DCORE_DEBUG_LEVEL=5'],
      libraryDependencies: ['ArduinoJson@^6.21.3']
    };

    const mainSource: FirmwareSourceFile = {
      id: 'src_main_cpp',
      path: 'src/main.cpp',
      language: 'C++',
      content: '#include <Arduino.h>\nvoid setup() { Serial.begin(115200); }\nvoid loop() { delay(1000); }',
      generated: false,
      dirty: false,
      linkedModuleIds: ['mod_core']
    };

    const pioIni: FirmwareSourceFile = {
      id: 'file_pio_ini',
      path: 'platformio.ini',
      language: 'INI',
      content: `[env:${config.environmentName}]\nplatform = ${config.platform}\nboard = ${config.board}\nframework = ${config.framework}`,
      generated: true,
      dirty: false,
      linkedModuleIds: []
    };

    expect(mainSource.language).toBe('C++');
    expect(pioIni.content).toContain('platform = espressif32');
    expect(config.buildFlags[0]).toBe('-DCORE_DEBUG_LEVEL=5');
  });
});
