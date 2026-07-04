import { CustomNode, CustomEdge } from '../types';

export interface Warning {
  id: string;
  message: string;
  severity: 'warning' | 'info' | 'critical';
}

export const runValidationRules = (
   nodes: CustomNode[],
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   edges: CustomEdge[]
 ): Warning[] => {
  const warnings: Warning[] = [];

  const nodeExists = (predicate: (n: CustomNode) => boolean) => nodes.some(predicate);

  // Helper matching functions
  const hasNameOrId = (node: CustomNode, search: string) => {
    const s = search.toLowerCase();
    return (
      node.id.toLowerCase().includes(s) ||
      node.data.name.toLowerCase().includes(s)
    );
  };

  const hasInText = (node: CustomNode, search: string) => {
    const s = search.toLowerCase();
    return (
      node.data.name.toLowerCase().includes(s) ||
      node.data.description.toLowerCase().includes(s) ||
      node.data.notes.toLowerCase().includes(s) ||
      node.data.requirements.toLowerCase().includes(s) ||
      node.data.purpose.toLowerCase().includes(s)
    );
  };

  // 1. If Haptic Motor exists but no Haptic Driver / Haptic Output exists, show warning.
  const hasHapticMotor = nodeExists(n => hasNameOrId(n, "haptic motor") || hasNameOrId(n, "vibration motor"));
  const hasHapticDriverOrOutput = nodeExists(n => hasNameOrId(n, "haptic driver") || hasNameOrId(n, "haptic output"));
  if (hasHapticMotor && !hasHapticDriverOrOutput) {
    warnings.push({
      id: "warn-haptic-driver",
      message: "Haptic Motor exists, but no Haptic Driver or Haptic Output circuit is configured.",
      severity: "warning"
    });
  }

  // 2. If Battery exists but no Charging block exists, show warning.
  const hasBattery = nodeExists(n => hasNameOrId(n, "battery"));
  const hasCharging = nodeExists(n => hasNameOrId(n, "charging") || hasNameOrId(n, "charger"));
  if (hasBattery && !hasCharging) {
    warnings.push({
      id: "warn-battery-charging",
      message: "Battery exists, but no Charging block (cradle/port charger) is configured.",
      severity: "warning"
    });
  }

  // 3. If BLE MCU exists but no Power block exists, show warning.
  const hasBleMcu = nodeExists(n => hasNameOrId(n, "ble mcu") || hasNameOrId(n, "bluetooth mcu"));
  const hasPowerBlock = nodeExists(n => 
    hasNameOrId(n, "power") || 
    hasNameOrId(n, "ldo") || 
    hasNameOrId(n, "pmic") || 
    hasNameOrId(n, "regulator") || 
    hasNameOrId(n, "rail")
  );
  if (hasBleMcu && !hasPowerBlock) {
    warnings.push({
      id: "warn-mcu-power",
      message: "BLE MCU exists, but no Power block (USB, LDO, Regulator) is configured to power it.",
      severity: "warning"
    });
  }

  // 4. If Microphone exists but no Privacy / Voice State note exists, show warning.
  const hasMicrophone = nodeExists(n => hasNameOrId(n, "microphone") || hasNameOrId(n, "mic"));
  const hasPrivacyOrVoiceState = nodeExists(n => 
    hasInText(n, "privacy") || 
    hasInText(n, "voice state") || 
    hasNameOrId(n, "privacy") || 
    hasNameOrId(n, "voice state")
  );
  if (hasMicrophone && !hasPrivacyOrVoiceState) {
    warnings.push({
      id: "warn-mic-privacy",
      message: "Microphone is configured, but no Privacy block or Voice State safeguard is noted.",
      severity: "warning"
    });
  }

  // 5. If System Alpha Integration exists but no Permission Layer exists, show warning.
  const hasSystemAlpha = nodeExists(n => 
    hasNameOrId(n, "system alpha") || 
    n.id.startsWith("sa-") || 
    hasNameOrId(n, "external software")
  );
  const hasPermissionLayer = nodeExists(n => hasNameOrId(n, "permission"));
  if (hasSystemAlpha && !hasPermissionLayer) {
    warnings.push({
      id: "warn-sa-permission",
      message: "System Alpha software integration is active, but no Permission or Security Layer is configured.",
      severity: "warning"
    });
  }

  // 6. If MVP boundary has no input block, show warning.
  const hasMvpBoundary = nodeExists(n => n.type === 'boundaryNode' && n.data.status === 'MVP');
  if (hasMvpBoundary) {
    const hasMvpInput = nodeExists(n => 
      n.data.status === 'MVP' && 
      (n.data.category === 'Interaction' || hasNameOrId(n, "input") || hasNameOrId(n, "button") || hasNameOrId(n, "touch") || hasNameOrId(n, "press")) &&
      n.type !== 'boundaryNode'
    );
    if (!hasMvpInput) {
      warnings.push({
        id: "warn-mvp-input",
        message: "MVP focus boundary exists, but no MVP-status user input block (Button/Touch) is defined.",
        severity: "critical"
      });
    }
  }

  // 7. If MVP boundary has no feedback block, show warning.
  if (hasMvpBoundary) {
    const hasMvpFeedback = nodeExists(n => 
      n.data.status === 'MVP' && 
      (n.data.category === 'Interaction' || hasNameOrId(n, "feedback") || hasNameOrId(n, "haptic") || hasNameOrId(n, "led") || hasNameOrId(n, "motor") || hasNameOrId(n, "vibrator")) &&
      n.type !== 'boundaryNode' &&
      n.id !== 'user-node' // user is not the feedback block itself
    );
    if (!hasMvpFeedback) {
      warnings.push({
        id: "warn-mvp-feedback",
        message: "MVP focus boundary exists, but no MVP-status user feedback block (Haptic/LED) is defined.",
        severity: "critical"
      });
    }
  }

  return warnings;
};
