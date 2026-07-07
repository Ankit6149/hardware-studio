import { Project } from '../../types';

export const theRingTemplate: Project = {
  id: "the-ring",
  projectName: "The Ring",
  description: "The Ring is a smart wearable command/input device. It captures user intent through touch and provides haptic response.",
  createdAt: "2026-07-04T12:00:00Z",
  updatedAt: "2026-07-04T12:00:00Z",
  templateName: "The Ring",
  version: "1.0",
  activeView: "master",
  batteryCapacityMah: 18,
  powerBudget: [
    { id: "pb-mcu", blockName: "BLE MCU / Controller", voltage: "3.3", activeCurrentMa: 15.0, sleepCurrentUa: 15.0, dutyCyclePercent: 5.0, quantity: 1, notes: "Nordic/ESP32 processing cycles." },
    { id: "pb-haptic", blockName: "Haptic Motor Output", voltage: "3.3", activeCurrentMa: 80.0, sleepCurrentUa: 0.0, dutyCyclePercent: 1.0, quantity: 1, notes: "Vibration feedback spikes." },
    { id: "pb-touch", blockName: "Button / Touch Input Circuit", voltage: "3.3", activeCurrentMa: 1.5, sleepCurrentUa: 5.0, dutyCyclePercent: 10.0, quantity: 1, notes: "Capacitive polling cycles." }
  ],
  pinMap: [
    { id: "pm-1", signalName: "TOUCH_SENSE", connectedBlock: "button-touch-zone", mcuPin: "GPIO_4", direction: "Input", protocol: "Touch", voltage: "3.3V", notes: "Connects to capacitive copper foil." },
    { id: "pm-2", signalName: "HAPTIC_PWM", connectedBlock: "haptic-motor-output", mcuPin: "GPIO_5", direction: "Output", protocol: "PWM", voltage: "3.3V", notes: "Drives the haptic BJT switch." },
    { id: "pm-3", signalName: "DEBUG_TX", connectedBlock: "debug-led", mcuPin: "GPIO_21", direction: "Output", protocol: "UART", voltage: "3.3V", notes: "Console output line." }
  ],
  firmwareTasks: [
    { id: "ft-1", name: "Boot sequence and power initialization", type: "State", linkedBlock: "ble-mcu", priority: "MVP", status: "Not Started", description: "Initialize CPU frequency and BLE profiles.", acceptanceCriteria: "Console outputs boot logs successfully.", notes: "" },
    { id: "ft-2", name: "Button Debounce and Interrupt Handler", type: "Driver", linkedBlock: "button-input-circuit", priority: "MVP", status: "Not Started", description: "Setup interrupt on GPIO state change.", acceptanceCriteria: "Detect click events on scope.", notes: "" }
  ],
  nodes: [
    // --- MASTER BLUEPRINT VIEW ---
    {
      id: "user-node",
      type: "blockNode",
      position: { x: 50, y: 200 },
      data: {
        name: "User Interaction",
        category: "Interaction",
        status: "Complete",
        description: "The user presses, holds, or double-clicks the ring's touch surface.",
        purpose: "Initiates control actions and receives haptic confirmation.",
        requirements: "Physical contact, ergonomic accessibility.",
        candidateComponents: "Human thumb/finger, capacitive ring surface.",
        risks: "False triggers, varying finger sizes, comfort.",
        notes: "Primary trigger point of the entire system.",
        testingNotes: "Validate touch response across various users.",
        views: ["master"],
        positions: { master: { x: 50, y: 200 } }
      }
    },
    {
      id: "ring-hardware",
      type: "blockNode",
      position: { x: 250, y: 200 },
      data: {
        name: "Ring Hardware Inside",
        category: "Product",
        status: "MVP",
        description: "The physical architecture inside the ring shell, including MCU, touch sensor, and haptic motor.",
        purpose: "Houses components and manages electrical connections.",
        requirements: "Ultra-small form factor, light weight, durable.",
        candidateComponents: "ESP32-C3/S3 prototype, custom flex PCB.",
        risks: "Space constraints, thermal management, battery life.",
        notes: "Subject to high miniaturization pressure.",
        testingNotes: "Check fit of MCU development board inside proto shell.",
        views: ["master"],
        positions: { master: { x: 250, y: 200 } }
      }
    },
    {
      id: "ring-firmware",
      type: "blockNode",
      position: { x: 450, y: 200 },
      data: {
        name: "Ring Firmware Logic",
        category: "Firmware",
        status: "MVP",
        description: "On-device code handling boot, touch sensing, power states, and BLE events.",
        purpose: "Processes inputs and controls outputs on the wearable.",
        requirements: "Low latency (<50ms), ultra-low power states.",
        candidateComponents: "ESP-IDF C++ or Arduino C++ codebase.",
        risks: "BLE disconnects, high standby power draw, debounce issues.",
        notes: "Must be optimized for sleep modes to extend battery.",
        testingNotes: "Run cycle count tests to verify deep sleep transition.",
        views: ["master"],
        positions: { master: { x: 450, y: 200 } }
      }
    },
    {
      id: "system-alpha-external",
      type: "blockNode",
      position: { x: 650, y: 200 },
      data: {
        name: "System Alpha External Logic",
        category: "Software",
        status: "External",
        description: "The cloud/companion software brain that decodes gesture commands and executes workflows.",
        purpose: "Handles heavy processing, auth, and external actions.",
        requirements: "High availability, secure permission layer.",
        candidateComponents: "System Alpha Local Engine / API Server.",
        risks: "Network latency, unauthorized remote command injection.",
        notes: "Strict separation of concerns: Ring has zero business logic.",
        testingNotes: "Inject mock events to verify response time.",
        views: ["master"],
        positions: { master: { x: 650, y: 200 } }
      }
    },
    {
      id: "user-feedback",
      type: "blockNode",
      position: { x: 850, y: 200 },
      data: {
        name: "Haptic Feedback Loop",
        category: "Interaction",
        status: "MVP",
        description: "Vibration pulses felt by the user indicating command success, error, or status.",
        purpose: "Closes the interaction loop without requiring a screen.",
        requirements: "Distinct, recognizable vibration patterns.",
        candidateComponents: "LRA coin motor, haptic driver IC.",
        risks: "Sensation dampened by enclosure, high momentary current.",
        notes: "Success: short buzz. Error: triple buzz. Permission check: double buzz.",
        testingNotes: "User test pattern recognition with 10 participants.",
        views: ["master"],
        positions: { master: { x: 850, y: 200 } }
      }
    },
    {
      id: "mvp-boundary",
      type: "boundaryNode",
      position: { x: 20, y: 130 },
      data: {
        name: "MVP Focus Zone",
        category: "Boundaries",
        status: "MVP",
        description: "Boundaries of the initial prototype utilizing development boards and wired power.",
        purpose: "Maintains scope focus on basic input-output loop validation.",
        requirements: "",
        candidateComponents: "",
        risks: "",
        notes: "All blocks in this zone must be built now.",
        testingNotes: "",
        views: ["master"],
        positions: { master: { x: 20, y: 130 } }
      },
      width: 530,
      height: 220
    },
    {
      id: "later-boundary",
      type: "boundaryNode",
      position: { x: 570, y: 130 },
      data: {
        name: "Later Phase Scope",
        category: "Boundaries",
        status: "Later",
        description: "Integration with real System Alpha host software and haptic reply engines.",
        purpose: "Outlines second-stage software integration.",
        requirements: "",
        candidateComponents: "",
        risks: "",
        notes: "Requires secure credentials and stable local networking.",
        testingNotes: "",
        views: ["master"],
        positions: { master: { x: 570, y: 130 } }
      },
      width: 400,
      height: 220
    },
    {
      id: "future-boundary",
      type: "boundaryNode",
      position: { x: 990, y: 130 },
      data: {
        name: "Future AirPulse Context",
        category: "Boundaries",
        status: "Future",
        description: "Context for future smart-hub and local room sensor syncing.",
        purpose: "Long-term hardware ecosystem compatibility.",
        requirements: "",
        candidateComponents: "",
        risks: "",
        notes: "AirPulse is NOT in active development.",
        testingNotes: "",
        views: ["master"],
        positions: { master: { x: 990, y: 130 } }
      },
      width: 200,
      height: 220
    },

    // --- OUTER DESIGN VIEW (Physical Appearance Planning) ---
    {
      id: "simple-ring",
      type: "blockNode",
      position: { x: 50, y: 100 },
      data: {
        name: "Simple Circular Band",
        category: "Mechanical",
        status: "MVP",
        description: "Traditional circular profile ring shell with standard sizing options (sizes 8-12).",
        purpose: "Baseline aesthetic testing for comfort and look.",
        requirements: "Smooth inner bore, wall thickness under 2.5mm.",
        candidateComponents: "3D printed resin (Tough 2000), cast silver later.",
        risks: "Squeezing electronics into circular bend.",
        notes: "Hardest to package, easiest to wear.",
        testingNotes: "Print size templates to test hand fit.",
        views: ["outer"],
        positions: { outer: { x: 50, y: 100 } }
      }
    },
    {
      id: "open-ring",
      type: "blockNode",
      position: { x: 260, y: 100 },
      data: {
        name: "Open Tension-Fit Ring",
        category: "Mechanical",
        status: "Later",
        description: "A C-shaped ring profile that flexes slightly to adjust to finger size changes.",
        purpose: "Reduces inventory SKU counts by fitting multiple sizes.",
        requirements: "Spring-back elasticity in mechanical structure.",
        candidateComponents: "Beryllium copper core or spring steel insert.",
        risks: "Fatigue failure at stress points, skin pinching.",
        notes: "Solves swelling finger comfort issues.",
        testingNotes: "Cycle-test spring flex 5,000 times.",
        views: ["outer"],
        positions: { outer: { x: 260, y: 100 } }
      }
    },
    {
      id: "top-pod-ring",
      type: "blockNode",
      position: { x: 470, y: 100 },
      data: {
        name: "Top Electronics Pod Ring",
        category: "Mechanical",
        status: "Later",
        description: "Circular band with a flat, slightly raised rectangular platform at the top.",
        purpose: "Provides a flat zone for rigid components and battery.",
        requirements: "Ergonomic slope to prevent snagging.",
        candidateComponents: "CNC machined aluminum housing.",
        risks: "Looks bulky or 'obvious tech', shifts center of mass.",
        notes: "Allows standard flat rigid PCB design instead of complex flex PCB.",
        testingNotes: "Wear mock flat-top ring for 24 hours to observe snagging.",
        views: ["outer"],
        positions: { outer: { x: 470, y: 100 } }
      }
    },
    {
      id: "hybrid-ring",
      type: "blockNode",
      position: { x: 680, y: 100 },
      data: {
        name: "Hybrid Elastic Inner Sleeve",
        category: "Mechanical",
        status: "Future",
        description: "Rigid metal exterior shell with a soft, medical-grade elastomer lining.",
        purpose: "Ensures snug contact with skin for sensors and comfort.",
        requirements: "Biocompatible elastomer (USP Class VI), secure bonding.",
        candidateComponents: "Double-shot injection molded TPU on titanium.",
        risks: "Elastomer peeling away over time, sweat degradation.",
        notes: "Important for heart rate or body temperature sensors.",
        testingNotes: "Submerge in synthetic sweat at 40C for 7 days.",
        views: ["outer"],
        positions: { outer: { x: 680, y: 100 } }
      }
    },
    {
      id: "minimal-premium",
      type: "blockNode",
      position: { x: 50, y: 300 },
      data: {
        name: "Minimal Premium Surface",
        category: "Mechanical",
        status: "MVP",
        description: "No markings, buttons, or lights visible from the outside of the ring band.",
        purpose: "Ensures stealth, luxury jewelry appearance.",
        requirements: "Sub-surface touch sensing through metallic/ceramic shell.",
        candidateComponents: "Zirconia ceramic (ZrO2) or PVD coated titanium.",
        risks: "Signal attenuation (RF and capacitive touch) through metal.",
        notes: "Touch must work reliably through a 0.5mm shell.",
        testingNotes: "Test touch sensitivity through zirconia plates.",
        views: ["outer"],
        positions: { outer: { x: 50, y: 300 } }
      }
    },
    {
      id: "hidden-intel",
      type: "blockNode",
      position: { x: 260, y: 300 },
      data: {
        name: "Hidden Intelligence Detail",
        category: "Mechanical",
        status: "MVP",
        description: "Small details like a subtle inner bevel or dual texture to guide touch position.",
        purpose: "Tactile feedback so user knows orientation without looking.",
        requirements: "Tactile ridge at the bottom/inside.",
        candidateComponents: "Micro-milled ridge or laser etched texture.",
        risks: "Irritates skin during long wear.",
        notes: "Helps position the touch surface directly under the thumb.",
        testingNotes: "Verify orientation correctness by feel in pitch dark.",
        views: ["outer"],
        positions: { outer: { x: 260, y: 300 } }
      }
    },
    {
      id: "comfort-sizing",
      type: "blockNode",
      position: { x: 470, y: 300 },
      data: {
        name: "Comfort Sizing Strategy",
        category: "Mechanical",
        status: "MVP",
        description: "Comfort-fit curved interior (convex profile) to reduce skin-contact surface area.",
        purpose: "Reduces humidity buildup and increases wearing comfort.",
        requirements: "Radial curvature: 0.15mm convex curve.",
        candidateComponents: "CNC internal lathe profile.",
        risks: "Slightly reduces internal volume for electronics.",
        notes: "High user priority. Standard rings cause moisture trap.",
        testingNotes: "Compare flat vs convex ring comfort over 3 days.",
        views: ["outer"],
        positions: { outer: { x: 470, y: 300 } }
      }
    },
    {
      id: "no-obvious-tech",
      type: "blockNode",
      position: { x: 680, y: 300 },
      data: {
        name: "No Obvious Tech Look",
        category: "Mechanical",
        status: "MVP",
        description: "Design standard: completely omit charging ports, display screens, and status LEDs from the exterior.",
        purpose: "Preserves the 'normal jewelry' design direction.",
        requirements: "Wireless charging only; LED shine-through plastic/ceramic interior.",
        candidateComponents: "Qi-compatible charging coil, inner light-pipe.",
        risks: "User confusion about battery level or connection state.",
        notes: "Requires a highly intuitive haptic or companion app solution.",
        testingNotes: "Confirm user is not confused about charging state during tests.",
        views: ["outer"],
        positions: { outer: { x: 680, y: 300 } }
      }
    },

    // --- INTERNAL LAYOUT VIEW (Physical Placement Zone Planning) ---
    {
      id: "top-elec-zone",
      type: "blockNode",
      position: { x: 50, y: 100 },
      data: {
        name: "Top Electronics Zone",
        category: "Mechanical",
        status: "MVP",
        description: "Upper 120-degree arc of the ring shell dedicated to the MCU and active electronics.",
        purpose: "Simplifies assembly by keeping rigid PCB parts at the flat top.",
        requirements: "Shielded from skin contact to avoid heat transfer.",
        candidateComponents: "Rigid-flex PCB assembly area.",
        risks: "Concentrates mass at top, causing ring to spin on finger.",
        notes: "Must balance with battery weight at the bottom.",
        testingNotes: "Check weight distribution of dummy prototype.",
        views: ["internal"],
        positions: { internal: { x: 50, y: 100 } }
      }
    },
    {
      id: "button-touch-zone",
      type: "blockNode",
      position: { x: 260, y: 100 },
      data: {
        name: "Button / Touch Zone",
        category: "Mechanical",
        status: "MVP",
        description: "Flat external section at top of the ring for capacitive or clicky inputs.",
        purpose: "Primary interaction target for the user's thumb.",
        requirements: "Waterproof sealing (IP68), electrical isolation.",
        candidateComponents: "Copper foil capacitive pad, ultra-thin dome switch.",
        risks: "Water droplets triggering false commands.",
        notes: "Requires firmware filtering for ambient moisture.",
        testingNotes: "Test touch triggering under running tap water.",
        views: ["internal"],
        positions: { internal: { x: 260, y: 100 } }
      }
    },
    {
      id: "haptic-zone",
      type: "blockNode",
      position: { x: 470, y: 100 },
      data: {
        name: "Haptic Zone",
        category: "Mechanical",
        status: "MVP",
        description: "Side section of the ring containing the vibration motor.",
        purpose: "Transmits sharp pulses to the side of the finger (sensitive zone).",
        requirements: "Direct mechanical coupling to inner metallic shell.",
        candidateComponents: "Coin ERM vibration motor (diameter 8mm, thick 2mm).",
        risks: "Solder joint breakage due to motor vibrations.",
        notes: "Must be securely glued or press-fitted into frame slot.",
        testingNotes: "Measure acceleration transfer to finger bone mockup.",
        views: ["internal"],
        positions: { internal: { x: 470, y: 100 } }
      }
    },
    {
      id: "antenna-keepout",
      type: "blockNode",
      position: { x: 680, y: 100 },
      data: {
        name: "Antenna Keep-Out Zone",
        category: "Mechanical",
        status: "MVP",
        description: "Section of ring structure free of copper, ground planes, or metal casing.",
        purpose: "Prevents bluetooth signal blockage by hand tissue or metal casing.",
        requirements: "1.5mm distance from metal elements; plastic window.",
        candidateComponents: "Resin/ceramic window insert in titanium band.",
        risks: "Severe signal attenuation when fist is clenched.",
        notes: "Positioned on top-most surface to point away from hand.",
        testingNotes: "Measure RSSI at 1m distance with finger fully wrapped.",
        views: ["internal"],
        positions: { internal: { x: 680, y: 100 } }
      }
    },
    {
      id: "skin-comfort-zone",
      type: "blockNode",
      position: { x: 50, y: 300 },
      data: {
        name: "Skin Comfort Zone",
        category: "Mechanical",
        status: "MVP",
        description: "The entire inner circumference that touches the finger.",
        purpose: "Maintains skin health and comfortable wear.",
        requirements: "No exposed copper, no sharp edges, non-allergenic material.",
        candidateComponents: "Medical grade epoxy coating, ceramic interior cover.",
        risks: "Contact dermatitis, sweat accumulation, heat from MCU.",
        notes: "Keep surface temperatures below 38 degrees C at all times.",
        testingNotes: "Monitor thermal profile under continuous BLE transmitting.",
        views: ["internal"],
        positions: { internal: { x: 50, y: 300 } }
      }
    },
    {
      id: "pcb-zone",
      type: "blockNode",
      position: { x: 260, y: 300 },
      data: {
        name: "PCB Zone",
        category: "Mechanical",
        status: "MVP",
        description: "Internal physical channel for the PCB assembly.",
        purpose: "Secures circuits and controls routing paths.",
        requirements: "Curved rigid PCB segment or multi-segment flex PCB.",
        candidateComponents: "0.4mm thin FR4 board or 0.15mm Polyimide FPC.",
        risks: "Delamination of copper under repeated bend stress during assembly.",
        notes: "Flex PCB allows fitting around the top half curve.",
        testingNotes: "Confirm minimum bend radius of polyimide layer.",
        views: ["internal"],
        positions: { internal: { x: 260, y: 300 } }
      }
    },
    {
      id: "battery-zone-later",
      type: "blockNode",
      position: { x: 470, y: 300 },
      data: {
        name: "Battery Zone (Later)",
        category: "Mechanical",
        status: "Later",
        description: "Bottom 90-degree arc of the ring casing reserved for the battery.",
        purpose: "Balances the weight of the electronics at the top.",
        requirements: "Protective rigid vault to prevent battery puncture.",
        candidateComponents: "Curved Lithium Polymer cell (15-20mAh).",
        risks: "Fire hazard in case of mechanical crash or drop.",
        notes: "Battery must be mechanically shielded from external pressure.",
        testingNotes: "Perform drop tests on empty mechanical mockup.",
        views: ["internal"],
        positions: { internal: { x: 470, y: 300 } }
      }
    },
    {
      id: "charging-contact-zone",
      type: "blockNode",
      position: { x: 680, y: 300 },
      data: {
        name: "Charging Contact Zone (Later)",
        category: "Mechanical",
        status: "Later",
        description: "Two small exposed metal points on the inner ring surface.",
        purpose: "Delivers power from cradle charger to PMIC.",
        requirements: "Corrosion resistant gold plating, sealed contacts.",
        candidateComponents: "Pogo pin targets, gold plating (ENIG or thicker).",
        risks: "Short circuits due to sweat/moisture conductivity.",
        notes: "Requires reverse-current protection diode inside ring.",
        testingNotes: "Submerge in saltwater and verify no galvanic corrosion.",
        views: ["internal"],
        positions: { internal: { x: 680, y: 300 } }
      }
    },

    // --- ELECTRONICS VIEW (Circuits and Components) ---
    {
      id: "ble-mcu",
      type: "blockNode",
      position: { x: 300, y: 180 },
      data: {
        name: "BLE MCU / Controller",
        category: "Electronics",
        status: "MVP",
        description: "Main controller for input detection, BLE events, and haptic feedback.",
        purpose: "Controls ring firmware, communication, and state machine.",
        requirements: "GPIO, BLE 5.0, deep sleep modes, 3.3V supply.",
        candidateComponents: "ESP32-C3 for proto, Nordic nRF52832/52805 later.",
        risks: "Power consumption in active BLE mode, antenna tuning.",
        notes: "ESP32 is power-hungry; must use aggressive sleep states.",
        testingNotes: "Verify BLE event transmission latency.",
        views: ["electronics", "power"],
        positions: {
          electronics: { x: 300, y: 180 },
          power: { x: 380, y: 180 }
        }
      }
    },
    {
      id: "button-input-circuit",
      type: "blockNode",
      position: { x: 50, y: 180 },
      data: {
        name: "Button / Touch Input Circuit",
        category: "Electronics",
        status: "MVP",
        description: "Hardware debounce and input detection routing for the touch controller.",
        purpose: "Converts touch/button action into clean digital logic levels.",
        requirements: "Hardware pull-up/pull-down, ESD protection diode.",
        candidateComponents: "10k resistor, TVS diode array.",
        risks: "Static electricity shock from hand damaging MCU pin.",
        notes: "Crucial for protecting the MCU from user static shock.",
        testingNotes: "ESD spark testing up to 8kV.",
        views: ["electronics", "power"],
        positions: {
          electronics: { x: 50, y: 180 },
          power: { x: 120, y: 280 }
        }
      }
    },
    {
      id: "haptic-motor-output",
      type: "blockNode",
      position: { x: 550, y: 180 },
      data: {
        name: "Haptic Motor Output",
        category: "Electronics",
        status: "MVP",
        description: "Actuator and driving circuit for physical haptic pulses.",
        purpose: "Converts electrical drive signals to physical vibrations.",
        requirements: "High peak current capability, quick start/stop times.",
        candidateComponents: "Coin ERM motor + BJT/MOSFET driver switch.",
        risks: "Back-EMF spike damaging MCU without flyback diode.",
        notes: "Requires flyback diode and bulk capacitor.",
        testingNotes: "Measure vibration response latency from command.",
        views: ["electronics", "power"],
        positions: {
          electronics: { x: 550, y: 180 },
          power: { x: 620, y: 280 }
        }
      }
    },
    {
      id: "debug-led",
      type: "blockNode",
      position: { x: 550, y: 50 },
      data: {
        name: "Debug LED",
        category: "Electronics",
        status: "MVP",
        description: "Small internal LED for board-level troubleshooting (status, error).",
        purpose: "Visual confirmation of states during developer prototyping.",
        requirements: "Current limiting resistor, low current draw.",
        candidateComponents: "0402 SMD Red LED + 1k resistor.",
        risks: "None. Strictly for debugging.",
        notes: "Omit in production ring outer design, visible only through board.",
        testingNotes: "Check blink codes on firmware crash.",
        views: ["electronics"],
        positions: { electronics: { x: 550, y: 50 } }
      }
    },
    {
      id: "usb-power",
      type: "blockNode",
      position: { x: 300, y: 350 },
      data: {
        name: "USB / Prototype Power",
        category: "Power",
        status: "MVP",
        description: "Wired power system for prototyping using development board USB port.",
        purpose: "Supplies steady power during development, bypassing battery.",
        requirements: "5V input from USB converted to 3.3V rail.",
        candidateComponents: "On-board LDO regulator (AP2112K-3.3).",
        risks: "LDO thermal throttling if drawing high haptic current.",
        notes: "Temporary for prototyping stage only.",
        testingNotes: "Verify 3.3V line remains stable under maximum load.",
        views: ["electronics", "power"],
        positions: {
          electronics: { x: 300, y: 350 },
          power: { x: 120, y: 80 }
        }
      }
    },
    {
      id: "battery-later",
      type: "blockNode",
      position: { x: 50, y: 350 },
      data: {
        name: "Battery (Later)",
        category: "Power",
        status: "Later",
        description: "Rechargeable miniature battery pack for wire-free operation.",
        purpose: "Stores and delivers mobile operating power.",
        requirements: "3.7V nominal, ultra-compact size, capacity >15mAh.",
        candidateComponents: "Lithium Polymer Coin/Pin cell.",
        risks: "Over-discharge, thermal runaway, short circuits.",
        notes: "Requires dedicated protection circuit module (PCM).",
        testingNotes: "Perform capacity discharge rate tests.",
        views: ["electronics", "power"],
        positions: {
          electronics: { x: 50, y: 350 },
          power: { x: 380, y: 380 }
        }
      }
    },
    {
      id: "charging-later",
      type: "blockNode",
      position: { x: 180, y: 470 },
      data: {
        name: "Charging (Later)",
        category: "Power",
        status: "Later",
        description: "Circuit managing current and voltage limits to safely recharge the battery.",
        purpose: "Safely refills battery capacity from external source.",
        requirements: "Constant-current/Constant-voltage algorithm.",
        candidateComponents: "TP4056 or Linear LTC4054 charger IC.",
        risks: "Overcharging leading to swelling or fire.",
        notes: "Charge current set low (10-15mA) due to tiny battery size.",
        testingNotes: "Log temperature curve during charge cycles.",
        views: ["electronics", "power"],
        positions: {
          electronics: { x: 180, y: 470 },
          power: { x: 120, y: 380 }
        }
      }
    },
    {
      id: "pmic-later",
      type: "blockNode",
      position: { x: 380, y: 470 },
      data: {
        name: "Power Management (Later)",
        category: "Power",
        status: "Later",
        description: "Regulates battery voltage down to stable 3.3V and handles shutoffs.",
        purpose: "Ensures clean power delivery and protects battery health.",
        requirements: "Low quiescent current (<1uA), high efficiency.",
        candidateComponents: "Buck-Boost Converter or Ultra-low-dropout regulator.",
        risks: "Voltage drop under high loads (haptic burst).",
        notes: "Must prevent battery from discharging below 3.0V.",
        testingNotes: "Measure battery protection cut-off voltage.",
        views: ["electronics", "power"],
        positions: {
          electronics: { x: 380, y: 470 },
          power: { x: 620, y: 380 }
        }
      }
    },
    {
      id: "mic-later",
      type: "blockNode",
      position: { x: 50, y: 50 },
      data: {
        name: "Microphone (Later)",
        category: "Electronics",
        status: "Later",
        description: "Miniature microphone for local voice commands routed to System Alpha.",
        purpose: "Captures user voice when command mode is triggered.",
        requirements: "I2S digital output, compact size, ultra-low power standby.",
        candidateComponents: "INMP441 or ICS-43434 MEMS mic.",
        risks: "Acoustic port clogging with dust/sweat, privacy concerns.",
        notes: "Needs physical sound port hole in mechanical design.",
        testingNotes: "Test audio signal-to-noise ratio in loud environments.",
        views: ["electronics"],
        positions: { electronics: { x: 50, y: 50 } }
      }
    },
    {
      id: "imu-later",
      type: "blockNode",
      position: { x: 180, y: 50 },
      data: {
        name: "IMU Sensor (Later)",
        category: "Electronics",
        status: "Later",
        description: "6-axis motion sensor to detect hand gestures (flicks, rotations).",
        purpose: "Enables gesture interaction controls.",
        requirements: "I2C/SPI interface, low-power motion interrupt.",
        candidateComponents: "BMI270 or MPU6050 accelerometer/gyro.",
        risks: "False gesture triggers from daily hand motions.",
        notes: "Uses on-chip step detector / interrupt to wake up MCU.",
        testingNotes: "Measure gesture detection accuracy algorithm.",
        views: ["electronics"],
        positions: { electronics: { x: 180, y: 50 } }
      }
    },
    {
      id: "antenna-rf",
      type: "blockNode",
      position: { x: 300, y: 50 },
      data: {
        name: "Antenna / BLE RF Zone",
        category: "Electronics",
        status: "MVP",
        description: "RF matching network and antenna configuration for Bluetooth transmission.",
        purpose: "Ensures stable wireless communication link.",
        requirements: "50-ohm impedance matching, clear radiation path.",
        candidateComponents: "PCB trace antenna or chip antenna (Johanson).",
        risks: "Metal ring body detuning antenna frequency.",
        notes: "Requires network analyzer calibration during board spin.",
        testingNotes: "Measure RF path loss and RSSI.",
        views: ["electronics"],
        positions: { electronics: { x: 300, y: 50 } }
      }
    },
    {
      id: "debug-pins",
      type: "blockNode",
      position: { x: 550, y: 350 },
      data: {
        name: "Debug / Programming Pins",
        category: "Electronics",
        status: "MVP",
        description: "Exposed pads on PCB for flashing firmware and UART logging.",
        purpose: "Allows physical coding access to the MCU.",
        requirements: "TX, RX, Boot, Reset, GND, 3.3V pads.",
        candidateComponents: "Pogo pin test pads (1mm diameter).",
        risks: "Shorting out during assembly or battery installation.",
        notes: "Must be sealed inside ring casing after final assembly.",
        testingNotes: "Test automated flash jig connection reliability.",
        views: ["electronics"],
        positions: { electronics: { x: 550, y: 350 } }
      }
    },

    // --- FIRMWARE VIEW (Behavior and States) ---
    {
      id: "fw-boot",
      type: "blockNode",
      position: { x: 50, y: 180 },
      data: {
        name: "Boot State",
        category: "Firmware",
        status: "MVP",
        description: "Initial startup, hardware self-check, and memory load.",
        purpose: "Safely initializes hardware peripherals before loop.",
        requirements: "Execute in under 10ms.",
        candidateComponents: "Bootloader, GPIO configs.",
        risks: "Locked pins causing startup freeze.",
        notes: "Triggers debug LED flash on success.",
        testingNotes: "Verify boot time using logic analyzer.",
        views: ["firmware"],
        positions: { firmware: { x: 50, y: 180 } }
      }
    },
    {
      id: "fw-idle",
      type: "blockNode",
      position: { x: 180, y: 180 },
      data: {
        name: "Idle State",
        category: "Firmware",
        status: "MVP",
        description: "Low-power state waiting for touch interrupt or incoming BLE event.",
        purpose: "Saves energy during inactive periods.",
        requirements: "MCU in light sleep, interrupts active.",
        candidateComponents: "ESP light-sleep timers.",
        risks: "Slow wakeup latency (>10ms) missing brief touches.",
        notes: "Default state for 99% of device lifetime.",
        testingNotes: "Measure idle current consumption.",
        views: ["firmware"],
        positions: { firmware: { x: 180, y: 180 } }
      }
    },
    {
      id: "fw-input-det",
      type: "blockNode",
      position: { x: 320, y: 180 },
      data: {
        name: "Input Detection",
        category: "Firmware",
        status: "MVP",
        description: "Sensing algorithm to capture touch events and filter noise.",
        purpose: "Detects human touch while ignoring accidental brushes.",
        requirements: "Software debounce delay (20ms).",
        candidateComponents: "Capacitive touch library.",
        risks: "Debounce too long feels sluggish, too short double-registers.",
        notes: "Outputs clean click, double-click, and hold states.",
        testingNotes: "Simulate click speeds to verify debounce threshold.",
        views: ["firmware"],
        positions: { firmware: { x: 320, y: 180 } }
      }
    },
    {
      id: "fw-single-press",
      type: "blockNode",
      position: { x: 470, y: 50 },
      data: {
        name: "Single Press Event",
        category: "Firmware",
        status: "MVP",
        description: "Detection of a single brief press and release.",
        purpose: "Triggers standard quick action event.",
        requirements: "Duration: 50ms to 400ms.",
        candidateComponents: "State machine check.",
        risks: "None.",
        notes: "Sends code 'SINGLE_PRESS' via BLE.",
        testingNotes: "Check payload matches specification.",
        views: ["firmware"],
        positions: { firmware: { x: 470, y: 50 } }
      }
    },
    {
      id: "fw-double-press",
      type: "blockNode",
      position: { x: 470, y: 150 },
      data: {
        name: "Double Press Event",
        category: "Firmware",
        status: "MVP",
        description: "Detection of two rapid presses within a short window.",
        purpose: "Triggers secondary or toggle action.",
        requirements: "Gap: <300ms between presses.",
        candidateComponents: "State timer tracker.",
        risks: "Confused with two single presses if timer is misconfigured.",
        notes: "Sends code 'DOUBLE_PRESS' via BLE.",
        testingNotes: "Confirm double-click works at high speeds.",
        views: ["firmware"],
        positions: { firmware: { x: 470, y: 150 } }
      }
    },
    {
      id: "fw-long-press-start",
      type: "blockNode",
      position: { x: 470, y: 250 },
      data: {
        name: "Long Press Start",
        category: "Firmware",
        status: "MVP",
        description: "Detection when user presses and holds for over 500ms.",
        purpose: "Enables continuous actions (e.g., voice listening start).",
        requirements: "Press duration exceeds 500ms.",
        candidateComponents: "State machine timer.",
        risks: "None.",
        notes: "Sends 'HOLD_START' immediately when timer hits threshold.",
        testingNotes: "Verify hold trigger fires at exactly 500ms.",
        views: ["firmware"],
        positions: { firmware: { x: 470, y: 250 } }
      }
    },
    {
      id: "fw-long-press-end",
      type: "blockNode",
      position: { x: 470, y: 350 },
      data: {
        name: "Long Press End",
        category: "Firmware",
        status: "MVP",
        description: "Detection when user releases touch after a long press.",
        purpose: "Stops continuous action (e.g., stop voice listening).",
        requirements: "Touch release after HOLD_START has fired.",
        candidateComponents: "State machine release handler.",
        risks: "Lost event if BLE connection drops during hold.",
        notes: "Sends 'HOLD_END' payload.",
        testingNotes: "Confirm hold end is received on server.",
        views: ["firmware"],
        positions: { firmware: { x: 470, y: 350 } }
      }
    },
    {
      id: "fw-event-proc",
      type: "blockNode",
      position: { x: 620, y: 180 },
      data: {
        name: "Event Processor",
        category: "Firmware",
        status: "MVP",
        description: "Main logic loop routing detected inputs into BLE outbound payloads.",
        purpose: "Decides what packets to construct and enqueue.",
        requirements: "Runs synchronously inside MCU main thread.",
        candidateComponents: "Event queue structure.",
        risks: "Queue overflow under rapid press events.",
        notes: "Maintains sequence numbers to catch packet losses.",
        testingNotes: "Verify sequence count increases strictly by 1.",
        views: ["firmware"],
        positions: { firmware: { x: 620, y: 180 } }
      }
    },
    {
      id: "fw-ble-sender",
      type: "blockNode",
      position: { x: 770, y: 180 },
      data: {
        name: "BLE Event Sender",
        category: "Firmware",
        status: "MVP",
        description: "Radio transmission logic wrapping input events in GATT packets.",
        purpose: "Sends digital commands over the air to Host.",
        requirements: "BLE advertising / connection active, low power transmission.",
        candidateComponents: "GATT Write characteristic handler.",
        risks: "RF interference, packet collision.",
        notes: "Maintains BLE connection alive or uses BLE Advertisements.",
        testingNotes: "Log BLE throughput using sniffer.",
        views: ["firmware", "system-alpha"],
        positions: {
          firmware: { x: 770, y: 180 },
          "system-alpha": { x: 50, y: 100 }
        }
      }
    },
    {
      id: "fw-haptic-rec",
      type: "blockNode",
      position: { x: 770, y: 300 },
      data: {
        name: "Haptic Command Receiver",
        category: "Firmware",
        status: "MVP",
        description: "Handles incoming BLE writes instructing the ring to vibrate.",
        purpose: "Receives feedback commands from System Alpha.",
        requirements: "BLE Write listener, instant trigger (<10ms).",
        candidateComponents: "GATT Read/Write event hooks.",
        risks: "Buffer overflow if server sends commands too fast.",
        notes: "Extracts feedback code (0: Success, 1: Error, 2: Alert).",
        testingNotes: "Verify haptic triggers within 15ms of BLE write.",
        views: ["firmware", "system-alpha"],
        positions: {
          firmware: { x: 770, y: 300 },
          "system-alpha": { x: 750, y: 380 }
        }
      }
    },
    {
      id: "fw-success-fb",
      type: "blockNode",
      position: { x: 920, y: 220 },
      data: {
        name: "Success Feedback",
        category: "Firmware",
        status: "MVP",
        description: "Vibrations pattern signaling a successfully executed command.",
        purpose: "Confirms action execution to the user.",
        requirements: "Single short pulse (80ms).",
        candidateComponents: "Haptic driver pulse setup.",
        risks: "Indistinguishable from other patterns.",
        notes: "Uses clean, sharp wave profile.",
        testingNotes: "Observe user ability to identify confirmation pulse.",
        views: ["firmware"],
        positions: { firmware: { x: 920, y: 220 } }
      }
    },
    {
      id: "fw-error-fb",
      type: "blockNode",
      position: { x: 920, y: 320 },
      data: {
        name: "Error Feedback",
        category: "Firmware",
        status: "MVP",
        description: "Vibration pattern signaling a failed command or denied permission.",
        purpose: "Alerts user of issue without requiring screen access.",
        requirements: "Three short pulses (50ms on, 50ms off).",
        candidateComponents: "Haptic driver pulse array.",
        risks: "Annoys user if triggered frequently.",
        notes: "Sharp alerts to grab immediate attention.",
        testingNotes: "Confirm three discrete pulses can be felt.",
        views: ["firmware"],
        positions: { firmware: { x: 920, y: 320 } }
      }
    },
    {
      id: "fw-battery-status",
      type: "blockNode",
      position: { x: 50, y: 320 },
      data: {
        name: "Battery Status Monitor (Later)",
        category: "Firmware",
        status: "Later",
        description: "Monitors battery voltage levels and warns of low battery.",
        purpose: "Calculates charge percentage and sends alerts.",
        requirements: "Reads analog pin value, converts with voltage divider ratio.",
        candidateComponents: "ADC peripheral driver.",
        risks: "Voltage reading fluctuating under high haptic load.",
        notes: "Should sample only during quiet haptic/radio states.",
        testingNotes: "Compare ADC reading with real multimeter values.",
        views: ["firmware"],
        positions: { firmware: { x: 50, y: 320 } }
      }
    },
    {
      id: "fw-low-power",
      type: "blockNode",
      position: { x: 180, y: 320 },
      data: {
        name: "Low Power Mode (Later)",
        category: "Firmware",
        status: "Later",
        description: "Powers down RF and sensors when battery is critical (<5%).",
        purpose: "Protects battery cells from over-discharge.",
        requirements: "Enters deep sleep; only wake up on charger plug-in.",
        candidateComponents: "Deep sleep hardware hooks.",
        risks: "User thinks ring is broken/dead; no way to communicate status.",
        notes: "Flashes red/error LED once before shutting down.",
        testingNotes: "Verify power draw in low power sleep is below 5uA.",
        views: ["firmware", "power"],
        positions: {
          firmware: { x: 180, y: 320 },
          power: { x: 620, y: 480 }
        }
      }
    },

    // --- POWER VIEW (Power Distribution Planning) ---
    {
      id: "power-3v3",
      type: "blockNode",
      position: { x: 260, y: 80 },
      data: {
        name: "3.3V Power Rail",
        category: "Power",
        status: "MVP",
        description: "Primary system voltage rail powering the controller and peripheral blocks.",
        purpose: "Provides stable constant voltage.",
        requirements: "3.3V +/- 5% regulation, up to 150mA transient current support.",
        candidateComponents: "Bypass capacitors (10uF, 0.1uF).",
        risks: "Voltage dip during high haptic motor draw.",
        notes: "Must place bypass capacitors as close to MCU power pins as possible.",
        testingNotes: "Check voltage ripple on oscilloscope during vibration.",
        views: ["power"],
        positions: { power: { x: 260, y: 80 } }
      }
    },
    {
      id: "battery-sense-later",
      type: "blockNode",
      position: { x: 380, y: 280 },
      data: {
        name: "Battery Sense (Later)",
        category: "Power",
        status: "Later",
        description: "Resistor divider network mapping battery voltage to MCU ADC safe range (0-1V).",
        purpose: "Allows MCU to measure current battery level.",
        requirements: "High resistance (e.g. 1M/300k) to minimize current leak.",
        candidateComponents: "1M resistor, 330k resistor, 0.1uF filter cap.",
        risks: "Resistor tolerance skewing reading by 2-3%.",
        notes: "Should use 1% tolerance resistors or calibrate in firmware.",
        testingNotes: "Calibrate ADC scale values against known voltage source.",
        views: ["power"],
        positions: { power: { x: 380, y: 280 } }
      }
    },

    // --- SYSTEM ALPHA VIEW (Host & Cloud Integration) ---
    {
      id: "sa-device-mgr",
      type: "blockNode",
      position: { x: 220, y: 100 },
      data: {
        name: "Device Manager",
        category: "Software",
        status: "MVP",
        description: "Main driver on host managing BLE connections and listening to the GATT database.",
        purpose: "Authenticates, connects, and keeps status of physical ring.",
        requirements: "Runs locally on companion app / host OS.",
        candidateComponents: "Web Bluetooth API or native Noble/Bleak library.",
        risks: "Reconnection lag, OS Bluetooth stacks stalling.",
        notes: "Automatically reconnects when ring is in range.",
        testingNotes: "Verify reconnection time is under 1.5 seconds.",
        views: ["system-alpha"],
        positions: { "system-alpha": { x: 220, y: 100 } }
      }
    },
    {
      id: "sa-event-router",
      type: "blockNode",
      position: { x: 380, y: 100 },
      data: {
        name: "Input Event Router",
        category: "Software",
        status: "MVP",
        description: "Decodes binary BLE events (clicks, holds) and maps them to application commands.",
        purpose: "Translates hardware actions into digital events.",
        requirements: "Filters duplicates, translates raw codes to events.",
        candidateComponents: "Typescript router module.",
        risks: "Event race conditions if multiple triggers occur.",
        notes: "Event list: CLICK, DOUBLE_CLICK, HOLD_START, HOLD_RELEASE.",
        testingNotes: "Verify incoming codes map to correct output strings.",
        views: ["system-alpha"],
        positions: { "system-alpha": { x: 380, y: 100 } }
      }
    },
    {
      id: "sa-listening-mode",
      type: "blockNode",
      position: { x: 550, y: 100 },
      data: {
        name: "Listening / Command Mode",
        category: "Software",
        status: "MVP",
        description: "Trigger state on the host while HOLD_START is active, capturing audio or keyboard inputs.",
        purpose: "Signals the host brain that user intent is active.",
        requirements: "Visual feedback on screen (glow overlay) while active.",
        candidateComponents: "Host UI layer (System Alpha Client).",
        risks: "Recording user audio without active intent (privacy leak).",
        notes: "Audio stream MUST terminate instantly on HOLD_RELEASE.",
        testingNotes: "Verify microphone icon vanishes when release event is logged.",
        views: ["system-alpha"],
        positions: { "system-alpha": { x: 550, y: 100 } }
      }
    },
    {
      id: "sa-local-ai",
      type: "blockNode",
      position: { x: 550, y: 220 },
      data: {
        name: "Local AI Reasoning",
        category: "Software",
        status: "MVP",
        description: "System Alpha's offline brain that parses voice commands or user actions.",
        purpose: "Understands intent and converts it to actionable system instructions.",
        requirements: "Runs in less than 500ms on local CPU.",
        candidateComponents: "Local LLM runner (llama.cpp) or intent match regex.",
        risks: "Hallucinating dangerous commands (e.g. 'delete all files').",
        notes: "Strict confidence threshold (e.g. >85%) required.",
        testingNotes: "Verify accuracy across a command test suite.",
        views: ["system-alpha"],
        positions: { "system-alpha": { x: 550, y: 220 } }
      }
    },
    {
      id: "sa-permission-layer",
      type: "blockNode",
      position: { x: 380, y: 220 },
      data: {
        name: "Permission and Risk Layer",
        category: "Software",
        status: "MVP",
        description: "Evaluates if the matched action is safe to execute or requires manual approval.",
        purpose: "Guards against critical system mistakes.",
        requirements: "Read-only configurations, rule evaluation engines.",
        candidateComponents: "Security policy checker.",
        risks: "Security bypass, rule logic loopholes.",
        notes: "Risky actions (e.g., execute shell script) require interactive double-click verification.",
        testingNotes: "Ensure dangerous script blocks trigger warning.",
        views: ["system-alpha"],
        positions: { "system-alpha": { x: 380, y: 220 } }
      }
    },
    {
      id: "sa-action-router",
      type: "blockNode",
      position: { x: 220, y: 220 },
      data: {
        name: "Action Router",
        category: "Software",
        status: "MVP",
        description: "Executes verified actions (commands, scripts, home control, keystrokes).",
        purpose: "Performs the real world task requested by the user.",
        requirements: "OS integration permissions (accessibility, file system).",
        candidateComponents: "NodeJS child_process execution, system APIs.",
        risks: "Malicious command execution leading to system compromise.",
        notes: "Runs sandbox wrappers where possible.",
        testingNotes: "Verify execution of simple shell script mockup.",
        views: ["system-alpha"],
        positions: { "system-alpha": { x: 220, y: 220 } }
      }
    },
    {
      id: "sa-haptic-sender",
      type: "blockNode",
      position: { x: 220, y: 380 },
      data: {
        name: "Haptic Response Sender",
        category: "Software",
        status: "MVP",
        description: "Issues BLE feedback command back to the ring based on action outcome.",
        purpose: "Triggers success or error vibrations to close the user loop.",
        requirements: "BLE Write GATT trigger.",
        candidateComponents: "BLE service write client.",
        risks: "Failed transmission leaves user wondering if command worked.",
        notes: "Writes 0x01 for success, 0x02 for error, 0x03 for warning.",
        testingNotes: "Observe response latency under loaded BLE channel.",
        views: ["system-alpha"],
        positions: { "system-alpha": { x: 220, y: 380 } }
      }
    },
    {
      id: "sa-settings-ui",
      type: "blockNode",
      position: { x: 550, y: 380 },
      data: {
        name: "Device Settings UI (Later)",
        category: "Software",
        status: "Later",
        description: "Graphical dashboard on host allowing user to customize click actions.",
        purpose: "Empowers user customization of ring commands.",
        requirements: "Config layout renderer, file save.",
        candidateComponents: "React settings page.",
        risks: "Overwriting default safety commands.",
        notes: "Users can pair new rings and configure vibration intensities.",
        testingNotes: "Verify settings changes are saved and loaded correctly.",
        views: ["system-alpha"],
        positions: { "system-alpha": { x: 550, y: 380 } }
      }
    },
    {
      id: "nfc-rfid-chip",
      type: "blockNode",
      position: { x: 180, y: 550 },
      data: {
        name: "NFC / RFID Tag Chip",
        category: "Electronics",
        status: "Later",
        description: "Highly compact NFC/RFID transceiver chip allowing passive data exchanges (e.g. sharing contact cards, triggering actions) even when ring is powered off.",
        purpose: "Enables zero-power credential exchanges and proximity triggers.",
        requirements: "Dual-interface EEPROM, SPI/I2C connection to MCU, small footprint.",
        candidateComponents: "NXP NTAG223 or STMicroelectronics ST25DV04K.",
        risks: "Antenna de-tuning inside metallic casing, data interception.",
        notes: "Can operate passively using phone's RF field or actively via MCU power.",
        testingNotes: "Test read/write cycles using standard NFC-enabled smartphone.",
        views: ["electronics"],
        positions: { electronics: { x: 180, y: 550 } }
      }
    },
    {
      id: "nfc-window",
      type: "blockNode",
      position: { x: 50, y: 450 },
      data: {
        name: "NFC RF Pass-Through Window",
        category: "Mechanical",
        status: "Later",
        description: "Non-metallic outer casing segment (plastic, resin, or ceramic) to allow RF electromagnetic waves to penetrate the titanium ring body.",
        purpose: "Prevents the titanium casing from acting as a Faraday cage, blocking NFC signals.",
        requirements: "Minimal width 3mm, sealed against water (IP68).",
        candidateComponents: "Zirconia Ceramic insert or PEEK plastic shell segment.",
        risks: "Weakens mechanical integrity, color mismatch with metal.",
        notes: "Must align precisely with the NFC antenna tag.",
        testingNotes: "Check NFC range through casing using RF signal meter.",
        views: ["outer"],
        positions: { outer: { x: 50, y: 450 } }
      }
    },
    {
      id: "nfc-antenna",
      type: "blockNode",
      position: { x: 260, y: 450 },
      data: {
        name: "NFC Coil Antenna",
        category: "Mechanical",
        status: "Later",
        description: "Thin PCB-etched or wire-wound coil antenna optimized for 13.56 MHz NFC frequency.",
        purpose: "Couples with external reader magnetic fields to transfer power and data.",
        requirements: "Inductance matched to 13.56 MHz (typically 1.5 - 2.5 uH), fits around the band.",
        candidateComponents: "Custom flex-PCB trace antenna (6-turn coil).",
        risks: "Impedance mismatch, coupling loss due to proximity of copper ground planes.",
        notes: "Must be placed directly beneath the non-metallic casing window.",
        testingNotes: "Measure antenna inductance on LCR meter before/after mounting.",
        views: ["internal"],
        positions: { internal: { x: 260, y: 450 } }
      }
    }
  ],
  edges: [
    // --- MASTER VIEW EDGES ---
    {
      id: "edge-user-hw",
      source: "user-node",
      target: "ring-hardware",
      label: "Physical input",
      views: ["master"]
    },
    {
      id: "edge-hw-fw",
      source: "ring-hardware",
      target: "ring-firmware",
      label: "GPIO Interrupt",
      views: ["master"]
    },
    {
      id: "edge-fw-sa",
      source: "ring-firmware",
      target: "system-alpha-external",
      label: "BLE GATT Event",
      views: ["master"]
    },
    {
      id: "edge-sa-fb",
      source: "system-alpha-external",
      target: "user-feedback",
      label: "BLE Haptic Cmd",
      views: ["master"]
    },
    {
      id: "edge-fb-user",
      source: "user-feedback",
      target: "user-node",
      label: "Tactile pulse",
      views: ["master"]
    },

    // --- ELECTRONICS VIEW EDGES ---
    {
      id: "edge-btn-mcu",
      source: "button-input-circuit",
      target: "ble-mcu",
      label: "GPIO Debounced",
      views: ["electronics"]
    },
    {
      id: "edge-mcu-haptic",
      source: "ble-mcu",
      target: "haptic-motor-output",
      label: "GPIO / PWM Trigger",
      views: ["electronics"]
    },
    {
      id: "edge-mcu-led",
      source: "ble-mcu",
      target: "debug-led",
      label: "GPIO Output",
      views: ["electronics"]
    },
    {
      id: "edge-usb-mcu",
      source: "usb-power",
      target: "ble-mcu",
      label: "3.3V VCC",
      views: ["electronics"]
    },
    {
      id: "edge-usb-haptic",
      source: "usb-power",
      target: "haptic-motor-output",
      label: "3.3V Drive",
      views: ["electronics"]
    },

    // --- FIRMWARE VIEW EDGES ---
    {
      id: "edge-fw-boot-idle",
      source: "fw-boot",
      target: "fw-idle",
      views: ["firmware"]
    },
    {
      id: "edge-fw-idle-det",
      source: "fw-idle",
      target: "fw-input-det",
      label: "Pin Interrupt",
      views: ["firmware"]
    },
    {
      id: "edge-fw-det-proc",
      source: "fw-input-det",
      target: "fw-event-proc",
      label: "Press Type",
      views: ["firmware"]
    },
    {
      id: "edge-fw-proc-send",
      source: "fw-event-proc",
      target: "fw-ble-sender",
      label: "Enqueue Packet",
      views: ["firmware"]
    },
    {
      id: "edge-fw-rec-success",
      source: "fw-haptic-rec",
      target: "fw-success-fb",
      label: "Command 0x01",
      views: ["firmware"]
    },
    {
      id: "edge-fw-rec-error",
      source: "fw-haptic-rec",
      target: "fw-error-fb",
      label: "Command 0x02",
      views: ["firmware"]
    },

    // --- POWER VIEW EDGES ---
    {
      id: "edge-p-usb-3v3",
      source: "usb-power",
      target: "power-3v3",
      label: "AP2112 LDO",
      views: ["power"]
    },
    {
      id: "edge-p-3v3-mcu",
      source: "power-3v3",
      target: "ble-mcu",
      views: ["power"]
    },
    {
      id: "edge-p-3v3-btn",
      source: "power-3v3",
      target: "button-input-circuit",
      views: ["power"]
    },
    {
      id: "edge-p-3v3-hap",
      source: "power-3v3",
      target: "haptic-motor-output",
      views: ["power"]
    },
    {
      id: "edge-p-bat-pmic",
      source: "battery-later",
      target: "pmic-later",
      views: ["power"]
    },
    {
      id: "edge-p-chg-bat",
      source: "charging-later",
      target: "battery-later",
      views: ["power"]
    },

    // --- SYSTEM ALPHA VIEW EDGES ---
    {
      id: "edge-sa-ble-dm",
      source: "fw-ble-sender",
      target: "sa-device-mgr",
      label: "RF Link",
      views: ["system-alpha"]
    },
    {
      id: "edge-sa-dm-er",
      source: "sa-device-mgr",
      target: "sa-event-router",
      views: ["system-alpha"]
    },
    {
      id: "edge-sa-er-lm",
      source: "sa-event-router",
      target: "sa-listening-mode",
      label: "Hold State",
      views: ["system-alpha"]
    },
    {
      id: "edge-sa-lm-ai",
      source: "sa-listening-mode",
      target: "sa-local-ai",
      label: "Audio Buffer",
      views: ["system-alpha"]
    },
    {
      id: "edge-sa-ai-pl",
      source: "sa-local-ai",
      target: "sa-permission-layer",
      label: "Decoded Intent",
      views: ["system-alpha"]
    },
    {
      id: "edge-sa-pl-ar",
      source: "sa-permission-layer",
      target: "sa-action-router",
      label: "Verified Safe",
      views: ["system-alpha"]
    },
    {
      id: "edge-sa-ar-hs",
      source: "sa-action-router",
      target: "sa-haptic-sender",
      label: "Outcome Status",
      views: ["system-alpha"]
    },
    {
      id: "edge-sa-hs-rec",
      source: "sa-haptic-sender",
      target: "fw-haptic-rec",
      label: "RF Feedback",
      views: ["system-alpha"]
    }
  ],
  bom: [
    {
      id: "bom-1",
      blockName: "BLE MCU / Controller",
      candidateComponent: "ESP32-C3-MINI-1-N4",
      stage: "Prototype",
      voltage: "3.3V",
      interface: "GPIO, BLE, SPI",
      sizeNotes: "13.2mm x 16.6mm x 2.4mm",
      costEstimate: "$1.85",
      supplier: "DigiKey",
      status: "Sourced",
      risk: "Relatively wide package; tight fit in thin rings.",
      alternative: "Nordic nRF52805 WLCSP (2.5mm x 2.5mm)"
    },
    {
      id: "bom-2",
      blockName: "Button / Touch Input",
      candidateComponent: "Tactile Dome Switch (Metal)",
      stage: "Prototype",
      voltage: "N/A (Passive)",
      interface: "Direct GPIO Pullup",
      sizeNotes: "3mm x 3mm x 0.3mm",
      costEstimate: "$0.10",
      supplier: "Mouser",
      status: "Sourced",
      risk: "Mechanical wear, sealing challenges.",
      alternative: "Direct Capacitive Copper Foil Pad"
    },
    {
      id: "bom-3",
      blockName: "Haptic Motor",
      candidateComponent: "Coin Vibration Motor (ERM)",
      stage: "Prototype",
      voltage: "3.0V",
      interface: "BJT Drive Switch",
      sizeNotes: "8mm diameter x 2mm thickness",
      costEstimate: "$0.80",
      supplier: "Adafruit",
      status: "Sourced",
      risk: "High momentary current surge.",
      alternative: "LRA Linear Resonant Actuator (faster start)"
    },
    {
      id: "bom-4",
      blockName: "Debug LED",
      candidateComponent: "0402 SMD Red LED",
      stage: "Prototype",
      voltage: "2.0V (Vf)",
      interface: "GPIO + Resistor",
      sizeNotes: "1.0mm x 0.5mm x 0.4mm",
      costEstimate: "$0.05",
      supplier: "DigiKey",
      status: "Sourced",
      risk: "Low risk; easy to omit in final builds.",
      alternative: "None"
    },
    {
      id: "bom-5",
      blockName: "USB Prototype Power",
      candidateComponent: "USB-C Female Connector (16-Pin)",
      stage: "Prototype",
      voltage: "5.0V Input",
      interface: "VBUS to LDO Regulator",
      sizeNotes: "9mm width x 6mm depth",
      costEstimate: "$0.35",
      supplier: "Mouser",
      status: "Sourced",
      risk: "Too large for ring; prototype development board only.",
      alternative: "None"
    },
    {
      id: "bom-6",
      blockName: "Battery",
      candidateComponent: "Lithium Polymer Micro Pin Cell",
      stage: "Future",
      voltage: "3.7V Nominal",
      interface: "PMIC Regulator Input",
      sizeNotes: "4mm diameter x 15mm length",
      costEstimate: "$2.50",
      supplier: "Grepow Battery",
      status: "Not Started",
      risk: "Extremely low capacity (12mAh); requires fine power states.",
      alternative: "LiPo Curved pouch cell"
    },
    {
      id: "bom-7",
      blockName: "Charging",
      candidateComponent: "TP4056 Micro Charger Board",
      stage: "Future",
      voltage: "5V in / 4.2V out",
      interface: "Analog CC/CV",
      sizeNotes: "15mm x 15mm (proto size)",
      costEstimate: "$0.40",
      supplier: "AliExpress",
      status: "Not Started",
      risk: "TP4056 is too large for production ring. Must redesign with small IC.",
      alternative: "LTC4054 in TSOT-23"
    },
    {
      id: "bom-8",
      blockName: "Microphone",
      candidateComponent: "INMP441 Digital MEMS Mic",
      stage: "Future",
      voltage: "3.3V",
      interface: "I2S Digital Bus",
      sizeNotes: "3.1mm x 4.0mm x 1.0mm",
      costEstimate: "$1.20",
      supplier: "TDK InvenSense",
      status: "Not Started",
      risk: "Requires acoustic port entry; sensitive to water ingress.",
      alternative: "ICS-43434 (identical I2S interface)"
    },
    {
      id: "bom-9",
      blockName: "IMU Sensor",
      candidateComponent: "BMI270 6-Axis IMU",
      stage: "Future",
      voltage: "1.8V/3.3V",
      interface: "I2C / SPI Bus",
      sizeNotes: "2.5mm x 3.0mm x 0.8mm",
      costEstimate: "$1.50",
      supplier: "Bosch Sensortec",
      status: "Not Started",
      risk: "Calibration math loading host CPU; false triggers.",
      alternative: "MPU6050 (larger but standard)"
    },
    {
      id: "bom-10",
      blockName: "Haptic Driver",
      candidateComponent: "DRV2605L Haptic Driver",
      stage: "Future",
      voltage: "3.0V - 5.5V",
      interface: "I2C Control",
      sizeNotes: "1.5mm x 1.5mm (WCSP) / MSOP-10",
      costEstimate: "$1.10",
      supplier: "Texas Instruments",
      status: "Not Started",
      risk: "Extra board space; added BOM cost.",
      alternative: "Direct MOSFET PWM (coarser haptic control)"
    }
  ],
  testing: [
    {
      id: "stage-0",
      name: "Stage 0: Product Blueprint",
      goal: "Finalize block diagram, verify logic loop matches System Alpha specs.",
      partsNeeded: "None (Hardware Studio Workspace)",
      steps: "Review architectural layout, verify MVP vs Later boundaries. Check warning indicators.",
      passCriteria: "All warnings addressed. Schema matches input requirements.",
      risks: "Underestimating layout dimensions before CAD design.",
      status: "Passed",
      notes: "Blueprint complete in System Alpha Hardware Studio!"
    },
    {
      id: "stage-1",
      name: "Stage 1: Input + Haptic Simulation",
      goal: "Prove input and haptic feedback logic behavior visually.",
      partsNeeded: "ESP32 DevKit, breadboard, red LED (simulating haptics), tact switch.",
      steps: "Deploy proto code to ESP32. Press switch. Confirm LED flashes in corresponding haptic pulses (short/long).",
      passCriteria: "Single press, double press, and long press produce correct flash sequences.",
      risks: "Inaccurate switch debounce parameters.",
      status: "In Progress",
      notes: "Working on debounce firmware filtering."
    },
    {
      id: "stage-2",
      name: "Stage 2: Real Button + Haptic",
      goal: "Test physical coin vibration motor response instead of simulation LED.",
      partsNeeded: "ESP32, coin vibration motor, NPN transistor driver (2N3904), resistor, diode.",
      steps: "Assemble motor driver circuit. Run same code. Test feel of success and error haptics.",
      passCriteria: "Motor starts/stops instantly without lagging. No back-EMF MCU resets observed.",
      risks: "Inductive spikes resetting MCU. Transistor thermal load.",
      status: "Not Started",
      notes: "Requires procuring coin motor."
    },
    {
      id: "stage-3",
      name: "Stage 3: BLE Event Prototype",
      goal: "Transmit click events from development board over Bluetooth.",
      partsNeeded: "ESP32 DevKit, Bluetooth debugger app (LightBlue / nRF Connect).",
      steps: "Flash BLE GATT firmware. Connect using debugger app. Press button and confirm GATT characteristic updates.",
      passCriteria: "Receiving UUID packet updates within 40ms of mechanical contact.",
      risks: "BLE advertising dropouts, antenna range issues.",
      status: "Not Started",
      notes: "Need to select stable UUID keys."
    },
    {
      id: "stage-4",
      name: "Stage 4: System Alpha Fake Ring Event",
      goal: "Prove System Alpha core software can process commands and trigger haptics.",
      partsNeeded: "System Alpha Host Client, mock BLE event generator script.",
      steps: "Run script to send fake BLE events to System Alpha. Observe AI listening state activation, permission checks, and output commands.",
      passCriteria: "input_hold_start starts recording; input_hold_end processes audio; risky scripts trigger permission dialog and haptic warning commands.",
      risks: "Host OS blocking fake event inject scripts.",
      status: "Not Started",
      notes: "Mock generator script to be written in Node.js."
    },
    {
      id: "stage-5",
      name: "Stage 5: System Alpha Real BLE Event",
      goal: "Connect the ESP32 physical prototype directly to System Alpha Client.",
      partsNeeded: "ESP32 breadboard prototype, System Alpha Host Client.",
      steps: "Pair ESP32 with host. Perform mechanical single, double, and hold commands. Confirm System Alpha acts and triggers haptic vibrations on the coin motor.",
      passCriteria: "Whole loop functions wirelessly: user press -> BLE transmission -> System Alpha parsing -> haptic confirmation.",
      risks: "RF matching drops in crowded rooms.",
      status: "Not Started",
      notes: "End-to-end MVP milestone check."
    },
    {
      id: "stage-6",
      name: "Stage 6: Battery Prototype",
      goal: "Power the prototype board completely from a small LiPo cell.",
      partsNeeded: "ESP32 prototype, 3.7V Lipo battery, Charger board, 3.3V LDO.",
      steps: "Disconnect USB power. Run off LiPo cell. Measure battery current consumption in active and deep sleep states.",
      passCriteria: "Standby current under 20uA. Ring runs for at least 12 hours of active standby.",
      risks: "Battery overdischarge. LDO high quiescent current.",
      status: "Not Started",
      notes: "Crucial step before layout miniaturization."
    },
    {
      id: "stage-7",
      name: "Stage 7: Wearable Enclosure",
      goal: "Fit development electronics into a bulkier 3D-printed finger ring mockup.",
      partsNeeded: "3D printer, SLA resin casing, prototype battery, wire wraps.",
      steps: "Solder elements using thin wires. Stuff components inside 3D shell. Wear it on finger and test mechanical comfort.",
      passCriteria: "Wearable without pain. Button is clickable while on finger. Haptics felt through casing.",
      risks: "Resin case cracking. Thermal buildup heating finger.",
      status: "Not Started",
      notes: "Expect shape to be slightly chunky."
    },
    {
      id: "stage-8",
      name: "Stage 8: Custom PCB",
      goal: "Design and assemble the first custom rigid-flex PCB fitting inside ring shell.",
      partsNeeded: "KiCad schematic, PCB assembly services, SMD soldering gear.",
      steps: "Layout components on a curved flex design. Spin board. Solder Nordic MCU, LDO, and motor joints.",
      passCriteria: "Board fits within the inner thickness constraint (under 2mm height). Flashes successfully.",
      risks: "Trace breakage, soldering shorts in pitch sizes.",
      status: "Not Started",
      notes: "Use ENIG surface finish."
    },
    {
      id: "stage-9",
      name: "Stage 9: Miniaturized Ring",
      goal: "Assemble the final premium form-factor ring (Size 10) with all sensors.",
      partsNeeded: "Zirconia ceramic outer sleeve, custom curved battery, flex PCB.",
      steps: "Slide flex PCB around inner ring core. Connect battery. Seal with inner bio-compatible resin coat. Calibrate RF antenna.",
      passCriteria: "Ring looks like regular premium jewelry. Operates end-to-end. Waterproof (IP68).",
      risks: "Permanent sealing makes repairs impossible.",
      status: "Not Started",
      notes: "Final stage of V1 hardware development."
    }
  ],
  boards: [
    {
      id: "board_ring_main",
      name: "Main Curved Flex PCB",
      boardType: "Flex PCB",
      linkedProductArea: "Inner Housing Ring Arc",
      purpose: "Main flexible electronics carrier routing the ESP32-C3 MCU, LRA haptic controller, decoupling capacitors, and touch interfaces.",
      dimensionsMm: "18.5 x 6.5 x 0.15",
      layerCount: 2,
      substrate: "Polyimide Flex",
      placement: "Ring Arc",
      mountingNotes: "Adhesively laminated to internal titanium support frame using 3M 467MP transfer tape.",
      connectorNotes: "Exposed gold contacts for debugging probe spring needle jig.",
      thermalNotes: "Exposed thermal copper fill zones on top layer below LDO regulator.",
      rfNotes: "Keepout window for ground pours below BLE 2.4GHz chip antenna trace.",
      status: "Concept"
    },
    {
      id: "board_ring_charging",
      name: "Charging Contact Board",
      boardType: "Charging Board",
      linkedProductArea: "Outer Shell Bottom",
      purpose: "Small daughterboard holding gold-plated charging pins, battery charger BMS IC, and overvoltage protection diodes.",
      dimensionsMm: "6.0 x 4.0 x 0.8",
      layerCount: 2,
      substrate: "FR4",
      placement: "Internal",
      mountingNotes: "Fitted inside waterproof epoxy sealing grooves.",
      connectorNotes: "Two spring pogo contact fingers bridge power to the main Flex PCB.",
      thermalNotes: "BMS battery charger IC generates heat during fast charge. Copper vias dissipate heat to casing.",
      rfNotes: "Keep separate from RF fields.",
      status: "Concept"
    }
  ],
  circuitBlocks: [
    {
      id: "cb_ring_mcu",
      name: "MCU Controller Core",
      circuitType: "MCU",
      boardId: "board_ring_main",
      description: "ESP32-C3 QFN package running BLE radio, state machine, and processing inputs.",
      requiredComponents: "ESP32-C3-MINI-1, 10uF cap, 1uF cap, 40MHz crystal oscillator",
      referenceDesignators: "U1, C1, C2, Y1",
      powerNets: "3V3, GND",
      signalNets: "TOUCH_SENSE, HAPTIC_PWM, DEBUG_TX",
      interfaceType: "I2C, GPIO",
      datasheetNotes: "Check Espressif hardware design guidelines for decoupling placement.",
      designNotes: "Place SWD programming pads nearby on the internal frame edge.",
      risks: "Space layout constraints below shield.",
      status: "Concept"
    },
    {
      id: "cb_ring_power",
      name: "Power Regulation",
      circuitType: "Power",
      boardId: "board_ring_main",
      description: "Low-dropout voltage regulator stepping battery power (3.7V - 4.2V) down to stable 3.3V digital rail.",
      requiredComponents: "AP2112 LDO regulator, 10uF input capacitor, 10uF output capacitor",
      referenceDesignators: "U2, C3, C4",
      powerNets: "VBAT, 3V3, GND",
      signalNets: "None",
      interfaceType: "Direct Power Rails",
      datasheetNotes: "AP2112 features low dropout voltage and 55uA typical sleep current.",
      designNotes: "Locate thermal copper pour heatsinks on top layer.",
      risks: "Regulator heating during BLE continuous transmit cycles.",
      status: "Concept"
    },
    {
      id: "cb_ring_charger",
      name: "Battery Charger BMS",
      circuitType: "Charger",
      boardId: "board_ring_charging",
      description: "BMS charging circuit protecting LiPo battery and regulating VBUS 5V external input charger.",
      requiredComponents: "MCP73831 BMS Charger IC, overvoltage clamp diode, charge LED resistor, dual-FET protection chip",
      referenceDesignators: "U3, U4, D1, R1",
      powerNets: "VBUS, VBAT, GND",
      signalNets: "CHG_STATUS",
      interfaceType: "Analog Charge Profile",
      datasheetNotes: "MCP73831 requires external programming resistor to set charge current.",
      designNotes: "Limit battery charging current to 18mA matching 1C rate.",
      risks: "Thermal runaway risk during charging in sealed casing.",
      status: "Concept"
    },
    {
      id: "cb_ring_haptics",
      name: "Haptic Driver Circuit",
      circuitType: "Haptic",
      boardId: "board_ring_main",
      description: "Low-side transistor switcher converting PWM commands to vibration patterns on the LRA coin motor.",
      requiredComponents: "SOT-23 NPN BJT transistor, flyback clamping diode, current limit resistor",
      referenceDesignators: "Q1, D2, R2",
      powerNets: "VBAT, GND",
      signalNets: "HAPTIC_PWM",
      interfaceType: "PWM Control",
      datasheetNotes: "Transistor must support continuous current of 120mA.",
      designNotes: "Add flyback protection diode parallel to LRA coil.",
      risks: "High current motor spikes causing voltage dip on MCU power rail.",
      status: "Concept"
    },
    {
      id: "cb_ring_rf",
      name: "BLE Wireless RF",
      circuitType: "RF",
      boardId: "board_ring_main",
      description: "Antenna impedance matching network matching ESP32 output to a 2.4GHz chip antenna.",
      requiredComponents: "2.4GHz Chip Antenna, 1.2pF inductor, 2.7nH capacitor",
      referenceDesignators: "ANT1, L1, C5",
      powerNets: "GND",
      signalNets: "RF_ANT_IN",
      interfaceType: "High Frequency RF",
      datasheetNotes: "Follow Johanson layout guideline for antenna feed line clearance.",
      designNotes: "Maintain 50-ohm microstrip trace impedance.",
      risks: "De-tuning due to finger proximity. Keepout copper required.",
      status: "Concept"
    }
  ],
  boardComponents: [
    {
      id: "bc_ring_u1",
      boardId: "board_ring_main",
      circuitBlockId: "cb_ring_mcu",
      referenceDesignator: "U1",
      componentName: "ESP32-C3 Controller",
      componentType: "Integrated Circuit",
      value: "ESP32-C3-MINI-1",
      packageName: "QFN-32",
      footprint: "QFN32_5x5mm_0.5mmPitch",
      partNumber: "ESP32-C3-MINI-1-N4",
      quantity: 1,
      side: "Top",
      placementCriticality: "High",
      notes: "Central system microcontroller processor."
    },
    {
      id: "bc_ring_u2",
      boardId: "board_ring_main",
      circuitBlockId: "cb_ring_power",
      referenceDesignator: "U2",
      componentName: "AP2112 LDO Regulator",
      componentType: "Power Regulator",
      value: "3.3V / 600mA LDO",
      packageName: "SOT-23-5",
      footprint: "SOT23-5_Standard",
      partNumber: "AP2112K-3.3TRG1",
      quantity: 1,
      side: "Top",
      placementCriticality: "Medium",
      notes: "Steps battery voltage down to digital 3.3V rail."
    },
    {
      id: "bc_ring_u3",
      boardId: "board_ring_charging",
      circuitBlockId: "cb_ring_charger",
      referenceDesignator: "U3",
      componentName: "MCP73831 Charger BMS",
      componentType: "Integrated Circuit",
      value: "LiPo Linear Charger",
      packageName: "SOT-23-5",
      footprint: "SOT23-5_Standard",
      partNumber: "MCP73831T-2ACI/OT",
      quantity: 1,
      side: "Top",
      placementCriticality: "High",
      notes: "Located on Charging Contacts Board."
    },
    {
      id: "bc_ring_bt1",
      boardId: "board_ring_main",
      circuitBlockId: "cb_ring_power",
      referenceDesignator: "BT1",
      componentName: "LiPo Battery",
      componentType: "Battery",
      value: "18mAh / 3.7V Cell",
      packageName: "Custom Poly Pack",
      footprint: "Battery_Pads_2pin",
      partNumber: "Custom_18mah_Lipo",
      quantity: 1,
      side: "Bottom",
      placementCriticality: "High",
      notes: "Glued beneath flex circuit board."
    },
    {
      id: "bc_ring_ant1",
      boardId: "board_ring_main",
      circuitBlockId: "cb_ring_rf",
      referenceDesignator: "ANT1",
      componentName: "2.4GHz Chip Antenna",
      componentType: "Antenna",
      value: "BLE Chip Antenna",
      packageName: "SMD-3216",
      footprint: "Antenna_Chip_3.2x1.6mm",
      partNumber: "2450AT18D0100E",
      quantity: 1,
      side: "Top",
      placementCriticality: "High",
      notes: "Requires ground keepout void below layout region."
    }
  ],
  nets: [
    {
      id: "net_ring_gnd",
      netName: "GND",
      netType: "Ground",
      voltage: "0V",
      sourceComponent: "BT1",
      sourcePin: "Pin 2 (BAT_GND)",
      targetComponent: "U1",
      targetPin: "Pin 33 (GND)",
      protocol: "Direct Connect",
      currentEstimate: "85mA max",
      impedanceRequirement: "Low Impedance Return Plane",
      notes: "Main system digital ground return plane."
    },
    {
      id: "net_ring_3v3",
      netName: "3V3",
      netType: "Power",
      voltage: "3.3V",
      sourceComponent: "U2",
      sourcePin: "Pin 5 (VOUT)",
      targetComponent: "U1",
      targetPin: "Pin 3 (VDD)",
      protocol: "Power Distribution",
      currentEstimate: "45mA avg",
      impedanceRequirement: "Wide traces (8-10mil)",
      notes: "Main regulated digital voltage rail."
    },
    {
      id: "net_ring_vbat",
      netName: "VBAT",
      netType: "Power",
      voltage: "3.7V",
      sourceComponent: "BT1",
      sourcePin: "Pin 1 (BAT_POS)",
      targetComponent: "U2",
      targetPin: "Pin 1 (VIN)",
      protocol: "Power Distribution",
      currentEstimate: "85mA max",
      impedanceRequirement: "Wide traces (8-10mil)",
      notes: "Raw battery input voltage line."
    },
    {
      id: "net_ring_touch",
      netName: "TOUCH_SENSE",
      netType: "Signal",
      voltage: "3.3V",
      sourceComponent: "U1",
      sourcePin: "Pin 4 (GPIO_4)",
      targetComponent: "ANT1",
      targetPin: "Pin 1",
      protocol: "Analog Capacitive",
      currentEstimate: "0.1mA",
      impedanceRequirement: "Guard trace isolation",
      notes: "Senses touch surface capacitive charge shifts."
    }
  ],
  pcbConstraints: [
    {
      id: "con_ring_width",
      boardId: "board_ring_main",
      constraintType: "Trace Width",
      value: "4.0",
      unit: "mil",
      description: "Minimum trace width sizing rule to ensure flex circuit yield compatibility.",
      severity: "Warning"
    },
    {
      id: "con_ring_clearance",
      boardId: "board_ring_main",
      constraintType: "Clearance",
      value: "4.0",
      unit: "mil",
      description: "Minimum clearance spacing constraint between raw copper traces.",
      severity: "Critical"
    },
    {
      id: "con_ring_bend",
      boardId: "board_ring_main",
      constraintType: "Flex Bend",
      value: "1.5",
      unit: "mm",
      description: "Minimum bend radius limit allowed in polyimide wrap bend zones.",
      severity: "Critical"
    },
    {
      id: "con_ring_antenna",
      boardId: "board_ring_main",
      constraintType: "RF Keepout",
      value: "5.0",
      unit: "mm",
      description: "Ground plane copper exclusion keepout void boundary below BLE antenna trace.",
      severity: "Critical"
    }
  ],
  manufacturingChecklist: [
    {
      id: "mc_ring_erc",
      category: "Schematic",
      item: "Run Electrical Rules Check (ERC) with zero active error listings",
      status: "Done",
      ownerNotes: "Checked ERC logs, zero warnings. Floating gates tied high.",
      blockingReason: ""
    },
    {
      id: "mc_ring_drc",
      category: "PCB Layout",
      item: "Run Design Rules Check (DRC) to ensure trace alignment matches manufacturing capabilities",
      status: "In Progress",
      ownerNotes: "Checking trace routing clearances.",
      blockingReason: ""
    },
    {
      id: "mc_ring_keepout",
      category: "PCB Layout",
      item: "Verify copper keepout regions are active below BLE transceiver antenna trace",
      status: "Done",
      ownerNotes: "Antenna keepout void on flex board confirmed.",
      blockingReason: ""
    },
    {
      id: "mc_ring_skin",
      category: "Compliance",
      item: "Verify wearable skin-contact polymer safety biocompatibility compliance certifications",
      status: "Not Started",
      ownerNotes: "Need to order medical grade polyurethane coating samples.",
      blockingReason: ""
    }
  ],
  mechanicalZones: [
    {
      id: "mz_ring_shell",
      name: "Outer Ceramic Shell",
      zoneType: "Casing",
      material: "Zirconia ZrO2",
      dimensionNote: "Thickness 0.8mm",
      notes: "Protective outer body ring shell casing."
    },
    {
      id: "mz_ring_flex",
      name: "FPC Flex Channel",
      zoneType: "Substrate Channel",
      material: "Polyimide Film",
      dimensionNote: "Width 6mm",
      notes: "Internal channel pocket for flex PCBA."
    },
    {
      id: "mz_ring_battery",
      name: "Battery Compartment",
      zoneType: "Power Pocket",
      material: "Rigid Titanium Vault",
      dimensionNote: "8 x 2mm arc slot",
      notes: "Bottom capsule segment compartment."
    }
  ],
  assemblyLayers: [
    {
      id: "al_ring_shell",
      name: "Outer Casing Shell Assembly",
      order: 1,
      layerType: "Enclosure",
      material: "ZrO2 Ceramic",
      fasteningMethod: "Press-fit & Epoxy",
      inspectionNote: "Verify gap clearance & aesthetic concentricity.",
      notes: "Outer cosmetic band."
    },
    {
      id: "al_ring_pcb",
      name: "Flexible PCBA Installation",
      order: 2,
      layerType: "PCBA",
      material: "Rigid-Flex PCB",
      fasteningMethod: "Double-sided conductive tape",
      inspectionNote: "Verify antenna keeping clearance.",
      notes: "Main electronic assembly."
    },
    {
      id: "al_ring_battery",
      name: "Micro Cell Battery Integration",
      order: 3,
      layerType: "Battery",
      material: "Lithium Polymer Cell",
      fasteningMethod: "Solder tabs & Epoxy potting",
      inspectionNote: "Perform voltage leakage check.",
      notes: "Power source integration."
    }
  ],
  schematicSymbols: [
    {
      id: "sym_ring_mcu",
      circuitId: "ble-mcu",
      symbolType: "IC",
      referenceDesignator: "U1",
      label: "nRF52832 MCU",
      x: 300,
      y: 180,
      rotation: 0,
      notes: "Main MCU BLE controller",
      pins: [
        { pinNum: "1", label: "TOUCH_SENSE", direction: "Input" },
        { pinNum: "2", label: "HAPTIC_PWM", direction: "Output" },
        { pinNum: "3", label: "DEBUG_TX", direction: "Output" },
        { pinNum: "4", label: "VDD", direction: "Power" },
        { pinNum: "5", label: "GND", direction: "Passive" }
      ]
    },
    {
      id: "sym_ring_motor",
      circuitId: "haptic-motor-output",
      symbolType: "Motor",
      referenceDesignator: "M1",
      label: "LRA Haptic",
      x: 550,
      y: 180,
      rotation: 0,
      notes: "Haptic actuator",
      pins: [
        { pinNum: "1", label: "PWM_DRIVE", direction: "Input" },
        { pinNum: "2", label: "GND", direction: "Passive" }
      ]
    }
  ],
  schematicConnections: [
    {
      id: "conn_schem_1",
      sourceSymbolId: "sym_ring_mcu",
      sourcePin: "2",
      targetSymbolId: "sym_ring_motor",
      targetPin: "1",
      netId: "net_pwm",
      label: "PWM_DRIVE",
      connectionType: "Signal"
    }
  ],
  boardOutlines: [
    {
      id: "out_ring_main",
      boardId: "board_ring_main",
      points: [
        { x: 50, y: 50 },
        { x: 750, y: 50 },
        { x: 750, y: 550 },
        { x: 50, y: 550 }
      ]
    }
  ],
  copperShapes: [
    {
      id: "shape_ring_gnd",
      boardId: "board_ring_main",
      netId: "net_gnd",
      layerId: "Bottom",
      points: [
        { x: 60, y: 60 },
        { x: 740, y: 60 },
        { x: 740, y: 540 },
        { x: 60, y: 540 }
      ]
    }
  ],
  traces: [
    {
      id: "trace_ring_pwm",
      boardId: "board_ring_main",
      netId: "net_pwm",
      layerId: "Top",
      width: 0.2,
      points: [
        { x: 300, y: 180 },
        { x: 550, y: 180 }
      ]
    }
  ],
  vias: [
    {
      id: "via_ring_gnd",
      boardId: "board_ring_main",
      netId: "net_gnd",
      x: 350,
      y: 200,
      drillDiameter: 0.3,
      outerDiameter: 0.6
    }
  ],
  drillHoles: [
    {
      id: "drill_ring_align_1",
      boardId: "board_ring_main",
      x: 380,
      y: 200,
      diameter: 1.0,
      plated: false,
      purpose: "Mechanical Casing Alignment Pin A"
    },
    {
      id: "drill_ring_align_2",
      boardId: "board_ring_main",
      x: 420,
      y: 200,
      diameter: 1.0,
      plated: false,
      purpose: "Mechanical Casing Alignment Pin B"
    },
    {
      id: "drill_ring_via_hole_1",
      boardId: "board_ring_main",
      x: 350,
      y: 200,
      diameter: 0.3,
      plated: true,
      purpose: "GND Signal Via Connection Void"
    }
  ],
  pcbRules: [
    {
      id: "rule_ring_spacing",
      boardId: "board_ring_main",
      ruleType: "Clearance",
      value: "0.15",
      description: "Minimum spacing clearance allowed between parallel trace lanes."
    }
  ]
};
