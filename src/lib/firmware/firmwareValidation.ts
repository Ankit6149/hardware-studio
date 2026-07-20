import { FirmwareState, FirmwareTransition } from '../../types';

export interface FirmwareValidationIssue {
  severity: 'Error' | 'Warning' | 'Info';
  stateId?: string;
  transitionId?: string;
  message: string;
}

/** Sanitize a user-facing name into a valid C identifier */
export function sanitizeCIdentifier(name: string): string {
  // Replace spaces, hyphens, dots with underscores
  let id = name.replace(/[\s\-\.\/\\]+/g, '_');
  // Remove non-alphanumeric/underscore characters
  id = id.replace(/[^a-zA-Z0-9_]/g, '');
  // Ensure doesn't start with a digit
  if (/^[0-9]/.test(id)) {
    id = '_' + id;
  }
  // Ensure not empty
  if (!id) {
    id = '_unnamed';
  }
  return id;
}

/** Validate a state machine definition */
export function validateStateMachine(
  states: FirmwareState[],
  transitions: FirmwareTransition[]
): FirmwareValidationIssue[] {
  const issues: FirmwareValidationIssue[] = [];
  const stateIds = new Set(states.map(s => s.id));

  // No initial state
  const initialStates = states.filter(s => s.type === 'Initial');
  if (initialStates.length === 0 && states.length > 0) {
    issues.push({
      severity: 'Error',
      message: 'No initial state defined in state machine'
    });
  }

  // No fault state
  const faultStates = states.filter(s => s.type === 'Fault');
  if (faultStates.length === 0 && states.length > 0) {
    issues.push({
      severity: 'Warning',
      message: 'No fault/error state defined in state machine'
    });
  }

  // Transition references missing state
  for (const t of transitions) {
    if (!stateIds.has(t.sourceStateId)) {
      issues.push({
        severity: 'Error',
        transitionId: t.id,
        message: `Transition references missing source state: ${t.sourceStateId}`
      });
    }
    if (!stateIds.has(t.targetStateId)) {
      issues.push({
        severity: 'Error',
        transitionId: t.id,
        message: `Transition references missing target state: ${t.targetStateId}`
      });
    }
  }

  // Unreachable states (not initial, and no incoming transition)
  for (const state of states) {
    if (state.type === 'Initial') continue;
    const hasIncoming = transitions.some(t => t.targetStateId === state.id);
    if (!hasIncoming) {
      issues.push({
        severity: 'Warning',
        stateId: state.id,
        message: `State "${state.name}" is unreachable (no incoming transitions)`
      });
    }
  }

  // State with no outgoing transition (and not Final)
  for (const state of states) {
    if (state.type === 'Final') continue;
    const hasOutgoing = transitions.some(t => t.sourceStateId === state.id);
    if (!hasOutgoing && states.length > 1) {
      issues.push({
        severity: 'Warning',
        stateId: state.id,
        message: `State "${state.name}" has no outgoing transitions`
      });
    }
  }

  return issues;
}
