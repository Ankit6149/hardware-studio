// schematicERC.ts — Part of Phase 7 Real ERC
import { Project, ReviewResult } from '../types';

export function runSchematicERC(project: Project): ReviewResult[] {
  const results: ReviewResult[] = [];
  const comps = project.boardComponents || [];
  const nets = project.nets || [];
  const padAssignments = project.padNetAssignments || [];

  // Helper to add issue
  const addIssue = (
    severity: 'Info' | 'Warning' | 'Error' | 'Blocker',
    title: string,
    description: string,
    linkedObjectType: 'component' | 'net' | 'pin' | 'wire' | 'general',
    linkedObjectId: string,
    suggestedFix: string
  ) => {
    results.push({
      id: `erc_${linkedObjectId}_${title.replace(/\s+/g, '_').toLowerCase()}`,
      category: 'Schematic ERC',
      severity,
      title,
      description,
      linkedObjectType,
      linkedObjectId,
      suggestedFix,
      autoFixAvailable: false,
      status: 'Open'
    });
  };

  // Rule: Duplicate Reference Designator
  const refdesMap: Record<string, number> = {};
  comps.forEach(c => {
    refdesMap[c.referenceDesignator] = (refdesMap[c.referenceDesignator] || 0) + 1;
  });
  Object.entries(refdesMap).forEach(([ref, count]) => {
    if (count > 1) {
      const offending = comps.find(c => c.referenceDesignator === ref);
      if (offending) {
        addIssue(
          'Error',
          'Duplicate Reference Designator',
          `Multiple components share the designator '${ref}'.`,
          'component',
          offending.id,
          `Rename this designator to '${ref}_new' or resolve duplicates.`
        );
      }
    }
  });

  // Check pin-level rules for each component
  comps.forEach(c => {
    const pins = c.pins || [];

    // Rule: Component missing symbol/footprint definition
    if (!c.footprint) {
      addIssue(
        'Warning',
        'Missing Footprint Definition',
        `Component ${c.referenceDesignator} (${c.componentName}) has no footprint assigned.`,
        'component',
        c.id,
        'Assign a footprint from the footprint library (e.g., SOIC_8, C_0603).'
      );
    }

    // Rules inside pins
    let hasGnd = false;
    let hasPower = false;
    const isMcu = c.componentType.toUpperCase() === 'MCU' || c.componentType.toUpperCase() === 'PROCESSOR';

    pins.forEach(p => {
      // Find assigned net for this pin (either nested or through padAssignments)
      const assignedNet = p.netName || padAssignments.find(
        a => a.componentId === c.id && a.padName === p.pinNumber
      )?.netName;

      // Rule: Unconnected required pin
      if (p.required && !assignedNet && !p.noConnect) {
        addIssue(
          'Error',
          'Unconnected Required Pin',
          `Pin ${p.pinNumber} (${p.pinName}) of ${c.referenceDesignator} is marked required but is not connected.`,
          'component',
          c.id,
          `Connect pin ${p.pinNumber} to its required net or assign a net label.`
        );
      }

      if (assignedNet) {
        const netLower = assignedNet.toLowerCase();
        if (netLower.includes('gnd') || netLower.includes('ground')) {
          hasGnd = true;
        }
        if (netLower.includes('3v3') || netLower.includes('vcc') || netLower.includes('vbat') || netLower.includes('5v')) {
          hasPower = true;
        }
      }
    });

    // Rule: Ground pin without ground connection
    if (pins.some(p => p.electricalType === 'Ground') && !hasGnd) {
      addIssue(
        'Error',
        'Ground Pin Without Ground Net',
        `Component ${c.referenceDesignator} has ground pins but no connection to a GND net.`,
        'component',
        c.id,
        'Add a GND net symbol or wire to the ground terminals.'
      );
    }

    // Rule: Power pin without power connection
    if (pins.some(p => p.electricalType === 'Power Input') && !hasPower) {
      addIssue(
        'Error',
        'Power Pin Without Power Net',
        `Component ${c.referenceDesignator} has power input pins but no connection to a VCC/3V3/VBAT net.`,
        'component',
        c.id,
        'Add a VCC/3V3/VBAT net symbol or wire to the power terminals.'
      );
    }

    // Rule: Decoupling capacitors for MCU
    if (isMcu) {
      // Look for capacitor (C) within 20mm or connected to same power net
      const hasCap = comps.some(
        other =>
          other.id !== c.id &&
          other.referenceDesignator.startsWith('C') &&
          other.circuitBlockId === c.circuitBlockId
      );
      if (!hasCap) {
        addIssue(
          'Warning',
          'Missing Decoupling Capacitor',
          `Microcontroller ${c.referenceDesignator} should have at least one decoupling capacitor close to VCC/VDD.`,
          'component',
          c.id,
          'Add a generic 100nF C_0603 decoupling capacitor next to the power pin.'
        );
      }

      // Rule: MCU without programming/debug interface
      const hasDebug = pins.some(p => {
        const name = p.pinName.toUpperCase();
        return name.includes('SWD') || name.includes('SWCLK') || name.includes('SWDIO') || name.includes('TXD') || name.includes('RXD');
      }) && pins.some(p => {
        const assignedNet = p.netName || padAssignments.find(a => a.componentId === c.id && a.padName === p.pinNumber)?.netName;
        return !!assignedNet;
      });
      if (!hasDebug) {
        addIssue(
          'Info',
          'Missing Programming Interface',
          `Microcontroller ${c.referenceDesignator} has no connected SWD or UART programming pins.`,
          'component',
          c.id,
          'Connect SWDIO/SWCLK/RESET pins to debug headers or pogo pads.'
        );
      }
    }

    // Rule: LED without current-limiting resistor
    if (c.componentType.toUpperCase() === 'LED') {
      const netWithResistor = nets.some(n => {
        // If net contains this LED and also contains a Resistor
        const hasLedPin = padAssignments.some(a => a.componentId === c.id && a.netName === n.netName);
        const hasResistor = padAssignments.some(
          a => a.referenceDesignator.startsWith('R') && a.netName === n.netName
        );
        return hasLedPin && hasResistor;
      });
      if (!netWithResistor) {
        addIssue(
          'Warning',
          'LED Without Resistor',
          `LED ${c.referenceDesignator} is connected directly to nets without an in-series current-limiting resistor.`,
          'component',
          c.id,
          'Insert a 220 Ohm current-limiting resistor in series with the LED.'
        );
      }
    }

    // Rule: I2C bus without pull-ups
    const hasI2C = pins.some(p => {
      const n = (p.netName || '').toUpperCase();
      return n.includes('SDA') || n.includes('SCL');
    });
    if (hasI2C && isMcu) {
      const hasPullups = comps.some(
        other =>
          other.referenceDesignator.startsWith('R') &&
          (other.notes.toLowerCase().includes('pullup') || other.notes.toLowerCase().includes('pull-up') || other.value === '4.7k' || other.value === '10k')
      );
      if (!hasPullups) {
        addIssue(
          'Warning',
          'I2C Bus Missing Pull-Ups',
          'I2C SDA/SCL lines require pull-up resistors to VCC for stable operations.',
          'component',
          c.id,
          'Add two 4.7k pull-up resistors from SDA/SCL to the 3.3V power net.'
        );
      }
    }

    // Rule: Battery without protection
    if (c.componentType.toUpperCase() === 'BATTERY') {
      const hasProtection = comps.some(other => other.componentType.toUpperCase() === 'PROTECTION');
      if (!hasProtection) {
        addIssue(
          'Error',
          'Battery Missing Protection',
          `Battery source connected directly to circuits without a protection IC (e.g. DW01A).`,
          'component',
          c.id,
          'Insert a DW01A battery protection unit between the battery contacts and system load.'
        );
      }
    }
  });

  // Rule: Net with only one connected pin
  nets.forEach(n => {
    const pinsInNet = padAssignments.filter(a => a.netName === n.netName);
    if (pinsInNet.length === 1) {
      addIssue(
        'Warning',
        'Single-Pin Net',
        `Net '${n.netName}' has only one connected pad (${pinsInNet[0].referenceDesignator}.${pinsInNet[0].padName}).`,
        'net',
        n.id,
        'Connect another component pin to this net or delete the net.'
      );
    }
  });

  // Rule: Output-to-Output conflict (multiple Outputs or Power Outputs on the same net)
  nets.forEach(n => {
    const pinsInNet = padAssignments.filter(a => a.netName === n.netName);
    const outputPins = pinsInNet.filter(a => {
      const c = comps.find(comp => comp.id === a.componentId);
      const p = c?.pins?.find(pin => pin.pinNumber === a.padName);
      return p?.electricalType === 'Output' || p?.electricalType === 'Power Output';
    });
    if (outputPins.length > 1) {
      const names = outputPins.map(op => {
        const c = comps.find(comp => comp.id === op.componentId);
        return `${c?.referenceDesignator || 'U'}.${op.padName}`;
      }).join(', ');
      addIssue(
        'Error',
        'Output Pin Conflict',
        `Multiple output pins (${names}) are connected to net '${n.netName}'. This creates a driving conflict.`,
        'net',
        n.id,
        'Disconnect one of the outputs or insert a buffer/gate.'
      );
    }
  });

  // Rule: Incompatible voltage connections (e.g., 5V output driving 3.3V input)
  nets.forEach(n => {
    const pinsInNet = padAssignments.filter(a => a.netName === n.netName);
    let voltage5V = false;
    let voltage3V3 = false;
    pinsInNet.forEach(op => {
      const c = comps.find(comp => comp.id === op.componentId);
      const p = c?.pins?.find(pin => pin.pinNumber === op.padName);
      if (p) {
        const pinNameUpper = (p.pinName || '').toUpperCase();
        if (pinNameUpper.includes('5V') || pinNameUpper.includes('VBUS')) voltage5V = true;
        if (pinNameUpper.includes('3V3') || pinNameUpper.includes('VDD')) voltage3V3 = true;
      }
    });
    if (voltage5V && voltage3V3) {
      addIssue(
        'Error',
        'Incompatible Voltage Rail Connection',
        `Net '${n.netName}' connects both 5V and 3.3V terminals together, which can cause component damage.`,
        'net',
        n.id,
        'Isolate the rails or add a level shifter / voltage regulator.'
      );
    }
  });

  return results;
}
