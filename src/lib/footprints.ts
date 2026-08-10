export interface FootprintPad {
  name: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

export interface FootprintPreset {
  name: string;
  category: string;
  bodyWidthMm: number;
  bodyHeightMm: number;
  padWidthMm: number;
  padHeightMm: number;
  pads: FootprintPad[];
  courtyardWidthMm: number;
  courtyardHeightMm: number;
}

export const FOOTPRINT_LIBRARY: Record<string, FootprintPreset> = {
  R_0603: {
    name: "R_0603",
    category: "Resistor",
    bodyWidthMm: 1.6,
    bodyHeightMm: 0.8,
    padWidthMm: 0.85,
    padHeightMm: 0.95,
    pads: [
      { name: "1", xMm: -0.85, yMm: 0.0, widthMm: 0.85, heightMm: 0.95 },
      { name: "2", xMm: 0.85, yMm: 0.0, widthMm: 0.85, heightMm: 0.95 }
    ],
    courtyardWidthMm: 2.3,
    courtyardHeightMm: 1.4
  },
  R_0805: {
    name: "R_0805",
    category: "Resistor",
    bodyWidthMm: 2.0,
    bodyHeightMm: 1.25,
    padWidthMm: 1.0,
    padHeightMm: 1.4,
    pads: [
      { name: "1", xMm: -1.1, yMm: 0.0, widthMm: 1.0, heightMm: 1.4 },
      { name: "2", xMm: 1.1, yMm: 0.0, widthMm: 1.0, heightMm: 1.4 }
    ],
    courtyardWidthMm: 2.8,
    courtyardHeightMm: 1.8
  },
  C_0603: {
    name: "C_0603",
    category: "Capacitor",
    bodyWidthMm: 1.6,
    bodyHeightMm: 0.8,
    padWidthMm: 0.85,
    padHeightMm: 0.95,
    pads: [
      { name: "1", xMm: -0.85, yMm: 0.0, widthMm: 0.85, heightMm: 0.95 },
      { name: "2", xMm: 0.85, yMm: 0.0, widthMm: 0.85, heightMm: 0.95 }
    ],
    courtyardWidthMm: 2.3,
    courtyardHeightMm: 1.4
  },
  C_0805: {
    name: "C_0805",
    category: "Capacitor",
    bodyWidthMm: 2.0,
    bodyHeightMm: 1.25,
    padWidthMm: 1.0,
    padHeightMm: 1.4,
    pads: [
      { name: "1", xMm: -1.1, yMm: 0.0, widthMm: 1.0, heightMm: 1.4 },
      { name: "2", xMm: 1.1, yMm: 0.0, widthMm: 1.0, heightMm: 1.4 }
    ],
    courtyardWidthMm: 2.8,
    courtyardHeightMm: 1.8
  },
  SOT23: {
    name: "SOT23",
    category: "Transistor",
    bodyWidthMm: 2.92,
    bodyHeightMm: 1.3,
    padWidthMm: 0.6,
    padHeightMm: 0.8,
    pads: [
      { name: "1", xMm: -0.95, yMm: -1.0, widthMm: 0.6, heightMm: 0.8 },
      { name: "2", xMm: 0.95, yMm: -1.0, widthMm: 0.6, heightMm: 0.8 },
      { name: "3", xMm: 0.0, yMm: 1.0, widthMm: 0.6, heightMm: 0.8 }
    ],
    courtyardWidthMm: 3.6,
    courtyardHeightMm: 3.2
  },
  SOT23_5: {
    name: "SOT23_5",
    category: "IC",
    bodyWidthMm: 2.9,
    bodyHeightMm: 1.6,
    padWidthMm: 0.6,
    padHeightMm: 1.05,
    pads: [
      { name: "1", xMm: -0.95, yMm: -1.35, widthMm: 0.6, heightMm: 1.05 },
      { name: "2", xMm: 0.0, yMm: -1.35, widthMm: 0.6, heightMm: 1.05 },
      { name: "3", xMm: 0.95, yMm: -1.35, widthMm: 0.6, heightMm: 1.05 },
      { name: "4", xMm: 0.95, yMm: 1.35, widthMm: 0.6, heightMm: 1.05 },
      { name: "5", xMm: -0.95, yMm: 1.35, widthMm: 0.6, heightMm: 1.05 }
    ],
    courtyardWidthMm: 3.8,
    courtyardHeightMm: 3.6
  },
  SOIC_8: {
    name: "SOIC_8",
    category: "IC",
    bodyWidthMm: 4.9,
    bodyHeightMm: 3.9,
    padWidthMm: 0.6,
    padHeightMm: 1.55,
    pads: [
      { name: "1", xMm: -1.905, yMm: -2.7, widthMm: 0.6, heightMm: 1.55 },
      { name: "2", xMm: -0.635, yMm: -2.7, widthMm: 0.6, heightMm: 1.55 },
      { name: "3", xMm: 0.635, yMm: -2.7, widthMm: 0.6, heightMm: 1.55 },
      { name: "4", xMm: 1.905, yMm: -2.7, widthMm: 0.6, heightMm: 1.55 },
      { name: "5", xMm: 1.905, yMm: 2.7, widthMm: 0.6, heightMm: 1.55 },
      { name: "6", xMm: 0.635, yMm: 2.7, widthMm: 0.6, heightMm: 1.55 },
      { name: "7", xMm: -0.635, yMm: 2.7, widthMm: 0.6, heightMm: 1.55 },
      { name: "8", xMm: -1.905, yMm: 2.7, widthMm: 0.6, heightMm: 1.55 }
    ],
    courtyardWidthMm: 5.7,
    courtyardHeightMm: 6.2
  },
  TSSOP_16: {
    name: "TSSOP_16",
    category: "IC",
    bodyWidthMm: 5.0,
    bodyHeightMm: 4.4,
    padWidthMm: 0.3,
    padHeightMm: 1.45,
    pads: [
      { name: "1", xMm: -2.275, yMm: -2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "2", xMm: -1.625, yMm: -2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "3", xMm: -0.975, yMm: -2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "4", xMm: -0.325, yMm: -2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "5", xMm: 0.325, yMm: -2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "6", xMm: 0.975, yMm: -2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "7", xMm: 1.625, yMm: -2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "8", xMm: 2.275, yMm: -2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "9", xMm: 2.275, yMm: 2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "10", xMm: 1.625, yMm: 2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "11", xMm: 0.975, yMm: 2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "12", xMm: 0.325, yMm: 2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "13", xMm: -0.325, yMm: 2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "14", xMm: -0.975, yMm: 2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "15", xMm: -1.625, yMm: 2.8, widthMm: 0.3, heightMm: 1.45 },
      { name: "16", xMm: -2.275, yMm: 2.8, widthMm: 0.3, heightMm: 1.45 }
    ],
    courtyardWidthMm: 5.8,
    courtyardHeightMm: 7.2
  },
  QFN_24: {
    name: "QFN_24",
    category: "IC",
    bodyWidthMm: 4.0,
    bodyHeightMm: 4.0,
    padWidthMm: 0.25,
    padHeightMm: 0.7,
    pads: Array.from({ length: 24 }, (_, i) => {
      // 6 pins per side
      const angle = (Math.floor(i / 6) * Math.PI) / 2;
      const indexOnSide = (i % 6) - 2.5; // -2.5, -1.5, -0.5, 0.5, 1.5, 2.5
      const offset = indexOnSide * 0.5; // 0.5mm pitch
      const isHorizontal = Math.floor(i / 6) % 2 === 0;
      return {
        name: (i + 1).toString(),
        xMm: isHorizontal ? offset : (angle > Math.PI ? -1.9 : 1.9),
        yMm: isHorizontal ? (angle > 0.5 * Math.PI ? 1.9 : -1.9) : offset,
        widthMm: isHorizontal ? 0.25 : 0.7,
        heightMm: isHorizontal ? 0.7 : 0.25
      };
    }),
    courtyardWidthMm: 4.8,
    courtyardHeightMm: 4.8
  },
  QFN_32: {
    name: "QFN_32",
    category: "IC",
    bodyWidthMm: 5.0,
    bodyHeightMm: 5.0,
    padWidthMm: 0.25,
    padHeightMm: 0.75,
    pads: Array.from({ length: 32 }, (_, i) => {
      // 8 pins per side
      const angle = (Math.floor(i / 8) * Math.PI) / 2;
      const indexOnSide = (i % 8) - 3.5;
      const offset = indexOnSide * 0.5;
      const isHorizontal = Math.floor(i / 8) % 2 === 0;
      return {
        name: (i + 1).toString(),
        xMm: isHorizontal ? offset : (angle > Math.PI ? -2.4 : 2.4),
        yMm: isHorizontal ? (angle > 0.5 * Math.PI ? 2.4 : -2.4) : offset,
        widthMm: isHorizontal ? 0.25 : 0.75,
        heightMm: isHorizontal ? 0.75 : 0.25
      };
    }),
    courtyardWidthMm: 5.8,
    courtyardHeightMm: 5.8
  },
  USB_C_RECEPTACLE: {
    name: "USB_C_RECEPTACLE",
    category: "Connector",
    bodyWidthMm: 9.0,
    bodyHeightMm: 7.5,
    padWidthMm: 0.3,
    padHeightMm: 1.2,
    pads: [
      { name: "A1", xMm: -3.2, yMm: -3.0, widthMm: 0.3, heightMm: 1.2 },
      { name: "A4", xMm: -2.4, yMm: -3.0, widthMm: 0.3, heightMm: 1.2 },
      { name: "A5", xMm: -1.2, yMm: -3.0, widthMm: 0.3, heightMm: 1.2 },
      { name: "A6", xMm: -0.4, yMm: -3.0, widthMm: 0.3, heightMm: 1.2 },
      { name: "A7", xMm: 0.4, yMm: -3.0, widthMm: 0.3, heightMm: 1.2 },
      { name: "A8", xMm: 1.2, yMm: -3.0, widthMm: 0.3, heightMm: 1.2 },
      { name: "A9", xMm: 2.4, yMm: -3.0, widthMm: 0.3, heightMm: 1.2 },
      { name: "A12", xMm: 3.2, yMm: -3.0, widthMm: 0.3, heightMm: 1.2 },
      { name: "G1", xMm: -4.3, yMm: 0.0, widthMm: 1.0, heightMm: 1.5 },
      { name: "G2", xMm: 4.3, yMm: 0.0, widthMm: 1.0, heightMm: 1.5 }
    ],
    courtyardWidthMm: 10.2,
    courtyardHeightMm: 8.5
  },
  TEST_PAD: {
    name: "TEST_PAD",
    category: "Test Point",
    bodyWidthMm: 1.0,
    bodyHeightMm: 1.0,
    padWidthMm: 1.0,
    padHeightMm: 1.0,
    pads: [
      { name: "TP1", xMm: 0.0, yMm: 0.0, widthMm: 1.0, heightMm: 1.0 }
    ],
    courtyardWidthMm: 1.4,
    courtyardHeightMm: 1.4
  },
  POGO_PAD: {
    name: "POGO_PAD",
    category: "Test Point",
    bodyWidthMm: 1.5,
    bodyHeightMm: 1.5,
    padWidthMm: 1.5,
    padHeightMm: 1.5,
    pads: [
      { name: "P1", xMm: 0.0, yMm: 0.0, widthMm: 1.5, heightMm: 1.5 }
    ],
    courtyardWidthMm: 2.0,
    courtyardHeightMm: 2.0
  },
  LED_0603: {
    name: "LED_0603",
    category: "LED",
    bodyWidthMm: 1.6,
    bodyHeightMm: 0.8,
    padWidthMm: 0.8,
    padHeightMm: 0.8,
    pads: [
      { name: "A", xMm: -0.85, yMm: 0.0, widthMm: 0.8, heightMm: 0.8 },
      { name: "K", xMm: 0.85, yMm: 0.0, widthMm: 0.8, heightMm: 0.8 }
    ],
    courtyardWidthMm: 2.3,
    courtyardHeightMm: 1.4
  },
  ANTENNA_CHIP: {
    name: "ANTENNA_CHIP",
    category: "RF",
    bodyWidthMm: 3.2,
    bodyHeightMm: 1.6,
    padWidthMm: 1.0,
    padHeightMm: 1.8,
    pads: [
      { name: "FEED", xMm: -1.5, yMm: 0.0, widthMm: 1.0, heightMm: 1.8 },
      { name: "NC", xMm: 1.5, yMm: 0.0, widthMm: 1.0, heightMm: 1.8 }
    ],
    courtyardWidthMm: 4.2,
    courtyardHeightMm: 2.6
  },
  BATTERY_PAD: {
    name: "BATTERY_PAD",
    category: "Power",
    bodyWidthMm: 3.0,
    bodyHeightMm: 2.0,
    padWidthMm: 3.0,
    padHeightMm: 2.0,
    pads: [
      { name: "+", xMm: 0.0, yMm: 0.0, widthMm: 3.0, heightMm: 2.0 }
    ],
    courtyardWidthMm: 4.0,
    courtyardHeightMm: 3.0
  },
  MOTOR_PAD: {
    name: "MOTOR_PAD",
    category: "Haptic",
    bodyWidthMm: 2.5,
    bodyHeightMm: 2.0,
    padWidthMm: 2.5,
    padHeightMm: 2.0,
    pads: [
      { name: "M+", xMm: 0.0, yMm: 0.0, widthMm: 2.5, heightMm: 2.0 }
    ],
    courtyardWidthMm: 3.5,
    courtyardHeightMm: 3.0
  },
  CUSTOM_RECT: {
    name: "CUSTOM_RECT",
    category: "Custom",
    bodyWidthMm: 3.0,
    bodyHeightMm: 3.0,
    padWidthMm: 1.0,
    padHeightMm: 1.0,
    pads: [
      { name: "1", xMm: -1.0, yMm: 0.0, widthMm: 1.0, heightMm: 1.0 },
      { name: "2", xMm: 1.0, yMm: 0.0, widthMm: 1.0, heightMm: 1.0 }
    ],
    courtyardWidthMm: 4.0,
    courtyardHeightMm: 4.0
  },
  DIP28: {
    name: "DIP28",
    category: "IC",
    bodyWidthMm: 35.5,
    bodyHeightMm: 7.62,
    padWidthMm: 1.5,
    padHeightMm: 1.5,
    pads: [
      ...Array.from({ length: 14 }, (_, i) => ({ name: String(i + 1), xMm: -16.51 + i * 2.54, yMm: -3.81, widthMm: 1.5, heightMm: 1.5 })),
      ...Array.from({ length: 14 }, (_, i) => ({ name: String(28 - i), xMm: -16.51 + i * 2.54, yMm: 3.81, widthMm: 1.5, heightMm: 1.5 }))
    ],
    courtyardWidthMm: 38.0,
    courtyardHeightMm: 10.0
  },
  USB_B: {
    name: "USB_B",
    category: "Connector",
    bodyWidthMm: 12.0,
    bodyHeightMm: 16.0,
    padWidthMm: 1.8,
    padHeightMm: 2.5,
    pads: [
      { name: "1", xMm: 1.25, yMm: 4.7, widthMm: 1.8, heightMm: 2.5 },
      { name: "2", xMm: -1.25, yMm: 4.7, widthMm: 1.8, heightMm: 2.5 },
      { name: "3", xMm: -1.25, yMm: 2.7, widthMm: 1.8, heightMm: 2.5 },
      { name: "4", xMm: 1.25, yMm: 2.7, widthMm: 1.8, heightMm: 2.5 }
    ],
    courtyardWidthMm: 14.0,
    courtyardHeightMm: 18.0
  },
  USB_C: {
    name: "USB_C",
    category: "Connector",
    bodyWidthMm: 8.94,
    bodyHeightMm: 7.35,
    padWidthMm: 0.6,
    padHeightMm: 1.2,
    pads: [
      { name: "A1/B12_GND", xMm: -3.25, yMm: 2.5, widthMm: 0.6, heightMm: 1.2 },
      { name: "A4/B9_VBUS", xMm: -2.25, yMm: 2.5, widthMm: 0.6, heightMm: 1.2 },
      { name: "A5_CC1", xMm: -1.25, yMm: 2.5, widthMm: 0.6, heightMm: 1.2 },
      { name: "A6_DP1", xMm: -0.25, yMm: 2.5, widthMm: 0.6, heightMm: 1.2 },
      { name: "A7_DN1", xMm: 0.25, yMm: 2.5, widthMm: 0.6, heightMm: 1.2 },
      { name: "A8_SBU1", xMm: 1.25, yMm: 2.5, widthMm: 0.6, heightMm: 1.2 },
      { name: "B5_CC2", xMm: 2.25, yMm: 2.5, widthMm: 0.6, heightMm: 1.2 },
      { name: "B1/A12_GND", xMm: 3.25, yMm: 2.5, widthMm: 0.6, heightMm: 1.2 }
    ],
    courtyardWidthMm: 10.5,
    courtyardHeightMm: 9.0
  },
  HEADER_1X10: {
    name: "HEADER_1X10",
    category: "Connector",
    bodyWidthMm: 25.4,
    bodyHeightMm: 2.54,
    padWidthMm: 1.6,
    padHeightMm: 1.6,
    pads: Array.from({ length: 10 }, (_, i) => ({ name: String(i + 1), xMm: -11.43 + i * 2.54, yMm: 0, widthMm: 1.6, heightMm: 1.6 })),
    courtyardWidthMm: 27.0,
    courtyardHeightMm: 4.0
  },
  HEADER_1X8: {
    name: "HEADER_1X8",
    category: "Connector",
    bodyWidthMm: 20.32,
    bodyHeightMm: 2.54,
    padWidthMm: 1.6,
    padHeightMm: 1.6,
    pads: Array.from({ length: 8 }, (_, i) => ({ name: String(i + 1), xMm: -8.89 + i * 2.54, yMm: 0, widthMm: 1.6, heightMm: 1.6 })),
    courtyardWidthMm: 22.0,
    courtyardHeightMm: 4.0
  },
  HEADER_1X6: {
    name: "HEADER_1X6",
    category: "Connector",
    bodyWidthMm: 15.24,
    bodyHeightMm: 2.54,
    padWidthMm: 1.6,
    padHeightMm: 1.6,
    pads: Array.from({ length: 6 }, (_, i) => ({ name: String(i + 1), xMm: -6.35 + i * 2.54, yMm: 0, widthMm: 1.6, heightMm: 1.6 })),
    courtyardWidthMm: 17.0,
    courtyardHeightMm: 4.0
  },
  HC49S: {
    name: "HC49S",
    category: "Clock",
    bodyWidthMm: 11.5,
    bodyHeightMm: 5.0,
    padWidthMm: 2.0,
    padHeightMm: 2.0,
    pads: [
      { name: "1", xMm: -2.44, yMm: 0.0, widthMm: 2.0, heightMm: 2.0 },
      { name: "2", xMm: 2.44, yMm: 0.0, widthMm: 2.0, heightMm: 2.0 }
    ],
    courtyardWidthMm: 13.0,
    courtyardHeightMm: 6.5
  },
  SOT223: {
    name: "SOT223",
    category: "Regulator",
    bodyWidthMm: 6.5,
    bodyHeightMm: 3.5,
    padWidthMm: 1.2,
    padHeightMm: 1.8,
    pads: [
      { name: "1", xMm: -2.3, yMm: -3.0, widthMm: 1.2, heightMm: 1.8 },
      { name: "2", xMm: 0.0, yMm: -3.0, widthMm: 1.2, heightMm: 1.8 },
      { name: "3", xMm: 2.3, yMm: -3.0, widthMm: 1.2, heightMm: 1.8 },
      { name: "TAB", xMm: 0.0, yMm: 3.0, widthMm: 3.2, heightMm: 1.8 }
    ],
    courtyardWidthMm: 8.0,
    courtyardHeightMm: 8.0
  },
  OLED_096: {
    name: "OLED_096",
    category: "Display",
    bodyWidthMm: 27.0,
    bodyHeightMm: 27.0,
    padWidthMm: 1.6,
    padHeightMm: 1.6,
    pads: [
      { name: "1_GND", xMm: -3.81, yMm: -12.0, widthMm: 1.6, heightMm: 1.6 },
      { name: "2_VCC", xMm: -1.27, yMm: -12.0, widthMm: 1.6, heightMm: 1.6 },
      { name: "3_SCL", xMm: 1.27, yMm: -12.0, widthMm: 1.6, heightMm: 1.6 },
      { name: "4_SDA", xMm: 3.81, yMm: -12.0, widthMm: 1.6, heightMm: 1.6 }
    ],
    courtyardWidthMm: 29.0,
    courtyardHeightMm: 29.0
  },
  ESP32_WROOM: {
    name: "ESP32_WROOM",
    category: "MCU",
    bodyWidthMm: 18.0,
    bodyHeightMm: 25.5,
    padWidthMm: 1.5,
    padHeightMm: 0.9,
    pads: Array.from({ length: 38 }, (_, i) => ({
      name: String(i + 1),
      xMm: i < 19 ? -9.0 : 9.0,
      yMm: -11.0 + (i % 19) * 1.27,
      widthMm: 1.5,
      heightMm: 0.9
    })),
    courtyardWidthMm: 21.0,
    courtyardHeightMm: 27.5
  },
  RP2040_PICO: {
    name: "RP2040_PICO",
    category: "MCU",
    bodyWidthMm: 21.0,
    bodyHeightMm: 51.0,
    padWidthMm: 1.6,
    padHeightMm: 1.6,
    pads: Array.from({ length: 40 }, (_, i) => ({
      name: String(i + 1),
      xMm: i < 20 ? -8.89 : 8.89,
      yMm: -24.13 + (i % 20) * 2.54,
      widthMm: 1.6,
      heightMm: 1.6
    })),
    courtyardWidthMm: 23.0,
    courtyardHeightMm: 53.0
  }
};

export const getFootprint = (name: string): FootprintPreset => {
  return FOOTPRINT_LIBRARY[name] || FOOTPRINT_LIBRARY.CUSTOM_RECT;
};

export const validateFootprintLibrary = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  Object.entries(FOOTPRINT_LIBRARY).forEach(([key, fp]) => {
    if (!fp.pads || fp.pads.length === 0) {
      errors.push(`Footprint [${key}] has no pads configured.`);
    }
    fp.pads.forEach(pad => {
      if (isNaN(pad.xMm) || isNaN(pad.yMm) || isNaN(pad.widthMm) || isNaN(pad.heightMm)) {
        errors.push(`Footprint [${key}] pad [${pad.name}] has invalid coordinates.`);
      }
    });
    if (isNaN(fp.bodyWidthMm) || isNaN(fp.bodyHeightMm) || fp.bodyWidthMm <= 0 || fp.bodyHeightMm <= 0) {
      errors.push(`Footprint [${key}] has invalid body dimensions.`);
    }
  });
  return {
    valid: errors.length === 0,
    errors
  };
};
