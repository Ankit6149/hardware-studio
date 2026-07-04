export interface BlockLibraryItem {
  name: string;
  category: string;
  status: 'MVP' | 'Later' | 'Future' | 'External' | 'Risk' | 'Complete';
  description: string;
  purpose: string;
  requirements: string;
  candidateComponents: string;
  risks: string;
  notes: string;
  testingNotes: string;
  type: 'blockNode' | 'boundaryNode';
  width?: number;
  height?: number;
}

export const blockLibrary: Record<string, BlockLibraryItem[]> = {
  "Product": [
    {
      name: "Hardware Product Container",
      category: "Product",
      status: "MVP",
      description: "A block representing the product assembly as a whole.",
      purpose: "Houses all internal subassemblies.",
      requirements: "Sizing limits, weight distribution targets.",
      candidateComponents: "",
      risks: "Scope creep.",
      notes: "Starting node for product definitions.",
      testingNotes: "",
      type: "blockNode"
    }
  ],
  "Interaction": [
    {
      name: "Capacitive Touch Surface",
      category: "Interaction",
      status: "MVP",
      description: "Touch pad allowing tap/swipe controls.",
      purpose: "Primary user gesture capture.",
      requirements: "Must sense through 0.5mm plastic shell.",
      candidateComponents: "PCB copper pour pad.",
      risks: "False positive triggers due to water or sweat.",
      notes: "Needs software filtering.",
      testingNotes: "Test touch trigger levels in wet environments.",
      type: "blockNode"
    },
    {
      name: "Push Button Input",
      category: "Interaction",
      status: "MVP",
      description: "Physical momentary push button switch.",
      purpose: "Provides clicky feedback and simple logic input.",
      requirements: "IP67/IP68 dust and water protection.",
      candidateComponents: "Panasonic tactile switch.",
      risks: "Mechanical fatigue after 100k cycles.",
      notes: "Easiest input to program.",
      testingNotes: "Run bounce analyzer to define software debounce time.",
      type: "blockNode"
    },
    {
      name: "Haptic Vibrator Feedback",
      category: "Interaction",
      status: "MVP",
      description: "Mechanical vibration feedback to indicate events.",
      purpose: "Silent user notification loop.",
      requirements: "Vibrations feel distinct through enclosure.",
      candidateComponents: "ERM Coin Motor / Linear Resonant Actuator.",
      risks: "High current draw; structural casing resonance.",
      notes: "Success: one short buzz. Error: 3 short buzzes.",
      testingNotes: "Verify haptic drive waveform timings.",
      type: "blockNode"
    },
    {
      name: "RGB LED Indicator",
      category: "Interaction",
      status: "MVP",
      description: "Small multi-color light indicator.",
      purpose: "Shows pairing, battery, or error states visually.",
      requirements: "Visible under direct sunlight.",
      candidateComponents: "WS2812B-B mini addressable LED.",
      risks: "Light leakage inside casing.",
      notes: "Requires a clear lightpipe or thin enclosure wall.",
      testingNotes: "Check light intensity at low power settings.",
      type: "blockNode"
    }
  ],
  "Electronics": [
    {
      name: "Bluetooth MCU / Controller",
      category: "Electronics",
      status: "MVP",
      description: "Main micro-controller containing CPU and BLE radio.",
      purpose: "Manages all state changes and transmits wireless data.",
      requirements: "Ultra-low power sleep state, GPIO interface.",
      candidateComponents: "ESP32-C3, Nordic nRF52832, nRF52805.",
      risks: "Antenna tuning shift due to proximity of metal casing.",
      notes: "Nordic is preferred for battery longevity, ESP32 for quick proto.",
      testingNotes: "Verify deep sleep standby current draw.",
      type: "blockNode"
    },
    {
      name: "TVS ESD Protection",
      category: "Electronics",
      status: "MVP",
      description: "Protection diodes routing high voltage spikes to ground.",
      purpose: "Protects delicate MCU pins from static shocks on exposed buttons.",
      requirements: "Clamping voltage < 6V.",
      candidateComponents: "PESD5V0L1BA.",
      risks: "Failure open-circuit leaves MCU unprotected without warning.",
      notes: "Essential for long-term reliability of human-touch products.",
      testingNotes: "ESD gun stress testing.",
      type: "blockNode"
    },
    {
      name: "6-Axis Motion IMU Sensor",
      category: "Electronics",
      status: "Later",
      description: "Gyroscope and accelerometer measuring angular velocity and linear acceleration.",
      purpose: "Detects hand gestures or steps.",
      requirements: "I2C/SPI bus, low power motion interrupt.",
      candidateComponents: "Bosch BMI270, MPU6050.",
      risks: "High idle current; complex gesture algorithms.",
      notes: "Configure low-g wake interrupt to keep MCU sleeping.",
      testingNotes: "Perform test rotations and verify raw data logs.",
      type: "blockNode"
    },
    {
      name: "MEMS Digital Microphone",
      category: "Electronics",
      status: "Later",
      description: "Compact digital audio capture chip.",
      purpose: "Allows dictating voice commands.",
      requirements: "I2S digital audio output.",
      candidateComponents: "TDK ICS-43434.",
      risks: "High current consumption; acoustic port waterproofing.",
      notes: "Must be active only when command trigger is pressed.",
      testingNotes: "Test sound quality frequency response.",
      type: "blockNode"
    }
  ],
  "Firmware": [
    {
      name: "Firmware State Machine",
      category: "Firmware",
      status: "MVP",
      description: "Core logic loop switching between Boot, Idle, Active, and Sleep modes.",
      purpose: "Governs device state flow.",
      requirements: "Robust error recovery and state lock avoidance.",
      candidateComponents: "FreeRTOS task or bare-metal switch-case.",
      risks: "Infinite loop or deadlock in a specific state.",
      notes: "Watchdog timer must be active.",
      testingNotes: "Run state-transition tests with mock inputs.",
      type: "blockNode"
    },
    {
      name: "BLE GATT Handler",
      category: "Firmware",
      status: "MVP",
      description: "Manages BLE advertisement packets and GATT characteristic read/write triggers.",
      purpose: "Enables standard software communications.",
      requirements: "Custom UUIDs for command stream and haptic feedback.",
      candidateComponents: "NimBLE stack or ESP-GATTS.",
      risks: "Connection drops in congested 2.4GHz spectrum.",
      notes: "Auto-reconnection logic is essential.",
      testingNotes: "Test reconnect speed when toggling phone bluetooth.",
      type: "blockNode"
    },
    {
      name: "Low Battery Deep Sleep",
      category: "Firmware",
      status: "Later",
      description: "Code path triggering deep-sleep mode when battery drops below cut-off voltage.",
      purpose: "Protects rechargeable battery cells from permanent damage.",
      requirements: "Standby current draw < 10uA.",
      candidateComponents: "",
      risks: "Locking the device in deep sleep with no way to wake except charging.",
      notes: "Disable all non-essential interrupts.",
      testingNotes: "Verify power draw when battery pin drops below 3.0V.",
      type: "blockNode"
    }
  ],
  "Mechanical": [
    {
      name: "Outer Casing / Shell",
      category: "Mechanical",
      status: "MVP",
      description: "The cosmetic outer protective ring or device housing.",
      purpose: "Establishes product style, ergonomics, and structural strength.",
      requirements: "Biocompatible surface finish, impact resistance.",
      candidateComponents: "Polished SLA resin, ceramic, anodized aluminum.",
      risks: "Metal casing shielding BLE signals (Faraday cage).",
      notes: "Must include plastic window for RF signals if metal casing is used.",
      testingNotes: "1.5m drop test onto concrete.",
      type: "blockNode"
    },
    {
      name: "Flex PCB Chassis Carrier",
      category: "Mechanical",
      status: "Later",
      description: "Internal plastic support skeleton aligning electronics inside the shell.",
      purpose: "Simplifies assembly, prevents solder joint stress.",
      requirements: "Fits inner ring channel tolerance (<0.1mm).",
      candidateComponents: "3D printed ESD-safe PLA/PETG or molded ABS.",
      risks: "Squeezing flex circuit lines leads to cracking.",
      notes: "A key part of design for manufacturing (DFM).",
      testingNotes: "Fit-test assembly with dummy flex board.",
      type: "blockNode"
    }
  ],
  "Power": [
    {
      name: "Battery Charge IC",
      category: "Power",
      status: "Later",
      description: "Battery charger chip providing regulated CC/CV charging curves.",
      purpose: "Charges rechargeable cells safely.",
      requirements: "Adjustable charge rate down to 10mA, thermal regulation.",
      candidateComponents: "Linear LTC4054, Microchip MCP73831.",
      risks: "Overcharging leading to battery swelling/smoke.",
      notes: "Requires status pin hook to MCU for charging visualization.",
      testingNotes: "Verify cut-off voltage is exactly 4.20V.",
      type: "blockNode"
    },
    {
      name: "Rechargeable LiPo Cell",
      category: "Power",
      status: "Later",
      description: "Rechargeable lithium-polymer pouch or coin cell.",
      purpose: "Supplies system power without tethering.",
      requirements: "3.7V nominal output, capacity 10-30mAh.",
      candidateComponents: "Grepow Pin Cell, tiny pouch cell.",
      risks: "Short circuits due to assembly compression.",
      notes: "PCM protection module must be integrated.",
      testingNotes: "Log temperature under heavy load cycles.",
      type: "blockNode"
    },
    {
      name: "LDO Voltage Regulator",
      category: "Power",
      status: "MVP",
      description: "Low-dropout linear regulator converting 5V/Battery down to stable 3.3V.",
      purpose: "Protects logic circuits from varying battery voltages.",
      requirements: "Low quiescent current, high output capability.",
      candidateComponents: "AP2112K-3.3, XC6206.",
      risks: "Waste heat generated if input voltage is much higher than 3.3V.",
      notes: "Very cheap and easy, but less efficient than buck converters.",
      testingNotes: "Verify dropout voltage under 100mA current spike.",
      type: "blockNode"
    }
  ],
  "Software": [
    {
      name: "Device Host Manager",
      category: "Software",
      status: "MVP",
      description: "Local companion app driver managing Bluetooth links.",
      purpose: "Serves as gateway between ring hardware and System Alpha engine.",
      requirements: "Low battery background listening.",
      candidateComponents: "React Native BLE Manager / Bleak Python.",
      risks: "Operating system killing background bluetooth threads.",
      notes: "Needs persistent service configurations.",
      testingNotes: "Background connection retention tests.",
      type: "blockNode"
    },
    {
      name: "AI Intent Parser",
      category: "Software",
      status: "MVP",
      description: "Software layer analyzing input streams to decode commands.",
      purpose: "Converts gesture/audio inputs into system directives.",
      requirements: "Low latency, handles speech-to-text or pattern mapping.",
      candidateComponents: "System Alpha Cloud LLM or Local Regex intent mapper.",
      risks: "Slow execution time causing latency gap.",
      notes: "Offline processing preferred for speed.",
      testingNotes: "Test processing delay under slow internet speeds.",
      type: "blockNode"
    },
    {
      name: "Permission Layer / Gateway",
      category: "Software",
      status: "MVP",
      description: "Safety checker validating system-level actions.",
      purpose: "Prevents AI from executing harmful commands without confirmation.",
      requirements: "Requires double-click verification for risky tasks.",
      candidateComponents: "Auth validation layer.",
      risks: "Security bypass bugs.",
      notes: "Must reject commands (e.g. format drive) without explicit ring feedback.",
      testingNotes: "Trigger dangerous command mock and verify it is blocked.",
      type: "blockNode"
    }
  ],
  "Testing": [
    {
      name: "UART Log Adapter",
      category: "Testing",
      status: "MVP",
      description: "USB-to-Serial converter routing logs from MCU to PC.",
      purpose: "Real-time print statements for debugging.",
      requirements: "115200 baud rate matching.",
      candidateComponents: "CP2102 USB Bridge.",
      risks: "Ground loops causing noise on analog lines.",
      notes: "Disconnect battery when charging and debug pins are active.",
      testingNotes: "Verify log streams without character corruptions.",
      type: "blockNode"
    }
  ],
  "Boundaries": [
    {
      name: "MVP Focus Boundary",
      category: "Boundaries",
      status: "MVP",
      description: "Visual container representing immediate MVP deliverables.",
      purpose: "Helps scope-control development phase.",
      requirements: "",
      candidateComponents: "",
      risks: "",
      notes: "Omit battery/charging; power over USB.",
      testingNotes: "",
      type: "boundaryNode",
      width: 400,
      height: 300
    },
    {
      name: "Later Phase Boundary",
      category: "Boundaries",
      status: "Later",
      description: "Container for secondary milestone features (battery, casing).",
      purpose: "Defines next roadmap stage.",
      requirements: "",
      candidateComponents: "",
      risks: "",
      notes: "",
      testingNotes: "",
      type: "boundaryNode",
      width: 400,
      height: 300
    }
  ]
};
