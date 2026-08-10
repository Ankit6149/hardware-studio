import { FirmwareState, FirmwareTransition } from '../../types';

export interface SimulationStepResult {
  previousStateId: string;
  currentStateId: string;
  triggeredEvent: string;
  executedActions: string[];
  success: boolean;
  message: string;
  timestampMs: number;
}

export interface SimulationSession {
  currentStateId: string;
  history: SimulationStepResult[];
  variables: Record<string, number | boolean | string>;
  active: boolean;
}

/** Initialize a state machine virtual logic simulation session */
export function createSimulationSession(
  states: FirmwareState[],
  initialStateId?: string
): SimulationSession {
  const initial = initialStateId || states.find(s => s.type === 'Initial')?.id || states[0]?.id || '';
  return {
    currentStateId: initial,
    history: [],
    variables: { battery_voltage: 3.8, temp_celsius: 25, is_charging: false },
    active: true,
  };
}

/** Trigger an event and execute state transition in virtual simulator */
export function triggerSimulationEvent(
  session: SimulationSession,
  event: string,
  states: FirmwareState[],
  transitions: FirmwareTransition[]
): { session: SimulationSession; step: SimulationStepResult } {
  const currentState = states.find(s => s.id === session.currentStateId);
  const possibleTransitions = transitions.filter(
    t => t.sourceStateId === session.currentStateId && t.event.toLowerCase() === event.toLowerCase()
  );

  const timestampMs = Date.now();

  if (possibleTransitions.length === 0) {
    const step: SimulationStepResult = {
      previousStateId: session.currentStateId,
      currentStateId: session.currentStateId,
      triggeredEvent: event,
      executedActions: [],
      success: false,
      message: `No transition defined from state '${currentState?.name || session.currentStateId}' for event '${event}'`,
      timestampMs,
    };
    return {
      session: {
        ...session,
        history: [...session.history, step],
      },
      step,
    };
  }

  // Select matching transition (first condition met or default)
  const targetTransition = possibleTransitions[0];
  const targetState = states.find(s => s.id === targetTransition.targetStateId);

  const actionsExecuted: string[] = [];
  if (currentState?.exitActions) actionsExecuted.push(...currentState.exitActions.map(a => `Exit: ${a}`));
  if (targetTransition.action) actionsExecuted.push(`Transition: ${targetTransition.action}`);
  if (targetState?.entryActions) actionsExecuted.push(...targetState.entryActions.map(a => `Entry: ${a}`));

  const step: SimulationStepResult = {
    previousStateId: session.currentStateId,
    currentStateId: targetTransition.targetStateId,
    triggeredEvent: event,
    executedActions: actionsExecuted,
    success: true,
    message: `Transitioned from '${currentState?.name}' to '${targetState?.name}' via '${event}'`,
    timestampMs,
  };

  const updatedSession: SimulationSession = {
    ...session,
    currentStateId: targetTransition.targetStateId,
    history: [...session.history, step],
  };

  return { session: updatedSession, step };
}
