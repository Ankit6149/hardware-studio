import { describe, it, expect } from 'vitest';
import { generateFirmwareSource } from '../lib/firmware/firmwareCodegen';
import { createSimulationSession, triggerSimulationEvent } from '../lib/firmware/firmwareSimulator';
import { FirmwareModule, FirmwareState, FirmwareTransition } from '../types';

describe('Firmware State Machine Engine & Embedded C/C++ Workflows', () => {
  const sampleModules: FirmwareModule[] = [
    {
      id: 'm1',
      name: 'PowerManager',
      type: 'Power',
      status: 'Implemented',
      description: 'Power management firmware task',
      linkedArchitectureNodeIds: [],
      linkedComponentIds: ['U1'],
      linkedPinIds: [],
      linkedNetIds: [],
      sourceFiles: [],
      linkedTestIds: [],
      dependencies: [],
    },
  ];

  const sampleStates: FirmwareState[] = [
    { id: 's1', name: 'IdleState', type: 'Initial', entryActions: ['init_gpio()'], exitActions: [], linkedModuleIds: ['m1'], linkedComponentIds: [], x: 100, y: 100 },
    { id: 's2', name: 'ActiveState', type: 'Normal', entryActions: ['enable_sensor()'], exitActions: ['disable_sensor()'], linkedModuleIds: ['m1'], linkedComponentIds: [], x: 300, y: 100 },
  ];

  const sampleTransitions: FirmwareTransition[] = [
    { id: 't1', sourceStateId: 's1', targetStateId: 's2', event: 'EVT_POWER_BUTTON', action: 'start_active_mode()' },
  ];

  it('should generate FreeRTOS C/C++ header and source files with task loops', () => {
    const { headerContent, sourceContent } = generateFirmwareSource(sampleModules, sampleStates, sampleTransitions, 'FreeRTOS');

    expect(headerContent).toContain('/* Target Architecture: FreeRTOS */');
    expect(headerContent).toContain('#include "FreeRTOS.h"');
    expect(headerContent).toContain('void vTaskStateMachine(void *pvParameters);');

    expect(sourceContent).toContain('void state_idlestate_enter(void)');
    expect(sourceContent).toContain('void state_activestate_enter(void)');
    expect(sourceContent).toContain('void vTaskStateMachine(void *pvParameters)');
  });

  it('should execute step-by-step virtual state machine logic simulation', () => {
    let session = createSimulationSession(sampleStates, 's1');
    expect(session.currentStateId).toBe('s1');

    const result = triggerSimulationEvent(session, 'EVT_POWER_BUTTON', sampleStates, sampleTransitions);
    expect(result.step.success).toBe(true);
    expect(result.step.currentStateId).toBe('s2');
    expect(result.session.currentStateId).toBe('s2');
    expect(result.step.executedActions).toContain('Transition: start_active_mode()');
  });
});
