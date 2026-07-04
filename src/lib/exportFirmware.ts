import { Project } from '../types';

export const generateFirmwareSkeleton = (project: Project): string => {
  const pinMap = project.pinMap || [];
  const firmwareTasks = project.firmwareTasks || [];

  // Format Pin configurations
  const pinDefinitions = pinMap.map(pin => {
    const pinName = pin.signalName.replace(/\s+/g, '_').toUpperCase();
    const pinVal = pin.mcuPin || "/* TODO: CONFIGURE MCU PIN */";
    return `#define ${pinName} ${pinVal} // Connected to: ${pin.connectedBlock} (${pin.protocol}, Dir: ${pin.direction})`;
  }).join('\n');

  // Format State Machine enum
  const states = firmwareTasks.filter(t => t.type === 'State').map(t => {
    return `  STATE_${t.name.replace(/\s+/g, '_').toUpperCase()}`;
  });
  // Add fallback standard states if empty
  if (states.length === 0) {
    states.push("  STATE_BOOT", "  STATE_IDLE", "  STATE_ACTIVE", "  STATE_SLEEP");
  }

  // Format tasks checklist as comments
  const taskComments = firmwareTasks.map(t => {
    return ` * - [${t.status === 'Done' ? 'x' : ' '}] ${t.name} (Priority: ${t.priority}, Type: ${t.type})\n *   Goal: ${t.description}\n *   Acceptance: ${t.acceptanceCriteria}`;
  }).join('\n *\n');

  return `/**
 * ====================================================================
 *  HARDWARE STUDIO FIRMWARE SKELETON
 *  Project: ${project.projectName}
 *  Version: ${project.version}
 *  Generated: ${new Date().toLocaleDateString()}
 * ====================================================================
 * 
 *  NOTE: This is an automatically generated hardware driver skeleton.
 *  You must configure your target MCU pins and verify crystal timing.
 * 
 *  Firmware Implementation Tasks Checklist:
 * 
${taskComments || " * - No firmware tasks defined."}
 */

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

// ==========================================
//  HARDWARE PIN MAPPINGS
// ==========================================
${pinDefinitions || "// No MCU pins mapped yet. Go to Pin Map to add pins."}

// ==========================================
//  SYSTEM STATE MACHINE DEFINITIONS
// ==========================================
enum SystemState {
${states.join(',\n')}
};

SystemState currentState = STATE_BOOT;
unsigned long lastStateChangeTime = 0;
bool isConnected = false;

// ==========================================
//  BLE CONFIGURATIONS
// ==========================================
#define SERVICE_UUID           "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID_TX "beb54811-36e1-4688-b7f5-ea07361b26a8"
#define CHARACTERISTIC_UUID_RX "a5b54811-36e1-4688-b7f5-ea07361b26a8"

BLECharacteristic *pTxCharacteristic = NULL;
BLECharacteristic *pRxCharacteristic = NULL;

class ServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      isConnected = true;
      Serial.println("[BLE] Device connected to host.");
    }

    void onDisconnect(BLEServer* pServer) {
      isConnected = false;
      Serial.println("[BLE] Device disconnected. Restarting advertising...");
      pServer->getAdvertising()->start();
    }
};

class WriteCallback: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string rxValue = pCharacteristic->getValue();
      if (rxValue.length() > 0) {
        Serial.print("[BLE] Received bytes: ");
        for (int i = 0; i < rxValue.length(); i++) {
          Serial.print(rxValue[i], HEX);
          Serial.print(" ");
        }
        Serial.println();
        
        // Handle incoming action triggers (e.g. haptic trigger codes)
        // Code 0x01: Success pattern, Code 0x02: Error pulse
      }
    }
};

// ==========================================
//  SETUP & HARDWARE CONTEXTS
// ==========================================
void setup() {
  Serial.begin(115200);
  Serial.println("[Init] Initializing ${project.projectName} Boot sequence...");

  // Configure mapped GPIO pin directions
  #ifdef BUTTON_INPUT_SIG
  pinMode(BUTTON_INPUT_SIG, INPUT_PULLUP);
  Serial.println("[Init] Configured BUTTON_INPUT_SIG GPIO as Input with pullup.");
  #endif

  #ifdef HAPTIC_PWM
  pinMode(HAPTIC_PWM, OUTPUT);
  digitalWrite(HAPTIC_PWM, LOW);
  Serial.println("[Init] Configured HAPTIC_PWM GPIO as Output.");
  #endif

  #ifdef LED_GPIO
  pinMode(LED_GPIO, OUTPUT);
  digitalWrite(LED_GPIO, LOW);
  Serial.println("[Init] Configured LED_GPIO GPIO as Output.");
  #endif

  // Initialize Bluetooth Low Energy
  BLEDevice::init("${project.projectName}");
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Read/Notify TX Characteristic
  pTxCharacteristic = pService->createCharacteristic(
                        CHARACTERISTIC_UUID_TX,
                        BLECharacteristic::PROPERTY_NOTIFY
                      );
  
  // Write/Receive RX Characteristic
  pRxCharacteristic = pService->createCharacteristic(
                        CHARACTERISTIC_UUID_RX,
                        BLECharacteristic::PROPERTY_WRITE
                      );
  pRxCharacteristic->setCallbacks(new WriteCallback());

  pService->start();
  pServer->getAdvertising()->start();
  Serial.println("[Init] BLE service advertising initialized.");
  
  currentState = STATE_IDLE;
  lastStateChangeTime = millis();
}

// ==========================================
//  MAIN SYSTEM LOOP & RECOVERY
// ==========================================
void loop() {
  // Feed the hardware Watchdog timer
  // esp_task_wdt_reset();

  switch(currentState) {
    case STATE_IDLE:
      // Quiescent polling or sleep state entry
      #ifdef BUTTON_INPUT_SIG
      if (digitalRead(BUTTON_INPUT_SIG) == LOW) {
        // Debounce trigger
        delay(20);
        if (digitalRead(BUTTON_INPUT_SIG) == LOW) {
          Serial.println("[Input] Button interrupt triggered.");
          currentState = STATE_ACTIVE_COMMAND_STATE;
          lastStateChangeTime = millis();
        }
      }
      #endif
      break;

    case STATE_ACTIVE_COMMAND_STATE:
      // Process click notifications, broadcast BLE packets
      if (isConnected) {
        uint8_t payload[2] = {0x01, 0x55}; // Example packet structure
        pTxCharacteristic->setValue(payload, 2);
        pTxCharacteristic->notify();
        Serial.println("[BLE] Command payload notified.");
      }
      
      // Return to Idle state
      currentState = STATE_IDLE;
      lastStateChangeTime = millis();
      break;

    default:
      currentState = STATE_IDLE;
      break;
  }
}
`;
};

export const exportFirmwareSkeletonFile = (project: Project) => {
  if (typeof window === 'undefined') return;
  const content = generateFirmwareSkeleton(project);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `${project.projectName.toLowerCase().replace(/\s+/g, '_')}_firmware_skeleton.ino`;
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
